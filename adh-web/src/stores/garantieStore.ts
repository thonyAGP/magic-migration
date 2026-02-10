import { create } from 'zustand';
import type {
  Garantie,
  GarantieOperation,
  GarantieSummaryData,
  GarantieSearchResult,
} from '@/types/garantie';
import { garantieApi } from '@/services/api/endpoints-lot4';

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
    set({ isSearching: true, error: null });
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
    set({ isLoadingGarantie: true, error: null });
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
    set({ isLoadingOperations: true });
    try {
      const response = await garantieApi.getOperations(garantieId);
      set({ operations: response.data.data ?? [] });
    } catch {
      set({ operations: [] });
    } finally {
      set({ isLoadingOperations: false });
    }
  },

  loadSummary: async (societe) => {
    set({ isLoadingSummary: true });
    try {
      const response = await garantieApi.getSummary(societe);
      set({ summary: response.data.data ?? null });
    } catch {
      set({ summary: null });
    } finally {
      set({ isLoadingSummary: false });
    }
  },

  createDepot: async (data) => {
    set({ isSubmitting: true, error: null });
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
    set({ isSubmitting: true, error: null });
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
    set({ isSubmitting: true, error: null });
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
    set({ isCancelling: true, error: null });
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
