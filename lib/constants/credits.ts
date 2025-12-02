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

