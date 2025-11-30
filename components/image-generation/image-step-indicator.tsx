"use client";

import { Check, Circle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { IMAGE_STAGE_INFO, getImageStageIndex } from "@/constants/image-generation";
import type { ImageStepIndicatorProps } from "@/types/ad-image";

/**
 * Image generation step indicator component
 * Shows 4 stages: init -> ad_copy_generation -> image_generation -> completed
 */
export function ImageStepIndicator({ currentStage, status }: ImageStepIndicatorProps) {
  const currentIndex = getImageStageIndex(currentStage);
  const isFailed = status === "failed" || status === "cancelled";
  const isCompleted = status === "completed";

  // Filter out intermediate stages for display (show only main 4 stages)
  const displayStages = IMAGE_STAGE_INFO.filter(
    (stage) => !["init", "ad_copy_selection", "failed", "cancelled"].includes(stage.key)
  );

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-center">생성 단계</h3>

      <div className="flex items-center justify-center">
        {displayStages.map((stage, index) => {
          const stageIndex = getImageStageIndex(stage.key);
          const isActive = currentIndex === stageIndex;
          const isPast = currentIndex > stageIndex;
          const isStageCompleted = isPast || (isCompleted && stageIndex <= currentIndex);

          return (
            <div key={stage.key} className="flex items-center">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                    {
                      // Completed step
                      "bg-primary text-primary-foreground": isStageCompleted,
                      // Active step
                      "bg-primary/20 text-primary ring-2 ring-primary ring-offset-2":
                        isActive && !isFailed,
                      // Failed state
                      "bg-destructive/20 text-destructive ring-2 ring-destructive ring-offset-2":
                        isActive && isFailed,
                      // Pending step
                      "bg-muted text-muted-foreground": !isStageCompleted && !isActive,
                    }
                  )}
                >
                  {isStageCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : isActive ? (
                    isFailed ? (
                      <Circle className="w-5 h-5" />
                    ) : (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    )
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </div>

                {/* Step Label */}
                <div className="mt-2 text-center">
                  <p
                    className={cn("text-xs font-medium", {
                      "text-primary": isStageCompleted || isActive,
                      "text-muted-foreground": !isStageCompleted && !isActive,
                      "text-destructive": isActive && isFailed,
                    })}
                  >
                    {stage.label}
                  </p>
                  {stage.estimatedSeconds > 0 && (
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      약 {stage.estimatedSeconds}초
                    </p>
                  )}
                </div>
              </div>

              {/* Connector Line */}
              {index < displayStages.length - 1 && (
                <div
                  className={cn(
                    "w-12 sm:w-20 h-0.5 mx-2 transition-colors duration-300",
                    {
                      "bg-primary": isPast,
                      "bg-muted": !isPast,
                    }
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
