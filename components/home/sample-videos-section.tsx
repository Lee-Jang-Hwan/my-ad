"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

interface SampleVideo {
  id: string;
  title: string;
  duration: string;
  videoUrl?: string;
}

// Sample videos from public/videos directory
const sampleVideos: SampleVideo[] = [
  {
    id: "1",
    title: "제품 홍보영상 샘플 1",
    duration: "0:15",
    videoUrl: "/videos/step1-sample.mp4",
  },
  {
    id: "2",
    title: "제품 홍보영상 샘플 2",
    duration: "0:15",
    videoUrl: "/videos/step2-sample.mp4",
  },
  {
    id: "3",
    title: "제품 홍보영상 샘플 3",
    duration: "0:15",
    videoUrl: "/videos/step3-sample.mp4",
  },
  {
    id: "4",
    title: "제품 홍보영상 샘플 4",
    duration: "0:15",
    videoUrl: "/videos/step4-sample.mp4",
  },
  {
    id: "5",
    title: "제품 홍보영상 샘플 5",
    duration: "0:15",
    videoUrl: "/videos/step5-sample.mp4",
  },
  {
    id: "6",
    title: "제품 홍보영상 샘플 6",
    duration: "0:15",
    videoUrl: "/videos/step6-sample.mp4",
  },
];

export function SampleVideosSection() {
  return (
    <div id="sample-videos-section" className="max-w-7xl mx-auto px-4 md:px-8">
      {/* Videos Grid - 9:16 ratio vertical videos */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        {sampleVideos.map((video) => (
          <div
            key={video.id}
            className="relative overflow-hidden rounded-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
            style={{ aspectRatio: "9/16", minHeight: "400px", width: "100%" }}
          >
            {video.videoUrl ? (
              /* Actual Video */
              <>
                <video
                  src={video.videoUrl}
                  className="absolute inset-0 w-full h-full object-cover bg-black"
                  loop
                  muted
                  playsInline
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
              </>
            ) : (
              /* Placeholder for videos without URL */
              <>
                {/* Placeholder gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted/50" />

                {/* Duration Badge */}
                <Badge className="absolute bottom-2 right-2 bg-black/70 text-white border-none text-xs">
                  {video.duration}
                </Badge>

                {/* Placeholder Text */}
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm font-medium">
                  샘플 영상
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
