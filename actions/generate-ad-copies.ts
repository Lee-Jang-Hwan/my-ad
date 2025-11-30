"use server";

import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { revalidateUserVideos } from "@/lib/cache";
import type { GenerateAdCopiesResult } from "@/types/ad-copy";

const N8N_ADCOPY_WEBHOOK_URL =
  process.env.N8N_ADCOPY_WEBHOOK_URL ||
  "https://n8n.sappstudio.kr/webhook/84e18e95-00b9-4963-9a6f-c14225a84d15";

/**
 * 광고문구 5개 생성 (sapp-studio-adcopy webhook 호출)
 * - ad_videos 레코드 생성 (status: pending, progress_stage: init)
 * - adcopy webhook 호출하여 광고문구 5개 생성
 * - ad_copies 테이블에 5개 저장
 * - ad_videos.progress_stage를 'ad_copy_selection'으로 업데이트
 */
export async function generateAdCopies(
  imageId: string,
  productInfoId: string
): Promise<GenerateAdCopiesResult> {
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

    // Create ad_videos record with status "pending" and progress_stage "init"
    const { data: videoData, error: videoError } = await supabase
      .from("ad_videos")
      .insert({
        user_id: clerkId,
        product_image_id: imageId,
        product_info_id: productInfoId,
        status: "pending",
        progress_stage: "init",
      })
      .select("id")
      .single();

    if (videoError || !videoData) {
      console.error("Database insert error:", videoError);
      return {
        success: false,
        error: "영상 생성 요청 생성에 실패했습니다.",
      };
    }

    // Update progress_stage to ad_copy_generation
    await supabase
      .from("ad_videos")
      .update({
        status: "processing",
        progress_stage: "ad_copy_generation",
      })
      .eq("id", videoData.id);

    // Trigger adcopy webhook
    console.log("Triggering adcopy webhook:", N8N_ADCOPY_WEBHOOK_URL);

    try {
      const credentials = Buffer.from(
        `${process.env.N8N_WEBHOOK_USER}:${process.env.N8N_WEBHOOK_PASSWORD}`
      ).toString("base64");

      const response = await fetch(N8N_ADCOPY_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${credentials}`,
        },
        body: JSON.stringify({
          ad_video_id: videoData.id,
          product_image_id: imageId,
          product_info_id: productInfoId,
        }),
      });

      console.log("adcopy webhook response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("adcopy webhook error response:", errorText);
        throw new Error(`adcopy webhook failed with status ${response.status}`);
      }

      // Parse response - response.json() 사용
      const responseData = await response.json();
      console.log("adcopy webhook response:", JSON.stringify(responseData, null, 2));

      // 응답 구조 검증 - ad_copies 배열 확인
      const adCopies = responseData.ad_copies;
      if (!adCopies || !Array.isArray(adCopies) || adCopies.length === 0) {
        console.error("Invalid response structure:", responseData);
        throw new Error("광고문구 생성 응답이 올바르지 않습니다.");
      }

      console.log("ad_copies count:", adCopies.length);

      // Save ad_copies to database
      const adCopiesToInsert = responseData.ad_copies.map((copy, index) => ({
        ad_video_id: videoData.id,
        copy_index: index + 1,
        copy_text: copy.text,
        is_selected: false,
      }));

      const { data: savedCopies, error: insertError } = await supabase
        .from("ad_copies")
        .insert(adCopiesToInsert)
        .select();

      if (insertError) {
        console.error("ad_copies insert error:", insertError);
        throw new Error("광고문구 저장에 실패했습니다.");
      }

      // Update ad_videos progress_stage to ad_copy_selection
      await supabase
        .from("ad_videos")
        .update({
          progress_stage: "ad_copy_selection",
        })
        .eq("id", videoData.id);

      // Revalidate user's video cache
      revalidateUserVideos(clerkId);

      return {
        success: true,
        adVideoId: videoData.id,
        adCopies: savedCopies,
      };
    } catch (fetchError) {
      console.error("adcopy webhook error:", fetchError);

      // Update ad_videos status to failed
      await supabase
        .from("ad_videos")
        .update({
          status: "failed",
          progress_stage: "failed",
          error_message: "광고문구 생성에 실패했습니다.",
        })
        .eq("id", videoData.id);

      return {
        success: false,
        error: "광고문구 생성에 실패했습니다. 다시 시도해주세요.",
      };
    }
  } catch (error) {
    console.error("Generate ad copies error:", error);
    return {
      success: false,
      error: "광고문구 생성 중 오류가 발생했습니다.",
    };
  }
}
