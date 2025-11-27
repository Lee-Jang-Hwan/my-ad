"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  formatPrice,
  formatCredits,
  calculateDiscountPercent,
} from "@/lib/constants/credits";
import type { PricingTier } from "@/types/payment";

interface PricingCardProps {
  tier: PricingTier;
  onSelect: (tier: PricingTier) => void;
  isSelected?: boolean;
  isLoading?: boolean;
}

export function PricingCard({
  tier,
  onSelect,
  isSelected = false,
  isLoading = false,
}: PricingCardProps) {
  const discountPercent = calculateDiscountPercent(
    tier.original_price,
    tier.sale_price,
  );

  return (
    <Card
      className={cn(
        "relative flex flex-col transition-all duration-200",
        isSelected && "ring-2 ring-primary",
        tier.is_popular && "border-primary",
      )}
    >
      {tier.is_popular && (
        <Badge
          variant="default"
          className="absolute -top-3 left-1/2 -translate-x-1/2"
        >
          HOT
        </Badge>
      )}

      <CardHeader className="text-center py-8">
        <CardTitle className="text-2xl">{tier.display_name}</CardTitle>
        <CardDescription className="text-base mt-2">
          {formatCredits(tier.credits)} 크레딧
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 text-center py-6">
        <div className="space-y-4">
          {discountPercent > 0 && (
            <div className="flex items-center justify-center gap-3">
              <span className="text-base text-muted-foreground line-through">
                {formatPrice(tier.original_price)}
              </span>
              <Badge variant="secondary" className="text-sm px-3 py-1">
                {discountPercent}% OFF
              </Badge>
            </div>
          )}
          <div className="text-4xl font-bold">
            {formatPrice(tier.sale_price)}
          </div>
        </div>
      </CardContent>

      <CardFooter className="pb-8">
        <Button
          className="w-full h-12 text-base"
          variant={isSelected ? "default" : "outline"}
          onClick={() => onSelect(tier)}
          disabled={isLoading}
        >
          {isLoading ? "처리 중..." : isSelected ? "선택됨" : "선택하기"}
        </Button>
      </CardFooter>
    </Card>
  );
}
