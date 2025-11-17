"use server";

import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import type { AdVideo } from "@/types/database";

interface FetchVideoResult {
  success: boolean;
  video?: AdVideo;
  error?: string;
}

/**
 * Fetch ad_video record for generation progress page
 * Verifies user authentication and ownership
 */
export async function fetchVideo(adVideoId: string): Promise<FetchVideoResult> {
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

    // Fetch ad_video record
    const { data: videoData, error: videoError } = await supabase
      .from("ad_videos")
      .select(
        `
        id,
        user_id,
        product_image_id,
        product_info_id,
        video_url,
        thumbnail_url,
        duration,
        file_size,
        status,
        progress_stage,
        error_message,
        created_at,
        completed_at
      `
      )
      .eq("id", adVideoId)
      .single();

    if (videoError) {
      console.error("Video fetch error:", videoError);
      return {
        success: false,
        error: "영상 정보를 찾을 수 없습니다.",
      };
    }

    if (!videoData) {
      return {
        success: false,
        error: "영상 정보를 찾을 수 없습니다.",
      };
    }

    // Verify ownership (user_id in ad_videos is the clerk_id)
    if (videoData.user_id !== clerkId) {
      return {
        success: false,
        error: "접근 권한이 없습니다.",
      };
    }

    return {
      success: true,
      video: videoData as AdVideo,
    };
  } catch (error) {
    console.error("Fetch video error:", error);
    return {
      success: false,
      error: "영상 정보를 불러오는 중 오류가 발생했습니다.",
    };
  }
}
