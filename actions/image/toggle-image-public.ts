"use server";

import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";

interface ToggleImagePublicResult {
  success: boolean;
  isPublic?: boolean;
  error?: string;
}

/**
 * Toggle public/featured status of an ad image
 */
export async function toggleImagePublic(
  adImageId: string,
  isPublic: boolean
): Promise<ToggleImagePublicResult> {
  try {
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
    const { data: image, error: fetchError } = await supabase
      .from("ad_images")
      .select("id, user_id")
      .eq("id", adImageId)
      .single();

    if (fetchError || !image) {
      return {
        success: false,
        error: "이미지를 찾을 수 없습니다.",
      };
    }

    if (image.user_id !== clerkId) {
      return {
        success: false,
        error: "접근 권한이 없습니다.",
      };
    }

    // Update is_public status
    const { error: updateError } = await supabase
      .from("ad_images")
      .update({ is_public: isPublic })
      .eq("id", adImageId);

    if (updateError) {
      console.error("Toggle image public error:", updateError);
      return {
        success: false,
        error: "공개 상태 변경에 실패했습니다.",
      };
    }

    return {
      success: true,
      isPublic,
    };
  } catch (error) {
    console.error("Toggle image public error:", error);
    return {
      success: false,
      error: "공개 상태 변경 중 오류가 발생했습니다.",
    };
  }
}
