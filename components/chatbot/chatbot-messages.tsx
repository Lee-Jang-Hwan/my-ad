"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Bot,
  User,
  Info,
  CreditCard,
  Video,
  Image,
  FolderOpen,
  AlertCircle,
  HelpCircle,
  Phone,
  ArrowLeft,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChatbot, type ChatMessage } from "./chatbot-provider";
import { cn } from "@/lib/utils";

// Icon mapping
const iconMap: Record<string, LucideIcon> = {
  Info,
  User,
  CreditCard,
  Video,
  Image,
  FolderOpen,
  AlertCircle,
  HelpCircle,
};

function MessageBubble({ message }: { message: ChatMessage }) {
  const isBot = message.type === "bot";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("flex gap-2 mb-3", isBot ? "justify-start" : "justify-end")}
    >
      {isBot && (
        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
          <Bot className="h-4 w-4 text-primary" />
        </div>
      )}
      <div
        className={cn(
          "max-w-[80%] px-3 py-2 rounded-lg text-sm",
          isBot
            ? "bg-muted text-muted-foreground rounded-tl-none"
            : "bg-primary text-primary-foreground rounded-tr-none"
        )}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
      {!isBot && (
        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="h-4 w-4 text-primary" />
        </div>
      )}
    </motion.div>
  );
}

function InlineOptions() {
  const {
    state,
    categories,
    selectCategory,
    selectQuestion,
    feedbackYes,
    feedbackNo,
    goToContact,
    backToCategories,
  } = useChatbot();

  // Greeting or Category selection - show all categories in 1 column
  if (state.step === "greeting" || state.step === "category") {
    return (
      <div className="space-y-2 mt-3 ml-9 pb-4">
        {categories.map((category, index) => {
          const IconComponent = iconMap[category.icon] || HelpCircle;
          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => selectCategory(category)}
                className="w-full h-auto py-2.5 px-3 justify-start gap-2 text-left hover:bg-primary/10 hover:border-primary border-border"
              >
                <IconComponent className="h-4 w-4 flex-shrink-0 text-primary" />
                <span className="text-sm">{category.label}</span>
              </Button>
            </motion.div>
          );
        })}
      </div>
    );
  }

  // Questions - show questions in selected category
  if (state.step === "questions" && state.selectedCategory) {
    return (
      <div className="space-y-2 mt-3 ml-9 pb-4">
        {state.selectedCategory.items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => selectQuestion(item)}
              className="w-full h-auto py-2.5 px-3 justify-start text-left hover:bg-primary/10 hover:border-primary whitespace-normal border-border"
            >
              <span className="text-sm">{item.question}</span>
            </Button>
          </motion.div>
        ))}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: state.selectedCategory.items.length * 0.05 }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={backToCategories}
            className="w-full gap-2 text-muted-foreground justify-start"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">다른 카테고리 보기</span>
          </Button>
        </motion.div>
      </div>
    );
  }

  // Answer - show feedback buttons
  if (state.step === "answer") {
    return (
      <div className="space-y-2 mt-3 ml-9 pb-4">
        <p className="text-sm text-muted-foreground mb-2">
          문제가 해결되셨나요?
        </p>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={feedbackYes}
            className="w-full py-2.5 hover:bg-green-500/10 hover:border-green-500 hover:text-green-600 border-border"
          >
            네, 해결됐어요
          </Button>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.05 }}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={feedbackNo}
            className="w-full py-2.5 hover:bg-orange-500/10 hover:border-orange-500 hover:text-orange-600 border-border"
          >
            아니오
          </Button>
        </motion.div>
      </div>
    );
  }

  // Feedback (not resolved) - show contact option
  if (state.step === "feedback") {
    return (
      <div className="space-y-2 mt-3 ml-9 pb-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={goToContact}
            className="w-full gap-2 py-2.5 hover:bg-primary/10 hover:border-primary justify-start border-border"
          >
            <Phone className="h-4 w-4" />
            <span className="text-sm">고객센터 연락처 보기</span>
          </Button>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.05 }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={backToCategories}
            className="w-full gap-2 text-muted-foreground justify-start"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">다른 질문 찾아보기</span>
          </Button>
        </motion.div>
      </div>
    );
  }

  // Contact - show back button
  if (state.step === "contact") {
    return (
      <div className="mt-3 ml-9 pb-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={backToCategories}
            className="w-full gap-2 text-muted-foreground justify-start"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">다른 질문 찾아보기</span>
          </Button>
        </motion.div>
      </div>
    );
  }

  return null;
}

export function ChatbotMessages() {
  const { state } = useChatbot();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive or step changes
  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: "smooth",
        });
      }, 150);
    }
  }, [state.messages, state.step]);

  return (
    <div
      ref={scrollRef}
      className="h-full overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent"
    >
      <div className="space-y-1">
        {state.messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        <InlineOptions />
      </div>
    </div>
  );
}
