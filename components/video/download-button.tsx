"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { downloadVideo } from "@/actions/download-video";

interface DownloadButtonProps {
  videoId: string;
}

/**
 * Trigger video download
 * Generates signed URL and triggers browser download
 */
export function DownloadButton({ videoId }: DownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);

      // Get signed download URL from server action
      const result = await downloadVideo(videoId);

      if (!result.success || !result.downloadUrl || !result.filename) {
        toast.error(result.error || "다운로드에 실패했습니다");
        return;
      }

      // Trigger download using anchor element
      const link = document.createElement("a");
      link.href = result.downloadUrl;
      link.download = result.filename;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();

      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
      }, 100);

      toast.success("영상 다운로드를 시작합니다");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("다운로드 중 오류가 발생했습니다");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button
      onClick={handleDownload}
      disabled={isDownloading}
      size="lg"
      className="flex-1"
    >
      {isDownloading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          다운로드 준비중...
        </>
      ) : (
        <>
          <Download className="w-4 h-4 mr-2" />
          영상 다운로드
        </>
      )}
    </Button>
  );
}
