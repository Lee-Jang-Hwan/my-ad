import { Card, CardContent } from "@/components/ui/card";
import { Upload, MousePointerClick, Sparkles, Download } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Step {
  number: number;
  icon: LucideIcon;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    number: 1,
    icon: Upload,
    title: "이미지 & 상품명 업로드",
    description: "상품 이미지와 상품명을 간단히 입력하세요. 복잡한 설정 없이 시작할 수 있습니다."
  },
  {
    number: 2,
    icon: MousePointerClick,
    title: "광고문구 선택",
    description: "AI가 생성한 5개의 광고문구 중 선택하거나 직접 입력하세요."
  },
  {
    number: 3,
    icon: Sparkles,
    title: "AI가 자동으로 영상 생성",
    description: "이미지 정제, 영상, TTS, 자막을 AI가 자동으로 생성합니다."
  },
  {
    number: 4,
    icon: Download,
    title: "다운로드 & SNS 공유",
    description: "완성된 영상을 다운로드하거나 SNS에 바로 공유하세요."
  }
];

export function HowItWorksSection() {
  return (
    <section className="py-16 md:py-24 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            간단한 4단계로 시작하세요
          </h2>
          <p className="text-lg text-muted-foreground">
            복잡한 영상 편집 경험이 필요 없습니다
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.number} className="relative">
                {/* Step Card */}
                <Card className="h-full hover:shadow-lg transition-shadow duration-300 border-2">
                  <CardContent className="p-6 text-center flex flex-col items-center">
                    {/* Step Number Badge */}
                    <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg mb-4">
                      {step.number}
                    </div>

                    {/* Step Icon */}
                    <Icon className="w-12 h-12 text-primary mb-4" strokeWidth={1.5} />

                    {/* Step Title */}
                    <h3 className="text-lg font-bold mb-2">{step.title}</h3>

                    {/* Step Description */}
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>

                {/* Connector Arrow (hidden on mobile/tablet and after last item) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-border z-10">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 border-r-2 border-t-2 border-border rotate-45" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
