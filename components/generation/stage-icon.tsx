"use client";

import {
  Loader2,
  FileText,
  ImagePlus,
  Video,
  Mic,
  Subtitles,
  Combine,
  CheckCircle,
  XCircle,
} from "lucide-react";
import type { StageIconProps } from "@/types/generation";
import { cn } from "@/lib/utils";

const ICON_MAP = {
  Loader2,
  FileText,
  ImagePlus,
  Video,
  Mic,
  Subtitles,
  Combine,
  CheckCircle,
};

/**
 * Stage icon component with dynamic state styling
 */
export function StageIcon({
  stage,
  isActive,
  isCompleted,
  isFailed,
}: StageIconProps) {
  // Determine which icon to show
  let IconComponent;
  if (isFailed) {
    IconComponent = XCircle;
  } else if (isCompleted) {
    IconComponent = CheckCircle;
  } else {
    // Map stage to icon (from constants/generation.ts)
    const iconMap: Record<string, keyof typeof ICON_MAP> = {
      init: "Loader2",
      ad_copy_generation: "FileText",
      image_refinement: "ImagePlus",
      video_generation: "Video",
      tts_generation: "Mic",
      subtitle_generation: "Subtitles",
      merging: "Combine",
      completed: "CheckCircle",
    };
    IconComponent = ICON_MAP[iconMap[stage]];
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300",
        {
          // Failed state
          "bg-destructive/10 text-destructive": isFailed,
          // Completed state
          "bg-primary text-primary-foreground": isCompleted && !isFailed,
          // Active state
          "bg-primary/20 text-primary animate-pulse": isActive && !isFailed,
          // Pending state
          "bg-muted text-muted-foreground":
            !isActive && !isCompleted && !isFailed,
        }
      )}
    >
      <IconComponent
        className={cn("w-6 h-6", {
          "animate-spin": isActive && stage === "init",
        })}
      />
    </div>
  );
}
