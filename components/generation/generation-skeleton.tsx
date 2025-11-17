import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Generation progress page loading skeleton
 * Displayed while initial video data is being fetched
 */
export function GenerationSkeleton() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      {/* Header Skeleton */}
      <div className="text-center mb-12 space-y-2">
        <Skeleton className="h-8 w-64 mx-auto" />
        <Skeleton className="h-5 w-96 mx-auto" />
      </div>

      {/* Step Indicator Skeleton */}
      <Card className="p-8 mb-8">
        <div className="space-y-6">
          {/* Steps */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Progress Info Skeleton */}
      <div className="text-center space-y-4">
        <Skeleton className="h-6 w-48 mx-auto" />
        <Skeleton className="h-10 w-32 mx-auto" />
      </div>
    </div>
  );
}
