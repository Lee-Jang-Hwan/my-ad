"use client";

import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { useEffect, useState, useRef } from "react";
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

// 개별 비디오 카드 컴포넌트 - 모바일 완벽 지원
function VideoCard({ video }: { video: SampleVideo }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTouched, setIsTouched] = useState(false);

  // 비디오 이벤트 리스너
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    videoElement.addEventListener("play", handlePlay);
    videoElement.addEventListener("pause", handlePause);
    videoElement.addEventListener("ended", handleEnded);

    return () => {
      videoElement.removeEventListener("play", handlePlay);
      videoElement.removeEventListener("pause", handlePause);
      videoElement.removeEventListener("ended", handleEnded);
    };
  }, []);

  // 재생/정지 토글 - 단순하고 확실한 방식
  const togglePlay = () => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (videoElement.paused) {
      // 재생 시 오디오 활성화
      videoElement.muted = false;
      const playPromise = videoElement.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          // 오디오 재생 실패 시 음소거로 재시도
          console.log("Play with audio failed, retrying muted:", error.message);
          videoElement.muted = true;
          videoElement.play().catch(() => {});
        });
      }
    } else {
      // 정지
      videoElement.pause();
    }
  };

  // 터치 시작 - 터치 감지용
  const handleTouchStart = () => {
    setIsTouched(true);
  };

  // 터치 끝 - 실제 재생/정지 동작
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isTouched) {
      e.preventDefault(); // 클릭 이벤트 중복 방지
      togglePlay();
      setIsTouched(false);
    }
  };

  // 클릭 - 데스크탑용 (터치가 아닌 경우에만)
  const handleClick = () => {
    if (!isTouched) {
      togglePlay();
    }
    setIsTouched(false);
  };

  return (
    <div
      className="relative overflow-hidden rounded-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
      style={{ aspectRatio: "9/16", minHeight: "400px", width: "100%" }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={handleClick}
    >
      {/* 비디오 요소 - 모바일 필수 속성 적용 */}
      <video
        ref={videoRef}
        src={video.videoUrl}
        className="absolute inset-0 w-full h-full object-cover bg-black"
        loop
        muted
        playsInline
        preload="metadata"
        poster=""
        style={{
          WebkitTransform: "translateZ(0)", // iOS 하드웨어 가속
        }}
      />

      {/* 정지 상태일 때만 어두운 오버레이 표시 */}
      {!isPlaying && (
        <div className="absolute inset-0 bg-black/30 pointer-events-none" />
      )}

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
    async function loadPublicVideos() {
      try {
        const result = await fetchPublicVideos(10);

        if (result.success && result.videos.length > 0) {
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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        {displayVideos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    </div>
  );
}
