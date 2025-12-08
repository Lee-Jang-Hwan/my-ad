"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChatbot } from "./chatbot-provider";
import { cn } from "@/lib/utils";

export function ChatbotButton() {
  const { state, toggleOpen } = useChatbot();
  const [showTooltip, setShowTooltip] = useState(false);

  // Show tooltip on first visit (after 2 seconds, hide after 5 seconds)
  useEffect(() => {
    const hasSeenTooltip = localStorage.getItem("chatbot-tooltip-seen");
    if (!hasSeenTooltip && !state.isOpen) {
      const showTimer = setTimeout(() => {
        setShowTooltip(true);
      }, 2000);

      const hideTimer = setTimeout(() => {
        setShowTooltip(false);
        localStorage.setItem("chatbot-tooltip-seen", "true");
      }, 7000);

      return () => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [state.isOpen]);

  // Hide tooltip when chatbot opens
  useEffect(() => {
    if (state.isOpen) {
      setShowTooltip(false);
      localStorage.setItem("chatbot-tooltip-seen", "true");
    }
  }, [state.isOpen]);

  return (
    <div className="fixed bottom-6 right-6 z-[45] flex flex-col items-end gap-2">
      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && !state.isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="bg-popover text-popover-foreground border rounded-lg px-4 py-2 shadow-lg text-sm max-w-[200px]"
          >
            <p>도움이 필요하신가요?</p>
            <div className="absolute -bottom-2 right-6 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-popover" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
          delay: 0.5,
        }}
      >
        <Button
          onClick={toggleOpen}
          size="icon"
          className={cn(
            "h-14 w-14 rounded-full shadow-lg transition-all duration-300",
            "bg-primary hover:bg-primary/90 text-primary-foreground",
            "hover:scale-110 active:scale-95",
            state.isOpen && "bg-muted hover:bg-muted/90 text-muted-foreground"
          )}
          aria-label={state.isOpen ? "챗봇 닫기" : "챗봇 열기"}
        >
          <AnimatePresence mode="wait">
            {state.isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="h-6 w-6" />
              </motion.div>
            ) : (
              <motion.div
                key="open"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <MessageCircle className="h-6 w-6" />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </motion.div>
    </div>
  );
}
