import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // localhost 및 127.0.0.1 개발 환경 허용
  allowedDevOrigins: ["http://localhost:3000", "http://127.0.0.1:3000"],
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
  // Experimental features
  experimental: {
    serverActions: {
      bodySizeLimit: "100mb",
      allowedOrigins: ["localhost:3000", "127.0.0.1:3000"],
    },
  },
  // 서버 컴포넌트 및 액션 타임아웃 증가 (3분 = 180초)
  staticPageGenerationTimeout: 180,
  httpAgentOptions: {
    keepAlive: true,
  },
};

export default nextConfig;
