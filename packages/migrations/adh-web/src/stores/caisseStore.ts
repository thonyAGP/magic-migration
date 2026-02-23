import { create } from 'zustand';
import type { CaisseConfig, Denomination, DenominationCount } from '@/types';
import { denominationApi } from '@/services/api/endpoints';
import { apiClient } from '@/services/api/apiClient';
import { useDataSourceStore } from './dataSourceStore';

interface CaisseStore {
  config: CaisseConfig | null;
  denominations: Denomination[];
  counting: DenominationCount[];
  isLoadingConfig: boolean;
  isLoadingDenominations: boolean;
  dateComptable: string | null;
  setConfig: (config: CaisseConfig) => void;
  setDenominations: (denoms: Denomination[]) => void;
  updateCount: (denominationId: number, quantite: number) => void;
  resetCounting: () => void;
  getTotalByDevise: (deviseCode: string) => number;
  loadConfig: () => Promise<void>;
  loadDenominations: (deviseCode: string) => Promise<void>;
  getCounting: () => { denominationId: number; quantite: number }[];
  setDateComptable: (date: string) => void;
  validateDateComptable: () => boolean;
}

const MOCK_CONFIG: CaisseConfig = {
  id: 1,
  numero: 'C001',
  societe: 'ADH',
  libelle: 'Caisse principale',
  devisePrincipale: 'EUR',
  devisesAutorisees: ['EUR', 'USD', 'GBP', 'CHF'],
};

const MOCK_DENOMINATIONS: Denomination[] = [
  { id: 1, deviseCode: 'EUR', valeur: 500, type: 'billet', libelle: '500 EUR' },
  { id: 2, deviseCode: 'EUR', valeur: 200, type: 'billet', libelle: '200 EUR' },
  { id: 3, deviseCode: 'EUR', valeur: 100, type: 'billet', libelle: '100 EUR' },
  { id: 4, deviseCode: 'EUR', valeur: 50, type: 'billet', libelle: '50 EUR' },
  { id: 5, deviseCode: 'EUR', valeur: 20, type: 'billet', libelle: '20 EUR' },
  { id: 6, deviseCode: 'EUR', valeur: 10, type: 'billet', libelle: '10 EUR' },
  { id: 7, deviseCode: 'EUR', valeur: 5, type: 'billet', libelle: '5 EUR' },
  { id: 8, deviseCode: 'EUR', valeur: 2, type: 'piece', libelle: '2 EUR' },
  { id: 9, deviseCode: 'EUR', valeur: 1, type: 'piece', libelle: '1 EUR' },
  { id: 10, deviseCode: 'EUR', valeur: 0.5, type: 'piece', libelle: '0.50 EUR' },
  { id: 11, deviseCode: 'EUR', valeur: 0.2, type: 'piece', libelle: '0.20 EUR' },
  { id: 12, deviseCode: 'EUR', valeur: 0.1, type: 'piece', libelle: '0.10 EUR' },
  { id: 13, deviseCode: 'EUR', valeur: 0.05, type: 'piece', libelle: '0.05 EUR' },
  { id: 14, deviseCode: 'EUR', valeur: 0.02, type: 'piece', libelle: '0.02 EUR' },
  { id: 15, deviseCode: 'EUR', valeur: 0.01, type: 'piece', libelle: '0.01 EUR' },
];

export const useCaisseStore = create<CaisseStore>()((set, get) => ({
  config: null,
  denominations: [],
  counting: [],
  isLoadingConfig: false,
  isLoadingDenominations: false,
  dateComptable: null,

  setConfig: (config) => set({ config }),
  setDenominations: (denominations) => set({ denominations }),

  updateCount: (denominationId, quantite) =>
    set((state) => {
      const denom = state.denominations.find((d) => d.id === denominationId);
      if (!denom) return state;
      const existing = state.counting.find(
        (c) => c.denominationId === denominationId
      );
      if (existing) {
        return {
          counting: state.counting.map((c) =>
            c.denominationId === denominationId
              ? { ...c, quantite, total: quantite * denom.valeur }
              : c
          ),
        };
      }
      return {
        counting: [
          ...state.counting,
          { denominationId, quantite, total: quantite * denom.valeur },
        ],
      };
    }),

  resetCounting: () => set({ counting: [] }),

  getTotalByDevise: (deviseCode) => {
    const state = get();
    return state.counting
      .filter((c) => {
        const denom = state.denominations.find(
          (d) => d.id === c.denominationId
        );
        return denom?.deviseCode === deviseCode;
      })
      .reduce((sum, c) => sum + c.total, 0);
  },

  loadConfig: async () => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isLoadingConfig: true });

    if (!isRealApi) {
      set({ config: MOCK_CONFIG, isLoadingConfig: false });
      return;
    }

    try {
      const response = await apiClient.get<{ data: CaisseConfig }>('/caisse/config');
      const data = response.data?.data;
      set({ config: data ?? MOCK_CONFIG });
    } catch {
      set({ config: MOCK_CONFIG });
    } finally {
      set({ isLoadingConfig: false });
    }
  },

  loadDenominations: async (deviseCode) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isLoadingDenominations: true });

    if (!isRealApi) {
      // Mode Mock - retourne les denominations fictives
      const filtered = MOCK_DENOMINATIONS.filter((d) => d.deviseCode === deviseCode);
      set({
        denominations: filtered.length > 0 ? filtered : MOCK_DENOMINATIONS,
        isLoadingDenominations: false,
      });
      return;
    }

    try {
      const response = await denominationApi.getByDevise(deviseCode);
      const denoms = response.data.data;
      if (denoms && Array.isArray(denoms) && denoms.length > 0) {
        set({
          denominations: denoms.map((d) => ({
            id: d.id,
            deviseCode: d.deviseCode,
            valeur: d.valeur,
            type: d.type,
            libelle: d.libelle ?? `${d.valeur}`,
          })),
        });
      } else {
        // API returned empty - fallback to mock
        const filtered = MOCK_DENOMINATIONS.filter((d) => d.deviseCode === deviseCode);
        set({ denominations: filtered.length > 0 ? filtered : MOCK_DENOMINATIONS });
      }
    } catch {
      // API unavailable - fallback to mock denominations
      const filtered = MOCK_DENOMINATIONS.filter((d) => d.deviseCode === deviseCode);
      set({ denominations: filtered.length > 0 ? filtered : MOCK_DENOMINATIONS });
    } finally {
      set({ isLoadingDenominations: false });
    }
  },

  setDateComptable: (date) => set({ dateComptable: date }),

  validateDateComptable: () => {
    const { dateComptable } = get();
    if (!dateComptable) return false;
    const today = new Date().toISOString().slice(0, 10);
    return dateComptable.slice(0, 10) === today;
  },

  getCounting: () => {
    const state = get();
    return state.counting
      .filter((c) => c.quantite > 0)
      .map((c) => ({ denominationId: c.denominationId, quantite: c.quantite }));
  },
}));
