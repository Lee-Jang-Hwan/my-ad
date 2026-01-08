"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import {
  ImageIcon,
  Video,
  Camera,
  Palette,
  Clock,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
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
  onUpdate: (updates: UpdateSceneInput) => void;
}

export function SceneDetailPanel({ scene, onUpdate }: SceneDetailPanelProps) {
  const [localScene, setLocalScene] = useState(scene);

  // Sync with prop changes
  useEffect(() => {
    setLocalScene(scene);
  }, [scene]);

  // Debounced update for text fields
  const debouncedUpdate = useDebouncedCallback((updates: UpdateSceneInput) => {
    onUpdate(updates);
  }, 500);

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

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header with scene name */}
        <div className="flex items-center justify-between">
          <Input
            value={localScene.scene_name || ""}
            onChange={(e) => handleChange("scene_name", e.target.value)}
            placeholder="씬 이름"
            className="text-xl font-semibold border-none px-0 focus-visible:ring-0 h-auto"
          />
          <Badge
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

        {/* Preview section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Image preview */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                생성된 이미지
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video rounded-lg bg-muted relative overflow-hidden">
                {scene.generated_image_url ? (
                  <Image
                    src={scene.generated_image_url}
                    alt={scene.scene_name || "씬 이미지"}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-muted-foreground/30" />
                  </div>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2"
                disabled={isGenerating}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                이미지 생성
              </Button>
            </CardContent>
          </Card>

          {/* Clip preview */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Video className="w-4 h-4" />
                생성된 클립
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video rounded-lg bg-muted relative overflow-hidden">
                {scene.generated_clip_url ? (
                  <video
                    src={scene.generated_clip_url}
                    className="w-full h-full object-cover"
                    controls
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Video className="w-12 h-12 text-muted-foreground/30" />
                  </div>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2"
                disabled={isGenerating || !scene.generated_image_url}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                클립 생성
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different settings */}
        <Tabs defaultValue="content" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="content">내용</TabsTrigger>
            <TabsTrigger value="visual">시각</TabsTrigger>
            <TabsTrigger value="camera">카메라</TabsTrigger>
            <TabsTrigger value="timing">타이밍</TabsTrigger>
          </TabsList>

          {/* Content tab */}
          <TabsContent value="content" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>씬 설명</Label>
              <Textarea
                value={localScene.scene_description}
                onChange={(e) =>
                  handleChange("scene_description", e.target.value)
                }
                placeholder="이 씬에서 보여질 시각적 요소를 설명하세요."
                rows={4}
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
                rows={3}
              />
            </div>
          </TabsContent>

          {/* Visual tab */}
          <TabsContent value="visual" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Palette className="w-4 h-4" />
                비주얼 프롬프트
              </Label>
              <Textarea
                value={localScene.visual_prompt || ""}
                onChange={(e) => handleChange("visual_prompt", e.target.value)}
                placeholder="이미지 생성을 위한 상세 프롬프트 (영문 권장)"
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                DALL-E에 전달될 이미지 생성 프롬프트입니다. 영문으로 작성하면 더
                좋은 결과를 얻을 수 있습니다.
              </p>
            </div>
          </TabsContent>

          {/* Camera tab */}
          <TabsContent value="camera" className="space-y-4 mt-4">
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
          </TabsContent>

          {/* Timing tab */}
          <TabsContent value="timing" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  씬 길이: {localScene.duration_seconds}초
                </Label>
                <Slider
                  value={[localScene.duration_seconds]}
                  onValueChange={([v]) => handleChange("duration_seconds", v)}
                  min={1}
                  max={15}
                  step={0.5}
                />
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
