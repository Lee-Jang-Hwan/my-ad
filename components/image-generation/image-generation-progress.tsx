"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { ImageGenerationProgressProps } from "@/types/ad-image";
import { useRealtimeImage } from "@/hooks/use-realtime-image";
import { ImageStepIndicator } from "./image-step-indicator";
import { ImageLoadingAnimation } from "./image-loading-animation";
import { ImageErrorMessage } from "./image-error-message";
import { ImageEstimatedTime } from "./image-estimated-time";
import { calculateImageRemainingTime, IMAGE_STAGE_INFO } from "@/constants/image-generation";
import { toast } from "sonner";

/**
 * Main image generation progress component
 * Orchestrates all child components and manages real-time state
 */
export function ImageGenerationProgress({ initialImage }: ImageGenerationProgressProps) {
  const router = useRouter();

  // Real-time subscription
  const { image, isCompleted, isFailed, currentStage, progressPercent } =
    useRealtimeImage({
      initialImage,
    });

  // Debug: Log image state on every render
  console.log("🖼️ [ImageGenerationProgress] Render with state:", {
    imageId: image?.id,
    status: image?.status,
    isCompleted,
    isFailed,
    currentStage,
    progressPercent,
    hasImageUrl: !!image?.image_url,
  });

  // Auto-redirect on completion
  useEffect(() => {
    if (isCompleted && image?.image_url) {
      console.log("✅ Image completed, redirecting to image page...");
      toast.success("이미지 생성이 완료되었습니다!");
      setTimeout(() => {
        router.push(`/image/${image.id}`);
      }, 1500);
    }
  }, [isCompleted, image?.image_url, image?.id, router]);

  // Auto-redirect on cancellation
  useEffect(() => {
    if (image?.status === "cancelled") {
      console.log("🚫 Image cancelled, redirecting to dashboard...");
      toast.info("이미지 생성이 취소되었습니다.");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    }
  }, [image?.status, router]);

  // Get current stage info
  const currentStageInfo = IMAGE_STAGE_INFO.find((s) => s.key === currentStage);
  const remainingTime = calculateImageRemainingTime(currentStage);

  if (!image) {
    return (
      <div className="container max-w-4xl mx-auto py-8">
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">
              이미지 정보를 불러오는 중...
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
                  <strong>Image ID:</strong> {image?.id}
                </p>
                <p>
                  <strong>Status:</strong> {image?.status}
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
                  <strong>Has Image URL:</strong>{" "}
                  {image?.image_url ? "✅ Yes" : "❌ No"}
                </p>
                {image?.image_url && (
                  <p className="break-all">
                    <strong>Image URL:</strong> {image.image_url}
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
              ? "이미지 생성 완료"
              : isFailed
                ? "이미지 생성 실패"
                : "이미지 생성 중"}
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

          {/* Current Stage Description */}
          {!isCompleted && !isFailed && currentStageInfo && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {currentStageInfo.description}
              </p>
            </div>
          )}

          {/* Estimated Time */}
          {!isCompleted && !isFailed && (
            <div className="flex items-center justify-center">
              <ImageEstimatedTime remainingSeconds={remainingTime} />
            </div>
          )}

          {/* Completion Message */}
          {isCompleted && (
            <div className="rounded-lg bg-primary/10 p-4 text-center">
              <p className="text-primary font-semibold">
                이미지 생성이 완료되었습니다! 잠시 후 이미지 페이지로 이동합니다...
              </p>
            </div>
          )}

          {/* Error Message */}
          {isFailed && (
            <ImageErrorMessage
              message={image.error_message || "이미지 생성 중 오류가 발생했습니다."}
            />
          )}
        </CardContent>
      </Card>

      {/* Loading Animation (only when processing) */}
      {!isCompleted && !isFailed && (
        <Card>
          <CardContent>
            <ImageLoadingAnimation stage={currentStage} />
          </CardContent>
        </Card>
      )}

      {/* Step Indicator */}
      <Card>
        <CardContent className="pt-6">
          <ImageStepIndicator currentStage={currentStage} status={image.status} />
        </CardContent>
      </Card>
    </div>
  );
}
