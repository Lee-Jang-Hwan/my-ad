import { Calendar, Clock, HardDrive } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { VideoDetailData } from "@/types/video-detail";
import { formatFileSize, formatDuration, formatDate } from "@/lib/format-utils";
import { cn } from "@/lib/utils";

interface VideoInfoProps {
  video: VideoDetailData;
}

/**
 * Display video metadata and information
 * Shows product name, status, date, duration, file size
 */
export function VideoInfo({ video }: VideoInfoProps) {
  const statusConfig = getStatusConfig(video.status);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="text-2xl">
            {video.product_name || "알 수 없는 상품"}
          </CardTitle>
          <Badge
            variant={statusConfig.variant as any}
            className={cn(statusConfig.className)}
          >
            {statusConfig.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Metadata grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Created date */}
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">생성일</p>
              <p className="font-medium">{formatDate(video.created_at)}</p>
            </div>
          </div>

          {/* Duration */}
          {video.duration && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">영상 길이</p>
                <p className="font-medium">{formatDuration(video.duration)}</p>
              </div>
            </div>
          )}

          {/* File size */}
          {video.file_size && (
            <div className="flex items-center gap-2 text-sm">
              <HardDrive className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">파일 크기</p>
                <p className="font-medium">{formatFileSize(video.file_size)}</p>
              </div>
            </div>
          )}
        </div>

        {/* Error message if failed */}
        {video.status === "failed" && video.error_message && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm text-destructive">{video.error_message}</p>
          </div>
        )}
      </CardContent>
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
      className: "bg-gray-500 text-white",
    },
    processing: {
      label: "생성중",
      variant: "default",
      className: "bg-blue-500 text-white",
    },
    completed: {
      label: "완료",
      variant: "default",
      className: "bg-green-500 text-white",
    },
    failed: {
      label: "실패",
      variant: "destructive",
      className: "bg-red-500 text-white",
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
