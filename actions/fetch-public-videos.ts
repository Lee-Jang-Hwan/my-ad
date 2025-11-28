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
    // Join with product_info to get product_name
    const { data, error } = await supabase
      .from("ad_videos")
      .select(`
        id,
        video_url,
        created_at,
        product_info (
          product_name
        )
      `)
      .eq("is_featured", true)
      .eq("status", "completed")
      .not("video_url", "is", null)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching public videos:", error);
      return { success: false, error: "공개 영상 조회에 실패했습니다.", videos: [] };
    }

    // Transform data to flatten product_name
    const videos: PublicVideo[] = (data || []).map((item: any) => ({
      id: item.id,
      video_url: item.video_url,
      created_at: item.created_at,
      product_name: item.product_info?.product_name || undefined,
    }));

    return { success: true, videos };
  } catch (error) {
    console.error("Unexpected error fetching public videos:", error);
    return { success: false, error: "예상치 못한 오류가 발생했습니다.", videos: [] };
  }
}
