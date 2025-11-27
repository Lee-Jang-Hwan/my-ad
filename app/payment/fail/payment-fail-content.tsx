"use client";

import { useSearchParams } from "next/navigation";
import { PaymentResult } from "@/components/payment/payment-result";

export function PaymentFailContent() {
  const searchParams = useSearchParams();

  const code = searchParams.get("code");
  const message = searchParams.get("message");

  // Decode message if it's URL encoded
  const decodedMessage = message ? decodeURIComponent(message) : null;

  let errorMessage = "결제 처리 중 문제가 발생했습니다.";

  if (code && decodedMessage) {
    errorMessage = `${decodedMessage} (코드: ${code})`;
  } else if (decodedMessage) {
    errorMessage = decodedMessage;
  } else if (code) {
    errorMessage = `결제 실패 (코드: ${code})`;
  }

  return <PaymentResult success={false} errorMessage={errorMessage} />;
}
