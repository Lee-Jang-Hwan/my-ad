"use server";

import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { IMAGE_GENERATION_COST, USER_ROLES } from "@/lib/constants/credits";
import type { SelectImageAdCopyResult } from "@/types/ad-image";
import {
  logStageStart,
  logStageComplete,
  logStageFailed,
  GENERATION_STAGES,
} from "@/lib/log-generation";

const N8N_ADPICTURE_WEBHOOK_URL =
  process.env.N8N_ADPICTURE_WEBHOOK_URL ||
  "https://n8n.sappstudio.kr/webhook/60fc0718-5146-48ec-a49a-ae973841687b";

/**
 * 이미지용 광고문구 선택 및 이미지 생성 진행
 * - 선택된 광고문구 저장 (ad_image_copies.is_selected, ad_images.selected_ad_copy)
 * - 크레딧 차감 (이 시점에 차감)
 * - adpicture webhook 호출 (selected_ad_copy 포함)
 *
 * @param selectedCopyId - 선택된 광고문구 ID (직접 입력 시 null)
 * @param selectedCopyText - 선택된 광고문구 텍스트 (직접 입력 시 사용자가 입력한 텍스트)
 */
export async function selectImageAdCopyAndGenerate(
  adImageId: string,
  selectedCopyId: string | null,
  selectedCopyText: string
): Promise<SelectImageAdCopyResult> {
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
    const serviceSupabase = createServiceRoleClient();

    // Verify ownership
    const { data: image, error: imageError } = await supabase
      .from("ad_images")
      .select("id, user_id, product_image_id, product_info_id, progress_stage")
      .eq("id", adImageId)
      .single();

    if (imageError || !image) {
      return {
        success: false,
        error: "이미지 정보를 찾을 수 없습니다.",
      };
    }

    if (image.user_id !== clerkId) {
      return {
        success: false,
        error: "접근 권한이 없습니다.",
      };
    }

    // 광고문구 선택 단계 또는 이전 실패 후 재시도 허용
    const allowedStages = ["ad_copy_selection", "failed"];
    if (!allowedStages.includes(image.progress_stage)) {
      return {
        success: false,
        error: "현재 단계에서는 광고문구를 선택할 수 없습니다.",
      };
    }

    // Check user's credit balance and role
    const { data: user, error: userError } = await serviceSupabase
      .from("users")
      .select("credit_balance, role")
      .eq("clerk_id", clerkId)
      .single();

    if (userError || !user) {
      console.error("User lookup error:", userError);
      return {
        success: false,
        error: "사용자 정보를 찾을 수 없습니다.",
      };
    }

    const isAdmin = user.role === USER_ROLES.ADMIN;

    // Check if user has enough credits (admins bypass this check)
    if (!isAdmin && user.credit_balance < IMAGE_GENERATION_COST) {
      return {
        success: false,
        error: "크레딧이 부족합니다.",
        insufficientCredits: true,
      };
    }

    // Update selected ad_image_copy (직접 입력이 아닌 경우에만)
    if (selectedCopyId) {
      const { error: updateCopyError } = await supabase
        .from("ad_image_copies")
        .update({ is_selected: true })
        .eq("id", selectedCopyId);

      if (updateCopyError) {
        console.error("ad_image_copy update error:", updateCopyError);
        return {
          success: false,
          error: "광고문구 선택에 실패했습니다.",
        };
      }
    }

    // 로그: 광고문구 선택 완료
    await logStageComplete(clerkId, adImageId, "image", GENERATION_STAGES.AD_COPY_SELECTION, "app", {
      selectedCopyId,
      isCustomText: !selectedCopyId,
    });

    // Update ad_images with selected_ad_copy and change progress_stage
    const { error: updateImageError } = await supabase
      .from("ad_images")
      .update({
        selected_ad_copy: selectedCopyText,
        progress_stage: "image_generation",
        status: "processing",
      })
      .eq("id", adImageId);

    if (updateImageError) {
      console.error("ad_images update error:", updateImageError);
      return {
        success: false,
        error: "이미지 정보 업데이트에 실패했습니다.",
      };
    }

    // 로그: 이미지 생성 시작
    await logStageStart(clerkId, adImageId, "image", GENERATION_STAGES.IMAGE_GENERATION, "app");

    // Deduct credits for non-admin users
    if (!isAdmin) {
      const newBalance = user.credit_balance - IMAGE_GENERATION_COST;

      // Update user's credit balance
      const { error: creditUpdateError } = await serviceSupabase
        .from("users")
        .update({ credit_balance: newBalance })
        .eq("clerk_id", clerkId);

      if (creditUpdateError) {
        console.error("Credit balance update error:", creditUpdateError);
      }

      // Create credit transaction record
      const { error: transactionError } = await serviceSupabase
        .from("credit_transactions")
        .insert({
          user_id: clerkId,
          type: "usage",
          amount: -IMAGE_GENERATION_COST,
          balance_after: newBalance,
          ad_image_id: adImageId,
          description: "이미지 생성",
        });

      if (transactionError) {
        console.error("Credit transaction insert error:", transactionError);
      }

      console.log(`Credits deducted: ${IMAGE_GENERATION_COST}, new balance: ${newBalance}`);
    }

    // Trigger adpicture webhook with selected_ad_copy
    try {
      const credentials = Buffer.from(
        `${process.env.N8N_WEBHOOK_USER}:${process.env.N8N_WEBHOOK_PASSWORD}`
      ).toString("base64");

      console.log("Triggering adpicture webhook:", N8N_ADPICTURE_WEBHOOK_URL);
      console.log("Webhook payload:", {
        ad_video_id: adImageId, // n8n에서는 ad_video_id를 사용하므로 같은 이름 유지
        product_image_id: image.product_image_id,
        product_info_id: image.product_info_id,
        selected_ad_copy: selectedCopyText,
      });

      const response = await fetch(N8N_ADPICTURE_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${credentials}`,
        },
        body: JSON.stringify({
          ad_video_id: adImageId, // n8n에서는 ad_video_id를 사용하므로 같은 이름 유지
          product_image_id: image.product_image_id,
          product_info_id: image.product_info_id,
          selected_ad_copy: selectedCopyText,
        }),
      });

      console.log("adpicture webhook response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("adpicture webhook error response:", errorText);
        throw new Error(`adpicture webhook failed with status ${response.status}`);
      }

      return {
        success: true,
      };
    } catch (fetchError) {
      console.error("adpicture webhook error:", fetchError);

      // Update ad_images status to failed, but keep progress_stage as ad_copy_selection for retry
      await supabase
        .from("ad_images")
        .update({
          status: "failed",
          progress_stage: "ad_copy_selection", // 재시도 가능하도록 유지
          error_message: "이미지 생성 요청에 실패했습니다. 다시 시도해주세요.",
        })
        .eq("id", adImageId);

      return {
        success: false,
        error: "이미지 생성 요청에 실패했습니다. 다시 시도해주세요.",
      };
    }
  } catch (error) {
    console.error("Select image ad copy error:", error);
    return {
      success: false,
      error: "광고문구 선택 중 오류가 발생했습니다.",
    };
  }
}
