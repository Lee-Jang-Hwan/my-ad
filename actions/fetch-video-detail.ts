"use server";

import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import type {
  FetchVideoDetailResult,
  VideoDetailData,
} from "@/types/video-detail";

/**
 * Fetch single video detail with product information
 * Verifies ownership and fetches product info separately
 */
export async function fetchVideoDetail(
  videoId: string
): Promise<FetchVideoDetailResult> {
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

    console.log("🔍 Fetching video detail:", videoId, "for user:", clerkId);

    // Create Supabase client with Clerk auth
    const supabase = createClerkSupabaseClient();

    // Fetch video first (without JOIN to avoid errors)
    const { data: videoData, error: videoError } = await supabase
      .from("ad_videos")
      .select("*")
      .eq("id", videoId)
      .single();

    if (videoError || !videoData) {
      console.error("❌ Fetch video detail error:", {
        error: videoError,
        message: videoError?.message,
        details: videoError?.details,
        hint: videoError?.hint,
        code: videoError?.code,
      });
      return {
        success: false,
        error: "영상을 찾을 수 없습니다.",
      };
    }

    console.log("✅ Found video:", videoData.id);

    // Verify ownership
    if (videoData.user_id !== clerkId) {
      console.error("❌ Ownership verification failed:", {
        video_user_id: videoData.user_id,
        clerk_id: clerkId,
      });
      return {
        success: false,
        error: "접근할 권한이 없습니다.",
      };
    }

    // Fetch product info separately (optional - may not exist)
    let productName: string | null = null;
    if (videoData.product_info_id) {
      try {
        const { data: productData, error: productError } = await supabase
          .from("product_info")
          .select("product_name")
          .eq("id", videoData.product_info_id)
          .single();

        if (productError) {
          console.error("⚠️ Error fetching product info:", {
            product_info_id: videoData.product_info_id,
            error: productError,
          });
        }

        productName = productData?.product_name || null;
      } catch (productFetchError) {
        console.error("❌ Exception fetching product info:", productFetchError);
        // Continue with null product name
      }
    }

    // Transform data
    const video: VideoDetailData = {
      id: videoData.id,
      user_id: videoData.user_id,
      product_image_id: videoData.product_image_id,
      product_info_id: videoData.product_info_id,
      video_url: videoData.video_url,
      thumbnail_url: videoData.thumbnail_url,
      duration: videoData.duration,
      file_size: videoData.file_size,
      status: videoData.status,
      progress_stage: videoData.progress_stage,
      error_message: videoData.error_message,
      created_at: videoData.created_at,
      completed_at: videoData.completed_at,
      is_public: videoData.is_public,
      product_name: productName,
    };

    console.log("✅ Video detail fetched successfully");

    return {
      success: true,
      video,
    };
  } catch (error) {
    console.error("❌ Fetch video detail outer error:", error);
    return {
      success: false,
      error: "영상을 불러오는 중 오류가 발생했습니다.",
    };
  }
}