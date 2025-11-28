export const dynamic = "force-dynamic";

import { getAnalytics } from "@/actions/admin/get-analytics";
import { AnalyticsClient } from "./analytics-client";

export default async function AdminAnalyticsPage() {
  const result = await getAnalytics();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">매출 분석</h1>
        <p className="text-muted-foreground">
          비용, 매출, 수익 현황을 분석합니다.
        </p>
      </div>

      {result.success && result.data ? (
        <AnalyticsClient data={result.data} />
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          {result.error || "데이터를 불러올 수 없습니다."}
        </div>
      )}
    </div>
  );
}
