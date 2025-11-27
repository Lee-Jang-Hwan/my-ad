export const dynamic = "force-dynamic";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getPricingTiers } from "@/actions/payment/create-order";
import { PricingPageClient } from "./pricing-page-client";
import { CreditDisplay } from "@/components/credit/credit-display";

export default async function PricingPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const tiers = await getPricingTiers();

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="flex justify-center mb-12">
        <CreditDisplay showButton={false} className="max-w-md" />
      </div>

      <PricingPageClient tiers={tiers} userId={userId} />
    </div>
  );
}
