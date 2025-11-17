import type { GenerationStage, GenerationProgress } from "@/types/generation";
import type { AdVideo } from "@/types/database";
import {
  STAGE_ORDER,
  STAGE_ESTIMATED_TIMES,
  TOTAL_ESTIMATED_TIME,
} from "@/constants/generation";

/**
 * Get the index of a stage in the stage order
 */
export function getStageIndex(stage: GenerationStage): number {
  return STAGE_ORDER.indexOf(stage);
}

/**
 * Calculate overall progress percentage (0-100)
 */
export function calculateProgress(currentStage: GenerationStage): number {
  const index = getStageIndex(currentStage);
  if (index === -1) return 0;

  // Calculate percentage based on stage position
  const progress = (index / (STAGE_ORDER.length - 1)) * 100;
  return Math.round(Math.min(100, Math.max(0, progress)));
}

/**
 * Calculate estimated time remaining in seconds
 */
export function calculateEstimatedTimeRemaining(
  currentStage: GenerationStage
): number {
  const currentIndex = getStageIndex(currentStage);
  if (currentIndex === -1) return TOTAL_ESTIMATED_TIME;

  // Sum up remaining stages
  let remainingTime = 0;
  for (let i = currentIndex; i < STAGE_ORDER.length; i++) {
    remainingTime += STAGE_ESTIMATED_TIMES[STAGE_ORDER[i]];
  }

  return remainingTime;
}

/**
 * Calculate elapsed time in seconds
 */
export function calculateElapsedTime(createdAt: string): number {
  const created = new Date(createdAt).getTime();
  const now = Date.now();
  return Math.floor((now - created) / 1000);
}

/**
 * Format seconds to human-readable time (e.g., "2분 30초", "1시간 5분")
 */
export function formatTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}초`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes < 60) {
    if (remainingSeconds === 0) {
      return `${minutes}분`;
    }
    return `${minutes}분 ${remainingSeconds}초`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}시간`;
  }
  return `${hours}시간 ${remainingMinutes}분`;
}

/**
 * Calculate complete generation progress information
 */
export function calculateGenerationProgress(
  video: AdVideo
): GenerationProgress {
  const currentStage = video.progress_stage as GenerationStage;
  const currentStageIndex = getStageIndex(currentStage);
  const percentComplete = calculateProgress(currentStage);
  const estimatedTimeRemaining = calculateEstimatedTimeRemaining(currentStage);
  const elapsedTime = calculateElapsedTime(video.created_at);

  return {
    currentStageIndex,
    totalStages: STAGE_ORDER.length,
    percentComplete,
    estimatedTimeRemaining,
    elapsedTime,
  };
}

/**
 * Check if a stage is completed
 */
export function isStageCompleted(
  stage: GenerationStage,
  currentStage: GenerationStage
): boolean {
  return getStageIndex(stage) < getStageIndex(currentStage);
}

/**
 * Check if a stage is active (current)
 */
export function isStageActive(
  stage: GenerationStage,
  currentStage: GenerationStage
): boolean {
  return stage === currentStage;
}

/**
 * Check if video generation is complete
 */
export function isGenerationComplete(video: AdVideo): boolean {
  return (
    video.status === "completed" && video.progress_stage === "completed"
  );
}

/**
 * Check if video generation has failed
 */
export function isGenerationFailed(video: AdVideo): boolean {
  return video.status === "failed";
}

/**
 * Get error message from video or default message
 */
export function getErrorMessage(video: AdVideo): string {
  return (
    video.error_message ||
    "영상 생성 중 오류가 발생했습니다. 다시 시도해주세요."
  );
}
