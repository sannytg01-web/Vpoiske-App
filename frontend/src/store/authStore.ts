import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Platform } from '../utils/platform';

interface AuthState {
  userId: string | null;
  platform: Platform | null;
  initData: string | null;
  isAuthenticated: boolean;
  hasCompletedInterview: boolean;
  hasCompletedBirthData: boolean;
  isPremium: boolean;
  premiumUntil: string | null;
  bio: string | null;
  isAdmin: boolean;
  
  setPlatform: (p: Platform) => void;
  setInitData: (d: string) => void;
  setAuthenticated: (id: string) => void;
  setInterviewComplete: (val: boolean) => void;
  setBirthDataComplete: (val: boolean) => void;
  setPremium: (status: boolean, until?: string | null) => void;
  setBio: (val: string) => void;
  setAdmin: (val: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      userId: null,
      platform: null,
      initData: null,
      isAuthenticated: false,
      hasCompletedInterview: false,
      hasCompletedBirthData: false,
      isPremium: false,
      premiumUntil: null,
      bio: null,
      isAdmin: false,
      
      setPlatform: (p) => set({ platform: p }),
      setInitData: (d) => set({ initData: d }),
      setAuthenticated: (id) => set({ isAuthenticated: true, userId: id }),
      setInterviewComplete: (val) => set({ hasCompletedInterview: val }),
      setBirthDataComplete: (val) => set({ hasCompletedBirthData: val }),
      setPremium: (status, until = null) => set({ isPremium: status, premiumUntil: until }),
      setBio: (val) => set({ bio: val }),
      setAdmin: (val) => set({ isAdmin: val }),
      logout: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        set({ 
          userId: null, isAuthenticated: false, initData: null, 
          hasCompletedInterview: false, hasCompletedBirthData: false, 
          isPremium: false, premiumUntil: null, bio: null, isAdmin: false
        });
      },
    }),
    {
      name: 'vpoiske-auth-storage',
    }
  )
);
