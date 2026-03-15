import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '../utils/apiClient';

interface ProfileData {
  id: string;
  name: string | null;
  birth_year: number | null;
  gender: string | null;
  city: string | null;
  bio: string | null;
  photo_url: string | null;
  is_visible: boolean;
}

interface ProfileState {
  profile: ProfileData | null;
  isLoading: boolean;
  error: string | null;

  fetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<ProfileData>) => Promise<void>;
  clearProfile: () => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      profile: null,
      isLoading: false,
      error: null,

      fetchProfile: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.get('/profile/me');
          set({ profile: response.data, isLoading: false });
        } catch (error: any) {
          set({ 
            error: error.response?.data?.detail || 'Failed to fetch profile', 
            isLoading: false 
          });
        }
      },

      updateProfile: async (data: Partial<ProfileData>) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.put('/profile/me', data);
          set({ profile: response.data, isLoading: false });
        } catch (error: any) {
          set({ 
            error: error.response?.data?.detail || 'Failed to update profile', 
            isLoading: false 
          });
        }
      },

      clearProfile: () => set({ profile: null, error: null }),
    }),
    {
      name: 'vpoiske-profile-storage',
      partialize: (state) => ({ profile: state.profile }),
    }
  )
);
