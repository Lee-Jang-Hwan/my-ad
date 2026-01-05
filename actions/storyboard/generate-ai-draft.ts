"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { STORYBOARD_AI_DRAFT_COST } from "@/lib/constants/credits";
import type {
  GenerateAIDraftResult,
  StoryboardDraftWebhookPayload,
} from "@/types/storyboard";

const N8N_STORYBOARD_DRAFT_WEBHOOK_URL =
  process.env.N8N_STORYBOARD_DRAFT_WEBHOOK_URL ||
  "https://n8n.sappstudio.kr/webhook/storyboard-draft";

interface GenerateAIDraftInput {
  storyboardId: string;
  productName: string;
  productDescription?: string;
  referenceImageUrl?: string;
  stylePreference?: string;
}

/**
 * AI 스토리보드 초안 생성 (n8n webhook 호출)
 * - storyboards 상태를 generating으로 업데이트
 * - n8n webhook 호출하여 AI가 씬 구성 생성
 * - storyboard_scenes 테이블에 씬 삽입
 * - storyboards 상태를 draft/user_editing으로 업데이트
 */
export async function generateAIDraft(
  input: GenerateAIDraftInput
): Promise<GenerateAIDraftResult> {
  try {
    const authResult = await auth();
    const clerkId = authResult.userId;

    if (!clerkId) {
      return { success: false, error: "로그인이 필요합니다." };
    }

    const supabase = createClerkSupabaseClient();

    // Verify storyboard ownership and get details
    const { data: storyboard, error: fetchError } = await supabase
      .from("storyboards")
      .select("id, user_id, aspect_ratio, target_duration")
      .eq("id", input.storyboardId)
      .single();

    if (fetchError || !storyboard) {
      return { success: false, error: "스토리보드를 찾을 수 없습니다." };
    }

    if (storyboard.user_id !== clerkId) {
      return { success: false, error: "권한이 없습니다." };
    }

    // Check credits
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("credit_balance")
      .eq("clerk_id", clerkId)
      .single();

    if (userError || !userData) {
      return { success: false, error: "사용자 정보를 확인할 수 없습니다." };
    }

    if ((userData.credit_balance || 0) < STORYBOARD_AI_DRAFT_COST) {
      return { success: false, error: "크레딧이 부족합니다." };
    }

    // Update storyboard status to generating
    await supabase
      .from("storyboards")
      .update({
        status: "generating",
        progress_stage: "ai_draft_generation",
      })
      .eq("id", input.storyboardId);

    // Prepare webhook payload
    const payload: StoryboardDraftWebhookPayload = {
      storyboard_id: input.storyboardId,
      user_id: clerkId,
      product_name: input.productName,
      product_description: input.productDescription,
      reference_image_url: input.referenceImageUrl,
      target_duration: storyboard.target_duration,
      aspect_ratio: storyboard.aspect_ratio,
      style_preference: input.stylePreference,
    };

    // Call n8n webhook
    console.log("Triggering storyboard-draft webhook:", N8N_STORYBOARD_DRAFT_WEBHOOK_URL);

    try {
      const credentials = Buffer.from(
        `${process.env.N8N_WEBHOOK_USER}:${process.env.N8N_WEBHOOK_PASSWORD}`
      ).toString("base64");

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 180000); // 3분 타임아웃

      const response = await fetch(N8N_STORYBOARD_DRAFT_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${credentials}`,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log("storyboard-draft webhook response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("storyboard-draft webhook error response:", errorText);
        throw new Error(`Webhook failed with status ${response.status}`);
      }

      const responseData = await response.json();
      console.log("storyboard-draft webhook response:", JSON.stringify(responseData, null, 2));

      // Verify scenes were created
      if (!responseData.success || !responseData.scenes) {
        throw new Error("AI 초안 생성 응답이 올바르지 않습니다.");
      }

      // Deduct credits
      await supabase.rpc("deduct_credits", {
        p_clerk_id: clerkId,
        p_amount: STORYBOARD_AI_DRAFT_COST,
        p_description: "스토리보드 AI 초안 생성",
        p_reference_type: "storyboard",
        p_reference_id: input.storyboardId,
      });

      // Log credit transaction
      await supabase.from("credit_transactions").insert({
        user_id: clerkId,
        transaction_type: "usage",
        amount: -STORYBOARD_AI_DRAFT_COST,
        description: "스토리보드 AI 초안 생성",
        reference_type: "storyboard",
        reference_id: input.storyboardId,
      });

      revalidatePath(`/storyboard/${input.storyboardId}`);

      return {
        success: true,
        storyboardId: input.storyboardId,
        scenesCount: responseData.scenes?.length || 0,
      };
    } catch (fetchError) {
      console.error("storyboard-draft webhook error:", fetchError);

      // Update storyboard status to failed
      await supabase
        .from("storyboards")
        .update({
          status: "failed",
          progress_stage: "failed",
          error_message: "AI 초안 생성에 실패했습니다.",
        })
        .eq("id", input.storyboardId);

      // Log failure
      await supabase.from("storyboard_generation_logs").insert({
        storyboard_id: input.storyboardId,
        stage: "ai_draft_generation",
        status: "failed",
        source: "n8n",
        error_code: "WEBHOOK_ERROR",
        error_message:
          fetchError instanceof Error
            ? fetchError.message
            : "AI 초안 생성 실패",
      });

      return {
        success: false,
        error: "AI 초안 생성에 실패했습니다. 다시 시도해주세요.",
      };
    }
  } catch (error) {
    console.error("Generate AI draft error:", error);
    return { success: false, error: "AI 초안 생성 중 오류가 발생했습니다." };
  }
}
