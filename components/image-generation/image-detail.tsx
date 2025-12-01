"use client";

import Image from "next/image";
import Link from "next/link";
import { Download, ArrowLeft, ImagePlus, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AdImage } from "@/types/ad-image";
import { toast } from "sonner";

interface ImageDetailProps {
  image: AdImage;
}

/**
 * Image detail component
 * Shows the generated ad image with download and share options
 */
export function ImageDetail({ image }: ImageDetailProps) {
  const handleDownload = async () => {
    if (!image.image_url) return;

    try {
      const response = await fetch(image.image_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ad-image-${image.id}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("이미지가 다운로드되었습니다.");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("다운로드에 실패했습니다.");
    }
  };

  const handleShare = async () => {
    if (!image.image_url) return;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "광고 이미지",
          text: image.selected_ad_copy || "AI로 생성된 광고 이미지",
          url: window.location.href,
        });
      } else {
        // Fallback: copy URL to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast.success("링크가 클립보드에 복사되었습니다.");
      }
    } catch (error) {
      console.error("Share error:", error);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <ImagePlus className="w-6 h-6" />
              광고 이미지
            </h1>
            <p className="text-sm text-muted-foreground">
              {new Date(image.created_at).toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-2" />
            공유
          </Button>
          <Button onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            다운로드
          </Button>
        </div>
      </div>

      {/* Image Preview */}
      <Card>
        <CardContent className="p-4">
          <div className="relative aspect-square w-full max-w-xl mx-auto rounded-lg overflow-hidden bg-muted">
            {image.image_url && (
              <Image
                src={image.image_url}
                alt="Generated ad image"
                fill
                className="object-contain"
                priority
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Ad Copy */}
      {image.selected_ad_copy && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">광고 문구</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              &quot;{image.selected_ad_copy}&quot;
            </p>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-center gap-4">
            <Button variant="outline" asChild>
              <Link href="/image">
                <ImagePlus className="w-4 h-4 mr-2" />
                새 이미지 만들기
              </Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/dashboard">대시보드로 이동</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
