"use server";

import { auth } from "@clerk/nextjs/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { cancelPayment as tossCancelPayment } from "@/lib/tosspayments/server";
import type { CancelPaymentResult } from "@/types/payment";

/**
 * Cancel a payment
 */
export async function cancelPayment(
  paymentId: string,
  cancelReason: string,
): Promise<CancelPaymentResult> {
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

    // Get the payment record
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .select("*")
      .eq("id", paymentId)
      .eq("user_id", clerkId)
      .single();

    if (paymentError || !payment) {
      console.error("Payment lookup error:", paymentError);
      return {
        success: false,
        error: "결제 정보를 찾을 수 없습니다.",
      };
    }

    // Check if payment can be cancelled
    if (payment.status !== "done") {
      return {
        success: false,
        error: "취소할 수 없는 결제입니다.",
      };
    }

    if (!payment.payment_key) {
      return {
        success: false,
        error: "결제 키가 없습니다.",
      };
    }

    // Cancel payment with TossPayments
    try {
      await tossCancelPayment(payment.payment_key, cancelReason);
    } catch (tossError) {
      console.error("TossPayments cancel error:", tossError);
      return {
        success: false,
        error: "결제 취소에 실패했습니다.",
      };
    }

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

    // Calculate new balance (deduct credits that were granted)
    const creditsToDeduct = payment.credits_granted;
    const newBalance = Math.max(0, user.credit_balance - creditsToDeduct);

    // Update payment status
    const { error: updatePaymentError } = await supabase
      .from("payments")
      .update({
        status: "canceled",
        canceled_at: new Date().toISOString(),
      })
      .eq("id", paymentId);

    if (updatePaymentError) {
      console.error("Payment status update error:", updatePaymentError);
    }

    // Update user's credit balance
    const { error: updateUserError } = await supabase
      .from("users")
      .update({ credit_balance: newBalance })
      .eq("clerk_id", clerkId);

    if (updateUserError) {
      console.error("User credit update error:", updateUserError);
    }

    // Create refund transaction record
    const { error: transactionError } = await supabase
      .from("credit_transactions")
      .insert({
        user_id: clerkId,
        type: "refund",
        amount: -creditsToDeduct,
        balance_after: newBalance,
        payment_id: paymentId,
        description: `결제 취소: ${cancelReason}`,
      });

    if (transactionError) {
      console.error("Credit transaction insert error:", transactionError);
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Cancel payment error:", error);
    return {
      success: false,
      error: "결제 취소 중 오류가 발생했습니다.",
    };
  }
}
