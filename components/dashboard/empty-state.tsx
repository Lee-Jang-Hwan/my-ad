import Link from "next/link";
import { FileVideo, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface EmptyStateProps {
  filterApplied?: boolean;
  statusFilter?: string;
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}

/**
 * Empty state component for dashboard
 * Shows different messages based on whether a filter is applied
 */
export function EmptyState({
  filterApplied = false,
  statusFilter,
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  if (filterApplied) {
    // User has filtered but no results
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16 px-4">
          <div className="rounded-full bg-muted p-4 mb-4">
            <FileVideo className="w-12 h-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">
            {statusFilter && statusFilter !== "all"
              ? `${getStatusLabel(statusFilter)} 영상이 없습니다`
              : "영상이 없습니다"}
          </h3>
          <p className="text-sm text-muted-foreground text-center mb-6">
            선택한 필터에 해당하는 영상이 없습니다.
            <br />
            다른 필터를 선택하거나 새 영상을 만들어보세요.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Default or custom empty state
  const displayTitle = title || "첫 홍보영상을 만들어보세요";
  const displayDescription = description || "이미지와 상품명만 있으면 AI가 자동으로 전문적인 홍보영상을 만들어드립니다.";
  const displayActionLabel = actionLabel || "영상 만들기";
  const displayActionHref = actionHref || "/upload";

  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-16 px-4">
        <div className="rounded-full bg-primary/10 p-4 mb-4">
          <Upload className="w-12 h-12 text-primary" />
        </div>
        <h3 className="text-xl font-semibold mb-2">{displayTitle}</h3>
        <p className="text-sm text-muted-foreground text-center mb-6 max-w-md">
          {displayDescription}
        </p>
        <Button asChild size="lg">
          <Link href={displayActionHref}>
            <Upload className="w-4 h-4 mr-2" />
            {displayActionLabel}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

/**
 * Get Korean label for status
 */
function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: "대기중",
    processing: "생성중",
    completed: "완료",
    failed: "실패",
  };
  return labels[status] || status;
}
