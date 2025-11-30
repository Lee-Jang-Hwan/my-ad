import { redirect } from "next/navigation";
import { fetchImage } from "@/actions/image/fetch-image";
import { ImageDetail } from "@/components/image-generation/image-detail";

interface ImagePageProps {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Image detail page route
 * Shows the generated ad image with download option
 */
export default async function ImagePage({ params }: ImagePageProps) {
  const { id } = await params;

  // Fetch image data (SSR)
  const result = await fetchImage(id);

  // Handle errors
  if (!result.success || !result.image) {
    // Redirect to dashboard if image not found or access denied
    redirect("/dashboard");
  }

  const image = result.image;

  // If image is not completed, redirect to generation page
  if (image.status !== "completed" || !image.image_url) {
    redirect(`/image-generation/${image.id}`);
  }

  // Render image detail component
  return <ImageDetail image={image} />;
}
