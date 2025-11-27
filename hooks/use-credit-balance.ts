"use client";

import { useState, useEffect, useCallback } from "react";
import { checkCreditBalance, type CreditBalanceResult } from "@/actions/credit/check-balance";

interface UseCreditBalanceReturn {
  balance: number;
  isAdmin: boolean;
  canGenerate: boolean;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useCreditBalance(): UseCreditBalanceReturn {
  const [balance, setBalance] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [canGenerate, setCanGenerate] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result: CreditBalanceResult = await checkCreditBalance();

      if (result.success) {
        setBalance(result.balance ?? 0);
        setIsAdmin(result.isAdmin ?? false);
        setCanGenerate(result.canGenerate ?? false);
      } else {
        setError(result.error || "크레딧 조회에 실패했습니다.");
      }
    } catch (err) {
      console.error("Credit balance fetch error:", err);
      setError("크레딧 조회 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return {
    balance,
    isAdmin,
    canGenerate,
    isLoading,
    error,
    refresh: fetchBalance,
  };
}
