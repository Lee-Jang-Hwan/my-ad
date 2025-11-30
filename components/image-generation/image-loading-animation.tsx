"use client";

import { Loader2, Sparkles, ImagePlus, CheckCircle2 } from "lucide-react";
import type { ImageGenerationStage } from "@/types/ad-image";
import { IMAGE_STAGE_INFO } from "@/constants/image-generation";
import { cn } from "@/lib/utils";

interface ImageLoadingAnimationProps {
  stage: ImageGenerationStage;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Loader2,
  Sparkles,
  ImagePlus,
  CheckCircle2,
  MousePointerClick: Loader2, // fallback
};

/**
 * Animated loading indicator for image generation
 * Shows different animations based on current stage
 */
export function ImageLoadingAnimation({ stage }: ImageLoadingAnimationProps) {
  const stageInfo = IMAGE_STAGE_INFO.find((s) => s.key === stage);
  const IconComponent = stageInfo?.iconName
    ? iconMap[stageInfo.iconName] || Loader2
    : Loader2;

  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-6">
      {/* Main Animation */}
      <div className="relative">
        {/* Outer Ring */}
        <div
          className={cn(
            "absolute inset-0 rounded-full",
            "bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20",
            "animate-pulse"
          )}
          style={{ transform: "scale(1.3)" }}
        />

        {/* Middle Ring */}
        <div
          className={cn(
            "absolute inset-0 rounded-full border-2 border-primary/30",
            "animate-ping opacity-75"
          )}
          style={{ transform: "scale(1.1)" }}
        />

        {/* Inner Circle with Icon */}
        <div className="relative w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
          <IconComponent
            className={cn("w-12 h-12 text-primary", {
              "animate-spin": stage !== "completed",
              "animate-bounce": stage === "completed",
            })}
          />
        </div>
      </div>

      {/* Stage Label */}
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold">
          {stageInfo?.label || "처리 중..."}
        </h3>
        <p className="text-sm text-muted-foreground max-w-md">
          {stageInfo?.description || "이미지를 생성하고 있습니다..."}
        </p>
      </div>

      {/* Progress Dots */}
      <div className="flex items-center gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              "w-2 h-2 rounded-full bg-primary",
              "animate-bounce"
            )}
            style={{
              animationDelay: `${i * 0.15}s`,
              animationDuration: "0.6s",
            }}
          />
        ))}
      </div>
    </div>
  );
}
