import { VideoCard } from "./video-card";
import { EmptyState } from "./empty-state";
import type { VideoWithProductName } from "@/types/dashboard";

interface VideoGridProps {
  videos: VideoWithProductName[];
  statusFilter?: string;
  onVideoDeleted?: () => void | Promise<void>;
}

/**
 * Responsive grid layout for video cards
 * Shows empty state when no videos are available
 */
export function VideoGrid({ videos, statusFilter, onVideoDeleted }: VideoGridProps) {
  // Show empty state if no videos
  if (!videos || videos.length === 0) {
    return (
      <EmptyState
        filterApplied={statusFilter !== "all"}
        statusFilter={statusFilter}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} onDelete={onVideoDeleted} />
      ))}
    </div>
  );
}
