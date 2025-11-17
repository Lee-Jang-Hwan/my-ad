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
    // Only run if enabled and not already redirected
    if (!enabled || hasRedirectedRef.current) {
      return;
    }

    // Check if video is completed and has a video URL
    if (isCompleted && video?.video_url) {
      hasRedirectedRef.current = true;

      // Show completion notification (could use toast here)
      console.log("Video generation completed, redirecting...");

      // Redirect after delay
      const timeoutId = setTimeout(() => {
        router.push(`/video/${video.id}`);
      }, COMPLETION_REDIRECT_DELAY);

      // Cleanup timeout on unmount
      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [isCompleted, video, router, enabled]);
}
