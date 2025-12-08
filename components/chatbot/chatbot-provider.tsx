"use client";

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  type ReactNode,
} from "react";
import {
  FAQ_CATEGORIES,
  CUSTOMER_SERVICE,
  CHATBOT_MESSAGES,
  type FAQCategory,
  type FAQItem,
} from "@/constants/chatbot-faq";

// Types
export type ChatStep =
  | "greeting"
  | "category"
  | "questions"
  | "answer"
  | "feedback"
  | "contact";

export interface ChatMessage {
  id: string;
  type: "bot" | "user";
  content: string;
  timestamp: Date;
}

interface ChatState {
  isOpen: boolean;
  step: ChatStep;
  selectedCategory: FAQCategory | null;
  selectedQuestion: FAQItem | null;
  messages: ChatMessage[];
}

type ChatAction =
  | { type: "TOGGLE_OPEN" }
  | { type: "OPEN" }
  | { type: "CLOSE" }
  | { type: "SELECT_CATEGORY"; payload: FAQCategory }
  | { type: "SELECT_QUESTION"; payload: FAQItem }
  | { type: "FEEDBACK_YES" }
  | { type: "FEEDBACK_NO" }
  | { type: "GO_TO_CONTACT" }
  | { type: "BACK_TO_CATEGORIES" }
  | { type: "RESET" };

// Helper to create message
const createMessage = (
  type: "bot" | "user",
  content: string
): ChatMessage => ({
  id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  type,
  content,
  timestamp: new Date(),
});

// Initial state
const initialState: ChatState = {
  isOpen: false,
  step: "greeting",
  selectedCategory: null,
  selectedQuestion: null,
  messages: [createMessage("bot", CHATBOT_MESSAGES.greeting)],
};

// Reducer
function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case "TOGGLE_OPEN":
      return { ...state, isOpen: !state.isOpen };

    case "OPEN":
      return { ...state, isOpen: true };

    case "CLOSE":
      return { ...state, isOpen: false };

    case "SELECT_CATEGORY":
      return {
        ...state,
        step: "questions",
        selectedCategory: action.payload,
        messages: [
          ...state.messages,
          createMessage("user", action.payload.label),
          createMessage("bot", CHATBOT_MESSAGES.selectQuestion),
        ],
      };

    case "SELECT_QUESTION":
      return {
        ...state,
        step: "answer",
        selectedQuestion: action.payload,
        messages: [
          ...state.messages,
          createMessage("user", action.payload.question),
          createMessage("bot", action.payload.answer),
        ],
      };

    case "FEEDBACK_YES":
      return {
        ...state,
        step: "category",
        selectedQuestion: null,
        messages: [
          ...state.messages,
          createMessage("user", "네, 해결되었어요"),
          createMessage("bot", CHATBOT_MESSAGES.resolved),
        ],
      };

    case "FEEDBACK_NO":
      return {
        ...state,
        step: "feedback",
        messages: [
          ...state.messages,
          createMessage("user", "아니오, 해결되지 않았어요"),
          createMessage("bot", CHATBOT_MESSAGES.notResolved),
        ],
      };

    case "GO_TO_CONTACT":
      return {
        ...state,
        step: "contact",
        messages: [
          ...state.messages,
          createMessage("user", "고객센터 연락처"),
          createMessage(
            "bot",
            `${CHATBOT_MESSAGES.contactInfo}\n\n이메일: ${CUSTOMER_SERVICE.email}\n전화: ${CUSTOMER_SERVICE.phone}\n운영시간: ${CUSTOMER_SERVICE.hours}`
          ),
        ],
      };

    case "BACK_TO_CATEGORIES":
      return {
        ...state,
        step: "category",
        selectedCategory: null,
        selectedQuestion: null,
        messages: [
          ...state.messages,
          createMessage("bot", CHATBOT_MESSAGES.backToCategories),
        ],
      };

    case "RESET":
      return {
        ...initialState,
        isOpen: state.isOpen,
      };

    default:
      return state;
  }
}

// Context
interface ChatContextValue {
  state: ChatState;
  toggleOpen: () => void;
  open: () => void;
  close: () => void;
  selectCategory: (category: FAQCategory) => void;
  selectQuestion: (question: FAQItem) => void;
  feedbackYes: () => void;
  feedbackNo: () => void;
  goToContact: () => void;
  backToCategories: () => void;
  reset: () => void;
  categories: FAQCategory[];
  customerService: typeof CUSTOMER_SERVICE;
}

const ChatContext = createContext<ChatContextValue | null>(null);

// Provider
export function ChatbotProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  const toggleOpen = useCallback(() => dispatch({ type: "TOGGLE_OPEN" }), []);
  const open = useCallback(() => dispatch({ type: "OPEN" }), []);
  const close = useCallback(() => dispatch({ type: "CLOSE" }), []);
  const selectCategory = useCallback(
    (category: FAQCategory) =>
      dispatch({ type: "SELECT_CATEGORY", payload: category }),
    []
  );
  const selectQuestion = useCallback(
    (question: FAQItem) =>
      dispatch({ type: "SELECT_QUESTION", payload: question }),
    []
  );
  const feedbackYes = useCallback(() => dispatch({ type: "FEEDBACK_YES" }), []);
  const feedbackNo = useCallback(() => dispatch({ type: "FEEDBACK_NO" }), []);
  const goToContact = useCallback(
    () => dispatch({ type: "GO_TO_CONTACT" }),
    []
  );
  const backToCategories = useCallback(
    () => dispatch({ type: "BACK_TO_CATEGORIES" }),
    []
  );
  const reset = useCallback(() => dispatch({ type: "RESET" }), []);

  const value: ChatContextValue = {
    state,
    toggleOpen,
    open,
    close,
    selectCategory,
    selectQuestion,
    feedbackYes,
    feedbackNo,
    goToContact,
    backToCategories,
    reset,
    categories: FAQ_CATEGORIES,
    customerService: CUSTOMER_SERVICE,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

// Hook
export function useChatbot() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatbot must be used within a ChatbotProvider");
  }
  return context;
}
