import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VideoInfo } from "@/components/video/video-info";
import { ActionButtons } from "@/components/video/action-buttons";
import { fetchVideoDetail } from "@/actions/fetch-video-detail";
import { debugVideoData } from "@/actions/debug-video-data";
import { VideoPlayerWrapper } from "@/components/video/video-player-wrapper";

interface VideoPageProps {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Video detail page
 * Displays completed video with player, metadata, and action buttons
 */
export default async function VideoPage({ params }: VideoPageProps) {
  const { id } = await params;

  // Fetch video detail
  const result = await fetchVideoDetail(id);

  // Handle errors
  if (!result.success || !result.video) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">영상을 찾을 수 없습니다</h1>
          <p className="text-muted-foreground">
            {result.error || "요청하신 영상을 불러올 수 없습니다."}
          </p>
          <Button asChild>
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              대시보드로 돌아가기
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const video = result.video;

  // Debug: Log video data to console
  await debugVideoData(id);

  // Redirect to generation page if video not completed
  if (video.status !== "completed") {
    redirect(`/generation/${id}`);
  }

  // Check if video URL is available or if it's an expression
  const isExpression = video.video_url?.includes("{{") || false;

  if (!video.video_url || isExpression) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-destructive">
              🚨 영상을 재생할 수 없습니다
            </h1>
            <p className="text-muted-foreground">
              {isExpression
                ? "n8n 워크플로우 설정 오류가 발생했습니다."
                : "영상 파일이 생성되지 않았습니다."}
            </p>
          </div>

          {isExpression && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-left space-y-4">
              <h2 className="font-semibold text-lg">⚠️ 문제 원인:</h2>
              <p className="text-sm">
                video_url이 n8n 표현식 문자열로 저장되었습니다:
              </p>
              <code className="block bg-black/10 p-3 rounded text-xs break-all">
                {video.video_url}
              </code>

              <div className="space-y-2 text-sm">
                <h3 className="font-semibold">🔧 해결 방법:</h3>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>n8n 워크플로우를 엽니다</li>
                  <li>&quot;최종 업데이트: Completed&quot; 노드를 클릭합니다</li>
                  <li>
                    <code className="bg-black/10 px-2 py-0.5 rounded">
                      video_url
                    </code>{" "}
                    필드의 Expression 토글을 <strong>ON</strong>으로 변경합니다
                  </li>
                  <li>
                    <code className="bg-black/10 px-2 py-0.5 rounded">
                      thumbnail_url
                    </code>{" "}
                    필드의 Expression 토글도 <strong>ON</strong>으로 변경합니다
                  </li>
                  <li>워크플로우를 저장합니다</li>
                  <li>새로운 영상을 생성합니다</li>
                </ol>
              </div>

              <div className="pt-2">
                <a
                  href="/docs/URGENT_FIX_GUIDE.md"
                  target="_blank"
                  className="text-sm text-primary hover:underline"
                >
                  📚 자세한 수정 가이드 보기 →
                </a>
              </div>
            </div>
          )}

          <Button asChild>
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              대시보드로 돌아가기
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Back button */}
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard">
            <ArrowLeft className="w-4 h-4 mr-2" />
            대시보드로 돌아가기
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Video player */}
        <div className="lg:col-span-2 space-y-6">
          <VideoPlayerWrapper
            videoUrl={video.video_url}
            thumbnailUrl={video.thumbnail_url}
          />

          {/* Action buttons on smaller screens */}
          <div className="lg:hidden">
            <ActionButtons videoId={id} />
          </div>
        </div>

        {/* Right column: Video info and actions */}
        <div className="space-y-6">
          <VideoInfo video={video} />

          {/* Action buttons on larger screens */}
          <div className="hidden lg:block">
            <ActionButtons videoId={id} />
          </div>
        </div>
      </div>
    </div>
  );
}
