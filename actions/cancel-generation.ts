"use server";

import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { revalidateVideo, revalidateUserVideos } from "@/lib/cache";

export interface CancelGenerationResult {
  success: boolean;
  error?: string;
}

/**
 * Cancel an ongoing video generation
 * Only allows cancelling videos in "pending" or "processing" status
 */
export async function cancelGeneration(
  videoId: string
): Promise<CancelGenerationResult> {
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

    // Fetch video to verify ownership and status
    const { data: video, error: fetchError } = await supabase
      .from("ad_videos")
      .select("*")
      .eq("id", videoId)
      .single();

    if (fetchError || !video) {
      console.error("Cancel generation fetch error:", fetchError);
      return {
        success: false,
        error: "영상 정보를 찾을 수 없습니다.",
      };
    }

    // Verify ownership
    if (video.user_id !== clerkId) {
      return {
        success: false,
        error: "영상에 접근할 권한이 없습니다.",
      };
    }

    console.log("📊 [Cancel] Current video status:", {
      id: video.id,
      status: video.status,
      progress_stage: video.progress_stage,
    });

    // Check if video can be cancelled
    if (video.status === "completed") {
      console.log("❌ [Cancel] Cannot cancel: already completed");
      return {
        success: false,
        error: "이미 완료된 영상은 취소할 수 없습니다.",
      };
    }

    if (video.status === "failed") {
      console.log("❌ [Cancel] Cannot cancel: already failed");
      return {
        success: false,
        error: "이미 실패한 영상은 취소할 수 없습니다.",
      };
    }

    if (video.status === "cancelled") {
      console.log("❌ [Cancel] Cannot cancel: already cancelled");
      return {
        success: false,
        error: "이미 취소된 영상입니다.",
      };
    }

    console.log("✅ [Cancel] Cancelling video generation...");

    // Update video status to cancelled
    const { error: updateError } = await supabase
      .from("ad_videos")
      .update({
        status: "cancelled",
        progress_stage: "cancelled",
        error_message: "사용자가 취소했습니다.",
      })
      .eq("id", videoId);

    if (updateError) {
      console.error("❌ [Cancel] Update error:", updateError);
      return {
        success: false,
        error: "영상 취소 중 오류가 발생했습니다.",
      };
    }

    console.log("✅ [Cancel] Video cancelled successfully");

    // Revalidate caches since video status changed
    revalidateVideo(videoId);
    revalidateUserVideos(clerkId);

    return {
      success: true,
    };
  } catch (error) {
    console.error("Cancel generation error:", error);
    return {
      success: false,
      error: "영상 취소 중 오류가 발생했습니다.",
    };
  }
}
