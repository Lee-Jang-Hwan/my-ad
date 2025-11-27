"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { loadTossPayments, type TossPaymentsWidgets } from "@tosspayments/tosspayments-sdk";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Loader2, AlertCircle, ShoppingCart, Coins, CreditCard, Shield, ChevronLeft } from "lucide-react";
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
  const paymentMethodRef = useRef<HTMLDivElement>(null);
  const agreementRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    async function initializeWidgets() {
      if (isInitialized.current) return;
      if (!paymentMethodRef.current || !agreementRef.current) return;

      isInitialized.current = true;

      try {
        const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
        if (!clientKey) {
          throw new Error("결제 설정이 올바르지 않습니다.");
        }

        const tossPayments = await loadTossPayments(clientKey);
        const widgetInstance = tossPayments.widgets({ customerKey });

        await widgetInstance.setAmount({
          value: amount,
          currency: "KRW",
        });

        await widgetInstance.renderPaymentMethods({
          selector: "#payment-method",
          variantKey: "DEFAULT",
        });

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

    const timer = setTimeout(() => {
      initializeWidgets();
    }, 100);

    return () => clearTimeout(timer);
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

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Order Summary Card */}
      <Card className="border-2">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">주문 정보</h2>
              <p className="text-sm text-muted-foreground">결제 전 주문 내용을 확인해주세요</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted/50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4 text-yellow-500" />
                <span className="text-muted-foreground">상품명</span>
              </div>
              <span className="font-medium">{pricingTier.display_name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">충전 크레딧</span>
              <span className="font-medium text-primary">{formatCredits(pricingTier.credits)} 크레딧</span>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between py-2">
            <span className="text-lg font-semibold">총 결제 금액</span>
            <span className="text-2xl font-bold text-primary">{formatPrice(amount)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-blue-500/10 p-2">
              <CreditCard className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold">결제 수단</h2>
              <p className="text-sm text-muted-foreground">원하시는 결제 방법을 선택해주세요</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-muted-foreground">결제 위젯을 불러오는 중...</p>
            </div>
          )}

          {/* TossPayments Widget Containers */}
          <div
            id="payment-method"
            ref={paymentMethodRef}
            className={`min-h-[200px] ${isLoading ? 'hidden' : ''}`}
          />
          <div
            id="agreement"
            ref={agreementRef}
            className={`min-h-[50px] ${isLoading ? 'hidden' : ''}`}
          />
        </CardContent>

        <CardFooter className="flex flex-col gap-4 pt-4">
          {/* Security Notice */}
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground w-full">
            <Shield className="h-4 w-4" />
            <span>토스페이먼츠 보안 결제</span>
          </div>

          <div className="flex gap-3 w-full">
            <Button
              variant="outline"
              className="flex-1 h-12"
              onClick={handleCancel}
              disabled={isProcessing}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              취소
            </Button>
            <Button
              className="flex-[2] h-12 text-base font-semibold"
              onClick={handlePayment}
              disabled={isProcessing || !widgets || isLoading}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  결제 처리 중...
                </>
              ) : (
                `${formatPrice(amount)} 결제하기`
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
