"use client";

import dynamic from "next/dynamic";

// Dynamically import VideoPlayer (heavy component with controls)
const VideoPlayer = dynamic(
  () =>
    import("@/components/video/video-player").then((mod) => mod.VideoPlayer),
  {
    loading: () => (
      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
        <div className="text-muted-foreground">로딩 중...</div>
      </div>
    ),
    ssr: false, // Video player is client-only
  }
);

interface VideoPlayerWrapperProps {
  videoUrl: string;
  thumbnailUrl?: string | null;
  productName?: string;
}

export function VideoPlayerWrapper({
  videoUrl,
  thumbnailUrl,
  productName,
}: VideoPlayerWrapperProps) {
  return (
    <VideoPlayer
      videoUrl={videoUrl}
      thumbnailUrl={thumbnailUrl}
      productName={productName}
    />
  );
}