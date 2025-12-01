"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Video, ImageIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FilterBar } from "./filter-bar";
import { VideoGrid } from "./video-grid";
import { ImageGrid } from "./image-grid";
import { Pagination } from "./pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchUserVideos } from "@/actions/fetch-user-videos";
import { fetchUserImages } from "@/actions/image/fetch-user-images";
import type {
  FilterParams,
  VideoWithProductName,
  PaginationInfo,
} from "@/types/dashboard";
import type { AdImage } from "@/types/ad-image";

interface ImageWithProductName extends AdImage {
  product_name?: string;
}

interface DashboardContentProps {
  initialVideos: VideoWithProductName[];
  initialPagination: PaginationInfo;
  initialFilter: FilterParams;
}

/**
 * Main dashboard content component (Client Component)
 * Manages URL-based state for filtering, sorting, and pagination
 * Includes tabs for videos and images
 */
export function DashboardContent({
  initialVideos,
  initialPagination,
  initialFilter,
}: DashboardContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Tab state
  const [activeTab, setActiveTab] = useState<"videos" | "images">(
    (searchParams.get("tab") as "videos" | "images") || "videos"
  );

  // Video state
  const [videos, setVideos] = useState(initialVideos);
  const [videoPagination, setVideoPagination] = useState(initialPagination);

  // Image state
  const [images, setImages] = useState<ImageWithProductName[]>([]);
  const [imagePagination, setImagePagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 12,
  });
  const [imagesLoaded, setImagesLoaded] = useState(false);

  // Shared state
  const [filter, setFilter] = useState(initialFilter);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track if this is the very first render
  const [isFirstRender, setIsFirstRender] = useState(true);

  // Sync state with URL params
  useEffect(() => {
    const status =
      (searchParams.get("status") as FilterParams["status"]) || "all";
    const sortBy =
      (searchParams.get("sortBy") as FilterParams["sortBy"]) || "newest";
    const page = parseInt(searchParams.get("page") || "1");
    const tab = (searchParams.get("tab") as "videos" | "images") || "videos";

    setFilter({ status, sortBy, page });
    setActiveTab(tab);
  }, [searchParams]);

  // Fetch videos when filter changes
  const refetchVideos = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const result = await fetchUserVideos(filter);

    setIsLoading(false);

    if (result.success && result.videos && result.pagination) {
      setVideos(result.videos);
      setVideoPagination(result.pagination);
    } else {
      setError(result.error || "영상 목록을 불러올 수 없습니다.");
    }
  }, [filter]);

  // Fetch images when filter changes
  const refetchImages = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const result = await fetchUserImages(filter);

    setIsLoading(false);

    if (result.success && result.images && result.pagination) {
      setImages(result.images);
      setImagePagination(result.pagination);
      setImagesLoaded(true);
    } else {
      setError(result.error || "이미지 목록을 불러올 수 없습니다.");
    }
  }, [filter]);

  // Refetch when filter or tab changes (but not on initial mount)
  useEffect(() => {
    // Skip only the very first render to avoid duplicate fetch
    if (isFirstRender) {
      setIsFirstRender(false);
      return;
    }

    // Refetch based on active tab
    if (activeTab === "videos") {
      refetchVideos();
    } else {
      refetchImages();
    }
  }, [filter, activeTab, refetchVideos, refetchImages, isFirstRender]);

  // Load images when switching to images tab for the first time
  useEffect(() => {
    if (activeTab === "images" && !imagesLoaded && !isFirstRender) {
      refetchImages();
    }
  }, [activeTab, imagesLoaded, refetchImages, isFirstRender]);

  // Update URL params
  const updateUrlParams = useCallback(
    (newFilter: Partial<FilterParams>, newTab?: "videos" | "images") => {
      const updatedFilter = { ...filter, ...newFilter };
      const tab = newTab || activeTab;
      const params = new URLSearchParams();

      if (tab !== "videos") {
        params.set("tab", tab);
      }
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
    [filter, activeTab, router]
  );

  const handleFilterChange = (newFilter: Partial<FilterParams>) => {
    updateUrlParams({ ...newFilter, page: 1 }); // Reset to page 1 when filter changes
  };

  const handlePageChange = (page: number) => {
    updateUrlParams({ page });
  };

  const handleTabChange = (tab: string) => {
    updateUrlParams({ page: 1 }, tab as "videos" | "images");
  };

  // Get current pagination based on active tab
  const currentPagination = activeTab === "videos" ? videoPagination : imagePagination;

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="videos" className="gap-2">
            <Video className="w-4 h-4" />
            영상
          </TabsTrigger>
          <TabsTrigger value="images" className="gap-2">
            <ImageIcon className="w-4 h-4" />
            이미지
          </TabsTrigger>
        </TabsList>

        {/* Filter bar */}
        <div className="mt-4">
          <FilterBar currentFilter={filter} onFilterChange={handleFilterChange} />
        </div>

        {/* Error message */}
        {error && (
          <div className="rounded-lg bg-destructive/10 p-4 text-destructive text-sm">
            {error}
          </div>
        )}

        {/* Videos Tab */}
        <TabsContent value="videos" className="mt-6">
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
            <VideoGrid
              videos={videos}
              statusFilter={filter.status}
              onVideoDeleted={refetchVideos}
            />
          )}
        </TabsContent>

        {/* Images Tab */}
        <TabsContent value="images" className="mt-6">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-square w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <ImageGrid
              images={images}
              statusFilter={filter.status}
              onImageDeleted={refetchImages}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Pagination */}
      {!isLoading && (
        <Pagination pagination={currentPagination} onPageChange={handlePageChange} />
      )}
    </div>
  );
}
