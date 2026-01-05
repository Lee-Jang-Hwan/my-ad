"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Play,
  Settings,
  Sparkles,
  Plus,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SceneList } from "./scene-list";
import { SceneDetailPanel } from "./scene-detail-panel";
import { StoryboardSettings } from "./storyboard-settings";
import { TimelineView } from "./timeline-view";
import { GenerateAIDraftDialog } from "./generate-ai-draft-dialog";
import {
  updateStoryboard,
  createScene,
  updateScene,
  deleteScene,
  duplicateScene,
  reorderScenes,
} from "@/actions/storyboard";
import type {
  Storyboard,
  StoryboardScene,
  UpdateSceneInput,
  CreateSceneInput,
} from "@/types/storyboard";

interface DraftParams {
  productName: string;
  productDescription: string;
  stylePreference: string;
}

interface StoryboardEditorProps {
  storyboard: Storyboard;
  initialScenes: StoryboardScene[];
  draftParams: DraftParams | null;
}

export function StoryboardEditor({
  storyboard,
  initialScenes,
  draftParams,
}: StoryboardEditorProps) {
  const router = useRouter();
  const [scenes, setScenes] = useState<StoryboardScene[]>(initialScenes);
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(
    initialScenes[0]?.id || null
  );
  const [isSaving, setIsSaving] = useState(false);
  const [showAIDraftDialog, setShowAIDraftDialog] = useState(!!draftParams);
  const [activeTab, setActiveTab] = useState<"scenes" | "timeline" | "settings">("scenes");

  const selectedScene = scenes.find((s) => s.id === selectedSceneId) || null;

  // Calculate total duration
  const totalDuration = scenes.reduce((sum, s) => sum + s.duration_seconds, 0);

  // Handle scene selection
  const handleSceneSelect = useCallback((sceneId: string) => {
    setSelectedSceneId(sceneId);
  }, []);

  // Handle scene update
  const handleSceneUpdate = useCallback(
    async (sceneId: string, updates: UpdateSceneInput) => {
      // Optimistic update
      setScenes((prev) =>
        prev.map((s) =>
          s.id === sceneId ? { ...s, ...updates, updated_at: new Date().toISOString() } : s
        )
      );

      // Server update
      const result = await updateScene(sceneId, updates);
      if (!result.success) {
        // Revert on error
        router.refresh();
      }
    },
    [router]
  );

  // Handle scene add
  const handleAddScene = useCallback(async () => {
    const newSceneOrder = scenes.length + 1;
    const input: CreateSceneInput = {
      storyboard_id: storyboard.id,
      scene_order: newSceneOrder,
      scene_name: `씬 ${newSceneOrder}`,
      scene_description: "새 씬 설명을 입력하세요.",
    };

    const result = await createScene(input);
    if (result.success && result.data) {
      setScenes((prev) => [...prev, result.data!]);
      setSelectedSceneId(result.data.id);
    }
  }, [scenes.length, storyboard.id]);

  // Handle scene delete
  const handleSceneDelete = useCallback(
    async (sceneId: string) => {
      const result = await deleteScene(sceneId);
      if (result.success) {
        setScenes((prev) => {
          const newScenes = prev.filter((s) => s.id !== sceneId);
          // Reorder scenes
          return newScenes.map((s, i) => ({
            ...s,
            scene_order: i + 1,
          }));
        });

        // Select adjacent scene
        if (selectedSceneId === sceneId) {
          const currentIndex = scenes.findIndex((s) => s.id === sceneId);
          const nextScene = scenes[currentIndex + 1] || scenes[currentIndex - 1];
          setSelectedSceneId(nextScene?.id || null);
        }
      }
    },
    [scenes, selectedSceneId]
  );

  // Handle scene duplicate
  const handleSceneDuplicate = useCallback(async (sceneId: string) => {
    const result = await duplicateScene(sceneId);
    if (result.success && result.data) {
      router.refresh();
      setSelectedSceneId(result.data.id);
    }
  }, [router]);

  // Handle scene reorder
  const handleSceneReorder = useCallback(
    async (reorderedScenes: StoryboardScene[]) => {
      // Optimistic update
      setScenes(reorderedScenes);

      // Server update
      const reorderItems = reorderedScenes.map((s, index) => ({
        sceneId: s.id,
        newOrder: index + 1,
      }));

      const result = await reorderScenes(storyboard.id, reorderItems);
      if (!result.success) {
        router.refresh();
      }
    },
    [storyboard.id, router]
  );

  // Handle AI draft generation complete
  const handleAIDraftComplete = useCallback(
    (generatedScenes: StoryboardScene[]) => {
      setScenes(generatedScenes);
      setSelectedSceneId(generatedScenes[0]?.id || null);
      setShowAIDraftDialog(false);
      // Clear URL params
      router.replace(`/storyboard/${storyboard.id}`);
    },
    [storyboard.id, router]
  );

  // Save storyboard settings
  const handleSaveSettings = useCallback(
    async (updates: Partial<Storyboard>) => {
      setIsSaving(true);
      const result = await updateStoryboard(storyboard.id, updates);
      setIsSaving(false);
      return result.success;
    },
    [storyboard.id]
  );

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-background px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/storyboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="font-semibold text-lg">{storyboard.title}</h1>
            <p className="text-sm text-muted-foreground">
              {scenes.length}개 씬 · {totalDuration}초
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {scenes.length === 0 && (
            <Button
              variant="outline"
              onClick={() => setShowAIDraftDialog(true)}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              AI 초안 생성
            </Button>
          )}
          <Button variant="outline" disabled>
            <Play className="w-4 h-4 mr-2" />
            미리보기
          </Button>
          <Button disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            저장
          </Button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left panel - Scene list / Timeline / Settings */}
        <div className="w-80 border-r flex flex-col">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as typeof activeTab)}
            className="flex-1 flex flex-col"
          >
            <TabsList className="grid w-full grid-cols-3 m-2">
              <TabsTrigger value="scenes">씬 목록</TabsTrigger>
              <TabsTrigger value="timeline">타임라인</TabsTrigger>
              <TabsTrigger value="settings">
                <Settings className="w-4 h-4" />
              </TabsTrigger>
            </TabsList>

            <TabsContent value="scenes" className="flex-1 overflow-hidden m-0">
              <div className="h-full flex flex-col">
                <div className="p-2 border-b">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={handleAddScene}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    씬 추가
                  </Button>
                </div>
                <SceneList
                  scenes={scenes}
                  selectedSceneId={selectedSceneId}
                  onSceneSelect={handleSceneSelect}
                  onSceneDelete={handleSceneDelete}
                  onSceneDuplicate={handleSceneDuplicate}
                  onReorder={handleSceneReorder}
                />
              </div>
            </TabsContent>

            <TabsContent value="timeline" className="flex-1 overflow-hidden m-0">
              <TimelineView
                scenes={scenes}
                selectedSceneId={selectedSceneId}
                onSceneSelect={handleSceneSelect}
                totalDuration={totalDuration}
              />
            </TabsContent>

            <TabsContent value="settings" className="flex-1 overflow-hidden m-0">
              <StoryboardSettings
                storyboard={storyboard}
                onSave={handleSaveSettings}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Right panel - Scene detail */}
        <div className="flex-1 overflow-auto">
          {selectedScene ? (
            <SceneDetailPanel
              scene={selectedScene}
              onUpdate={(updates) => handleSceneUpdate(selectedScene.id, updates)}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              {scenes.length === 0 ? (
                <div className="text-center">
                  <p className="mb-4">아직 씬이 없습니다.</p>
                  <Button onClick={handleAddScene}>
                    <Plus className="w-4 h-4 mr-2" />첫 번째 씬 추가
                  </Button>
                </div>
              ) : (
                <p>왼쪽에서 씬을 선택하세요.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* AI Draft Dialog */}
      <GenerateAIDraftDialog
        open={showAIDraftDialog}
        onOpenChange={setShowAIDraftDialog}
        storyboard={storyboard}
        initialParams={draftParams}
        onComplete={handleAIDraftComplete}
      />
    </div>
  );
}
