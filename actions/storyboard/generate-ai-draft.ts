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

// 타임아웃 설정 (5분 - Gemini 응답 시간 고려)
const WEBHOOK_TIMEOUT_MS = 300000;

interface GenerateAIDraftInput {
  storyboardId: string;
  productName: string;
  productDescription?: string;
  referenceImageUrl?: string;
  stylePreference?: string;
  sceneCount?: number;
}

/**
 * AI 스토리보드 초안 생성 (n8n webhook 호출)
 *
 * 흐름:
 * 1. 인증 및 권한 확인
 * 2. 크레딧 잔액 확인
 * 3. 스토리보드 상태를 'generating'으로 변경
 * 4. n8n webhook 호출 (Gemini AI가 씬 생성)
 * 5. n8n이 씬을 DB에 삽입하고 응답
 * 6. 크레딧 차감
 * 7. 완료
 */
export async function generateAIDraft(
  input: GenerateAIDraftInput
): Promise<GenerateAIDraftResult> {
  const startTime = Date.now();

  try {
    // 1. 인증 확인
    const authResult = await auth();
    const clerkId = authResult.userId;

    if (!clerkId) {
      console.warn("[generateAIDraft] Unauthorized access attempt");
      return { success: false, error: "로그인이 필요합니다." };
    }

    const supabase = createClerkSupabaseClient();

    // 2. 스토리보드 소유권 및 상세 정보 확인
    const { data: storyboard, error: fetchError } = await supabase
      .from("storyboards")
      .select("id, user_id, aspect_ratio, target_duration, default_scene_duration, status")
      .eq("id", input.storyboardId)
      .single();

    if (fetchError || !storyboard) {
      console.error("[generateAIDraft] Storyboard not found:", input.storyboardId, fetchError);
      return { success: false, error: "스토리보드를 찾을 수 없습니다." };
    }

    if (storyboard.user_id !== clerkId) {
      console.warn("[generateAIDraft] Permission denied:", { clerkId, ownerId: storyboard.user_id });
      return { success: false, error: "권한이 없습니다." };
    }

    // 이미 생성 중인지 확인
    if (storyboard.status === "generating") {
      return { success: false, error: "이미 생성 중입니다. 잠시 후 다시 시도해주세요." };
    }

    // 3. 크레딧 확인
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("credit_balance")
      .eq("clerk_id", clerkId)
      .single();

    if (userError || !userData) {
      console.error("[generateAIDraft] User not found:", clerkId, userError);
      return { success: false, error: "사용자 정보를 확인할 수 없습니다." };
    }

    const currentBalance = userData.credit_balance || 0;
    if (currentBalance < STORYBOARD_AI_DRAFT_COST) {
      console.info("[generateAIDraft] Insufficient credits:", { currentBalance, required: STORYBOARD_AI_DRAFT_COST });
      return {
        success: false,
        error: `크레딧이 부족합니다. (현재: ${currentBalance}, 필요: ${STORYBOARD_AI_DRAFT_COST})`
      };
    }

    // 4. 스토리보드 상태 업데이트
    const { error: updateError } = await supabase
      .from("storyboards")
      .update({
        status: "generating",
        progress_stage: "ai_draft_generation",
        error_message: null,
      })
      .eq("id", input.storyboardId);

    if (updateError) {
      console.error("[generateAIDraft] Failed to update storyboard status:", updateError);
      return { success: false, error: "스토리보드 상태 업데이트에 실패했습니다." };
    }

    // 5. 시작 로그 기록
    await supabase.from("storyboard_generation_logs").insert({
      storyboard_id: input.storyboardId,
      stage: "ai_draft_generation",
      status: "started",
      source: "app",
      message: `AI 초안 생성 시작 (목표: ${storyboard.target_duration}초, 예상 씬: ${Math.ceil(storyboard.target_duration / 5)}개)`,
      metadata: {
        product_name: input.productName,
        style_preference: input.stylePreference,
        target_duration: storyboard.target_duration,
      },
    });

    // 6. Webhook 페이로드 준비
    const sceneCount = input.sceneCount || Math.ceil(storyboard.target_duration / (storyboard.default_scene_duration || 8));
    const payload: StoryboardDraftWebhookPayload = {
      storyboard_id: input.storyboardId,
      user_id: clerkId,
      product_name: input.productName,
      product_description: input.productDescription,
      reference_image_url: input.referenceImageUrl,
      target_duration: storyboard.target_duration,
      scene_duration: storyboard.default_scene_duration || 8,
      scene_count: sceneCount,
      aspect_ratio: storyboard.aspect_ratio,
      style_preference: input.stylePreference,
    };

    console.log("[generateAIDraft] Calling n8n webhook:", {
      url: N8N_STORYBOARD_DRAFT_WEBHOOK_URL,
      storyboardId: input.storyboardId,
      targetDuration: storyboard.target_duration,
    });

    // 7. n8n Webhook 호출
    try {
      // 환경변수 확인
      if (!process.env.N8N_WEBHOOK_USER || !process.env.N8N_WEBHOOK_PASSWORD) {
        throw new Error("n8n 웹훅 인증 정보가 설정되지 않았습니다.");
      }

      const credentials = Buffer.from(
        `${process.env.N8N_WEBHOOK_USER}:${process.env.N8N_WEBHOOK_PASSWORD}`
      ).toString("base64");

      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        console.warn("[generateAIDraft] Webhook timeout after", WEBHOOK_TIMEOUT_MS, "ms");
      }, WEBHOOK_TIMEOUT_MS);

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

      const webhookDuration = Date.now() - startTime;
      console.log("[generateAIDraft] Webhook response:", {
        status: response.status,
        duration: `${webhookDuration}ms`,
      });

      // 응답 확인
      if (!response.ok) {
        const errorText = await response.text();
        console.error("[generateAIDraft] Webhook error response:", {
          status: response.status,
          body: errorText,
        });

        throw new Error(
          response.status === 401 ? "n8n 웹훅 인증에 실패했습니다." :
          response.status === 404 ? "n8n 웹훅을 찾을 수 없습니다." :
          response.status === 500 ? "n8n 서버 오류가 발생했습니다." :
          `Webhook 호출 실패 (${response.status})`
        );
      }

      // JSON 파싱
      let responseData: {
        success: boolean;
        storyboard_id?: string;
        scenes_count?: number;
        scenes?: unknown[];
        error?: string;
      };
      try {
        responseData = await response.json();
      } catch {
        console.error("[generateAIDraft] Failed to parse webhook response as JSON");
        throw new Error("n8n 응답을 파싱할 수 없습니다.");
      }

      console.log("[generateAIDraft] Webhook response data:", {
        success: responseData.success,
        scenesCount: responseData.scenes_count || responseData.scenes?.length,
      });

      // 응답 검증
      if (!responseData.success) {
        throw new Error(responseData.error || "AI 초안 생성에 실패했습니다.");
      }

      const scenesCount = responseData.scenes_count || responseData.scenes?.length || 0;

      if (scenesCount === 0) {
        throw new Error("생성된 씬이 없습니다. AI 응답을 확인해주세요.");
      }

      // 8. 크레딧 차감
      const { error: deductError } = await supabase.rpc("deduct_credits", {
        p_clerk_id: clerkId,
        p_amount: STORYBOARD_AI_DRAFT_COST,
        p_description: "스토리보드 AI 초안 생성",
        p_reference_type: "storyboard",
        p_reference_id: input.storyboardId,
      });

      if (deductError) {
        console.error("[generateAIDraft] Failed to deduct credits:", deductError);
        // 크레딧 차감 실패해도 씬은 이미 생성됨 - 로그만 남기고 진행
      }

      // 9. 크레딧 트랜잭션 기록
      await supabase.from("credit_transactions").insert({
        user_id: clerkId,
        transaction_type: "usage",
        amount: -STORYBOARD_AI_DRAFT_COST,
        description: "스토리보드 AI 초안 생성",
        reference_type: "storyboard",
        reference_id: input.storyboardId,
      });

      // 10. 완료 로그 기록
      await supabase.from("storyboard_generation_logs").insert({
        storyboard_id: input.storyboardId,
        stage: "ai_draft_generation",
        status: "completed",
        source: "app",
        message: `AI 초안 생성 완료 (${scenesCount}개 씬, ${webhookDuration}ms)`,
        metadata: {
          scenes_count: scenesCount,
          duration_ms: webhookDuration,
        },
      });

      revalidatePath(`/storyboard/${input.storyboardId}`);

      console.log("[generateAIDraft] Success:", {
        storyboardId: input.storyboardId,
        scenesCount,
        totalDuration: `${Date.now() - startTime}ms`,
      });

      return {
        success: true,
        storyboardId: input.storyboardId,
        scenesCount,
      };

    } catch (webhookError) {
      const errorMessage = webhookError instanceof Error
        ? webhookError.message
        : "알 수 없는 오류";

      const isTimeout = webhookError instanceof Error && webhookError.name === "AbortError";

      console.error("[generateAIDraft] Webhook error:", {
        error: errorMessage,
        isTimeout,
        storyboardId: input.storyboardId,
      });

      // 스토리보드 상태를 실패로 업데이트
      await supabase
        .from("storyboards")
        .update({
          status: "failed",
          progress_stage: "failed",
          error_message: isTimeout
            ? "AI 응답 시간이 초과되었습니다. 다시 시도해주세요."
            : errorMessage,
        })
        .eq("id", input.storyboardId);

      // 실패 로그 기록
      await supabase.from("storyboard_generation_logs").insert({
        storyboard_id: input.storyboardId,
        stage: "ai_draft_generation",
        status: "failed",
        source: "n8n",
        error_code: isTimeout ? "TIMEOUT" : "WEBHOOK_ERROR",
        error_message: errorMessage,
        metadata: {
          duration_ms: Date.now() - startTime,
        },
      });

      return {
        success: false,
        error: isTimeout
          ? "AI 응답 시간이 초과되었습니다. 다시 시도해주세요."
          : `AI 초안 생성에 실패했습니다: ${errorMessage}`,
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류";
    console.error("[generateAIDraft] Unexpected error:", error);

    return {
      success: false,
      error: `AI 초안 생성 중 오류가 발생했습니다: ${errorMessage}`
    };
  }
}
