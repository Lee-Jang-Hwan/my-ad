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
  Layers,
  Info,
  ImageIcon,
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
import { ReferenceImageUpload } from "@/components/storyboard/reference-image-upload";
import { createStoryboard } from "@/actions/storyboard";
import { type AspectRatio } from "@/types/storyboard";
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
  aspectRatio: z.enum(["16:9", "9:16"]),
  sceneDuration: z.enum(["4", "8", "12"]),
  colorGrade: z.string().optional(),
  sceneCount: z.enum(["3", "4", "5", "6", "7"]),
});

type CreateStoryboardFormValues = z.infer<typeof createStoryboardSchema>;

const SCENE_COUNT_OPTIONS = [
  { value: "3", label: "3개" },
  { value: "4", label: "4개" },
  { value: "5", label: "5개" },
  { value: "6", label: "6개" },
  { value: "7", label: "7개" },
];

const STYLE_OPTIONS = [
  { value: "commercial", label: "상업 광고" },
  { value: "cinematic", label: "시네마틱" },
  { value: "minimal", label: "미니멀" },
  { value: "vibrant", label: "생동감 있는" },
  { value: "luxury", label: "럭셔리" },
  { value: "playful", label: "재미있는" },
  { value: "animation", label: "애니메이션" },
];

const SCENE_DURATION_OPTIONS = [
  { value: "4", label: "4초" },
  { value: "8", label: "8초" },
  { value: "12", label: "12초" },
];

const ASPECT_RATIO_OPTIONS = [
  { value: "16:9", label: "가로형 (16:9)" },
  { value: "9:16", label: "세로형 (9:16)" },
];

export function StoryboardCreateForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useAIDraft, setUseAIDraft] = useState(true);
  const [referenceImageUrl, setReferenceImageUrl] = useState<string | undefined>();
  const [referenceImageStoragePath, setReferenceImageStoragePath] = useState<string | undefined>();

  const handleImageChange = (imageUrl: string | undefined, storagePath: string | undefined) => {
    setReferenceImageUrl(imageUrl);
    setReferenceImageStoragePath(storagePath);
  };

  const form = useForm<CreateStoryboardFormValues>({
    resolver: zodResolver(createStoryboardSchema),
    defaultValues: {
      title: "",
      description: "",
      productName: "",
      productDescription: "",
      aspectRatio: "9:16",
      sceneDuration: "8",
      colorGrade: "commercial",
      sceneCount: "5",
    },
  });

  const watchedSceneDuration = form.watch("sceneDuration");
  const watchedSceneCount = form.watch("sceneCount");
  const sceneDurationSeconds = parseInt(watchedSceneDuration || "8", 10);
  const estimatedScenes = parseInt(watchedSceneCount || "5", 10);

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
      // sceneDuration을 기반으로 target_duration 계산 (씬 개수 * 씬 시간)
      const sceneDurationNum = parseInt(values.sceneDuration, 10) as 4 | 8 | 12;
      const sceneCountNum = parseInt(values.sceneCount, 10);
      const targetDuration = sceneCountNum * sceneDurationNum;

      // Create storyboard
      const result = await createStoryboard({
        title: values.title,
        description: values.description,
        aspect_ratio: values.aspectRatio as AspectRatio,
        target_duration: targetDuration,
        default_scene_duration: sceneDurationNum,
        color_grade: values.colorGrade,
        product_reference_image_url: referenceImageUrl,
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
        const params = new URLSearchParams({
          productName: values.productName,
          productDescription: values.productDescription || "",
          sceneCount: values.sceneCount,
          generateDraft: "true",
        });
        // 참조 이미지 URL이 있으면 추가
        if (referenceImageUrl) {
          params.set("referenceImageUrl", referenceImageUrl);
        }
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

                {/* 참조 이미지 업로드 */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">참조 이미지 (선택)</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-3 h-3 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>상품 이미지나 원하는 스타일의 참조 이미지를 업로드하면 AI가 더 정확한 스토리보드를 생성합니다.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <ReferenceImageUpload
                    value={referenceImageUrl}
                    storagePath={referenceImageStoragePath}
                    onChange={handleImageChange}
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-muted-foreground">
                    상품 이미지나 원하는 스타일의 이미지를 업로드하세요.
                  </p>
                </div>
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
                            {ASPECT_RATIO_OPTIONS.map((option) => (
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
                        <FormLabel>스타일</FormLabel>
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
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="sceneCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1">
                          <Layers className="w-4 h-4" />
                          씬 갯수
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="씬 갯수 선택" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {SCENE_COUNT_OPTIONS.map((option) => (
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
                    name="sceneDuration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          씬 당 시간
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="씬 시간 선택" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {SCENE_DURATION_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          각 씬의 재생 시간 (Sora 지원)
                        </FormDescription>
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
