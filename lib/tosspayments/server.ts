// =====================================================
// TossPayments Server-side Utilities
// =====================================================

import type {
  TossPaymentConfirmRequest,
  TossPaymentConfirmResponse,
  TossPaymentError,
} from "@/types/payment";

const TOSS_API_URL = "https://api.tosspayments.com/v1/payments";

/**
 * Get authorization header for TossPayments API
 */
function getAuthorizationHeader(): string {
  const secretKey = process.env.TOSS_SECRET_KEY;
  if (!secretKey) {
    throw new Error("TOSS_SECRET_KEY is not configured");
  }
  // TossPayments requires secretKey + ":" encoded in base64
  const credentials = Buffer.from(`${secretKey}:`).toString("base64");
  return `Basic ${credentials}`;
}

/**
 * Confirm a payment with TossPayments
 */
export async function confirmPayment(
  request: TossPaymentConfirmRequest,
): Promise<TossPaymentConfirmResponse> {
  const { paymentKey, orderId, amount } = request;

  const response = await fetch(`${TOSS_API_URL}/confirm`, {
    method: "POST",
    headers: {
      Authorization: getAuthorizationHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      paymentKey,
      orderId,
      amount,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    const error = data as TossPaymentError;
    throw new Error(`TossPayments Error: ${error.code} - ${error.message}`);
  }

  return data as TossPaymentConfirmResponse;
}

/**
 * Get payment details by paymentKey
 */
export async function getPaymentByKey(
  paymentKey: string,
): Promise<TossPaymentConfirmResponse> {
  const response = await fetch(`${TOSS_API_URL}/${paymentKey}`, {
    method: "GET",
    headers: {
      Authorization: getAuthorizationHeader(),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    const error = data as TossPaymentError;
    throw new Error(`TossPayments Error: ${error.code} - ${error.message}`);
  }

  return data as TossPaymentConfirmResponse;
}

/**
 * Get payment details by orderId
 */
export async function getPaymentByOrderId(
  orderId: string,
): Promise<TossPaymentConfirmResponse> {
  const response = await fetch(`${TOSS_API_URL}/orders/${orderId}`, {
    method: "GET",
    headers: {
      Authorization: getAuthorizationHeader(),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    const error = data as TossPaymentError;
    throw new Error(`TossPayments Error: ${error.code} - ${error.message}`);
  }

  return data as TossPaymentConfirmResponse;
}

/**
 * Cancel a payment
 */
export async function cancelPayment(
  paymentKey: string,
  cancelReason: string,
  cancelAmount?: number,
): Promise<TossPaymentConfirmResponse> {
  const response = await fetch(`${TOSS_API_URL}/${paymentKey}/cancel`, {
    method: "POST",
    headers: {
      Authorization: getAuthorizationHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      cancelReason,
      ...(cancelAmount && { cancelAmount }),
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    const error = data as TossPaymentError;
    throw new Error(`TossPayments Error: ${error.code} - ${error.message}`);
  }

  return data as TossPaymentConfirmResponse;
}

/**
 * Map TossPayments status to our payment status
 */
export function mapTossPaymentStatus(
  tossStatus: string,
): "pending" | "ready" | "in_progress" | "done" | "canceled" | "aborted" | "expired" {
  const statusMap: Record<string, "pending" | "ready" | "in_progress" | "done" | "canceled" | "aborted" | "expired"> = {
    READY: "ready",
    IN_PROGRESS: "in_progress",
    WAITING_FOR_DEPOSIT: "pending",
    DONE: "done",
    CANCELED: "canceled",
    PARTIAL_CANCELED: "canceled",
    ABORTED: "aborted",
    EXPIRED: "expired",
  };

  return statusMap[tossStatus] || "pending";
}

/**
 * Extract card info from TossPayments response
 */
export function extractCardInfo(response: TossPaymentConfirmResponse): {
  cardCompany: string | null;
  cardNumber: string | null;
} {
  if (response.card) {
    return {
      cardCompany: response.card.issuerCode,
      cardNumber: response.card.number,
    };
  }
  return {
    cardCompany: null,
    cardNumber: null,
  };
}
