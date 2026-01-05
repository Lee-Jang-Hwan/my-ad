"use server";

import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type {
  CreateStoryboardInput,
  Storyboard,
  StoryboardActionResult,
} from "@/types/storyboard";

export async function createStoryboard(
  input: CreateStoryboardInput
): Promise<StoryboardActionResult<Storyboard>> {
  try {
    const authResult = await auth();
    const clerkId = authResult.userId;

    if (!clerkId) {
      return { success: false, error: "로그인이 필요합니다." };
    }

    // 입력 검증
    if (!input.title || input.title.trim().length === 0) {
      return { success: false, error: "제목을 입력해주세요." };
    }

    if (input.title.length > 200) {
      return { success: false, error: "제목은 200자 이내로 입력해주세요." };
    }

    if (input.description && input.description.length > 2000) {
      return { success: false, error: "설명은 2000자 이내로 입력해주세요." };
    }

    const supabase = createClerkSupabaseClient();

    const { data, error } = await supabase
      .from("storyboards")
      .insert({
        user_id: clerkId,
        title: input.title.trim(),
        description: input.description?.trim() || null,
        aspect_ratio: input.aspect_ratio || "16:9",
        target_duration: input.target_duration || 30,
        color_grade: input.color_grade || "default",
        status: "draft",
        progress_stage: "init",
      })
      .select()
      .single();

    if (error) {
      console.error("Create storyboard error:", error);
      return { success: false, error: "스토리보드 생성에 실패했습니다." };
    }

    revalidatePath("/storyboard");

    return { success: true, data: data as Storyboard };
  } catch (error) {
    console.error("Create storyboard error:", error);
    return { success: false, error: "스토리보드 생성 중 오류가 발생했습니다." };
  }
}
