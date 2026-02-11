import { create } from 'zustand';
import type {
  SeparationAccount,
  SeparationPreview,
  SeparationResult,
  SeparationProgress,
  SeparationStep,
} from '@/types/separation';
import type { Filiation } from '@/components/caisse/separation/types';
import { separationApi } from '@/services/api/endpoints-lot6';
import { useDataSourceStore } from './dataSourceStore';
import { useSessionStore } from './sessionStore';

interface PrerequisiteCheck {
  canProceed: boolean;
  warnings: string[];
}

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
  prerequisites: PrerequisiteCheck | null;
  filiations: Filiation[];
  failedStep: { name: string; error: string } | null;
}

interface SeparationActions {
  checkPrerequisites: () => Promise<PrerequisiteCheck>;
  searchAccount: (societe: string, query: string) => Promise<void>;
  selectSource: (account: SeparationAccount) => void;
  selectDestination: (account: SeparationAccount) => void;
  loadFiliations: (accountId: string) => Promise<void>;
  validateSeparation: (
    societe: string,
    operateur: string,
  ) => Promise<{ success: boolean; error?: string }>;
  executeSeparation: (
    societe: string,
    operateur: string,
  ) => Promise<{ success: boolean; error?: string }>;
  pollProgress: (operationId: string) => Promise<void>;
  retryFailedStep: () => void;
  markFailedStepDone: () => void;
  skipFailedStep: () => void;
  setStep: (step: SeparationStep) => void;
  reset: () => void;
}

type SeparationStore = SeparationState & SeparationActions;

const MOCK_ACCOUNTS: SeparationAccount[] = [
  { codeAdherent: 1001, filiation: 0, nom: 'Dupont', prenom: 'Jean', societe: 'ADH', solde: 1250.00, nbTransactions: 45 },
  { codeAdherent: 1002, filiation: 0, nom: 'Martin', prenom: 'Marie', societe: 'ADH', solde: 890.50, nbTransactions: 23 },
  { codeAdherent: 1003, filiation: 1, nom: 'Durand', prenom: 'Pierre', societe: 'ADH', solde: 320.00, nbTransactions: 12 },
];

const MOCK_FILIATIONS: Record<string, Filiation[]> = {
  '1001': [
    { id: 'fil-1', nom: 'Dupont', prenom: 'Sophie', typeRelation: 'conjoint', compteId: '1001-1' },
    { id: 'fil-2', nom: 'Dupont', prenom: 'Lucas', typeRelation: 'enfant', compteId: '1001-2' },
  ],
  '1002': [
    { id: 'fil-3', nom: 'Martin', prenom: 'Paul', typeRelation: 'parent', compteId: '1002-1' },
  ],
  '1003': [],
};

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
  prerequisites: null,
  filiations: [],
  failedStep: null,
};

