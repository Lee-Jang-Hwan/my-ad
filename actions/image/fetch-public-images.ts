"use server";

import { supabase } from "@/lib/supabase/client";

export interface PublicImage {
  id: string;
  image_url: string;
  selected_ad_copy: string | null;
  product_name: string | null;
  created_at: string;
}

interface FetchPublicImagesResult {
  success: boolean;
  images: PublicImage[];
  error?: string;
}

/**
 * Fetch public images for display on home page
 * Uses anon key since these are public images
 */
export async function fetchPublicImages(
  limit: number = 8
): Promise<FetchPublicImagesResult> {
  try {
    const { data, error } = await supabase
      .from("ad_images")
      .select(
        `
        id,
        image_url,
        selected_ad_copy,
        created_at,
        product_info:product_info_id (
          product_name
        )
      `
      )
      .eq("is_public", true)
      .eq("status", "completed")
      .not("image_url", "is", null)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Fetch public images error:", error);
      return {
        success: false,
        images: [],
        error: "공개 이미지를 불러올 수 없습니다.",
      };
    }

    // Transform data
    const images: PublicImage[] = (data || []).map((image: any) => ({
      id: image.id,
      image_url: image.image_url,
      selected_ad_copy: image.selected_ad_copy,
      product_name: image.product_info?.product_name || null,
      created_at: image.created_at,
    }));

    return {
      success: true,
      images,
    };
  } catch (error) {
    console.error("Fetch public images error:", error);
    return {
      success: false,
      images: [],
      error: "공개 이미지 조회 중 오류가 발생했습니다.",
    };
  }
}
