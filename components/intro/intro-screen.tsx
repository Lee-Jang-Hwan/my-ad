"use client";

import { useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useIntro } from "./use-intro";

const INTRO_DURATION = 4500; // 4.5초

export function IntroScreen({ children }: { children: React.ReactNode }) {
  const { isLoading, showIntro, completeIntro } = useIntro();
  const prefersReducedMotion = useReducedMotion();

  // 4.5초 후 자동 완료
  useEffect(() => {
    if (showIntro && !prefersReducedMotion) {
      const timer = setTimeout(completeIntro, INTRO_DURATION);
      return () => clearTimeout(timer);
    }
  }, [showIntro, completeIntro, prefersReducedMotion]);

  // 모션 감소 선호 시 즉시 스킵
  useEffect(() => {
    if (prefersReducedMotion && showIntro) {
      completeIntro();
    }
  }, [prefersReducedMotion, showIntro, completeIntro]);

  // 로딩 중이거나 인트로 표시 중일 때는 children을 렌더링하지 않음
  if (isLoading || showIntro) {
    return (
      <div className="fixed inset-0 z-[9999] bg-background flex items-center justify-center cursor-pointer" onClick={showIntro ? completeIntro : undefined}>
        {showIntro && (
          <>
            {/* 배경 Orb */}
            <motion.div className="absolute inset-0 pointer-events-none overflow-hidden">
              <motion.div
                className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-[100px]"
                style={{
                  background:
                    "radial-gradient(circle, var(--accent-gold) 0%, transparent 60%)",
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.15 }}
                transition={{ duration: 0.5 }}
              />
            </motion.div>

            {/* 메인 텍스트 */}
            <div className="text-center z-10">
              {/* 삽가능 글자 - 3D 메탈 효과 */}
              <div style={{ perspective: "800px" }}>
                <motion.h1
                  className="text-[clamp(80px,18vw,180px)] font-black leading-none relative"
                  style={{
                    transformStyle: "preserve-3d",
                  }}
                  initial={{ rotateX: 20, rotateY: -10 }}
                  animate={{ rotateX: 0, rotateY: 0 }}
                  transition={{ delay: 0.8, duration: 1.2, ease: "easeOut" }}
                >
                  {["삽", "가", "능"].map((char, i) => (
                    <motion.span
                      key={i}
                      className="inline-block relative"
                      style={{
                        transformStyle: "preserve-3d",
                      }}
                      initial={{ opacity: 0, y: 80, rotateX: -80, scale: 0.5 }}
                      animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
                      transition={{
                        delay: 0.2 + i * 0.15,
                        duration: 0.8,
                        type: "spring",
                        damping: 10,
                        stiffness: 100,
                      }}
                    >
                      {/* 3D 깊이 레이어들 (뒤에서 앞으로) - opacity inherit으로 부모 따라감 */}
                      {[...Array(8)].map((_, depth) => (
                        <span
                          key={depth}
                          className="absolute inset-0"
                          style={{
                            transform: `translateZ(${-depth * 2}px)`,
                            color: `rgb(${80 + depth * 8}, ${80 + depth * 8}, ${85 + depth * 8})`,
                            WebkitTextStroke: depth === 0 ? "none" : "0.5px rgba(60,60,65,0.3)",
                            opacity: "inherit",
                          }}
                        >
                          {char}
                        </span>
                      ))}
                      {/* 메인 표면 레이어 (메탈 그라데이션) */}
                      <span
                        className="relative"
                        style={{
                          background: "linear-gradient(180deg, #ffffff 0%, #e0e0e0 20%, #c8c8c8 40%, #b0b0b0 60%, #d8d8d8 80%, #f0f0f0 100%)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          backgroundClip: "text",
                          opacity: "inherit",
                        }}
                      >
                        {char}
                      </span>
                    </motion.span>
                  ))}
                  {/* 광택 하이라이트 오버레이 */}
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.5) 45%, rgba(255,255,255,0.9) 50%, rgba(255,255,255,0.5) 55%, transparent 60%)",
                      backgroundSize: "200% 100%",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                    initial={{ opacity: 0, backgroundPosition: "200% 0" }}
                    animate={{ opacity: 1, backgroundPosition: "-200% 0" }}
                    transition={{ delay: 1.0, duration: 1.5, ease: "easeInOut" }}
                  >
                    삽가능
                  </motion.div>
                </motion.h1>
              </div>

              {/* STUDIO */}
              <motion.p
                className="text-[clamp(20px,4vw,48px)] font-light tracking-[0.5em] mt-4"
                style={{
                  background: "var(--gradient-gold)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0, duration: 0.5 }}
              >
                STUDIO
              </motion.p>

              {/* 골드 라인 */}
              <motion.div
                className="w-24 h-0.5 mx-auto mt-8"
                style={{ background: "var(--gradient-gold)" }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 1.6, duration: 0.5 }}
              />

              {/* 태그라인 */}
              <motion.p
                className="text-muted-foreground text-sm tracking-wider mt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.0, duration: 0.5 }}
              >
                AI 광고 영상 · 이미지 생성
              </motion.p>
            </div>

            {/* 프로그레스 바 */}
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-40">
              <motion.p
                className="text-[10px] tracking-[0.3em] text-muted-foreground text-center mb-3 uppercase"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.6, duration: 0.3 }}
              >
                Loading
              </motion.p>
              <div className="w-full h-px bg-border overflow-hidden">
                <motion.div
                  className="h-full"
                  style={{ background: "var(--gradient-gold)" }}
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 2.6, duration: 1.5, ease: "easeInOut" }}
                />
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // 인트로가 완료되면 children 렌더링
  return <>{children}</>;
}
