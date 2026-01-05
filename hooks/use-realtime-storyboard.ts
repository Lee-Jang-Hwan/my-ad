"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useClerkSupabaseClient } from "@/lib/supabase/clerk-client";
import type {
  Storyboard,
  StoryboardScene,
  StoryboardProgressStage,
} from "@/types/storyboard";

interface RealtimeStoryboardState {
  storyboard: Storyboard;
  scenes: StoryboardScene[];
  isLoading: boolean;
  error: string | null;
  isCompleted: boolean;
  isFailed: boolean;
  currentStage: StoryboardProgressStage;
  progressPercent: number;
}

interface UseRealtimeStoryboardOptions {
  initialStoryboard: Storyboard;
  initialScenes: StoryboardScene[];
  onComplete?: (storyboard: Storyboard) => void;
  onError?: (storyboard: Storyboard) => void;
  onSceneUpdate?: (scene: StoryboardScene) => void;
}

// Progress calculation based on stage
function calculateProgress(stage: StoryboardProgressStage): number {
  const stageProgress: Record<StoryboardProgressStage, number> = {
    init: 5,
    ai_draft_generation: 15,
    user_editing: 25,
    scene_image_generation: 50,
    scene_clip_generation: 75,
    final_merge: 90,
    completed: 100,
    failed: 0,
  };
  return stageProgress[stage] || 0;
}

// Timeout: 15 minutes (video generation can take long)
const GENERATION_TIMEOUT_MS = 15 * 60 * 1000;

// Polling interval: 10 seconds
const POLLING_INTERVAL_MS = 10000;

/**
 * Hook to subscribe to real-time updates for storyboard and scenes
 * Uses Supabase Realtime to listen for database changes
 */
