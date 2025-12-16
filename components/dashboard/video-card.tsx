"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, AlertCircle, Trash2, Star } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteVideo } from "@/actions/delete-video";
import { toggleVideoPublic } from "@/actions/toggle-video-public";
import { toast } from "sonner";
import type { VideoWithProductName } from "@/types/dashboard";
import { cn } from "@/lib/utils";

interface VideoCardProps {
  video: VideoWithProductName & { is_featured?: boolean };
  onDelete?: () => void;
  onPublicToggle?: () => void;
}

/**
 * Video card component for dashboard grid
 * Displays thumbnail, product name, status, and action button
 */
export function VideoCard({ video, onDelete, onPublicToggle }: VideoCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isTogglingPublic, setIsTogglingPublic] = useState(false);
  const [isPublic, setIsPublic] = useState(video.is_featured || false);

  // Determine link destination based on status
  const linkHref =
    video.status === "completed" && video.video_url
      ? `/video/${video.id}`
      : `/generation/${video.id}`;

  // Format date
  const createdDate = new Date(video.created_at).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Get status badge configuration
  const statusConfig = getStatusConfig(video.status);

  // Determine what to display as thumbnail
  const shouldShowVideo =
    video.status === "completed" && video.video_url && (!video.thumbnail_url || imageError);

  // Handle delete
  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      const result = await deleteVideo(video.id);

      if (!result.success) {
        toast.error(result.error || "영상 삭제 중 오류가 발생했습니다.");
        return;
      }

      toast.success("영상이 삭제되었습니다.");

      // Call optional callback to refresh list
      if (onDelete) {
        onDelete();
      }

      // Close dialog
      setDeleteDialogOpen(false);
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("영상 삭제 중 오류가 발생했습니다.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle toggle public status
  const handleTogglePublic = async () => {
    try {
      setIsTogglingPublic(true);

      const newIsPublic = !isPublic;
      const result = await toggleVideoPublic(video.id, newIsPublic);

      if (!result.success) {
        toast.error(result.error || "공개 상태 변경 중 오류가 발생했습니다.");
        return;
      }

      setIsPublic(newIsPublic);
      toast.success(newIsPublic ? "홈 화면에 게시되었습니다." : "게시가 취소되었습니다.");

      // Call optional callback to refresh list
      if (onPublicToggle) {
        onPublicToggle();
      }
    } catch (err) {
      console.error("Toggle public error:", err);
      toast.error("공개 상태 변경 중 오류가 발생했습니다.");
    } finally {
      setIsTogglingPublic(false);
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
      {/* Thumbnail */}
      <Link href={linkHref} className="block relative aspect-video bg-muted">
        {!imageError && video.thumbnail_url ? (
          // Show thumbnail image
          <Image
            src={video.thumbnail_url}
            alt={video.product_name || "영상 썸네일"}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            onError={() => setImageError(true)}
            priority={false}
          />
        ) : shouldShowVideo ? (
          // Show video first frame if no thumbnail
          <video
            src={`${video.video_url}#t=0.1`}
            className="w-full h-full object-cover"
            preload="none"
            muted
            playsInline
          >
            <track kind="captions" />
          </video>
        ) : (
          // Show placeholder
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                {video.status === "completed" ? "썸네일 없음" : "생성 중"}
              </p>
            </div>
          </div>
        )}

        {/* Status badge overlay */}
        <div className="absolute top-2 right-2">
          <Badge
            variant={statusConfig.variant as any}
            className={cn("shadow-sm", statusConfig.className)}
          >
            {statusConfig.label}
          </Badge>
        </div>
      </Link>

      <CardContent className="pt-4 pb-3 space-y-2">
        {/* Product name */}
        <h3 className="font-semibold text-base line-clamp-2 min-h-[3rem]">
          {video.product_name || "알 수 없는 상품"}
        </h3>

        {/* Metadata */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{createdDate}</span>
          </div>

          {video.duration && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{video.duration}초</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-0 pb-4 flex gap-2">
        <Button asChild variant="outline" size="sm" className="flex-1">
          <Link href={linkHref}>
            {video.status === "completed" ? "영상 보기" : "진행 상태 보기"}
          </Link>
        </Button>

        {/* Public toggle button - only show for completed videos */}
        {video.status === "completed" && (
          <Button
            variant="outline"
            size="sm"
            disabled={isTogglingPublic}
            onClick={handleTogglePublic}
            className={cn(
              "transition-all duration-300",
              isPublic
                ? "text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-500/10"
                : "text-muted-foreground hover:text-foreground"
            )}
            title={isPublic ? "홈 화면에서 제거" : "홈 화면에 게시"}
          >
            <Star
              className={cn(
                "w-4 h-4 transition-all duration-300",
                isPublic && "fill-yellow-500 drop-shadow-[0_0_6px_rgba(234,179,8,0.8)]"
              )}
            />
          </Button>
        )}

        {/* Delete button with confirmation dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              disabled={isDeleting}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>영상을 삭제하시겠습니까?</AlertDialogTitle>
              <AlertDialogDescription>
                이 작업은 되돌릴 수 없습니다. 영상과 관련된 모든 데이터가 영구적으로 삭제됩니다.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>
                취소
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault();
                  handleDelete();
                }}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? "삭제 중..." : "삭제"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}

/**
 * Get status badge configuration
 */
function getStatusConfig(status: string) {
  const configs = {
    pending: {
      label: "대기중",
      variant: "secondary",
      className: "bg-gray-500/90 text-white",
    },
    processing: {
      label: "생성중",
      variant: "default",
      className: "bg-blue-500/90 text-white",
    },
    completed: {
      label: "완료",
      variant: "default",
      className: "bg-green-500/90 text-white",
    },
    failed: {
      label: "실패",
      variant: "destructive",
      className: "bg-red-500/90 text-white",
    },
    cancelled: {
      label: "취소됨",
      variant: "destructive",
      className: "bg-orange-500/90 text-white",
    },
  };

  return (
    configs[status as keyof typeof configs] || {
      label: status,
      variant: "secondary",
      className: "",
    }
  );
}
