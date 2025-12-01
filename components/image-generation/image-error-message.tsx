"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ImageErrorMessageProps {
  message: string;
  adImageId: string;
}

/**
 * Error message display for failed image generation
 */
export function ImageErrorMessage({ message, adImageId }: ImageErrorMessageProps) {
  return (
    <div className="rounded-lg bg-destructive/10 p-6 space-y-4">
      <div className="flex items-center gap-3">
        <AlertTriangle className="w-6 h-6 text-destructive" />
        <div>
          <h4 className="font-semibold text-destructive">이미지 생성 실패</h4>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="outline" asChild>
          <Link href="/image">
            <RefreshCw className="w-4 h-4 mr-2" />
            다시 시도
          </Link>
        </Button>
        <Button variant="ghost" asChild>
          <Link href="/dashboard">대시보드로 이동</Link>
        </Button>
      </div>
    </div>
  );
}
