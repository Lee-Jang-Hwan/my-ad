"use client";

import { Clock } from "lucide-react";

interface ImageEstimatedTimeProps {
  remainingSeconds: number;
}

/**
 * Displays estimated remaining time for image generation
 */
export function ImageEstimatedTime({ remainingSeconds }: ImageEstimatedTimeProps) {
  if (remainingSeconds <= 0) {
    return null;
  }

  // Format time
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  let timeText: string;
  if (minutes > 0) {
    timeText = seconds > 0 ? `약 ${minutes}분 ${seconds}초` : `약 ${minutes}분`;
  } else {
    timeText = `약 ${seconds}초`;
  }

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Clock className="w-4 h-4" />
      <span>예상 남은 시간: {timeText}</span>
    </div>
  );
}
