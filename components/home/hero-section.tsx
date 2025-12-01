import { Button } from "@/components/ui/button";
import { ArrowRight, Video, ImageIcon } from "lucide-react";

interface HeroSectionProps {
  isSignedIn?: boolean;
  onCTAClick?: () => void;
  howItWorks?: React.ReactNode;
  sampleVideos?: React.ReactNode;
  sampleImages?: React.ReactNode;
}

export function HeroSection({ isSignedIn, onCTAClick, howItWorks, sampleVideos, sampleImages }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden">

      {/* How It Works Section - above sample content */}
      {howItWorks}

      {/* Sample Videos Section */}
      {sampleVideos && (
        <div className="py-8 md:py-12">
          <div className="max-w-7xl mx-auto px-4 md:px-8 mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Video className="w-6 h-6" />
              광고 영상
            </h2>
          </div>
          {sampleVideos}
        </div>
      )}

      {/* Sample Images Section */}
      {sampleImages && (
        <div className="py-8 md:py-12">
          <div className="max-w-7xl mx-auto px-4 md:px-8 mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <ImageIcon className="w-6 h-6" />
              광고 이미지
            </h2>
          </div>
          {sampleImages}
        </div>
      )}
    </section>
  );
}
