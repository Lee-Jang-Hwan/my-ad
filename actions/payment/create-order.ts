"use server";

import { auth } from "@clerk/nextjs/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { generateOrderId } from "@/lib/constants/credits";
import type { CreateOrderResult, PricingTier } from "@/types/payment";

/**
 * Create a new payment order
 */
export async function createOrder(
  pricingTierId: string,
): Promise<CreateOrderResult> {
  try {
    // Check authentication
    const authResult = await auth();
    const clerkId = authResult.userId;

    if (!clerkId) {
      return {
        success: false,
        error: "로그인이 필요합니다.",
      };
    }

    // Create Supabase client with service role
    const supabase = createServiceRoleClient();

    // Get pricing tier
    const { data: tier, error: tierError } = await supabase
      .from("pricing_tiers")
      .select("*")
      .eq("id", pricingTierId)
      .eq("is_active", true)
      .single();

    if (tierError || !tier) {
      console.error("Pricing tier lookup error:", tierError);
      return {
        success: false,
        error: "선택한 상품을 찾을 수 없습니다.",
      };
    }

    const pricingTier = tier as PricingTier;

    // Generate unique order ID
    const orderId = generateOrderId();

    // Create payment record with pending status
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .insert({
        user_id: clerkId,
        pricing_tier_id: pricingTierId,
        order_id: orderId,
        amount: pricingTier.sale_price,
        status: "pending",
        credits_granted: 0,
      })
      .select("id")
      .single();

    if (paymentError || !payment) {
      console.error("Payment creation error:", paymentError);
      return {
        success: false,
        error: "주문 생성에 실패했습니다.",
      };
    }

    return {
      success: true,
      orderId,
    };
  } catch (error) {
    console.error("Create order error:", error);
    return {
      success: false,
      error: "주문 생성 중 오류가 발생했습니다.",
    };
  }
}

/**
 * Get pricing tiers
 */
export async function getPricingTiers(): Promise<PricingTier[]> {
  try {
    const supabase = createServiceRoleClient();

    const { data: tiers, error } = await supabase
      .from("pricing_tiers")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Get pricing tiers error:", error);
      return [];
    }

    return tiers as PricingTier[];
  } catch (error) {
    console.error("Get pricing tiers error:", error);
    return [];
  }
}

/**
 * Get pending payment by order ID
 */
export async function getPendingPayment(orderId: string) {
  try {
    const authResult = await auth();
    const clerkId = authResult.userId;

    if (!clerkId) {
      return null;
    }

    const supabase = createServiceRoleClient();

    const { data: payment, error } = await supabase
      .from("payments")
      .select(
        `
        *,
        pricing_tier:pricing_tiers(*)
      `,
      )
      .eq("order_id", orderId)
      .eq("user_id", clerkId)
      .eq("status", "pending")
      .single();

    if (error || !payment) {
      return null;
    }

    return payment;
  } catch (error) {
    console.error("Get pending payment error:", error);
    return null;
  }
}
