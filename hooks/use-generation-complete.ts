"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { AdVideo } from "@/types/database";
import { COMPLETION_REDIRECT_DELAY } from "@/constants/generation";

interface UseGenerationCompleteOptions {
  video: AdVideo | null;
  isCompleted: boolean;
  enabled?: boolean;
}

/**
 * Hook to handle completion detection and auto-redirect
 * Redirects to /video/[id] after video generation is complete
 */
export function useGenerationComplete({
  video,
  isCompleted,
  enabled = true,
}: UseGenerationCompleteOptions): void {
  const router = useRouter();
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    console.log("🎬 [GenerationComplete] Effect triggered:", {
      enabled,
      hasRedirected: hasRedirectedRef.current,
      isCompleted,
      videoId: video?.id,
      videoUrl: video?.video_url,
      status: video?.status,
    });

    // Only run if enabled and not already redirected
    if (!enabled) {
      console.log("⚠️ [GenerationComplete] Disabled, skipping");
      return;
    }

    if (hasRedirectedRef.current) {
      console.log("⚠️ [GenerationComplete] Already redirected, skipping");
      return;
    }

    // Check if video is completed
    // IMPORTANT: We check isCompleted OR (status === "completed" AND video object exists)
    // This handles cases where isCompleted flag might not be set correctly
    const shouldRedirect =
      (isCompleted && video) ||
      (video?.status === "completed");

    if (shouldRedirect && video) {
      // Log the completion state
      console.log("✅ [GenerationComplete] Video completed!");
      console.log("📊 [GenerationComplete] Video data:", {
        id: video.id,
        status: video.status,
        video_url: video.video_url,
        progress_stage: video.progress_stage,
        isCompleted,
      });

      // Check if video_url is missing
      if (!video.video_url) {
        console.warn("⚠️ [GenerationComplete] Video URL is missing! Still redirecting...");
        console.warn("⚠️ [GenerationComplete] This might indicate n8n workflow didn't update video_url");
      }

      hasRedirectedRef.current = true;

      // Show completion notification (could use toast here)
      console.log(`🚀 [GenerationComplete] Redirecting to /video/${video.id} in ${COMPLETION_REDIRECT_DELAY}ms...`);

      // Redirect after delay
      const timeoutId = setTimeout(() => {
        console.log(`🔄 [GenerationComplete] Executing redirect to /video/${video.id}`);
        router.push(`/video/${video.id}`);
      }, COMPLETION_REDIRECT_DELAY);

      // Cleanup timeout on unmount
      return () => {
        console.log("🧹 [GenerationComplete] Cleaning up timeout");
        clearTimeout(timeoutId);
      };
    } else {
      console.log("⏳ [GenerationComplete] Waiting for completion...", {
        isCompleted,
        videoStatus: video?.status,
        hasVideoUrl: !!video?.video_url,
        shouldRedirect,
      });
    }
  }, [isCompleted, video, router, enabled]);
}
