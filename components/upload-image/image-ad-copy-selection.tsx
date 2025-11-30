"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ImageAdCopyCard } from "./image-ad-copy-card";
import { AdCopyGeneratingLoader } from "@/components/upload/ad-copy-skeleton";
import { fetchImageAdCopies } from "@/actions/image/fetch-image-ad-copies";
import { selectImageAdCopyAndGenerate } from "@/actions/image/select-image-ad-copy";
import { regenerateImageAdCopies } from "@/actions/image/regenerate-image-ad-copies";
import type { AdImageCopy } from "@/types/ad-image";
import { RefreshCw, Loader2, AlertCircle, Sparkles, PenLine, ImagePlus } from "lucide-react";
import { cn } from "@/lib/utils";

// 직접 입력용 특수 ID
const CUSTOM_INPUT_ID = "custom-input";

interface ImageAdCopySelectionProps {
  adImageId: string;
  productName: string;
  imagePreviewUrl?: string;
  onComplete: () => void;
  onCancel: () => void;
}

/**
 * 이미지용 광고문구 선택 메인 컴포넌트
 * - AI 생성 광고문구 5개 + 직접 입력 1개
 * - 사용자가 1개 선택 후 이미지 생성 진행
 * - 다시 생성 기능 제공
 */
export function ImageAdCopySelection({
  adImageId,
  productName,
  imagePreviewUrl,
  onComplete,
  onCancel,
}: ImageAdCopySelectionProps) {
  const router = useRouter();
  const [adCopies, setAdCopies] = useState<AdImageCopy[]>([]);
  const [selectedCopyId, setSelectedCopyId] = useState<string | null>(null);
  const [customText, setCustomText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 광고문구 조회
  const loadAdCopies = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const result = await fetchImageAdCopies(adImageId);

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
  }, [adImageId]);

  useEffect(() => {
    loadAdCopies();
  }, [loadAdCopies]);

  // 광고문구 재생성 핸들러
  const handleRegenerate = async () => {
    setIsRegenerating(true);
    setError(null);
    setSelectedCopyId(null);

    const result = await regenerateImageAdCopies(adImageId);

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

  // 직접 입력 선택 핸들러
  const handleCustomSelect = () => {
    setSelectedCopyId(CUSTOM_INPUT_ID);
    setError(null);
  };

  // 선택 완료 및 이미지 생성 진행
  const handleConfirm = async () => {
    // 직접 입력 선택 시
    if (selectedCopyId === CUSTOM_INPUT_ID) {
      if (!customText.trim()) {
        setError("광고문구를 입력해주세요.");
        return;
      }

      setIsSubmitting(true);
      setError(null);

      // 직접 입력한 문구로 이미지 생성 (copyId를 null로, 텍스트를 직접 전달)
      const result = await selectImageAdCopyAndGenerate(
        adImageId,
        null, // 직접 입력은 DB에 저장된 copy가 아님
        customText.trim()
      );

      if (result.success) {
        onComplete();
        router.push(`/image-generation/${adImageId}`);
      } else {
        if (result.insufficientCredits) {
          setError("크레딧이 부족합니다. 충전 후 다시 시도해주세요.");
        } else {
          setError(result.error || "이미지 생성을 시작할 수 없습니다.");
        }
        setIsSubmitting(false);
      }
      return;
    }

    // AI 생성 문구 선택 시
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

    const result = await selectImageAdCopyAndGenerate(
      adImageId,
      selectedCopyId,
      selectedCopy.copy_text
    );

    if (result.success) {
      onComplete();
      router.push(`/image-generation/${adImageId}`);
    } else {
      if (result.insufficientCredits) {
        setError("크레딧이 부족합니다. 충전 후 다시 시도해주세요.");
      } else {
        setError(result.error || "이미지 생성을 시작할 수 없습니다.");
      }
      setIsSubmitting(false);
    }
  };

  // 선택된 광고문구 정보 (직접 입력이 아닌 경우만)
  const selectedCopy = selectedCopyId !== CUSTOM_INPUT_ID
    ? adCopies.find((copy) => copy.id === selectedCopyId)
    : null;

  // 확인 버튼 활성화 조건
  const isConfirmDisabled =
    !selectedCopyId ||
    isSubmitting ||
    (selectedCopyId === CUSTOM_INPUT_ID && !customText.trim());

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
          AI가 생성한 5개의 광고문구 중 선택하거나, 직접 입력할 수 있습니다.
          선택한 문구로 1:1 광고이미지가 제작됩니다.
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
          <ImageAdCopyCard
            key={copy.id}
            copy={copy}
            isSelected={copy.id === selectedCopyId}
            onSelect={handleSelect}
            disabled={isSubmitting || isRegenerating}
          />
        ))}

        {/* 직접 입력 카드 */}
        <div
          onClick={() => !isSubmitting && !isRegenerating && handleCustomSelect()}
          className={cn(
            "relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200",
            selectedCopyId === CUSTOM_INPUT_ID
              ? "border-primary bg-primary/5 shadow-md"
              : "border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/30",
            (isSubmitting || isRegenerating) && "opacity-50 cursor-not-allowed"
          )}
        >
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full shrink-0",
                selectedCopyId === CUSTOM_INPUT_ID
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              <PenLine className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  "font-medium text-sm mb-2",
                  selectedCopyId === CUSTOM_INPUT_ID
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                직접 입력
              </p>
              <Textarea
                placeholder="원하는 광고문구를 직접 입력하세요..."
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                onClick={(e) => {
                  e.stopPropagation();
                  handleCustomSelect();
                }}
                disabled={isSubmitting || isRegenerating}
                className={cn(
                  "min-h-[80px] text-sm resize-none",
                  selectedCopyId === CUSTOM_INPUT_ID
                    ? "border-primary/30 focus:border-primary"
                    : ""
                )}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* 선택된 문구 미리보기 */}
      {(selectedCopy || (selectedCopyId === CUSTOM_INPUT_ID && customText.trim())) && (
        <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <p className="text-xs text-primary font-medium mb-2">
            {selectedCopyId === CUSTOM_INPUT_ID ? "직접 입력한 광고문구" : "선택한 광고문구"}
          </p>
          <p className="text-sm text-foreground leading-relaxed">
            &quot;{selectedCopyId === CUSTOM_INPUT_ID ? customText.trim() : selectedCopy?.copy_text}&quot;
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
            disabled={isConfirmDisabled}
            className="gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                이미지 생성 중...
              </>
            ) : (
              <>
                <ImagePlus className="w-4 h-4" />
                선택 완료 & 이미지 생성
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
