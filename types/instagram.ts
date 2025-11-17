// Instagram Graph API type definitions

/**
 * Instagram OAuth Response Types
 */

// Short-lived access token response (valid for 1 hour)
export interface InstagramShortLivedTokenResponse {
  access_token: string;
  token_type: string; // "bearer"
}

// Long-lived access token response (valid for 60 days)
export interface InstagramLongLivedTokenResponse {
  access_token: string;
  token_type: string; // "bearer"
  expires_in: number; // seconds (usually 5184000 = 60 days)
}

// Token refresh response
export interface InstagramTokenRefreshResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

/**
 * Instagram Business Account Types
 */

export interface InstagramBusinessAccount {
  id: string; // Instagram Business Account ID
  username: string;
  name?: string;
  profile_picture_url?: string;
  followers_count?: number;
  follows_count?: number;
  media_count?: number;
}

export interface FacebookPage {
  id: string; // Facebook Page ID
  name: string;
  access_token: string;
  instagram_business_account?: {
    id: string;
  };
}

/**
 * Instagram Media Upload Types
 */

export type InstagramMediaType = "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM" | "REELS";

export interface InstagramMediaContainerRequest {
  image_url?: string; // For images
  video_url?: string; // For videos/reels (must be publicly accessible HTTPS URL)
  media_type: InstagramMediaType;
  caption?: string;
  thumb_offset?: number; // For videos: frame at which thumbnail should be taken (ms)
  location_id?: string; // Facebook Location ID
  user_tags?: Array<{
    username: string;
    x: number; // 0.0 to 1.0
    y: number; // 0.0 to 1.0
  }>;
  collaborators?: string[]; // Instagram user IDs
}

export interface InstagramMediaContainerResponse {
  id: string; // Creation/container ID
}

export interface InstagramMediaPublishRequest {
  creation_id: string;
}

export interface InstagramMediaPublishResponse {
  id: string; // Published media ID
}

export interface InstagramMediaStatusResponse {
  id: string;
  status_code: "EXPIRED" | "ERROR" | "FINISHED" | "IN_PROGRESS" | "PUBLISHED";
}

/**
 * Instagram API Error Types
 */

export interface InstagramErrorResponse {
  error: {
    message: string;
    type: string;
    code: number;
    error_subcode?: number;
    fbtrace_id: string;
  };
}

/**
 * Result Types for Server Actions
 */

export interface InstagramAuthResult {
  success: boolean;
  accountId?: string;
  username?: string;
  error?: string;
}

export interface InstagramUploadResult {
  success: boolean;
  mediaId?: string;
  permalink?: string;
  error?: string;
}

/**
 * OAuth State Parameter
 */

export interface InstagramOAuthState {
  csrf: string; // Random string for CSRF protection
  redirectTo?: string; // Where to redirect after auth
  timestamp: number;
}

/**
 * Rate Limit Info
 */

export interface InstagramRateLimitInfo {
  limit: number; // Total allowed requests
  remaining: number; // Remaining requests
  reset: number; // Timestamp when limit resets
}
