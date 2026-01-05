"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STORYBOARD_STATUS_LABELS, type StoryboardStatus } from "@/types/storyboard";

interface FilterParams {
  status?: StoryboardStatus;
  sortBy: "created_at" | "updated_at";
}

interface StoryboardFilterBarProps {
  currentFilter: FilterParams;
  onFilterChange: (filter: Partial<FilterParams>) => void;
  totalCount: number;
}

export function StoryboardFilterBar({
  currentFilter,
  onFilterChange,
  totalCount,
}: StoryboardFilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Total count */}
      <span className="text-sm text-muted-foreground">
        총 {totalCount}개
      </span>

      {/* Status filter */}
      <Select
        value={currentFilter.status || "all"}
        onValueChange={(value) =>
          onFilterChange({
            status: value === "all" ? undefined : (value as StoryboardStatus),
          })
        }
      >
        <SelectTrigger className="w-[130px]">
          <SelectValue placeholder="상태" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">전체 상태</SelectItem>
          {Object.entries(STORYBOARD_STATUS_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Sort order */}
      <Select
        value={currentFilter.sortBy}
        onValueChange={(value) =>
          onFilterChange({ sortBy: value as "created_at" | "updated_at" })
        }
      >
        <SelectTrigger className="w-[130px]">
          <SelectValue placeholder="정렬" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="created_at">생성일순</SelectItem>
          <SelectItem value="updated_at">수정일순</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
