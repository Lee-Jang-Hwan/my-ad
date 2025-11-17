import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { koKR } from "@clerk/localizations";
import { Geist, Geist_Mono } from "next/font/google";

import Navbar from "@/components/Navbar";
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
  title: "삽가능 스튜디오",
  description:
    "이미지와 상품명만으로 전문적인 홍보영상을 자동 생성하는 AI 기반 플랫폼",
  keywords: ["AI", "홍보영상", "자동생성", "소상공인", "마케팅", "영상제작"],
  authors: [{ name: "AI Video Service" }],
  openGraph: {
    title: "광고영상 자동 생성 플랫폼",
    description:
      "이미지와 상품명만으로 전문적인 홍보영상을 자동 생성하는 AI 기반 플랫폼",
    type: "website",
    locale: "ko_KR",
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
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <SyncUserProvider>
              {/* Header Navigation */}
              <Navbar />

              {/* Main Content Area */}
              <main className="flex-1">{children}</main>

              {/* Footer */}
              <Footer />
            </SyncUserProvider>
          </ThemeProvider>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
