"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useChatbot } from "./chatbot-provider";
import { ChatbotHeader } from "./chatbot-header";
import { ChatbotMessages } from "./chatbot-messages";

export function ChatbotWindow() {
  const { state } = useChatbot();

  return (
    <AnimatePresence>
      {state.isOpen && (
        <>
          {/* Desktop Window */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed bottom-24 right-6 z-50 hidden md:flex flex-col w-[380px] h-[500px] bg-background border rounded-lg shadow-xl"
          >
            <ChatbotHeader />
            <div className="flex-1 overflow-hidden">
              <ChatbotMessages />
            </div>
          </motion.div>

          {/* Mobile Full Screen */}
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 z-50 md:hidden flex flex-col bg-background"
          >
            <ChatbotHeader />
            <div className="flex-1 overflow-hidden">
              <ChatbotMessages />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
