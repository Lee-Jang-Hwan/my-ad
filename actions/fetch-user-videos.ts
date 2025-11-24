"use server";

import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
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
    const page = Math.max(1, params.page || 1); // Ensure page >= 1
    const limit = DEFAULT_LIMIT;

    // Create Supabase client with Clerk auth
    const supabase = createClerkSupabaseClient();

    console.log("🔍 Fetching videos for user:", clerkId, "with filters:", {
      status,
      sortBy,
      page,
      limit,
    });

    // Build base query (fetch all ad_videos first)
    let query = supabase
      .from("ad_videos")
      .select("*", { count: "exact" })
      .eq("user_id", clerkId);

    // Apply status filter (skip if "all")
    if (status !== "all") {
      // "failed" tab includes both failed and cancelled videos
      if (status === "failed") {
        query = query.in("status", ["failed", "cancelled"]);
      } else {
        query = query.eq("status", status);
      }
    }

    // Apply sorting
    const ascending = sortBy === "oldest";
    query = query.order("created_at", { ascending });

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    // Execute query
    const { data, error, count } = await query;

    if (error) {
      console.error("❌ Fetch user videos error:", {
        error,
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      return {
        success: false,
        error: "영상 목록을 불러오는 중 오류가 발생했습니다.",
      };
    }

    console.log("✅ Fetched videos count:", count, "data length:", data?.length);

    // Fetch product names separately for each video
    const videos: VideoWithProductName[] = await Promise.all(
      (data || []).map(async (item, index) => {
        let productName: string | null = null;

        if (item.product_info_id) {
          try {
            const { data: productData, error: productError } = await supabase
              .from("product_info")
              .select("product_name")
              .eq("id", item.product_info_id)
              .single();

            if (productError) {
              console.error(`⚠️ Error fetching product for video ${index}:`, {
                video_id: item.id,
                product_info_id: item.product_info_id,
                error: productError,
              });
            }

            productName = productData?.product_name || null;
          } catch (productFetchError) {
            console.error(`❌ Exception fetching product for video ${index}:`, {
              video_id: item.id,
              product_info_id: item.product_info_id,
              error: productFetchError,
            });
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
          is_public: item.is_public || false,
        };
      })
    );

    console.log("✅ Successfully processed all videos with product names");

    // Calculate pagination info
    const totalCount = count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    // If requested page exceeds total pages, return error
    if (page > totalPages && totalCount > 0) {
      return {
        success: false,
        error: `페이지 ${page}는 존재하지 않습니다. (총 ${totalPages} 페이지)`,
      };
    }

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