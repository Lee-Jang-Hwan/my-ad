"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { Loader2, Sparkles, AlertCircle, ImageIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { STORYBOARD_AI_DRAFT_COST } from "@/lib/constants/credits";
import { generateAIDraft, fetchStoryboardScenes } from "@/actions/storyboard";
import { ReferenceImageUpload } from "@/components/storyboard/reference-image-upload";
import type { Storyboard, StoryboardScene } from "@/types/storyboard";

interface DraftParams {
  productName: string;
  productDescription: string;
  stylePreference: string;
  sceneCount: string;
  referenceImageUrl?: string;
}

interface GenerateAIDraftDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  storyboard: Storyboard;
  initialParams: DraftParams | null;
  onComplete: (scenes: StoryboardScene[]) => void;
}

interface FormValues {
  productName: string;
  productDescription: string;
  stylePreference: string;
  sceneCount: string;
}

const STYLE_OPTIONS = [
  { value: "cinematic", label: "시네마틱" },
  { value: "commercial", label: "상업 광고" },
  { value: "minimal", label: "미니멀" },
  { value: "vibrant", label: "생동감 있는" },
  { value: "luxury", label: "럭셔리" },
  { value: "playful", label: "재미있는" },
];

// 씬 조회 재시도 로직
async function fetchScenesWithRetry(
  storyboardId: string,
  maxRetries: number = 5,
  delayMs: number = 2000
): Promise<StoryboardScene[] | null> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const result = await fetchStoryboardScenes(storyboardId);

    if (result.success && result.data && result.data.length > 0) {
      return result.data;
    }

    // 마지막 시도가 아니면 대기 후 재시도
    if (attempt < maxRetries - 1) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return null;
}

export function GenerateAIDraftDialog({
  open,
  onOpenChange,
  storyboard,
  initialParams,
  onComplete,
}: GenerateAIDraftDialogProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [referenceImageUrl, setReferenceImageUrl] = useState<string | undefined>(
    initialParams?.referenceImageUrl
  );
  const [referenceImageStoragePath, setReferenceImageStoragePath] = useState<string | undefined>();

  const handleImageChange = (imageUrl: string | undefined, storagePath: string | undefined) => {
    setReferenceImageUrl(imageUrl);
    setReferenceImageStoragePath(storagePath);
  };

  const { register, handleSubmit, setValue, watch } = useForm<FormValues>({
    defaultValues: {
      productName: initialParams?.productName || storyboard.title,
      productDescription: initialParams?.productDescription || storyboard.description || "",
      stylePreference: initialParams?.stylePreference || "commercial",
      sceneCount: initialParams?.sceneCount || "5",
    },
  });

  const stylePreference = watch("stylePreference");
  const sceneCount = watch("sceneCount");

  const estimatedScenes = parseInt(sceneCount || "5", 10);

  const onSubmit = useCallback(async (data: FormValues) => {
    setIsGenerating(true);
    setError(null);
    setProgress(0);
    setStatusMessage("AI 초안 생성 준비 중...");

    try {
      // 1단계: n8n webhook 호출하여 AI 초안 생성
      setProgress(10);
      setStatusMessage("AI가 스토리보드를 분석하고 있습니다...");

      const result = await generateAIDraft({
        storyboardId: storyboard.id,
        productName: data.productName,
        productDescription: data.productDescription,
        stylePreference: data.stylePreference,
        sceneCount: parseInt(data.sceneCount, 10),
        referenceImageUrl: referenceImageUrl,
      });

      if (!result.success) {
        setError(result.error || "AI 초안 생성에 실패했습니다.");
        setIsGenerating(false);
        setProgress(0);
        return;
      }

      // 2단계: 생성된 씬 조회 (재시도 로직 포함)
      setProgress(70);
      setStatusMessage("생성된 씬을 불러오는 중...");

      const scenes = await fetchScenesWithRetry(storyboard.id, 5, 2000);

      if (!scenes || scenes.length === 0) {
        setError("생성된 씬을 불러올 수 없습니다. 잠시 후 다시 시도해주세요.");
        setIsGenerating(false);
        setProgress(0);
        return;
      }

      // 3단계: 완료
      setProgress(100);
      setStatusMessage(`${scenes.length}개의 씬이 생성되었습니다!`);

      // 잠시 대기 후 완료 콜백 호출
      await new Promise((resolve) => setTimeout(resolve, 500));

      onComplete(scenes);
    } catch (err) {
      console.error("Generate AI draft error:", err);
      setError("AI 초안 생성 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsGenerating(false);
    }
  }, [storyboard.id, onComplete, referenceImageUrl]);

  return (
    <Dialog open={open} onOpenChange={isGenerating ? undefined : onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            AI 스토리보드 초안 생성
          </DialogTitle>
          <DialogDescription>
            상품 정보를 입력하면 AI가 스토리보드 초안을 생성합니다.
            약 {estimatedScenes}개의 씬이 생성됩니다. (목표: {storyboard.target_duration}초)
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="productName">상품명 *</Label>
            <Input
              id="productName"
              placeholder="예: 프리미엄 무선 이어폰"
              disabled={isGenerating}
              {...register("productName", { required: true })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="productDescription">상품 설명</Label>
            <Textarea
              id="productDescription"
              placeholder="상품의 특징, 장점, 타겟 고객 등을 설명해주세요."
              rows={4}
              disabled={isGenerating}
              {...register("productDescription")}
            />
          </div>

          <div className="space-y-2">
            <Label>스타일</Label>
            <Select
              value={stylePreference}
              onValueChange={(v) => setValue("stylePreference", v)}
              disabled={isGenerating}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STYLE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 참조 이미지 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-muted-foreground" />
              <Label>참조 이미지 (선택)</Label>
            </div>
            {referenceImageUrl ? (
              <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
                <Image
                  src={referenceImageUrl}
                  alt="참조 이미지"
                  fill
                  className="object-contain"
                  sizes="(max-width: 500px) 100vw, 500px"
                />
                {!isGenerating && (
                  <button
                    type="button"
                    onClick={() => handleImageChange(undefined, undefined)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
                  >
                    <span className="sr-only">이미지 제거</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ) : (
              <ReferenceImageUpload
                value={referenceImageUrl}
                storagePath={referenceImageStoragePath}
                onChange={handleImageChange}
                disabled={isGenerating}
              />
            )}
            <p className="text-xs text-muted-foreground">
              상품 이미지를 업로드하면 AI가 더 정확한 스토리보드를 생성합니다.
            </p>
          </div>

          {/* 진행 상황 표시 */}
          {isGenerating && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-muted-foreground text-center">
                {statusMessage}
              </p>
            </div>
          )}

          {/* 에러 메시지 */}
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="bg-muted p-3 rounded-lg text-sm">
            <p className="font-medium">비용: {STORYBOARD_AI_DRAFT_COST} 크레딧</p>
            <p className="text-muted-foreground mt-1">
              생성된 초안은 자유롭게 수정할 수 있습니다.
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isGenerating}
            >
              취소
            </Button>
            <Button type="submit" disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  생성 중...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  초안 생성하기
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
