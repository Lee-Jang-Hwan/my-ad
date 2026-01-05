"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Loader2,
  Sparkles,
  Film,
  Clock,
  Ratio,
  Palette,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CreditDisplay } from "@/components/credit/credit-display";
import { createStoryboard } from "@/actions/storyboard";
import {
  ASPECT_RATIO_LABELS,
  type AspectRatio,
} from "@/types/storyboard";
import {
  STORYBOARD_AI_DRAFT_COST,
  calculateStoryboardCost,
  getStoryboardCostBreakdown,
} from "@/lib/constants/credits";

const createStoryboardSchema = z.object({
  title: z
    .string()
    .min(1, "제목을 입력해주세요.")
    .max(100, "제목은 100자 이내로 입력해주세요."),
  description: z
    .string()
    .max(500, "설명은 500자 이내로 입력해주세요.")
    .optional(),
  productName: z
    .string()
    .min(1, "상품명을 입력해주세요.")
    .max(100, "상품명은 100자 이내로 입력해주세요."),
  productDescription: z
    .string()
    .max(1000, "상품 설명은 1000자 이내로 입력해주세요.")
    .optional(),
  aspectRatio: z.enum(["16:9", "9:16", "1:1", "4:3"]),
  targetDuration: z.coerce.number().min(5).max(120),
  colorGrade: z.string().optional(),
  stylePreference: z.string().optional(),
});

type CreateStoryboardFormValues = z.infer<typeof createStoryboardSchema>;

const STYLE_OPTIONS = [
  { value: "cinematic", label: "시네마틱" },
  { value: "commercial", label: "상업 광고" },
  { value: "minimal", label: "미니멀" },
  { value: "vibrant", label: "생동감 있는" },
  { value: "luxury", label: "럭셔리" },
  { value: "playful", label: "재미있는" },
];

const COLOR_GRADE_OPTIONS = [
  { value: "natural", label: "자연스러운" },
  { value: "warm", label: "따뜻한" },
  { value: "cool", label: "차가운" },
  { value: "vintage", label: "빈티지" },
  { value: "high-contrast", label: "고대비" },
  { value: "soft", label: "부드러운" },
];

