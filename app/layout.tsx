import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { koKR } from "@clerk/localizations";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";

import { Sidebar } from "@/components/sidebar";
import { MobileSidebar } from "@/components/mobile-sidebar";
import { SyncUserProvider } from "@/components/providers/sync-user-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Footer } from "@/components/footer";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "삽가능 스튜디오 | AI 광고 영상 · 이미지 자동 생성",
    template: "%s | 삽가능 스튜디오",
  },
  description:
    "이미지와 상품명만 있으면 OK! AI가 자동으로 전문적인 광고 영상과 이미지를 생성해드립니다. 복잡한 편집 없이 누구나 쉽게 SNS 광고 콘텐츠를 만들어보세요.",
  keywords: [
    "AI 광고 영상",
    "광고 이미지 생성",
    "자동 영상 제작",
    "소상공인 마케팅",
    "SNS 광고",
    "홍보영상",
    "AI 마케팅",
    "삽가능",
  ],
  authors: [{ name: "삽가능 스튜디오" }],
  creator: "삽가능 스튜디오",
  publisher: "삽가능 스튜디오",
  metadataBase: new URL("https://sappstudio.kr"),
  openGraph: {
    title: "삽가능 스튜디오 | AI 광고 영상 · 이미지 자동 생성",
    description:
      "이미지와 상품명만 있으면 OK! AI가 자동으로 전문적인 광고 영상과 이미지를 생성해드립니다.",
    type: "website",
    locale: "ko_KR",
    url: "https://sappstudio.kr",
    siteName: "삽가능 스튜디오",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "삽가능 스튜디오 - AI 광고 영상 · 이미지 자동 생성",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "삽가능 스튜디오 | AI 광고 영상 · 이미지 자동 생성",
    description:
      "이미지와 상품명만 있으면 OK! AI가 자동으로 전문적인 광고 영상과 이미지를 생성해드립니다.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider localization={koKR}>
      <html lang="ko" suppressHydrationWarning>
        <head>
          {/* Google Analytics */}
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
            `}
          </Script>

          {/* Google Tag Manager */}
          <Script id="google-tag-manager" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-T8F3WJZT');`}
          </Script>
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
        >
          <noscript>
            <iframe
              src="https://www.googletagmanager.com/ns.html?id=GTM-T8F3WJZT"
              height="0"
              width="0"
              style={{display: 'none', visibility: 'hidden'}}
            />
          </noscript>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <SyncUserProvider>
              <div className="flex min-h-screen">
                {/* Desktop Sidebar */}
                <div className="hidden lg:block">
                  <Sidebar />
                </div>

                {/* Main Content Wrapper */}
                <div className="flex-1 flex flex-col lg:ml-32">
                  {/* Mobile Header */}
                  <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur px-4 lg:hidden supports-[backdrop-filter]:bg-background/60">
                    <MobileSidebar />
                    <h1 className="text-lg font-bold">삽가능 스튜디오</h1>
                  </header>

                  {/* Main Content Area */}
                  <main className="flex-1">{children}</main>

                  {/* Footer */}
                  <Footer />
                </div>
              </div>
            </SyncUserProvider>
          </ThemeProvider>
          <Toaster />
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
