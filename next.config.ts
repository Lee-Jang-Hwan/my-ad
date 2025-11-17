import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "img.clerk.com" },
      {
        protocol: "https",
        hostname: "dcbvrbljeanjzsbrqays.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
    ],
    formats: ["image/webp", "image/avif"], // WebP와 AVIF 포맷 지원
  },
  // Experimental caching features
  experimental: {
    serverActions: {
      bodySizeLimit: "100mb",
    },
    // Enable partial prerendering for better streaming
    ppr: false, // Keep disabled for now (requires React 19 canary)
  },
};

export default nextConfig;
