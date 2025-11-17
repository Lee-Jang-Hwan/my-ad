import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Upload form loading skeleton component
 * Displayed while the upload form is being loaded
 */
export function UploadFormSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header Skeleton */}
      <div className="mb-8 space-y-2">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-6 w-96" />
      </div>

      <div className="space-y-6">
        {/* Image Upload Section Skeleton */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-5 w-64" />
            </div>
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
        </Card>

        {/* Product Info Section Skeleton */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-7 w-32" />
              <Skeleton className="h-5 w-48" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </Card>

        {/* Submit Button Skeleton */}
        <div className="flex justify-center">
          <Skeleton className="h-11 w-[200px]" />
        </div>
      </div>
    </div>
  );
}
