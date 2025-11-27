"use server";

import { auth } from "@clerk/nextjs/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { USER_ROLES } from "@/lib/constants/credits";

export interface GrantCreditResult {
  success: boolean;
  newBalance?: number;
  error?: string;
}

/**
 * Grant credits to a user (admin only)
 */
export async function grantCredit(
  targetUserId: string,
  amount: number,
  description?: string,
): Promise<GrantCreditResult> {
  try {
    // Check authentication
    const authResult = await auth();
    const adminClerkId = authResult.userId;

    if (!adminClerkId) {
      return {
        success: false,
        error: "로그인이 필요합니다.",
      };
    }

    const supabase = createServiceRoleClient();

    // Check if current user is admin
    const { data: adminUser, error: adminError } = await supabase
      .from("users")
      .select("role")
      .eq("clerk_id", adminClerkId)
      .single();

    if (adminError || !adminUser) {
      return {
        success: false,
        error: "관리자 정보를 찾을 수 없습니다.",
      };
    }

    if (adminUser.role !== USER_ROLES.ADMIN) {
      return {
        success: false,
        error: "관리자 권한이 필요합니다.",
      };
    }

    // Validate amount
    if (amount <= 0) {
      return {
        success: false,
        error: "크레딧 수량은 0보다 커야 합니다.",
      };
    }

    // Get target user's current balance
    const { data: targetUser, error: targetError } = await supabase
      .from("users")
      .select("credit_balance")
      .eq("clerk_id", targetUserId)
      .single();

    if (targetError || !targetUser) {
      return {
        success: false,
        error: "대상 사용자를 찾을 수 없습니다.",
      };
    }

    // Calculate new balance
    const newBalance = targetUser.credit_balance + amount;

    // Update target user's credit balance
    const { error: updateError } = await supabase
      .from("users")
      .update({ credit_balance: newBalance })
      .eq("clerk_id", targetUserId);

    if (updateError) {
      console.error("Credit balance update error:", updateError);
      return {
        success: false,
        error: "크레딧 부여에 실패했습니다.",
      };
    }

    // Create transaction record
    const { error: transactionError } = await supabase
      .from("credit_transactions")
      .insert({
        user_id: targetUserId,
        type: "admin_grant",
        amount: amount,
        balance_after: newBalance,
        granted_by: adminClerkId,
        description: description || "관리자 부여",
      });

    if (transactionError) {
      console.error("Credit transaction insert error:", transactionError);
    }

    return {
      success: true,
      newBalance,
    };
  } catch (error) {
    console.error("Grant credit error:", error);
    return {
      success: false,
      error: "크레딧 부여 중 오류가 발생했습니다.",
    };
  }
}
