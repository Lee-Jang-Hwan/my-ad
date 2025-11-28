"use server";

import { auth } from "@clerk/nextjs/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export async function toggleVideoPublic(videoId: string, isPublic: boolean) {
  try {
    // Check authentication
    const authResult = await auth();
    if (!authResult.userId) {
      return { success: false, error: "인증되지 않은 사용자입니다." };
    }

    const supabase = createServiceRoleClient();

    // First, verify video ownership
    const { data: video, error: fetchError } = await supabase
      .from("ad_videos")
      .select("id, user_id")
      .eq("id", videoId)
      .single();

    if (fetchError || !video) {
      console.error("Error fetching video:", fetchError);
      return { success: false, error: "영상을 찾을 수 없습니다." };
    }

    // Check ownership
    if (video.user_id !== authResult.userId) {
      return { success: false, error: "이 영상을 수정할 권한이 없습니다." };
    }

    // Update the video
    const { data, error } = await supabase
      .from("ad_videos")
      .update({ is_public: isPublic })
      .eq("id", videoId)
      .select()
      .single();

    if (error) {
      console.error("Error toggling video public status:", error);
      return { success: false, error: "영상 공개 상태 변경에 실패했습니다." };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, error: "예상치 못한 오류가 발생했습니다." };
  }
}
