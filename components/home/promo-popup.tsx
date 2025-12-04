"use client";

import { useState, useEffect } from "react";
import { X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Black_And_White_Picture } from "next/font/google";

const blackAndWhitePicture = Black_And_White_Picture({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

// 이벤트 종료일
const EVENT_END_DATE = new Date("2026-01-31T23:59:59");
const STORAGE_KEY = "promo-popup-closed";

export function PromoPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // 이벤트 기간 체크
    if (new Date() > EVENT_END_DATE) return;

    // localStorage 체크 (이미 닫았는지)
    const closed = localStorage.getItem(STORAGE_KEY);
    if (closed) return;

    // 인트로 후 0.5초 딜레이로 표시
    const timer = setTimeout(() => setIsOpen(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, "true");
      setIsOpen(false);
      setIsClosing(false);
    }, 200);
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${
        isClosing ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* 오버레이 */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* 팝업 카드 */}
      <div
        className={`relative w-full max-w-sm bg-background/95 backdrop-blur-xl rounded-2xl border border-[oklch(0.78_0.14_75)]/30 shadow-2xl shadow-[oklch(0.78_0.14_75)]/10 overflow-hidden transition-all duration-300 ${
          isClosing ? "scale-95 opacity-0" : "scale-100 opacity-100"
        }`}
      >
        {/* 상단 골드 라인 */}
        <div className="h-1 w-full bg-gradient-to-r from-[oklch(0.78_0.14_75)] to-[oklch(0.65_0.12_55)]" />

        {/* 닫기 버튼 (우상단) */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-foreground/10 transition-colors"
          aria-label="닫기"
        >
          <X className="h-5 w-5 text-foreground/60" />
        </button>

        {/* 콘텐츠 */}
        <div className="px-8 py-10 text-center">
          {/* 메인 타이틀 */}
          <h2
            className={`text-2xl font-bold mb-2 ${blackAndWhitePicture.className}`}
          >
            삽가능 스튜디오
          </h2>

          {/* 구분선 */}
          <div className="w-24 h-px mx-auto bg-gradient-to-r from-transparent via-foreground/30 to-transparent mb-6" />

          {/* GRAND OPEN EVENT */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <Sparkles className="h-5 w-5 text-[oklch(0.78_0.14_75)]" />
            <span className="text-xl font-bold bg-gradient-to-r from-[oklch(0.78_0.14_75)] to-[oklch(0.65_0.12_55)] bg-clip-text text-transparent tracking-wider">
              GRAND OPEN EVENT
            </span>
            <Sparkles className="h-5 w-5 text-[oklch(0.78_0.14_75)]" />
          </div>

          {/* 크레딧 안내 */}
          <p className="text-lg mb-2">
            회원가입시{" "}
            <span className="text-[oklch(0.78_0.14_75)] font-bold text-xl">
              20크레딧
            </span>{" "}
            제공
          </p>

          {/* 부가 메시지 */}
          <p className="text-sm text-foreground/60 mb-8">
            많은 이용 부탁드립니다.
          </p>

          {/* 확인 버튼 */}
          <Button
            onClick={handleClose}
            className="w-full bg-gradient-to-r from-[oklch(0.78_0.14_75)] to-[oklch(0.65_0.12_55)] hover:from-[oklch(0.73_0.14_75)] hover:to-[oklch(0.60_0.12_55)] text-white font-semibold py-3 rounded-lg transition-all duration-300 shadow-lg shadow-[oklch(0.78_0.14_75)]/20"
          >
            확인
          </Button>
        </div>
      </div>
    </div>
  );
}
