// =====================================================
// Credit System Constants
// =====================================================

/**
 * Cost in credits for generating one video
 */
export const VIDEO_GENERATION_COST = 80;

/**
 * Cost in credits for generating one image
 */
export const IMAGE_GENERATION_COST = 20;

// =====================================================
// Storyboard Credit Costs
// =====================================================

/**
 * Cost for AI to generate storyboard draft (scenes structure)
 */
export const STORYBOARD_AI_DRAFT_COST = 10;

/**
 * Cost per scene for image generation
 */
export const SCENE_IMAGE_GENERATION_COST = 5;

/**
 * Cost per scene for clip generation (image to video)
 */
export const SCENE_CLIP_GENERATION_COST = 15;

/**
 * Cost for final video merge
 */
export const STORYBOARD_FINAL_MERGE_COST = 20;

/**
 * Calculate total storyboard generation cost
 */
export function calculateStoryboardCost(
  sceneCount: number,
  options: {
    includeAIDraft?: boolean;
    generateImages?: boolean;
    generateClips?: boolean;
    includeFinalMerge?: boolean;
  } = {}
): number {
  const {
    includeAIDraft = false,
    generateImages = true,
    generateClips = true,
    includeFinalMerge = true,
  } = options;

  let totalCost = 0;

  if (includeAIDraft) {
    totalCost += STORYBOARD_AI_DRAFT_COST;
  }

  if (generateImages) {
    totalCost += sceneCount * SCENE_IMAGE_GENERATION_COST;
  }

  if (generateClips) {
    totalCost += sceneCount * SCENE_CLIP_GENERATION_COST;
  }

  if (includeFinalMerge) {
    totalCost += STORYBOARD_FINAL_MERGE_COST;
  }

  return totalCost;
}

/**
 * Get storyboard cost breakdown
 */
export function getStoryboardCostBreakdown(
  sceneCount: number,
  options: {
    includeAIDraft?: boolean;
    generateImages?: boolean;
    generateClips?: boolean;
    includeFinalMerge?: boolean;
  } = {}
): Array<{ label: string; cost: number; count?: number }> {
  const {
    includeAIDraft = false,
    generateImages = true,
    generateClips = true,
    includeFinalMerge = true,
  } = options;

  const breakdown: Array<{ label: string; cost: number; count?: number }> = [];

  if (includeAIDraft) {
    breakdown.push({
      label: "AI 스토리보드 초안 생성",
      cost: STORYBOARD_AI_DRAFT_COST,
    });
  }

  if (generateImages) {
    breakdown.push({
      label: "씬 이미지 생성",
      cost: sceneCount * SCENE_IMAGE_GENERATION_COST,
      count: sceneCount,
    });
  }

  if (generateClips) {
    breakdown.push({
      label: "씬 클립 생성",
      cost: sceneCount * SCENE_CLIP_GENERATION_COST,
      count: sceneCount,
    });
  }

  if (includeFinalMerge) {
    breakdown.push({
      label: "최종 영상 병합",
      cost: STORYBOARD_FINAL_MERGE_COST,
    });
  }

  return breakdown;
}

// =====================================================
// Minimum Requirements
// =====================================================

/**
 * Minimum credit balance required to generate a video
 */
export const MIN_CREDITS_FOR_GENERATION = VIDEO_GENERATION_COST;

/**
 * Minimum credit balance required to generate an image
 */
export const MIN_CREDITS_FOR_IMAGE_GENERATION = IMAGE_GENERATION_COST;

/**
 * Credit transaction types
 */
export const CREDIT_TRANSACTION_TYPES = {
  PURCHASE: "purchase",
  USAGE: "usage",
  ADMIN_GRANT: "admin_grant",
  REFUND: "refund",
  EXPIRY: "expiry",
} as const;

/**
 * Payment status values
 */
export const PAYMENT_STATUS = {
  PENDING: "pending",
  READY: "ready",
  IN_PROGRESS: "in_progress",
  DONE: "done",
  CANCELED: "canceled",
  PARTIAL_CANCELED: "partial_canceled",
  ABORTED: "aborted",
  EXPIRED: "expired",
} as const;

/**
 * User roles
 */
export const USER_ROLES = {
  USER: "user",
  ADMIN: "admin",
} as const;

/**
 * Format price in Korean Won
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
  }).format(price);
}

/**
 * Format credit amount
 */
export function formatCredits(credits: number): string {
  return new Intl.NumberFormat("ko-KR").format(credits);
}

/**
 * Calculate discount percentage
 */
export function calculateDiscountPercent(
  originalPrice: number,
  salePrice: number,
): number {
  if (originalPrice <= 0) return 0;
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
}

/**
 * Generate unique order ID
 */
export function generateOrderId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `ORDER_${timestamp}_${random}`;
}

