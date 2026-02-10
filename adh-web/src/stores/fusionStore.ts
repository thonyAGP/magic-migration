import { create } from 'zustand';
import type {
  FusionAccount,
  FusionPreview,
  FusionResult,
  FusionProgress,
  FusionStep,
} from '@/types/fusion';
import { fusionApi } from '@/services/api/endpoints-lot6';
import { useDataSourceStore } from './dataSourceStore';

interface FusionState {
  comptePrincipal: FusionAccount | null;
  compteSecondaire: FusionAccount | null;
  preview: FusionPreview | null;
  result: FusionResult | null;
  progress: FusionProgress | null;
  currentStep: FusionStep;
  searchResults: FusionAccount[];
  isSearching: boolean;
  isValidating: boolean;
  isExecuting: boolean;
  error: string | null;
}

interface FusionActions {
  searchAccount: (societe: string, query: string) => Promise<void>;
  selectPrincipal: (account: FusionAccount) => void;
  selectSecondaire: (account: FusionAccount) => void;
  validateFusion: (
    societe: string,
    operateur: string,
  ) => Promise<{ success: boolean; error?: string }>;
  executeFusion: (
    societe: string,
    operateur: string,
  ) => Promise<{ success: boolean; error?: string }>;
  pollProgress: (operationId: string) => Promise<void>;
  setStep: (step: FusionStep) => void;
  reset: () => void;
}

type FusionStore = FusionState & FusionActions;

const MOCK_ACCOUNTS: FusionAccount[] = [
  { codeAdherent: 1001, filiation: 0, nom: 'Dupont', prenom: 'Jean', societe: 'ADH', solde: 1250.00, nbTransactions: 45, nbGaranties: 2 },
  { codeAdherent: 1002, filiation: 0, nom: 'Martin', prenom: 'Marie', societe: 'ADH', solde: 890.50, nbTransactions: 23, nbGaranties: 0 },
  { codeAdherent: 1003, filiation: 1, nom: 'Durand', prenom: 'Pierre', societe: 'ADH', solde: 320.00, nbTransactions: 12, nbGaranties: 1 },
];

const initialState: FusionState = {
  comptePrincipal: null,
  compteSecondaire: null,
  preview: null,
  result: null,
  progress: null,
  currentStep: 'selection_principal',
  searchResults: [],
  isSearching: false,
  isValidating: false,
  isExecuting: false,
  error: null,
};

export const useFusionStore = create<FusionStore>()((set, get) => ({
  ...initialState,

  searchAccount: async (societe, query) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isSearching: true, error: null });

    if (!isRealApi) {
      const filtered = MOCK_ACCOUNTS.filter(
        (a) =>
          a.nom.toLowerCase().includes(query.toLowerCase()) ||
          a.prenom.toLowerCase().includes(query.toLowerCase()) ||
          String(a.codeAdherent).includes(query),
      );
      set({ searchResults: filtered, isSearching: false });
      return;
    }

    try {
      const response = await fusionApi.searchAccount(societe, query);
      set({ searchResults: response.data.data ?? [], isSearching: false });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur recherche compte';
      set({ searchResults: [], error: message, isSearching: false });
    }
  },

  selectPrincipal: (account) => {
    set({ comptePrincipal: account });
  },

  selectSecondaire: (account) => {
    set({ compteSecondaire: account });
  },

  validateFusion: async (societe, _operateur) => {
    const { comptePrincipal, compteSecondaire } = get();
    if (!comptePrincipal || !compteSecondaire) {
      return { success: false, error: 'Comptes principal et secondaire requis' };
    }

    const { isRealApi } = useDataSourceStore.getState();
    set({ isValidating: true, error: null });

    if (!isRealApi) {
      const mockPreview: FusionPreview = {
        comptePrincipal,
        compteSecondaire,
        nbOperationsAFusionner: compteSecondaire.nbTransactions,
        montantTotal: comptePrincipal.solde + compteSecondaire.solde,
        garantiesATransferer: compteSecondaire.nbGaranties,
        conflits: [],
        avertissements: [],
      };
      set({ preview: mockPreview, currentStep: 'preview', isValidating: false });
      return { success: true };
    }

    try {
      const response = await fusionApi.validate({
        societe,
        codeAdherentPrincipal: comptePrincipal.codeAdherent,
        filiationPrincipal: comptePrincipal.filiation,
        codeAdherentSecondaire: compteSecondaire.codeAdherent,
        filiationSecondaire: compteSecondaire.filiation,
      });
      set({ preview: response.data.data ?? null, currentStep: 'preview', isValidating: false });
      return { success: true };
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur validation fusion';
      set({ error: message, isValidating: false });
      return { success: false, error: message };
    }
  },

  executeFusion: async (societe, operateur) => {
    const { comptePrincipal, compteSecondaire } = get();
    if (!comptePrincipal || !compteSecondaire) {
      return { success: false, error: 'Comptes principal et secondaire requis' };
    }

    const { isRealApi } = useDataSourceStore.getState();
    set({ isExecuting: true, error: null, currentStep: 'processing' });

    if (!isRealApi) {
      const mockResult: FusionResult = {
        success: true,
        compteFinal: { ...comptePrincipal, solde: comptePrincipal.solde + compteSecondaire.solde, nbTransactions: comptePrincipal.nbTransactions + compteSecondaire.nbTransactions, nbGaranties: comptePrincipal.nbGaranties + compteSecondaire.nbGaranties },
        nbOperationsFusionnees: compteSecondaire.nbTransactions,
        nbGarantiesTransferees: compteSecondaire.nbGaranties,
        message: 'Fusion effectuee avec succes',
        dateExecution: new Date().toISOString(),
      };
      set({ result: mockResult, currentStep: 'result', isExecuting: false });
      return { success: true };
    }

    try {
      const response = await fusionApi.execute({
        societe,
        codeAdherentPrincipal: comptePrincipal.codeAdherent,
        filiationPrincipal: comptePrincipal.filiation,
        codeAdherentSecondaire: compteSecondaire.codeAdherent,
        filiationSecondaire: compteSecondaire.filiation,
        operateur,
      });
      const operationId = response.data.data?.operationId;
      if (operationId) {
        await get().pollProgress(operationId);
      }
      return { success: true };
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur execution fusion';
      set({ error: message, currentStep: 'confirmation', isExecuting: false });
      return { success: false, error: message };
    }
  },

  pollProgress: async (operationId) => {
    const { isRealApi } = useDataSourceStore.getState();

    if (!isRealApi) {
      const { comptePrincipal, compteSecondaire } = get();
      const mockResult: FusionResult = {
        success: true,
        compteFinal: comptePrincipal!,
        nbOperationsFusionnees: compteSecondaire?.nbTransactions ?? 0,
        nbGarantiesTransferees: compteSecondaire?.nbGaranties ?? 0,
        message: 'Fusion effectuee avec succes',
        dateExecution: new Date().toISOString(),
      };
      set({ result: mockResult, currentStep: 'result' });
      return;
    }

    try {
      const resultResponse = await fusionApi.getResult(operationId);
      set({
        result: resultResponse.data.data ?? null,
        currentStep: 'result',
      });
    } catch {
      try {
        const progressResponse = await fusionApi.getProgress(operationId);
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
