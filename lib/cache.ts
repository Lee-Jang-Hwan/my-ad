/**
 * Cache management utilities for Next.js 15
 * Provides functions for revalidating cached data on-demand
 */

import { revalidateTag, revalidatePath } from "next/cache";

/**
 * Revalidate cache for a specific video
 * Call this when a video is created or updated
 */
export function revalidateVideo(videoId: string) {
  revalidateTag(`video-${videoId}`);
}

/**
 * Revalidate cache for all videos of a specific user
 * Call this when a new video is created or deleted
 */
export function revalidateUserVideos(userId: string) {
  revalidateTag(`user-videos-${userId}`);
}

/**
 * Revalidate dashboard page for a specific user
 * Call this when user's video list needs to be refreshed
 */
export function revalidateDashboard() {
  revalidatePath("/dashboard");
}

/**
 * Revalidate video detail page
 * Call this when a specific video page needs to be refreshed
 */
export function revalidateVideoPage(videoId: string) {
  revalidatePath(`/video/${videoId}`);
}

/**
 * Revalidate all caches for a user
 * Use when major changes affect multiple areas
 */
export function revalidateUserData(userId: string) {
  revalidateTag(`user-videos-${userId}`);
  revalidatePath("/dashboard");
}
