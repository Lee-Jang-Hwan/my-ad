"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
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
import { ASPECT_RATIO_LABELS, type Storyboard, type AspectRatio } from "@/types/storyboard";

interface StoryboardSettingsProps {
  storyboard: Storyboard;
  onSave: (updates: Partial<Storyboard>) => Promise<boolean>;
}

interface FormValues {
  title: string;
  description: string;
  aspectRatio: AspectRatio;
  targetDuration: number;
  colorGrade: string;
}

const COLOR_GRADE_OPTIONS = [
  { value: "natural", label: "자연스러운" },
  { value: "warm", label: "따뜻한" },
  { value: "cool", label: "차가운" },
  { value: "vintage", label: "빈티지" },
  { value: "high-contrast", label: "고대비" },
  { value: "soft", label: "부드러운" },
];

export function StoryboardSettings({
  storyboard,
  onSave,
}: StoryboardSettingsProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { isDirty },
  } = useForm<FormValues>({
    defaultValues: {
      title: storyboard.title,
      description: storyboard.description || "",
      aspectRatio: storyboard.aspect_ratio,
      targetDuration: storyboard.target_duration,
      colorGrade: storyboard.color_grade,
    },
  });

  // Reset form when storyboard changes
  useEffect(() => {
    reset({
      title: storyboard.title,
      description: storyboard.description || "",
      aspectRatio: storyboard.aspect_ratio,
      targetDuration: storyboard.target_duration,
      colorGrade: storyboard.color_grade,
    });
  }, [storyboard, reset]);

  const aspectRatio = watch("aspectRatio");
  const colorGrade = watch("colorGrade");

  const onSubmit = async (data: FormValues) => {
    setIsSaving(true);
    setSaveStatus("idle");

    const success = await onSave({
      title: data.title,
      description: data.description || null,
      aspect_ratio: data.aspectRatio,
      target_duration: data.targetDuration,
      color_grade: data.colorGrade,
    });

    setIsSaving(false);
    setSaveStatus(success ? "success" : "error");

    // Reset status after 2 seconds
    setTimeout(() => setSaveStatus("idle"), 2000);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">제목</Label>
        <Input id="title" {...register("title")} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">설명</Label>
        <Textarea
          id="description"
          {...register("description")}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label>화면 비율</Label>
        <Select
          value={aspectRatio}
          onValueChange={(v) => setValue("aspectRatio", v as AspectRatio, { shouldDirty: true })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(ASPECT_RATIO_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="targetDuration">목표 길이 (초)</Label>
        <Input
          id="targetDuration"
          type="number"
          min={5}
          max={120}
          {...register("targetDuration", { valueAsNumber: true })}
        />
      </div>

      <div className="space-y-2">
        <Label>색감</Label>
        <Select
          value={colorGrade}
          onValueChange={(v) => setValue("colorGrade", v, { shouldDirty: true })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {COLOR_GRADE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={!isDirty || isSaving}
      >
        {isSaving ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            저장 중...
          </>
        ) : saveStatus === "success" ? (
          "저장됨 ✓"
        ) : saveStatus === "error" ? (
          "저장 실패"
        ) : (
          "설정 저장"
        )}
      </Button>
    </form>
  );
}
