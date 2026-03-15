import { create } from 'zustand';
import { apiClient } from '../utils/apiClient';

export interface ChatMessage {
  id: string;
  sender_id: number; // or string based on auth mock
  content: string;
  created_at: string;
  read_at: string | null;
}

interface ChatState {
  messages: ChatMessage[];
  loading: boolean;
  hasMore: boolean;
  
  fetchMessages: (matchId: string) => Promise<void>;
  loadMoreMessages: (matchId: string) => Promise<void>;
  addMessage: (msg: ChatMessage) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  loading: false,
  hasMore: true,

  fetchMessages: async (matchId) => {
    set({ loading: true, hasMore: true });
    try {
      const res = await apiClient.get(`/chat/${matchId}/messages?limit=50`);
      set({ messages: res.data, hasMore: res.data.length === 50 });
    } catch (e) {
      console.warn('Failed fetching messages.', e);
      // Fallback for visual preview
      const fakePast = new Date(Date.now() - 3600000).toISOString();
      set({ 
        messages: [
            { id: '1', sender_id: 2, content: 'Привет! Классно совпали по базе)', created_at: fakePast, read_at: fakePast },
            { id: '2', sender_id: 2, content: 'Как насчет встретиться на выходных?', created_at: fakePast, read_at: fakePast }
        ], 
        hasMore: false 
      });
    } finally {
      set({ loading: false });
    }
  },

  loadMoreMessages: async (matchId) => {
    const state = get();
    if (state.loading || !state.hasMore || state.messages.length === 0) return;
    
    set({ loading: true });
    try {
      const oldestId = state.messages[0].id; // assume sorted oldest first, so index 0 is oldest
      const res = await apiClient.get(`/chat/${matchId}/messages?limit=50&before=${oldestId}`);
      if (res.data.length > 0) {
          set({ 
              messages: [...res.data, ...state.messages],
              hasMore: res.data.length === 50 
          });
      } else {
          set({ hasMore: false });
      }
    } catch(e) {
       console.error("Failed loading older messages.", e);
    } finally {
       set({ loading: false });
    }
  },

  addMessage: (msg: ChatMessage) => set((state) => ({ messages: [...state.messages, msg] })),
  
  clearMessages: () => set({ messages: [], hasMore: true })
}));
