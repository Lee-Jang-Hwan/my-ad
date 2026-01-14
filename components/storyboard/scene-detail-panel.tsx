"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import {
  ImageIcon,
  Video,
  Camera,
  Palette,
  Clock,
  Sparkles,
  Loader2,
  Download,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { generateSceneImage, generateSceneClip, clearSceneImage, clearSceneClip } from "@/actions/storyboard";
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
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CAMERA_ANGLE_LABELS,
  CAMERA_MOVEMENT_LABELS,
  TRANSITION_TYPE_LABELS,
  DIALOGUE_TYPE_LABELS,
  SCENE_GENERATION_STATUS_LABELS,
  type StoryboardScene,
  type UpdateSceneInput,
  type CameraAngle,
  type CameraMovement,
  type TransitionType,
  type DialogueType,
} from "@/types/storyboard";
import { useDebouncedCallback } from "use-debounce";

interface SceneDetailPanelProps {
  scene: StoryboardScene;
  storyboardId: string;
  onUpdate: (updates: UpdateSceneInput) => void;
  onSceneRefresh?: () => void;
}

export function SceneDetailPanel({ scene, storyboardId, onUpdate, onSceneRefresh }: SceneDetailPanelProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [localScene, setLocalScene] = useState(scene);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isGeneratingClip, setIsGeneratingClip] = useState(false);
  const [isClearingImage, setIsClearingImage] = useState(false);
  const [isClearingClip, setIsClearingClip] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // 폴링 정리 함수
  const clearPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  // Sync with prop changes and reset states when scene changes
  useEffect(() => {
    setLocalScene(scene);
    // 씬이 변경되면 상태 초기화
    setGenerationError(null);
    setIsGeneratingImage(false);
    setIsGeneratingClip(false);
    // 폴링 정리
    clearPolling();
    // 스크롤 위치 맨 위로 이동
    scrollContainerRef.current?.scrollTo(0, 0);
  }, [scene.id, clearPolling]); // scene.id로 변경 감지

  // scene 데이터가 변경될 때 (같은 씬의 데이터 업데이트)
  useEffect(() => {
    setLocalScene(scene);
    // 클립 URL이 생성되면 폴링 중지
    if (scene.generated_clip_url && isGeneratingClip) {
      clearPolling();
      setIsGeneratingClip(false);
    }
  }, [scene, isGeneratingClip, clearPolling]);

  // 컴포넌트 언마운트 시 폴링 정리
  useEffect(() => {
    return () => {
      clearPolling();
    };
  }, [clearPolling]);

  // Debounced update for text fields
  const debouncedUpdate = useDebouncedCallback((updates: UpdateSceneInput) => {
    onUpdate(updates);
  }, 500);

  // Handle image generation
  const handleGenerateImage = useCallback(async () => {
    if (!localScene.visual_prompt) {
      setGenerationError("비주얼 프롬프트를 먼저 입력해주세요.");
      return;
    }

    setIsGeneratingImage(true);
    setGenerationError(null);

    try {
      console.log("이미지 생성 시작:", {
        storyboardId,
        sceneId: scene.id,
        visualPrompt: localScene.visual_prompt,
      });

      const result = await generateSceneImage({
        storyboardId,
        sceneId: scene.id,
        visualPrompt: localScene.visual_prompt,
        referenceImageUrl: localScene.reference_image_url || undefined,
      });

      console.log("이미지 생성 결과:", result);

      if (result.success) {
        onSceneRefresh?.();
      } else {
        setGenerationError(result.error || "이미지 생성에 실패했습니다.");
        // n8n이 백그라운드에서 완료될 수 있으므로, 잠시 후 데이터 새로고침 시도
        setTimeout(() => {
          onSceneRefresh?.();
        }, 5000);
      }
    } catch (error) {
      console.error("이미지 생성 오류:", error);
      setGenerationError("이미지 생성 중 오류가 발생했습니다.");
      // 에러 발생 시에도 잠시 후 새로고침 시도
      setTimeout(() => {
        onSceneRefresh?.();
      }, 5000);
    } finally {
      setIsGeneratingImage(false);
    }
  }, [storyboardId, scene.id, localScene.visual_prompt, localScene.reference_image_url, onSceneRefresh]);

  // Handle clip generation (비동기 폴링 방식)
  const handleGenerateClip = useCallback(async () => {
    if (!scene.generated_image_url) {
      setGenerationError("먼저 이미지를 생성해주세요.");
      return;
    }

    setIsGeneratingClip(true);
    setGenerationError(null);

    try {
      console.log("클립 생성 시작:", {
        storyboardId,
        sceneId: scene.id,
      });

      const result = await generateSceneClip({
        storyboardId,
        sceneId: scene.id,
      });

      console.log("클립 생성 결과:", result);

      if (result.success) {
        // 비동기 처리 시작됨 - 폴링으로 완료 확인
        if (result.accepted) {
          // 기존 폴링 정리
          clearPolling();

          // 10초마다 새로고침하여 완료 확인 (최대 10분)
          let pollCount = 0;
          const maxPolls = 60; // 10초 * 60 = 10분
          pollIntervalRef.current = setInterval(() => {
            pollCount++;
            onSceneRefresh?.();

            // 최대 폴링 횟수 도달 시 중지
            if (pollCount >= maxPolls) {
              clearPolling();
              setIsGeneratingClip(false);
              setGenerationError("클립 생성 시간이 초과되었습니다. 페이지를 새로고침해 주세요.");
            }
          }, 10000);

          // 첫 번째 새로고침 3초 후 실행
          setTimeout(() => onSceneRefresh?.(), 3000);
        } else {
          onSceneRefresh?.();
          setIsGeneratingClip(false);
        }
      } else {
        setGenerationError(result.error || "클립 생성에 실패했습니다.");
        setIsGeneratingClip(false);
      }
    } catch (error) {
      console.error("클립 생성 오류:", error);
      setGenerationError("클립 생성 중 오류가 발생했습니다.");
      setIsGeneratingClip(false);
    }
  }, [storyboardId, scene.id, scene.generated_image_url, onSceneRefresh, clearPolling]);

  // Handle image clear
  const handleClearImage = useCallback(async () => {
    if (!scene.generated_image_url) return;

    const confirmed = window.confirm("이미지를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.");
    if (!confirmed) return;

    setIsClearingImage(true);
    setGenerationError(null);

    try {
      const result = await clearSceneImage(storyboardId, scene.id);

      if (result.success) {
        onSceneRefresh?.();
      } else {
        setGenerationError(result.error || "이미지 삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("이미지 삭제 오류:", error);
      setGenerationError("이미지 삭제 중 오류가 발생했습니다.");
    } finally {
      setIsClearingImage(false);
    }
  }, [storyboardId, scene.id, scene.generated_image_url, onSceneRefresh]);

  // Handle clip clear
  const handleClearClip = useCallback(async () => {
    if (!scene.generated_clip_url) return;

    const confirmed = window.confirm("클립을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.");
    if (!confirmed) return;

    setIsClearingClip(true);
    setGenerationError(null);

    try {
      const result = await clearSceneClip(storyboardId, scene.id);

      if (result.success) {
        onSceneRefresh?.();
      } else {
        setGenerationError(result.error || "클립 삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("클립 삭제 오류:", error);
      setGenerationError("클립 삭제 중 오류가 발생했습니다.");
    } finally {
      setIsClearingClip(false);
    }
  }, [storyboardId, scene.id, scene.generated_clip_url, onSceneRefresh]);

  // Handle field change
  const handleChange = useCallback(
    (field: keyof UpdateSceneInput, value: unknown) => {
      setLocalScene((prev) => ({ ...prev, [field]: value }));

      // Immediate update for select fields
      if (
        [
          "camera_angle",
          "camera_movement",
          "transition_type",
          "dialogue_type",
        ].includes(field)
      ) {
        onUpdate({ [field]: value });
      } else {
        debouncedUpdate({ [field]: value });
      }
    },
    [onUpdate, debouncedUpdate]
  );

  const statusLabel = SCENE_GENERATION_STATUS_LABELS[scene.generation_status];
  const isGenerating =
    scene.generation_status === "generating_image" ||
    scene.generation_status === "generating_clip";

  // Handle file download
  const handleDownload = useCallback(async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed:", error);
      // Fallback: open in new tab
      window.open(url, "_blank");
    }
  }, []);

  // 일관된 레이아웃을 위한 고정 높이 상수
  const HEADER_HEIGHT = 36;
  const PREVIEW_SECTION_HEIGHT = 400;
  const ERROR_SECTION_HEIGHT = 48;
  const TABS_HEADER_HEIGHT = 40;
  const TABS_CONTENT_HEIGHT = 280;

  return (
    <div
      ref={scrollContainerRef}
      className="h-full overflow-y-auto overflow-x-hidden"
      style={{ width: '100%' }}
    >
      <div
        className="p-6"
        style={{
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box',
        }}
      >
        {/* Header with scene name - 고정 높이 */}
        <div
          className="flex items-center justify-between gap-4"
          style={{ height: `${HEADER_HEIGHT}px`, marginBottom: '24px' }}
        >
          <Input
            value={localScene.scene_name || ""}
            onChange={(e) => handleChange("scene_name", e.target.value)}
            placeholder="씬 이름"
            className="text-xl font-semibold border-none px-0 focus-visible:ring-0 flex-1 min-w-0"
            style={{ height: `${HEADER_HEIGHT}px` }}
          />
          <Badge
            className="shrink-0"
            variant={
              scene.generation_status === "completed"
                ? "outline"
                : scene.generation_status === "failed"
                  ? "destructive"
                  : "secondary"
            }
          >
            {statusLabel}
          </Badge>
        </div>

        {/* Preview section - 고정 크기 카드 */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
            height: '400px',
            minHeight: '400px',
            maxHeight: '400px',
            marginBottom: '24px',
            boxSizing: 'border-box',
          }}
        >
          {/* Image preview */}
          <div
            style={{
              height: '400px',
              minHeight: '400px',
              maxHeight: '400px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: 'hsl(var(--card))',
              color: 'hsl(var(--card-foreground))',
              borderRadius: '12px',
              border: '1px solid hsl(var(--border))',
              boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
              boxSizing: 'border-box',
              overflow: 'hidden',
            }}
          >
            <div style={{ height: '20px', minHeight: '20px', maxHeight: '20px', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600 }}>
              <ImageIcon className="w-4 h-4 shrink-0" />
              <span>생성된 이미지</span>
            </div>
            <div
              style={{
                height: '280px',
                minHeight: '280px',
                maxHeight: '280px',
                marginTop: '12px',
                borderRadius: '8px',
                backgroundColor: 'hsl(var(--muted))',
                position: 'relative',
                overflow: 'hidden',
                flexShrink: 0,
              }}
            >
              {scene.generated_image_url ? (
                <Image
                  src={`${scene.generated_image_url}?t=${new Date(scene.updated_at).getTime()}`}
                  alt={scene.scene_name || "씬 이미지"}
                  fill
                  className="object-cover"
                  sizes="50vw"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <ImageIcon className="w-12 h-12 text-muted-foreground/30" />
                </div>
              )}
            </div>
            <div
              className="flex gap-2"
              style={{ height: '32px', minHeight: '32px', maxHeight: '32px', flexShrink: 0, marginTop: '12px' }}
            >
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                disabled={isGenerating || isGeneratingImage}
                onClick={handleGenerateImage}
              >
                {isGeneratingImage ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                {isGeneratingImage ? "생성 중..." : "이미지 생성"}
              </Button>
              {scene.generated_image_url && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      handleDownload(
                        scene.generated_image_url!,
                        `scene_${scene.scene_order}_image.png`
                      )
                    }
                    title="이미지 다운로드"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearImage}
                    disabled={isClearingImage}
                    title="이미지 삭제"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    {isClearingImage ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Clip preview */}
          <div
            style={{
              height: '400px',
              minHeight: '400px',
              maxHeight: '400px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: 'hsl(var(--card))',
              color: 'hsl(var(--card-foreground))',
              borderRadius: '12px',
              border: '1px solid hsl(var(--border))',
              boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
              boxSizing: 'border-box',
              overflow: 'hidden',
            }}
          >
            <div style={{ height: '20px', minHeight: '20px', maxHeight: '20px', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600 }}>
              <Video className="w-4 h-4 shrink-0" />
              <span>생성된 클립</span>
            </div>
            <div
              style={{
                height: '280px',
                minHeight: '280px',
                maxHeight: '280px',
                marginTop: '12px',
                borderRadius: '8px',
                backgroundColor: 'hsl(var(--muted))',
                position: 'relative',
                overflow: 'hidden',
                flexShrink: 0,
              }}
            >
              {scene.generated_clip_url ? (
                <video
                  src={`${scene.generated_clip_url}?t=${new Date(scene.updated_at).getTime()}`}
                  className="w-full h-full object-cover"
                  controls
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Video className="w-12 h-12 text-muted-foreground/30" />
                </div>
              )}
            </div>
            <div
              className="flex gap-2"
              style={{ height: '32px', minHeight: '32px', maxHeight: '32px', flexShrink: 0, marginTop: '12px' }}
            >
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                disabled={isGenerating || isGeneratingClip || !scene.generated_image_url}
                onClick={handleGenerateClip}
              >
                {isGeneratingClip ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                {isGeneratingClip ? "생성 중..." : "클립 생성"}
              </Button>
              {scene.generated_clip_url && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      handleDownload(
                        scene.generated_clip_url!,
                        `scene_${scene.scene_order}_clip.mp4`
                      )
                    }
                    title="클립 다운로드"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearClip}
                    disabled={isClearingClip}
                    title="클립 삭제"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    {isClearingClip ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Error message - 고정 높이 영역 (에러 없어도 공간 유지) */}
        <div
          style={{
            height: `${ERROR_SECTION_HEIGHT}px`,
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          {generationError ? (
            <div className="w-full bg-destructive/10 text-destructive px-4 py-3 rounded-lg text-sm flex items-center justify-between">
              <span>{generationError}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setGenerationError(null);
                  onSceneRefresh?.();
                }}
                className="text-destructive hover:text-destructive ml-2 shrink-0"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                새로고침
              </Button>
            </div>
          ) : (
            <div className="w-full" style={{ height: '1px' }} />
          )}
        </div>

        {/* Tabs for different settings - 고정 높이 */}
        <Tabs defaultValue="content" style={{ width: '100%' }}>
          <TabsList
            className="grid w-full grid-cols-4"
            style={{ height: `${TABS_HEADER_HEIGHT}px` }}
          >
            <TabsTrigger value="content">내용</TabsTrigger>
            <TabsTrigger value="visual">시각</TabsTrigger>
            <TabsTrigger value="camera">카메라</TabsTrigger>
            <TabsTrigger value="timing">타이밍</TabsTrigger>
          </TabsList>

          {/* Content tab - 고정 높이 */}
          <TabsContent
            value="content"
            className="mt-4"
            style={{ width: '100%', height: `${TABS_CONTENT_HEIGHT}px` }}
          >
            <div className="space-y-4 h-full" style={{ width: '100%' }}>
              <div className="space-y-2">
                <Label>씬 설명</Label>
                <Textarea
                  value={localScene.scene_description}
                  onChange={(e) =>
                    handleChange("scene_description", e.target.value)
                  }
                  placeholder="이 씬에서 보여질 시각적 요소를 설명하세요."
                  className="resize-none"
                  style={{ height: '100px', minHeight: '100px', maxHeight: '100px' }}
                />
              </div>

              <div className="space-y-2">
                <Label>대사 / 나레이션</Label>
                <div className="flex gap-2 mb-2">
                  <Select
                    value={localScene.dialogue_type}
                    onValueChange={(v) =>
                      handleChange("dialogue_type", v as DialogueType)
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(DIALOGUE_TYPE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Textarea
                  value={localScene.dialogue || ""}
                  onChange={(e) => handleChange("dialogue", e.target.value)}
                  placeholder="이 씬의 대사나 나레이션을 입력하세요."
                  className="resize-none"
                  style={{ height: '80px', minHeight: '80px', maxHeight: '80px' }}
                />
              </div>
            </div>
          </TabsContent>

          {/* Visual tab - 고정 높이 */}
          <TabsContent
            value="visual"
            className="mt-4"
            style={{ width: '100%', height: `${TABS_CONTENT_HEIGHT}px` }}
          >
            <div className="space-y-4 h-full" style={{ width: '100%' }}>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  비주얼 프롬프트
                </Label>
                <Textarea
                  value={localScene.visual_prompt || ""}
                  onChange={(e) => handleChange("visual_prompt", e.target.value)}
                  placeholder="이미지 생성을 위한 상세 프롬프트 (영문 권장)"
                  className="resize-none"
                  style={{ height: '100px', minHeight: '100px', maxHeight: '100px' }}
                />
                <p className="text-xs text-muted-foreground">
                  DALL-E에 전달될 이미지 생성 프롬프트입니다. 영문으로 작성하면 더
                  좋은 결과를 얻을 수 있습니다.
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Camera tab - 고정 높이 */}
          <TabsContent
            value="camera"
            className="mt-4"
            style={{ width: '100%', height: `${TABS_CONTENT_HEIGHT}px` }}
          >
            <div className="space-y-4 h-full" style={{ width: '100%' }}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Camera className="w-4 h-4" />
                    카메라 앵글
                  </Label>
                  <Select
                    value={localScene.camera_angle}
                    onValueChange={(v) =>
                      handleChange("camera_angle", v as CameraAngle)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CAMERA_ANGLE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>카메라 움직임</Label>
                  <Select
                    value={localScene.camera_movement}
                    onValueChange={(v) =>
                      handleChange("camera_movement", v as CameraMovement)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CAMERA_MOVEMENT_LABELS).map(
                        ([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Timing tab - 고정 높이 */}
          <TabsContent
            value="timing"
            className="mt-4"
            style={{ width: '100%', height: `${TABS_CONTENT_HEIGHT}px` }}
          >
            <div className="space-y-4 h-full" style={{ width: '100%' }}>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  씬 길이
                </Label>
                <Select
                  value={String(localScene.duration_seconds)}
                  onValueChange={(v) => handleChange("duration_seconds", Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4">4초</SelectItem>
                    <SelectItem value="8">8초</SelectItem>
                    <SelectItem value="12">12초</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Sora API 지원 시간: 4초, 8초, 12초
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>트랜지션 효과</Label>
                  <Select
                    value={localScene.transition_type}
                    onValueChange={(v) =>
                      handleChange("transition_type", v as TransitionType)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(TRANSITION_TYPE_LABELS).map(
                        ([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>트랜지션 길이: {localScene.transition_duration}초</Label>
                  <Slider
                    value={[localScene.transition_duration]}
                    onValueChange={([v]) =>
                      handleChange("transition_duration", v)
                    }
                    min={0}
                    max={2}
                    step={0.1}
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
