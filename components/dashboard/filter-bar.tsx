"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FilterParams } from "@/types/dashboard";

interface FilterBarProps {
  currentFilter: FilterParams;
  onFilterChange: (filter: Partial<FilterParams>) => void;
}

/**
 * Filter and sort controls for dashboard
 * Status filter tabs + Sort select dropdown
 */
export function FilterBar({ currentFilter, onFilterChange }: FilterBarProps) {
  const handleStatusChange = (value: string) => {
    onFilterChange({
      status: value as FilterParams["status"],
      page: 1, // Reset to page 1 when changing filter
    });
  };

  const handleSortChange = (value: string) => {
    onFilterChange({
      sortBy: value as FilterParams["sortBy"],
      page: 1, // Reset to page 1 when changing sort
    });
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      {/* Status filter tabs */}
      <Tabs
        value={currentFilter.status}
        onValueChange={handleStatusChange}
        className="w-full sm:w-auto"
      >
        <TabsList className="grid w-full sm:w-auto grid-cols-5">
          <TabsTrigger value="all">전체</TabsTrigger>
          <TabsTrigger value="pending">대기중</TabsTrigger>
          <TabsTrigger value="processing">생성중</TabsTrigger>
          <TabsTrigger value="completed">완료</TabsTrigger>
          <TabsTrigger value="failed">실패</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Sort select */}
      <Select value={currentFilter.sortBy} onValueChange={handleSortChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="정렬 기준" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">최신순</SelectItem>
          <SelectItem value="oldest">오래된순</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
