"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { CheckCircle, XCircle, Coins, Receipt, Video, Home, RefreshCw, Sparkles, ImageIcon } from "lucide-react";
import { formatPrice, formatCredits } from "@/lib/constants/credits";

interface PaymentResultProps {
  success: boolean;
  orderId?: string;
  amount?: number;
  creditsGranted?: number;
  errorMessage?: string;
}

export function PaymentResult({
  success,
  orderId,
  amount,
  creditsGranted,
  errorMessage,
}: PaymentResultProps) {
  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto text-center border-2 border-green-200 dark:border-green-900">
        <CardHeader className="pb-4">
          <div className="mx-auto mb-4 relative">
            <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" />
            <div className="relative rounded-full bg-green-500/10 p-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-green-600 dark:text-green-400">결제 완료</h2>
          <p className="text-muted-foreground mt-1">
            결제가 성공적으로 완료되었습니다
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="rounded-xl bg-muted/50 p-5 space-y-4">
            {orderId && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Receipt className="h-4 w-4" />
                  <span>주문번호</span>
                </div>
                <span className="font-mono text-xs bg-muted px-2 py-1 rounded">{orderId}</span>
              </div>
            )}
            {amount && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">결제금액</span>
                <span className="font-medium">{formatPrice(amount)}</span>
              </div>
            )}
            {creditsGranted && (
              <>
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Coins className="h-5 w-5 text-yellow-500" />
                      <span className="font-medium">충전된 크레딧</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Sparkles className="h-4 w-4 text-green-500" />
                      <span className="text-xl font-bold text-green-600 dark:text-green-400">
                        +{formatCredits(creditsGranted)}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pt-2">
          <Button asChild className="w-full h-12 text-base font-semibold" size="lg">
            <Link href="/video">
              <Video className="mr-2 h-5 w-5" />
              영상 생성하러 가기
            </Link>
          </Button>
          <Button asChild className="w-full h-12 text-base font-semibold" size="lg">
            <Link href="/image">
              <ImageIcon className="mr-2 h-5 w-5" />
              이미지 생성하러 가기
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full h-11">
            <Link href="/dashboard">마이 페이지</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto text-center border-2 border-destructive/20">
      <CardHeader className="pb-4">
        <div className="mx-auto mb-4">
          <div className="rounded-full bg-destructive/10 p-4">
            <XCircle className="h-16 w-16 text-destructive" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-destructive">결제 실패</h2>
        <p className="text-muted-foreground mt-1">
          결제 처리 중 문제가 발생했습니다
        </p>
      </CardHeader>

      <CardContent>
        {errorMessage && (
          <div className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive border border-destructive/20">
            <p className="font-medium">{errorMessage}</p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-3 pt-2">
        <Button asChild className="w-full h-12 text-base font-semibold" size="lg">
          <Link href="/pricing">
            <RefreshCw className="mr-2 h-5 w-5" />
            다시 시도하기
          </Link>
        </Button>
        <Button asChild variant="outline" className="w-full h-11">
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            홈으로 돌아가기
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
