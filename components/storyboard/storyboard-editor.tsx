"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  Save,
  Play,
  Settings,
  Sparkles,
  Plus,
  Loader2,
  Film,
  CheckCircle,
  X,
  Download,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  fetchStoryboardScenes,
  triggerFinalMerge,
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
  sceneCount: string;
  referenceImageUrl?: string;
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
  const [isMerging, setIsMerging] = useState(false);
  const [mergeError, setMergeError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Check if merge is already complete (from database)
  const hasFinalVideo = !!storyboard.final_video_url;

  const selectedScene = scenes.find((s) => s.id === selectedSceneId) || null;

  // Calculate total duration
  const totalDuration = scenes.reduce((sum, s) => sum + s.duration_seconds, 0);

  // Check if all scenes have clips (ready for final merge)
  const allScenesHaveClips = scenes.length > 0 && scenes.every((s) => s.generated_clip_url);
  const scenesWithClips = scenes.filter((s) => s.generated_clip_url).length;

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

  // Handle scene refresh (fetch latest scene data from server)
  const handleSceneRefresh = useCallback(async () => {
    const result = await fetchStoryboardScenes(storyboard.id);
    if (result.success && result.data) {
      setScenes(result.data);
    }
  }, [storyboard.id]);

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

  // Handle save button click - sync all data
  const handleSave = useCallback(async () => {
    if (isSaving) return; // Prevent double click

    setIsSaving(true);

    try {
      // Add minimum delay for visual feedback
      const [result] = await Promise.all([
        fetchStoryboardScenes(storyboard.id),
        new Promise(resolve => setTimeout(resolve, 500)) // Minimum 500ms for UX
      ]);

      if (result.success && result.data) {
        setScenes(result.data);
        toast.success("저장되었습니다.", {
          duration: 2000,
        });
      } else {
        toast.error("저장에 실패했습니다.", {
          duration: 3000,
        });
      }
      // Refresh page data
      router.refresh();
    } catch (error) {
      console.error("Save error:", error);
      toast.error("저장 중 오류가 발생했습니다.", {
        duration: 3000,
      });
    } finally {
      setIsSaving(false);
    }
  }, [storyboard.id, router, isSaving]);

  // Handle video download
  const handleDownload = useCallback(async () => {
    if (!storyboard.final_video_url || isDownloading) return;

    setIsDownloading(true);
    try {
      const response = await fetch(storyboard.final_video_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${storyboard.title || "storyboard"}_final.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("다운로드가 시작되었습니다.");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("다운로드에 실패했습니다.");
    } finally {
      setIsDownloading(false);
    }
  }, [storyboard.final_video_url, storyboard.title, isDownloading]);

  // Handle final video merge
  const handleFinalMerge = useCallback(async () => {
    if (!allScenesHaveClips) {
      setMergeError("모든 씬의 클립을 먼저 생성해주세요.");
      return;
    }

    setIsMerging(true);
    setMergeError(null);

    try {
      const result = await triggerFinalMerge({
        storyboardId: storyboard.id,
      });

      if (result.success) {
        toast.success("최종 영상 병합이 완료되었습니다!");
        // Refresh to get the updated storyboard with final_video_url
        router.refresh();
      } else {
        const errorMsg = result.error || "최종 영상 병합에 실패했습니다.";
        setMergeError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error("Final merge error:", error);
      const errorMsg = "최종 영상 병합 중 오류가 발생했습니다.";
      setMergeError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsMerging(false);
    }
  }, [allScenesHaveClips, storyboard.id, router]);

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
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

          {/* Final merge button */}
          {scenes.length > 0 && (
            <Button
              variant={hasFinalVideo ? "outline" : "default"}
              disabled={isMerging || !allScenesHaveClips}
              onClick={handleFinalMerge}
              title={
                hasFinalVideo
                  ? "이미 병합된 영상이 있습니다. 다시 병합하면 기존 영상을 대체합니다."
                  : !allScenesHaveClips
                    ? `${scenesWithClips}/${scenes.length}개 씬에 클립이 생성되었습니다. 모든 씬의 클립을 먼저 생성해주세요.`
                    : "모든 씬 클립을 하나의 영상으로 병합합니다."
              }
            >
              {isMerging ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : hasFinalVideo ? (
                <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
              ) : (
                <Film className="w-4 h-4 mr-2" />
              )}
              {isMerging
                ? "병합 중..."
                : hasFinalVideo
                  ? "병합 완료!"
                  : `최종 영상 병합 (${scenesWithClips}/${scenes.length})`}
            </Button>
          )}

          <Button
            variant="outline"
            disabled={!hasFinalVideo}
            onClick={() => setShowPreview(true)}
            title={hasFinalVideo ? "최종 영상 미리보기" : "먼저 영상을 병합해주세요"}
          >
            <Play className="w-4 h-4 mr-2" />
            미리보기
          </Button>
          <Button disabled={isSaving} onClick={handleSave}>
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            저장
          </Button>
        </div>
      </header>

      {/* Merge error message */}
      {mergeError && (
        <div className="bg-destructive/10 text-destructive px-4 py-2 text-sm flex items-center justify-between">
          <span>{mergeError}</span>
          <button
            onClick={() => setMergeError(null)}
            className="text-destructive hover:text-destructive/80"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left panel - Scene list / Timeline / Settings */}
        <aside className="shrink-0 border-r flex flex-col" style={{ width: '320px', minWidth: '320px', maxWidth: '320px' }}>
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
        </aside>

        {/* Right panel - Scene detail */}
        <main className="flex-1 h-full overflow-hidden">
          {selectedScene ? (
            <SceneDetailPanel
              scene={selectedScene}
              storyboardId={storyboard.id}
              onUpdate={(updates) => handleSceneUpdate(selectedScene.id, updates)}
              onSceneRefresh={handleSceneRefresh}
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
        </main>
      </div>

      {/* AI Draft Dialog */}
      <GenerateAIDraftDialog
        open={showAIDraftDialog}
        onOpenChange={setShowAIDraftDialog}
        storyboard={storyboard}
        initialParams={draftParams}
        onComplete={handleAIDraftComplete}
      />

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>최종 영상 미리보기</span>
              <div className="flex items-center gap-2">
                {storyboard.final_video_url && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(storyboard.final_video_url!, "_blank")}
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      새 탭
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownload}
                      disabled={isDownloading}
                    >
                      {isDownloading ? (
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4 mr-1" />
                      )}
                      {isDownloading ? "다운로드 중..." : "다운로드"}
                    </Button>
                  </>
                )}
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {storyboard.final_video_url ? (
              <video
                src={storyboard.final_video_url}
                controls
                autoPlay
                className="w-full rounded-lg"
                style={{ maxHeight: "70vh" }}
              />
            ) : (
              <div className="flex items-center justify-center h-64 bg-muted rounded-lg">
                <p className="text-muted-foreground">영상이 없습니다.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
