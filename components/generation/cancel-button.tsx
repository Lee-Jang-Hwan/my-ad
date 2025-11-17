"use client";

import { useState } from "react";
import { XCircle } from "lucide-react";
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
import { cancelGeneration } from "@/actions/cancel-generation";
import { toast } from "sonner";

interface CancelButtonProps {
  adVideoId: string;
  onCancel?: () => Promise<void>;
  disabled?: boolean;
}

/**
 * Cancel button component for ongoing generation
 * Shows confirmation dialog before cancelling
 */
export function CancelButton({ adVideoId, onCancel, disabled }: CancelButtonProps) {
  const [isCancelling, setIsCancelling] = useState(false);
  const [open, setOpen] = useState(false);

  const handleCancel = async () => {
    try {
      setIsCancelling(true);

      const result = await cancelGeneration(adVideoId);

      if (!result.success) {
        toast.error(result.error || "취소하는 중 오류가 발생했습니다.");
        return;
      }

      toast.success("영상 생성이 취소되었습니다.");

      // Call optional callback
      if (onCancel) {
        await onCancel();
      }

      // Close dialog
      setOpen(false);
    } catch (err) {
      console.error("Cancel error:", err);
      toast.error("취소하는 중 오류가 발생했습니다.");
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || isCancelling}
          className="text-destructive hover:text-destructive"
        >
          <XCircle className="w-4 h-4 mr-2" />
          취소
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>영상 생성을 취소하시겠습니까?</AlertDialogTitle>
          <AlertDialogDescription>
            진행 중인 영상 생성 작업이 중단됩니다. 이 작업은 되돌릴 수 없습니다.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isCancelling}>
            돌아가기
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleCancel();
            }}
            disabled={isCancelling}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isCancelling ? "취소 중..." : "네, 취소합니다"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
