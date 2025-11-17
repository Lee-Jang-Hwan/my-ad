"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FilterBar } from "./filter-bar";
import { VideoGrid } from "./video-grid";
import { Pagination } from "./pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchUserVideos } from "@/actions/fetch-user-videos";
import type {
  FilterParams,
  VideoWithProductName,
  PaginationInfo,
} from "@/types/dashboard";

interface DashboardContentProps {
  initialVideos: VideoWithProductName[];
  initialPagination: PaginationInfo;
  initialFilter: FilterParams;
}

/**
 * Main dashboard content component (Client Component)
 * Manages URL-based state for filtering, sorting, and pagination
 */
export function DashboardContent({
  initialVideos,
  initialPagination,
  initialFilter,
}: DashboardContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [videos, setVideos] = useState(initialVideos);
  const [pagination, setPagination] = useState(initialPagination);
  const [filter, setFilter] = useState(initialFilter);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync state with URL params
  useEffect(() => {
    const status =
      (searchParams.get("status") as FilterParams["status"]) || "all";
    const sortBy =
      (searchParams.get("sortBy") as FilterParams["sortBy"]) || "newest";
    const page = parseInt(searchParams.get("page") || "1");

    setFilter({ status, sortBy, page });
  }, [searchParams]);

  // Fetch videos when filter changes
  const refetchVideos = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const result = await fetchUserVideos(filter);

    setIsLoading(false);

    if (result.success && result.videos && result.pagination) {
      setVideos(result.videos);
      setPagination(result.pagination);
    } else {
      setError(result.error || "영상 목록을 불러올 수 없습니다.");
    }
  }, [filter]);

  // Track if this is the very first render
  const [isFirstRender, setIsFirstRender] = useState(true);

  // Refetch when filter changes (but not on initial mount)
  useEffect(() => {
    // Skip only the very first render to avoid duplicate fetch
    if (isFirstRender) {
      setIsFirstRender(false);
      return;
    }

    // Always refetch on subsequent filter changes
    refetchVideos();
  }, [filter, refetchVideos, isFirstRender]);

  // Update URL params
  const updateUrlParams = useCallback(
    (newFilter: Partial<FilterParams>) => {
      const updatedFilter = { ...filter, ...newFilter };
      const params = new URLSearchParams();

      if (updatedFilter.status !== "all") {
        params.set("status", updatedFilter.status);
      }
      if (updatedFilter.sortBy !== "newest") {
        params.set("sortBy", updatedFilter.sortBy);
      }
      if (updatedFilter.page !== 1) {
        params.set("page", updatedFilter.page.toString());
      }

      const queryString = params.toString();
      router.push(queryString ? `/dashboard?${queryString}` : "/dashboard");
    },
    [filter, router]
  );

  const handleFilterChange = (newFilter: Partial<FilterParams>) => {
    updateUrlParams(newFilter);
  };

  const handlePageChange = (page: number) => {
    updateUrlParams({ page });
  };

  return (
    <div className="space-y-6">
      {/* Filter bar */}
      <FilterBar currentFilter={filter} onFilterChange={handleFilterChange} />

      {/* Error message */}
      {error && (
        <div className="rounded-lg bg-destructive/10 p-4 text-destructive text-sm">
          {error}
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-video w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Video grid */}
          <VideoGrid
            videos={videos}
            statusFilter={filter.status}
            onVideoDeleted={refetchVideos}
          />

          {/* Pagination */}
          <Pagination pagination={pagination} onPageChange={handlePageChange} />
        </>
      )}
    </div>
  );
}
