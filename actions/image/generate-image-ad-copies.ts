"use server";

import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import type { GenerateImageAdCopiesResult } from "@/types/ad-image";

// 이미지 광고문구 전용 웹훅 URL (sapp-studio-adcopy-picture)
const N8N_ADCOPY_IMAGE_WEBHOOK_URL =
  process.env.N8N_ADCOPY_IMAGE_WEBHOOK_URL ||
  "https://n8n.sappstudio.kr/webhook/2efce208-c7d7-4105-aba2-5278dda3602c";

/**
 * 이미지용 광고문구 5개 생성 (sapp-studio-adcopy webhook 호출)
 * - ad_images 레코드 생성 (status: pending, progress_stage: init)
 * - adcopy webhook 호출하여 광고문구 5개 생성
 * - ad_image_copies 테이블에 5개 저장
 * - ad_images.progress_stage를 'ad_copy_selection'으로 업데이트
 */
export async function generateImageAdCopies(
  imageId: string,
  productInfoId: string
): Promise<GenerateImageAdCopiesResult> {
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

    // Create ad_images record with status "pending" and progress_stage "init"
    const { data: imageData, error: imageError } = await supabase
      .from("ad_images")
      .insert({
        user_id: clerkId,
        product_image_id: imageId,
        product_info_id: productInfoId,
        status: "pending",
        progress_stage: "init",
      })
      .select("id")
      .single();

    if (imageError || !imageData) {
      console.error("Database insert error:", imageError);
      return {
        success: false,
        error: "이미지 생성 요청 생성에 실패했습니다.",
      };
    }

    // Update progress_stage to ad_copy_generation
    await supabase
      .from("ad_images")
      .update({
        status: "processing",
        progress_stage: "ad_copy_generation",
      })
      .eq("id", imageData.id);

    // Trigger adcopy webhook (같은 webhook 재사용)
    console.log("Triggering adcopy webhook for image:", N8N_ADCOPY_IMAGE_WEBHOOK_URL);

    try {
      const credentials = Buffer.from(
        `${process.env.N8N_WEBHOOK_USER}:${process.env.N8N_WEBHOOK_PASSWORD}`
      ).toString("base64");

      const response = await fetch(N8N_ADCOPY_IMAGE_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${credentials}`,
        },
        body: JSON.stringify({
          ad_video_id: imageData.id, // n8n에서는 ad_video_id를 사용하므로 같은 이름 유지
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

      // Get response text first to debug
      const responseText = await response.text();
      console.log("adcopy webhook raw response:", responseText);

      // Check if response is empty
      if (!responseText || responseText.trim() === "") {
        console.error("adcopy webhook returned empty response");
        throw new Error("광고문구 생성 응답이 비어있습니다. n8n 워크플로우를 확인해주세요.");
      }

      // Parse response
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse response as JSON:", responseText);
        throw new Error("광고문구 생성 응답을 파싱할 수 없습니다.");
      }
      console.log("adcopy webhook response:", JSON.stringify(responseData, null, 2));

      // 응답 구조 검증 - ad_copies 배열 확인
      const adCopies = responseData.ad_copies;
      if (!adCopies || !Array.isArray(adCopies) || adCopies.length === 0) {
        console.error("Invalid response structure:", responseData);
        throw new Error("광고문구 생성 응답이 올바르지 않습니다.");
      }

      console.log("ad_copies count:", adCopies.length);

      // Save ad_image_copies to database
      const adCopiesToInsert = adCopies.map((copy: { id: number; text: string }, index: number) => ({
        ad_image_id: imageData.id,
        copy_index: index + 1,
        copy_text: copy.text,
        is_selected: false,
      }));

      const { data: savedCopies, error: insertError } = await supabase
        .from("ad_image_copies")
        .insert(adCopiesToInsert)
        .select();

      if (insertError) {
        console.error("ad_image_copies insert error:", insertError);
        throw new Error("광고문구 저장에 실패했습니다.");
      }

      // Update ad_images progress_stage to ad_copy_selection
      await supabase
        .from("ad_images")
        .update({
          progress_stage: "ad_copy_selection",
        })
        .eq("id", imageData.id);

      return {
        success: true,
        adImageId: imageData.id,
        adCopies: savedCopies,
      };
    } catch (fetchError) {
      console.error("adcopy webhook error:", fetchError);

      // Update ad_images status to failed
      await supabase
        .from("ad_images")
        .update({
          status: "failed",
          progress_stage: "failed",
          error_message: "광고문구 생성에 실패했습니다.",
        })
        .eq("id", imageData.id);

      return {
        success: false,
        error: "광고문구 생성에 실패했습니다. 다시 시도해주세요.",
      };
    }
  } catch (error) {
    console.error("Generate image ad copies error:", error);
    return {
      success: false,
      error: "광고문구 생성 중 오류가 발생했습니다.",
    };
  }
}
