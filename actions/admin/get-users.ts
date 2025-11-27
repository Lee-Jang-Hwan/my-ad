"use server";

import { auth } from "@clerk/nextjs/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { USER_ROLES } from "@/lib/constants/credits";

export interface UserData {
  id: string;
  clerk_id: string;
  name: string | null;
  credit_balance: number;
  role: string;
  created_at: string;
}

export interface GetUsersResult {
  success: boolean;
  users: UserData[];
  totalCount: number;
  error?: string;
}

/**
 * Get all users (admin only)
 */
export async function getUsers(
  page: number = 1,
  limit: number = 20,
  search?: string,
): Promise<GetUsersResult> {
  try {
    const authResult = await auth();
    const clerkId = authResult.userId;

    if (!clerkId) {
      return {
        success: false,
        users: [],
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
        users: [],
        totalCount: 0,
        error: "관리자 권한이 필요합니다.",
      };
    }

    // Build query
    let query = supabase
      .from("users")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    // Search by name if provided
    if (search) {
      query = query.ilike("name", `%${search}%`);
    }

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: users, error, count } = await query;

    if (error) {
      console.error("Get users error:", error);
      return {
        success: false,
        users: [],
        totalCount: 0,
        error: "사용자 목록 조회에 실패했습니다.",
      };
    }

    return {
      success: true,
      users: (users as UserData[]) || [],
      totalCount: count || 0,
    };
  } catch (error) {
    console.error("Get users error:", error);
    return {
      success: false,
      users: [],
      totalCount: 0,
      error: "사용자 목록 조회 중 오류가 발생했습니다.",
    };
  }
}

/**
 * Get user statistics (admin only)
 */
export async function getUserStats(): Promise<{
  success: boolean;
  stats?: {
    totalUsers: number;
    adminUsers: number;
    totalCredits: number;
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

    // Get user statistics
    const { data: users, error } = await supabase
      .from("users")
      .select("credit_balance, role");

    if (error) {
      return {
        success: false,
        error: "통계 조회에 실패했습니다.",
      };
    }

    const adminUsers = users?.filter((u) => u.role === USER_ROLES.ADMIN).length || 0;
    const totalCredits = users?.reduce((sum, u) => sum + u.credit_balance, 0) || 0;

    return {
      success: true,
      stats: {
        totalUsers: users?.length || 0,
        adminUsers,
        totalCredits,
      },
    };
  } catch (error) {
    console.error("Get user stats error:", error);
    return {
      success: false,
      error: "통계 조회 중 오류가 발생했습니다.",
    };
  }
}
