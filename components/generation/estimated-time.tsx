"use client";

import { Clock } from "lucide-react";
import type { EstimatedTimeProps } from "@/types/generation";
import { formatTime } from "@/lib/generation-utils";

/**
 * Estimated time remaining component
 * Displays human-readable time format
 */
export function EstimatedTime({ remainingSeconds }: EstimatedTimeProps) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Clock className="w-4 h-4" />
      <span>예상 남은 시간: {formatTime(remainingSeconds)}</span>
    </div>
  );
}
