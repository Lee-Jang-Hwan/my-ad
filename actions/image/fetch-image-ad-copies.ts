"use server";

import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import type { FetchImageAdCopiesResult } from "@/types/ad-image";

/**
 * 이미지용 광고문구 조회
 * - ad_image_id로 5개 광고문구 조회
 */
export async function fetchImageAdCopies(
  adImageId: string
): Promise<FetchImageAdCopiesResult> {
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
    const { data: image, error: imageError } = await supabase
      .from("ad_images")
      .select("id, user_id")
      .eq("id", adImageId)
      .single();

    if (imageError || !image) {
      return {
        success: false,
        error: "이미지 정보를 찾을 수 없습니다.",
      };
    }

    if (image.user_id !== clerkId) {
      return {
        success: false,
        error: "접근 권한이 없습니다.",
      };
    }

    // Fetch ad_image_copies
    const { data: adCopies, error: copiesError } = await supabase
      .from("ad_image_copies")
      .select("*")
      .eq("ad_image_id", adImageId)
      .order("copy_index", { ascending: true });

    if (copiesError) {
      console.error("ad_image_copies fetch error:", copiesError);
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
    console.error("Fetch image ad copies error:", error);
    return {
      success: false,
      error: "광고문구 조회 중 오류가 발생했습니다.",
    };
  }
}
