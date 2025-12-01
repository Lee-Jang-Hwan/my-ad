"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "intro-shown";

export function useIntro() {
  // 초기값을 null로 설정하여 서버/클라이언트 상태를 구분
  const [introState, setIntroState] = useState<"loading" | "show" | "hide">("loading");

  useEffect(() => {
    const hasShown = sessionStorage.getItem(STORAGE_KEY);
    if (hasShown) {
      setIntroState("hide");
    } else {
      setIntroState("show");
    }
  }, []);

  const completeIntro = useCallback(() => {
    sessionStorage.setItem(STORAGE_KEY, "true");
    setIntroState("hide");
  }, []);

  return {
    isLoading: introState === "loading",
    showIntro: introState === "show",
    completeIntro,
  };
}
