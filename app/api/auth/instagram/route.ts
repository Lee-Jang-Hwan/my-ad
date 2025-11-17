import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import type { InstagramOAuthState } from "@/types/instagram";

/**
 * GET /api/auth/instagram
 * Initiates Instagram OAuth flow by redirecting to Facebook OAuth dialog
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await auth();
    const clerkId = authResult.userId;

    if (!clerkId) {
      return NextResponse.redirect(
        new URL("/sign-in?redirect=/api/auth/instagram", request.url)
      );
    }

    // Get environment variables
    const appId = process.env.INSTAGRAM_APP_ID;
    const redirectUri = process.env.NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI;

    if (!appId || !redirectUri) {
      console.error("Instagram OAuth configuration missing");
      return NextResponse.redirect(
        new URL(
          "/dashboard?error=instagram_config_missing",
          request.url
        )
      );
    }

    // Generate CSRF protection state parameter
    const state: InstagramOAuthState = {
      csrf: crypto.randomUUID(),
      redirectTo: request.nextUrl.searchParams.get("redirect") || "/dashboard",
      timestamp: Date.now(),
    };

    // Store state in HTTP-only cookie (expires in 10 minutes)
    const cookieStore = await cookies();
    cookieStore.set("instagram_oauth_state", JSON.stringify(state), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600, // 10 minutes
      path: "/",
    });

    // Build Facebook OAuth authorization URL
    // Instagram uses Facebook's OAuth system
    const scopes = [
      "instagram_basic",
      "pages_show_list",
      "instagram_content_publish",
      "business_management",
    ];

    const authUrl = new URL("https://www.facebook.com/v18.0/dialog/oauth");
    authUrl.searchParams.set("client_id", appId);
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("scope", scopes.join(","));
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("state", state.csrf);

    // Redirect user to Facebook OAuth authorization
    return NextResponse.redirect(authUrl.toString());
  } catch (error) {
    console.error("Instagram OAuth initiate error:", error);
    return NextResponse.redirect(
      new URL("/dashboard?error=instagram_auth_failed", request.url)
    );
  }
}
