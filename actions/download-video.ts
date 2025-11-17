"use server";

import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { generateDownloadFilename } from "@/lib/format-utils";
import type { DownloadVideoResult } from "@/types/video-detail";

const STORAGE_BUCKET = process.env.NEXT_PUBLIC_STORAGE_BUCKET_VIDEOS || "videos";

/**
 * Generate signed URL for video download
 * Verifies ownership and returns temporary download URL with 1-hour expiration
 */
export async function downloadVideo(
  videoId: string
): Promise<DownloadVideoResult> {
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

    // Create Supabase client
    const supabase = createClerkSupabaseClient();

    console.log("📥 Downloading video:", videoId, "for user:", clerkId);

    // Fetch video to verify ownership and get video path
    const { data: video, error: fetchError } = await supabase
      .from("ad_videos")
      .select("*")
      .eq("id", videoId)
      .single();

    if (fetchError || !video) {
      console.error("❌ Fetch video for download error:", fetchError);
      return {
        success: false,
        error: "영상을 찾을 수 없습니다.",
      };
    }

    console.log("✅ Found video for download");

    // Fetch product name separately (optional)
    let productName = "영상";
    if (video.product_info_id) {
      const { data: productData } = await supabase
        .from("product_info")
        .select("product_name")
        .eq("id", video.product_info_id)
        .single();

      productName = productData?.product_name || "영상";
    }

    // Verify ownership
    if (video.user_id !== clerkId) {
      return {
        success: false,
        error: "영상에 접근할 권한이 없습니다.",
      };
    }

    // Check if video is completed
    if (video.status !== "completed" || !video.video_url) {
      return {
        success: false,
        error: "영상이 아직 생성되지 않았습니다.",
      };
    }

    // Extract storage path from video_url
    // Assuming video_url format: https://{project}.supabase.co/storage/v1/object/public/videos/{path}
    const url = new URL(video.video_url);
    const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/videos\/(.+)/);

    if (!pathMatch) {
      return {
        success: false,
        error: "영상 경로를 찾을 수 없습니다.",
      };
    }

    const videoPath = pathMatch[1];

    // Create signed URL for download (1 hour expiration)
    const { data: signedData, error: signedError } = await supabase
      .storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(videoPath, 3600, {
        download: true, // Force download instead of opening in browser
      });

    if (signedError || !signedData) {
      console.error("Create signed URL error:", signedError);
      return {
        success: false,
        error: "다운로드 링크를 생성하는 중 오류가 발생했습니다.",
      };
    }

    // Generate user-friendly filename
    const filename = generateDownloadFilename(productName, video.created_at);

    return {
      success: true,
      downloadUrl: signedData.signedUrl,
      filename,
    };
  } catch (error) {
    console.error("Download video error:", error);
    return {
      success: false,
      error: "다운로드 링크를 생성하는 중 오류가 발생했습니다.",
    };
  }
}
