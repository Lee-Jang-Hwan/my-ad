import type { GenerationStage, StageInfo } from "@/types/generation";

/**
 * Generation stage order (must match database schema)
 * Updated: 2025-11-29 - Added ad_copy_selection stage for user selection
 * Flow: init -> ad_copy_generation -> ad_copy_selection -> image_refinement -> video_generation -> completed
 */
export const STAGE_ORDER: readonly GenerationStage[] = [
  "init",
  "ad_copy_generation",
  "ad_copy_selection",
  "image_refinement",
  "video_generation",
  "completed",
] as const;

/**
 * Korean labels for each stage
 */
export const STAGE_LABELS: Record<GenerationStage, string> = {
  init: "초기화",
  ad_copy_generation: "광고 문구 생성",
  ad_copy_selection: "광고 문구 선택",
  image_refinement: "이미지 정제",
  video_generation: "영상 생성",
  completed: "완료",
};

/**
 * Descriptions for each stage
 */
export const STAGE_DESCRIPTIONS: Record<GenerationStage, string> = {
  init: "영상 생성 준비 중입니다",
  ad_copy_generation: "AI가 광고 문구를 생성하고 있습니다",
  ad_copy_selection: "생성된 광고 문구 중 하나를 선택해주세요",
  image_refinement: "Gemini 2.5 Flash로 이미지를 정제하고 있습니다",
  video_generation: "OpenAI Sora 2로 영상을 생성하고 있습니다",
  completed: "영상 생성이 완료되었습니다",
};

/**
 * Estimated time in seconds for each stage
 * Updated: ad_copy_selection is user input (0 seconds)
 */
export const STAGE_ESTIMATED_TIMES: Record<GenerationStage, number> = {
  init: 10,
  ad_copy_generation: 20,
  ad_copy_selection: 0, // User input, no estimated time
  image_refinement: 40,
  video_generation: 120, // Sora 2 video generation only
  completed: 0,
};

/**
 * Lucide icon names for each stage
 */
export const STAGE_ICONS: Record<GenerationStage, string> = {
  init: "Loader2",
  ad_copy_generation: "FileText",
  ad_copy_selection: "MousePointerClick",
  image_refinement: "ImagePlus",
  video_generation: "Video",
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
