import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Video card loading skeleton component
 * Displays a placeholder while video data is being fetched
 */
export function VideoCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      {/* Video Thumbnail Skeleton */}
      <Skeleton className="aspect-video w-full" />

      {/* Card Content */}
      <div className="p-4 space-y-3">
        {/* Product Name */}
        <Skeleton className="h-5 w-3/4" />

        {/* Date and Status Row */}
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>

        {/* Action Button */}
        <Skeleton className="h-9 w-full" />
      </div>
    </Card>
  );
}

/**
 * Video grid skeleton component
 * Renders multiple video card skeletons in a grid layout
 */
export function VideoGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <VideoCardSkeleton key={i} />
      ))}
    </div>
  );
}
