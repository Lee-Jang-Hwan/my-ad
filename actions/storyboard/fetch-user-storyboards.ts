"use server";

import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import type {
  StoryboardListItem,
  StoryboardStatus,
  StoryboardActionResult,
} from "@/types/storyboard";

interface FetchUserStoryboardsOptions {
  status?: StoryboardStatus;
  limit?: number;
  offset?: number;
  orderBy?: "created_at" | "updated_at";
  orderDirection?: "asc" | "desc";
}

interface FetchUserStoryboardsResult {
  storyboards: StoryboardListItem[];
  total: number;
  hasMore: boolean;
}

export async function fetchUserStoryboards(
  options: FetchUserStoryboardsOptions = {}
): Promise<StoryboardActionResult<FetchUserStoryboardsResult>> {
  try {
    const authResult = await auth();
    const clerkId = authResult.userId;

    if (!clerkId) {
      return { success: false, error: "로그인이 필요합니다." };
    }

    const {
      status,
      limit = 12,
      offset = 0,
      orderBy = "created_at",
      orderDirection = "desc",
    } = options;

    const supabase = createClerkSupabaseClient();

    // 기본 쿼리
    let query = supabase
      .from("storyboards")
      .select(
        "id, title, description, status, progress_stage, total_scenes, final_thumbnail_url, created_at, updated_at",
        { count: "exact" }
      )
      .eq("user_id", clerkId);

    // 상태 필터
    if (status) {
      query = query.eq("status", status);
    }

    // 정렬
    query = query.order(orderBy, { ascending: orderDirection === "asc" });

    // 페이지네이션
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error("Fetch user storyboards error:", error);
      return { success: false, error: "스토리보드 목록을 불러올 수 없습니다." };
    }

    const total = count || 0;
    const hasMore = offset + limit < total;

    return {
      success: true,
      data: {
        storyboards: (data || []) as StoryboardListItem[],
        total,
        hasMore,
      },
    };
  } catch (error) {
    console.error("Fetch user storyboards error:", error);
    return { success: false, error: "스토리보드 목록 조회 중 오류가 발생했습니다." };
  }
}

export async function fetchUserStoryboardsCount(): Promise<
  StoryboardActionResult<{ total: number; byStatus: Record<StoryboardStatus, number> }>
> {
  try {
    const authResult = await auth();
    const clerkId = authResult.userId;

    if (!clerkId) {
      return { success: false, error: "로그인이 필요합니다." };
    }

    const supabase = createClerkSupabaseClient();

    // 전체 개수
    const { count: total, error: totalError } = await supabase
      .from("storyboards")
      .select("*", { count: "exact", head: true })
      .eq("user_id", clerkId);

    if (totalError) {
      console.error("Fetch count error:", totalError);
      return { success: false, error: "개수 조회에 실패했습니다." };
    }

    // 상태별 개수
    const statuses: StoryboardStatus[] = ["draft", "generating", "completed", "failed"];
    const byStatus: Record<StoryboardStatus, number> = {
      draft: 0,
      generating: 0,
      completed: 0,
      failed: 0,
    };

    for (const status of statuses) {
      const { count, error } = await supabase
        .from("storyboards")
        .select("*", { count: "exact", head: true })
        .eq("user_id", clerkId)
        .eq("status", status);

      if (!error) {
        byStatus[status] = count || 0;
      }
    }

    return {
      success: true,
      data: {
        total: total || 0,
        byStatus,
      },
    };
  } catch (error) {
    console.error("Fetch storyboards count error:", error);
    return { success: false, error: "개수 조회 중 오류가 발생했습니다." };
  }
}
