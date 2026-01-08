"use client";

import { useAuth } from "@clerk/nextjs";
import { HeroSection } from "@/components/home/hero-section";
import { HowItWorksSection } from "@/components/home/how-it-works-section";
import { SampleVideosSection } from "@/components/home/sample-videos-section";
import { SampleImagesSection } from "@/components/home/sample-images-section";
import { IntroScreen } from "@/components/intro/intro-screen";
import { PromoPopup } from "@/components/home/promo-popup";

function HomeContent() {
  const { isSignedIn, isLoaded } = useAuth();

  // Show loading while checking auth status
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background lg:-mt-16">
      {/* 프로모션 팝업 */}
      <PromoPopup />

      {/* Hero Section with Sample Videos and Images - ALWAYS SHOW */}
      <HeroSection
        howItWorks={!isSignedIn ? <HowItWorksSection /> : undefined}
        sampleVideos={<SampleVideosSection />}
        sampleImages={<SampleImagesSection />}
      />
    </div>
  );
}

export default function Home() {
  return (
    <IntroScreen>
      <HomeContent />
    </IntroScreen>
  );
}
