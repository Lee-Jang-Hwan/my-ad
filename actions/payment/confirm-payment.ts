"use server";

import { auth } from "@clerk/nextjs/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import {
  confirmPayment as tossConfirmPayment,
  mapTossPaymentStatus,
  extractCardInfo,
} from "@/lib/tosspayments/server";
import type { ConfirmPaymentResult, PricingTier } from "@/types/payment";

/**
 * Confirm a payment with TossPayments and update the database
 */
export async function confirmPayment(
  paymentKey: string,
  orderId: string,
  amount: number,
): Promise<ConfirmPaymentResult> {
  try {
    // Check authentication
    const authResult = await auth();
    const clerkId = authResult.userId;

    if (!clerkId) {
      return {
        success: false,
        error: "로그인이 필요합니다.",
      };
    }

    const supabase = createServiceRoleClient();

    // Get the pending payment record
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .select(
        `
        *,
        pricing_tier:pricing_tiers(*)
      `,
      )
      .eq("order_id", orderId)
      .eq("user_id", clerkId)
      .eq("status", "pending")
      .single();

    if (paymentError || !payment) {
      console.error("Payment lookup error:", paymentError);
      return {
        success: false,
        error: "결제 정보를 찾을 수 없습니다.",
      };
    }

    // Verify amount matches
    if (payment.amount !== amount) {
      console.error("Amount mismatch:", {
        expected: payment.amount,
        received: amount,
      });
      return {
        success: false,
        error: "결제 금액이 일치하지 않습니다.",
      };
    }

    // Confirm payment with TossPayments
    let tossResponse;
    try {
      tossResponse = await tossConfirmPayment({
        paymentKey,
        orderId,
        amount,
      });
    } catch (tossError) {
      console.error("TossPayments confirm error:", tossError);

      // Update payment status to failed
      await supabase
        .from("payments")
        .update({
          status: "aborted",
          failure_code: "TOSS_CONFIRM_FAILED",
          failure_message:
            tossError instanceof Error ? tossError.message : "결제 승인 실패",
        })
        .eq("id", payment.id);

      return {
        success: false,
        error: "결제 승인에 실패했습니다.",
      };
    }

    // Extract card info
    const { cardCompany, cardNumber } = extractCardInfo(tossResponse);

    // Get credits from pricing tier
    const pricingTier = payment.pricing_tier as PricingTier;
    const creditsToGrant = pricingTier.credits;

    // Get current user's credit balance
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("credit_balance")
      .eq("clerk_id", clerkId)
      .single();

    if (userError || !user) {
      console.error("User lookup error:", userError);
      return {
        success: false,
        error: "사용자 정보를 찾을 수 없습니다.",
      };
    }

    const newBalance = user.credit_balance + creditsToGrant;

    // Update payment record with TossPayments response
    const { error: updatePaymentError } = await supabase
      .from("payments")
      .update({
        payment_key: paymentKey,
        status: mapTossPaymentStatus(tossResponse.status),
        method: tossResponse.method,
        card_company: cardCompany,
        card_number: cardNumber,
        credits_granted: creditsToGrant,
        approved_at: tossResponse.approvedAt,
      })
      .eq("id", payment.id);

    if (updatePaymentError) {
      console.error("Payment update error:", updatePaymentError);
      // Payment was successful but update failed - this needs manual intervention
      return {
        success: false,
        error: "결제는 완료되었으나 기록 업데이트에 실패했습니다. 고객센터에 문의해주세요.",
      };
    }

    // Update user's credit balance
    const { error: updateUserError } = await supabase
      .from("users")
      .update({ credit_balance: newBalance })
      .eq("clerk_id", clerkId);

    if (updateUserError) {
      console.error("User credit update error:", updateUserError);
      return {
        success: false,
        error: "크레딧 충전에 실패했습니다. 고객센터에 문의해주세요.",
      };
    }

    // Create credit transaction record
    const { error: transactionError } = await supabase
      .from("credit_transactions")
      .insert({
        user_id: clerkId,
        type: "purchase",
        amount: creditsToGrant,
        balance_after: newBalance,
        payment_id: payment.id,
        description: `${pricingTier.display_name} 구매`,
      });

    if (transactionError) {
      console.error("Credit transaction insert error:", transactionError);
      // Non-critical error - credits were added, just logging failed
    }

    return {
      success: true,
      paymentId: payment.id,
      creditsGranted: creditsToGrant,
    };
  } catch (error) {
    console.error("Confirm payment error:", error);
    return {
      success: false,
      error: "결제 처리 중 오류가 발생했습니다.",
    };
  }
}
