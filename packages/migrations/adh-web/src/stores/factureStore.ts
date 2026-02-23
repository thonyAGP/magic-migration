import { create } from 'zustand';
import type {
  Facture,
  FactureSummary,
  FactureSearchResult,
  FactureType,
} from '@/types/facture';
import { factureApi } from '@/services/api/endpoints-lot4';
import { useDataSourceStore } from './dataSourceStore';

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

const MOCK_FACTURE: Facture = {
  id: 1,
  reference: 'FAC-2026-0001',
  societe: 'SOC1',
  codeAdherent: 1001,
  filiation: 0,
  nomAdherent: 'DUPONT Jean',
  type: 'facture',
  statut: 'brouillon',
  dateEmission: '2026-02-10',
  dateEcheance: '2026-03-10',
  lignes: [
    { id: 1, factureId: 1, codeArticle: 'ART01', libelle: 'Prestation spa', quantite: 2, prixUnitaireHT: 50, tauxTVA: 20, montantHT: 100, montantTVA: 20, montantTTC: 120 },
    { id: 2, factureId: 1, codeArticle: 'ART02', libelle: 'Massage relaxant', quantite: 1, prixUnitaireHT: 80, tauxTVA: 20, montantHT: 80, montantTVA: 16, montantTTC: 96 },
  ],
  totalHT: 180,
  totalTVA: 36,
  totalTTC: 216,
  devise: 'EUR',
  commentaire: '',
  operateur: 'CAISSIER1',
};

const MOCK_SEARCH: FactureSearchResult = {
  factures: [MOCK_FACTURE],
  total: 1,
};

const _MOCK_SUMMARY: FactureSummary = {
  totalHT: 180,
  totalTVA: 36,
  totalTTC: 216,
  ventilationTVA: [{ tauxTVA: 20, baseHT: 180, montantTVA: 36 }],
};

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
    const { isRealApi } = useDataSourceStore.getState();
    set({ isSearching: true, error: null });

    if (!isRealApi) {
      const filtered = query
        ? MOCK_SEARCH.factures.filter(
            (f) =>
              f.reference.toLowerCase().includes(query.toLowerCase()) ||
              f.nomAdherent.toLowerCase().includes(query.toLowerCase()),
          )
        : MOCK_SEARCH.factures;
      set({ searchResults: { factures: filtered, total: filtered.length }, isSearching: false });
      return;
    }

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
    const { isRealApi } = useDataSourceStore.getState();
    set({ isLoadingFacture: true, error: null });

    if (!isRealApi) {
      set({ currentFacture: { ...MOCK_FACTURE, id }, isLoadingFacture: false });
      return;
    }

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
    const { isRealApi } = useDataSourceStore.getState();
    set({ isSubmitting: true, error: null });

    if (!isRealApi) {
      const mockId = Date.now();
      const mockRef = `FAC-2026-${String(mockId).slice(-4)}`;
      set({ isSubmitting: false });
      return { success: true, id: mockId, reference: mockRef };
    }

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
    const { isRealApi } = useDataSourceStore.getState();
    set({ isSubmitting: true, error: null });

    if (!isRealApi) {
      const mockSummary: FactureSummary = {
        totalHT: lignes.reduce((sum, l) => sum + l.quantite * l.prixUnitaireHT, 0),
        totalTVA: lignes.reduce((sum, l) => sum + l.quantite * l.prixUnitaireHT * l.tauxTVA / 100, 0),
        totalTTC: lignes.reduce((sum, l) => sum + l.quantite * l.prixUnitaireHT * (1 + l.tauxTVA / 100), 0),
        ventilationTVA: [],
      };
      set({ summary: mockSummary, isSubmitting: false });
      return { success: true };
    }

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
    const { isRealApi } = useDataSourceStore.getState();
    set({ isValidating: true, error: null });

    if (!isRealApi) {
      set((state) => ({
        currentFacture: state.currentFacture
          ? { ...state.currentFacture, statut: 'emise' as const }
          : null,
        isValidating: false,
      }));
      return { success: true };
    }

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
    const { isRealApi } = useDataSourceStore.getState();
    set({ isCancelling: true, error: null });

    if (!isRealApi) {
      set((state) => ({
        currentFacture: state.currentFacture
          ? { ...state.currentFacture, statut: 'annulee' as const }
          : null,
        isCancelling: false,
      }));
      return { success: true };
    }

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
    const { isRealApi } = useDataSourceStore.getState();
    set({ isPrinting: true, error: null });

    if (!isRealApi) {
      set({ isPrinting: false });
      return;
    }

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
