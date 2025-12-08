/**
 * 콘텐츠 생성 로그 유틸리티
 * 이미지/영상 생성 과정의 각 단계를 로깅합니다.
 */

import { createServiceRoleClient } from "@/lib/supabase/service-role";

// =====================================================
// Types
// =====================================================

export type ContentType = "video" | "image";
export type LogStatus = "started" | "completed" | "failed";
export type LogSource = "app" | "n8n" | "supabase";

/**
 * 생성 단계 상수
 */
export const GENERATION_STAGES = {
  // 공통
  INIT: "init",
  AD_COPY_GENERATION: "ad_copy_generation",
  AD_COPY_SELECTION: "ad_copy_selection",

  // 영상 전용
  IMAGE_REFINEMENT: "image_refinement",
  VIDEO_GENERATION: "video_generation",
  TTS_GENERATION: "tts_generation",
  SUBTITLE_GENERATION: "subtitle_generation",
  MERGING: "merging",

  // 이미지 전용
  IMAGE_GENERATION: "image_generation",

  // 완료/실패
  COMPLETED: "completed",
  FAILED: "failed",
  CANCELLED: "cancelled",
} as const;

/**
 * 단계 한글 레이블
 */
export const STAGE_LABELS: Record<string, string> = {
  init: "초기화",
  ad_copy_generation: "광고문구 생성",
  ad_copy_selection: "광고문구 선택",
  image_refinement: "이미지 정제",
  video_generation: "영상 생성",
  tts_generation: "음성 생성",
  subtitle_generation: "자막 생성",
  merging: "최종 병합",
  image_generation: "이미지 생성",
  completed: "완료",
  failed: "실패",
  cancelled: "취소",
};

export interface LogGenerationParams {
  userId: string;
  contentId: string;
  contentType: ContentType;
  stage: string;
  status: LogStatus;
  source: LogSource;
  message?: string;
  errorCode?: string;
  errorMessage?: string;
  metadata?: Record<string, unknown>;
}

// =====================================================
// Main logging function
// =====================================================

/**
 * 생성 로그를 데이터베이스에 기록합니다.
 * 이 함수는 Server Action이 아닌 일반 서버 함수입니다.
 */
export async function logGeneration(params: LogGenerationParams): Promise<void> {
  try {
    const supabase = createServiceRoleClient();

    const { error } = await supabase.from("generation_logs").insert({
      user_id: params.userId,
      content_id: params.contentId,
      content_type: params.contentType,
      stage: params.stage,
      status: params.status,
      source: params.source,
      message: params.message || null,
      error_code: params.errorCode || null,
      error_message: params.errorMessage || null,
      metadata: params.metadata || null,
    });

    if (error) {
      console.error("❌ [LogGeneration] Failed to log:", error);
    }
  } catch (err) {
    // 로깅 실패가 메인 로직에 영향을 주지 않도록 함
    console.error("❌ [LogGeneration] Unexpected error:", err);
  }
}

// =====================================================
// Convenience functions
// =====================================================

/**
 * 단계 시작 로그
 */
export async function logStageStart(
  userId: string,
  contentId: string,
  contentType: ContentType,
  stage: string,
  source: LogSource = "app",
  metadata?: Record<string, unknown>
): Promise<void> {
  const stageLabel = STAGE_LABELS[stage] || stage;
  await logGeneration({
    userId,
    contentId,
    contentType,
    stage,
    status: "started",
    source,
    message: `${stageLabel} 단계 시작`,
    metadata,
  });
}

/**
 * 단계 완료 로그
 */
export async function logStageComplete(
  userId: string,
  contentId: string,
  contentType: ContentType,
  stage: string,
  source: LogSource = "app",
  metadata?: Record<string, unknown>
): Promise<void> {
  const stageLabel = STAGE_LABELS[stage] || stage;
  await logGeneration({
    userId,
    contentId,
    contentType,
    stage,
    status: "completed",
    source,
    message: `${stageLabel} 단계 완료`,
    metadata,
  });
}

/**
 * 단계 실패 로그
 */
