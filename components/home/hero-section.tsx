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
      {/* Hero Headline - only show when NOT signed in */}
      {!isSignedIn && (
        <div className="py-12 md:py-16">
          <div className="max-w-4xl mx-auto text-center px-4 md:px-8 bg-muted/10 rounded-2xl py-12">
            {/* Main Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight">
              만들기 힘들던
              <br />
              광고 영상 · 이미지
              <br />
              쉽게 <span className="text-5xl md:text-6xl lg:text-7xl font-extrabold bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-600 bg-clip-text text-transparent">삽가능</span>!
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed max-w-2xl mx-auto">
              이미지 + 상품명만 있으면 OK
            </p>

            {/* CTA Button */}
            <div className="flex justify-center">
              <Button
                size="lg"
                className="text-base bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all"
                onClick={onCTAClick}
              >
                <span>지금 시작하기</span>
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

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
