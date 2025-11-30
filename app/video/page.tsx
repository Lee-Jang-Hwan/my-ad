import { Suspense } from "react";
import { UploadForm } from "@/components/upload/upload-form";
import { UploadFormSkeleton } from "@/components/upload/upload-form-skeleton";

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
