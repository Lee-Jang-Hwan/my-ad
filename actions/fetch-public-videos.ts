"use server";

import { supabase } from "@/lib/supabase/client";

export interface PublicVideo {
  id: string;
  video_url: string;
  created_at: string;
  product_name?: string;
}

export async function fetchPublicVideos(limit: number = 6) {
  try {

    const { data, error } = await supabase
      .from("ad_videos")
      .select("id, video_url, created_at, product_name")
      .eq("is_public", true)
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching public videos:", error);
      return { success: false, error: "공개 영상 조회에 실패했습니다.", videos: [] };
    }

    return { success: true, videos: data || [] };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, error: "예상치 못한 오류가 발생했습니다.", videos: [] };
  }
}
