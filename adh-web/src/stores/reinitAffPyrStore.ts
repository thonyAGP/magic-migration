import { create } from 'zustand';
import type {
  ReinitAffectationParams,
  ReinitAffectationResponse,
  AffectationStatusResponse,
  ReinitAffPyrState,
} from '@/types/reinitAffPyr';
import { useDataSourceStore } from './dataSourceStore';
import { apiClient } from '@/services/api/apiClient';
import type { ApiResponse } from '@/services/api/apiClient';

interface ReinitAffPyrStore extends ReinitAffPyrState {
  reset: () => void;
}

const initialState: Omit<ReinitAffPyrState, 'reinitAffectationPyr' | 'resetAllAffectations' | 'getAffectationStatus' | 'clearError'> = {
  isProcessing: false,
  error: null,
  lastResetCount: 0,
};

const MOCK_HEBERGEMENT_RECORDS = [
  { societe: 'SOC1', compte: 1001, chambre: '101', affectationPyr: 'P' },
  { societe: 'SOC1', compte: 1001, chambre: '102', affectationPyr: 'H' },
  { societe: 'SOC1', compte: 1002, chambre: '201', affectationPyr: 'P' },
  { societe: 'SOC1', compte: 1002, chambre: '', affectationPyr: 'P' },
  { societe: 'SOC1', compte: 1003, chambre: '301', affectationPyr: null },
  { societe: 'SOC1', compte: 1004, chambre: '401', affectationPyr: 'P' },
  { societe: 'SOC1', compte: 1004, chambre: '', affectationPyr: 'H' },
  { societe: 'SOC2', compte: 2001, chambre: '501', affectationPyr: 'P' },
  { societe: 'SOC2', compte: 2001, chambre: '502', affectationPyr: '' },
  { societe: 'SOC2', compte: 2002, chambre: '', affectationPyr: null },
];

export const useReinitAffPyrStore = create<ReinitAffPyrStore>()((set) => ({
  ...initialState,

  reinitAffectationPyr: async (params: ReinitAffectationParams) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isProcessing: true, error: null });

    if (!isRealApi) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      const filtered = MOCK_HEBERGEMENT_RECORDS.filter(
        (r) =>
          r.societe === params.societe &&
          r.compte === params.compte &&
          (params.chambre === undefined || r.chambre === params.chambre),
      );

      const affectedCount = filtered.length;
      
      set({ 
        isProcessing: false, 
        lastResetCount: affectedCount 
      });
      return affectedCount;
    }

    try {
      const queryParams = new URLSearchParams({
        societe: params.societe,
        compte: String(params.compte),
      });
      
      if (params.chambre !== undefined) {
        queryParams.append('chambre', params.chambre);
      }

      const response = await apiClient.post<ApiResponse<ReinitAffectationResponse>>(
        `/api/reinitAffPyr/reset?${queryParams.toString()}`,
      );

      const affectedCount = response.data.data?.affectedCount ?? 0;
      
      set({ 
        lastResetCount: affectedCount,
        isProcessing: false 
      });
      
      return affectedCount;
    } catch (e: unknown) {
      const error = e instanceof Error ? e : new Error('Erreur réinitialisation affectation PYR');
      set({ error, isProcessing: false });
      throw error;
    }
  },

  resetAllAffectations: async () => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isProcessing: true, error: null });

    if (!isRealApi) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      const totalCount = MOCK_HEBERGEMENT_RECORDS.length;
      
      set({ 
        isProcessing: false, 
        lastResetCount: totalCount 
      });
      return totalCount;
    }

    try {
      const response = await apiClient.post<ApiResponse<ReinitAffectationResponse>>(
        '/api/reinitAffPyr/reset-all',
      );

      const affectedCount = response.data.data?.affectedCount ?? 0;
      
      set({ 
        lastResetCount: affectedCount,
        isProcessing: false 
      });
      
      return affectedCount;
    } catch (e: unknown) {
      const error = e instanceof Error ? e : new Error('Erreur réinitialisation globale');
      set({ error, isProcessing: false });
      throw error;
    }
  },

  getAffectationStatus: async (societe: string, compte: number) => {
    const { isRealApi } = useDataSourceStore.getState();

    if (!isRealApi) {
      const filtered = MOCK_HEBERGEMENT_RECORDS.filter(
        (r) =>
          r.societe === societe &&
          r.compte === compte &&
          r.affectationPyr !== null &&
          r.affectationPyr !== '',
      );

      return {
        hasActiveAffectations: filtered.length > 0,
        count: filtered.length,
      };
    }

    try {
      const queryParams = new URLSearchParams({
        societe,
        compte: String(compte),
      });

      const response = await apiClient.get<ApiResponse<AffectationStatusResponse>>(
        `/api/reinitAffPyr/status?${queryParams.toString()}`,
      );

      return response.data.data ?? { hasActiveAffectations: false, count: 0 };
    } catch (e: unknown) {
      const error = e instanceof Error ? e : new Error('Erreur vérification statut');
      set({ error });
      throw error;
    }
  },

  clearError: () => set({ error: null }),

  reset: () => set({ ...initialState }),
}));