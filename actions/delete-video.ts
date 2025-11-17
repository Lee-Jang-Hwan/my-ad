"use server";

import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { revalidateVideo, revalidateUserVideos } from "@/lib/cache";

export interface DeleteVideoResult {
  success: boolean;
  error?: string;
}

/**
 * Delete a video and its associated data
 * Verifies ownership before deletion
 */
export async function deleteVideo(
  videoId: string
): Promise<DeleteVideoResult> {
  try {
    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(videoId)) {
      return {
        success: false,
        error: "잘못된 영상 ID 형식입니다.",
      };
    }

    // Check authentication
    const authResult = await auth();
    const clerkId = authResult.userId;

    if (!clerkId) {
      return {
        success: false,
        error: "로그인이 필요합니다.",
      };
    }

    // Create Supabase client
    const supabase = createClerkSupabaseClient();

    // Fetch video to verify ownership
    const { data: video, error: fetchError } = await supabase
      .from("ad_videos")
      .select("*")
      .eq("id", videoId)
      .single();

    if (fetchError || !video) {
      console.error("Delete video fetch error:", fetchError);
      return {
        success: false,
        error: "영상 정보를 찾을 수 없습니다.",
      };
    }

    // Verify ownership
    if (video.user_id !== clerkId) {
      return {
        success: false,
        error: "영상을 삭제할 권한이 없습니다.",
      };
    }

    console.log("🗑️ [Delete] Deleting video:", {
      id: video.id,
      status: video.status,
    });

    // Delete the video record
    const { error: deleteError } = await supabase
      .from("ad_videos")
      .delete()
      .eq("id", videoId);

    if (deleteError) {
      console.error("❌ [Delete] Delete error:", deleteError);
      return {
        success: false,
        error: "영상 삭제 중 오류가 발생했습니다.",
      };
    }

    console.log("✅ [Delete] Video deleted successfully");

    // Revalidate caches since video was deleted
    revalidateVideo(videoId);
    revalidateUserVideos(clerkId);

    return {
      success: true,
    };
  } catch (error) {
    console.error("Delete video error:", error);
    return {
      success: false,
      error: "영상 삭제 중 오류가 발생했습니다.",
    };
  }
}