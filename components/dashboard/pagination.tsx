"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PaginationInfo } from "@/types/dashboard";

interface PaginationProps {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
}

/**
 * Pagination controls for dashboard
 * Shows current page, total pages, and navigation buttons
 */
export function Pagination({ pagination, onPageChange }: PaginationProps) {
  const { currentPage, totalPages, totalCount } = pagination;

  // Don't show pagination if there's only one page or no data
  if (totalPages <= 1 || totalCount === 0) {
    return null;
  }

  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  return (
    <div className="flex items-center justify-between mt-8">
      {/* Page info */}
      <div className="text-sm text-muted-foreground">
        총 <span className="font-semibold text-foreground">{totalCount}</span>개
        영상 중 {(currentPage - 1) * pagination.limit + 1}-
        {Math.min(currentPage * pagination.limit, totalCount)}개 표시
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!canGoPrevious}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          이전
        </Button>

        <div className="flex items-center gap-1 text-sm">
          <span className="font-semibold">{currentPage}</span>
          <span className="text-muted-foreground">/ {totalPages}</span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!canGoNext}
        >
          다음
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
