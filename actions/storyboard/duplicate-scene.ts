"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import type {
  StoryboardScene,
  StoryboardActionResult,
} from "@/types/storyboard";

export async function duplicateScene(
  sceneId: string,
  insertAfter: boolean = true
): Promise<StoryboardActionResult<StoryboardScene>> {
  try {
    const authResult = await auth();
    const clerkId = authResult.userId;

    if (!clerkId) {
      return { success: false, error: "로그인이 필요합니다." };
    }

    if (!sceneId) {
      return { success: false, error: "씬 ID가 필요합니다." };
    }

    const supabase = createClerkSupabaseClient();

    // 원본 씬 조회
    const { data: originalScene, error: sceneError } = await supabase
      .from("storyboard_scenes")
      .select("*, storyboards!inner(user_id)")
      .eq("id", sceneId)
      .single();

    if (sceneError || !originalScene) {
      return { success: false, error: "씬을 찾을 수 없습니다." };
    }

    const storyboardData = originalScene.storyboards as unknown as { user_id: string };
    if (storyboardData.user_id !== clerkId) {
      return { success: false, error: "권한이 없습니다." };
    }

    // 새 씬의 순서 결정
    const newOrder = insertAfter
      ? originalScene.scene_order + 1
      : originalScene.scene_order;

    // insertAfter=true면 그 뒤의 씬들, insertAfter=false면 현재 씬 포함 뒤의 씬들 순서 증가
    const orderThreshold = insertAfter
      ? originalScene.scene_order
      : originalScene.scene_order - 1;

    // 뒤의 씬들 순서 증가
    const { data: laterScenes } = await supabase
      .from("storyboard_scenes")
      .select("id, scene_order")
      .eq("storyboard_id", originalScene.storyboard_id)
      .gt("scene_order", orderThreshold)
      .order("scene_order", { ascending: false });

    if (laterScenes) {
      for (const scene of laterScenes) {
        await supabase
          .from("storyboard_scenes")
          .update({ scene_order: scene.scene_order + 1 })
          .eq("id", scene.id);
      }
    }

    // 복제 씬 생성 (생성된 이미지/클립 URL은 제외)
    const { data: newScene, error: insertError } = await supabase
      .from("storyboard_scenes")
      .insert({
        storyboard_id: originalScene.storyboard_id,
        scene_order: newOrder,
        scene_name: `${originalScene.scene_name || "씬"} (복사)`,
        scene_description: originalScene.scene_description,
        dialogue: originalScene.dialogue,
        dialogue_type: originalScene.dialogue_type,
        visual_prompt: originalScene.visual_prompt,
        reference_image_url: originalScene.reference_image_url,
        camera_angle: originalScene.camera_angle,
        camera_movement: originalScene.camera_movement,
        duration_seconds: originalScene.duration_seconds,
        transition_type: originalScene.transition_type,
        transition_duration: originalScene.transition_duration,
        bgm_id: originalScene.bgm_id,
        bgm_volume: originalScene.bgm_volume,
        sfx_id: originalScene.sfx_id,
        subtitle_style: originalScene.subtitle_style,
        generation_status: "pending", // 새로 생성해야 하므로 pending
        generated_image_url: null,
        generated_clip_url: null,
        generation_error: null,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Duplicate scene error:", insertError);
      return { success: false, error: "씬 복제에 실패했습니다." };
    }

    revalidatePath(`/storyboard/${originalScene.storyboard_id}`);

    return { success: true, data: newScene as StoryboardScene };
  } catch (error) {
    console.error("Duplicate scene error:", error);
    return { success: false, error: "씬 복제 중 오류가 발생했습니다." };
  }
}
