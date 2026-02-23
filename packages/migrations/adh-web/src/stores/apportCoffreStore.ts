import { create } from 'zustand';
import type {
  Devise,
  ApportCoffreRequest,
  ApportCoffreResponse,
  CaisseConfig,
  ApportCoffreState,
} from '@/types/apportCoffre';
import { apiClient } from '@/services/api/apiClient';
import type { ApiResponse } from '@/services/api/apiClient';
import { useDataSourceStore } from '@/stores/dataSourceStore';

const MOCK_DEVISES: Devise[] = [
  { code: 'EUR', libelle: 'Euro', venteAutorisee: true },
  { code: 'USD', libelle: 'Dollar américain', venteAutorisee: true },
  { code: 'GBP', libelle: 'Livre sterling', venteAutorisee: true },
  { code: 'CHF', libelle: 'Franc suisse', venteAutorisee: false },
];

const MOCK_CONFIG: CaisseConfig = {
  devisesAutorisees: MOCK_DEVISES.filter((d) => d.venteAutorisee),
  sessionActive: true,
};

const initialState = {
  devises: [] as Devise[],
  isExecuting: false,
  error: null as string | null,
  deviseSelectionnee: null as string | null,
  montantSaisi: 0,
};

export const useApportCoffreStore = create<ApportCoffreState>()((set, get) => ({
  ...initialState,

  chargerDevises: async () => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isExecuting: true, error: null });

    if (!isRealApi) {
      set({
        devises: MOCK_CONFIG.devisesAutorisees,
        isExecuting: false,
      });
      return;
    }

    try {
      const response = await apiClient.get<ApiResponse<CaisseConfig>>('/api/caisse/config');
      const config = response.data.data;
      if (!config) {
        throw new Error('Configuration caisse non disponible');
      }
      set({ devises: config.devisesAutorisees });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur chargement devises';
      set({ devises: [], error: message });
    } finally {
      set({ isExecuting: false });
    }
  },

  validerApport: async (deviseCode, montant, context) => {
    const { isRealApi } = useDataSourceStore.getState();
    const { devises } = get();

    set({ isExecuting: true, error: null });

    if (montant <= 0) {
      set({ error: 'Le montant doit être supérieur à zéro', isExecuting: false });
      return;
    }

    const deviseAutorisee = devises.find((d) => d.code === deviseCode);
    if (!deviseAutorisee) {
      set({ error: 'Devise non autorisée', isExecuting: false });
      return;
    }

    if (!isRealApi) {
      const _mockResponse: ApportCoffreResponse = {
        success: true,
        montantCoffre: 500 + montant,
      };
      set({
        isExecuting: false,
        deviseSelectionnee: null,
        montantSaisi: 0,
      });
      return;
    }

    try {
      const payload: ApportCoffreRequest = {
        deviseCode,
        montant,
        context,
      };
      const response = await apiClient.post<ApiResponse<ApportCoffreResponse>>(
        '/api/caisse/operations/apport-coffre',
        payload,
      );
      const data = response.data.data;
      if (!data?.success) {
        throw new Error('Échec enregistrement apport');
      }
      set({
        deviseSelectionnee: null,
        montantSaisi: 0,
      });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur validation apport';
      set({ error: message });
    } finally {
      set({ isExecuting: false });
    }
  },

  setDeviseSelectionnee: (code) => set({ deviseSelectionnee: code }),

  setMontantSaisi: (montant) => set({ montantSaisi: montant }),

  setError: (error) => set({ error }),

  reset: () => set({ ...initialState }),
}));