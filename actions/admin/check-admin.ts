"use server";

import { auth } from "@clerk/nextjs/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { USER_ROLES } from "@/lib/constants/credits";

export interface AdminCheckResult {
  success: boolean;
  isAdmin: boolean;
  error?: string;
}

/**
 * Check if the current user is an admin
 */
export async function checkIsAdmin(): Promise<AdminCheckResult> {
  try {
    const authResult = await auth();
    const clerkId = authResult.userId;

    if (!clerkId) {
      return {
        success: false,
        isAdmin: false,
        error: "로그인이 필요합니다.",
      };
    }

    const supabase = createServiceRoleClient();

    const { data: user, error } = await supabase
      .from("users")
      .select("role")
      .eq("clerk_id", clerkId)
      .single();

    if (error || !user) {
      return {
        success: false,
        isAdmin: false,
        error: "사용자 정보를 찾을 수 없습니다.",
      };
    }

    return {
      success: true,
      isAdmin: user.role === USER_ROLES.ADMIN,
    };
  } catch (error) {
    console.error("Check admin error:", error);
    return {
      success: false,
      isAdmin: false,
      error: "관리자 확인 중 오류가 발생했습니다.",
    };
  }
}

/**
 * Set a user's role (admin only)
 */
export async function setUserRole(
  targetUserId: string,
  role: "user" | "admin",
): Promise<{ success: boolean; error?: string }> {
  try {
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

    if (adminError || !adminUser || adminUser.role !== USER_ROLES.ADMIN) {
      return {
        success: false,
        error: "관리자 권한이 필요합니다.",
      };
    }

    // Update target user's role
    const { error: updateError } = await supabase
      .from("users")
      .update({ role })
      .eq("clerk_id", targetUserId);

    if (updateError) {
      console.error("Update role error:", updateError);
      return {
        success: false,
        error: "역할 변경에 실패했습니다.",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Set user role error:", error);
    return {
      success: false,
      error: "역할 변경 중 오류가 발생했습니다.",
    };
  }
}
