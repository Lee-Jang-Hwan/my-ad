"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import type {
  Storyboard,
  UpdateStoryboardInput,
  StoryboardActionResult,
} from "@/types/storyboard";

export async function updateStoryboard(
  storyboardId: string,
  input: UpdateStoryboardInput
): Promise<StoryboardActionResult<Storyboard>> {
  try {
    const authResult = await auth();
    const clerkId = authResult.userId;

    if (!clerkId) {
      return { success: false, error: "로그인이 필요합니다." };
    }

    if (!storyboardId) {
      return { success: false, error: "스토리보드 ID가 필요합니다." };
    }

    // 최소 하나의 필드가 있는지 확인
    if (Object.keys(input).length === 0) {
      return { success: false, error: "수정할 내용이 없습니다." };
    }

    const supabase = createClerkSupabaseClient();

    // 소유권 확인
    const { data: existing, error: fetchError } = await supabase
      .from("storyboards")
      .select("id, user_id")
      .eq("id", storyboardId)
      .single();

    if (fetchError || !existing) {
      return { success: false, error: "스토리보드를 찾을 수 없습니다." };
    }

    if (existing.user_id !== clerkId) {
      return { success: false, error: "수정 권한이 없습니다." };
    }

    // 업데이트 실행
    const { data, error } = await supabase
      .from("storyboards")
      .update({
        ...input,
        updated_at: new Date().toISOString(),
      })
      .eq("id", storyboardId)
      .select()
      .single();

    if (error) {
      console.error("Update storyboard error:", error);
      return { success: false, error: "스토리보드 수정에 실패했습니다." };
    }

    revalidatePath("/storyboard");
    revalidatePath(`/storyboard/${storyboardId}`);

    return { success: true, data: data as Storyboard };
  } catch (error) {
    console.error("Update storyboard error:", error);
    return { success: false, error: "스토리보드 수정 중 오류가 발생했습니다." };
  }
}

export async function updateStoryboardStatus(
  storyboardId: string,
  status: Storyboard["status"],
  progressStage?: Storyboard["progress_stage"],
  errorMessage?: string
): Promise<StoryboardActionResult<void>> {
  try {
    const authResult = await auth();
    const clerkId = authResult.userId;

    if (!clerkId) {
      return { success: false, error: "로그인이 필요합니다." };
    }

    const supabase = createClerkSupabaseClient();

    const updateData: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (progressStage) {
      updateData.progress_stage = progressStage;
    }

    if (errorMessage) {
      updateData.error_message = errorMessage;
    }

    if (status === "completed") {
      updateData.completed_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from("storyboards")
      .update(updateData)
      .eq("id", storyboardId)
      .eq("user_id", clerkId);

    if (error) {
      console.error("Update storyboard status error:", error);
      return { success: false, error: "상태 업데이트에 실패했습니다." };
    }

    revalidatePath("/storyboard");
    revalidatePath(`/storyboard/${storyboardId}`);

    return { success: true };
  } catch (error) {
    console.error("Update storyboard status error:", error);
    return { success: false, error: "상태 업데이트 중 오류가 발생했습니다." };
  }
}
