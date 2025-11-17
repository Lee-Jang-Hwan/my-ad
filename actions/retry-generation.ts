"use server";

import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { revalidateVideo, revalidateUserVideos } from "@/lib/cache";
import { triggerN8nWorkflow } from "./trigger-n8n";

interface RetryGenerationResult {
  success: boolean;
  error?: string;
  newAdVideoId?: string;
  executionId?: string | null;
}

/**
 * Retry failed video generation
 * Resets status and progress, then triggers n8n workflow again
 */
export async function retryGeneration(
  adVideoId: string
): Promise<RetryGenerationResult> {
  try {
    // Check authentication
    const authResult = await auth();
    const clerkId = authResult.userId;

    if (!clerkId) {
      return {
        success: false,
        error: "로그인이 필요합니다.",
      };
    }

    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(adVideoId)) {
      return {
        success: false,
        error: "잘못된 영상 ID입니다.",
      };
    }

    // Create Supabase client
    const supabase = createClerkSupabaseClient();

    // Fetch existing ad_video to verify ownership and get product_info_id
    const { data: existingVideo, error: fetchError } = await supabase
      .from("ad_videos")
      .select("user_id, product_image_id, product_info_id, status")
      .eq("id", adVideoId)
      .single();

    if (fetchError || !existingVideo) {
      console.error("Failed to fetch video:", fetchError);
      return {
        success: false,
        error: "영상 정보를 찾을 수 없습니다.",
      };
    }

    // Verify ownership (user_id is clerk_id)
    if (existingVideo.user_id !== clerkId) {
      return {
        success: false,
        error: "접근 권한이 없습니다.",
      };
    }

    // Only allow retry for failed videos
    if (existingVideo.status !== "failed") {
      return {
        success: false,
        error: "실패한 영상만 다시 시도할 수 있습니다.",
      };
    }

    // Verify product_info_id exists
    if (!existingVideo.product_info_id) {
      return {
        success: false,
        error: "상품 정보를 찾을 수 없습니다.",
      };
    }

    // Reset the ad_video record to initial state
    const { error: updateError } = await supabase
      .from("ad_videos")
      .update({
        status: "pending",
        progress_stage: "init",
        error_message: null,
        completed_at: null,
      })
      .eq("id", adVideoId);

    if (updateError) {
      console.error("Failed to reset video:", updateError);
      return {
        success: false,
        error: "영상 상태를 초기화하는데 실패했습니다.",
      };
    }

    // Trigger n8n workflow with the same product_image_id and product_info_id
    const triggerResult = await triggerN8nWorkflow(
      existingVideo.product_image_id,
      existingVideo.product_info_id
    );

    if (!triggerResult.success) {
      // Revert status back to failed if trigger fails
      await supabase
        .from("ad_videos")
        .update({
          status: "failed",
          error_message: triggerResult.error || "워크플로우 실행에 실패했습니다.",
        })
        .eq("id", adVideoId);

      // Revalidate caches since status changed
      revalidateVideo(adVideoId);
      revalidateUserVideos(clerkId);

      return {
        success: false,
        error: triggerResult.error,
      };
    }

    // Revalidate caches since retry was successful
    revalidateVideo(adVideoId);
    revalidateUserVideos(clerkId);

    return {
      success: true,
      newAdVideoId: triggerResult.adVideoId,
      executionId: triggerResult.executionId,
    };
  } catch (error) {
    console.error("Retry generation error:", error);
    return {
      success: false,
      error: "다시 시도하는 중 오류가 발생했습니다.",
    };
  }
}
