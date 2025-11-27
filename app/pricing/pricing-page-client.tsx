"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PricingGrid } from "@/components/payment/pricing-grid";
import { PaymentWidget } from "@/components/payment/payment-widget";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CreditCard } from "lucide-react";
import { createOrder } from "@/actions/payment/create-order";
import { generateCustomerKey } from "@/lib/tosspayments/client";
import type { PricingTier } from "@/types/payment";

interface PricingPageClientProps {
  tiers: PricingTier[];
  userId: string;
}

export function PricingPageClient({ tiers, userId }: PricingPageClientProps) {
  const [selectedTier, setSelectedTier] = useState<PricingTier | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const customerKey = generateCustomerKey(userId);

  const handleSelectTier = async (tier: PricingTier) => {
    setIsLoading(true);

    try {
      const result = await createOrder(tier.id);

      if (!result.success || !result.orderId) {
        toast.error(result.error || "주문 생성에 실패했습니다.");
        setIsLoading(false);
        return;
      }

      setSelectedTier(tier);
      setOrderId(result.orderId);
    } catch (error) {
      console.error("Create order error:", error);
      toast.error("주문 생성 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setSelectedTier(null);
    setOrderId(null);
  };

  // Show payment widget if tier is selected
  if (selectedTier && orderId) {
    return (
      <div className="max-w-2xl mx-auto">
        <Button
          variant="ghost"
          className="mb-6 hover:bg-muted"
          onClick={handleBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          상품 선택으로 돌아가기
        </Button>

        {/* Payment Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-500/10 px-4 py-2 mb-3">
            <CreditCard className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium text-blue-500">결제하기</span>
          </div>
          <h2 className="text-2xl font-bold">
            {selectedTier.display_name} 결제
          </h2>
        </div>

        <PaymentWidget
          orderId={orderId}
          orderName={selectedTier.display_name}
          amount={selectedTier.sale_price}
          customerKey={customerKey}
          pricingTier={selectedTier}
        />
      </div>
    );
  }

  // Show pricing grid
  return (
    <div className="max-w-5xl mx-auto">
      <PricingGrid
        tiers={tiers}
        onSelect={handleSelectTier}
        isLoading={isLoading}
      />
    </div>
  );
}
