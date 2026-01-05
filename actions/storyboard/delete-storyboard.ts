"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import type { StoryboardActionResult } from "@/types/storyboard";

export async function deleteStoryboard(
  storyboardId: string
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
      return { success: false, error: "삭제 권한이 없습니다." };
    }

    // Storage에서 관련 파일들 삭제 (service role 사용)
    const serviceClient = createServiceRoleClient();
    const storagePath = `${clerkId}/storyboards/${storyboardId}`;

    // 이미지 폴더 삭제
    const { data: imageFiles } = await serviceClient.storage
      .from("storyboards")
      .list(`${storagePath}/images`);

    if (imageFiles && imageFiles.length > 0) {
      const imagePaths = imageFiles.map(
        (file) => `${storagePath}/images/${file.name}`
      );
      await serviceClient.storage.from("storyboards").remove(imagePaths);
    }

    // 클립 폴더 삭제
    const { data: clipFiles } = await serviceClient.storage
      .from("storyboards")
      .list(`${storagePath}/clips`);

    if (clipFiles && clipFiles.length > 0) {
      const clipPaths = clipFiles.map(
        (file) => `${storagePath}/clips/${file.name}`
      );
      await serviceClient.storage.from("storyboards").remove(clipPaths);
    }

    // 최종 영상 폴더 삭제
    const { data: finalFiles } = await serviceClient.storage
      .from("storyboards")
      .list(`${storagePath}/final`);

    if (finalFiles && finalFiles.length > 0) {
      const finalPaths = finalFiles.map(
        (file) => `${storagePath}/final/${file.name}`
      );
      await serviceClient.storage.from("storyboards").remove(finalPaths);
    }

    // 레퍼런스 이미지 폴더 삭제
    const { data: refFiles } = await serviceClient.storage
      .from("storyboards")
      .list(`${storagePath}/references`);

    if (refFiles && refFiles.length > 0) {
      const refPaths = refFiles.map(
        (file) => `${storagePath}/references/${file.name}`
      );
      await serviceClient.storage.from("storyboards").remove(refPaths);
    }

    // 썸네일 폴더 삭제
    const { data: thumbFiles } = await serviceClient.storage
      .from("storyboards")
      .list(`${storagePath}/thumbnails`);

    if (thumbFiles && thumbFiles.length > 0) {
      const thumbPaths = thumbFiles.map(
        (file) => `${storagePath}/thumbnails/${file.name}`
      );
      await serviceClient.storage.from("storyboards").remove(thumbPaths);
    }

    // 데이터베이스에서 삭제 (CASCADE로 scenes, logs도 삭제됨)
    const { error } = await supabase
      .from("storyboards")
      .delete()
      .eq("id", storyboardId);

    if (error) {
      console.error("Delete storyboard error:", error);
      return { success: false, error: "스토리보드 삭제에 실패했습니다." };
    }

    revalidatePath("/storyboard");

    return { success: true };
  } catch (error) {
    console.error("Delete storyboard error:", error);
    return { success: false, error: "스토리보드 삭제 중 오류가 발생했습니다." };
  }
}
