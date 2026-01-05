"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import type { StoryboardActionResult } from "@/types/storyboard";

export async function deleteScene(
  sceneId: string
): Promise<StoryboardActionResult<void>> {
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

    // 씬 조회 및 스토리보드 소유권 확인
    const { data: scene, error: sceneError } = await supabase
      .from("storyboard_scenes")
      .select(
        "id, storyboard_id, scene_order, generated_image_url, generated_clip_url, storyboards!inner(user_id)"
      )
      .eq("id", sceneId)
      .single();

    if (sceneError || !scene) {
      return { success: false, error: "씬을 찾을 수 없습니다." };
    }

    const storyboardData = scene.storyboards as unknown as { user_id: string };
    if (storyboardData.user_id !== clerkId) {
      return { success: false, error: "삭제 권한이 없습니다." };
    }

    // Storage에서 관련 파일 삭제
    const serviceClient = createServiceRoleClient();
    const storagePath = `${clerkId}/storyboards/${scene.storyboard_id}`;

    // 이미지 파일 삭제
    if (scene.generated_image_url) {
      await serviceClient.storage
        .from("storyboards")
        .remove([`${storagePath}/images/${sceneId}.png`]);
    }

    // 클립 파일 삭제
    if (scene.generated_clip_url) {
      await serviceClient.storage
        .from("storyboards")
        .remove([`${storagePath}/clips/${sceneId}.mp4`]);
    }

    // 씬 삭제
    const { error: deleteError } = await supabase
      .from("storyboard_scenes")
      .delete()
      .eq("id", sceneId);

    if (deleteError) {
      console.error("Delete scene error:", deleteError);
      return { success: false, error: "씬 삭제에 실패했습니다." };
    }

    // 삭제된 씬 이후의 씬들 순서 재정렬
    const { error: reorderError } = await supabase.rpc("reorder_scenes_after_delete", {
      p_storyboard_id: scene.storyboard_id,
      p_deleted_order: scene.scene_order,
    });

    // reorder RPC가 없으면 수동으로 처리
    if (reorderError) {
      // 삭제된 씬보다 큰 순서의 씬들을 조회하여 순서 감소
      const { data: laterScenes } = await supabase
        .from("storyboard_scenes")
        .select("id, scene_order")
        .eq("storyboard_id", scene.storyboard_id)
        .gt("scene_order", scene.scene_order)
        .order("scene_order", { ascending: true });

      if (laterScenes) {
        for (const laterScene of laterScenes) {
          await supabase
            .from("storyboard_scenes")
            .update({ scene_order: laterScene.scene_order - 1 })
            .eq("id", laterScene.id);
        }
      }
    }

    revalidatePath(`/storyboard/${scene.storyboard_id}`);

    return { success: true };
  } catch (error) {
    console.error("Delete scene error:", error);
    return { success: false, error: "씬 삭제 중 오류가 발생했습니다." };
  }
}

export async function deleteMultipleScenes(
  sceneIds: string[]
): Promise<StoryboardActionResult<void>> {
  try {
    const authResult = await auth();
    const clerkId = authResult.userId;

    if (!clerkId) {
      return { success: false, error: "로그인이 필요합니다." };
    }

    if (!sceneIds || sceneIds.length === 0) {
      return { success: false, error: "삭제할 씬이 없습니다." };
    }

    const supabase = createClerkSupabaseClient();

    // 첫 번째 씬으로 스토리보드 정보 확인
    const { data: firstScene, error: sceneError } = await supabase
      .from("storyboard_scenes")
      .select("storyboard_id, storyboards!inner(user_id)")
      .eq("id", sceneIds[0])
      .single();

    if (sceneError || !firstScene) {
      return { success: false, error: "씬을 찾을 수 없습니다." };
    }

    const storyboardData = firstScene.storyboards as unknown as { user_id: string };
    if (storyboardData.user_id !== clerkId) {
      return { success: false, error: "삭제 권한이 없습니다." };
    }

    const storyboardId = firstScene.storyboard_id;

    // 모든 씬 삭제
    const { error: deleteError } = await supabase
      .from("storyboard_scenes")
      .delete()
      .in("id", sceneIds);

    if (deleteError) {
      console.error("Delete multiple scenes error:", deleteError);
      return { success: false, error: "씬 일괄 삭제에 실패했습니다." };
    }

    // 남은 씬들의 순서 재정렬
    const { data: remainingScenes } = await supabase
      .from("storyboard_scenes")
      .select("id")
      .eq("storyboard_id", storyboardId)
      .order("scene_order", { ascending: true });

    if (remainingScenes) {
      for (let i = 0; i < remainingScenes.length; i++) {
        await supabase
          .from("storyboard_scenes")
          .update({ scene_order: i + 1 })
          .eq("id", remainingScenes[i].id);
      }
    }

    revalidatePath(`/storyboard/${storyboardId}`);

    return { success: true };
  } catch (error) {
    console.error("Delete multiple scenes error:", error);
    return { success: false, error: "씬 일괄 삭제 중 오류가 발생했습니다." };
  }
}