export function StoryboardCreateForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useAIDraft, setUseAIDraft] = useState(true);

  const form = useForm<CreateStoryboardFormValues>({
    resolver: zodResolver(createStoryboardSchema),
    defaultValues: {
      title: "",
      description: "",
      productName: "",
      productDescription: "",
      aspectRatio: "16:9",
      targetDuration: 30,
      colorGrade: "natural",
      stylePreference: "cinematic",
    },
  });

  const watchedDuration = form.watch("targetDuration");
  const estimatedScenes = Math.ceil(watchedDuration / 5);

  // Calculate costs
  const costBreakdown = getStoryboardCostBreakdown(estimatedScenes, {
    includeAIDraft: useAIDraft,
    generateImages: true,
    generateClips: true,
    includeFinalMerge: true,
  });

  const totalCost = calculateStoryboardCost(estimatedScenes, {
    includeAIDraft: useAIDraft,
    generateImages: true,
    generateClips: true,
    includeFinalMerge: true,
  });

  const handleSubmit = async (values: CreateStoryboardFormValues) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Create storyboard
      const result = await createStoryboard({
        title: values.title,
        description: values.description,
        aspect_ratio: values.aspectRatio as AspectRatio,
        target_duration: values.targetDuration,
        color_grade: values.colorGrade,
      });

      if (!result.success || !result.data) {
        setError(result.error || "스토리보드 생성에 실패했습니다.");
        setIsSubmitting(false);
        return;
      }

      const storyboardId = result.data.id;

      // If using AI draft, redirect to AI draft generation page
      // Otherwise, redirect to editor
      if (useAIDraft) {
        // TODO: Implement AI draft generation with n8n webhook
        // For now, redirect to editor with product info in URL
        const params = new URLSearchParams({
          productName: values.productName,
          productDescription: values.productDescription || "",
          stylePreference: values.stylePreference || "",
          generateDraft: "true",
        });
        router.push(`/storyboard/${storyboardId}?${params.toString()}`);
      } else {
        router.push(`/storyboard/${storyboardId}`);
      }
    } catch (err) {
      console.error("Create storyboard error:", err);
      setError("스토리보드 생성 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Main form */}
      <div className="lg:col-span-2 space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Basic info card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Film className="w-5 h-5" />
                  기본 정보
                </CardTitle>
                <CardDescription>
                  스토리보드의 기본 정보를 입력하세요.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>스토리보드 제목 *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="예: 신제품 런칭 광고"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>설명 (선택)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="스토리보드에 대한 간단한 설명을 입력하세요."
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Product info card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  상품 정보
                </CardTitle>
                <CardDescription>
                  AI가 스토리보드를 생성할 때 참고할 상품 정보입니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="productName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>상품명 *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="예: 프리미엄 무선 이어폰"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="productDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>상품 설명 (선택)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="상품의 특징, 장점, 타겟 고객 등을 자세히 설명해주세요. 더 좋은 스토리보드가 생성됩니다."
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        상품의 특징을 자세히 입력할수록 더 좋은 스토리보드가 생성됩니다.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Video settings card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ratio className="w-5 h-5" />
                  영상 설정
                </CardTitle>
                <CardDescription>
                  생성될 영상의 형식과 길이를 설정하세요.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="aspectRatio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1">
                          화면 비율
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="w-3 h-3 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>16:9: YouTube, TV</p>
                                <p>9:16: 인스타 릴스, 틱톡</p>
                                <p>1:1: 인스타 피드</p>
                                <p>4:3: 클래식</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="화면 비율 선택" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(ASPECT_RATIO_LABELS).map(
                              ([value, label]) => (
                                <SelectItem key={value} value={value}>
                                  {label}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="targetDuration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          목표 길이 (초)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={5}
                            max={120}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          약 {estimatedScenes}개 씬 생성 예상
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="stylePreference"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1">
                          <Palette className="w-4 h-4" />
                          스타일
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="스타일 선택" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {STYLE_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="colorGrade"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>색감</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="색감 선택" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {COLOR_GRADE_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Error message */}
            {error && (
              <div className="rounded-lg bg-destructive/10 p-4 text-destructive text-sm">
                {error}
              </div>
            )}

            {/* Submit button */}
            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  생성 중...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  {useAIDraft ? "AI 스토리보드 생성하기" : "빈 스토리보드 만들기"}
                </>
              )}
            </Button>
          </form>
        </Form>
      </div>

      {/* Sidebar with cost info */}
      <div className="space-y-6">
        <CreditDisplay />

        {/* Cost breakdown card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">예상 크레딧</CardTitle>
            <CardDescription>
              {estimatedScenes}개 씬 기준 예상 비용
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {costBreakdown.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-muted-foreground">
                    {item.label}
                    {item.count && ` (${item.count}개)`}
                  </span>
                  <span className="font-medium">{item.cost} 크레딧</span>
                </div>
              ))}
              <div className="border-t pt-3 mt-3">
                <div className="flex items-center justify-between font-semibold">
                  <span>총 예상 비용</span>
                  <span className="text-primary">{totalCost} 크레딧</span>
                </div>
              </div>
            </div>

            {/* AI Draft toggle */}
            <div className="mt-4 pt-4 border-t">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useAIDraft}
                  onChange={(e) => setUseAIDraft(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <div>
                  <span className="text-sm font-medium">AI 초안 생성</span>
                  <p className="text-xs text-muted-foreground">
                    {STORYBOARD_AI_DRAFT_COST} 크레딧 추가
                  </p>
                </div>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Tips card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">💡 팁</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>• 상품 설명을 자세히 입력하면 더 좋은 스토리보드가 생성됩니다.</p>
            <p>• AI가 생성한 초안은 언제든지 수정할 수 있습니다.</p>
            <p>• 짧은 영상(15-30초)이 광고 효과가 더 좋습니다.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
