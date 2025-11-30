"use client";

import type { AdCopyCardProps } from "@/types/ad-copy";
import { cn } from "@/lib/utils";
import { Check, FileText } from "lucide-react";

/**
 * 개별 광고문구 카드 컴포넌트
 * - 광고문구 표시 및 선택 기능
 * - 선택 상태에 따른 스타일 변화
 */
export function AdCopyCard({
  copy,
  isSelected,
  onSelect,
  disabled = false,
}: AdCopyCardProps) {
  const handleClick = () => {
    if (!disabled) {
      onSelect(copy.id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === "Enter" || e.key === " ") && !disabled) {
      e.preventDefault();
      onSelect(copy.id);
    }
  };

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-pressed={isSelected}
      aria-disabled={disabled}
      className={cn(
        "relative p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        {
          // Selected state
          "border-primary bg-primary/5 shadow-md": isSelected,
          // Default state
          "border-border bg-card hover:border-primary/50 hover:bg-accent/50":
            !isSelected && !disabled,
          // Disabled state
          "opacity-50 cursor-not-allowed": disabled,
        }
      )}
    >
      {/* 카드 번호 뱃지 */}
      <div
        className={cn(
          "absolute -top-2 -left-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
          {
            "bg-primary text-primary-foreground": isSelected,
            "bg-muted text-muted-foreground": !isSelected,
          }
        )}
      >
        {copy.copy_index}
      </div>

      {/* 선택됨 체크마크 */}
      {isSelected && (
        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
          <Check className="w-4 h-4" />
        </div>
      )}

      {/* 광고문구 아이콘 */}
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "shrink-0 w-8 h-8 rounded-md flex items-center justify-center",
            {
              "bg-primary/10 text-primary": isSelected,
              "bg-muted text-muted-foreground": !isSelected,
            }
          )}
        >
          <FileText className="w-4 h-4" />
        </div>

        {/* 광고문구 텍스트 */}
        <div className="flex-1 min-w-0">
          <p
            className={cn(
              "text-sm leading-relaxed break-keep whitespace-pre-wrap",
              {
                "text-foreground font-medium": isSelected,
                "text-muted-foreground": !isSelected,
              }
            )}
          >
            {copy.copy_text}
          </p>

          {/* 글자수 표시 */}
          <p className="mt-2 text-xs text-muted-foreground">
            {copy.copy_text.length}자
          </p>
        </div>
      </div>

      {/* 선택 힌트 */}
      <div
        className={cn(
          "mt-3 pt-3 border-t text-center text-xs transition-colors",
          {
            "border-primary/20 text-primary font-medium": isSelected,
            "border-border text-muted-foreground": !isSelected,
          }
        )}
      >
        {isSelected ? "선택됨" : "클릭하여 선택"}
      </div>
    </div>
  );
}
