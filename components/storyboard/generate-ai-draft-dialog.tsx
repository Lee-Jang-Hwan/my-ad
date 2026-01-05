"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Loader2, Sparkles } from "lucide-react";
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
import { STORYBOARD_AI_DRAFT_COST } from "@/lib/constants/credits";
import type { Storyboard, StoryboardScene } from "@/types/storyboard";

interface DraftParams {
  productName: string;
  productDescription: string;
  stylePreference: string;
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
}

const STYLE_OPTIONS = [
  { value: "cinematic", label: "시네마틱" },
  { value: "commercial", label: "상업 광고" },
  { value: "minimal", label: "미니멀" },
  { value: "vibrant", label: "생동감 있는" },
  { value: "luxury", label: "럭셔리" },
  { value: "playful", label: "재미있는" },
];

export function GenerateAIDraftDialog({
  open,
  onOpenChange,
  storyboard,
  initialParams,
  onComplete,
}: GenerateAIDraftDialogProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, setValue, watch } = useForm<FormValues>({
    defaultValues: {
      productName: initialParams?.productName || storyboard.title,
      productDescription: initialParams?.productDescription || storyboard.description || "",
      stylePreference: initialParams?.stylePreference || "cinematic",
    },
  });

  const stylePreference = watch("stylePreference");

  const estimatedScenes = Math.ceil(storyboard.target_duration / 5);

  const onSubmit = async (data: FormValues) => {
    setIsGenerating(true);
    setError(null);

    try {
      // TODO: Call n8n webhook to generate AI draft
      // For now, we'll simulate with a mock response

      // Mock API call delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock generated scenes
      const mockScenes: StoryboardScene[] = Array.from(
        { length: estimatedScenes },
        (_, i) => ({
          id: `mock-${i + 1}`,
          storyboard_id: storyboard.id,
          scene_order: i + 1,
          scene_name: `씬 ${i + 1}`,
          scene_description: `${data.productName}의 ${i + 1}번째 장면입니다.`,
          dialogue: i === 0 ? `${data.productName}를 소개합니다.` : null,
          dialogue_type: "narration" as const,
          visual_prompt: `A ${data.stylePreference} shot of ${data.productName}`,
          reference_image_url: null,
          camera_angle: "eye_level" as const,
          camera_movement: i % 2 === 0 ? "static" as const : "zoom_in" as const,
          duration_seconds: 3,
          transition_type: "fade" as const,
          transition_duration: 0.5,
          bgm_id: null,
          bgm_volume: 0.8,
          sfx_id: null,
          subtitle_style: {
            position: "bottom" as const,
            fontSize: "medium" as const,
            fontColor: "#FFFFFF",
            bgColor: "#00000080",
          },
          generated_image_url: null,
          generated_clip_url: null,
          generation_status: "pending" as const,
          generation_error: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
      );

      // In real implementation, scenes would be saved to DB by n8n webhook
      // and we'd fetch them after generation completes

      onComplete(mockScenes);
    } catch (err) {
      console.error("Generate AI draft error:", err);
      setError("AI 초안 생성 중 오류가 발생했습니다.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            AI 스토리보드 초안 생성
          </DialogTitle>
          <DialogDescription>
            상품 정보를 입력하면 AI가 스토리보드 초안을 생성합니다.
            약 {estimatedScenes}개의 씬이 생성됩니다.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="productName">상품명 *</Label>
            <Input
              id="productName"
              placeholder="예: 프리미엄 무선 이어폰"
              {...register("productName", { required: true })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="productDescription">상품 설명</Label>
            <Textarea
              id="productDescription"
              placeholder="상품의 특징, 장점, 타겟 고객 등을 설명해주세요."
              rows={4}
              {...register("productDescription")}
            />
          </div>

          <div className="space-y-2">
            <Label>스타일</Label>
            <Select
              value={stylePreference}
              onValueChange={(v) => setValue("stylePreference", v)}
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

          {error && (
            <div className="text-sm text-destructive">{error}</div>
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
