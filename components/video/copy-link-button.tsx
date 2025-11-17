"use client";

import { useState } from "react";
import { Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface CopyLinkButtonProps {
  videoId: string;
}

/**
 * Copy video URL to clipboard
 * Shows success feedback via toast and icon change
 */
export function CopyLinkButton({ videoId }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      const url = `${window.location.origin}/video/${videoId}`;

      // Try modern Clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = url;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
          document.execCommand("copy");
        } finally {
          document.body.removeChild(textArea);
        }
      }

      toast.success("링크가 복사되었습니다");
      setCopied(true);

      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Copy link error:", error);
      toast.error("링크 복사에 실패했습니다");
    }
  };

  return (
    <Button
      onClick={handleCopyLink}
      variant="outline"
      size="lg"
      className="flex-1"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 mr-2" />
          복사됨
        </>
      ) : (
        <>
          <Link2 className="w-4 h-4 mr-2" />
          링크 복사
        </>
      )}
    </Button>
  );
}
