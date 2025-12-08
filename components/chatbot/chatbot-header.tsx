"use client";

import { Bot, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChatbot } from "./chatbot-provider";

export function ChatbotHeader() {
  const { close, reset } = useChatbot();

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b bg-primary text-primary-foreground rounded-t-lg">
      <div className="flex items-center gap-2">
        <Bot className="h-5 w-5" />
        <span className="font-semibold">삽가능 도우미</span>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={reset}
          className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
          aria-label="대화 초기화"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={close}
          className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
          aria-label="닫기"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
