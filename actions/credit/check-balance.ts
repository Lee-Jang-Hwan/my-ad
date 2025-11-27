"use server";

import { auth } from "@clerk/nextjs/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { VIDEO_GENERATION_COST, USER_ROLES } from "@/lib/constants/credits";

export interface CreditBalanceResult {
  success: boolean;
  balance?: number;
  isAdmin?: boolean;
  canGenerate?: boolean;
  error?: string;
}

/**
 * Get user's credit balance and check if they can generate a video
 */
export async function checkCreditBalance(): Promise<CreditBalanceResult> {
  try {
    const authResult = await auth();
    const clerkId = authResult.userId;

    if (!clerkId) {
      return {
        success: false,
        error: "로그인이 필요합니다.",
      };
    }

    const supabase = createServiceRoleClient();

    const { data: user, error } = await supabase
      .from("users")
      .select("credit_balance, role")
      .eq("clerk_id", clerkId)
      .single();

    if (error || !user) {
      console.error("User lookup error:", error);
      return {
        success: false,
        error: "사용자 정보를 찾을 수 없습니다.",
      };
    }

    const isAdmin = user.role === USER_ROLES.ADMIN;
    const canGenerate = isAdmin || user.credit_balance >= VIDEO_GENERATION_COST;

    return {
      success: true,
      balance: user.credit_balance,
      isAdmin,
      canGenerate,
    };
  } catch (error) {
    console.error("Check credit balance error:", error);
    return {
      success: false,
      error: "크레딧 잔액 조회 중 오류가 발생했습니다.",
    };
  }
}

/**
 * Get user's credit transaction history
 */
export async function getCreditHistory(limit: number = 10) {
  try {
    const authResult = await auth();
    const clerkId = authResult.userId;

    if (!clerkId) {
      return {
        success: false,
        error: "로그인이 필요합니다.",
        transactions: [],
      };
    }

    const supabase = createServiceRoleClient();

    const { data: transactions, error } = await supabase
      .from("credit_transactions")
      .select("*")
      .eq("user_id", clerkId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Credit history lookup error:", error);
      return {
        success: false,
        error: "거래 내역 조회에 실패했습니다.",
        transactions: [],
      };
    }

    return {
      success: true,
      transactions: transactions || [],
    };
  } catch (error) {
    console.error("Get credit history error:", error);
    return {
      success: false,
      error: "거래 내역 조회 중 오류가 발생했습니다.",
      transactions: [],
    };
  }
}
