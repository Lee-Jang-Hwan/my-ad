"use server";

import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";

/**
 * Debug action to inspect video data in database
 * 데이터베이스의 영상 데이터를 확인하는 디버깅 액션
 */
export async function debugVideoData(videoId: string) {
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

    // Fetch video data
    const { data: video, error } = await supabase
      .from("ad_videos")
      .select("*")
      .eq("id", videoId)
      .single();

    if (error || !video) {
      return {
        success: false,
        error: "영상을 찾을 수 없습니다.",
        debugInfo: { error },
      };
    }

    // Check if URLs are expressions or actual URLs
    const isVideoUrlExpression = video.video_url?.includes("{{") || false;
    const isThumbnailUrlExpression = video.thumbnail_url?.includes("{{") || false;

    console.log("=".repeat(80));
    console.log("🔍 VIDEO DEBUG INFO");
    console.log("=".repeat(80));
    console.log("Video ID:", videoId);
    console.log("User ID:", video.user_id);
    console.log("Status:", video.status);
    console.log("-".repeat(80));
    console.log("video_url:", video.video_url);
    console.log("  ❌ Is Expression?", isVideoUrlExpression);
    console.log("  ✅ Is Valid URL?", !isVideoUrlExpression);
    console.log("-".repeat(80));
    console.log("thumbnail_url:", video.thumbnail_url);
    console.log("  ❌ Is Expression?", isThumbnailUrlExpression);
    console.log("  ✅ Is Valid URL?", !isThumbnailUrlExpression);
    console.log("-".repeat(80));
    console.log("duration:", video.duration);
    console.log("file_size:", video.file_size);
    console.log("created_at:", video.created_at);
    console.log("completed_at:", video.completed_at);
    console.log("=".repeat(80));

    return {
      success: true,
      data: {
        id: video.id,
        userId: video.user_id,
        status: video.status,
        videoUrl: video.video_url,
        thumbnailUrl: video.thumbnail_url,
        duration: video.duration,
        fileSize: video.file_size,
        createdAt: video.created_at,
        completedAt: video.completed_at,
        // Analysis
        isVideoUrlExpression,
        isThumbnailUrlExpression,
        needsFix: isVideoUrlExpression || isThumbnailUrlExpression,
      },
    };
  } catch (error) {
    console.error("Debug video data error:", error);
    return {
      success: false,
      error: "디버깅 중 오류가 발생했습니다.",
      debugInfo: { error },
    };
  }
}