"use client";

import { useRouter } from "next/navigation";
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

  const handleCTAClick = () => {
    // Redirect to upload page
    // If not signed in, Clerk will automatically show sign-in modal via middleware
    router.push("/upload");
  };

  return (
    <div className="flex flex-col">
      <HeroSection onCTAClick={handleCTAClick} />
      <HowItWorksSection />
      <SampleVideosSection />
    </div>
  );
}
