"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import type {
  StoryboardScene,
  CreateSceneInput,
  StoryboardActionResult,
} from "@/types/storyboard";

export async function createScene(
  input: CreateSceneInput
): Promise<StoryboardActionResult<StoryboardScene>> {
  try {
    const authResult = await auth();
    const clerkId = authResult.userId;

    if (!clerkId) {
      return { success: false, error: "로그인이 필요합니다." };
    }

    if (!input.storyboard_id) {
      return { success: false, error: "스토리보드 ID가 필요합니다." };
    }

    if (!input.scene_description) {
      return { success: false, error: "씬 설명은 필수입니다." };
    }

    const supabase = createClerkSupabaseClient();

    // 스토리보드 소유권 확인
    const { data: storyboard, error: storyboardError } = await supabase
      .from("storyboards")
      .select("id, user_id")
      .eq("id", input.storyboard_id)
      .single();

    if (storyboardError || !storyboard) {
      return { success: false, error: "스토리보드를 찾을 수 없습니다." };
    }

    if (storyboard.user_id !== clerkId) {
      return { success: false, error: "권한이 없습니다." };
    }

    // scene_order가 없으면 마지막 순서로 설정
    let sceneOrder = input.scene_order;
    if (sceneOrder === undefined) {
      const { count } = await supabase
        .from("storyboard_scenes")
        .select("*", { count: "exact", head: true })
        .eq("storyboard_id", input.storyboard_id);

      sceneOrder = (count || 0) + 1;
    }

    // 씬 생성
    const { data, error } = await supabase
      .from("storyboard_scenes")
      .insert({
        storyboard_id: input.storyboard_id,
        scene_order: sceneOrder,
        scene_name: input.scene_name || `씬 ${sceneOrder}`,
        scene_description: input.scene_description,
        dialogue: input.dialogue || null,
        dialogue_type: input.dialogue_type || "narration",
        visual_prompt: input.visual_prompt || null,
        camera_angle: input.camera_angle || "eye_level",
        camera_movement: input.camera_movement || "static",
        duration_seconds: input.duration_seconds || 3,
        transition_type: input.transition_type || "cut",
        transition_duration: input.transition_duration || 0.5,
        generation_status: "pending",
      })
      .select()
      .single();

    if (error) {
      console.error("Create scene error:", error);
      return { success: false, error: "씬 생성에 실패했습니다." };
    }

    revalidatePath(`/storyboard/${input.storyboard_id}`);

    return { success: true, data: data as StoryboardScene };
  } catch (error) {
    console.error("Create scene error:", error);
    return { success: false, error: "씬 생성 중 오류가 발생했습니다." };
  }
}

export async function createMultipleScenes(
  storyboardId: string,
  scenes: Omit<CreateSceneInput, "storyboard_id">[]
): Promise<StoryboardActionResult<StoryboardScene[]>> {
  try {
    const authResult = await auth();
    const clerkId = authResult.userId;

    if (!clerkId) {
      return { success: false, error: "로그인이 필요합니다." };
    }

    if (!storyboardId) {
      return { success: false, error: "스토리보드 ID가 필요합니다." };
    }

    if (!scenes || scenes.length === 0) {
      return { success: false, error: "생성할 씬이 없습니다." };
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

    // 씬 데이터 준비
    const scenesToInsert = scenes.map((scene, index) => ({
      storyboard_id: storyboardId,
      scene_order: scene.scene_order ?? index + 1,
      scene_name: scene.scene_name || `씬 ${index + 1}`,
      scene_description: scene.scene_description,
      dialogue: scene.dialogue || null,
      dialogue_type: scene.dialogue_type || "narration",
      visual_prompt: scene.visual_prompt || null,
      camera_angle: scene.camera_angle || "eye_level",
      camera_movement: scene.camera_movement || "static",
      duration_seconds: scene.duration_seconds || 3,
      transition_type: scene.transition_type || "cut",
      transition_duration: scene.transition_duration || 0.5,
      generation_status: "pending",
    }));

    // 일괄 삽입
    const { data, error } = await supabase
      .from("storyboard_scenes")
      .insert(scenesToInsert)
      .select();

    if (error) {
      console.error("Create multiple scenes error:", error);
      return { success: false, error: "씬 일괄 생성에 실패했습니다." };
    }

    revalidatePath(`/storyboard/${storyboardId}`);

    return { success: true, data: data as StoryboardScene[] };
  } catch (error) {
    console.error("Create multiple scenes error:", error);
    return { success: false, error: "씬 일괄 생성 중 오류가 발생했습니다." };
  }
}
