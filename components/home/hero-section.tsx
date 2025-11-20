import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Play } from "lucide-react";

interface HeroSectionProps {
  onCTAClick?: () => void;
}

export function HeroSection({ onCTAClick }: HeroSectionProps) {
  const handleDemoClick = () => {
    const sampleSection = document.getElementById('sample-videos-section');
    if (sampleSection) {
      sampleSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 dark:from-primary/10 dark:via-primary/20 dark:to-primary/10" />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center px-4 md:px-8 py-20">
        {/* Main Headline */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight">
          만들기 힘들던 광고영상
          <br />
          쉽게 <span className="text-primary">삽가능</span>!
        </h1>

        {/* Subheadline */}
        <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed max-w-2xl mx-auto">
          이미지 + 상품명만 있으면 OK
        </p>

        {/* CTA Button Group */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button size="lg" className="text-base" onClick={onCTAClick}>
            <span>지금 시작하기</span>
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
          <Button size="lg" variant="outline" className="text-base" onClick={handleDemoClick}>
            <Play className="mr-2 w-4 h-4" />
            <span>데모 영상 보기</span>
          </Button>
        </div>
      </div>
    </section>
  );
}
