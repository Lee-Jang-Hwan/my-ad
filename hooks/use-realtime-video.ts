"use client";

import { useEffect, useState, useRef } from "react";
import { useClerkSupabaseClient } from "@/lib/supabase/clerk-client";
import type { AdVideo } from "@/types/database";
import type { RealtimeVideoState, GenerationStage } from "@/types/generation";
import { calculateProgress } from "@/lib/generation-utils";

interface UseRealtimeVideoOptions {
  initialVideo: AdVideo;
  onComplete?: (video: AdVideo) => void;
  onError?: (video: AdVideo) => void;
}

// Timeout duration: 10 minutes (n8n workflow with Veo can take longer)
const GENERATION_TIMEOUT_MS = 10 * 60 * 1000;

// Polling interval: Check database every 15 seconds as backup
// Increased from 3s to reduce database load - Realtime handles most updates
const POLLING_INTERVAL_MS = 15000;

// Maximum time to wait before falling back to polling (if no realtime events)
const REALTIME_FALLBACK_MS = 10000;

// Realtime reconnection settings
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY_MS = 2000; // Start with 2 seconds
const MAX_RECONNECT_DELAY_MS = 30000; // Max 30 seconds

// Heartbeat interval to check if realtime is still responsive
const HEARTBEAT_INTERVAL_MS = 15000; // Check every 15 seconds

/**
 * Hook to subscribe to real-time updates for ad_video record
 * Uses Supabase Realtime to listen for database changes
 * Includes timeout detection for stuck workflows
 */
