"use client";

import { useAuth } from "@clerk/nextjs";
import { Card, CardContent } from "@/components/ui/card";
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
    videoUrl: "/videos/step1-sample.mp4"
  },
  {
    id: "2",
    title: "제품 홍보영상 샘플 2",
    duration: "0:15",
    videoUrl: "/videos/step2-sample.mp4"
  },
  {
    id: "3",
    title: "제품 홍보영상 샘플 3",
    duration: "0:15",
    videoUrl: "/videos/step3-sample.mp4"
  },
  {
    id: "4",
    title: "제품 홍보영상 샘플 4",
    duration: "0:15",
    videoUrl: "/videos/step4-sample.mp4"
  },
  {
    id: "5",
    title: "제품 홍보영상 샘플 5",
    duration: "0:15",
    videoUrl: "/videos/step5-sample.mp4"
  },
  {
    id: "6",
    title: "제품 홍보영상 샘플 6",
    duration: "0:15",
    videoUrl: "/videos/step6-sample.mp4"
  }
];

export function SampleVideosSection() {
  const { isSignedIn } = useAuth();

  return (
    <div id="sample-videos-section" className="max-w-6xl mx-auto px-4 md:px-8">
      {/* Videos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleVideos.map((video) => (
            <Card
              key={video.id}
              className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group border-2"
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-video bg-gradient-to-br from-primary/20 to-primary/10 overflow-hidden flex items-center justify-center">
                {video.videoUrl ? (
                  /* Actual Video */
                  <>
                    <video
                      src={video.videoUrl}
                      className="absolute inset-0 w-full h-full object-contain bg-black"
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
                        className="rounded-full w-14 h-14 shadow-lg"
                        onClick={() => {
                          const videoElement = document.querySelector(`video[src="${video.videoUrl}"]`) as HTMLVideoElement;
                          if (videoElement) {
                            if (videoElement.paused) {
                              videoElement.play();
                            } else {
                              videoElement.pause();
                            }
                          }
                        }}
                      >
                        <Play className="w-6 h-6 fill-current" />
                      </Button>
                    </div>

                    {/* Duration Badge */}
                    <Badge className="absolute bottom-2 right-2 bg-black/70 text-white border-none z-10">
                      {video.duration}
                    </Badge>
                  </>
                ) : (
                  /* Placeholder for videos without URL */
                  <>
                    {/* Placeholder gradient background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted/50" />

                    {/* Duration Badge */}
                    <Badge className="absolute bottom-2 right-2 bg-black/70 text-white border-none">
                      {video.duration}
                    </Badge>

                    {/* Placeholder Text */}
                    <div className="relative z-10 text-muted-foreground text-sm font-medium">
                      샘플 영상
                    </div>
                  </>
                )}
              </div>

              {/* Content */}
              <CardContent className="p-4">
                <h3 className="font-bold mb-2 text-base">{video.title}</h3>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    완성됨
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    AI 생성
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
}
