import { Suspense } from "react";
import { PaymentSuccessContent } from "./payment-success-content";
import { Loader2 } from "lucide-react";

export default function PaymentSuccessPage() {
  return (
    <div className="container mx-auto py-12 px-4 flex items-center justify-center min-h-[60vh]">
      <Suspense
        fallback={
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">결제 확인 중...</span>
          </div>
        }
      >
        <PaymentSuccessContent />
      </Suspense>
    </div>
  );
}
