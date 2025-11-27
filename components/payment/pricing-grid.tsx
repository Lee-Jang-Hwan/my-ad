"use client";

import { useState } from "react";
import { PricingCard } from "./pricing-card";
import type { PricingTier } from "@/types/payment";

interface PricingGridProps {
  tiers: PricingTier[];
  onSelect: (tier: PricingTier) => void;
  isLoading?: boolean;
}

export function PricingGrid({
  tiers,
  onSelect,
  isLoading = false,
}: PricingGridProps) {
  const [selectedTierId, setSelectedTierId] = useState<string | null>(null);

  const handleSelect = (tier: PricingTier) => {
    setSelectedTierId(tier.id);
    onSelect(tier);
  };

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {tiers.map((tier) => (
        <PricingCard
          key={tier.id}
          tier={tier}
          onSelect={handleSelect}
          isSelected={selectedTierId === tier.id}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
}
