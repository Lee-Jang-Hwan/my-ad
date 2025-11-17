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

// Timeout duration: 5 minutes (n8n workflow should complete within this time)
const GENERATION_TIMEOUT_MS = 5 * 60 * 1000;

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
  const lastUpdateRef = useRef<Date>(new Date());

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

    // Setup timeout detector for stuck workflows
    const checkTimeout = () => {
      const now = new Date();
      const timeSinceLastUpdate = now.getTime() - lastUpdateRef.current.getTime();

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

    // Check for timeout every 30 seconds
    timeoutRef.current = setInterval(checkTimeout, 30000);

    // Create Realtime channel for this specific ad_video
    const channel = supabase
      .channel(`ad_video:${initialVideo.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "ad_videos",
          filter: `id=eq.${initialVideo.id}`,
        },
        (payload) => {
          console.log("📨 [Realtime] UPDATE received:", payload);
          const updatedVideo = payload.new as AdVideo;
          console.log("📊 [Realtime] Updated video data:", {
            status: updatedVideo.status,
            progress_stage: updatedVideo.progress_stage,
            error_message: updatedVideo.error_message,
          });

          // Update last update timestamp
          lastUpdateRef.current = new Date();

          setState((prev) => {
            const newStage = updatedVideo.progress_stage as GenerationStage;
            const isCompleted = updatedVideo.status === "completed";
            const isFailed =
              updatedVideo.status === "failed" ||
              updatedVideo.status === "cancelled";
            const isCancelled = updatedVideo.status === "cancelled";

            // Trigger callbacks if status changed
            if (!prev.isCompleted && isCompleted && onComplete) {
              onComplete(updatedVideo);
            }

            if (!prev.isFailed && isFailed && onError) {
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
      .subscribe((status) => {
        console.log("🔌 [Realtime] Subscription status:", status);
      });

    // Cleanup subscription and timeout on unmount
    return () => {
      console.log("🔌 [Realtime] Unsubscribing from ad_video:", initialVideo.id);
      if (timeoutRef.current) {
        clearInterval(timeoutRef.current);
      }
      supabase.removeChannel(channel);
    };
  }, [initialVideo.id, supabase, onComplete, onError]);

  return state;
}
