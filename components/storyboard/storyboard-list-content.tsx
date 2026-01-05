"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StoryboardFilterBar } from "./storyboard-filter-bar";
import { StoryboardGrid } from "./storyboard-grid";
import { StoryboardEmptyState } from "./storyboard-empty-state";
import { fetchUserStoryboards } from "@/actions/storyboard";
import type { StoryboardListItem, StoryboardStatus } from "@/types/storyboard";

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
}

interface FilterParams {
  status?: StoryboardStatus;
  sortBy: "created_at" | "updated_at";
}

interface StoryboardListContentProps {
  initialStoryboards: StoryboardListItem[];
  initialPagination: PaginationInfo;
  initialFilter: FilterParams;
}

export function StoryboardListContent({
  initialStoryboards,
  initialPagination,
  initialFilter,
}: StoryboardListContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [storyboards, setStoryboards] = useState(initialStoryboards);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(
    initialPagination.currentPage < initialPagination.totalPages
  );
  const [totalCount, setTotalCount] = useState(initialPagination.totalCount);
  const [filter, setFilter] = useState<FilterParams>(initialFilter);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(true);

  // Ref for infinite scroll
  const observerRef = useRef<HTMLDivElement>(null);

  // Sync filter with URL params
  useEffect(() => {
    const status = searchParams.get("status") as StoryboardStatus | null;
    const sortBy =
      (searchParams.get("sortBy") as "created_at" | "updated_at") || "created_at";

    setFilter({
      status: status || undefined,
      sortBy,
    });
  }, [searchParams]);

  // Load more storyboards
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    const nextPage = page + 1;
    const offset = (nextPage - 1) * initialPagination.limit;

    const result = await fetchUserStoryboards({
      status: filter.status,
      limit: initialPagination.limit,
      offset,
      orderBy: filter.sortBy,
      orderDirection: "desc",
    });

    setIsLoadingMore(false);

    if (result.success && result.data) {
      setStoryboards((prev) => [...prev, ...result.data!.storyboards]);
      setPage(nextPage);
      setHasMore(result.data.hasMore);
      setTotalCount(result.data.total);
    }
  }, [filter, page, hasMore, isLoadingMore, initialPagination.limit]);

  // Reset and fetch storyboards when filter changes
  const resetAndFetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setPage(1);

    const result = await fetchUserStoryboards({
      status: filter.status,
      limit: initialPagination.limit,
      offset: 0,
      orderBy: filter.sortBy,
      orderDirection: "desc",
    });

    setIsLoading(false);

    if (result.success && result.data) {
      setStoryboards(result.data.storyboards);
      setHasMore(result.data.hasMore);
      setTotalCount(result.data.total);
      setIsLoaded(true);
    } else {
      setError(result.error || "스토리보드 목록을 불러올 수 없습니다.");
    }
  }, [filter, initialPagination.limit]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore && !isLoading) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: "100px" }
    );

    const currentRef = observerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasMore, isLoadingMore, isLoading, loadMore]);

  // Update URL params
  const updateUrlParams = useCallback(
    (newFilter: Partial<FilterParams>) => {
      const updatedFilter = { ...filter, ...newFilter };
      const params = new URLSearchParams();

      if (updatedFilter.status) {
        params.set("status", updatedFilter.status);
      }
      if (updatedFilter.sortBy !== "created_at") {
        params.set("sortBy", updatedFilter.sortBy);
      }

      const queryString = params.toString();
      router.push(queryString ? `/storyboard?${queryString}` : "/storyboard");
    },
    [filter, router]
  );

  // Handle filter change
  const handleFilterChange = useCallback(
    (newFilter: Partial<FilterParams>) => {
      updateUrlParams(newFilter);
      setStoryboards([]);
      setPage(1);
      setHasMore(true);
      setIsLoaded(false);
    },
    [updateUrlParams]
  );

  // Refetch when filter changes
  useEffect(() => {
    if (!isLoaded && !isLoading) {
      resetAndFetch();
    }
  }, [isLoaded, isLoading, resetAndFetch]);

  // Handle storyboard deleted
  const handleStoryboardDeleted = useCallback(() => {
    resetAndFetch();
  }, [resetAndFetch]);

  return (
    <div className="space-y-6">
      {/* Header with create button and filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <StoryboardFilterBar
          currentFilter={filter}
          onFilterChange={handleFilterChange}
          totalCount={totalCount}
        />
        <Link href="/storyboard/new">
          <Button className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />새 스토리보드
          </Button>
        </Link>
      </div>

      {/* Error message */}
      {error && (
        <div className="rounded-lg bg-destructive/10 p-4 text-destructive text-sm">
          {error}
        </div>
      )}

      {/* Content */}
      {isLoading && storyboards.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-video w-full rounded-lg" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : storyboards.length === 0 ? (
        <StoryboardEmptyState filter={filter} />
      ) : (
        <>
          <StoryboardGrid
            storyboards={storyboards}
            onStoryboardDeleted={handleStoryboardDeleted}
          />

          {/* Infinite scroll trigger */}
          <div ref={observerRef} className="h-10 flex items-center justify-center">
            {isLoadingMore && (
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            )}
            {!hasMore && storyboards.length > 0 && (
              <p className="text-sm text-muted-foreground">
                모든 스토리보드를 불러왔습니다
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
