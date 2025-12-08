"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export interface DeleteAccountResult {
  success: boolean;
  error?: string;
}

/**
 * 회원탈퇴 처리
 * 1. Storage 파일 삭제
 * 2. Supabase users 테이블 삭제 (CASCADE로 관련 데이터 자동 삭제)
 * 3. Clerk 사용자 삭제
 */
export async function deleteAccount(): Promise<DeleteAccountResult> {
  try {
    // 1. 인증 확인
    const authResult = await auth();
    const clerkId = authResult.userId;

    if (!clerkId) {
      return {
        success: false,
        error: "로그인이 필요합니다.",
      };
    }

    console.log("🗑️ [DeleteAccount] Starting account deletion for:", clerkId);

    // 2. Service Role 클라이언트 사용 (RLS 우회 필요)
    const supabase = createServiceRoleClient();

    // 3. Storage 파일 삭제 (사용자 폴더 전체)
    try {
      const { data: files, error: listError } = await supabase.storage
        .from("uploads")
        .list(clerkId);

      if (listError) {
        console.error("Storage list error:", listError);
      } else if (files && files.length > 0) {
        const filePaths = files.map((file) => `${clerkId}/${file.name}`);
        const { error: removeError } = await supabase.storage
          .from("uploads")
          .remove(filePaths);

        if (removeError) {
          console.error("Storage remove error:", removeError);
        } else {
          console.log(
            "✅ [DeleteAccount] Storage files deleted:",
            filePaths.length
          );
        }
      }
    } catch (storageError) {
      console.error("Storage deletion error:", storageError);
      // Storage 삭제 실패해도 계속 진행
    }

    // 4. Supabase users 테이블에서 사용자 삭제
    //    (CASCADE로 관련 테이블 자동 삭제:
    //     product_images, product_info, ad_videos, payments, credit_transactions)
    const { error: deleteError } = await supabase
      .from("users")
      .delete()
      .eq("clerk_id", clerkId);

    if (deleteError) {
      console.error("❌ [DeleteAccount] Supabase delete error:", deleteError);
      return {
        success: false,
        error: "데이터 삭제 중 오류가 발생했습니다.",
      };
    }

    console.log("✅ [DeleteAccount] Supabase user deleted");

    // 5. Clerk 사용자 삭제
    try {
      const clerk = await clerkClient();
      await clerk.users.deleteUser(clerkId);
      console.log("✅ [DeleteAccount] Clerk user deleted");
    } catch (clerkError) {
      console.error("❌ [DeleteAccount] Clerk delete error:", clerkError);
      // Supabase 데이터는 이미 삭제되었으므로 경고만 로그
      // Clerk 삭제 실패 시에도 성공으로 처리 (데이터는 삭제됨)
    }

    console.log("✅ [DeleteAccount] Account deletion completed for:", clerkId);

    return {
      success: true,
    };
  } catch (error) {
    console.error("❌ [DeleteAccount] Unexpected error:", error);
    return {
      success: false,
      error: "회원탈퇴 처리 중 오류가 발생했습니다.",
    };
  }
}
