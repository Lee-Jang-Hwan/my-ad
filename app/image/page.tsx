import { Suspense } from "react";
import { ImageUploadForm } from "@/components/upload-image/image-upload-form";
import { UploadFormSkeleton } from "@/components/upload/upload-form-skeleton";

/**
 * Image Upload page - allows users to upload product images and create ad images
 * Uses Suspense boundary with loading skeleton for better UX
 */
export default function ImagePage() {
  return (
    <Suspense fallback={<UploadFormSkeleton />}>
      <ImageUploadForm />
    </Suspense>
  );
}
