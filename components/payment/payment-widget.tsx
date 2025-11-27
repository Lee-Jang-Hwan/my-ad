"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { loadTossPayments, type TossPaymentsWidgets } from "@tosspayments/tosspayments-sdk";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";
import { formatPrice, formatCredits } from "@/lib/constants/credits";
import type { PricingTier } from "@/types/payment";

interface PaymentWidgetProps {
  orderId: string;
  orderName: string;
  amount: number;
  customerKey: string;
  pricingTier: PricingTier;
}

export function PaymentWidget({
  orderId,
  orderName,
  amount,
  customerKey,
  pricingTier,
}: PaymentWidgetProps) {
  const router = useRouter();
  const [widgets, setWidgets] = useState<TossPaymentsWidgets | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initializeWidgets() {
      try {
        const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
        if (!clientKey) {
          throw new Error("결제 설정이 올바르지 않습니다.");
        }

        const tossPayments = await loadTossPayments(clientKey);
        const widgetInstance = tossPayments.widgets({ customerKey });

        // Set amount
        await widgetInstance.setAmount({
          value: amount,
          currency: "KRW",
        });

        // Render payment methods
        await widgetInstance.renderPaymentMethods({
          selector: "#payment-method",
          variantKey: "DEFAULT",
        });

        // Render agreement
        await widgetInstance.renderAgreement({
          selector: "#agreement",
          variantKey: "AGREEMENT",
        });

        setWidgets(widgetInstance);
        setIsLoading(false);
      } catch (err) {
        console.error("Payment widget initialization error:", err);
        setError("결제 위젯을 불러오는데 실패했습니다.");
        setIsLoading(false);
      }
    }

    initializeWidgets();
  }, [amount, customerKey]);

  const handlePayment = useCallback(async () => {
    if (!widgets) return;

    setIsProcessing(true);
    setError(null);

    try {
      await widgets.requestPayment({
        orderId,
        orderName,
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`,
      });
    } catch (err) {
      // User cancelled or error occurred
      console.error("Payment request error:", err);
      if (err instanceof Error && err.message.includes("USER_CANCEL")) {
        setError("결제가 취소되었습니다.");
      } else {
        setError("결제 요청 중 오류가 발생했습니다.");
      }
      setIsProcessing(false);
    }
  }, [widgets, orderId, orderName]);

  const handleCancel = () => {
    router.push("/pricing");
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">결제 위젯 로딩 중...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>결제하기</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Order Summary */}
        <div className="rounded-lg border p-4 space-y-2">
          <h3 className="font-semibold">주문 정보</h3>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">상품</span>
            <span>{pricingTier.display_name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">크레딧</span>
            <span>{formatCredits(pricingTier.credits)} 크레딧</span>
          </div>
          <div className="flex justify-between font-semibold pt-2 border-t">
            <span>결제 금액</span>
            <span>{formatPrice(amount)}</span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* TossPayments Widget Containers */}
        <div id="payment-method" className="min-h-[200px]" />
        <div id="agreement" className="min-h-[50px]" />
      </CardContent>

      <CardFooter className="flex gap-4">
        <Button
          variant="outline"
          className="flex-1"
          onClick={handleCancel}
          disabled={isProcessing}
        >
          취소
        </Button>
        <Button
          className="flex-1"
          onClick={handlePayment}
          disabled={isProcessing || !widgets}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              처리 중...
            </>
          ) : (
            `${formatPrice(amount)} 결제하기`
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
