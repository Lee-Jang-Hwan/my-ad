"use server";

import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { VIDEO_GENERATION_COST, USER_ROLES } from "@/lib/constants/credits";

export interface DeductCreditResult {
  success: boolean;
  newBalance?: number;
  error?: string;
  insufficientCredits?: boolean;
}

/**
 * Deduct credits for video generation
 * This is called internally from trigger-n8n.ts, not directly from client
 */
export async function deductCredit(
  clerkId: string,
  adVideoId: string,
): Promise<DeductCreditResult> {
  try {
    const supabase = createServiceRoleClient();

    // Get user's current balance and role
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("credit_balance, role")
      .eq("clerk_id", clerkId)
      .single();

    if (userError || !user) {
      console.error("User lookup error:", userError);
      return {
        success: false,
        error: "사용자 정보를 찾을 수 없습니다.",
      };
    }

    // Admin users don't need credits
    if (user.role === USER_ROLES.ADMIN) {
      return {
        success: true,
        newBalance: user.credit_balance,
      };
    }

    // Check if user has enough credits
    if (user.credit_balance < VIDEO_GENERATION_COST) {
      return {
        success: false,
        error: "크레딧이 부족합니다.",
        insufficientCredits: true,
      };
    }

    // Calculate new balance
    const newBalance = user.credit_balance - VIDEO_GENERATION_COST;

    // Update user's credit balance
    const { error: updateError } = await supabase
      .from("users")
      .update({ credit_balance: newBalance })
      .eq("clerk_id", clerkId);

    if (updateError) {
      console.error("Credit balance update error:", updateError);
      return {
        success: false,
        error: "크레딧 차감에 실패했습니다.",
      };
    }

    // Create transaction record
    const { error: transactionError } = await supabase
      .from("credit_transactions")
      .insert({
        user_id: clerkId,
        type: "usage",
        amount: -VIDEO_GENERATION_COST,
        balance_after: newBalance,
        ad_video_id: adVideoId,
        description: "영상 생성",
      });

    if (transactionError) {
      console.error("Credit transaction insert error:", transactionError);
      // Non-critical error - credits were deducted, just logging failed
    }

    return {
      success: true,
      newBalance,
    };
  } catch (error) {
    console.error("Deduct credit error:", error);
    return {
      success: false,
      error: "크레딧 차감 중 오류가 발생했습니다.",
    };
  }
}

/**
 * Refund credits for failed video generation
 */
export async function refundCredit(
  clerkId: string,
  adVideoId: string,
): Promise<DeductCreditResult> {
  try {
    const supabase = createServiceRoleClient();

    // Get user's current balance
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("credit_balance, role")
      .eq("clerk_id", clerkId)
      .single();

    if (userError || !user) {
      console.error("User lookup error:", userError);
      return {
        success: false,
        error: "사용자 정보를 찾을 수 없습니다.",
      };
    }

    // Admin users don't need refund
    if (user.role === USER_ROLES.ADMIN) {
      return {
        success: true,
        newBalance: user.credit_balance,
      };
    }

    // Calculate new balance (refund)
    const newBalance = user.credit_balance + VIDEO_GENERATION_COST;

    // Update user's credit balance
    const { error: updateError } = await supabase
      .from("users")
      .update({ credit_balance: newBalance })
      .eq("clerk_id", clerkId);

    if (updateError) {
      console.error("Credit balance update error:", updateError);
      return {
        success: false,
        error: "크레딧 환불에 실패했습니다.",
      };
    }

    // Create transaction record
    const { error: transactionError } = await supabase
      .from("credit_transactions")
      .insert({
        user_id: clerkId,
        type: "refund",
        amount: VIDEO_GENERATION_COST,
        balance_after: newBalance,
        ad_video_id: adVideoId,
        description: "영상 생성 실패로 인한 환불",
      });

    if (transactionError) {
      console.error("Credit transaction insert error:", transactionError);
    }

    return {
      success: true,
      newBalance,
    };
  } catch (error) {
    console.error("Refund credit error:", error);
    return {
      success: false,
      error: "크레딧 환불 중 오류가 발생했습니다.",
    };
  }
}
