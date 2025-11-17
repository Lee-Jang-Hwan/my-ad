import { z } from "zod";

// File validation constants
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/jpg",
  "image/webp",
];

// Product name validation schema
export const productNameSchema = z
  .string()
  .min(1, "상품명을 입력해주세요.")
  .max(200, "상품명은 최대 200자까지 입력 가능합니다.")
  .trim();

// Upload form validation schema
export const uploadFormSchema = z.object({
  productName: productNameSchema,
});

export type UploadFormValues = z.infer<typeof uploadFormSchema>;

// File validation helper functions
export function validateFileSize(file: File): boolean {
  return file.size <= MAX_FILE_SIZE;
}

export function validateFileType(file: File): boolean {
  return ACCEPTED_IMAGE_TYPES.includes(file.type);
}

export function validateImageFile(file: File): {
  valid: boolean;
  error?: string;
} {
  if (!validateFileType(file)) {
    return {
      valid: false,
      error: "지원하지 않는 파일 형식입니다. (JPEG, PNG, JPG, WEBP만 가능)",
    };
  }

  if (!validateFileSize(file)) {
    return {
      valid: false,
      error: "파일 크기는 최대 10MB까지 업로드 가능합니다.",
    };
  }

  return { valid: true };
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
}
