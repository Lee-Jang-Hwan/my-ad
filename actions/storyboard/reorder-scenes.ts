"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import type { StoryboardActionResult } from "@/types/storyboard";

interface ReorderItem {
  sceneId: string;
  newOrder: number;
}

export async function reorderScenes(
  storyboardId: string,
  reorderItems: ReorderItem[]
): Promise<StoryboardActionResult<void>> {
  try {
    const authResult = await auth();
    const clerkId = authResult.userId;

    if (!clerkId) {
      return { success: false, error: "로그인이 필요합니다." };
    }

    if (!storyboardId) {
      return { success: false, error: "스토리보드 ID가 필요합니다." };
    }

    if (!reorderItems || reorderItems.length === 0) {
      return { success: false, error: "재정렬할 씬이 없습니다." };
    }

    const supabase = createClerkSupabaseClient();

    // 스토리보드 소유권 확인
    const { data: storyboard, error: storyboardError } = await supabase
      .from("storyboards")
      .select("id, user_id")
      .eq("id", storyboardId)
      .single();

    if (storyboardError || !storyboard) {
      return { success: false, error: "스토리보드를 찾을 수 없습니다." };
    }

    if (storyboard.user_id !== clerkId) {
      return { success: false, error: "권한이 없습니다." };
    }

    // 각 씬의 순서 업데이트
    for (const item of reorderItems) {
      const { error } = await supabase
        .from("storyboard_scenes")
        .update({
          scene_order: item.newOrder,
          updated_at: new Date().toISOString(),
        })
        .eq("id", item.sceneId)
        .eq("storyboard_id", storyboardId);

      if (error) {
        console.error("Reorder scene error:", error);
        return { success: false, error: "씬 순서 변경에 실패했습니다." };
      }
    }

    revalidatePath(`/storyboard/${storyboardId}`);

    return { success: true };
  } catch (error) {
    console.error("Reorder scenes error:", error);
    return { success: false, error: "씬 순서 변경 중 오류가 발생했습니다." };
  }
}

export async function moveScene(
  sceneId: string,
  direction: "up" | "down"
): Promise<StoryboardActionResult<void>> {
  try {
    const authResult = await auth();
    const clerkId = authResult.userId;

    if (!clerkId) {
      return { success: false, error: "로그인이 필요합니다." };
    }

    const supabase = createClerkSupabaseClient();

    // 현재 씬 정보 조회
    const { data: currentScene, error: sceneError } = await supabase
      .from("storyboard_scenes")
      .select("id, storyboard_id, scene_order, storyboards!inner(user_id)")
      .eq("id", sceneId)
      .single();

    if (sceneError || !currentScene) {
      return { success: false, error: "씬을 찾을 수 없습니다." };
    }

    const storyboardData = currentScene.storyboards as unknown as { user_id: string };
    if (storyboardData.user_id !== clerkId) {
      return { success: false, error: "권한이 없습니다." };
    }

    const targetOrder =
      direction === "up"
        ? currentScene.scene_order - 1
        : currentScene.scene_order + 1;

    if (targetOrder < 1) {
      return { success: false, error: "이미 첫 번째 씬입니다." };
    }

    // 교환 대상 씬 조회
    const { data: targetScene, error: targetError } = await supabase
      .from("storyboard_scenes")
      .select("id, scene_order")
      .eq("storyboard_id", currentScene.storyboard_id)
      .eq("scene_order", targetOrder)
      .single();

    if (targetError || !targetScene) {
      return {
        success: false,
        error: direction === "up" ? "이미 첫 번째 씬입니다." : "이미 마지막 씬입니다.",
      };
    }

    // 순서 교환
    const now = new Date().toISOString();

    // 현재 씬을 타겟 순서로
    await supabase
      .from("storyboard_scenes")
      .update({ scene_order: targetOrder, updated_at: now })
      .eq("id", currentScene.id);

    // 타겟 씬을 현재 순서로
    await supabase
      .from("storyboard_scenes")
      .update({ scene_order: currentScene.scene_order, updated_at: now })
      .eq("id", targetScene.id);

    revalidatePath(`/storyboard/${currentScene.storyboard_id}`);

    return { success: true };
  } catch (error) {
    console.error("Move scene error:", error);
    return { success: false, error: "씬 이동 중 오류가 발생했습니다." };
  }
}
