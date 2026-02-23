import { create } from 'zustand';
import type {
  GetMatriculeResponse,
  AuthenticationStore,
} from '@/types/authentication';
import { apiClient } from '@/services/api/apiClient';
import type { ApiResponse } from '@/services/api/apiClient';
import { useDataSourceStore } from '@/stores/dataSourceStore';

const MOCK_CREDENTIALS = [
  { login: 'jdupont', matricule: 'MAT001' },
  { login: 'smartin', matricule: 'MAT002' },
  { login: 'pdurand', matricule: 'MAT003' },
  { login: 'mleblanc', matricule: 'MAT004' },
  { login: 'arobert', matricule: 'MAT005' },
];

const initialState = {
  matricule: null,
  isLoading: false,
  error: null,
};

export const useAuthenticationStore = create<AuthenticationStore>()((set) => ({
  ...initialState,

  getMatricule: async (login: string) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isLoading: true, error: null });

    if (!isRealApi) {
      const found = MOCK_CREDENTIALS.find((c) => c.login === login);
      set({
        matricule: found?.matricule ?? '',
        isLoading: false,
      });
      return;
    }

    try {
      const response = await apiClient.get<ApiResponse<GetMatriculeResponse>>(
        '/api/authentication/matricule',
        { params: { login } },
      );
      set({ matricule: response.data.data?.matricule ?? '' });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur récupération matricule';
      set({ matricule: '', error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  setMatricule: (matricule) => {
    set({ matricule, error: null });
  },

  setError: (error) => {
    set({ error });
  },

  reset: () => set({ ...initialState }),
}));