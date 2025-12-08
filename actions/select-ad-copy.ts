"use server";

import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { revalidateUserVideos } from "@/lib/cache";
import { VIDEO_GENERATION_COST, USER_ROLES } from "@/lib/constants/credits";
import type { SelectAdCopyResult } from "@/types/ad-copy";
import {
  logStageStart,
  logStageComplete,
  logStageFailed,
  GENERATION_STAGES,
} from "@/lib/log-generation";

const N8N_ADVIDEO_WEBHOOK_URL =
  process.env.N8N_ADVIDEO_WEBHOOK_URL ||
  "https://n8n.sappstudio.kr/webhook/70980457-f61e-42f1-84c3-5245f1438435";

/**
 * 광고문구 선택 및 영상 생성 진행
 * - 선택된 광고문구 저장 (ad_copies.is_selected, ad_videos.selected_ad_copy)
 * - 크레딧 차감 (이 시점에 차감)
 * - advideo webhook 호출 (selected_ad_copy 포함)
 *
 * @param selectedCopyId - 선택된 광고문구 ID (직접 입력 시 null)
 * @param selectedCopyText - 선택된 광고문구 텍스트 (직접 입력 시 사용자가 입력한 텍스트)
 */
export async function selectAdCopyAndGenerate(
  adVideoId: string,
  selectedCopyId: string | null,
  selectedCopyText: string
): Promise<SelectAdCopyResult> {
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

    if (video.progress_stage !== "ad_copy_selection") {
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
    if (!isAdmin && user.credit_balance < VIDEO_GENERATION_COST) {
      return {
        success: false,
        error: "크레딧이 부족합니다.",
        insufficientCredits: true,
      };
    }

    // Update selected ad_copy (직접 입력이 아닌 경우에만)
    if (selectedCopyId) {
      const { error: updateCopyError } = await supabase
        .from("ad_copies")
        .update({ is_selected: true })
        .eq("id", selectedCopyId);

      if (updateCopyError) {
        console.error("ad_copy update error:", updateCopyError);
        return {
          success: false,
          error: "광고문구 선택에 실패했습니다.",
        };
      }
    }

    // 로그: 광고문구 선택 완료
    await logStageComplete(clerkId, adVideoId, "video", GENERATION_STAGES.AD_COPY_SELECTION, "app", {
      selectedCopyId,
      isCustomText: !selectedCopyId,
    });

    // Update ad_videos with selected_ad_copy and change progress_stage
    const { error: updateVideoError } = await supabase
      .from("ad_videos")
      .update({
        selected_ad_copy: selectedCopyText,
        progress_stage: "image_refinement",
        status: "processing",
      })
      .eq("id", adVideoId);

    if (updateVideoError) {
      console.error("ad_videos update error:", updateVideoError);
      return {
        success: false,
        error: "영상 정보 업데이트에 실패했습니다.",
      };
    }

    // 로그: 이미지 정제 시작
    await logStageStart(clerkId, adVideoId, "video", GENERATION_STAGES.IMAGE_REFINEMENT, "app");

    // Deduct credits for non-admin users
    if (!isAdmin) {
      const newBalance = user.credit_balance - VIDEO_GENERATION_COST;

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
          amount: -VIDEO_GENERATION_COST,
          balance_after: newBalance,
          ad_video_id: adVideoId,
          description: "영상 생성",
        });

      if (transactionError) {
        console.error("Credit transaction insert error:", transactionError);
      }

      console.log(`Credits deducted: ${VIDEO_GENERATION_COST}, new balance: ${newBalance}`);
    }

    // Trigger advideo webhook with selected_ad_copy
    try {
      const credentials = Buffer.from(
        `${process.env.N8N_WEBHOOK_USER}:${process.env.N8N_WEBHOOK_PASSWORD}`
      ).toString("base64");

      console.log("Triggering advideo webhook:", N8N_ADVIDEO_WEBHOOK_URL);
      console.log("Webhook payload:", {
        ad_video_id: adVideoId,
        product_image_id: video.product_image_id,
        product_info_id: video.product_info_id,
        selected_ad_copy: selectedCopyText,
      });

      const response = await fetch(N8N_ADVIDEO_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${credentials}`,
        },
        body: JSON.stringify({
          ad_video_id: adVideoId,
          product_image_id: video.product_image_id,
          product_info_id: video.product_info_id,
          selected_ad_copy: selectedCopyText,
        }),
      });

      console.log("advideo webhook response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("advideo webhook error response:", errorText);
        throw new Error(`advideo webhook failed with status ${response.status}`);
      }

      // 로그: 영상 생성 워크플로우 시작됨 (n8n에서 비동기로 진행)
      await logStageStart(clerkId, adVideoId, "video", GENERATION_STAGES.VIDEO_GENERATION, "n8n", {
        webhookStatus: response.status,
      });

      // Revalidate user's video cache
      revalidateUserVideos(clerkId);

      return {
        success: true,
      };
    } catch (fetchError) {
      console.error("advideo webhook error:", fetchError);

      // 로그: 영상 생성 요청 실패
      await logStageFailed(
        clerkId,
        adVideoId,
        "video",
        GENERATION_STAGES.IMAGE_REFINEMENT,
        "N8N_WEBHOOK_ERROR",
        fetchError instanceof Error ? fetchError.message : "영상 생성 요청에 실패했습니다.",
        "n8n"
      );

      // Update ad_videos status to failed
      await supabase
        .from("ad_videos")
        .update({
          status: "failed",
          progress_stage: "failed",
          error_message: "영상 생성 요청에 실패했습니다.",
        })
        .eq("id", adVideoId);

      return {
        success: false,
        error: "영상 생성 요청에 실패했습니다. 다시 시도해주세요.",
      };
    }
  } catch (error) {
    console.error("Select ad copy error:", error);
    return {
      success: false,
      error: "광고문구 선택 중 오류가 발생했습니다.",
    };
  }
}
