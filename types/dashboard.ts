import type { AdVideo } from "./database";

/**
 * Ad video with joined product name from product_info table
 */
export interface VideoWithProductName extends AdVideo {
  product_name: string | null;
}

/**
 * Filter parameters for dashboard video list
 */
export interface FilterParams {
  status: "all" | "pending" | "processing" | "completed" | "failed";
  sortBy: "newest" | "oldest";
  page: number;
}

/**
 * Pagination metadata
 */
export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
}

/**
 * Result type for fetch-user-videos action
 */
export interface FetchUserVideosResult {
  success: boolean;
  videos?: VideoWithProductName[];
  pagination?: PaginationInfo;
  error?: string;
}
