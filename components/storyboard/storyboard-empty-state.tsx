"use client";

import Link from "next/link";
import { Film, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { StoryboardStatus } from "@/types/storyboard";

interface FilterParams {
  status?: StoryboardStatus;
  sortBy: "created_at" | "updated_at";
}

interface StoryboardEmptyStateProps {
  filter: FilterParams;
}

export function StoryboardEmptyState({ filter }: StoryboardEmptyStateProps) {
  const hasFilter = !!filter.status;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
        <Film className="w-10 h-10 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold mb-2">
        {hasFilter ? "조건에 맞는 스토리보드가 없습니다" : "스토리보드가 없습니다"}
      </h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        {hasFilter
          ? "필터를 변경하거나 새로운 스토리보드를 만들어보세요."
          : "AI와 함께 첫 번째 스토리보드를 만들어보세요. 일관성 있는 영상 제작이 더욱 쉬워집니다."}
      </p>
      <Link href="/storyboard/new">
        <Button>
          <Plus className="w-4 h-4 mr-2" />새 스토리보드 만들기
        </Button>
      </Link>
    </div>
  );
}
