import { create } from 'zustand';

interface AuthState {
  user: { id: number; name: string } | null;
  login: (name: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  (set) => ({
    user: null,
    login: (name: string) => set({ user: { id: 1, name } }),
    logout: () => set({ user: null }),
  })
);