export const useSeparationStore = create<SeparationStore>()((set, get) => ({
  ...initialState,

  checkPrerequisites: async (): Promise<PrerequisiteCheck> => {
    const warnings: string[] = [];
    const session = useSessionStore.getState().currentSession;

    if (!session || useSessionStore.getState().status !== 'open') {
      warnings.push('Aucune session ouverte. Veuillez ouvrir une session avant de proceder.');
    }

    const closureResult = await useSessionStore.getState().checkNetworkClosure();
    if (closureResult.status !== 'completed') {
      warnings.push('La cloture reseau n\'est pas effectuee. Certaines operations pourraient etre incompletes.');
    }

    const result: PrerequisiteCheck = {
      canProceed: true,
      warnings,
    };
    set({ prerequisites: result });
    return result;
  },

  loadFiliations: async (accountId: string) => {
    const { isRealApi } = useDataSourceStore.getState();

    if (!isRealApi) {
      const filiations = MOCK_FILIATIONS[accountId] ?? [];
      set({ filiations });
      return;
    }

    try {
      const response = await separationApi.searchAccount('ADH', accountId);
      // API would return filiations; for now use empty array in real mode
      set({ filiations: (response.data as unknown as { filiations?: Filiation[] })?.filiations ?? [] });
    } catch {
      set({ filiations: [] });
    }
  },

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
      const response = await separationApi.searchAccount(societe, query);
      set({ searchResults: response.data.data ?? [], isSearching: false });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur recherche compte';
      set({ searchResults: [], error: message, isSearching: false });
    }
  },

  selectSource: (account) => {
    set({ compteSource: account, filiations: [] });
    if (account) {
      get().loadFiliations(String(account.codeAdherent));
    }
  },

  selectDestination: (account) => {
    set({ compteDestination: account });
  },

  validateSeparation: async (societe, _operateur) => {
    const { compteSource, compteDestination } = get();
    if (!compteSource || !compteDestination) {
      return { success: false, error: 'Comptes source et destination requis' };
    }

    const { isRealApi } = useDataSourceStore.getState();
    set({ isValidating: true, error: null });

    if (!isRealApi) {
      const mockPreview: SeparationPreview = {
        compteSource,
        compteDestination,
        nbOperationsADeplacer: 15,
        montantADeplacer: 450.00,
        garantiesImpactees: 0,
        avertissements: [],
      };
      set({ preview: mockPreview, currentStep: 'preview', isValidating: false });
      return { success: true };
    }

    try {
      const response = await separationApi.validate({
        societe,
        codeAdherentSource: compteSource.codeAdherent,
        filiationSource: compteSource.filiation,
        codeAdherentDest: compteDestination.codeAdherent,
        filiationDest: compteDestination.filiation,
      });
      set({ preview: response.data.data ?? null, currentStep: 'preview', isValidating: false });
      return { success: true };
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur validation separation';
      set({ error: message, isValidating: false });
      return { success: false, error: message };
    }
  },

  executeSeparation: async (societe, operateur) => {
    const { compteSource, compteDestination } = get();
    if (!compteSource || !compteDestination) {
      return { success: false, error: 'Comptes source et destination requis' };
    }

    const { isRealApi } = useDataSourceStore.getState();
    set({ isExecuting: true, error: null, currentStep: 'processing' });

    if (!isRealApi) {
      const mockResult: SeparationResult = {
        success: true,
        compteSource,
        compteDestination,
        nbOperationsDeplacees: 15,
        montantDeplace: 450.00,
        message: 'Separation effectuee avec succes',
        dateExecution: new Date().toISOString(),
      };
      set({ result: mockResult, currentStep: 'result', isExecuting: false });
      return { success: true };
    }

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
      set({
        error: message,
        failedStep: { name: 'Execution separation', error: message },
        isExecuting: false,
      });
      return { success: false, error: message };
    }
  },

  pollProgress: async (operationId) => {
    const { isRealApi } = useDataSourceStore.getState();

    if (!isRealApi) {
      const { compteSource, compteDestination } = get();
      const mockResult: SeparationResult = {
        success: true,
        compteSource: compteSource!,
        compteDestination: compteDestination!,
        nbOperationsDeplacees: 15,
        montantDeplace: 450.00,
        message: 'Separation effectuee avec succes',
        dateExecution: new Date().toISOString(),
      };
      set({ result: mockResult, currentStep: 'result' });
      return;
    }

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

  retryFailedStep: () => {
    set({ failedStep: null, error: null });
    // Re-trigger execution - caller will handle
  },

  markFailedStepDone: () => {
    const { compteSource, compteDestination } = get();
    const mockResult: SeparationResult = {
      success: true,
      compteSource: compteSource!,
      compteDestination: compteDestination!,
      nbOperationsDeplacees: 0,
      montantDeplace: 0,
      message: 'Separation marquee comme terminee manuellement',
      dateExecution: new Date().toISOString(),
    };
    set({ failedStep: null, result: mockResult, currentStep: 'result', isExecuting: false });
  },

  skipFailedStep: () => {
    const { compteSource, compteDestination } = get();
    const mockResult: SeparationResult = {
      success: false,
      compteSource: compteSource!,
      compteDestination: compteDestination!,
      nbOperationsDeplacees: 0,
      montantDeplace: 0,
      message: 'Operation passee par l\'operateur',
      dateExecution: new Date().toISOString(),
    };
    set({ failedStep: null, result: mockResult, currentStep: 'result', isExecuting: false });
  },

  setStep: (step) => {
    set({ currentStep: step });
  },

  reset: () => set({ ...initialState }),
}));
