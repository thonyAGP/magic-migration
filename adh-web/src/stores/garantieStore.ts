import { create } from 'zustand';
import type {
  Garantie,
  GarantieOperation,
  GarantieSummaryData,
  GarantieSearchResult,
} from '@/types/garantie';
import { garantieApi } from '@/services/api/endpoints-lot4';
import { useDataSourceStore } from './dataSourceStore';

interface GarantieState {
  currentGarantie: Garantie | null;
  operations: GarantieOperation[];
  summary: GarantieSummaryData | null;
  searchResults: GarantieSearchResult | null;
  isSearching: boolean;
  isLoadingGarantie: boolean;
  isLoadingOperations: boolean;
  isLoadingSummary: boolean;
  isSubmitting: boolean;
  isCancelling: boolean;
  error: string | null;
}

interface GarantieActions {
  searchGarantie: (societe: string, query: string) => Promise<void>;
  loadGarantie: (id: number) => Promise<void>;
  loadOperations: (garantieId: number) => Promise<void>;
  loadSummary: (societe: string) => Promise<void>;
  createDepot: (data: {
    societe: string;
    codeAdherent: number;
    filiation: number;
    montant: number;
    devise: string;
    description: string;
    dateExpiration?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  recordVersement: (
    garantieId: number,
    montant: number,
    motif: string,
  ) => Promise<{ success: boolean; error?: string }>;
  recordRetrait: (
    garantieId: number,
    montant: number,
    motif: string,
  ) => Promise<{ success: boolean; error?: string }>;
  cancelGarantie: (
    garantieId: number,
    motif: string,
  ) => Promise<{ success: boolean; error?: string }>;
  reset: () => void;
}

type GarantieStore = GarantieState & GarantieActions;

const MOCK_GARANTIE: Garantie = {
  id: 1,
  societe: 'SOC1',
  codeAdherent: 1001,
  filiation: 0,
  nomAdherent: 'DUPONT Jean',
  type: 'depot',
  statut: 'active',
  montant: 500,
  devise: 'EUR',
  dateCreation: '2026-02-10',
  dateExpiration: '2026-03-10',
  description: 'Caution equipement sport',
  operateur: 'CAISSIER1',
  articles: [
    { id: 1, garantieId: 1, code: 'SKI01', libelle: 'Skis', description: 'Paire de skis adulte', valeurEstimee: 300, etat: 'depose' },
    { id: 2, garantieId: 1, code: 'BTS01', libelle: 'Chaussures ski', description: 'Chaussures ski taille 42', valeurEstimee: 150, etat: 'depose' },
  ],
};

const MOCK_SEARCH: GarantieSearchResult = {
  garanties: [MOCK_GARANTIE],
  total: 1,
};

const MOCK_OPERATIONS: GarantieOperation[] = [
  { id: 1, garantieId: 1, type: 'depot', montant: 500, date: '2026-02-10', heure: '09:00', operateur: 'CAISSIER1', motif: 'Depot initial' },
];

const MOCK_SUMMARY: GarantieSummaryData = {
  nbActives: 3,
  montantTotalBloque: 1500,
  nbVersees: 5,
  nbRestituees: 2,
};

const initialState: GarantieState = {
  currentGarantie: null,
  operations: [],
  summary: null,
  searchResults: null,
  isSearching: false,
  isLoadingGarantie: false,
  isLoadingOperations: false,
  isLoadingSummary: false,
  isSubmitting: false,
  isCancelling: false,
  error: null,
};

export const useGarantieStore = create<GarantieStore>()((set, get) => ({
  ...initialState,

  searchGarantie: async (societe, query) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isSearching: true, error: null });

    if (!isRealApi) {
      const filtered = MOCK_SEARCH.garanties.filter(
        (g) =>
          g.nomAdherent.toLowerCase().includes(query.toLowerCase()) ||
          String(g.codeAdherent).includes(query),
      );
      set({ searchResults: { garanties: filtered, total: filtered.length }, isSearching: false });
      return;
    }

    try {
      const response = await garantieApi.search(societe, query);
      set({ searchResults: response.data.data ?? null });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur recherche garantie';
      set({ searchResults: null, error: message });
    } finally {
      set({ isSearching: false });
    }
  },

  loadGarantie: async (id) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isLoadingGarantie: true, error: null });

    if (!isRealApi) {
      set({ currentGarantie: { ...MOCK_GARANTIE, id }, isLoadingGarantie: false });
      return;
    }

    try {
      const response = await garantieApi.getById(id);
      set({ currentGarantie: response.data.data ?? null });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur chargement garantie';
      set({ currentGarantie: null, error: message });
    } finally {
      set({ isLoadingGarantie: false });
    }
  },

  loadOperations: async (garantieId) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isLoadingOperations: true, error: null });

    if (!isRealApi) {
      set({ operations: MOCK_OPERATIONS.map((op) => ({ ...op, garantieId })), isLoadingOperations: false });
      return;
    }

    try {
      const response = await garantieApi.getOperations(garantieId);
      set({ operations: response.data.data ?? [] });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur chargement operations';
      set({ operations: [], error: message });
    } finally {
      set({ isLoadingOperations: false });
    }
  },

  loadSummary: async (societe) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isLoadingSummary: true, error: null });

    if (!isRealApi) {
      set({ summary: MOCK_SUMMARY, isLoadingSummary: false });
      return;
    }

    try {
      const response = await garantieApi.getSummary(societe);
      set({ summary: response.data.data ?? null });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur chargement resume';
      set({ summary: null, error: message });
    } finally {
      set({ isLoadingSummary: false });
    }
  },

  createDepot: async (data) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isSubmitting: true, error: null });

    if (!isRealApi) {
      set({ isSubmitting: false });
      return { success: true };
    }

    try {
      await garantieApi.create(data);
      // Reload summary after creation
      const state = get();
      await state.loadSummary(data.societe);
      return { success: true };
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur creation garantie';
      set({ error: message });
      return { success: false, error: message };
    } finally {
      set({ isSubmitting: false });
    }
  },

  recordVersement: async (garantieId, montant, motif) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isSubmitting: true, error: null });

    if (!isRealApi) {
      const newOp: GarantieOperation = {
        id: Date.now(),
        garantieId,
        type: 'versement',
        montant,
        date: new Date().toISOString().slice(0, 10),
        heure: new Date().toTimeString().slice(0, 5),
        operateur: 'MOCK',
        motif,
      };
      set((state) => ({
        operations: [...state.operations, newOp],
        isSubmitting: false,
      }));
      return { success: true };
    }

    try {
      await garantieApi.versement(garantieId, { montant, motif });
      // Reload garantie and operations
      const state = get();
      await Promise.all([
        state.loadGarantie(garantieId),
        state.loadOperations(garantieId),
      ]);
      return { success: true };
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur versement';
      set({ error: message });
      return { success: false, error: message };
    } finally {
      set({ isSubmitting: false });
    }
  },

  recordRetrait: async (garantieId, montant, motif) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isSubmitting: true, error: null });

    if (!isRealApi) {
      const newOp: GarantieOperation = {
        id: Date.now(),
        garantieId,
        type: 'retrait',
        montant,
        date: new Date().toISOString().slice(0, 10),
        heure: new Date().toTimeString().slice(0, 5),
        operateur: 'MOCK',
        motif,
      };
      set((state) => ({
        operations: [...state.operations, newOp],
        isSubmitting: false,
      }));
      return { success: true };
    }

    try {
      await garantieApi.retrait(garantieId, { montant, motif });
      // Reload garantie and operations
      const state = get();
      await Promise.all([
        state.loadGarantie(garantieId),
        state.loadOperations(garantieId),
      ]);
      return { success: true };
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur retrait';
      set({ error: message });
      return { success: false, error: message };
    } finally {
      set({ isSubmitting: false });
    }
  },

  cancelGarantie: async (garantieId, motif) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isCancelling: true, error: null });

    if (!isRealApi) {
      set((state) => ({
        currentGarantie: state.currentGarantie
          ? { ...state.currentGarantie, statut: 'annulee' as const }
          : null,
        isCancelling: false,
      }));
      return { success: true };
    }

    try {
      await garantieApi.cancel(garantieId, { motif });
      // Reload garantie
      const state = get();
      await state.loadGarantie(garantieId);
      return { success: true };
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Erreur annulation garantie";
      set({ error: message });
      return { success: false, error: message };
    } finally {
      set({ isCancelling: false });
    }
  },

  reset: () => set({ ...initialState }),
}));
