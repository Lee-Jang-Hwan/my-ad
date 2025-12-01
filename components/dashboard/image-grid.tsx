"use client";

import { ImageCard } from "./image-card";
import { EmptyState } from "./empty-state";
import type { AdImage } from "@/types/ad-image";

interface ImageWithProductName extends AdImage {
  product_name?: string;
}

interface ImageGridProps {
  images: ImageWithProductName[];
  statusFilter: string;
  onImageDeleted?: () => void;
}

/**
 * Image grid component for dashboard
 * Displays images in a responsive grid layout with 1:1 aspect ratio
 */
export function ImageGrid({ images, statusFilter, onImageDeleted }: ImageGridProps) {
  if (images.length === 0) {
    return (
      <EmptyState
        title="이미지가 없습니다"
        description={
          statusFilter === "all"
            ? "아직 생성된 이미지가 없습니다. 새 이미지를 만들어보세요!"
            : `${getStatusLabel(statusFilter)} 상태의 이미지가 없습니다.`
        }
        actionLabel="이미지 만들기"
        actionHref="/image"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {images.map((image) => (
        <ImageCard
          key={image.id}
          image={image}
          onDelete={onImageDeleted}
        />
      ))}
    </div>
  );
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: "대기중",
    processing: "생성중",
    completed: "완료",
    failed: "실패",
    cancelled: "취소됨",
  };
  return labels[status] || status;
}
