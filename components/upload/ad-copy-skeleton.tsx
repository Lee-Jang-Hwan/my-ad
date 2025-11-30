"use client";

import { Skeleton } from "@/components/ui/skeleton";

/**
 * 광고문구 로딩 스켈레톤 컴포넌트
 * - 광고문구 생성 중 표시되는 로딩 UI
 */
export function AdCopySkeleton() {
  return (
    <div className="space-y-6">
      {/* 헤더 스켈레톤 */}
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* 카드 그리드 스켈레톤 */}
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <AdCopyCardSkeleton key={index} index={index + 1} />
        ))}
      </div>

      {/* 버튼 영역 스켈레톤 */}
      <div className="flex gap-3 justify-end">
        <Skeleton className="h-10 w-28" />
        <Skeleton className="h-10 w-36" />
      </div>
    </div>
  );
}

/**
 * 개별 광고문구 카드 스켈레톤
 */
function AdCopyCardSkeleton({ index }: { index: number }) {
  return (
    <div className="relative p-4 rounded-lg border-2 border-border bg-card">
      {/* 카드 번호 뱃지 */}
      <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
        {index}
      </div>

      {/* 카드 내용 */}
      <div className="flex items-start gap-3">
        {/* 아이콘 스켈레톤 */}
        <Skeleton className="shrink-0 w-8 h-8 rounded-md" />

        {/* 텍스트 스켈레톤 */}
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-3/5" />
          <Skeleton className="h-3 w-12 mt-2" />
        </div>
      </div>

      {/* 하단 힌트 스켈레톤 */}
      <div className="mt-3 pt-3 border-t border-border">
        <Skeleton className="h-3 w-20 mx-auto" />
      </div>
    </div>
  );
}

/**
 * 광고문구 생성 중 애니메이션 로딩 컴포넌트
 */
export function AdCopyGeneratingLoader() {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      {/* 로딩 애니메이션 */}
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
        <div className="absolute inset-0 border-4 border-transparent border-t-primary rounded-full animate-spin" />
      </div>

      {/* 로딩 텍스트 */}
      <div className="text-center space-y-1">
        <p className="text-lg font-medium text-foreground">
          광고문구를 생성하고 있어요
        </p>
        <p className="text-sm text-muted-foreground">
          AI가 B급 키치 마케팅 스타일의 문구 5개를 만들고 있습니다...
        </p>
      </div>

      {/* 진행 바 */}
      <div className="w-64 h-1.5 bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-primary rounded-full animate-pulse w-2/3" />
      </div>
    </div>
  );
}
