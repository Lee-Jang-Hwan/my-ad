"use server";

import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { productNameSchema } from "@/lib/validation";
import type { SaveProductInfoResult } from "@/types/upload";

export async function saveProductInfo(
  productName: string,
  originalImageId: string
): Promise<SaveProductInfoResult> {
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

    // Validate product name
    const validation = productNameSchema.safeParse(productName);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors[0].message,
      };
    }

    // Create Supabase client
    const supabase = createClerkSupabaseClient();

    // Save product info to database
    // Note: user_id field now stores clerk_id directly
    const { data: productData, error: productError } = await supabase
      .from("product_info")
      .insert({
        user_id: clerkId,
        product_name: validation.data,
      })
      .select("id")
      .single();

    if (productError || !productData) {
      console.error("Database insert error:", productError);
      return {
        success: false,
        error: "상품 정보 저장에 실패했습니다.",
      };
    }

    return {
      success: true,
      productInfoId: productData.id,
    };
  } catch (error) {
    console.error("Save product info error:", error);
    return {
      success: false,
      error: "상품 정보 저장 중 오류가 발생했습니다.",
    };
  }
}
