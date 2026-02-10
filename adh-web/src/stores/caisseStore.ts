import { create } from 'zustand';
import type { CaisseConfig, Denomination, DenominationCount } from '@/types';
import { denominationApi } from '@/services/api/endpoints';
import { useDataSourceStore } from './dataSourceStore';

interface CaisseStore {
  config: CaisseConfig | null;
  denominations: Denomination[];
  counting: DenominationCount[];
  isLoadingDenominations: boolean;
  setConfig: (config: CaisseConfig) => void;
  setDenominations: (denoms: Denomination[]) => void;
  updateCount: (denominationId: number, quantite: number) => void;
  resetCounting: () => void;
  getTotalByDevise: (deviseCode: string) => number;
  loadDenominations: (deviseCode: string) => Promise<void>;
  getCounting: () => { denominationId: number; quantite: number }[];
}

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
  isLoadingDenominations: false,

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
      set({
        denominations: denoms.map((d) => ({
          id: d.id,
          deviseCode: d.deviseCode,
          valeur: d.valeur,
          type: d.type,
          libelle: d.libelle ?? `${d.valeur}`,
        })),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur chargement dénominations';
      throw new Error(message);
    } finally {
      set({ isLoadingDenominations: false });
    }
  },

  getCounting: () => {
    const state = get();
    return state.counting
      .filter((c) => c.quantite > 0)
      .map((c) => ({ denominationId: c.denominationId, quantite: c.quantite }));
  },
}));
