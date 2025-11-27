"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, XCircle } from "lucide-react";
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
      <Card className="w-full max-w-md mx-auto text-center">
        <CardHeader>
          <div className="mx-auto mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl">결제 완료</CardTitle>
          <CardDescription>
            결제가 성공적으로 완료되었습니다.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4 space-y-2">
            {orderId && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">주문번호</span>
                <span className="font-mono">{orderId}</span>
              </div>
            )}
            {amount && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">결제금액</span>
                <span>{formatPrice(amount)}</span>
              </div>
            )}
            {creditsGranted && (
              <div className="flex justify-between text-sm font-semibold text-green-600">
                <span>충전된 크레딧</span>
                <span>+{formatCredits(creditsGranted)} 크레딧</span>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-2">
          <Button asChild className="w-full">
            <Link href="/">영상 생성하러 가기</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/my-videos">내 영상 보기</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto text-center">
      <CardHeader>
        <div className="mx-auto mb-4">
          <XCircle className="h-16 w-16 text-destructive" />
        </div>
        <CardTitle className="text-2xl">결제 실패</CardTitle>
        <CardDescription>
          결제 처리 중 문제가 발생했습니다.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {errorMessage && (
          <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
            {errorMessage}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-2">
        <Button asChild className="w-full">
          <Link href="/pricing">다시 시도하기</Link>
        </Button>
        <Button asChild variant="outline" className="w-full">
          <Link href="/">홈으로 돌아가기</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
