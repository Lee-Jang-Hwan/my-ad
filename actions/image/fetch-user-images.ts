"use server";

import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import type { AdImage } from "@/types/ad-image";

interface ImageWithProductName extends AdImage {
  product_name?: string;
}

interface FilterParams {
  status: "all" | "pending" | "processing" | "completed" | "failed" | "cancelled";
  sortBy: "newest" | "oldest";
  page: number;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
}

interface FetchUserImagesResult {
  success: boolean;
  images?: ImageWithProductName[];
  pagination?: PaginationInfo;
  error?: string;
}

const PAGE_SIZE = 12;

/**
 * Fetch user's ad images with filtering and pagination
 */
export async function fetchUserImages(
  filter: FilterParams
): Promise<FetchUserImagesResult> {
  try {
    const authResult = await auth();
    const clerkId = authResult.userId;

    if (!clerkId) {
      return {
        success: false,
        error: "로그인이 필요합니다.",
      };
    }

    const supabase = createClerkSupabaseClient();

    // Build query
    let query = supabase
      .from("ad_images")
      .select(
        `
        *,
        product_info:product_info_id (
          product_name
        )
      `,
        { count: "exact" }
      )
      .eq("user_id", clerkId);

    // Apply status filter
    if (filter.status !== "all") {
      query = query.eq("status", filter.status);
    }

    // Apply sorting
    if (filter.sortBy === "newest") {
      query = query.order("created_at", { ascending: false });
    } else {
      query = query.order("created_at", { ascending: true });
    }

    // Apply pagination
    const from = (filter.page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error("Fetch user images error:", error);
      return {
        success: false,
        error: "이미지 목록을 불러올 수 없습니다.",
      };
    }

    // Transform data to include product_name at top level
    const images: ImageWithProductName[] = (data || []).map((image: any) => ({
      ...image,
      product_name: image.product_info?.product_name || "알 수 없는 상품",
    }));

    // Calculate pagination info
    const totalCount = count || 0;
    const totalPages = Math.ceil(totalCount / PAGE_SIZE);

    return {
      success: true,
      images,
      pagination: {
        currentPage: filter.page,
        totalPages,
        totalCount,
        limit: PAGE_SIZE,
      },
    };
  } catch (error) {
    console.error("Fetch user images error:", error);
    return {
      success: false,
      error: "이미지 목록 조회 중 오류가 발생했습니다.",
    };
  }
}
