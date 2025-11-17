import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import type {
  InstagramOAuthState,
  InstagramShortLivedTokenResponse,
  InstagramLongLivedTokenResponse,
  FacebookPage,
} from "@/types/instagram";

/**
 * GET /api/auth/instagram/callback
 * Handles OAuth callback from Facebook/Instagram
 * Exchanges authorization code for access token and stores in database
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await auth();
    const clerkId = authResult.userId;

    if (!clerkId) {
      return NextResponse.redirect(
        new URL("/sign-in?error=auth_required", request.url)
      );
    }

    // Get OAuth parameters from callback
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    // Handle OAuth errors
    if (error) {
      console.error("Instagram OAuth error:", error, errorDescription);
      return NextResponse.redirect(
        new URL(
          `/dashboard?error=instagram_oauth_${error}&message=${encodeURIComponent(errorDescription || "")}`,
          request.url
        )
      );
    }

    // Validate required parameters
    if (!code || !state) {
      return NextResponse.redirect(
        new URL("/dashboard?error=instagram_invalid_callback", request.url)
      );
    }

    // Validate state parameter (CSRF protection)
    const cookieStore = await cookies();
    const stateCookie = cookieStore.get("instagram_oauth_state");

    if (!stateCookie) {
      return NextResponse.redirect(
        new URL("/dashboard?error=instagram_state_missing", request.url)
      );
    }

    let storedState: InstagramOAuthState;
    try {
      storedState = JSON.parse(stateCookie.value);
    } catch {
      return NextResponse.redirect(
        new URL("/dashboard?error=instagram_state_invalid", request.url)
      );
    }

    // Check state matches and hasn't expired (10 minutes)
    if (storedState.csrf !== state) {
      return NextResponse.redirect(
        new URL("/dashboard?error=instagram_state_mismatch", request.url)
      );
    }

    if (Date.now() - storedState.timestamp > 600000) {
      // 10 minutes
      return NextResponse.redirect(
        new URL("/dashboard?error=instagram_state_expired", request.url)
      );
    }

    // Clear state cookie
    cookieStore.delete("instagram_oauth_state");

    // Get environment variables
    const appId = process.env.INSTAGRAM_APP_ID;
    const appSecret = process.env.INSTAGRAM_APP_SECRET;
    const redirectUri = process.env.NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI;

    if (!appId || !appSecret || !redirectUri) {
      return NextResponse.redirect(
        new URL("/dashboard?error=instagram_config_missing", request.url)
      );
    }

    // Step 1: Exchange authorization code for short-lived access token
    const tokenUrl = new URL("https://graph.facebook.com/v18.0/oauth/access_token");
    tokenUrl.searchParams.set("client_id", appId);
    tokenUrl.searchParams.set("client_secret", appSecret);
    tokenUrl.searchParams.set("redirect_uri", redirectUri);
    tokenUrl.searchParams.set("code", code);

    const tokenResponse = await fetch(tokenUrl.toString());
    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error("Failed to exchange code for token:", errorData);
      return NextResponse.redirect(
        new URL(
          `/dashboard?error=instagram_token_exchange_failed&message=${encodeURIComponent(errorData.error?.message || "")}`,
          request.url
        )
      );
    }

    const shortLivedToken: InstagramShortLivedTokenResponse =
      await tokenResponse.json();

    // Step 2: Exchange short-lived token for long-lived token (60 days)
    const longLivedUrl = new URL(
      "https://graph.instagram.com/access_token"
    );
    longLivedUrl.searchParams.set("grant_type", "ig_exchange_token");
    longLivedUrl.searchParams.set("client_secret", appSecret);
    longLivedUrl.searchParams.set("access_token", shortLivedToken.access_token);

    const longLivedResponse = await fetch(longLivedUrl.toString());
    if (!longLivedResponse.ok) {
      const errorData = await longLivedResponse.json();
      console.error("Failed to get long-lived token:", errorData);
      return NextResponse.redirect(
        new URL(
          `/dashboard?error=instagram_long_token_failed&message=${encodeURIComponent(errorData.error?.message || "")}`,
          request.url
        )
      );
    }

    const longLivedToken: InstagramLongLivedTokenResponse =
      await longLivedResponse.json();

    // Step 3: Get user's Facebook Pages and Instagram Business Account
    const pagesUrl = new URL("https://graph.facebook.com/v18.0/me/accounts");
    pagesUrl.searchParams.set("access_token", longLivedToken.access_token);
    pagesUrl.searchParams.set(
      "fields",
      "id,name,access_token,instagram_business_account"
    );

    const pagesResponse = await fetch(pagesUrl.toString());
    if (!pagesResponse.ok) {
      const errorData = await pagesResponse.json();
      console.error("Failed to get Facebook Pages:", errorData);
      return NextResponse.redirect(
        new URL(
          "/dashboard?error=instagram_no_pages&message=Facebook_Page_연결이_필요합니다",
          request.url
        )
      );
    }

    const pagesData = await pagesResponse.json();
    const pages: FacebookPage[] = pagesData.data || [];

    // Find page with Instagram Business Account
    const pageWithInstagram = pages.find(
      (page) => page.instagram_business_account
    );

    if (!pageWithInstagram) {
      return NextResponse.redirect(
        new URL(
          "/dashboard?error=instagram_no_business_account&message=Instagram_Business_계정_연결이_필요합니다",
          request.url
        )
      );
    }

    const igAccountId = pageWithInstagram.instagram_business_account!.id;

    // Step 4: Get Instagram account info
    const igInfoUrl = new URL(`https://graph.facebook.com/v18.0/${igAccountId}`);
    igInfoUrl.searchParams.set("fields", "id,username,name,profile_picture_url");
    igInfoUrl.searchParams.set("access_token", longLivedToken.access_token);

    const igInfoResponse = await fetch(igInfoUrl.toString());
    if (!igInfoResponse.ok) {
      const errorData = await igInfoResponse.json();
      console.error("Failed to get Instagram account info:", errorData);
      return NextResponse.redirect(
        new URL(
          `/dashboard?error=instagram_account_info_failed&message=${encodeURIComponent(errorData.error?.message || "")}`,
          request.url
        )
      );
    }

    const igInfo = await igInfoResponse.json();

    // Step 5: Save to database
    const supabase = createClerkSupabaseClient();
    const expiresAt = new Date(Date.now() + longLivedToken.expires_in * 1000);

    const { error: dbError } = await supabase.from("social_accounts").upsert(
      {
        user_id: clerkId,
        platform: "instagram",
        platform_user_id: igAccountId,
        platform_username: igInfo.username,
        access_token: longLivedToken.access_token,
        token_type: longLivedToken.token_type,
        expires_at: expiresAt.toISOString(),
        account_type: "business",
        page_id: pageWithInstagram.id,
        is_active: true,
      },
      {
        onConflict: "user_id,platform,platform_user_id",
      }
    );

    if (dbError) {
      console.error("Failed to save Instagram account:", dbError);
      return NextResponse.redirect(
        new URL("/dashboard?error=instagram_save_failed", request.url)
      );
    }

    // Success! Redirect to dashboard with success message
    const redirectTo = storedState.redirectTo || "/dashboard";
    return NextResponse.redirect(
      new URL(
        `${redirectTo}?success=instagram_connected&username=${encodeURIComponent(igInfo.username)}`,
        request.url
      )
    );
  } catch (error) {
    console.error("Instagram OAuth callback error:", error);
    return NextResponse.redirect(
      new URL("/dashboard?error=instagram_callback_failed", request.url)
    );
  }
}
