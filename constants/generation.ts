import type { GenerationStage, StageInfo } from "@/types/generation";

/**
 * Generation stage order (must match database schema)
 */
export const STAGE_ORDER: readonly GenerationStage[] = [
  "init",
  "ad_copy_generation",
  "image_refinement",
  "video_generation",
  "tts_generation",
  "subtitle_generation",
  "merging",
  "completed",
] as const;

/**
 * Korean labels for each stage
 */
export const STAGE_LABELS: Record<GenerationStage, string> = {
  init: "초기화",
  ad_copy_generation: "광고 문구 생성",
  image_refinement: "이미지 정제",
  video_generation: "영상 생성",
  tts_generation: "TTS 생성",
  subtitle_generation: "자막 생성",
  merging: "최종 합성",
  completed: "완료",
};

/**
 * Descriptions for each stage
 */
export const STAGE_DESCRIPTIONS: Record<GenerationStage, string> = {
  init: "영상 생성 준비 중입니다",
  ad_copy_generation: "AI가 광고 문구를 생성하고 있습니다",
  image_refinement: "Gemini 2.5 Flash로 이미지를 정제하고 있습니다",
  video_generation: "Veo 3.1으로 영상을 생성하고 있습니다",
  tts_generation: "Google TTS로 음성을 생성하고 있습니다",
  subtitle_generation: "SRT 자막을 생성하고 있습니다",
  merging: "FFmpeg으로 영상, 음성, 자막을 합성하고 있습니다",
  completed: "영상 생성이 완료되었습니다",
};

/**
 * Estimated time in seconds for each stage
 */
export const STAGE_ESTIMATED_TIMES: Record<GenerationStage, number> = {
  init: 10,
  ad_copy_generation: 30,
  image_refinement: 40,
  video_generation: 120,
  tts_generation: 20,
  subtitle_generation: 15,
  merging: 30,
  completed: 0,
};

/**
 * Lucide icon names for each stage
 */
export const STAGE_ICONS: Record<GenerationStage, string> = {
  init: "Loader2",
  ad_copy_generation: "FileText",
  image_refinement: "ImagePlus",
  video_generation: "Video",
  tts_generation: "Mic",
  subtitle_generation: "Subtitles",
  merging: "Combine",
  completed: "CheckCircle",
};

/**
 * Complete stage information array
 */
export const STAGE_INFO: StageInfo[] = STAGE_ORDER.map((key) => ({
  key,
  label: STAGE_LABELS[key],
  description: STAGE_DESCRIPTIONS[key],
  estimatedSeconds: STAGE_ESTIMATED_TIMES[key],
  iconName: STAGE_ICONS[key],
}));

/**
 * Polling interval for Supabase Realtime (ms)
 */
export const REALTIME_POLLING_INTERVAL = 1000;

/**
 * Auto-redirect delay after completion (ms)
 */
export const COMPLETION_REDIRECT_DELAY = 2000;

/**
 * Total estimated time for entire generation process (seconds)
 */
export const TOTAL_ESTIMATED_TIME = Object.values(STAGE_ESTIMATED_TIMES).reduce(
  (sum, time) => sum + time,
  0
);
