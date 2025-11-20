"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import dynamic from "next/dynamic";
import { HeroSection } from "@/components/home/hero-section";

// Dynamically import sections that are below the fold
const HowItWorksSection = dynamic(
  () =>
    import("@/components/home/how-it-works-section").then(
      (mod) => mod.HowItWorksSection
    ),
  {
    loading: () => <div className="min-h-[500px]" />,
  }
);

const SampleVideosSection = dynamic(
  () =>
    import("@/components/home/sample-videos-section").then(
      (mod) => mod.SampleVideosSection
    ),
  {
    loading: () => <div className="min-h-[500px]" />,
  }
);

export default function Home() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();

  // Show loading while checking auth status
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleCTAClick = () => {
    if (isSignedIn) {
      // Redirect to upload page if logged in
      router.push("/upload");
    } else {
      // Redirect to sign-up page if not logged in
      router.push("/sign-up");
    }
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section and How It Works - only show for non-authenticated users */}
      {!isSignedIn && (
        <>
          <HeroSection
            onCTAClick={handleCTAClick}
            sampleVideos={<SampleVideosSection />}
          />
          <HowItWorksSection />
        </>
      )}

      {/* Sample Videos Section - show standalone for authenticated users */}
      {isSignedIn && <SampleVideosSection />}
    </div>
  );
}
