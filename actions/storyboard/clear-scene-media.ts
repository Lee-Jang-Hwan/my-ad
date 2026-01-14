"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

interface ClearSceneMediaInput {
  storyboardId: string;
  sceneId: string;
  clearImage?: boolean;
  clearClip?: boolean;
}

interface ClearSceneMediaResult {
  success: boolean;
  error?: string;
}

/**
 * 씬의 생성된 이미지 및/또는 클립 제거
 * - DB에서 URL 필드를 null로 설정
 * - Storage에서 파일 삭제
 */
export async function clearSceneMedia(
  input: ClearSceneMediaInput
): Promise<ClearSceneMediaResult> {
  try {
    const authResult = await auth();
    const clerkId = authResult.userId;

    if (!clerkId) {
      return { success: false, error: "로그인이 필요합니다." };
    }

    const supabase = createClerkSupabaseClient();

    // Verify ownership
    const { data: scene, error: sceneError } = await supabase
      .from("storyboard_scenes")
      .select(`
        id,
        storyboard_id,
        generated_image_url,
        generated_clip_url,
        storyboards!inner(user_id)
      `)
      .eq("id", input.sceneId)
      .single();

    if (sceneError || !scene) {
      return { success: false, error: "씬을 찾을 수 없습니다." };
    }

    const storyboardData = scene.storyboards as unknown as { user_id: string };

    if (storyboardData.user_id !== clerkId) {
      return { success: false, error: "권한이 없습니다." };
    }

    // Service role client for storage operations
    const serviceClient = createServiceRoleClient();

    // Prepare update fields
    const updateFields: Record<string, unknown> = {};
    const deletePromises: Promise<unknown>[] = [];

    // Clear image
    if (input.clearImage && scene.generated_image_url) {
      updateFields.generated_image_url = null;

      // Extract storage path from URL
      // URL format: https://xxx.supabase.co/storage/v1/object/public/images/storyboards/{user_id}/{storyboard_id}/{scene_id}.png
      const imagePath = extractStoragePath(scene.generated_image_url, "images");
      if (imagePath) {
        deletePromises.push(
          serviceClient.storage.from("images").remove([imagePath])
        );
      }
    }

    // Clear clip
    if (input.clearClip && scene.generated_clip_url) {
      updateFields.generated_clip_url = null;

      // URL format: https://xxx.supabase.co/storage/v1/object/public/storyboards/{user_id}/clips/{storyboard_id}/{scene_id}.mp4
      const clipPath = extractStoragePath(scene.generated_clip_url, "storyboards");
      if (clipPath) {
        deletePromises.push(
          serviceClient.storage.from("storyboards").remove([clipPath])
        );
      }
    }

    // Reset generation status if clearing media
    if (input.clearImage || input.clearClip) {
      updateFields.generation_status = "pending";
      updateFields.generation_error = null;
    }

    // Update database
    if (Object.keys(updateFields).length > 0) {
      const { error: updateError } = await supabase
        .from("storyboard_scenes")
        .update(updateFields)
        .eq("id", input.sceneId);

      if (updateError) {
        console.error("Failed to update scene:", updateError);
        return { success: false, error: "씬 업데이트에 실패했습니다." };
      }
    }

    // Delete files from storage (don't fail if storage delete fails)
    if (deletePromises.length > 0) {
      try {
        await Promise.all(deletePromises);
      } catch (storageError) {
        console.warn("Storage delete warning:", storageError);
        // Continue anyway - DB is already updated
      }
    }

    revalidatePath(`/storyboard/${input.storyboardId}`);

    return { success: true };
  } catch (error) {
    console.error("Clear scene media error:", error);
    return { success: false, error: "미디어 제거 중 오류가 발생했습니다." };
  }
}

/**
 * Extract storage path from Supabase Storage URL
 */
function extractStoragePath(url: string, bucketName: string): string | null {
  try {
    // URL patterns:
    // Images: /storage/v1/object/public/images/storyboards/{user_id}/{storyboard_id}/{scene_id}.png
    // Clips: /storage/v1/object/public/storyboards/{user_id}/clips/{storyboard_id}/{scene_id}.mp4

    const pattern = new RegExp(`/storage/v1/object/public/${bucketName}/(.+)$`);
    const match = url.match(pattern);

    if (match && match[1]) {
      return match[1];
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * 씬의 이미지만 제거
 */
export async function clearSceneImage(
  storyboardId: string,
  sceneId: string
): Promise<ClearSceneMediaResult> {
  return clearSceneMedia({
    storyboardId,
    sceneId,
    clearImage: true,
    clearClip: false,
  });
}

/**
 * 씬의 클립만 제거
 */
export async function clearSceneClip(
  storyboardId: string,
  sceneId: string
): Promise<ClearSceneMediaResult> {
  return clearSceneMedia({
    storyboardId,
    sceneId,
    clearImage: false,
    clearClip: true,
  });
}

/**
 * 씬의 이미지와 클립 모두 제거
 */
export async function clearSceneAllMedia(
  storyboardId: string,
  sceneId: string
): Promise<ClearSceneMediaResult> {
  return clearSceneMedia({
    storyboardId,
    sceneId,
    clearImage: true,
    clearClip: true,
  });
}
