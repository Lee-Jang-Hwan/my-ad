"use server";

import { createClerkSupabaseClient } from "@/lib/supabase/server";
import type { SocialAccount } from "@/types/database";
import type { InstagramTokenRefreshResponse } from "@/types/instagram";

/**
 * Get valid Instagram access token for a user
 * Automatically refreshes token if it's close to expiration
 */
export async function getValidInstagramToken(
  clerkId: string
): Promise<{ token: string; accountId: string } | null> {
  const supabase = createClerkSupabaseClient();

  // Get Instagram account
  const { data: account, error } = await supabase
    .from("social_accounts")
    .select("*")
    .eq("user_id", clerkId)
    .eq("platform", "instagram")
    .eq("is_active", true)
    .single();

  if (error || !account) {
    console.error("No Instagram account found:", error);
    return null;
  }

  const expiresAt = new Date(account.expires_at);
  const now = new Date();
  const daysUntilExpiry = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

  // If token expires in less than 7 days, refresh it
  if (daysUntilExpiry < 7) {
    console.log(`Token expires in ${daysUntilExpiry.toFixed(1)} days, refreshing...`);
    const refreshed = await refreshInstagramToken(account);

    if (!refreshed) {
      // Token refresh failed, return existing token anyway (might still work)
      console.warn("Token refresh failed, using existing token");
      return {
        token: account.access_token,
        accountId: account.platform_user_id,
      };
    }

    return {
      token: refreshed.access_token,
      accountId: account.platform_user_id,
    };
  }

  // Token is still valid
  return {
    token: account.access_token,
    accountId: account.platform_user_id,
  };
}

/**
 * Refresh Instagram long-lived access token
 * Should be called before token expires (60 days)
 */
async function refreshInstagramToken(
  account: SocialAccount
): Promise<SocialAccount | null> {
  try {
    const appSecret = process.env.INSTAGRAM_APP_SECRET;

    if (!appSecret) {
      console.error("Instagram app secret not configured");
      return null;
    }

    // Refresh long-lived token
    const refreshUrl = new URL("https://graph.instagram.com/refresh_access_token");
    refreshUrl.searchParams.set("grant_type", "ig_refresh_token");
    refreshUrl.searchParams.set("access_token", account.access_token);

    const response = await fetch(refreshUrl.toString());

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Failed to refresh Instagram token:", errorData);
      return null;
    }

    const refreshData: InstagramTokenRefreshResponse = await response.json();

    // Calculate new expiration date
    const newExpiresAt = new Date(Date.now() + refreshData.expires_in * 1000);

    // Update database
    const supabase = createClerkSupabaseClient();
    const { data: updated, error } = await supabase
      .from("social_accounts")
      .update({
        access_token: refreshData.access_token,
        expires_at: newExpiresAt.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", account.id)
      .select()
      .single();

    if (error || !updated) {
      console.error("Failed to update refreshed token:", error);
      return null;
    }

    console.log("Instagram token refreshed successfully");
    return updated as SocialAccount;
  } catch (error) {
    console.error("Error refreshing Instagram token:", error);
    return null;
  }
}

/**
 * Check if user has an active Instagram connection
 */
export async function hasInstagramConnection(clerkId: string): Promise<boolean> {
  const supabase = createClerkSupabaseClient();

  const { data, error } = await supabase
    .from("social_accounts")
    .select("id")
    .eq("user_id", clerkId)
    .eq("platform", "instagram")
    .eq("is_active", true)
    .single();

  return !error && !!data;
}

/**
 * Get Instagram account info
 */
export async function getInstagramAccount(
  clerkId: string
): Promise<SocialAccount | null> {
  const supabase = createClerkSupabaseClient();

  const { data, error } = await supabase
    .from("social_accounts")
    .select("*")
    .eq("user_id", clerkId)
    .eq("platform", "instagram")
    .eq("is_active", true)
    .single();

  if (error || !data) {
    return null;
  }

  return data as SocialAccount;
}

/**
 * Disconnect Instagram account (soft delete)
 */
export async function disconnectInstagram(clerkId: string): Promise<boolean> {
  const supabase = createClerkSupabaseClient();

  const { error } = await supabase
    .from("social_accounts")
    .update({
      is_active: false,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", clerkId)
    .eq("platform", "instagram");

  if (error) {
    console.error("Failed to disconnect Instagram:", error);
    return false;
  }

  return true;
}
