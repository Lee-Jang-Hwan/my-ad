"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Film,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { deleteStoryboard } from "@/actions/storyboard";
import type { StoryboardListItem, StoryboardStatus } from "@/types/storyboard";

interface StoryboardCardProps {
  storyboard: StoryboardListItem;
  onDeleted?: () => void;
}

const statusConfig: Record<
  StoryboardStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }
> = {
  draft: {
    label: "편집 중",
    variant: "secondary",
    icon: <Pencil className="w-3 h-3" />,
  },
  generating: {
    label: "생성 중",
    variant: "default",
    icon: <Loader2 className="w-3 h-3 animate-spin" />,
  },
  completed: {
    label: "완료",
    variant: "outline",
    icon: <CheckCircle className="w-3 h-3 text-green-500" />,
  },
  failed: {
    label: "실패",
    variant: "destructive",
    icon: <AlertCircle className="w-3 h-3" />,
  },
};

export function StoryboardCard({ storyboard, onDeleted }: StoryboardCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const status = statusConfig[storyboard.status];
  const timeAgo = formatDistanceToNow(new Date(storyboard.created_at), {
    addSuffix: true,
    locale: ko,
  });

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteStoryboard(storyboard.id);
    setIsDeleting(false);
    setShowDeleteDialog(false);

    if (result.success) {
      onDeleted?.();
    }
  };

  const editUrl =
    storyboard.status === "generating"
      ? `/storyboard/${storyboard.id}/generate`
      : `/storyboard/${storyboard.id}`;

  return (
    <>
      <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
        <Link href={editUrl}>
          <div className="relative aspect-video bg-muted">
            {storyboard.final_thumbnail_url ? (
              <Image
                src={storyboard.final_thumbnail_url}
                alt={storyboard.title}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Film className="w-12 h-12 text-muted-foreground/30" />
              </div>
            )}
            {/* Status badge overlay */}
            <div className="absolute top-2 left-2">
              <Badge variant={status.variant} className="gap-1">
                {status.icon}
                {status.label}
              </Badge>
            </div>
            {/* Scene count */}
            <div className="absolute bottom-2 right-2">
              <Badge variant="secondary" className="bg-black/60 text-white">
                {storyboard.total_scenes}개 씬
              </Badge>
            </div>
          </div>
        </Link>

        <CardContent className="p-4">
          <Link href={editUrl}>
            <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
              {storyboard.title}
            </h3>
          </Link>
          {storyboard.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {storyboard.description}
            </p>
          )}
        </CardContent>

        <CardFooter className="p-4 pt-0 flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            {timeAgo}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="w-4 h-4" />
                <span className="sr-only">더보기</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={editUrl}>
                  <Pencil className="w-4 h-4 mr-2" />
                  편집하기
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                삭제하기
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardFooter>
      </Card>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>스토리보드 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{storyboard.title}&quot; 스토리보드를 삭제하시겠습니까?
              <br />
              삭제된 스토리보드는 복구할 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  삭제 중...
                </>
              ) : (
                "삭제"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
