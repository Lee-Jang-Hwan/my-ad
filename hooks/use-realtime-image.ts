"use client";

import { useEffect, useState, useRef } from "react";
import { useClerkSupabaseClient } from "@/lib/supabase/clerk-client";
import type { AdImage, RealtimeImageState, ImageGenerationStage } from "@/types/ad-image";
import { calculateImageProgress } from "@/constants/image-generation";

interface UseRealtimeImageOptions {
  initialImage: AdImage;
  onComplete?: (image: AdImage) => void;
  onError?: (image: AdImage) => void;
}

// Timeout duration: 5 minutes (image generation is faster than video)
const GENERATION_TIMEOUT_MS = 5 * 60 * 1000;

// Polling interval: Check database every 3 seconds as backup
const POLLING_INTERVAL_MS = 3000;

// Maximum time to wait before falling back to polling (if no realtime events)
const REALTIME_FALLBACK_MS = 10000;

/**
 * Hook to subscribe to real-time updates for ad_image record
 * Uses Supabase Realtime to listen for database changes
 * Includes timeout detection for stuck workflows
 */
export function useRealtimeImage({
  initialImage,
  onComplete,
  onError,
}: UseRealtimeImageOptions): RealtimeImageState {
  const supabase = useClerkSupabaseClient();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<Date>(new Date());
  const lastRealtimeEventRef = useRef<Date>(new Date());
  const isUsingPollingRef = useRef<boolean>(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const isCleanedUpRef = useRef<boolean>(false);

  const [state, setState] = useState<RealtimeImageState>({
    image: initialImage,
    isLoading: false,
    error: null,
    isCompleted: initialImage.status === "completed",
    isFailed:
      initialImage.status === "failed" ||
      initialImage.status === "cancelled",
    currentStage: initialImage.progress_stage as ImageGenerationStage,
    progressPercent: calculateImageProgress(
      initialImage.progress_stage as ImageGenerationStage
    ),
  });

  useEffect(() => {
    console.log("🔔 [Realtime Image] Subscribing to ad_image:", initialImage.id);
    isCleanedUpRef.current = false;

    // Polling function: fetch latest image data from database
    const pollImageData = async () => {
      try {
        const { data, error } = await supabase
          .from("ad_images")
          .select("*")
          .eq("id", initialImage.id)
          .single();

        if (error) {
          console.error("❌ [Polling] Error fetching image data:", error);
          return;
        }

        if (!data) {
          console.warn("⚠️ [Polling] No image data found");
          return;
        }

        const updatedImage = data as AdImage;

        // Use setState with updater to get latest state for comparison
        setState((prev) => {
          const hasChanged =
            updatedImage.status !== prev.image?.status ||
            updatedImage.progress_stage !== prev.image?.progress_stage;

          if (!hasChanged) {
            // No changes, return same state
            return prev;
          }

          console.log("🔄 [Polling] Image data changed:", {
            status: updatedImage.status,
            progress_stage: updatedImage.progress_stage,
            previousStatus: prev.image?.status,
            previousStage: prev.image?.progress_stage,
          });

          // Update last update timestamp
          lastUpdateRef.current = new Date();

          const newStage = updatedImage.progress_stage as ImageGenerationStage;
          const isCompleted = updatedImage.status === "completed";
          const isFailed =
            updatedImage.status === "failed" ||
            updatedImage.status === "cancelled";
          const isCancelled = updatedImage.status === "cancelled";

          // Trigger callbacks if status changed
          if (!prev.isCompleted && isCompleted && onComplete) {
            console.log("✅ [Polling] Triggering onComplete callback");
            onComplete(updatedImage);
          }

          if (!prev.isFailed && isFailed && onError) {
            console.log("❌ [Polling] Triggering onError callback");
            onError(updatedImage);
          }

          return {
            image: updatedImage,
            isLoading: false,
            error: isFailed
              ? (isCancelled
                  ? "사용자가 취소했습니다."
                  : updatedImage.error_message || "이미지 생성 중 오류가 발생했습니다.")
              : null,
            isCompleted,
            isFailed,
            currentStage: newStage,
            progressPercent: calculateImageProgress(newStage),
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
        // Check if timeout occurred and image is still processing
        if (
          timeSinceLastUpdate > GENERATION_TIMEOUT_MS &&
          !prev.isCompleted &&
          !prev.isFailed
        ) {
          console.error("⏱️ [Timeout] Generation timeout detected!");

          // Trigger onError callback
          if (onError && prev.image) {
            onError({
              ...prev.image,
              status: "failed",
              error_message: "Timeout: 이미지 생성 시간 초과",
            });
          }

          return {
            ...prev,
            isFailed: true,
            error: "이미지 생성 시간이 초과되었습니다. n8n 워크플로우를 확인해주세요.",
          };
        }

        // No timeout, return unchanged state
        return prev;
      });
    };

    // Setup Realtime channel
    const setupRealtimeChannel = () => {
      if (isCleanedUpRef.current) return;

      console.log("🔌 [Realtime] Setting up channel for ad_image:", initialImage.id);

      const channel = supabase
        .channel(`ad_image:${initialImage.id}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "ad_images",
            filter: `id=eq.${initialImage.id}`,
          },
          (payload) => {
            if (isCleanedUpRef.current) return;

            console.log("📨 [Realtime] UPDATE received:", payload);

            const updatedImage = payload.new as AdImage;

            // Update last update timestamp and realtime event timestamp
            lastUpdateRef.current = new Date();
            lastRealtimeEventRef.current = new Date();

            // Mark that realtime is working
            if (isUsingPollingRef.current) {
              console.log("✅ [Realtime] Realtime recovered, disabling polling fallback");
              isUsingPollingRef.current = false;
            }

            setState((prev) => {
              const newStage = updatedImage.progress_stage as ImageGenerationStage;
              const isCompleted = updatedImage.status === "completed";
              const isFailed =
                updatedImage.status === "failed" ||
                updatedImage.status === "cancelled";
              const isCancelled = updatedImage.status === "cancelled";

              console.log("🔄 [Realtime] State update:", {
                previousStatus: prev.image?.status,
                newStatus: updatedImage.status,
                previousStage: prev.currentStage,
                newStage,
                isCompleted,
                isFailed,
                hasImageUrl: !!updatedImage.image_url,
              });

              // Trigger callbacks if status changed
              if (!prev.isCompleted && isCompleted && onComplete) {
                console.log("✅ [Realtime] Triggering onComplete callback");
                onComplete(updatedImage);
              }

              if (!prev.isFailed && isFailed && onError) {
                console.log("❌ [Realtime] Triggering onError callback");
                onError(updatedImage);
              }

              return {
                image: updatedImage,
                isLoading: false,
                error: isFailed
                  ? (isCancelled
                      ? "사용자가 취소했습니다."
                      : updatedImage.error_message || "이미지 생성 중 오류가 발생했습니다.")
                  : null,
                isCompleted,
                isFailed,
                currentStage: newStage,
                progressPercent: calculateImageProgress(newStage),
              };
            });
          }
        )
        .subscribe((status, err) => {
          if (isCleanedUpRef.current) return;

          console.log("🔌 [Realtime] Subscription status:", status, err);

          if (status === "SUBSCRIBED") {
            console.log("✅ [Realtime] Successfully subscribed");
            lastRealtimeEventRef.current = new Date();
          } else if (status === "CHANNEL_ERROR") {
            console.error("❌ [Realtime] Channel error:", err);
            isUsingPollingRef.current = true;
          }
        });

      channelRef.current = channel;
    };

    // Start polling immediately and set interval
    console.log(`🔄 [Polling] Starting polling every ${POLLING_INTERVAL_MS}ms`);
    pollImageData();
    pollingRef.current = setInterval(pollImageData, POLLING_INTERVAL_MS);

    // Check for timeout every 30 seconds
    timeoutRef.current = setInterval(checkTimeout, 30000);

    // Setup initial Realtime channel
    setupRealtimeChannel();

    // Cleanup subscription, polling, and timeout on unmount
    return () => {
      console.log("🔌 [Realtime] Cleaning up subscriptions for ad_image:", initialImage.id);
      isCleanedUpRef.current = true;

      if (timeoutRef.current) {
        clearInterval(timeoutRef.current);
      }
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [initialImage.id, supabase, onComplete, onError]);

  return state;
}
