"use server";

import { auth } from "@clerk/nextjs/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";
import type {
  FilterParams,
  FetchUserVideosResult,
  VideoWithProductName,
} from "@/types/dashboard";

const DEFAULT_LIMIT = 12; // 3 rows × 4 columns on desktop

/**
 * Fetch user's ad videos with filtering, sorting, and pagination
 * Fetches product names separately to avoid JOIN errors
 */
export async function fetchUserVideos(
  params: Partial<FilterParams> = {}
): Promise<FetchUserVideosResult> {
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

    // Parse and validate parameters
    const status = params.status || "all";
    const sortBy = params.sortBy || "newest";
    const page = Math.max(1, params.page || 1);
    const limit = DEFAULT_LIMIT;
    const ascending = sortBy === "oldest";

    // Create Supabase client with Service Role
    const supabase = getServiceRoleClient();

    console.log("🔍 Fetching videos for user:", clerkId, "with filters:", {
      status,
      sortBy,
      page,
      limit,
    });

    // First, get total count
    let countQuery = supabase
      .from("ad_videos")
      .select("*", { count: "exact", head: true })
      .eq("user_id", clerkId);

    if (status !== "all") {
      if (status === "failed") {
        countQuery = countQuery.in("status", ["failed", "cancelled"]);
      } else {
        countQuery = countQuery.eq("status", status);
      }
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      console.error("❌ Count query error:", countError.message);
      return {
        success: false,
        error: `영상 목록을 불러오는 중 오류가 발생했습니다. (${countError.message || "알 수 없는 오류"})`,
      };
    }

    const totalCount = count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    console.log("📊 Total count:", totalCount, "Total pages:", totalPages);

    // If no data, return empty result
    if (totalCount === 0) {
      return {
        success: true,
        videos: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalCount: 0,
          limit,
        },
      };
    }

    // If page exceeds total pages, return empty result (not error)
    if (page > totalPages) {
      return {
        success: true,
        videos: [],
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          limit,
        },
      };
    }

    // Fetch paginated data
    const offset = (page - 1) * limit;

    let dataQuery = supabase
      .from("ad_videos")
      .select("*")
      .eq("user_id", clerkId);

    if (status !== "all") {
      if (status === "failed") {
        dataQuery = dataQuery.in("status", ["failed", "cancelled"]);
      } else {
        dataQuery = dataQuery.eq("status", status);
      }
    }

    dataQuery = dataQuery
      .order("created_at", { ascending })
      .range(offset, offset + limit - 1);

    const { data, error } = await dataQuery;

    if (error) {
      console.error("❌ Fetch user videos error:", error.message);
      return {
        success: false,
        error: `영상 목록을 불러오는 중 오류가 발생했습니다. (${error.message || "알 수 없는 오류"})`,
      };
    }

    console.log("✅ Fetched videos:", data?.length);

    // Fetch product names separately for each video
    const videos: VideoWithProductName[] = await Promise.all(
      (data || []).map(async (item) => {
        let productName: string | null = null;

        if (item.product_info_id) {
          try {
            const { data: productData } = await supabase
              .from("product_info")
              .select("product_name")
              .eq("id", item.product_info_id)
              .single();

            productName = productData?.product_name || null;
          } catch {
            // Continue with null product name
          }
        }

        return {
          id: item.id,
          user_id: item.user_id,
          product_image_id: item.product_image_id,
          product_info_id: item.product_info_id,
          video_url: item.video_url,
          thumbnail_url: item.thumbnail_url,
          duration: item.duration,
          file_size: item.file_size,
          status: item.status,
          progress_stage: item.progress_stage,
          error_message: item.error_message,
          created_at: item.created_at,
          completed_at: item.completed_at,
          product_name: productName,
          is_featured: item.is_featured || false,
        };
      })
    );

    console.log("✅ Successfully processed all videos with product names");

    return {
      success: true,
      videos,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
      },
    };
  } catch (error) {
    console.error("❌ Fetch user videos outer error:", error);
    return {
      success: false,
      error: "영상 목록을 불러오는 중 오류가 발생했습니다.",
    };
  }
}
