"use client";

import { StoryboardCard } from "./storyboard-card";
import type { StoryboardListItem } from "@/types/storyboard";

interface StoryboardGridProps {
  storyboards: StoryboardListItem[];
  onStoryboardDeleted?: () => void;
}

export function StoryboardGrid({
  storyboards,
  onStoryboardDeleted,
}: StoryboardGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[repeat(3,370px)] gap-6">
      {storyboards.map((storyboard) => (
        <StoryboardCard
          key={storyboard.id}
          storyboard={storyboard}
          onDeleted={onStoryboardDeleted}
        />
      ))}
    </div>
  );
}
