import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api.js';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user:        null,
      accessToken: null,
      loading:     true,

      setAuth: (user, accessToken) => set({ user, accessToken, loading: false }),
      clearAuth: () => set({ user: null, accessToken: null }),

      // Called once on app mount — tries to get a fresh token via refresh cookie
      init: async () => {
        try {
          const { data } = await api.post('/auth/refresh');
          set({ user: data.user, accessToken: data.accessToken, loading: false });
        } catch {
          set({ user: null, accessToken: null, loading: false });
        }
      },

      logout: async () => {
        try { await api.post('/auth/logout'); } catch {}
        get().clearAuth();
      },
    }),
    {
      name:    'vault-auth',
      partialize: (s) => ({ accessToken: s.accessToken, user: s.user }),
    }
  )
);
