"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import {
  fetchPublicVideos,
  type PublicVideo,
} from "@/actions/fetch-public-videos";

interface SampleVideo {
  id: string;
  title: string;
  duration: string;
  videoUrl?: string;
}

export function SampleVideosSection() {
  const [displayVideos, setDisplayVideos] = useState<SampleVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch public videos on mount
    async function loadPublicVideos() {
      try {
        const result = await fetchPublicVideos(6);

        if (result.success && result.videos.length > 0) {
          // Convert public videos to SampleVideo format
          const publicVideos: SampleVideo[] = result.videos.map(
            (video: PublicVideo) => ({
              id: video.id,
              title: video.product_name || "홍보영상",
              duration: "0:12",
              videoUrl: video.video_url,
            }),
          );

          setDisplayVideos(publicVideos);
        }
      } catch (error) {
        console.error("Failed to load public videos:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadPublicVideos();
  }, []);

  // Don't render anything if loading or no videos
  if (isLoading) {
    return (
      <div
        id="sample-videos-section"
        className="max-w-7xl mx-auto px-4 md:px-8"
      >
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (displayVideos.length === 0) {
    return null;
  }

  return (
    <div id="sample-videos-section" className="max-w-7xl mx-auto px-4 md:px-8">
      {/* Videos Grid - 9:16 ratio vertical videos */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        {displayVideos.map((video) => (
          <div
            key={video.id}
            className="relative overflow-hidden rounded-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
            style={{ aspectRatio: "9/16", minHeight: "400px", width: "100%" }}
          >
            <video
              src={video.videoUrl}
              className="absolute inset-0 w-full h-full object-cover bg-black"
              loop
              muted
              playsInline
              autoPlay
              preload="auto"
            >
              <track kind="captions" />
            </video>

            {/* Play Button Overlay */}
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <Button
                size="icon"
                variant="secondary"
                className="rounded-full w-12 h-12 md:w-14 md:h-14 shadow-lg"
                onClick={() => {
                  const videoElement = document.querySelector(
                    `video[src="${video.videoUrl}"]`,
                  ) as HTMLVideoElement;
                  if (videoElement) {
                    if (videoElement.paused) {
                      // Unmute and play with audio
                      videoElement.muted = false;
                      videoElement.play();
                    } else {
                      videoElement.pause();
                    }
                  }
                }}
              >
                <Play className="w-5 h-5 md:w-6 md:h-6 fill-current" />
              </Button>
            </div>

            {/* Duration Badge */}
            <Badge className="absolute bottom-2 right-2 bg-black/70 text-white border-none z-10 text-xs">
              {video.duration}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
