import type { ImageGenerationStage } from "@/types/ad-image";

/**
 * 이미지 생성 단계 정보
 */
export interface ImageStageInfo {
  key: ImageGenerationStage;
  label: string;
  description: string;
  estimatedSeconds: number;
  iconName: string; // lucide-react icon name
}

/**
 * 이미지 생성 단계 상수
 * 4단계: init -> ad_copy_generation -> image_generation -> completed
 */
export const IMAGE_STAGE_INFO: ImageStageInfo[] = [
  {
    key: "init",
    label: "준비 중",
    description: "이미지 생성을 준비하고 있습니다",
    estimatedSeconds: 2,
    iconName: "Loader2",
  },
  {
    key: "ad_copy_generation",
    label: "광고 문구 적용",
    description: "AI가 광고 문구를 생성하고 있습니다",
    estimatedSeconds: 10,
    iconName: "Sparkles",
  },
  {
    key: "ad_copy_selection",
    label: "문구 선택 대기",
    description: "광고 문구를 선택해주세요",
    estimatedSeconds: 0,
    iconName: "MousePointerClick",
  },
  {
    key: "image_generation",
    label: "이미지 생성",
    description: "AI가 광고 이미지를 생성하고 있습니다",
    estimatedSeconds: 45,
    iconName: "ImagePlus",
  },
  {
    key: "completed",
    label: "완료",
    description: "이미지 생성이 완료되었습니다",
    estimatedSeconds: 0,
    iconName: "CheckCircle2",
  },
];

/**
 * 단계 인덱스 계산
 */
export function getImageStageIndex(stage: ImageGenerationStage): number {
  const index = IMAGE_STAGE_INFO.findIndex((s) => s.key === stage);
  return index >= 0 ? index : 0;
}

/**
 * 진행률 계산
 */
export function calculateImageProgress(stage: ImageGenerationStage): number {
  const stageIndex = getImageStageIndex(stage);
  const totalStages = IMAGE_STAGE_INFO.length - 1; // completed 제외

  if (stage === "completed") return 100;
  if (stage === "failed" || stage === "cancelled") return 0;

  return Math.round((stageIndex / totalStages) * 100);
}

/**
 * 예상 남은 시간 계산 (초)
 */
export function calculateImageRemainingTime(stage: ImageGenerationStage): number {
  const stageIndex = getImageStageIndex(stage);

  if (stage === "completed" || stage === "failed" || stage === "cancelled") {
    return 0;
  }

  let remainingTime = 0;
  for (let i = stageIndex; i < IMAGE_STAGE_INFO.length; i++) {
    remainingTime += IMAGE_STAGE_INFO[i].estimatedSeconds;
  }

  return remainingTime;
}

/**
 * 총 예상 시간 (초)
 */
export const TOTAL_IMAGE_GENERATION_TIME = IMAGE_STAGE_INFO.reduce(
  (acc, stage) => acc + stage.estimatedSeconds,
  0
);

/**
 * 이미지 생성 상태 텍스트
 */
export const IMAGE_STATUS_TEXT: Record<string, string> = {
  pending: "대기 중",
  processing: "생성 중",
  completed: "완료",
  failed: "실패",
  cancelled: "취소됨",
};

/**
 * 이미지 생성 상태 색상
 */
export const IMAGE_STATUS_COLOR: Record<string, string> = {
  pending: "bg-gray-100 text-gray-800",
  processing: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  cancelled: "bg-orange-100 text-orange-800",
};
