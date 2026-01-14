import { redirect, notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { fetchStoryboardWithScenes } from "@/actions/storyboard";
import { StoryboardEditorWrapper } from "@/components/storyboard/storyboard-editor-wrapper";

interface StoryboardEditorPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    productName?: string;
    productDescription?: string;
    stylePreference?: string;
    sceneCount?: string;
    generateDraft?: string;
    referenceImageUrl?: string;
  }>;
}

/**
 * Storyboard editor page
 * Main editing interface for creating and modifying storyboards
 */
export default async function StoryboardEditorPage({
  params,
  searchParams,
}: StoryboardEditorPageProps) {
  // Check authentication
  const authResult = await auth();
  if (!authResult.userId) {
    redirect("/sign-in");
  }

  const { id } = await params;
  const search = await searchParams;

  // Fetch storyboard with scenes
  const result = await fetchStoryboardWithScenes(id);

  if (!result.success || !result.data) {
    notFound();
  }

  const { scenes, ...storyboard } = result.data;

  // Check if we need to generate AI draft
  const shouldGenerateDraft =
    search.generateDraft === "true" &&
    scenes.length === 0 &&
    storyboard.progress_stage === "init";

  // Draft generation params
  const draftParams = shouldGenerateDraft
    ? {
        productName: search.productName || storyboard.title,
        productDescription: search.productDescription || storyboard.description || "",
        stylePreference: search.stylePreference || "",
        sceneCount: search.sceneCount || "5",
        referenceImageUrl: search.referenceImageUrl,
      }
    : null;

  return (
    <StoryboardEditorWrapper
      storyboard={storyboard}
      initialScenes={scenes}
      draftParams={draftParams}
    />
  );
}
