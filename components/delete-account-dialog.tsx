"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { deleteAccount } from "@/actions/account/delete-account";
import { toast } from "sonner";

interface DeleteAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteAccountDialog({
  open,
  onOpenChange,
}: DeleteAccountDialogProps) {
  const [confirmText, setConfirmText] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { signOut } = useClerk();

  const isConfirmValid = confirmText === "회원탈퇴";

  const handleDelete = () => {
    if (!isConfirmValid) return;

    startTransition(async () => {
      const result = await deleteAccount();

      if (result.success) {
        toast.success("회원탈퇴가 완료되었습니다.");
        await signOut();
        router.push("/");
      } else {
        toast.error(result.error || "회원탈퇴 처리 중 오류가 발생했습니다.");
      }
    });
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isPending) {
      setConfirmText("");
      onOpenChange(newOpen);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-destructive">
            회원탈퇴
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2">
              <p>회원탈퇴 시 모든 데이터가 삭제되며 복구가 불가능합니다.</p>
              <ul className="text-sm list-disc list-inside text-muted-foreground">
                <li>생성된 모든 영상 및 이미지</li>
                <li>잔여 크레딧</li>
                <li>결제 내역</li>
                <li>계정 정보</li>
              </ul>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-2 py-4">
          <p className="text-sm text-muted-foreground">
            회원탈퇴를 원하시면 아래에{" "}
            <strong className="text-foreground">&apos;회원탈퇴&apos;</strong>를
            입력하고 확인을 눌러주세요.
          </p>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="회원탈퇴"
            disabled={isPending}
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>취소</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={!isConfirmValid || isPending}
          >
            {isPending ? "처리 중..." : "확인"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
