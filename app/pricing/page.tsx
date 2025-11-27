export const dynamic = "force-dynamic";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getPricingTiers } from "@/actions/payment/create-order";
import { PricingPageClient } from "./pricing-page-client";
import { CreditDisplay } from "@/components/credit/credit-display";
import { Coins } from "lucide-react";

export default async function PricingPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const tiers = await getPricingTiers();

  return (
    <div className="container mx-auto py-8 md:py-12 px-4">
      {/* Header Section */}
      <div className="text-center mb-8 md:mb-12">
        <div className="inline-flex items-center justify-center gap-2 rounded-full bg-primary/10 px-4 py-2 mb-4">
          <Coins className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium text-primary">크레딧 충전</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-3">
          크레딧을 충전하고 영상을 만들어보세요
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          더 많은 크레딧을 구매할수록 더 저렴하게 이용하실 수 있습니다
        </p>
      </div>

      {/* Current Balance */}
      <div className="flex justify-center mb-10">
        <CreditDisplay showButton={false} className="max-w-md w-full" />
      </div>

      {/* Pricing Grid */}
      <PricingPageClient tiers={tiers} userId={userId} />
    </div>
  );
}
