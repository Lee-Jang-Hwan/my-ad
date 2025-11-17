"use client";

import type { StepIndicatorProps } from "@/types/generation";
import { STAGE_INFO } from "@/constants/generation";
import { StageIcon } from "./stage-icon";
import { isStageCompleted, isStageActive } from "@/lib/generation-utils";
import { cn } from "@/lib/utils";

/**
 * Step indicator showing all 8 generation stages
 * Displays current progress through the pipeline
 */
export function StepIndicator({
  currentStage,
  status,
}: StepIndicatorProps) {
  const isFailed = status === "failed";

  const currentStageIndex = STAGE_INFO.findIndex((s) => s.key === currentStage);
  const progressPercentage =
    currentStageIndex >= 0
      ? (currentStageIndex / (STAGE_INFO.length - 1)) * 100
      : 0;

  return (
    <div className="w-full space-y-4">
      <h2 className="text-xl font-semibold">진행 단계</h2>

      <div className="relative space-y-6">
        {STAGE_INFO.map((stage, index) => {
          const active = isStageActive(stage.key, currentStage);
          const completed = isStageCompleted(stage.key, currentStage);
          const stageFailed = isFailed && active;
          const isNotLastStage = index < STAGE_INFO.length - 1;

          // 연결선 상태 계산
          const lineCompleted = index < currentStageIndex - 1;
          const lineActive = index === currentStageIndex - 1;

          return (
            <div key={stage.key} className="relative">
              {/* Stage item */}
              <div className="relative flex items-start gap-4">
                {/* Icon */}
                <div className="relative z-10">
                  <StageIcon
                    stage={stage.key}
                    isActive={active}
                    isCompleted={completed}
                    isFailed={stageFailed}
                  />
                </div>

                {/* Stage info */}
                <div className="flex-1 pt-2">
                  <h3
                    className={cn("font-semibold transition-colors", {
                      "text-primary": active && !isFailed,
                      "text-destructive": stageFailed,
                      "text-foreground": completed && !isFailed,
                      "text-muted-foreground": !active && !completed,
                    })}
                  >
                    {stage.label}
                  </h3>
                  <p
                    className={cn("text-sm mt-1 transition-colors", {
                      "text-muted-foreground": !active,
                      "text-foreground": active && !isFailed,
                      "text-destructive": stageFailed,
                    })}
                  >
                    {stage.description}
                  </p>
                </div>
              </div>

              {/* Connecting arrow to next stage */}
              {isNotLastStage && (
                <div className="absolute left-6 top-12 w-0.5 h-10 -translate-x-1/2">
                  {/* Background dashed arrow pattern */}
                  <svg
                    className="absolute inset-0 w-full h-full"
                    viewBox="0 0 2 40"
                    fill="none"
                    preserveAspectRatio="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Dashed line with arrow */}
                    <line
                      x1="1"
                      y1="0"
                      x2="1"
                      y2="32"
                      stroke="hsl(var(--muted))"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                      strokeLinecap="round"
                    />
                    {/* Arrow head */}
                    <path
                      d="M1 40L-2 33L4 33Z"
                      fill="hsl(var(--muted))"
                    />
                  </svg>

                  {/* Active/Completed arrow with wave animation */}
                  {(lineCompleted || lineActive) && (
                    <div className="absolute inset-0 overflow-visible">
                      <svg
                        className="absolute inset-0 w-full h-full"
                        viewBox="0 0 2 40"
                        fill="none"
                        preserveAspectRatio="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        {/* Animated gradient line */}
                        <defs>
                          {lineActive && (
                            <linearGradient id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0">
                                <animate
                                  attributeName="offset"
                                  values="0;0.2;0.4"
                                  dur="2s"
                                  repeatCount="indefinite"
                                />
                              </stop>
                              <stop offset="20%" stopColor="hsl(var(--primary))" stopOpacity="1">
                                <animate
                                  attributeName="offset"
                                  values="0.2;0.4;0.6"
                                  dur="2s"
                                  repeatCount="indefinite"
                                />
                              </stop>
                              <stop offset="40%" stopColor="hsl(var(--primary))" stopOpacity="0.8">
                                <animate
                                  attributeName="offset"
                                  values="0.4;0.6;0.8"
                                  dur="2s"
                                  repeatCount="indefinite"
                                />
                              </stop>
                              <stop offset="60%" stopColor="hsl(var(--primary))" stopOpacity="1">
                                <animate
                                  attributeName="offset"
                                  values="0.6;0.8;1"
                                  dur="2s"
                                  repeatCount="indefinite"
                                />
                              </stop>
                              <stop offset="80%" stopColor="hsl(var(--primary))" stopOpacity="0">
                                <animate
                                  attributeName="offset"
                                  values="0.8;1;1"
                                  dur="2s"
                                  repeatCount="indefinite"
                                />
                              </stop>
                            </linearGradient>
                          )}
                        </defs>

                        {/* Animated arrow line */}
                        <line
                          x1="1"
                          y1="0"
                          x2="1"
                          y2="32"
                          stroke={lineActive ? `url(#gradient-${index})` : "hsl(var(--primary))"}
                          strokeWidth="3"
                          strokeLinecap="round"
                        />

                        {/* Arrow head - animated for active, solid for completed */}
                        <path
                          d="M1 40L-2 33L4 33Z"
                          fill="hsl(var(--primary))"
                        >
                          {lineActive && (
                            <animate
                              attributeName="opacity"
                              values="0.5;1;0.5"
                              dur="2s"
                              repeatCount="indefinite"
                            />
                          )}
                        </path>
                      </svg>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