export function useRealtimeVideo({
  initialVideo,
  onComplete,
  onError,
}: UseRealtimeVideoOptions): RealtimeVideoState {
  const supabase = useClerkSupabaseClient();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<Date>(new Date());
  const lastRealtimeEventRef = useRef<Date>(new Date());
  const isUsingPollingRef = useRef<boolean>(false);
  const reconnectAttemptsRef = useRef<number>(0);
  const channelRef = useRef<any>(null);
  const isCleanedUpRef = useRef<boolean>(false);

  const [state, setState] = useState<RealtimeVideoState>({
    video: initialVideo,
    isLoading: false,
    error: null,
    isCompleted: initialVideo.status === "completed",
    isFailed:
      initialVideo.status === "failed" ||
      initialVideo.status === "cancelled",
    currentStage: initialVideo.progress_stage as GenerationStage,
    progressPercent: calculateProgress(
      initialVideo.progress_stage as GenerationStage
    ),
  });

  useEffect(() => {
    console.log("🔔 [Realtime] Subscribing to ad_video:", initialVideo.id);
    isCleanedUpRef.current = false;

    // Realtime reconnection function with exponential backoff
    const reconnectRealtime = () => {
      if (isCleanedUpRef.current) {
        console.log("🔌 [Realtime] Component unmounted, skipping reconnect");
        return;
      }

      if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
        console.error("❌ [Realtime] Max reconnection attempts reached, relying on polling only");
        isUsingPollingRef.current = true;
        return;
      }

      const delay = Math.min(
        RECONNECT_DELAY_MS * Math.pow(2, reconnectAttemptsRef.current),
        MAX_RECONNECT_DELAY_MS
      );

      console.log(
        `🔄 [Realtime] Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current + 1}/${MAX_RECONNECT_ATTEMPTS})`
      );

      setTimeout(() => {
        if (isCleanedUpRef.current) return;

        reconnectAttemptsRef.current++;
        console.log("🔄 [Realtime] Attempting to reconnect...");

        // Unsubscribe old channel if exists
        if (channelRef.current) {
          supabase.removeChannel(channelRef.current);
        }

        // Create new channel
        setupRealtimeChannel();
      }, delay);
    };

    // Heartbeat function to check if realtime is still responsive
    const checkHeartbeat = () => {
      if (isCleanedUpRef.current) return;

      // Use setState to access latest state
      setState((prev) => {
        const now = new Date();
        const timeSinceLastRealtimeEvent = now.getTime() - lastRealtimeEventRef.current.getTime();

        // If no events for too long and video is still processing
        if (
          timeSinceLastRealtimeEvent > HEARTBEAT_INTERVAL_MS &&
          !prev.isCompleted &&
          !prev.isFailed
        ) {
          console.warn(
            `⚠️ [Heartbeat] No realtime events for ${timeSinceLastRealtimeEvent}ms, checking connection`
          );

          // Check if channel is still connected
          if (channelRef.current) {
            const channelState = channelRef.current.state;
            console.log("🔌 [Heartbeat] Channel state:", channelState);

            if (channelState === "closed" || channelState === "errored") {
              console.warn("⚠️ [Heartbeat] Channel is disconnected, switching to polling mode");
              isUsingPollingRef.current = true;
              reconnectRealtime();
            }
          } else {
            console.warn("⚠️ [Heartbeat] No channel exists, relying on polling");
            isUsingPollingRef.current = true;
          }
        }

        // Return unchanged state
        return prev;
      });
    };

    // Polling function: fetch latest video data from database
    const pollVideoData = async () => {
      try {
        const { data, error } = await supabase
          .from("ad_videos")
          .select("*")
          .eq("id", initialVideo.id)
          .single();

        if (error) {
          console.error("❌ [Polling] Error fetching video data:", error);
          return;
        }

        if (!data) {
          console.warn("⚠️ [Polling] No video data found");
          return;
        }

        const updatedVideo = data as AdVideo;

        // Use setState with updater to get latest state for comparison
        setState((prev) => {
          const hasChanged =
            updatedVideo.status !== prev.video.status ||
            updatedVideo.progress_stage !== prev.video.progress_stage;

          if (!hasChanged) {
            // No changes, return same state
            return prev;
          }

          console.log("🔄 [Polling] Video data changed:", {
            status: updatedVideo.status,
            progress_stage: updatedVideo.progress_stage,
            previousStatus: prev.video.status,
            previousStage: prev.video.progress_stage,
          });

          // Update last update timestamp
          lastUpdateRef.current = new Date();

          const newStage = updatedVideo.progress_stage as GenerationStage;
          const isCompleted = updatedVideo.status === "completed";
          const isFailed =
            updatedVideo.status === "failed" ||
            updatedVideo.status === "cancelled";
          const isCancelled = updatedVideo.status === "cancelled";

          console.log("🔄 [Polling] State update:", {
            previousStatus: prev.video.status,
            newStatus: updatedVideo.status,
            previousStage: prev.currentStage,
            newStage,
            isCompleted,
            isFailed,
            isCancelled,
            hasVideoUrl: !!updatedVideo.video_url,
            videoUrl: updatedVideo.video_url,
          });

          // Trigger callbacks if status changed
          if (!prev.isCompleted && isCompleted && onComplete) {
            console.log("✅ [Polling] Triggering onComplete callback");
            onComplete(updatedVideo);
          }

          if (!prev.isFailed && isFailed && onError) {
            console.log("❌ [Polling] Triggering onError callback");
            onError(updatedVideo);
          }

          return {
            video: updatedVideo,
            isLoading: false,
            error: isFailed
              ? (isCancelled
                  ? "사용자가 취소했습니다."
                  : updatedVideo.error_message || "영상 생성 중 오류가 발생했습니다.")
              : null,
            isCompleted,
            isFailed,
            currentStage: newStage,
            progressPercent: calculateProgress(newStage),
          };
        });
      } catch (err) {
        console.error("❌ [Polling] Unexpected error:", err);
      }
    };

    // Setup timeout detector for stuck workflows
    const checkTimeout = () => {
      const now = new Date();
      const timeSinceLastUpdate = now.getTime() - lastUpdateRef.current.getTime();
      const timeSinceLastRealtimeEvent = now.getTime() - lastRealtimeEventRef.current.getTime();

      // Fallback to polling if no realtime events received
      if (timeSinceLastRealtimeEvent > REALTIME_FALLBACK_MS && !isUsingPollingRef.current) {
        console.warn("⚠️ [Realtime] No realtime events received, falling back to polling");
        isUsingPollingRef.current = true;
      }

      // Use setState with updater function to access latest state
      setState((prev) => {
        // Check if timeout occurred and video is still processing
        if (
          timeSinceLastUpdate > GENERATION_TIMEOUT_MS &&
          !prev.isCompleted &&
          !prev.isFailed
        ) {
          console.error("⏱️ [Timeout] Generation timeout detected!");
          console.error("⏱️ [Timeout] Last update:", lastUpdateRef.current);
          console.error("⏱️ [Timeout] Time since last update:", timeSinceLastUpdate, "ms");

          // Trigger onError callback
          if (onError) {
            onError({
              ...prev.video,
              status: "failed",
              error_message: "Timeout: 영상 생성 시간 초과",
            });
          }

          return {
            ...prev,
            isFailed: true,
            error: "영상 생성 시간이 초과되었습니다. n8n 워크플로우를 확인해주세요.",
          };
        }

        // No timeout, return unchanged state
        return prev;
      });
    };

    // Setup Realtime channel with error handling
    const setupRealtimeChannel = () => {
      if (isCleanedUpRef.current) return;

      console.log("🔌 [Realtime] Setting up channel for ad_video:", initialVideo.id);

      const channel = supabase
        .channel(`ad_video:${initialVideo.id}`, {
          config: {
            broadcast: { self: false },
            presence: { key: "" },
            private: false,
          },
        })
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "ad_videos",
            filter: `id=eq.${initialVideo.id}`,
          },
          (payload) => {
            if (isCleanedUpRef.current) return;

            console.log("📨 [Realtime] UPDATE received:", payload);

            // Check for token expiration error
            if (payload.errors && payload.errors.length > 0) {
              console.error("❌ [Realtime] Error in payload:", payload.errors);

              // Check if it's a JWT token error
              const errorMessage = payload.errors[0]?.toString() || "";
              if (errorMessage.includes("InvalidJWTToken") ||
                  errorMessage.includes("Token has expired")) {
                console.warn("🔑 [Realtime] JWT token expired, reconnecting...");
                reconnectRealtime();
                return;
              }
            }

            const updatedVideo = payload.new as AdVideo;
            console.log("📊 [Realtime] Updated video data:", {
              status: updatedVideo.status,
              progress_stage: updatedVideo.progress_stage,
              error_message: updatedVideo.error_message,
            });

            // Reset reconnection attempts on successful event
            reconnectAttemptsRef.current = 0;

            // Update last update timestamp and realtime event timestamp
            lastUpdateRef.current = new Date();
            lastRealtimeEventRef.current = new Date();

            // Mark that realtime is working
            if (isUsingPollingRef.current) {
              console.log("✅ [Realtime] Realtime recovered, disabling polling fallback");
              isUsingPollingRef.current = false;
            }

            setState((prev) => {
              const newStage = updatedVideo.progress_stage as GenerationStage;
              const isCompleted = updatedVideo.status === "completed";
              const isFailed =
                updatedVideo.status === "failed" ||
                updatedVideo.status === "cancelled";
              const isCancelled = updatedVideo.status === "cancelled";

              console.log("🔄 [Realtime] State update:", {
                previousStatus: prev.video.status,
                newStatus: updatedVideo.status,
                previousStage: prev.currentStage,
                newStage,
                isCompleted,
                isFailed,
                hasVideoUrl: !!updatedVideo.video_url,
                videoUrl: updatedVideo.video_url,
              });

              // Trigger callbacks if status changed
              if (!prev.isCompleted && isCompleted && onComplete) {
                console.log("✅ [Realtime] Triggering onComplete callback");
                onComplete(updatedVideo);
              }

              if (!prev.isFailed && isFailed && onError) {
                console.log("❌ [Realtime] Triggering onError callback");
                onError(updatedVideo);
              }

              return {
                video: updatedVideo,
                isLoading: false,
                error: isFailed
                  ? (isCancelled
                      ? "사용자가 취소했습니다."
                      : updatedVideo.error_message || "영상 생성 중 오류가 발생했습니다.")
                  : null,
                isCompleted,
                isFailed,
                currentStage: newStage,
                progressPercent: calculateProgress(newStage),
              };
            });
          }
        )
        .subscribe(async (status, err) => {
          if (isCleanedUpRef.current) return;

          console.log("🔌 [Realtime] Subscription status:", status, err);

          if (status === "SUBSCRIBED") {
            console.log("✅ [Realtime] Successfully subscribed");
            reconnectAttemptsRef.current = 0; // Reset on successful subscription
            lastRealtimeEventRef.current = new Date();
          } else if (status === "CHANNEL_ERROR") {
            console.error("❌ [Realtime] Channel error:", err);

            // Check if error is JWT-related
            const errorMessage = err?.message || err?.toString?.() || String(err || "");
            const isJWTError = errorMessage.includes("InvalidJWTToken") ||
                errorMessage.includes("Token has expired") ||
                errorMessage.includes("JWT") ||
                errorMessage.includes("jwt");

            if (isJWTError) {
              console.warn("🔑 [Realtime] JWT token error detected in subscription, reconnecting immediately");
              reconnectRealtime();
            } else if (err === undefined || errorMessage === "undefined") {
              // Handle undefined error (likely connection closed)
              console.warn("⚠️ [Realtime] Undefined error - connection likely closed, switching to polling");
              isUsingPollingRef.current = true;
              // Try reconnecting after a delay
              setTimeout(() => {
                if (!isCleanedUpRef.current) {
                  reconnectRealtime();
                }
              }, 5000);
            } else {
              // Wait 2 seconds before reconnecting on other errors
              setTimeout(() => {
                if (!isCleanedUpRef.current) {
                  reconnectRealtime();
                }
              }, 2000);
            }
          } else if (status === "TIMED_OUT") {
            console.error("⏱️ [Realtime] Subscription timed out");
            reconnectRealtime();
          } else if (status === "CLOSED") {
            console.warn("🔌 [Realtime] Channel closed");
            // Don't immediately reconnect on CLOSED - let polling handle it
            // Only reconnect if we've been successfully subscribed before
            if (!isCleanedUpRef.current && reconnectAttemptsRef.current > 0) {
              console.log("🔌 [Realtime] Channel closed unexpectedly, will use polling fallback");
              isUsingPollingRef.current = true;
            }
          }
        });

      channelRef.current = channel;
    };

    // Start polling immediately and set interval
    console.log(`🔄 [Polling] Starting polling every ${POLLING_INTERVAL_MS}ms`);
    pollVideoData();
    pollingRef.current = setInterval(pollVideoData, POLLING_INTERVAL_MS);

    // Check for timeout every 30 seconds
    timeoutRef.current = setInterval(checkTimeout, 30000);

    // Start heartbeat check every 15 seconds
    heartbeatRef.current = setInterval(checkHeartbeat, HEARTBEAT_INTERVAL_MS);

    // Setup initial Realtime channel
    setupRealtimeChannel();

    // Cleanup subscription, polling, heartbeat, and timeout on unmount
    return () => {
      console.log("🔌 [Realtime] Cleaning up subscriptions for ad_video:", initialVideo.id);
      isCleanedUpRef.current = true;

      if (timeoutRef.current) {
        clearInterval(timeoutRef.current);
      }
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
      }
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [initialVideo.id, supabase, onComplete, onError]);

  return state;
}
