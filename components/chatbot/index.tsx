"use client";

import { ChatbotProvider } from "./chatbot-provider";
import { ChatbotButton } from "./chatbot-button";
import { ChatbotWindow } from "./chatbot-window";

export function Chatbot() {
  return (
    <ChatbotProvider>
      <ChatbotButton />
      <ChatbotWindow />
    </ChatbotProvider>
  );
}

// Re-export for external usage
export { ChatbotProvider, useChatbot } from "./chatbot-provider";
