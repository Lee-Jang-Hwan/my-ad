"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import type {
  StoryboardScene,
  UpdateSceneInput,
  StoryboardActionResult,
} from "@/types/storyboard";

export async function updateScene(
  sceneId: string,
  input: UpdateSceneInput
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

    if (Object.keys(input).length === 0) {
      return { success: false, error: "수정할 내용이 없습니다." };
    }

    const supabase = createClerkSupabaseClient();

    // 씬 조회 및 스토리보드 소유권 확인
    const { data: scene, error: sceneError } = await supabase
      .from("storyboard_scenes")
      .select("id, storyboard_id, storyboards!inner(user_id)")
      .eq("id", sceneId)
      .single();

    if (sceneError || !scene) {
      return { success: false, error: "씬을 찾을 수 없습니다." };
    }

    const storyboardData = scene.storyboards as unknown as { user_id: string };
    if (storyboardData.user_id !== clerkId) {
      return { success: false, error: "수정 권한이 없습니다." };
    }

    // 업데이트 실행
    const { data, error } = await supabase
      .from("storyboard_scenes")
      .update({
        ...input,
        updated_at: new Date().toISOString(),
      })
      .eq("id", sceneId)
      .select()
      .single();

    if (error) {
      console.error("Update scene error:", error);
      return { success: false, error: "씬 수정에 실패했습니다." };
    }

    revalidatePath(`/storyboard/${scene.storyboard_id}`);

    return { success: true, data: data as StoryboardScene };
  } catch (error) {
    console.error("Update scene error:", error);
    return { success: false, error: "씬 수정 중 오류가 발생했습니다." };
  }
}

export async function updateSceneGenerationStatus(
  sceneId: string,
  status: StoryboardScene["generation_status"],
  urls?: {
    generated_image_url?: string;
    generated_clip_url?: string;
  },
  errorMessage?: string
): Promise<StoryboardActionResult<void>> {
  try {
    const authResult = await auth();
    const clerkId = authResult.userId;

    if (!clerkId) {
      return { success: false, error: "로그인이 필요합니다." };
    }

    const supabase = createClerkSupabaseClient();

    // 씬 조회 및 소유권 확인
    const { data: scene, error: sceneError } = await supabase
      .from("storyboard_scenes")
      .select("id, storyboard_id, storyboards!inner(user_id)")
      .eq("id", sceneId)
      .single();

    if (sceneError || !scene) {
      return { success: false, error: "씬을 찾을 수 없습니다." };
    }

    const storyboardData = scene.storyboards as unknown as { user_id: string };
    if (storyboardData.user_id !== clerkId) {
      return { success: false, error: "권한이 없습니다." };
    }

    const updateData: Record<string, unknown> = {
      generation_status: status,
      updated_at: new Date().toISOString(),
    };

    if (urls?.generated_image_url) {
      updateData.generated_image_url = urls.generated_image_url;
    }

    if (urls?.generated_clip_url) {
      updateData.generated_clip_url = urls.generated_clip_url;
    }

    if (errorMessage) {
      updateData.generation_error = errorMessage;
    }

    const { error } = await supabase
      .from("storyboard_scenes")
      .update(updateData)
      .eq("id", sceneId);

    if (error) {
      console.error("Update scene generation status error:", error);
      return { success: false, error: "상태 업데이트에 실패했습니다." };
    }

    revalidatePath(`/storyboard/${scene.storyboard_id}`);

    return { success: true };
  } catch (error) {
    console.error("Update scene generation status error:", error);
    return { success: false, error: "상태 업데이트 중 오류가 발생했습니다." };
  }
}
