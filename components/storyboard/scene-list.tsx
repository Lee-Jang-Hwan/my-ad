"use client";

import { useCallback } from "react";
import Image from "next/image";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Copy, Trash2, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { StoryboardScene } from "@/types/storyboard";

interface SceneListProps {
  scenes: StoryboardScene[];
  selectedSceneId: string | null;
  onSceneSelect: (sceneId: string) => void;
  onSceneDelete: (sceneId: string) => void;
  onSceneDuplicate: (sceneId: string) => void;
  onReorder: (scenes: StoryboardScene[]) => void;
}

interface SortableSceneItemProps {
  scene: StoryboardScene;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

function SortableSceneItem({
  scene,
  isSelected,
  onSelect,
  onDelete,
  onDuplicate,
}: SortableSceneItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: scene.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isGenerating =
    scene.generation_status === "generating_image" ||
    scene.generation_status === "generating_clip";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-start gap-2 p-2 rounded-lg border cursor-pointer transition-colors",
        isSelected
          ? "border-primary bg-primary/5"
          : "border-transparent hover:bg-muted/50",
        isDragging && "opacity-50"
      )}
      onClick={onSelect}
    >
      {/* Drag handle */}
      <button
        className="mt-1 cursor-grab active:cursor-grabbing touch-none"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </button>

      {/* Thumbnail */}
      <div className="w-16 h-10 rounded bg-muted flex-shrink-0 relative overflow-hidden">
        {scene.generated_image_url ? (
          <Image
            src={`${scene.generated_image_url}?t=${new Date(scene.updated_at).getTime()}`}
            alt={scene.scene_name || `씬 ${scene.scene_order}`}
            fill
            className="object-cover"
            sizes="64px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            ) : (
              <ImageIcon className="w-4 h-4 text-muted-foreground/50" />
            )}
          </div>
        )}
      </div>

      {/* Scene info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <span className="text-xs font-medium truncate">
            {scene.scene_name || `씬 ${scene.scene_order}`}
          </span>
          <span className="text-xs text-muted-foreground flex-shrink-0">
            {scene.duration_seconds}s
          </span>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
          {scene.scene_description}
        </p>
      </div>

      {/* Actions */}
      <div
        className={cn(
          "flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity",
          isSelected && "opacity-100"
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate();
          }}
        >
          <Copy className="w-3 h-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-destructive hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}

export function SceneList({
  scenes,
  selectedSceneId,
  onSceneSelect,
  onSceneDelete,
  onSceneDuplicate,
  onReorder,
}: SceneListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        const oldIndex = scenes.findIndex((s) => s.id === active.id);
        const newIndex = scenes.findIndex((s) => s.id === over.id);

        const reordered = arrayMove(scenes, oldIndex, newIndex).map(
          (scene, index) => ({
            ...scene,
            scene_order: index + 1,
          })
        );

        onReorder(reordered);
      }
    },
    [scenes, onReorder]
  );

  if (scenes.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 text-sm text-muted-foreground text-center">
        씬이 없습니다.
        <br />
        위의 버튼으로 씬을 추가하세요.
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-2">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={scenes.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-1">
            {scenes.map((scene) => (
              <SortableSceneItem
                key={scene.id}
                scene={scene}
                isSelected={scene.id === selectedSceneId}
                onSelect={() => onSceneSelect(scene.id)}
                onDelete={() => onSceneDelete(scene.id)}
                onDuplicate={() => onSceneDuplicate(scene.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
