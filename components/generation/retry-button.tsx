"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { retryGeneration } from "@/actions/retry-generation";

interface RetryButtonProps {
  adVideoId: string;
}

/**
 * Retry button component for failed generation
 * Handles retry logic and navigation
 */
export function RetryButton({ adVideoId }: RetryButtonProps) {
  const router = useRouter();
  const [isRetrying, setIsRetrying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRetry = async () => {
    try {
      setIsRetrying(true);
      setError(null);

      const result = await retryGeneration(adVideoId);

      if (!result.success) {
        setError(result.error || "다시 시도하는 중 오류가 발생했습니다.");
        return;
      }

      // If retry creates a new ad_video record, navigate to it
      if (result.newAdVideoId && result.newAdVideoId !== adVideoId) {
        router.push(`/generation/${result.newAdVideoId}`);
      } else {
        // Otherwise, refresh the current page
        router.refresh();
      }
    } catch (err) {
      console.error("Retry error:", err);
      setError("다시 시도하는 중 오류가 발생했습니다.");
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        onClick={handleRetry}
        disabled={isRetrying}
        variant="outline"
        size="sm"
      >
        <RefreshCw className={`w-4 h-4 mr-2 ${isRetrying ? "animate-spin" : ""}`} />
        {isRetrying ? "다시 시도 중..." : "다시 시도"}
      </Button>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
