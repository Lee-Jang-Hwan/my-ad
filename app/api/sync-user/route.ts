import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";

// 신규 회원가입 시 지급할 크레딧
const SIGNUP_BONUS_CREDITS = 20;

/**
 * Clerk 사용자를 Supabase users 테이블에 동기화하는 API
 *
 * 클라이언트에서 로그인 후 이 API를 호출하여 사용자 정보를 Supabase에 저장합니다.
 * 이미 존재하는 경우 업데이트하고, 없으면 새로 생성합니다.
 * 신규 사용자의 경우 20크레딧을 자동 지급합니다.
 */
export async function POST() {
  try {
    // Clerk 인증 확인
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Clerk에서 사용자 정보 가져오기
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);

    if (!clerkUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Supabase에 사용자 정보 동기화
    const supabase = getServiceRoleClient();

    // 먼저 사용자가 이미 존재하는지 확인
    const { data: existingUser } = await supabase
      .from("users")
      .select("clerk_id, credit_balance")
      .eq("clerk_id", clerkUser.id)
      .single();

    const isNewUser = !existingUser;

    // 사용자 정보 upsert
    const { data, error } = await supabase
      .from("users")
      .upsert(
        {
          clerk_id: clerkUser.id,
          name:
            clerkUser.fullName ||
            clerkUser.username ||
            clerkUser.emailAddresses[0]?.emailAddress ||
            "Unknown",
          // 신규 사용자인 경우에만 크레딧 설정 (기존 사용자는 기존 값 유지)
          ...(isNewUser && { credit_balance: SIGNUP_BONUS_CREDITS }),
        },
        {
          onConflict: "clerk_id",
        }
      )
      .select()
      .single();

    if (error) {
      console.error("Supabase sync error:", error);
      return NextResponse.json(
        { error: "Failed to sync user", details: error.message },
        { status: 500 }
      );
    }

    // 신규 사용자인 경우 크레딧 트랜잭션 기록 생성
    if (isNewUser) {
      const { error: transactionError } = await supabase
        .from("credit_transactions")
        .insert({
          user_id: clerkUser.id,
          type: "admin_grant",
          amount: SIGNUP_BONUS_CREDITS,
          balance_after: SIGNUP_BONUS_CREDITS,
          description: "회원가입 보너스 크레딧",
        });

      if (transactionError) {
        console.error("Credit transaction insert error:", transactionError);
        // 트랜잭션 기록 실패는 크리티컬하지 않으므로 에러 반환하지 않음
      }
    }

    return NextResponse.json({
      success: true,
      user: data,
      isNewUser,
      ...(isNewUser && { bonusCredits: SIGNUP_BONUS_CREDITS }),
    });
  } catch (error) {
    console.error("Sync user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
