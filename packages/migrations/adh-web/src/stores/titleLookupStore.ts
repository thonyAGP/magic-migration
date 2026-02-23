import { create } from 'zustand';
import type { Title, TitleLookupState } from '@/types/titleLookup';
import { useDataSourceStore } from '@/stores/dataSourceStore';
import { apiClient } from '@/services/api/apiClient';
import type { ApiResponse } from '@/services/api/apiClient';

const MOCK_TITLES: Title[] = [
  { code: 'M', label: 'M.', type: 'CA' },
  { code: 'MME', label: 'Mme', type: 'CA' },
  { code: 'MLLE', label: 'Mlle', type: 'CA' },
  { code: 'DR', label: 'Dr', type: 'CA' },
  { code: 'PR', label: 'Pr', type: 'CA' },
  { code: 'M', label: 'Mr', type: 'CB' },
  { code: 'MME', label: 'Mrs', type: 'CB' },
  { code: 'MLLE', label: 'Miss', type: 'CB' },
];

const initialState = {
  titles: [] as Title[],
  isLoading: false,
  error: null as string | null,
};

export const useTitleLookupStore = create<TitleLookupState>()((set, _get) => ({
  ...initialState,

  getTitleByCode: async (code, programType) => {
    const { isRealApi } = useDataSourceStore.getState();
    const effectiveType = programType || 'CA';

    if (!isRealApi) {
      const title = MOCK_TITLES.find(
        (t) => t.code === code && t.type === effectiveType,
      );
      return title?.label ?? code;
    }

    try {
      const response = await apiClient.get<ApiResponse<{ label: string }>>(
        `/api/titles/${code}?programType=${effectiveType}`,
      );
      return response.data.data?.label ?? code;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur recherche titre';
      set({ error: message });
      return code;
    }
  },

  loadTitles: async () => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isLoading: true, error: null });

    if (!isRealApi) {
      set({ titles: MOCK_TITLES, isLoading: false });
      return;
    }

    try {
      const response = await apiClient.get<ApiResponse<Title[]>>('/api/titles');
      set({ titles: response.data.data ?? [] });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur chargement titres';
      set({ titles: [], error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  setTitles: (titles) => set({ titles }),

  setIsLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  reset: () => set({ ...initialState }),
}));