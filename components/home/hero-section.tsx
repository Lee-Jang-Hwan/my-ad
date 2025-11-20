import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowRight } from "lucide-react";
import { ReactNode } from "react";

interface HeroSectionProps {
  onCTAClick?: () => void;
  sampleVideos?: ReactNode;
}

export function HeroSection({ onCTAClick, sampleVideos }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden">

      {/* Hero Content */}
      <div className="relative z-10 py-12 md:py-16">
        <div className="max-w-4xl mx-auto text-center px-4 md:px-8 mb-16 bg-muted/10 rounded-2xl py-12">
          {/* Main Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight">
            만들기 힘들던 광고영상
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

        {/* Sample Videos Section */}
        {sampleVideos && (
          <div className="relative z-10">
            {sampleVideos}
          </div>
        )}
      </div>
    </section>
  );
}
