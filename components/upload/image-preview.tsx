"use client";

import { Card } from "@/components/ui/card";
import type { ImageFile } from "@/types/upload";

interface ImagePreviewProps {
  image: ImageFile | null;
}

export function ImagePreview({ image }: ImagePreviewProps) {
  if (!image) {
    return null;
  }

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">이미지 미리보기</h3>
        <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image.preview}
            alt="Selected product"
            className="w-full h-full object-contain"
          />
        </div>
      </div>
    </Card>
  );
}
