"use client";

import { useMemo } from "react";
import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StoryboardScene } from "@/types/storyboard";

interface TimelineViewProps {
  scenes: StoryboardScene[];
  selectedSceneId: string | null;
  onSceneSelect: (sceneId: string) => void;
  totalDuration: number;
}

export function TimelineView({
  scenes,
  selectedSceneId,
  onSceneSelect,
  totalDuration,
}: TimelineViewProps) {
  // Calculate time markers
  const timeMarkers = useMemo(() => {
    const markers = [];
    const step = totalDuration <= 30 ? 5 : totalDuration <= 60 ? 10 : 15;
    for (let i = 0; i <= totalDuration; i += step) {
      markers.push(i);
    }
    return markers;
  }, [totalDuration]);

  // Calculate scene positions
  const scenePositions = useMemo(() => {
    let currentTime = 0;
    return scenes.map((scene) => {
      const start = currentTime;
      const end = currentTime + scene.duration_seconds;
      currentTime = end;
      return { scene, start, end };
    });
  }, [scenes]);

  if (scenes.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 text-sm text-muted-foreground text-center">
        타임라인에 표시할 씬이 없습니다.
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-4">
      {/* Time markers */}
      <div className="relative mb-2 h-6">
        {timeMarkers.map((time) => (
          <div
            key={time}
            className="absolute top-0 text-xs text-muted-foreground"
            style={{
              left: `${(time / totalDuration) * 100}%`,
              transform: "translateX(-50%)",
            }}
          >
            {time}s
          </div>
        ))}
      </div>

      {/* Timeline track */}
      <div className="relative h-20 bg-muted rounded-lg overflow-hidden">
        {/* Grid lines */}
        {timeMarkers.map((time) => (
          <div
            key={time}
            className="absolute top-0 bottom-0 w-px bg-border"
            style={{ left: `${(time / totalDuration) * 100}%` }}
          />
        ))}

        {/* Scene blocks */}
        {scenePositions.map(({ scene, start, end }) => {
          const widthPercent = ((end - start) / totalDuration) * 100;
          const leftPercent = (start / totalDuration) * 100;
          const isSelected = scene.id === selectedSceneId;

          return (
            <div
              key={scene.id}
              className={cn(
                "absolute top-1 bottom-1 rounded cursor-pointer transition-all overflow-hidden",
                isSelected
                  ? "ring-2 ring-primary ring-offset-1"
                  : "hover:ring-2 hover:ring-muted-foreground/50"
              )}
              style={{
                left: `${leftPercent}%`,
                width: `calc(${widthPercent}% - 2px)`,
              }}
              onClick={() => onSceneSelect(scene.id)}
            >
              {/* Thumbnail or placeholder */}
              {scene.generated_image_url ? (
                <Image
                  src={scene.generated_image_url}
                  alt={scene.scene_name || `씬 ${scene.scene_order}`}
                  fill
                  className="object-cover"
                  sizes="200px"
                />
              ) : (
                <div className="w-full h-full bg-muted-foreground/20 flex items-center justify-center">
                  <ImageIcon className="w-4 h-4 text-muted-foreground/50" />
                </div>
              )}

              {/* Scene number overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-1 py-0.5">
                <span className="text-[10px] text-white font-medium">
                  {scene.scene_order}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Duration info */}
      <div className="mt-4 text-sm text-muted-foreground">
        <p>
          총 길이: <span className="font-medium text-foreground">{totalDuration}초</span>
        </p>
        <p>
          씬 개수: <span className="font-medium text-foreground">{scenes.length}개</span>
        </p>
      </div>
    </div>
  );
}
