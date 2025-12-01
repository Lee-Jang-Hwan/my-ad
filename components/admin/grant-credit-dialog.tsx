"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { grantCredit } from "@/actions/credit/grant-credit";
import { formatCredits } from "@/lib/constants/credits";

interface GrantCreditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
  currentBalance: number;
  onSuccess?: () => void;
}

export function GrantCreditDialog({
  open,
  onOpenChange,
  userId,
  userName,
  currentBalance,
  onSuccess,
}: GrantCreditDialogProps) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const creditAmount = parseInt(amount, 10);
    if (isNaN(creditAmount) || creditAmount <= 0) {
      toast.error("유효한 크레딧 수량을 입력해주세요.");
      return;
    }

    setIsLoading(true);

    try {
      const result = await grantCredit(userId, creditAmount, description || undefined);

      if (result.success) {
        toast.success(`${userName}님에게 ${formatCredits(creditAmount)} 크레딧을 부여했습니다.`);
        setAmount("");
        setDescription("");
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast.error(result.error || "크레딧 부여에 실패했습니다.");
      }
    } catch {
      toast.error("크레딧 부여 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>크레딧 부여</DialogTitle>
          <DialogDescription>
            {userName}님에게 크레딧을 부여합니다.
            <br />
            현재 잔액: {formatCredits(currentBalance)} 크레딧
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">크레딧 수량</Label>
              <Input
                id="amount"
                type="number"
                placeholder="100"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">사유 (선택)</Label>
              <Textarea
                id="description"
                placeholder="이벤트 당첨, 고객 보상 등"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              취소
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  처리 중...
                </>
              ) : (
                "부여하기"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
