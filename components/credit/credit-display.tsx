"use client";

import Link from "next/link";
import { Coins, Crown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatCredits, VIDEO_GENERATION_COST } from "@/lib/constants/credits";
import { useCreditBalance } from "@/hooks/use-credit-balance";

interface CreditDisplayProps {
  showButton?: boolean;
  className?: string;
  variant?: "default" | "compact";
}

export function CreditDisplay({
  showButton = true,
  className,
  variant = "default",
}: CreditDisplayProps) {
  const { balance, isAdmin, isLoading, error } = useCreditBalance();

  if (isLoading) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">로딩 중...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <span className="text-sm text-destructive">오류</span>
      </div>
    );
  }

  // Calculate how many videos can be generated
  const videosAvailable = Math.floor(balance / VIDEO_GENERATION_COST);

  if (variant === "compact") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {isAdmin ? (
          <Badge variant="default" className="gap-1">
            <Crown className="h-3 w-3" />
            관리자
          </Badge>
        ) : (
          <>
            <Coins className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-medium">
              {formatCredits(balance)}
            </span>
          </>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-lg border p-4",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        {isAdmin ? (
          <>
            <div className="rounded-full bg-primary/10 p-2">
              <Crown className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">관리자 계정</p>
              <p className="font-semibold">무제한 생성 가능</p>
            </div>
          </>
        ) : (
          <>
            <div className="rounded-full bg-yellow-500/10 p-2">
              <Coins className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">보유 크레딧</p>
              <p className="font-semibold">{formatCredits(balance)} 크레딧</p>
              <p className="text-xs text-muted-foreground">
                영상 {videosAvailable}개 생성 가능
              </p>
            </div>
          </>
        )}
      </div>

      {showButton && !isAdmin && (
        <Button asChild size="sm">
          <Link href="/pricing">충전하기</Link>
        </Button>
      )}
    </div>
  );
}
