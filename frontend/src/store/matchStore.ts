import { create } from 'zustand';
import { apiClient } from '../utils/apiClient';

export interface MatchDetails {
  hd_score: number;
  psychology_score: number;
  values_score: number;
  hd: any;
  psych: any;
  values: any;
}

export interface MatchProfile {
  id: string;
  name: string;
  age: number;
  city: string;
  score: number;
  hd_type: string;
  photo: string | null;
  locked: boolean;
  match_reason?: string;
  hd_profile?: any;
  details: MatchDetails;
}

interface MatchState {
  matches: MatchProfile[];
  selectedMatch: MatchProfile | null;
  activeTab: 'all' | 'mutual' | 'new';
  filters: any;
  loading: boolean;
  
  fetchMatches: (tab?: string) => Promise<void>;
  setTab: (tab: 'all' | 'mutual' | 'new') => void;
  setFilters: (filters: any) => void;
  selectMatch: (id: string | null) => void;
  startChat: (id: string) => Promise<string | null>;
  skipMatch: (id: string) => Promise<void>;
}

export const useMatchStore = create<MatchState>((set, get) => ({
  matches: [],
  selectedMatch: null,
  activeTab: 'all',
  filters: {},
  loading: false,

  fetchMatches: async (tab = 'all') => {
    set({ loading: true });
    try {
      // Mock behaviour if API fails
      const res = await apiClient.get('/matches', { params: { tab } });
      set({ matches: res.data });
    } catch (e) {
      console.warn('Failed fetching matches, using static mock data.', e);
      // Fallback for visual testing and chat flow without backend
      if (get().matches.length === 0) {
        set({
          matches: [
          {
            id: '1',
            name: 'Лев',
            age: 26,
            city: 'Москва',
            score: 92,
            hd_type: 'Манифестирующий Генератор',
            photo: null,
            locked: false,
            match_reason: 'У вас глубокая совместимость на уровне ценностей: оба цените развитие и свободу. Психологически вы отлично дополняете друг друга — его стабильность уравновешивает вашу эмоциональность. В Human Design он помогает вам структурировать вашу бурлящую энергию Манифестирующего Генератора.',
            hd_profile: { definedCenters: ['Sacral', 'Throat', 'Root'], activeChannels: [[34, 20]] },
            details: {
              hd_score: 95,
              psychology_score: 90,
              values_score: 88,
              hd: { compatibility_base: 90, em_bonus: 15, channel_bonus: 10 },
              psych: { attachment: 20, neuro_diff: 3, extra_diff: 5, conflict: 10 },
              values: { shared_values: ['Свобода', 'Глубина', 'Развитие', 'Честность'] },
            },
          },
          {
            id: '2',
            name: 'Влад',
            age: 25,
            city: 'Санкт-Петербург',
            score: 85,
            hd_type: 'Проектор',
            photo: null,
            locked: false,
            match_reason: 'Одинаковый взгляд на честность и покой создаёт мощный фундамент для доверия. Его тип Проектора идеально подходит для того, чтобы направлять ваши идеи, не нарушая ваших личных границ. Вы сможете обсуждать самые глубокие темы, не боясь быть непонятыми.',
            hd_profile: { definedCenters: ['Head', 'Ajna', 'Throat'], activeChannels: [[43, 23], [17, 62]] },
            details: {
              hd_score: 80,
              psychology_score: 88,
              values_score: 90,
              hd: { compatibility_base: 80, em_bonus: 0, channel_bonus: 20 },
              psych: { attachment: 10, neuro_diff: 2, extra_diff: 0, conflict: 10 },
              values: { shared_values: ['Честность', 'Покой', 'Принятие'] },
            },
          },
          {
            id: '3',
            name: 'Даша',
            age: 23,
            city: 'Казань',
            score: 81,
            hd_type: 'Манифестор',
            photo: null,
            locked: false,
            details: {
              hd_score: 75,
              psychology_score: 82,
              values_score: 85,
              hd: { compatibility_base: 75, em_bonus: 15, channel_bonus: 0 },
              psych: { attachment: -15, neuro_diff: -10, extra_diff: 0, conflict: -5 },
              values: { shared_values: ['Творчество', 'Приключения', 'Страсть'] },
            },
          },
          {
            id: '4',
            name: 'Света',
            age: 21,
            city: 'Екатеринбург',
            score: 79,
            hd_type: 'Генератор',
            photo: null,
            locked: true,
            details: {
              hd_score: 70,
              psychology_score: 80,
              values_score: 85,
              hd: { compatibility_base: 70, em_bonus: 0, channel_bonus: 10 },
              psych: { attachment: 20, neuro_diff: 5, extra_diff: 0, conflict: 10 },
              values: { shared_values: ['Семья', 'Стабильность', 'Верность'] },
            },
          },
        ],
      });
      }
    } finally {
        set({ loading: false });
    }
  },

  setTab: (tab) => {
    set({ activeTab: tab });
    get().fetchMatches(tab);
  },

  setFilters: (filters) => set({ filters }),

  selectMatch: async (id) => {
    if (!id) {
       set({ selectedMatch: null });
       return;
    }
    
    // Attempt to prepopulate matches if we came directly via direct link mock
    if (get().matches.length === 0) {
        await get().fetchMatches('all');
    }

    const matchLocally = get().matches.find(m => m.id === id);
    if (matchLocally) {
      set({ selectedMatch: matchLocally });
    } else {
      try {
        const res = await apiClient.get(`/matches/${id}`);
        set({ selectedMatch: res.data });
      } catch (e) {
        console.error('Failed API match load, using fallback mock.');
        set({ 
            selectedMatch: {
                id,
                name: 'Приятель',
                age: 25,
                city: 'Москва',
                score: 80,
                hd_type: 'Генератор',
                photo: null,
                locked: false,
                details: {
                    hd_score: 80, psychology_score: 80, values_score: 80,
                    hd: {}, psych: {}, values: {}
                }
            } as MatchProfile
        });
      }
    }
  },

  startChat: async (id) => {
    try {
      const res = await apiClient.post(`/matches/${id}/start`);
      return res.data.chat_id;
    } catch (e) {
      console.warn('Failed network chat start, returning dummy id for preview');
      return `chat_${id}_dummy`;
    }
  },

  skipMatch: async (id) => {
    try {
        await apiClient.post(`/matches/${id}/skip`);
    } catch(e) {
        console.warn('Network skip failed, handling locally.');
    } finally {
        set(state => ({
            matches: state.matches.filter(m => m.id !== id),
            selectedMatch: null
        }));
    }
  }
}));
