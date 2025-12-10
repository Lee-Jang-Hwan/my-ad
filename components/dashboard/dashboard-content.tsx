"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Video, ImageIcon, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FilterBar } from "./filter-bar";
import { VideoGrid } from "./video-grid";
import { ImageGrid } from "./image-grid";
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
 * Uses infinite scroll for loading more items
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
  const [videoPage, setVideoPage] = useState(1);
  const [videoHasMore, setVideoHasMore] = useState(
    initialPagination.currentPage < initialPagination.totalPages
  );
  const [videoTotalCount, setVideoTotalCount] = useState(initialPagination.totalCount);
  const [videosLoaded, setVideosLoaded] = useState(true); // SSR에서 이미 로드됨

  // Image state
  const [images, setImages] = useState<ImageWithProductName[]>([]);
  const [imagePage, setImagePage] = useState(1);
  const [imageHasMore, setImageHasMore] = useState(true);
  const [imageTotalCount, setImageTotalCount] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  // Shared state
  const [filter, setFilter] = useState<Omit<FilterParams, "page">>({
    status: initialFilter.status,
    sortBy: initialFilter.sortBy,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs for infinite scroll
  const videoObserverRef = useRef<HTMLDivElement>(null);
  const imageObserverRef = useRef<HTMLDivElement>(null);

  // Sync filter with URL params (only status and sortBy)
  useEffect(() => {
    const status =
      (searchParams.get("status") as FilterParams["status"]) || "all";
    const sortBy =
      (searchParams.get("sortBy") as FilterParams["sortBy"]) || "newest";
    const tab = (searchParams.get("tab") as "videos" | "images") || "videos";

    setFilter({ status, sortBy });
    setActiveTab(tab);
  }, [searchParams]);

  // Load more videos
  const loadMoreVideos = useCallback(async () => {
    if (isLoadingMore || !videoHasMore) return;

    setIsLoadingMore(true);
    const nextPage = videoPage + 1;

    const result = await fetchUserVideos({
      ...filter,
      page: nextPage,
    });

    setIsLoadingMore(false);

    if (result.success && result.videos && result.pagination) {
      setVideos((prev) => [...prev, ...result.videos!]);
      setVideoPage(nextPage);
      setVideoHasMore(nextPage < result.pagination.totalPages);
      setVideoTotalCount(result.pagination.totalCount);
    }
  }, [filter, videoPage, videoHasMore, isLoadingMore]);

  // Load more images
  const loadMoreImages = useCallback(async () => {
    if (isLoadingMore || !imageHasMore) return;

    setIsLoadingMore(true);
    const nextPage = imagePage + 1;

    const result = await fetchUserImages({
      ...filter,
      page: nextPage,
    });

    setIsLoadingMore(false);

    if (result.success && result.images && result.pagination) {
      setImages((prev) => [...prev, ...result.images!]);
      setImagePage(nextPage);
      setImageHasMore(nextPage < result.pagination.totalPages);
      setImageTotalCount(result.pagination.totalCount);
    }
  }, [filter, imagePage, imageHasMore, isLoadingMore]);

  // Reset and fetch videos when filter changes
  const resetAndFetchVideos = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setVideoPage(1);

    const result = await fetchUserVideos({
      ...filter,
      page: 1,
    });

    setIsLoading(false);

    if (result.success && result.videos && result.pagination) {
      setVideos(result.videos);
      setVideoHasMore(1 < result.pagination.totalPages);
      setVideoTotalCount(result.pagination.totalCount);
      setVideosLoaded(true);
    } else {
      setError(result.error || "영상 목록을 불러올 수 없습니다.");
    }
  }, [filter]);

  // Reset and fetch images when filter changes
  const resetAndFetchImages = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setImagePage(1);

    const result = await fetchUserImages({
      ...filter,
      page: 1,
    });

    setIsLoading(false);

    if (result.success && result.images && result.pagination) {
      setImages(result.images);
      setImageHasMore(1 < result.pagination.totalPages);
      setImageTotalCount(result.pagination.totalCount);
      setImagesLoaded(true);
    } else {
      setError(result.error || "이미지 목록을 불러올 수 없습니다.");
    }
  }, [filter]);

  // Video infinite scroll observer
  useEffect(() => {
    if (activeTab !== "videos") return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && videoHasMore && !isLoadingMore && !isLoading) {
          loadMoreVideos();
        }
      },
      { threshold: 0.1, rootMargin: "100px" }
    );

    const currentRef = videoObserverRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [activeTab, videoHasMore, isLoadingMore, isLoading, loadMoreVideos]);

  // Image infinite scroll observer
  useEffect(() => {
    if (activeTab !== "images") return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && imageHasMore && !isLoadingMore && !isLoading) {
          loadMoreImages();
        }
      },
      { threshold: 0.1, rootMargin: "100px" }
    );

    const currentRef = imageObserverRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [activeTab, imageHasMore, isLoadingMore, isLoading, loadMoreImages]);

  // Load images when switching to images tab for the first time
  useEffect(() => {
    if (activeTab === "images" && !imagesLoaded) {
      resetAndFetchImages();
    }
  }, [activeTab, imagesLoaded, resetAndFetchImages]);

  // Update URL params
  const updateUrlParams = useCallback(
    (newFilter: Partial<Omit<FilterParams, "page">>, newTab?: "videos" | "images") => {
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

      const queryString = params.toString();
      router.push(queryString ? `/dashboard?${queryString}` : "/dashboard");
    },
    [filter, activeTab, router]
  );

  // Handle filter change - reset and refetch
  const handleFilterChange = useCallback(
    (newFilter: Partial<FilterParams>) => {
      updateUrlParams(newFilter, activeTab);

      // Reset data and refetch
      if (activeTab === "videos") {
        setVideos([]);
        setVideoPage(1);
        setVideoHasMore(true);
        setVideosLoaded(false); // 필터 변경 시 다시 로드 트리거
      } else {
        setImages([]);
        setImagePage(1);
        setImageHasMore(true);
        setImagesLoaded(false);
      }
    },
    [activeTab, updateUrlParams]
  );

  // Handle tab change
  const handleTabChange = useCallback(
    (tab: string) => {
      updateUrlParams({}, tab as "videos" | "images");
    },
    [updateUrlParams]
  );

  // Refetch when filter changes (only when videosLoaded is reset to false)
  useEffect(() => {
    if (activeTab === "videos" && !videosLoaded && !isLoading) {
      resetAndFetchVideos();
    }
    // Images are handled by the images tab effect
  }, [activeTab, videosLoaded, isLoading, resetAndFetchVideos]);

  // Handle video deleted
  const handleVideoDeleted = useCallback(() => {
    resetAndFetchVideos();
  }, [resetAndFetchVideos]);

  // Handle image deleted
  const handleImageDeleted = useCallback(() => {
    resetAndFetchImages();
  }, [resetAndFetchImages]);

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="videos" className="gap-2">
            <Video className="w-4 h-4" />
            영상 {videoTotalCount > 0 && `(${videoTotalCount})`}
          </TabsTrigger>
          <TabsTrigger value="images" className="gap-2">
            <ImageIcon className="w-4 h-4" />
            이미지 {imageTotalCount > 0 && `(${imageTotalCount})`}
          </TabsTrigger>
        </TabsList>

        {/* Filter bar */}
        <div className="mt-4">
          <FilterBar
            currentFilter={{ ...filter, page: 1 }}
            onFilterChange={handleFilterChange}
          />
        </div>

        {/* Error message */}
        {error && (
          <div className="rounded-lg bg-destructive/10 p-4 text-destructive text-sm">
            {error}
          </div>
        )}

        {/* Videos Tab */}
        <TabsContent value="videos" className="mt-6">
          {isLoading && videos.length === 0 ? (
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
              <VideoGrid
                videos={videos}
                statusFilter={filter.status}
                onVideoDeleted={handleVideoDeleted}
              />

              {/* Infinite scroll trigger */}
              <div ref={videoObserverRef} className="h-10 flex items-center justify-center">
                {isLoadingMore && (
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                )}
                {!videoHasMore && videos.length > 0 && (
                  <p className="text-sm text-muted-foreground">모든 영상을 불러왔습니다</p>
                )}
              </div>
            </>
          )}
        </TabsContent>

        {/* Images Tab */}
        <TabsContent value="images" className="mt-6">
          {isLoading && images.length === 0 ? (
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
            <>
              <ImageGrid
                images={images}
                statusFilter={filter.status}
                onImageDeleted={handleImageDeleted}
              />

              {/* Infinite scroll trigger */}
              <div ref={imageObserverRef} className="h-10 flex items-center justify-center">
                {isLoadingMore && (
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                )}
                {!imageHasMore && images.length > 0 && (
                  <p className="text-sm text-muted-foreground">모든 이미지를 불러왔습니다</p>
                )}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
