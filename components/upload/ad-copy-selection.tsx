"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AdCopyCard } from "./ad-copy-card";
import { AdCopyGeneratingLoader } from "./ad-copy-skeleton";
import { fetchAdCopies } from "@/actions/fetch-ad-copies";
import { selectAdCopyAndGenerate } from "@/actions/select-ad-copy";
import { regenerateAdCopies } from "@/actions/regenerate-ad-copies";
import type { AdCopy, AdCopySelectionProps } from "@/types/ad-copy";
import { RefreshCw, Loader2, AlertCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * 광고문구 선택 메인 컴포넌트
 * - 광고문구 6개를 카드 형태로 표시
 * - 사용자가 1개 선택 후 영상 생성 진행
 * - 다시 생성 기능 제공
 */
export function AdCopySelection({
  adVideoId,
  productName,
  imagePreviewUrl,
  onComplete,
  onCancel,
}: AdCopySelectionProps) {
  const router = useRouter();
  const [adCopies, setAdCopies] = useState<AdCopy[]>([]);
  const [selectedCopyId, setSelectedCopyId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 광고문구 조회
  const loadAdCopies = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const result = await fetchAdCopies(adVideoId);

    if (result.success && result.adCopies) {
      setAdCopies(result.adCopies);
      // 이미 선택된 광고문구가 있으면 선택 상태 복원
      const selected = result.adCopies.find((copy) => copy.is_selected);
      if (selected) {
        setSelectedCopyId(selected.id);
      }
    } else {
      setError(result.error || "광고문구를 불러올 수 없습니다.");
    }

    setIsLoading(false);
  }, [adVideoId]);

  useEffect(() => {
    loadAdCopies();
  }, [loadAdCopies]);

  // 광고문구 재생성 핸들러
  const handleRegenerate = async () => {
    setIsRegenerating(true);
    setError(null);
    setSelectedCopyId(null);

    const result = await regenerateAdCopies(adVideoId);

    if (result.success && result.adCopies) {
      setAdCopies(result.adCopies);
    } else {
      setError(result.error || "광고문구 재생성에 실패했습니다.");
    }

    setIsRegenerating(false);
  };

  // 광고문구 선택 핸들러
  const handleSelect = (copyId: string) => {
    setSelectedCopyId(copyId);
    setError(null);
  };

  // 선택 완료 및 영상 생성 진행
  const handleConfirm = async () => {
    if (!selectedCopyId) {
      setError("광고문구를 선택해주세요.");
      return;
    }

    const selectedCopy = adCopies.find((copy) => copy.id === selectedCopyId);
    if (!selectedCopy) {
      setError("선택된 광고문구를 찾을 수 없습니다.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const result = await selectAdCopyAndGenerate(
      adVideoId,
      selectedCopyId,
      selectedCopy.copy_text
    );

    if (result.success) {
      onComplete();
      router.push(`/generation/${adVideoId}`);
    } else {
      if (result.insufficientCredits) {
        setError("크레딧이 부족합니다. 충전 후 다시 시도해주세요.");
      } else {
        setError(result.error || "영상 생성을 시작할 수 없습니다.");
      }
      setIsSubmitting(false);
    }
  };

  // 선택된 광고문구 정보
  const selectedCopy = adCopies.find((copy) => copy.id === selectedCopyId);

  // 로딩 중
  if (isLoading) {
    return <AdCopyGeneratingLoader />;
  }

  // 광고문구가 없는 경우
  if (adCopies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <div className="text-center space-y-1">
          <p className="text-lg font-medium text-foreground">
            광고문구를 찾을 수 없습니다
          </p>
          <p className="text-sm text-muted-foreground">
            {error || "잠시 후 다시 시도해주세요."}
          </p>
        </div>
        <Button onClick={onCancel} variant="outline">
          돌아가기
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold">광고문구를 선택해주세요</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          AI가 생성한 6개의 광고문구 중 마음에 드는 하나를 선택해주세요.
          선택한 문구로 영상이 제작됩니다.
        </p>
      </div>

      {/* 상품 정보 요약 */}
      <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
        {imagePreviewUrl && (
          <div className="relative w-16 h-16 shrink-0 rounded-md overflow-hidden border border-border">
            <Image
              src={imagePreviewUrl}
              alt={productName}
              fill
              className="object-cover"
            />
          </div>
        )}
        <div>
          <p className="text-sm text-muted-foreground">상품명</p>
          <p className="font-medium">{productName}</p>
        </div>
      </div>

      {/* 광고문구 카드 그리드 */}
      <div className="grid gap-4 sm:grid-cols-2">
        {adCopies.map((copy) => (
          <AdCopyCard
            key={copy.id}
            copy={copy}
            isSelected={copy.id === selectedCopyId}
            onSelect={handleSelect}
            disabled={isSubmitting}
          />
        ))}
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* 선택된 문구 미리보기 */}
      {selectedCopy && (
        <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <p className="text-xs text-primary font-medium mb-2">선택한 광고문구</p>
          <p className="text-sm text-foreground leading-relaxed">
            &quot;{selectedCopy.copy_text}&quot;
          </p>
        </div>
      )}

      {/* 버튼 영역 */}
      <div className="flex flex-col-reverse sm:flex-row gap-3 justify-between pt-4 border-t border-border">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          돌아가기
        </Button>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleRegenerate}
            disabled={isSubmitting || isRegenerating}
            className="gap-2"
          >
            <RefreshCw className={cn("w-4 h-4", isRegenerating && "animate-spin")} />
            {isRegenerating ? "재생성 중..." : "다시 생성"}
          </Button>

          <Button
            onClick={handleConfirm}
            disabled={!selectedCopyId || isSubmitting}
            className="gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                영상 생성 중...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                선택 완료 & 영상 생성
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
