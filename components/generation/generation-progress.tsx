"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { GenerationProgressProps } from "@/types/generation";
import { useRealtimeVideo } from "@/hooks/use-realtime-video";
import { useGenerationComplete } from "@/hooks/use-generation-complete";
import { StepIndicator } from "./step-indicator";
import { LoadingAnimation } from "./loading-animation";
import { EstimatedTime } from "./estimated-time";
import { ErrorMessage } from "./error-message";
import { CancelButton } from "./cancel-button";
import {
  calculateGenerationProgress,
  getErrorMessage,
} from "@/lib/generation-utils";
import { toast } from "sonner";

/**
 * Main generation progress component
 * Orchestrates all child components and manages real-time state
 */
export function GenerationProgress({ initialVideo }: GenerationProgressProps) {
  const router = useRouter();

  // Real-time subscription
  const { video, isCompleted, isFailed, currentStage, progressPercent } =
    useRealtimeVideo({
      initialVideo,
    });

  // Debug: Log video state on every render
  console.log("📹 [GenerationProgress] Render with state:", {
    videoId: video?.id,
    status: video?.status,
    isCompleted,
    isFailed,
    currentStage,
    progressPercent,
    hasVideoUrl: !!video?.video_url,
    videoUrl: video?.video_url,
  });

  // Auto-redirect on completion
  useGenerationComplete({
    video,
    isCompleted,
  });

  // Auto-redirect on cancellation
  useEffect(() => {
    if (video?.status === "cancelled") {
      console.log("🚫 Video cancelled, redirecting to dashboard...");
      toast.info("영상 생성이 취소되었습니다.");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    }
  }, [video?.status, router]);

  // Calculate detailed progress
  const progress = video ? calculateGenerationProgress(video) : null;

  if (!video) {
    return (
      <div className="container max-w-4xl mx-auto py-8">
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">
              영상 정보를 불러오는 중...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 space-y-6">
      {/* Debug Info (development only) */}
      {process.env.NODE_ENV === "development" && (
        <Card className="border-blue-500 bg-blue-50 dark:bg-blue-950">
          <CardHeader>
            <CardTitle className="text-sm text-blue-700 dark:text-blue-300">
              디버그 정보 (개발 모드)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <details className="text-xs font-mono space-y-1">
              <summary className="cursor-pointer font-semibold mb-2">
                상태 정보 보기
              </summary>
              <div className="space-y-1 pl-4">
                <p>
                  <strong>Video ID:</strong> {video?.id}
                </p>
                <p>
                  <strong>Status:</strong> {video?.status}
                </p>
                <p>
                  <strong>isCompleted:</strong>{" "}
                  {isCompleted ? "✅ true" : "❌ false"}
                </p>
                <p>
                  <strong>isFailed:</strong>{" "}
                  {isFailed ? "✅ true" : "❌ false"}
                </p>
                <p>
                  <strong>Current Stage:</strong> {currentStage}
                </p>
                <p>
                  <strong>Progress:</strong> {progressPercent}%
                </p>
                <p>
                  <strong>Has Video URL:</strong>{" "}
                  {video?.video_url ? "✅ Yes" : "❌ No"}
                </p>
                {video?.video_url && (
                  <p className="break-all">
                    <strong>Video URL:</strong> {video.video_url}
                  </p>
                )}
              </div>
            </details>
          </CardContent>
        </Card>
      )}

      {/* Header Card */}
      <Card>
        <CardHeader>
          <CardTitle>
            {isCompleted
              ? "영상 생성 완료"
              : isFailed
                ? "영상 생성 실패"
                : "영상 생성 중"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">진행률</span>
              <span className="font-semibold">{progressPercent}%</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>

          {/* Estimated Time and Cancel Button */}
          {!isCompleted && !isFailed && progress && (
            <div className="flex items-center justify-between gap-4">
              <EstimatedTime
                remainingSeconds={progress.estimatedTimeRemaining}
              />
              <CancelButton adVideoId={video.id} />
            </div>
          )}

          {/* Completion Message */}
          {isCompleted && (
            <div className="rounded-lg bg-primary/10 p-4 text-center">
              <p className="text-primary font-semibold">
                영상 생성이 완료되었습니다! 잠시 후 영상 페이지로 이동합니다...
              </p>
            </div>
          )}

          {/* Error Message */}
          {isFailed && (
            <ErrorMessage
              message={getErrorMessage(video)}
              adVideoId={video.id}
            />
          )}
        </CardContent>
      </Card>

      {/* Loading Animation (only when processing) */}
      {!isCompleted && !isFailed && (
        <Card>
          <CardContent>
            <LoadingAnimation stage={currentStage} />
          </CardContent>
        </Card>
      )}

      {/* Step Indicator */}
      <Card>
        <CardContent className="pt-6">
          <StepIndicator currentStage={currentStage} status={video.status} />
        </CardContent>
      </Card>
    </div>
  );
}
