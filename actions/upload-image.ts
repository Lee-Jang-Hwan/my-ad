"use server";

import { auth } from "@clerk/nextjs/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";
import { validateImageFile } from "@/lib/validation";
import type { UploadImageResult } from "@/types/upload";

const STORAGE_BUCKET = process.env.NEXT_PUBLIC_STORAGE_BUCKET_IMAGES || "uploads";

export async function uploadImage(
  formData: FormData
): Promise<UploadImageResult> {
  try {
    // Check authentication
    const authResult = await auth();
    const clerkId = authResult.userId;

    if (!clerkId) {
      return {
        success: false,
        error: "로그인이 필요합니다.",
      };
    }

    // Get file from FormData
    const file = formData.get("image") as File;
    if (!file) {
      return {
        success: false,
        error: "이미지 파일을 선택해주세요.",
      };
    }

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error,
      };
    }

    // Create Supabase client with service role for storage operations
    const supabase = getServiceRoleClient();

    // Generate unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const storagePath = `${clerkId}/images/${fileName}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return {
        success: false,
        error: "이미지 업로드에 실패했습니다.",
      };
    }

    // Ensure user exists in users table (upsert)
    const { error: userUpsertError } = await supabase
      .from("users")
      .upsert(
        {
          clerk_id: clerkId,
          name: "User", // Will be updated by SyncUserProvider later
        },
        {
          onConflict: "clerk_id",
          ignoreDuplicates: true,
        }
      );

    if (userUpsertError) {
      console.error("User upsert error:", userUpsertError);
      console.error("Clerk ID:", clerkId);
      // Cleanup: delete uploaded file
      await supabase.storage.from(STORAGE_BUCKET).remove([storagePath]);
      return {
        success: false,
        error: "사용자 정보 생성에 실패했습니다.",
      };
    }

    // Save metadata to product_images table
    const { data: imageData, error: imageError } = await supabase
      .from("product_images")
      .insert({
        clerk_id: clerkId,
        original_filename: file.name,
        storage_path: storagePath,
        file_size: file.size,
        mime_type: file.type,
      })
      .select("id")
      .single();

    if (imageError || !imageData) {
      console.error("Database insert error:", imageError);
      console.error("Insert data:", {
        clerk_id: clerkId,
        original_filename: file.name,
        storage_path: storagePath,
        file_size: file.size,
        mime_type: file.type,
      });
      // Cleanup: delete uploaded file
      await supabase.storage.from(STORAGE_BUCKET).remove([storagePath]);
      return {
        success: false,
        error: "이미지 정보 저장에 실패했습니다.",
      };
    }

    return {
      success: true,
      imageId: imageData.id,
      storagePath: uploadData.path,
    };
  } catch (error) {
    console.error("Upload image error:", error);
    return {
      success: false,
      error: "이미지 업로드 중 오류가 발생했습니다.",
    };
  }
}
