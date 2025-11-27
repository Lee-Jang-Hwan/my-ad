"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  formatPrice,
  formatCredits,
  calculateDiscountPercent,
} from "@/lib/constants/credits";
import { Coins, Sparkles, Check, Loader2 } from "lucide-react";
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
        "relative flex flex-col transition-all duration-300 hover:shadow-lg cursor-pointer group",
        isSelected && "ring-2 ring-primary shadow-lg scale-[1.02]",
        tier.is_popular && "border-primary border-2",
      )}
      onClick={() => !isLoading && onSelect(tier)}
    >
      {tier.is_popular && (
        <Badge
          variant="default"
          className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 text-sm font-semibold shadow-md"
        >
          <Sparkles className="h-3.5 w-3.5 mr-1" />
          인기
        </Badge>
      )}

      <CardHeader className="text-center pt-8 pb-4">
        <div className="mx-auto mb-3 rounded-full bg-primary/10 p-3 w-fit group-hover:bg-primary/20 transition-colors">
          <Coins className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-2xl font-bold">{tier.display_name}</h3>
        <p className="text-lg text-muted-foreground mt-1">
          {formatCredits(tier.credits)} 크레딧
        </p>
      </CardHeader>

      <CardContent className="flex-1 text-center py-4">
        <div className="space-y-3">
          <div className="space-y-1">
            {discountPercent > 0 && (
              <Badge
                variant="destructive"
                className="px-3 py-1 text-sm font-bold mb-1"
              >
                {discountPercent}% 할인
              </Badge>
            )}
            {discountPercent > 0 && (
              <p className="text-lg text-muted-foreground line-through">
                {formatPrice(tier.original_price)}
              </p>
            )}
            <p className="text-4xl font-bold text-primary">
              {formatPrice(tier.sale_price)}
            </p>
          </div>

        </div>
      </CardContent>

      <CardFooter className="pb-6 pt-2">
        <Button
          className={cn(
            "w-full h-12 text-base font-semibold transition-all",
            isSelected && "bg-primary"
          )}
          variant={isSelected ? "default" : "outline"}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              처리 중...
            </>
          ) : isSelected ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              선택됨
            </>
          ) : (
            "선택하기"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
