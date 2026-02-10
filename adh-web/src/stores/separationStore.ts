import { create } from 'zustand';
import type {
  SeparationAccount,
  SeparationPreview,
  SeparationResult,
  SeparationProgress,
  SeparationStep,
} from '@/types/separation';
import { separationApi } from '@/services/api/endpoints-lot6';

interface SeparationState {
  compteSource: SeparationAccount | null;
  compteDestination: SeparationAccount | null;
  preview: SeparationPreview | null;
  result: SeparationResult | null;
  progress: SeparationProgress | null;
  currentStep: SeparationStep;
  searchResults: SeparationAccount[];
  isSearching: boolean;
  isValidating: boolean;
  isExecuting: boolean;
  error: string | null;
}

interface SeparationActions {
  searchAccount: (societe: string, query: string) => Promise<void>;
  selectSource: (account: SeparationAccount) => void;
  selectDestination: (account: SeparationAccount) => void;
  validateSeparation: (
    societe: string,
    operateur: string,
  ) => Promise<{ success: boolean; error?: string }>;
  executeSeparation: (
    societe: string,
    operateur: string,
  ) => Promise<{ success: boolean; error?: string }>;
  pollProgress: (operationId: string) => Promise<void>;
  setStep: (step: SeparationStep) => void;
  reset: () => void;
}

type SeparationStore = SeparationState & SeparationActions;

const MOCK_ACCOUNTS: SeparationAccount[] = [
  { codeAdherent: 1001, filiation: 0, nom: 'Dupont', prenom: 'Jean', societe: 'ADH', solde: 1250.00, nbTransactions: 45 },
  { codeAdherent: 1002, filiation: 0, nom: 'Martin', prenom: 'Marie', societe: 'ADH', solde: 890.50, nbTransactions: 23 },
  { codeAdherent: 1003, filiation: 1, nom: 'Durand', prenom: 'Pierre', societe: 'ADH', solde: 320.00, nbTransactions: 12 },
];

const initialState: SeparationState = {
  compteSource: null,
  compteDestination: null,
  preview: null,
  result: null,
  progress: null,
  currentStep: 'selection',
  searchResults: [],
  isSearching: false,
  isValidating: false,
  isExecuting: false,
  error: null,
};

export const useSeparationStore = create<SeparationStore>()((set, get) => ({
  ...initialState,

  searchAccount: async (societe, query) => {
    set({ isSearching: true, error: null });
    try {
      const response = await separationApi.searchAccount(societe, query);
      set({ searchResults: response.data.data ?? [] });
    } catch (e: unknown) {
      if (import.meta.env.DEV) {
        const filtered = MOCK_ACCOUNTS.filter(
          (a) =>
            a.nom.toLowerCase().includes(query.toLowerCase()) ||
            a.prenom.toLowerCase().includes(query.toLowerCase()) ||
            String(a.codeAdherent).includes(query),
        );
        set({ searchResults: filtered, error: null });
        return;
      }
      const message = e instanceof Error ? e.message : 'Erreur recherche compte';
      set({ searchResults: [], error: message });
    } finally {
      set({ isSearching: false });
    }
  },

  selectSource: (account) => {
    set({ compteSource: account });
  },

  selectDestination: (account) => {
    set({ compteDestination: account });
  },

  validateSeparation: async (societe, _operateur) => {
    const { compteSource, compteDestination } = get();
    if (!compteSource || !compteDestination) {
      return { success: false, error: 'Comptes source et destination requis' };
    }
    set({ isValidating: true, error: null });
    try {
      const response = await separationApi.validate({
        societe,
        codeAdherentSource: compteSource.codeAdherent,
        filiationSource: compteSource.filiation,
        codeAdherentDest: compteDestination.codeAdherent,
        filiationDest: compteDestination.filiation,
      });
      set({ preview: response.data.data ?? null, currentStep: 'preview' });
      return { success: true };
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur validation separation';
      set({ error: message });
      return { success: false, error: message };
    } finally {
      set({ isValidating: false });
    }
  },

  executeSeparation: async (societe, operateur) => {
    const { compteSource, compteDestination } = get();
    if (!compteSource || !compteDestination) {
      return { success: false, error: 'Comptes source et destination requis' };
    }
    set({ isExecuting: true, error: null, currentStep: 'processing' });
    try {
      const response = await separationApi.execute({
        societe,
        codeAdherentSource: compteSource.codeAdherent,
        filiationSource: compteSource.filiation,
        codeAdherentDest: compteDestination.codeAdherent,
        filiationDest: compteDestination.filiation,
        operateur,
      });
      const operationId = response.data.data?.operationId;
      if (operationId) {
        await get().pollProgress(operationId);
      }
      return { success: true };
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur execution separation';
      set({ error: message, currentStep: 'confirmation' });
      return { success: false, error: message };
    } finally {
      set({ isExecuting: false });
    }
  },

  pollProgress: async (operationId) => {
    try {
      const resultResponse = await separationApi.getResult(operationId);
      set({
        result: resultResponse.data.data ?? null,
        currentStep: 'result',
      });
    } catch {
      try {
        const progressResponse = await separationApi.getProgress(operationId);
        set({ progress: progressResponse.data.data ?? null });
      } catch {
        // Silently ignore progress polling errors
      }
    }
  },

  setStep: (step) => {
    set({ currentStep: step });
  },

  reset: () => set({ ...initialState }),
}));
