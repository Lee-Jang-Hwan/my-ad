import { redirect } from "next/navigation";
import { fetchVideo } from "@/actions/fetch-video";
import { GenerationProgress } from "@/components/generation/generation-progress";

interface GenerationPageProps {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Generation progress page route
 * Shows real-time progress of video generation through 8 stages
 * Server Component for initial SSR, then client-side Realtime updates
 */
export default async function GenerationPage({
  params,
}: GenerationPageProps) {
  const { id } = await params;

  // Fetch initial video data (SSR)
  const result = await fetchVideo(id);

  // Handle errors
  if (!result.success || !result.video) {
    // Redirect to upload page if video not found or access denied
    redirect("/upload");
  }

  const video = result.video;

  // If video is already completed, redirect to video page
  if (video.status === "completed" && video.video_url) {
    redirect(`/video/${video.id}`);
  }

  // If video is cancelled or failed, redirect to dashboard
  if (video.status === "cancelled" || video.status === "failed") {
    redirect("/dashboard");
  }

  // Render progress component with initial data
  return <GenerationProgress initialVideo={video} />;
}
