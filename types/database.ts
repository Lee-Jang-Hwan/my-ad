// Database type definitions for Supabase tables

export interface ProductImage {
  id: string;
  user_id: string | null;
  clerk_id: string;
  original_filename: string;
  storage_path: string;
  file_size: number | null;
  mime_type: string;
  width: number | null;
  height: number | null;
  status: "uploaded" | "processing" | "completed" | "failed" | null;
  created_at: string;
  updated_at: string;
}

export interface ProductInfo {
  id: string;
  user_id: string; // Note: This field now stores clerk_id directly
  product_name: string;
  description: string | null;
  category: string | null;
  created_at: string;
}

export type VideoStatus =
  | "init"
  | "ad_copy_generation"
  | "image_refinement"
  | "video_generation"
  | "tts_generation"
  | "subtitle_generation"
  | "merging"
  | "completed"
  | "failed"
  | "cancelled";

export interface AdVideo {
  id: string;
  user_id: string; // This is the clerk_id from users table
  product_image_id: string | null;
  product_info_id: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  duration: number | null; // Duration in seconds
  file_size: number | null;
  status: "pending" | "processing" | "completed" | "failed" | "cancelled";
  progress_stage: VideoStatus;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface N8nWorkflow {
  id: string;
  workflow_name: string;
  webhook_url: string;
  is_active: boolean;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export type SocialPlatform = "instagram" | "facebook" | "youtube";

export interface SocialAccount {
  id: string;
  user_id: string; // clerk_id
  platform: SocialPlatform;
  platform_user_id: string; // Instagram Business Account ID / Facebook User ID / YouTube Channel ID
  platform_username: string | null;
  access_token: string;
  token_type: string;
  expires_at: string;
  refresh_token: string | null;
  account_type: string | null; // 'business', 'creator', 'personal'
  page_id: string | null; // Facebook Page ID (required for Instagram)
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_used_at: string | null;
}
