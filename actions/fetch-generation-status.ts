"use server";

import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import type { AdVideo } from "@/types/database";

export interface FetchGenerationStatusResult {
  success: boolean;
  video?: AdVideo & { product_name: string | null };
  error?: string;
}

/**
 * Fetch generation status for a specific video
 * Includes ownership verification and product info JOIN
 */
export async function fetchGenerationStatus(
  videoId: string
): Promise<FetchGenerationStatusResult> {
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

    // Create Supabase client
    const supabase = createClerkSupabaseClient();

    // Fetch video with product info
    const { data, error } = await supabase
      .from("ad_videos")
      .select(
        `
        *,
        product_info!inner (
          product_name
        )
      `
      )
      .eq("id", videoId)
      .single();

    if (error) {
      console.error("Fetch generation status error:", error);
      return {
        success: false,
        error: "영상 정보를 찾을 수 없습니다.",
      };
    }

    if (!data) {
      return {
        success: false,
        error: "영상 정보를 찾을 수 없습니다.",
      };
    }

    // Verify ownership
    if (data.user_id !== clerkId) {
      return {
        success: false,
        error: "영상에 접근할 권한이 없습니다.",
      };
    }

    // Transform data
    const video: AdVideo & { product_name: string | null } = {
      id: data.id,
      user_id: data.user_id,
      product_image_id: data.product_image_id,
      product_info_id: data.product_info_id,
      video_url: data.video_url,
      thumbnail_url: data.thumbnail_url,
      duration: data.duration,
      file_size: data.file_size,
      status: data.status,
      progress_stage: data.progress_stage,
      error_message: data.error_message,
      created_at: data.created_at,
      completed_at: data.completed_at,
      is_public: data.is_public,
      product_name: data.product_info?.product_name || null,
    };

    return {
      success: true,
      video,
    };
  } catch (error) {
    console.error("Fetch generation status error:", error);
    return {
      success: false,
      error: "영상 정보를 불러오는 중 오류가 발생했습니다.",
    };
  }
}
