"use server";

import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";

export async function toggleVideoPublic(videoId: string, isPublic: boolean) {
  try {
    // Check authentication
    const authResult = await auth();
    if (!authResult.userId) {
      return { success: false, error: "인증되지 않은 사용자입니다." };
    }

    const supabase = createClerkSupabaseClient();

    // Verify video ownership and update
    const { data, error } = await supabase
      .from("ad_videos")
      .update({ is_public: isPublic })
      .eq("id", videoId)
      .eq("user_id", authResult.userId)
      .select()
      .single();

    if (error) {
      console.error("Error toggling video public status:", error);
      return { success: false, error: "영상 공개 상태 변경에 실패했습니다." };
    }

    if (!data) {
      return { success: false, error: "영상을 찾을 수 없거나 권한이 없습니다." };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, error: "예상치 못한 오류가 발생했습니다." };
  }
}