export function useRealtimeStoryboard({
  initialStoryboard,
  initialScenes,
  onComplete,
  onError,
  onSceneUpdate,
}: UseRealtimeStoryboardOptions): RealtimeStoryboardState {
  const supabase = useClerkSupabaseClient();
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<Date>(new Date());
  const isCleanedUpRef = useRef<boolean>(false);
  const storyboardChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const scenesChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const [state, setState] = useState<RealtimeStoryboardState>({
    storyboard: initialStoryboard,
    scenes: initialScenes,
    isLoading: false,
    error: null,
    isCompleted: initialStoryboard.status === "completed",
    isFailed: initialStoryboard.status === "failed",
    currentStage: initialStoryboard.progress_stage,
    progressPercent: calculateProgress(initialStoryboard.progress_stage),
  });

  // Polling function
  const pollData = useCallback(async () => {
    if (isCleanedUpRef.current) return;

    try {
      // Fetch storyboard
      const { data: storyboardData, error: storyboardError } = await supabase
        .from("storyboards")
        .select("*")
        .eq("id", initialStoryboard.id)
        .single();

      if (storyboardError || !storyboardData) {
        console.error("Polling storyboard error:", storyboardError);
        return;
      }

      // Fetch scenes
      const { data: scenesData, error: scenesError } = await supabase
        .from("storyboard_scenes")
        .select("*")
        .eq("storyboard_id", initialStoryboard.id)
        .order("scene_order", { ascending: true });

      if (scenesError) {
        console.error("Polling scenes error:", scenesError);
        return;
      }

      const updatedStoryboard = storyboardData as Storyboard;
      const updatedScenes = (scenesData || []) as StoryboardScene[];

      setState((prev) => {
        const hasChanged =
          updatedStoryboard.status !== prev.storyboard.status ||
          updatedStoryboard.progress_stage !== prev.storyboard.progress_stage ||
          updatedScenes.length !== prev.scenes.length;

        if (!hasChanged) return prev;

        lastUpdateRef.current = new Date();

        const isCompleted = updatedStoryboard.status === "completed";
        const isFailed = updatedStoryboard.status === "failed";

        if (!prev.isCompleted && isCompleted && onComplete) {
          onComplete(updatedStoryboard);
        }

        if (!prev.isFailed && isFailed && onError) {
          onError(updatedStoryboard);
        }

        return {
          storyboard: updatedStoryboard,
          scenes: updatedScenes,
          isLoading: false,
          error: isFailed ? updatedStoryboard.error_message : null,
          isCompleted,
          isFailed,
          currentStage: updatedStoryboard.progress_stage,
          progressPercent: calculateProgress(updatedStoryboard.progress_stage),
        };
      });
    } catch (err) {
      console.error("Polling error:", err);
    }
  }, [supabase, initialStoryboard.id, onComplete, onError]);

  // Timeout check
  const checkTimeout = useCallback(() => {
    const now = new Date();
    const timeSinceLastUpdate = now.getTime() - lastUpdateRef.current.getTime();

    setState((prev) => {
      if (
        timeSinceLastUpdate > GENERATION_TIMEOUT_MS &&
        !prev.isCompleted &&
        !prev.isFailed
      ) {
        console.error("Storyboard generation timeout");
        if (onError) {
          onError({
            ...prev.storyboard,
            status: "failed",
            error_message: "생성 시간 초과",
          });
        }
        return { ...prev, isFailed: true, error: "생성 시간이 초과되었습니다." };
      }
      return prev;
    });
  }, [onError]);

  useEffect(() => {
    isCleanedUpRef.current = false;

    // Setup storyboard channel
    const storyboardChannel = supabase
      .channel(`storyboard:${initialStoryboard.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "storyboards",
          filter: `id=eq.${initialStoryboard.id}`,
        },
        (payload) => {
          if (isCleanedUpRef.current) return;

          const updatedStoryboard = payload.new as Storyboard;
          lastUpdateRef.current = new Date();

          setState((prev) => {
            const isCompleted = updatedStoryboard.status === "completed";
            const isFailed = updatedStoryboard.status === "failed";

            if (!prev.isCompleted && isCompleted && onComplete) {
              onComplete(updatedStoryboard);
            }

            if (!prev.isFailed && isFailed && onError) {
              onError(updatedStoryboard);
            }

            return {
              ...prev,
              storyboard: updatedStoryboard,
              error: isFailed ? updatedStoryboard.error_message : null,
              isCompleted,
              isFailed,
              currentStage: updatedStoryboard.progress_stage,
              progressPercent: calculateProgress(updatedStoryboard.progress_stage),
            };
          });
        }
      )
      .subscribe();

    storyboardChannelRef.current = storyboardChannel;

    // Setup scenes channel
    const scenesChannel = supabase
      .channel(`storyboard_scenes:${initialStoryboard.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "storyboard_scenes",
          filter: `storyboard_id=eq.${initialStoryboard.id}`,
        },
        (payload) => {
          if (isCleanedUpRef.current) return;

          lastUpdateRef.current = new Date();

          if (payload.eventType === "INSERT") {
            const newScene = payload.new as StoryboardScene;
            setState((prev) => ({
              ...prev,
              scenes: [...prev.scenes, newScene].sort(
                (a, b) => a.scene_order - b.scene_order
              ),
            }));
            if (onSceneUpdate) onSceneUpdate(newScene);
          } else if (payload.eventType === "UPDATE") {
            const updatedScene = payload.new as StoryboardScene;
            setState((prev) => ({
              ...prev,
              scenes: prev.scenes.map((s) =>
                s.id === updatedScene.id ? updatedScene : s
              ),
            }));
            if (onSceneUpdate) onSceneUpdate(updatedScene);
          } else if (payload.eventType === "DELETE") {
            const deletedScene = payload.old as { id: string };
            setState((prev) => ({
              ...prev,
              scenes: prev.scenes.filter((s) => s.id !== deletedScene.id),
            }));
          }
        }
      )
      .subscribe();

    scenesChannelRef.current = scenesChannel;

    // Start polling
    pollData();
    pollingRef.current = setInterval(pollData, POLLING_INTERVAL_MS);

    // Timeout check
    timeoutRef.current = setInterval(checkTimeout, 30000);

    // Cleanup
    return () => {
      isCleanedUpRef.current = true;

      if (pollingRef.current) clearInterval(pollingRef.current);
      if (timeoutRef.current) clearInterval(timeoutRef.current);
      if (storyboardChannelRef.current) supabase.removeChannel(storyboardChannelRef.current);
      if (scenesChannelRef.current) supabase.removeChannel(scenesChannelRef.current);
    };
  }, [
    initialStoryboard.id,
    supabase,
    onComplete,
    onError,
    onSceneUpdate,
    pollData,
    checkTimeout,
  ]);

  return state;
}
