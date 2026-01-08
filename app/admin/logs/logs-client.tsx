"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Video,
  Image as ImageIcon,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  FileText,
  AlertTriangle,
  Activity,
} from "lucide-react";
import {
  getGenerationLogs,
  getContentTimeline,
  type GenerationLog,
  type LogStats,
  type TimelineLog,
} from "@/actions/admin/get-generation-logs";
import { STAGE_LABELS } from "@/lib/log-generation";

interface LogsClientProps {
  initialLogs: GenerationLog[];
  totalCount: number;
  totalPages: number;
  stats?: LogStats;
}

export function LogsClient({
  initialLogs,
  totalCount,
  totalPages: initialTotalPages,
  stats,
}: LogsClientProps) {
  const router = useRouter();
  const [logs, setLogs] = useState(initialLogs);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [total, setTotal] = useState(totalCount);

  // Filters
  const [contentType, setContentType] = useState<"all" | "video" | "image">("all");
  const [status, setStatus] = useState<"all" | "started" | "completed" | "failed">("all");
  const [searchUserId, setSearchUserId] = useState("");

  // Timeline dialog
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [timeline, setTimeline] = useState<TimelineLog[]>([]);
  const [timelineContentType, setTimelineContentType] = useState<"video" | "image" | undefined>();
  const [timelineLoading, setTimelineLoading] = useState(false);

  const fetchLogs = useCallback(async (newPage: number = 1) => {
    setLoading(true);
    try {
      const result = await getGenerationLogs({
        page: newPage,
        limit: 50,
        contentType: contentType === "all" ? undefined : contentType,
        status: status === "all" ? undefined : status,
        userId: searchUserId || undefined,
      });

      if (result.success) {
        setLogs(result.logs);
        setTotal(result.total);
        setTotalPages(result.totalPages);
        setPage(newPage);
      }
    } finally {
      setLoading(false);
    }
  }, [contentType, status, searchUserId]);

  const handleFilter = () => {
    fetchLogs(1);
  };

  const handleRefresh = () => {
    fetchLogs(page);
    router.refresh();
  };

  const handleViewTimeline = async (contentId: string) => {
    setTimelineLoading(true);
    setTimelineOpen(true);

    const result = await getContentTimeline(contentId);
    if (result.success) {
      setTimeline(result.timeline);
      setTimelineContentType(result.contentType);
    }
    setTimelineLoading(false);
  };

  const getStatusBadge = (logStatus: string) => {
    switch (logStatus) {
      case "started":
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            시작
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="default" className="gap-1 bg-green-600">
            <CheckCircle className="h-3 w-3" />
            완료
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            실패
          </Badge>
        );
      default:
        return <Badge variant="outline">{logStatus}</Badge>;
    }
  };

  const getContentTypeBadge = (type: string) => {
    if (type === "video") {
      return (
        <Badge variant="outline" className="gap-1">
          <Video className="h-3 w-3" />
          영상
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="gap-1">
        <ImageIcon className="h-3 w-3" />
        이미지
      </Badge>
    );
  };

  const getSourceBadge = (source: string) => {
    switch (source) {
      case "app":
        return <Badge variant="secondary">앱</Badge>;
      case "n8n":
        return <Badge variant="secondary" className="bg-purple-100 text-purple-800">n8n</Badge>;
      case "supabase":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Supabase</Badge>;
      default:
        return <Badge variant="outline">{source}</Badge>;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("ko-KR", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return `${diffSec}초 전`;
    if (diffMin < 60) return `${diffMin}분 전`;
    if (diffHour < 24) return `${diffHour}시간 전`;
    return `${diffDay}일 전`;
  };

  return (
    <>
      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>전체 로그</CardDescription>
              <CardTitle className="text-2xl">{stats.totalLogs.toLocaleString()}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>영상 생성</CardDescription>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Video className="h-5 w-5 text-blue-500" />
                {stats.videoLogs.toLocaleString()}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>이미지 생성</CardDescription>
              <CardTitle className="text-2xl flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-green-500" />
                {stats.imageLogs.toLocaleString()}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>실패 로그</CardDescription>
              <CardTitle className="text-2xl flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                {stats.failedLogs.toLocaleString()}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>오늘 로그</CardDescription>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Activity className="h-5 w-5 text-purple-500" />
                {stats.todayLogs.toLocaleString()}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">필터</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Select value={contentType} onValueChange={(v) => setContentType(v as typeof contentType)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="콘텐츠 타입" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="video">영상</SelectItem>
                <SelectItem value="image">이미지</SelectItem>
              </SelectContent>
            </Select>

            <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="상태" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="started">시작</SelectItem>
                <SelectItem value="completed">완료</SelectItem>
                <SelectItem value="failed">실패</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Input
                placeholder="사용자 ID 검색"
                value={searchUserId}
                onChange={(e) => setSearchUserId(e.target.value)}
                className="w-48"
              />
              <Button variant="outline" onClick={handleFilter}>
                <Search className="h-4 w-4" />
              </Button>
            </div>

            <Button variant="outline" onClick={handleRefresh} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>로그 목록</CardTitle>
          <CardDescription>총 {total.toLocaleString()}개의 로그</CardDescription>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              로그가 없습니다.
            </div>
          ) : (
            <>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-36">시간</TableHead>
                      <TableHead>사용자</TableHead>
                      <TableHead>타입</TableHead>
                      <TableHead>단계</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>출처</TableHead>
                      <TableHead>메시지</TableHead>
                      <TableHead className="text-right">상세</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-sm">
                          <div className="font-medium">{formatRelativeTime(log.created_at)}</div>
                          <div className="text-xs text-muted-foreground">{formatTime(log.created_at)}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-sm">{log.user?.name || "알 수 없음"}</div>
                          <div className="text-xs text-muted-foreground truncate max-w-24" title={log.user_id}>
                            {log.user_id.slice(0, 12)}...
                          </div>
                        </TableCell>
                        <TableCell>{getContentTypeBadge(log.content_type)}</TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {STAGE_LABELS[log.stage] || log.stage}
                          </span>
                        </TableCell>
                        <TableCell>{getStatusBadge(log.status)}</TableCell>
                        <TableCell>{getSourceBadge(log.source)}</TableCell>
                        <TableCell className="max-w-48">
                          {log.status === "failed" && log.error_message ? (
                            <span className="text-sm text-red-600 truncate block" title={log.error_message}>
                              {log.error_message}
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground truncate block" title={log.message || ""}>
                              {log.message || "-"}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewTimeline(log.content_id)}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchLogs(page - 1)}
                    disabled={page === 1 || loading}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {page} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchLogs(page + 1)}
                    disabled={page === totalPages || loading}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Timeline Dialog */}
      <Dialog open={timelineOpen} onOpenChange={setTimelineOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {timelineContentType && getContentTypeBadge(timelineContentType)}
              생성 타임라인
            </DialogTitle>
            <DialogDescription>
              콘텐츠 생성 과정의 전체 타임라인입니다.
            </DialogDescription>
          </DialogHeader>

          {timelineLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : timeline.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              타임라인 데이터가 없습니다.
            </div>
          ) : (
            <div className="space-y-4">
              {timeline.map((item, index) => (
                <div
                  key={item.id}
                  className={`relative pl-8 pb-4 ${
                    index < timeline.length - 1 ? "border-l-2 border-muted ml-3" : "ml-3"
                  }`}
                >
                  <div
                    className={`absolute left-0 -translate-x-1/2 w-6 h-6 rounded-full flex items-center justify-center ${
                      item.status === "completed"
                        ? "bg-green-100 text-green-600"
                        : item.status === "failed"
                        ? "bg-red-100 text-red-600"
                        : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    {item.status === "completed" ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : item.status === "failed" ? (
                      <XCircle className="h-4 w-4" />
                    ) : (
                      <Clock className="h-4 w-4" />
                    )}
                  </div>

                  <div className="bg-muted/30 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.stageLabel}</span>
                        {getStatusBadge(item.status)}
                        {getSourceBadge(item.source)}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(item.created_at)}
                      </span>
                    </div>

                    {item.message && (
                      <p className="text-sm text-muted-foreground">{item.message}</p>
                    )}

                    {item.status === "failed" && item.error_message && (
                      <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-700">
                        <div className="font-medium">오류: {item.error_code}</div>
                        <div>{item.error_message}</div>
                      </div>
                    )}

                    {item.metadata && Object.keys(item.metadata).length > 0 && (
                      <details className="mt-2">
                        <summary className="text-xs text-muted-foreground cursor-pointer">
                          메타데이터 보기
                        </summary>
                        <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-x-auto">
                          {JSON.stringify(item.metadata, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
