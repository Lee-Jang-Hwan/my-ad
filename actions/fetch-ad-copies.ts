"use server";

import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import type { FetchAdCopiesResult } from "@/types/ad-copy";

/**
 * 광고문구 조회
 * - ad_video_id로 5개 광고문구 조회
 */
export async function fetchAdCopies(
  adVideoId: string
): Promise<FetchAdCopiesResult> {
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

    const supabase = createClerkSupabaseClient();

    // Verify ownership
    const { data: video, error: videoError } = await supabase
      .from("ad_videos")
      .select("id, user_id")
      .eq("id", adVideoId)
      .single();

    if (videoError || !video) {
      return {
        success: false,
        error: "영상 정보를 찾을 수 없습니다.",
      };
    }

    if (video.user_id !== clerkId) {
      return {
        success: false,
        error: "접근 권한이 없습니다.",
      };
    }

    // Fetch ad_copies
    const { data: adCopies, error: copiesError } = await supabase
      .from("ad_copies")
      .select("*")
      .eq("ad_video_id", adVideoId)
      .order("copy_index", { ascending: true });

    if (copiesError) {
      console.error("ad_copies fetch error:", copiesError);
      return {
        success: false,
        error: "광고문구 조회에 실패했습니다.",
      };
    }

    return {
      success: true,
      adCopies: adCopies || [],
    };
  } catch (error) {
    console.error("Fetch ad copies error:", error);
    return {
      success: false,
      error: "광고문구 조회 중 오류가 발생했습니다.",
    };
  }
}
