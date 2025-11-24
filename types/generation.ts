import type { AdVideo } from "./database";

/**
 * Video generation stage values from database schema
 * These match the progress_stage CHECK constraint in ad_videos table
 * Updated: 2025-11-24 - Removed TTS, subtitle, and merging stages
 * n8n workflow now generates complete video in one step
 */
export type GenerationStage =
  | "init"
  | "ad_copy_generation"
  | "image_refinement"
  | "video_generation"
  | "completed";

/**
 * Metadata for each generation stage
 */
export interface StageInfo {
  key: GenerationStage;
  label: string;
  description: string;
  estimatedSeconds: number;
  iconName: string; // lucide-react icon name
}

/**
 * State for real-time video subscription
 */
export interface RealtimeVideoState {
  video: AdVideo | null;
  isLoading: boolean;
  error: string | null;
  isCompleted: boolean;
  isFailed: boolean;
  currentStage: GenerationStage;
  progressPercent: number;
}

/**
 * Calculated progress information
 */
export interface GenerationProgress {
  currentStageIndex: number;
  totalStages: number;
  percentComplete: number;
  estimatedTimeRemaining: number;
  elapsedTime: number;
}

/**
 * Props for generation components
 */
export interface GenerationProgressProps {
  initialVideo: AdVideo;
}

export interface StepIndicatorProps {
  currentStage: GenerationStage;
  status: "pending" | "processing" | "completed" | "failed" | "cancelled";
}

export interface StageIconProps {
  stage: GenerationStage;
  isActive: boolean;
  isCompleted: boolean;
  isFailed: boolean;
}

export interface LoadingAnimationProps {
  stage: GenerationStage;
}

export interface EstimatedTimeProps {
  remainingSeconds: number;
}

export interface ErrorMessageProps {
  message: string;
  adVideoId: string;
}

export interface RetryButtonProps {
  adVideoId: string;
  onRetry: () => Promise<void>;
  disabled?: boolean;
}

export interface CancelButtonProps {
  adVideoId: string;
  onCancel?: () => Promise<void>;
  disabled?: boolean;
}
