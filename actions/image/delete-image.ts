"use server";

import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";

interface DeleteImageResult {
  success: boolean;
  error?: string;
}

/**
 * Delete an ad image
 */
export async function deleteImage(adImageId: string): Promise<DeleteImageResult> {
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

    // Delete the image
    const { error: deleteError } = await supabase
      .from("ad_images")
      .delete()
      .eq("id", adImageId);

    if (deleteError) {
      console.error("Delete image error:", deleteError);
      return {
        success: false,
        error: "이미지 삭제에 실패했습니다.",
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Delete image error:", error);
    return {
      success: false,
      error: "이미지 삭제 중 오류가 발생했습니다.",
    };
  }
}
