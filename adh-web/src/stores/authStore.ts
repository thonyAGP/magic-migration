import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, LoginCredentials } from '@/types';
import { useDataSourceStore } from './dataSourceStore';

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
}

const MOCK_USER: User = {
  id: 1,
  login: 'demo',
  nom: 'Demo',
  prenom: 'Caissier',
  role: 'caissier',
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (credentials: LoginCredentials) => {
        const { isRealApi } = useDataSourceStore.getState();

        if (!isRealApi) {
          // Mode Mock - retourne un user fictif immediatement
          set({
            user: { ...MOCK_USER, login: credentials.login },
            token: 'mock-token',
            isAuthenticated: true,
          });
          return;
        }

        // Mode API - TODO: Call real auth API when ready
        try {
          // const response = await authApi.login(credentials);
          // set({ user: response.data.data.user, token: response.data.data.token, isAuthenticated: true });
          throw new Error('API auth not implemented yet');
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erreur de connexion';
          throw new Error(message);
        }
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        localStorage.removeItem('auth_token');
      },

      setUser: (user) => set({ user, isAuthenticated: true }),
      setToken: (token) => {
        localStorage.setItem('auth_token', token);
        set({ token });
      },
    }),
    { name: 'adh-auth' }
  )
);
