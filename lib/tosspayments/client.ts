// =====================================================
// TossPayments Client-side Utilities
// =====================================================

import { loadTossPayments, type TossPaymentsWidgets } from "@tosspayments/tosspayments-sdk";

let tossPaymentsInstance: Awaited<ReturnType<typeof loadTossPayments>> | null = null;

/**
 * Get or create TossPayments instance
 */
export async function getTossPayments() {
  if (tossPaymentsInstance) {
    return tossPaymentsInstance;
  }

  const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
  if (!clientKey) {
    throw new Error("NEXT_PUBLIC_TOSS_CLIENT_KEY is not configured");
  }

  tossPaymentsInstance = await loadTossPayments(clientKey);
  return tossPaymentsInstance;
}

/**
 * Create payment widgets instance
 */
export async function createPaymentWidgets(
  customerKey: string,
): Promise<TossPaymentsWidgets> {
  const tossPayments = await getTossPayments();
  return tossPayments.widgets({ customerKey });
}

/**
 * Generate customer key from clerk user ID
 * TossPayments requires a unique customer key for each user
 */
export function generateCustomerKey(clerkUserId: string): string {
  // Use clerk user ID as customer key
  // TossPayments customer key must be alphanumeric and less than 50 characters
  return clerkUserId.replace(/[^a-zA-Z0-9]/g, "").substring(0, 50);
}
