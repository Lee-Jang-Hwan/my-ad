"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Pause, Loader2 } from "lucide-react";
import { useEffect, useState, useRef, useCallback } from "react";
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

// 개별 비디오 카드 컴포넌트 - 모바일 호환성 개선
function VideoCard({ video }: { video: SampleVideo }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPlayButton, setShowPlayButton] = useState(true);

  // Intersection Observer로 뷰포트에 보일 때만 재생 시도
  useEffect(() => {
    const videoElement = videoRef.current;
    const containerElement = containerRef.current;
    if (!videoElement || !containerElement) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // 뷰포트에 보이면 재생 시도
            videoElement.play().then(() => {
              setIsPlaying(true);
              setShowPlayButton(false);
            }).catch(() => {
              // 자동 재생 실패 시 재생 버튼 표시
              setShowPlayButton(true);
              setIsPlaying(false);
            });
          } else {
            // 뷰포트에서 벗어나면 일시정지
            videoElement.pause();
            setIsPlaying(false);
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(containerElement);

    return () => {
      observer.disconnect();
    };
  }, []);

  // 비디오 이벤트 핸들러
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handlePlay = () => {
      setIsPlaying(true);
      setShowPlayButton(false);
    };
    const handlePause = () => {
      setIsPlaying(false);
    };
    const handleEnded = () => {
      setIsPlaying(false);
    };

    videoElement.addEventListener("play", handlePlay);
    videoElement.addEventListener("pause", handlePause);
    videoElement.addEventListener("ended", handleEnded);

    return () => {
      videoElement.removeEventListener("play", handlePlay);
      videoElement.removeEventListener("pause", handlePause);
      videoElement.removeEventListener("ended", handleEnded);
    };
  }, []);

  // 재생/일시정지 토글
  const handlePlayPause = useCallback(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (videoElement.paused) {
      videoElement.muted = true; // 모바일에서 재생을 위해 muted 유지
      videoElement.play().then(() => {
        setIsPlaying(true);
        setShowPlayButton(false);
      }).catch((error) => {
        console.error("Video play failed:", error);
      });
    } else {
      videoElement.pause();
      setIsPlaying(false);
    }
  }, []);

  // 컨테이너 클릭 시 재생/일시정지 (모바일 터치 지원)
  const handleContainerClick = useCallback(() => {
    handlePlayPause();
  }, [handlePlayPause]);

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
      style={{ aspectRatio: "9/16", minHeight: "400px", width: "100%" }}
      onClick={handleContainerClick}
    >
      <video
        ref={videoRef}
        src={video.videoUrl}
        className="absolute inset-0 w-full h-full object-cover bg-black"
        loop
        muted
        playsInline
        preload="metadata"
        poster=""
      >
        <track kind="captions" />
      </video>

      {/* 재생 버튼 오버레이 - 재생 중이 아닐 때 또는 hover 시 표시 */}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
          showPlayButton || !isPlaying
            ? "bg-black/40 opacity-100"
            : "bg-black/30 opacity-0 group-hover:opacity-100"
        }`}
      >
        <Button
          size="icon"
          variant="secondary"
          className="rounded-full w-14 h-14 md:w-16 md:h-16 shadow-lg"
          onClick={(e) => {
            e.stopPropagation();
            handlePlayPause();
          }}
        >
          {isPlaying ? (
            <Pause className="w-6 h-6 md:w-7 md:h-7 fill-current" />
          ) : (
            <Play className="w-6 h-6 md:w-7 md:h-7 fill-current ml-1" />
          )}
        </Button>
      </div>

      {/* Duration Badge */}
      <Badge className="absolute bottom-2 right-2 bg-black/70 text-white border-none z-10 text-xs">
        {video.duration}
      </Badge>
    </div>
  );
}

export function SampleVideosSection() {
  const [displayVideos, setDisplayVideos] = useState<SampleVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch public videos on mount
    async function loadPublicVideos() {
      try {
        const result = await fetchPublicVideos(10);

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
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    </div>
  );
}
