"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, MousePointerClick, Sparkles, Download } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Step {
  number: number;
  icon: LucideIcon;
  title: string;
  description: string;
  gradient: string;
}

const steps: Step[] = [
  {
    number: 1,
    icon: Upload,
    title: "이미지 & 상품명 업로드",
    description: "상품 이미지와 상품명을 간단히 입력하세요. 복잡한 설정 없이 시작할 수 있습니다.",
    gradient: "from-blue-500/20 via-cyan-500/10 to-transparent"
  },
  {
    number: 2,
    icon: MousePointerClick,
    title: "광고문구 선택",
    description: "AI가 생성한 5개의 광고문구 중 선택하거나 직접 입력하세요.",
    gradient: "from-purple-500/20 via-pink-500/10 to-transparent"
  },
  {
    number: 3,
    icon: Sparkles,
    title: "영상 · 이미지 생성",
    description: "Sora2 Pro와 Nano Banana Pro를 사용해 구현을 극대화 하였습니다.",
    gradient: "from-amber-500/20 via-orange-500/10 to-transparent"
  },
  {
    number: 4,
    icon: Download,
    title: "다운로드 & 공유",
    description: "완성된 영상을 다운로드하거나 바로 공유하세요.",
    gradient: "from-green-500/20 via-emerald-500/10 to-transparent"
  }
];

export function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-16 md:py-24 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            간단한 4단계로 시작하세요
          </h2>
          <p className="text-lg text-muted-foreground flex items-center justify-center gap-2">
            광고 영상 · 이미지 쉽게 삽가능<Sparkles className="w-5 h-5" />
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = activeStep === index;
            return (
              <div key={step.number} className="relative">
                {/* Step Card */}
                <Card className={`h-full transition-all duration-500 border-2 overflow-hidden ${isActive ? "shadow-xl scale-[1.02] border-primary/50" : "shadow-sm"}`}>
                  {/* Gradient Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${step.gradient} transition-opacity duration-500 ${isActive ? "opacity-100" : "opacity-0"}`} />

                  <CardContent className="p-6 text-center flex flex-col items-center relative z-10">
                    {/* Step Number Badge */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg mb-4 transition-all duration-500 ${isActive ? "bg-primary text-primary-foreground scale-110" : "bg-primary text-primary-foreground"}`}>
                      {step.number}
                    </div>

                    {/* Step Icon */}
                    <Icon className={`w-12 h-12 mb-4 transition-all duration-500 ${isActive ? "text-primary scale-110" : "text-primary"}`} strokeWidth={1.5} />

                    {/* Step Title */}
                    <h3 className={`text-lg font-bold mb-2 transition-all duration-500 ${isActive ? "text-primary" : ""}`}>{step.title}</h3>

                    {/* Step Description */}
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>

              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
