export const dynamic = "force-dynamic";

import { getGenerationLogs, getLogStats } from "@/actions/admin/get-generation-logs";
import { LogsClient } from "./logs-client";

export default async function AdminLogsPage() {
  const [logsResult, statsResult] = await Promise.all([
    getGenerationLogs({ page: 1, limit: 50 }),
    getLogStats(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">생성 로그</h1>
        <p className="text-muted-foreground">
          이미지 및 영상 생성 과정을 실시간으로 모니터링합니다.
        </p>
      </div>

      <LogsClient
        initialLogs={logsResult.logs}
        totalCount={logsResult.total}
        totalPages={logsResult.totalPages}
        stats={statsResult.stats}
      />
    </div>
  );
}
