import { Suspense } from "react";
import { UploadForm } from "@/components/upload/upload-form";
import { UploadFormSkeleton } from "@/components/upload/upload-form-skeleton";

// Server Actions 타임아웃을 3분(180초)으로 설정
// 광고문구 생성 시 네트워크 환경에 따라 지연될 수 있음
export const maxDuration = 180;

/**
 * Video creation page - allows users to upload product images and create videos
 * Uses Suspense boundary with loading skeleton for better UX
 */
export default function VideoPage() {
  return (
    <Suspense fallback={<UploadFormSkeleton />}>
      <UploadForm />
    </Suspense>
  );
}
