import type { VideoWithProductName } from "./dashboard";

/**
 * Video detail data type
 * Extends VideoWithProductName with all fields needed for detail page
 */
export interface VideoDetailData extends VideoWithProductName {
  // All fields inherited from VideoWithProductName
}

/**
 * Result type for fetch video detail action
 */
export interface FetchVideoDetailResult {
  success: boolean;
  video?: VideoDetailData;
  error?: string;
}

/**
 * Result type for download video action
 */
export interface DownloadVideoResult {
  success: boolean;
  downloadUrl?: string;
  filename?: string;
  error?: string;
}
