import { create } from 'zustand';
import type {
  ClubMedPass,
  PassTransaction,
  PassValidationResult,
  PassSummary,
} from '@/types/clubmedpass';
import { passApi } from '@/services/api/endpoints-lot5';

interface ClubMedPassState {
  currentPass: ClubMedPass | null;
  transactions: PassTransaction[];
  validationResult: PassValidationResult | null;
  summary: PassSummary | null;
  isValidating: boolean;
  isLoadingPass: boolean;
  isLoadingTransactions: boolean;
  isScanning: boolean;
  error: string | null;
}

interface ClubMedPassActions {
  validatePass: (
    numeroPass: string,
    montantTransaction: number,
    societe: string,
  ) => Promise<{ success: boolean; error?: string }>;
  loadPass: (numeroPass: string) => Promise<void>;
  loadTransactions: (numeroPass: string, limit?: number) => Promise<void>;
  scanCard: (
    numeroPass: string,
    societe: string,
  ) => Promise<{ success: boolean; error?: string }>;
  loadSummary: (societe: string) => Promise<void>;
  reset: () => void;
}

type ClubMedPassStore = ClubMedPassState & ClubMedPassActions;

const MOCK_PASS: ClubMedPass = {
  id: 1,
  numeroPass: 'CM-2026-001234',
  titulaire: 'Jean Dupont',
  societe: 'ADH',
  codeAdherent: 1001,
  filiation: 0,
  statut: 'active',
  solde: 250.0,
  devise: 'EUR',
  limitJournaliere: 500,
  limitHebdomadaire: 2000,
  dateExpiration: '2026-12-31',
  derniereUtilisation: '2026-02-09',
};

const initialState: ClubMedPassState = {
  currentPass: null,
  transactions: [],
  validationResult: null,
  summary: null,
  isValidating: false,
  isLoadingPass: false,
  isLoadingTransactions: false,
  isScanning: false,
  error: null,
};

export const useClubMedPassStore = create<ClubMedPassStore>()((set, get) => ({
  ...initialState,

  validatePass: async (numeroPass, montantTransaction, societe) => {
    set({ isValidating: true, error: null });
    try {
      const response = await passApi.validate({
        numeroPass,
        montantTransaction,
        societe,
      });
      set({ validationResult: response.data.data ?? null });
      return { success: true };
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : 'Erreur validation pass';
      set({ error: message });
      return { success: false, error: message };
    } finally {
      set({ isValidating: false });
    }
  },

  loadPass: async (numeroPass) => {
    set({ isLoadingPass: true, error: null });
    try {
      const response = await passApi.getByNumber(numeroPass);
      const pass = response.data.data;
      set({ currentPass: pass ?? MOCK_PASS });
    } catch {
      set({ currentPass: MOCK_PASS, error: 'Mode dev: pass mock charge' });
    } finally {
      set({ isLoadingPass: false });
    }
  },

  loadTransactions: async (numeroPass, limit) => {
    set({ isLoadingTransactions: true });
    try {
      const response = await passApi.getTransactions(numeroPass, limit);
      set({ transactions: response.data.data ?? [] });
    } catch {
      set({ transactions: [] });
    } finally {
      set({ isLoadingTransactions: false });
    }
  },

  scanCard: async (numeroPass, societe) => {
    set({ isScanning: true, error: null });
    try {
      const response = await passApi.scan({ numeroPass, societe });
      const pass = response.data.data;
      set({ currentPass: pass ?? MOCK_PASS });
      // Load transactions after scan
      const state = get();
      await state.loadTransactions(numeroPass);
      return { success: true };
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur scan pass';
      set({ currentPass: MOCK_PASS, error: message });
      return { success: false, error: message };
    } finally {
      set({ isScanning: false });
    }
  },

  loadSummary: async (societe) => {
    try {
      const response = await passApi.getSummary(societe);
      set({ summary: response.data.data ?? null });
    } catch {
      set({ summary: null });
    }
  },

  reset: () => set({ ...initialState }),
}));
