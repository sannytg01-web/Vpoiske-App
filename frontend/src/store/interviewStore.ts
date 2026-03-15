import { create } from 'zustand';

export interface ChatMessage {
  id: string;
  role: 'system' | 'ai' | 'user';
  text: string;
}

interface InterviewState {
  sessionId: string | null;
  messages: ChatMessage[];
  currentQuestionIndex: number;
  isComplete: boolean;
  isTyping: boolean;
  startSession: (sessionId: string, initialMessage: string) => void;
  sendMessage: (message: string) => void;
  addMessage: (msg: ChatMessage) => void;
  setTyping: (typing: boolean) => void;
  completeInterview: () => void;
  setQuestionIndex: (index: number) => void;
  reset: () => void;
}

export const useInterviewStore = create<InterviewState>((set) => ({
  sessionId: null,
  messages: [],
  currentQuestionIndex: 0,
  isComplete: false,
  isTyping: false,

  startSession: (sessionId, initialMessage) => set({
    sessionId,
    currentQuestionIndex: 1,
    isComplete: false,
    messages: [{ id: '0', role: 'ai', text: initialMessage }]
  }),

  sendMessage: (message) => set((state) => ({
    messages: [...state.messages, { id: Date.now().toString(), role: 'user', text: message }]
  })),

  addMessage: (msg) => set((state) => ({
    messages: [...state.messages, msg]
  })),

  setTyping: (typing) => set({ isTyping: typing }),

  completeInterview: () => set({ isComplete: true }),
  
  setQuestionIndex: (index) => set({ currentQuestionIndex: index }),

  reset: () => set({ sessionId: null, messages: [], currentQuestionIndex: 0, isComplete: false, isTyping: false })
}));
