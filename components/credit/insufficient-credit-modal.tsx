"use client";

import { useRouter } from "next/navigation";
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
import { Coins } from "lucide-react";
import { formatCredits, VIDEO_GENERATION_COST } from "@/lib/constants/credits";

interface InsufficientCreditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentBalance: number;
}

export function InsufficientCreditModal({
  open,
  onOpenChange,
  currentBalance,
}: InsufficientCreditModalProps) {
  const router = useRouter();

  const requiredCredits = VIDEO_GENERATION_COST;
  const shortfall = requiredCredits - currentBalance;

  const handleCharge = () => {
    onOpenChange(false);
    router.push("/pricing");
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="mx-auto mb-4 rounded-full bg-destructive/10 p-4">
            <Coins className="h-8 w-8 text-destructive" />
          </div>
          <AlertDialogTitle className="text-center">
            크레딧이 부족합니다
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            영상 생성에 필요한 크레딧이 부족합니다.
            <br />
            크레딧을 충전한 후 다시 시도해주세요.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="rounded-lg bg-muted p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">현재 보유 크레딧</span>
            <span>{formatCredits(currentBalance)} 크레딧</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">필요 크레딧</span>
            <span>{formatCredits(requiredCredits)} 크레딧</span>
          </div>
          <div className="flex justify-between text-sm font-semibold text-destructive border-t pt-2">
            <span>부족 크레딧</span>
            <span>{formatCredits(shortfall)} 크레딧</span>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>취소</AlertDialogCancel>
          <AlertDialogAction onClick={handleCharge}>
            크레딧 충전하기
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
