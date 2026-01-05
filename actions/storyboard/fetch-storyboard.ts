"use server";

import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import type {
  Storyboard,
  StoryboardScene,
  StoryboardWithScenes,
  StoryboardActionResult,
} from "@/types/storyboard";

export async function fetchStoryboard(
  storyboardId: string
): Promise<StoryboardActionResult<Storyboard>> {
  try {
    const authResult = await auth();
    const clerkId = authResult.userId;

    if (!clerkId) {
      return { success: false, error: "로그인이 필요합니다." };
    }

    const supabase = createClerkSupabaseClient();

    const { data, error } = await supabase
      .from("storyboards")
      .select("*")
      .eq("id", storyboardId)
      .single();

    if (error) {
      console.error("Fetch storyboard error:", error);
      return { success: false, error: "스토리보드를 찾을 수 없습니다." };
    }

    // 소유권 확인
    if (data.user_id !== clerkId) {
      return { success: false, error: "접근 권한이 없습니다." };
    }

    return { success: true, data: data as Storyboard };
  } catch (error) {
    console.error("Fetch storyboard error:", error);
    return { success: false, error: "스토리보드 조회 중 오류가 발생했습니다." };
  }
}

export async function fetchStoryboardWithScenes(
  storyboardId: string
): Promise<StoryboardActionResult<StoryboardWithScenes>> {
  try {
    const authResult = await auth();
    const clerkId = authResult.userId;

    if (!clerkId) {
      return { success: false, error: "로그인이 필요합니다." };
    }

    const supabase = createClerkSupabaseClient();

    // 스토리보드 조회
    const { data: storyboard, error: storyboardError } = await supabase
      .from("storyboards")
      .select("*")
      .eq("id", storyboardId)
      .single();

    if (storyboardError || !storyboard) {
      console.error("Fetch storyboard error:", storyboardError);
      return { success: false, error: "스토리보드를 찾을 수 없습니다." };
    }

    // 소유권 확인
    if (storyboard.user_id !== clerkId) {
      return { success: false, error: "접근 권한이 없습니다." };
    }

    // 씬 조회
    const { data: scenes, error: scenesError } = await supabase
      .from("storyboard_scenes")
      .select("*")
      .eq("storyboard_id", storyboardId)
      .order("scene_order", { ascending: true });

    if (scenesError) {
      console.error("Fetch scenes error:", scenesError);
      return { success: false, error: "씬 정보를 불러올 수 없습니다." };
    }

    return {
      success: true,
      data: {
        ...(storyboard as Storyboard),
        scenes: (scenes || []) as StoryboardScene[],
      },
    };
  } catch (error) {
    console.error("Fetch storyboard with scenes error:", error);
    return { success: false, error: "스토리보드 조회 중 오류가 발생했습니다." };
  }
}

export async function fetchStoryboardScenes(
  storyboardId: string
): Promise<StoryboardActionResult<StoryboardScene[]>> {
  try {
    const authResult = await auth();
    const clerkId = authResult.userId;

    if (!clerkId) {
      return { success: false, error: "로그인이 필요합니다." };
    }

    const supabase = createClerkSupabaseClient();

    // 소유권 확인을 위해 스토리보드 조회
    const { data: storyboard, error: storyboardError } = await supabase
      .from("storyboards")
      .select("user_id")
      .eq("id", storyboardId)
      .single();

    if (storyboardError || !storyboard) {
      return { success: false, error: "스토리보드를 찾을 수 없습니다." };
    }

    if (storyboard.user_id !== clerkId) {
      return { success: false, error: "접근 권한이 없습니다." };
    }

    // 씬 조회
    const { data: scenes, error: scenesError } = await supabase
      .from("storyboard_scenes")
      .select("*")
      .eq("storyboard_id", storyboardId)
      .order("scene_order", { ascending: true });

    if (scenesError) {
      console.error("Fetch scenes error:", scenesError);
      return { success: false, error: "씬 정보를 불러올 수 없습니다." };
    }

    return { success: true, data: (scenes || []) as StoryboardScene[] };
  } catch (error) {
    console.error("Fetch scenes error:", error);
    return { success: false, error: "씬 조회 중 오류가 발생했습니다." };
  }
}
