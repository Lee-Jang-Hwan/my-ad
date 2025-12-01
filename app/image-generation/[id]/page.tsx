import { redirect } from "next/navigation";
import { fetchImage } from "@/actions/image/fetch-image";
import { ImageGenerationProgress } from "@/components/image-generation/image-generation-progress";

interface ImageGenerationPageProps {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Image generation progress page route
 * Shows real-time progress of image generation through 4 stages
 * Server Component for initial SSR, then client-side Realtime updates
 */
export default async function ImageGenerationPage({
  params,
}: ImageGenerationPageProps) {
  const { id } = await params;

  // Fetch initial image data (SSR)
  const result = await fetchImage(id);

  // Handle errors
  if (!result.success || !result.image) {
    // Redirect to upload page if image not found or access denied
    redirect("/image");
  }

  const image = result.image;

  // If image is already completed, redirect to image page
  if (image.status === "completed" && image.image_url) {
    redirect(`/image/${image.id}`);
  }

  // If image is cancelled or failed, redirect to dashboard
  if (image.status === "cancelled" || image.status === "failed") {
    redirect("/dashboard");
  }

  // Render progress component with initial data
  return <ImageGenerationProgress initialImage={image} />;
}
