"use client";

import dynamic from "next/dynamic";
import type { Storyboard, StoryboardScene } from "@/types/storyboard";

// SSR 비활성화로 Hydration 에러 방지
const StoryboardEditor = dynamic(
  () => import("./storyboard-editor").then((mod) => mod.StoryboardEditor),
  { ssr: false }
);

interface DraftParams {
  productName: string;
  productDescription: string;
  stylePreference: string;
  sceneCount: string;
  referenceImageUrl?: string;
}

interface StoryboardEditorWrapperProps {
  storyboard: Storyboard;
  initialScenes: StoryboardScene[];
  draftParams: DraftParams | null;
}

export function StoryboardEditorWrapper({
  storyboard,
  initialScenes,
  draftParams,
}: StoryboardEditorWrapperProps) {
  return (
    <StoryboardEditor
      storyboard={storyboard}
      initialScenes={initialScenes}
      draftParams={draftParams}
    />
  );
}
