import { create } from 'zustand';

export interface HDCardType {
  birth_date: string;
  birth_time: string | null;
  birth_time_accuracy: string;
  birth_city: string;
  type: string;
  profile: string;
  authority: string;
  defined_centers: string[];
  active_channels: number[][]; // [gate1, gate2][] usually
  active_gates: number[];
}

interface BirthDataState {
  birthDate: string;
  birthTime: string;
  birthTimeAccuracy: 'exact' | 'approx' | 'unknown';
  birthCity: string;
  birthLat: number | null;
  birthLon: number | null;
  birthTimezone: string;
  hdCard: HDCardType | null;

  setBirthData: (data: Partial<Omit<BirthDataState, 'hdCard' | 'setBirthData' | 'setHdCard' | 'reset'>>) => void;
  setHdCard: (card: HDCardType) => void;
  reset: () => void;
}

export const useBirthDataStore = create<BirthDataState>((set) => ({
  birthDate: '',
  birthTime: '',
  birthTimeAccuracy: 'exact',
  birthCity: '',
  birthLat: null,
  birthLon: null,
  birthTimezone: '',
  hdCard: null,

  setBirthData: (data) => set((state) => ({ ...state, ...data })),
  setHdCard: (card) => set({ hdCard: card }),
  reset: () => set({
    birthDate: '',
    birthTime: '',
    birthTimeAccuracy: 'exact',
    birthCity: '',
    birthLat: null,
    birthLon: null,
    birthTimezone: '',
    hdCard: null
  })
}));
