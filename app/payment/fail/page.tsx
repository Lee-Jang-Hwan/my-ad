import { Suspense } from "react";
import { PaymentFailContent } from "./payment-fail-content";

export default function PaymentFailPage() {
  return (
    <div className="container mx-auto py-12 px-4 flex items-center justify-center min-h-[60vh]">
      <Suspense fallback={<div>로딩 중...</div>}>
        <PaymentFailContent />
      </Suspense>
    </div>
  );
}
