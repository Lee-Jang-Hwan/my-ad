"use server";

import { auth } from "@clerk/nextjs/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { USER_ROLES } from "@/lib/constants/credits";
import type { Payment, PricingTier } from "@/types/payment";

export interface PaymentWithUser extends Payment {
  user?: {
    clerk_id: string;
    name: string | null;
  };
  pricing_tier?: PricingTier | null;
}

export interface GetPaymentsResult {
  success: boolean;
  payments: PaymentWithUser[];
  totalCount: number;
  error?: string;
}

/**
 * Get all payments (admin only)
 */
export async function getPayments(
  page: number = 1,
  limit: number = 20,
  status?: string,
): Promise<GetPaymentsResult> {
  try {
    const authResult = await auth();
    const clerkId = authResult.userId;

    if (!clerkId) {
      return {
        success: false,
        payments: [],
        totalCount: 0,
        error: "로그인이 필요합니다.",
      };
    }

    const supabase = createServiceRoleClient();

    // Check if user is admin
    const { data: adminUser, error: adminError } = await supabase
      .from("users")
      .select("role")
      .eq("clerk_id", clerkId)
      .single();

    if (adminError || !adminUser || adminUser.role !== USER_ROLES.ADMIN) {
      return {
        success: false,
        payments: [],
        totalCount: 0,
        error: "관리자 권한이 필요합니다.",
      };
    }

    // Build query
    let query = supabase
      .from("payments")
      .select(
        `
        *,
        user:users!payments_user_id_fkey(clerk_id, name),
        pricing_tier:pricing_tiers(*)
      `,
        { count: "exact" },
      )
      .order("created_at", { ascending: false });

    // Filter by status if provided
    if (status) {
      query = query.eq("status", status);
    }

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: payments, error, count } = await query;

    if (error) {
      console.error("Get payments error:", error);
      return {
        success: false,
        payments: [],
        totalCount: 0,
        error: "결제 내역 조회에 실패했습니다.",
      };
    }

    return {
      success: true,
      payments: (payments as PaymentWithUser[]) || [],
      totalCount: count || 0,
    };
  } catch (error) {
    console.error("Get payments error:", error);
    return {
      success: false,
      payments: [],
      totalCount: 0,
      error: "결제 내역 조회 중 오류가 발생했습니다.",
    };
  }
}

/**
 * Get payment statistics (admin only)
 */
export async function getPaymentStats(): Promise<{
  success: boolean;
  stats?: {
    totalRevenue: number;
    totalPayments: number;
    completedPayments: number;
    totalCreditsGranted: number;
  };
  error?: string;
}> {
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

    // Check if user is admin
    const { data: adminUser } = await supabase
      .from("users")
      .select("role")
      .eq("clerk_id", clerkId)
      .single();

    if (!adminUser || adminUser.role !== USER_ROLES.ADMIN) {
      return {
        success: false,
        error: "관리자 권한이 필요합니다.",
      };
    }

    // Get statistics
    const { data: payments, error } = await supabase
      .from("payments")
      .select("amount, status, credits_granted");

    if (error) {
      return {
        success: false,
        error: "통계 조회에 실패했습니다.",
      };
    }

    const completedPayments = payments?.filter((p) => p.status === "done") || [];
    const totalRevenue = completedPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalCreditsGranted = completedPayments.reduce(
      (sum, p) => sum + p.credits_granted,
      0,
    );

    return {
      success: true,
      stats: {
        totalRevenue,
        totalPayments: payments?.length || 0,
        completedPayments: completedPayments.length,
        totalCreditsGranted,
      },
    };
  } catch (error) {
    console.error("Get payment stats error:", error);
    return {
      success: false,
      error: "통계 조회 중 오류가 발생했습니다.",
    };
  }
}
