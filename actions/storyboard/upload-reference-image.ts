"use server";

import { auth } from "@clerk/nextjs/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";
import { validateImageFile } from "@/lib/validation";

const STORAGE_BUCKET = process.env.NEXT_PUBLIC_STORAGE_BUCKET_IMAGES || "uploads";

export interface UploadReferenceImageResult {
  success: boolean;
  imageUrl?: string;
  storagePath?: string;
  error?: string;
}

/**
 * 스토리보드 참조 이미지 업로드
 *
 * 흐름:
 * 1. 인증 확인
 * 2. 파일 유효성 검사
 * 3. Supabase Storage에 업로드
 * 4. 공개 URL 반환
 */
export async function uploadReferenceImage(
  formData: FormData
): Promise<UploadReferenceImageResult> {
  try {
    // 1. 인증 확인
    const authResult = await auth();
    const clerkId = authResult.userId;

    if (!clerkId) {
      return {
        success: false,
        error: "로그인이 필요합니다.",
      };
    }

    // 2. FormData에서 파일 추출
    const file = formData.get("image") as File;
    if (!file) {
      return {
        success: false,
        error: "이미지 파일을 선택해주세요.",
      };
    }

    // 3. 파일 유효성 검사
    const validation = validateImageFile(file);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error,
      };
    }

    // 4. Supabase Storage에 업로드
    const supabase = getServiceRoleClient();

    const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const storagePath = `${clerkId}/storyboard-references/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("[uploadReferenceImage] Storage upload error:", uploadError);
      return {
        success: false,
        error: "이미지 업로드에 실패했습니다.",
      };
    }

    // 5. 공개 URL 생성
    const { data: publicUrlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(storagePath);

    if (!publicUrlData?.publicUrl) {
      // URL 생성 실패 시 업로드한 파일 삭제
      await supabase.storage.from(STORAGE_BUCKET).remove([storagePath]);
      return {
        success: false,
        error: "이미지 URL 생성에 실패했습니다.",
      };
    }

    console.log("[uploadReferenceImage] Success:", {
      clerkId,
      storagePath: uploadData.path,
      publicUrl: publicUrlData.publicUrl,
    });

    return {
      success: true,
      imageUrl: publicUrlData.publicUrl,
      storagePath: uploadData.path,
    };
  } catch (error) {
    console.error("[uploadReferenceImage] Unexpected error:", error);
    return {
      success: false,
      error: "이미지 업로드 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 스토리보드 참조 이미지 삭제
 */
export async function deleteReferenceImage(
  storagePath: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const authResult = await auth();
    const clerkId = authResult.userId;

    if (!clerkId) {
      return { success: false, error: "로그인이 필요합니다." };
    }

    // 본인 소유 파일인지 확인 (경로에 clerkId가 포함되어야 함)
    if (!storagePath.startsWith(clerkId)) {
      return { success: false, error: "권한이 없습니다." };
    }

    const supabase = getServiceRoleClient();

    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([storagePath]);

    if (error) {
      console.error("[deleteReferenceImage] Delete error:", error);
      return { success: false, error: "이미지 삭제에 실패했습니다." };
    }

    return { success: true };
  } catch (error) {
    console.error("[deleteReferenceImage] Unexpected error:", error);
    return { success: false, error: "이미지 삭제 중 오류가 발생했습니다." };
  }
}
