"use server";

import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import type { GenerateAdCopiesResult } from "@/types/ad-copy";

const N8N_ADCOPY_WEBHOOK_URL =
  process.env.N8N_ADCOPY_WEBHOOK_URL ||
  "https://n8n.sappstudio.kr/webhook/84e18e95-00b9-4963-9a6f-c14225a84d15";

/**
 * 광고문구 재생성
 * - 기존 ad_copies 삭제
 * - adcopy webhook 다시 호출
 * - 새로운 광고문구 저장
 */
export async function regenerateAdCopies(
  adVideoId: string
): Promise<GenerateAdCopiesResult> {
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

    // Verify ownership and get video info
    const { data: video, error: videoError } = await supabase
      .from("ad_videos")
      .select("id, user_id, product_image_id, product_info_id, progress_stage")
      .eq("id", adVideoId)
      .single();

    if (videoError || !video) {
      return {
        success: false,
        error: "영상 정보를 찾을 수 없습니다.",
      };
    }

    if (video.user_id !== clerkId) {
      return {
        success: false,
        error: "접근 권한이 없습니다.",
      };
    }

    // 현재 단계가 ad_copy_selection인지 확인
    if (video.progress_stage !== "ad_copy_selection") {
      return {
        success: false,
        error: "현재 단계에서는 광고문구를 재생성할 수 없습니다.",
      };
    }

    // 기존 ad_copies 삭제
    const { error: deleteError } = await supabase
      .from("ad_copies")
      .delete()
      .eq("ad_video_id", adVideoId);

    if (deleteError) {
      console.error("ad_copies delete error:", deleteError);
      return {
        success: false,
        error: "기존 광고문구 삭제에 실패했습니다.",
      };
    }

    // Update progress_stage to ad_copy_generation
    await supabase
      .from("ad_videos")
      .update({
        progress_stage: "ad_copy_generation",
      })
      .eq("id", adVideoId);

    // Trigger adcopy webhook
    console.log("Regenerating ad copies, triggering webhook:", N8N_ADCOPY_WEBHOOK_URL);

    try {
      const credentials = Buffer.from(
        `${process.env.N8N_WEBHOOK_USER}:${process.env.N8N_WEBHOOK_PASSWORD}`
      ).toString("base64");

      // 2분 타임아웃 설정
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000);

      const response = await fetch(N8N_ADCOPY_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${credentials}`,
        },
        body: JSON.stringify({
          ad_video_id: adVideoId,
          product_image_id: video.product_image_id,
          product_info_id: video.product_info_id,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log("adcopy webhook response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("adcopy webhook error response:", errorText);
        throw new Error(`adcopy webhook failed with status ${response.status}`);
      }

      // Parse response
      const responseData = await response.json();
      console.log("adcopy webhook response:", JSON.stringify(responseData, null, 2));

      // 응답 구조 검증
      const adCopies = responseData.ad_copies;
      if (!adCopies || !Array.isArray(adCopies) || adCopies.length === 0) {
        console.error("Invalid response structure:", responseData);
        throw new Error("광고문구 생성 응답이 올바르지 않습니다.");
      }

      console.log("ad_copies count:", adCopies.length);

      // Save new ad_copies to database
      const adCopiesToInsert = adCopies.map((copy: { id: number; text: string }, index: number) => ({
        ad_video_id: adVideoId,
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

      // Update ad_videos progress_stage back to ad_copy_selection
      await supabase
        .from("ad_videos")
        .update({
          progress_stage: "ad_copy_selection",
        })
        .eq("id", adVideoId);

      return {
        success: true,
        adVideoId: adVideoId,
        adCopies: savedCopies,
      };
    } catch (fetchError) {
      console.error("adcopy webhook error:", fetchError);

      // Restore progress_stage to ad_copy_selection on error
      await supabase
        .from("ad_videos")
        .update({
          progress_stage: "ad_copy_selection",
        })
        .eq("id", adVideoId);

      return {
        success: false,
        error: "광고문구 재생성에 실패했습니다. 다시 시도해주세요.",
      };
    }
  } catch (error) {
    console.error("Regenerate ad copies error:", error);
    return {
      success: false,
      error: "광고문구 재생성 중 오류가 발생했습니다.",
    };
  }
}
