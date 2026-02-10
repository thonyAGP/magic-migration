import { create } from 'zustand';
import type {
  Facture,
  FactureSummary,
  FactureSearchResult,
  FactureType,
} from '@/types/facture';
import { factureApi } from '@/services/api/endpoints-lot4';

interface FactureState {
  currentFacture: Facture | null;
  searchResults: FactureSearchResult | null;
  summary: FactureSummary | null;
  isSearching: boolean;
  isLoadingFacture: boolean;
  isSubmitting: boolean;
  isValidating: boolean;
  isCancelling: boolean;
  isPrinting: boolean;
  error: string | null;
}

interface FactureActions {
  searchFactures: (
    societe: string,
    query?: string,
    dateDebut?: string,
    dateFin?: string,
  ) => Promise<void>;
  loadFacture: (id: number) => Promise<void>;
  createFacture: (data: {
    societe: string;
    codeAdherent: number;
    filiation: number;
    type: FactureType;
    commentaire?: string;
  }) => Promise<{ success: boolean; id?: number; reference?: string; error?: string }>;
  updateLignes: (
    factureId: number,
    lignes: Array<{
      codeArticle: string;
      libelle: string;
      quantite: number;
      prixUnitaireHT: number;
      tauxTVA: number;
    }>,
  ) => Promise<{ success: boolean; error?: string }>;
  validateFacture: (
    factureId: number,
    commentaire?: string,
  ) => Promise<{ success: boolean; error?: string }>;
  cancelFacture: (
    factureId: number,
    motif: string,
  ) => Promise<{ success: boolean; error?: string }>;
  printFacture: (factureId: number) => Promise<void>;
  reset: () => void;
}

type FactureStore = FactureState & FactureActions;

const initialState: FactureState = {
  currentFacture: null,
  searchResults: null,
  summary: null,
  isSearching: false,
  isLoadingFacture: false,
  isSubmitting: false,
  isValidating: false,
  isCancelling: false,
  isPrinting: false,
  error: null,
};

export const useFactureStore = create<FactureStore>()((set, get) => ({
  ...initialState,

  searchFactures: async (societe, query, dateDebut, dateFin) => {
    set({ isSearching: true, error: null });
    try {
      const response = await factureApi.search(societe, query, dateDebut, dateFin);
      set({ searchResults: response.data.data ?? null });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur recherche factures';
      set({ searchResults: null, error: message });
    } finally {
      set({ isSearching: false });
    }
  },

  loadFacture: async (id) => {
    set({ isLoadingFacture: true, error: null });
    try {
      const response = await factureApi.getById(id);
      set({ currentFacture: response.data.data ?? null });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur chargement facture';
      set({ currentFacture: null, error: message });
    } finally {
      set({ isLoadingFacture: false });
    }
  },

  createFacture: async (data) => {
    set({ isSubmitting: true, error: null });
    try {
      const response = await factureApi.create(data);
      const result = response.data.data;
      return {
        success: true,
        id: result?.id,
        reference: result?.reference,
      };
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur creation facture';
      set({ error: message });
      return { success: false, error: message };
    } finally {
      set({ isSubmitting: false });
    }
  },

  updateLignes: async (factureId, lignes) => {
    set({ isSubmitting: true, error: null });
    try {
      const response = await factureApi.updateLignes(factureId, { lignes });
      set({ summary: response.data.data ?? null });
      // Reload facture to get updated lignes
      const state = get();
      await state.loadFacture(factureId);
      return { success: true };
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur mise a jour lignes';
      set({ error: message });
      return { success: false, error: message };
    } finally {
      set({ isSubmitting: false });
    }
  },

  validateFacture: async (factureId, commentaire) => {
    set({ isValidating: true, error: null });
    try {
      await factureApi.validate(factureId, { commentaire });
      // Reload facture to get updated status
      const state = get();
      await state.loadFacture(factureId);
      return { success: true };
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur validation facture';
      set({ error: message });
      return { success: false, error: message };
    } finally {
      set({ isValidating: false });
    }
  },

  cancelFacture: async (factureId, motif) => {
    set({ isCancelling: true, error: null });
    try {
      await factureApi.cancel(factureId, motif);
      // Reload facture to get updated status
      const state = get();
      await state.loadFacture(factureId);
      return { success: true };
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur annulation facture';
      set({ error: message });
      return { success: false, error: message };
    } finally {
      set({ isCancelling: false });
    }
  },

  printFacture: async (factureId) => {
    set({ isPrinting: true, error: null });
    try {
      await factureApi.print(factureId);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur impression facture';
      set({ error: message });
    } finally {
      set({ isPrinting: false });
    }
  },

  reset: () => set({ ...initialState }),
}));
