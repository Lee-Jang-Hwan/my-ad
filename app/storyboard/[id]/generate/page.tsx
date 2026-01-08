import { redirect, notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { fetchStoryboardWithScenes } from "@/actions/storyboard";
import { GenerationProgress } from "@/components/storyboard/generation-progress";

interface GenerationPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Storyboard generation progress page
 * Shows real-time progress of AI generation
 */
export default async function GenerationPage({
  params,
}: GenerationPageProps) {
  // Check authentication
  const authResult = await auth();
  if (!authResult.userId) {
    redirect("/sign-in");
  }

  const { id } = await params;

  // Fetch storyboard with scenes
  const result = await fetchStoryboardWithScenes(id);

  if (!result.success || !result.data) {
    notFound();
  }

  const { scenes, ...storyboard } = result.data;

  // If already completed, redirect to editor
  if (storyboard.status === "completed") {
    redirect(`/storyboard/${id}`);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <GenerationProgress
        storyboard={storyboard}
        initialScenes={scenes}
      />
    </div>
  );
}
