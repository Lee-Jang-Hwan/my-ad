"use client";

import { Loader2 } from "lucide-react";
import type { LoadingAnimationProps } from "@/types/generation";
import { STAGE_LABELS } from "@/constants/generation";

/**
 * Loading animation component for generation progress
 * Shows spinning loader with current stage label
 */
export function LoadingAnimation({ stage }: LoadingAnimationProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 space-y-4">
      <div className="relative">
        {/* Outer ring */}
        <div className="w-24 h-24 rounded-full border-4 border-primary/20" />

        {/* Spinning loader */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </div>
      </div>

      <div className="text-center space-y-2">
        <p className="text-lg font-semibold">{STAGE_LABELS[stage]}</p>
        <p className="text-sm text-muted-foreground">
          영상을 생성하고 있습니다. 잠시만 기다려주세요.
        </p>
      </div>
    </div>
  );
}
