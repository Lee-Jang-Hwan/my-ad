"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Loader2,
  CheckCircle,
  XCircle,
  ImageIcon,
  Video,
  Film,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useRealtimeStoryboard } from "@/hooks/use-realtime-storyboard";
import type { Storyboard, StoryboardScene, StoryboardProgressStage } from "@/types/storyboard";

interface GenerationProgressProps {
  storyboard: Storyboard;
  initialScenes: StoryboardScene[];
}

const stageLabels: Record<StoryboardProgressStage, string> = {
  init: "초기화 중...",
  ai_draft_generation: "AI 스토리보드 초안 생성 중...",
  user_editing: "편집 준비 완료",
  scene_image_generation: "씬 이미지 생성 중...",
  scene_clip_generation: "씬 클립 생성 중...",
  final_merge: "최종 영상 병합 중...",
  completed: "완료!",
  failed: "오류 발생",
};

const stageIcons: Record<StoryboardProgressStage, React.ReactNode> = {
  init: <Loader2 className="w-5 h-5 animate-spin" />,
  ai_draft_generation: <Sparkles className="w-5 h-5 animate-pulse" />,
  user_editing: <CheckCircle className="w-5 h-5 text-green-500" />,
  scene_image_generation: <ImageIcon className="w-5 h-5 animate-pulse" />,
  scene_clip_generation: <Video className="w-5 h-5 animate-pulse" />,
  final_merge: <Film className="w-5 h-5 animate-pulse" />,
  completed: <CheckCircle className="w-5 h-5 text-green-500" />,
  failed: <XCircle className="w-5 h-5 text-red-500" />,
};

export function GenerationProgress({
  storyboard,
  initialScenes,
}: GenerationProgressProps) {
  const router = useRouter();

  const handleComplete = useCallback(
    (completed: Storyboard) => {
      console.log("Generation completed:", completed);
      // Small delay before redirect
      setTimeout(() => {
        router.push(`/storyboard/${completed.id}`);
      }, 2000);
    },
    [router]
  );

  const handleError = useCallback((failed: Storyboard) => {
    console.error("Generation failed:", failed);
  }, []);

  const { storyboard: currentStoryboard, scenes, currentStage, progressPercent, isCompleted, isFailed, error } =
    useRealtimeStoryboard({
      initialStoryboard: storyboard,
      initialScenes,
      onComplete: handleComplete,
      onError: handleError,
    });

  // Calculate scene progress
  const totalScenes = scenes.length;
  const completedImageScenes = scenes.filter(
    (s) => s.generated_image_url !== null
  ).length;
  const completedClipScenes = scenes.filter(
    (s) => s.generated_clip_url !== null
  ).length;

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          {stageIcons[currentStage]}
        </div>
        <CardTitle className="text-xl">
          {isCompleted
            ? "스토리보드 생성 완료!"
            : isFailed
              ? "생성 중 오류 발생"
              : stageLabels[currentStage]}
        </CardTitle>
        <p className="text-muted-foreground">{currentStoryboard.title}</p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">진행률</span>
            <span className="font-medium">{Math.round(progressPercent)}%</span>
          </div>
          <Progress value={progressPercent} className="h-3" />
        </div>

        {/* Scene progress */}
        {totalScenes > 0 && (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted rounded-lg p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <ImageIcon className="w-4 h-4" />
                <span className="text-sm font-medium">이미지</span>
              </div>
              <p className="text-2xl font-bold">
                {completedImageScenes}/{totalScenes}
              </p>
            </div>
            <div className="bg-muted rounded-lg p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Video className="w-4 h-4" />
                <span className="text-sm font-medium">클립</span>
              </div>
              <p className="text-2xl font-bold">
                {completedClipScenes}/{totalScenes}
              </p>
            </div>
          </div>
        )}

        {/* Scene thumbnails */}
        {scenes.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">씬 진행 상황</h4>
            <div className="grid grid-cols-4 gap-2">
              {scenes.slice(0, 8).map((scene) => (
                <div
                  key={scene.id}
                  className="aspect-video rounded bg-muted relative overflow-hidden"
                >
                  {scene.generated_image_url ? (
                    <Image
                      src={scene.generated_image_url}
                      alt={scene.scene_name || `씬 ${scene.scene_order}`}
                      fill
                      className="object-cover"
                      sizes="100px"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      {scene.generation_status === "generating_image" ||
                      scene.generation_status === "generating_clip" ? (
                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          {scene.scene_order}
                        </span>
                      )}
                    </div>
                  )}
                  {scene.generated_clip_url && (
                    <div className="absolute bottom-0 right-0 bg-green-500 p-0.5 rounded-tl">
                      <CheckCircle className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
              ))}
              {scenes.length > 8 && (
                <div className="aspect-video rounded bg-muted flex items-center justify-center">
                  <span className="text-sm text-muted-foreground">
                    +{scenes.length - 8}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="rounded-lg bg-destructive/10 p-4 text-destructive text-sm">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-center gap-3">
          {isCompleted && (
            <Link href={`/storyboard/${currentStoryboard.id}`}>
              <Button>
                <CheckCircle className="w-4 h-4 mr-2" />
                에디터로 이동
              </Button>
            </Link>
          )}

          {isFailed && (
            <>
              <Link href={`/storyboard/${currentStoryboard.id}`}>
                <Button variant="outline">에디터에서 수정하기</Button>
              </Link>
              <Link href="/storyboard">
                <Button variant="ghost">목록으로</Button>
              </Link>
            </>
          )}

          {!isCompleted && !isFailed && (
            <p className="text-sm text-muted-foreground text-center">
              생성이 완료되면 자동으로 에디터로 이동합니다.
              <br />이 페이지를 나가도 생성은 계속됩니다.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
