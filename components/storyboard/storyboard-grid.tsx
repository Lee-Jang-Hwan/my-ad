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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
