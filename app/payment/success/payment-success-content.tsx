"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PaymentResult } from "@/components/payment/payment-result";
import { confirmPayment } from "@/actions/payment/confirm-payment";
import { Loader2 } from "lucide-react";

export function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);
  const [result, setResult] = useState<{
    success: boolean;
    orderId?: string;
    amount?: number;
    creditsGranted?: number;
    errorMessage?: string;
  } | null>(null);

  useEffect(() => {
    async function processPayment() {
      const paymentKey = searchParams.get("paymentKey");
      const orderId = searchParams.get("orderId");
      const amount = searchParams.get("amount");

      if (!paymentKey || !orderId || !amount) {
        setResult({
          success: false,
          errorMessage: "결제 정보가 올바르지 않습니다.",
        });
        setIsProcessing(false);
        return;
      }

      try {
        const confirmResult = await confirmPayment(
          paymentKey,
          orderId,
          parseInt(amount, 10),
        );

        if (confirmResult.success) {
          setResult({
            success: true,
            orderId,
            amount: parseInt(amount, 10),
            creditsGranted: confirmResult.creditsGranted,
          });
        } else {
          setResult({
            success: false,
            errorMessage: confirmResult.error || "결제 승인에 실패했습니다.",
          });
        }
      } catch (error) {
        console.error("Payment confirmation error:", error);
        setResult({
          success: false,
          errorMessage: "결제 처리 중 오류가 발생했습니다.",
        });
      } finally {
        setIsProcessing(false);
      }
    }

    processPayment();
  }, [searchParams]);

  if (isProcessing) {
    return (
      <div className="flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-lg text-muted-foreground">결제를 확인하고 있습니다...</p>
      </div>
    );
  }

  if (!result) {
    return (
      <PaymentResult
        success={false}
        errorMessage="결제 정보를 확인할 수 없습니다."
      />
    );
  }

  return (
    <PaymentResult
      success={result.success}
      orderId={result.orderId}
      amount={result.amount}
      creditsGranted={result.creditsGranted}
      errorMessage={result.errorMessage}
    />
  );
}
