"use server";

import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import type { AdImage } from "@/types/ad-image";

interface FetchImageResult {
  success: boolean;
  image?: AdImage;
  error?: string;
}

/**
 * 이미지 조회
 * - ad_image_id로 이미지 정보 조회
 * - 소유자 확인
 */
export async function fetchImage(adImageId: string): Promise<FetchImageResult> {
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

    // Fetch image with owner verification
    const { data: image, error: imageError } = await supabase
      .from("ad_images")
      .select("*")
      .eq("id", adImageId)
      .single();

    if (imageError || !image) {
      console.error("Image fetch error:", imageError);
      return {
        success: false,
        error: "이미지 정보를 찾을 수 없습니다.",
      };
    }

    // Verify ownership
    if (image.user_id !== clerkId) {
      return {
        success: false,
        error: "접근 권한이 없습니다.",
      };
    }

    return {
      success: true,
      image: image as AdImage,
    };
  } catch (error) {
    console.error("Fetch image error:", error);
    return {
      success: false,
      error: "이미지 조회 중 오류가 발생했습니다.",
    };
  }
}