export async function logStageFailed(
  userId: string,
  contentId: string,
  contentType: ContentType,
  stage: string,
  errorCode: string,
  errorMessage: string,
  source: LogSource = "app",
  metadata?: Record<string, unknown>
): Promise<void> {
  const stageLabel = STAGE_LABELS[stage] || stage;
  await logGeneration({
    userId,
    contentId,
    contentType,
    stage,
    status: "failed",
    source,
    message: `${stageLabel} 단계 실패: ${errorMessage}`,
    errorCode,
    errorMessage,
    metadata,
  });
}

// =====================================================
// Specialized logging functions
// =====================================================

/**
 * 영상 생성 시작 로그
 */
export async function logVideoGenerationStart(
  userId: string,
  contentId: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  await logStageStart(userId, contentId, "video", GENERATION_STAGES.INIT, "app", metadata);
}

/**
 * 이미지 생성 시작 로그
 */
export async function logImageGenerationStart(
  userId: string,
  contentId: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  await logStageStart(userId, contentId, "image", GENERATION_STAGES.INIT, "app", metadata);
}

/**
 * n8n 웹훅 호출 로그
 */
export async function logN8nWebhookCall(
  userId: string,
  contentId: string,
  contentType: ContentType,
  stage: string,
  webhookUrl: string
): Promise<void> {
  await logGeneration({
    userId,
    contentId,
    contentType,
    stage,
    status: "started",
    source: "n8n",
    message: `n8n 웹훅 호출`,
    metadata: { webhookUrl },
  });
}

/**
 * n8n 웹훅 응답 로그
 */
export async function logN8nWebhookResponse(
  userId: string,
  contentId: string,
  contentType: ContentType,
  stage: string,
  success: boolean,
  responseTime?: number,
  errorMessage?: string
): Promise<void> {
  if (success) {
    await logGeneration({
      userId,
      contentId,
      contentType,
      stage,
      status: "completed",
      source: "n8n",
      message: `n8n 웹훅 응답 성공`,
      metadata: responseTime ? { responseTimeMs: responseTime } : undefined,
    });
  } else {
    await logGeneration({
      userId,
      contentId,
      contentType,
      stage,
      status: "failed",
      source: "n8n",
      message: `n8n 웹훅 응답 실패`,
      errorCode: "N8N_WEBHOOK_ERROR",
      errorMessage: errorMessage || "웹훅 호출 실패",
    });
  }
}

/**
 * 최종 완료 로그
 */
export async function logGenerationCompleted(
  userId: string,
  contentId: string,
  contentType: ContentType,
  metadata?: Record<string, unknown>
): Promise<void> {
  await logGeneration({
    userId,
    contentId,
    contentType,
    stage: GENERATION_STAGES.COMPLETED,
    status: "completed",
    source: "app",
    message: contentType === "video" ? "영상 생성 완료" : "이미지 생성 완료",
    metadata,
  });
}

/**
 * 최종 실패 로그
 */
export async function logGenerationFailed(
  userId: string,
  contentId: string,
  contentType: ContentType,
  failedStage: string,
  errorCode: string,
  errorMessage: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  await logGeneration({
    userId,
    contentId,
    contentType,
    stage: GENERATION_STAGES.FAILED,
    status: "failed",
    source: "app",
    message: `${STAGE_LABELS[failedStage] || failedStage} 단계에서 생성 실패`,
    errorCode,
    errorMessage,
    metadata: { ...metadata, failedStage },
  });
}

/**
 * 사용자 취소 로그
 */
export async function logGenerationCancelled(
  userId: string,
  contentId: string,
  contentType: ContentType,
  cancelledAtStage: string
): Promise<void> {
  await logGeneration({
    userId,
    contentId,
    contentType,
    stage: GENERATION_STAGES.CANCELLED,
    status: "completed",
    source: "app",
    message: `사용자가 ${STAGE_LABELS[cancelledAtStage] || cancelledAtStage} 단계에서 취소`,
    metadata: { cancelledAtStage },
  });
}
