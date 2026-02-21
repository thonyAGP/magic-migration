import { create } from 'zustand';
import type {
  DenominationCount,
  SoldeParMOP,
  DeviseSession,
  SessionInfo,
  OuvertureTicketData,
  SessionStep,
  OpenSessionRequest,
  OpenSessionResponse,
  CheckConcurrentSessionsResponse,
  DenominationsConfigResponse,
  DevisesConfigResponse,
  PrintTicketRequest,
  PrintTicketResponse,
} from '@/types/sessionOuverture';
import { SESSION_STEPS } from '@/types/sessionOuverture';
import { apiClient } from '@/services/api/apiClient';
import { useDataSourceStore } from '@/stores/dataSourceStore';

interface SessionOuvertureState {
  currentStep: SessionStep;
  isLoading: boolean;
  error: string | null;
  comptage: DenominationCount[];
  devises: DeviseSession[];
  soldeParMOP: SoldeParMOP | null;
  sessionChrono: number | null;
  showConcurrentWarning: boolean;
  concurrentSessions: SessionInfo[];
  vilOpenSessions: boolean;
}

interface SessionOuvertureActions {
  initOuverture: () => Promise<void>;
  handleCountChange: (denominationId: number, count: number) => void;
  computeResults: () => SoldeParMOP;
  validateComptage: () => Promise<void>;
  executeOuverture: () => Promise<void>;
  handlePrint: () => Promise<void>;
  handleBack: () => void;
  checkConcurrentSessions: () => Promise<boolean>;
  setCurrentStep: (step: SessionStep) => void;
  setError: (error: string | null) => void;
  resetState: () => void;
}

type SessionOuvertureStore = SessionOuvertureState & SessionOuvertureActions;

const MOCK_DENOMINATIONS: DenominationCount[] = [
  { denominationId: 1, value: 500, count: 0, total: 0 },
  { denominationId: 2, value: 200, count: 0, total: 0 },
  { denominationId: 3, value: 100, count: 0, total: 0 },
  { denominationId: 4, value: 50, count: 0, total: 0 },
  { denominationId: 5, value: 20, count: 0, total: 0 },
  { denominationId: 6, value: 10, count: 0, total: 0 },
  { denominationId: 7, value: 5, count: 0, total: 0 },
  { denominationId: 8, value: 2, count: 0, total: 0 },
  { denominationId: 9, value: 1, count: 0, total: 0 },
  { denominationId: 10, value: 0.5, count: 0, total: 0 },
  { denominationId: 11, value: 0.2, count: 0, total: 0 },
  { denominationId: 12, value: 0.1, count: 0, total: 0 },
  { denominationId: 13, value: 0.05, count: 0, total: 0 },
  { denominationId: 14, value: 0.02, count: 0, total: 0 },
  { denominationId: 15, value: 0.01, count: 0, total: 0 },
];

const MOCK_DEVISES: DeviseSession[] = [
  {
    deviseCode: 'EUR',
    nbInitial: 1000,
    nbApport: 0,
    nbCompte: 0,
    nbCalcule: 0,
    nbEcart: 0,
    commentaireEcart: null,
    existeEcart: false,
  },
  {
    deviseCode: 'USD',
    nbInitial: 500,
    nbApport: 0,
    nbCompte: 0,
    nbCalcule: 0,
    nbEcart: 0,
    commentaireEcart: null,
    existeEcart: false,
  },
];

const MOCK_CONCURRENT_SESSIONS: SessionInfo[] = [];

const initialState: SessionOuvertureState = {
  currentStep: SESSION_STEPS.COMPTAGE,
  isLoading: false,
  error: null,
  comptage: [],
  devises: [],
  soldeParMOP: null,
  sessionChrono: null,
  showConcurrentWarning: false,
  concurrentSessions: [],
  vilOpenSessions: false,
};

export const useSessionOuvertureStore = create<SessionOuvertureStore>()((set, get) => ({
  ...initialState,

  initOuverture: async () => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isLoading: true, error: null });

    if (!isRealApi) {
      set({
        comptage: [...MOCK_DENOMINATIONS],
        devises: [...MOCK_DEVISES],
        isLoading: false,
        currentStep: SESSION_STEPS.COMPTAGE,
      });
      return;
    }

    try {
      const concurrentCheck = await get().checkConcurrentSessions();
      if (!concurrentCheck) {
        set({ isLoading: false });
        return;
      }

      const [denominationsRes, devisesRes] = await Promise.all([
        apiClient.get<DenominationsConfigResponse>('/api/config/denominations'),
        apiClient.get<DevisesConfigResponse>('/api/config/devises'),
      ]);

      const denominations = (denominationsRes.data.data ?? []).map((d) => ({
        denominationId: d.id,
        value: d.value,
        count: 0,
        total: 0,
      }));

      const devises = (devisesRes.data.data ?? []).map((d) => ({
        deviseCode: d.code,
        nbInitial: 0,
        nbApport: 0,
        nbCompte: 0,
        nbCalcule: 0,
        nbEcart: 0,
        commentaireEcart: null,
        existeEcart: false,
      }));

      set({
        comptage: denominations,
        devises,
        currentStep: SESSION_STEPS.COMPTAGE,
      });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur initialisation ouverture';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  handleCountChange: (denominationId, count) => {
    set((state) => {
      const updated = state.comptage.map((d) =>
        d.denominationId === denominationId
          ? { ...d, count, total: d.value * count }
          : d,
      );
      return { comptage: updated };
    });
    get().computeResults();
  },

  computeResults: () => {
    const { comptage } = get();
    const monnaie = comptage.reduce((sum, d) => sum + d.total, 0);
    const produits = 0;
    const cartes = 0;
    const cheques = 0;
    const od = 0;
    const total = monnaie + produits + cartes + cheques + od;

    const solde: SoldeParMOP = {
      monnaie,
      produits,
      cartes,
      cheques,
      od,
      total,
    };

    set({ soldeParMOP: solde });
    return solde;
  },

  validateComptage: async () => {
    const { comptage, soldeParMOP } = get();
    const hasCounts = comptage.some((d) => d.count > 0);

    if (!hasCounts) {
      set({ error: 'Aucune denomination comptee' });
      return;
    }

    if (!soldeParMOP || soldeParMOP.total <= 0) {
      set({ error: 'Le solde total doit etre superieur a 0' });
      return;
    }

    set({ currentStep: SESSION_STEPS.VALIDATION, error: null });
  },

  executeOuverture: async () => {
    const { isRealApi } = useDataSourceStore.getState();
    const { comptage, devises } = get();

    set({ isLoading: true, error: null, currentStep: SESSION_STEPS.OUVERTURE });

    if (!isRealApi) {
      const mockChrono = Math.floor(Math.random() * 1000) + 1;
      const mockSolde: SoldeParMOP = {
        monnaie: comptage.reduce((sum, d) => sum + d.total, 0),
        produits: 0,
        cartes: 0,
        cheques: 0,
        od: 0,
        total: comptage.reduce((sum, d) => sum + d.total, 0),
      };

      set({
        sessionChrono: mockChrono,
        soldeParMOP: mockSolde,
        currentStep: SESSION_STEPS.SUCCES,
        isLoading: false,
      });
      return;
    }

    try {
      const request: OpenSessionRequest = { comptage, devises };
      const response = await apiClient.post<OpenSessionResponse>('/api/session/open', request);

      const data = response.data.data;
      if (!data) {
        throw new Error('Reponse API invalide');
      }

      set({
        sessionChrono: data.chrono,
        soldeParMOP: data.soldeParMOP,
        devises: data.devises,
        currentStep: SESSION_STEPS.SUCCES,
      });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur ouverture session';
      set({ error: message, currentStep: SESSION_STEPS.VALIDATION });
    } finally {
      set({ isLoading: false });
    }
  },

  handlePrint: async () => {
    const { isRealApi } = useDataSourceStore.getState();
    const { sessionChrono, soldeParMOP, devises } = get();

    if (!sessionChrono || !soldeParMOP) {
      set({ error: 'Donnees session manquantes' });
      return;
    }

    set({ isLoading: true, error: null });

    const ticketData: OuvertureTicketData = {
      village: 'Village Test',
      dateComptable: new Date(),
      chrono: sessionChrono,
      soldeParMOP,
      devises,
    };

    if (!isRealApi) {
      set({ isLoading: false });
      return;
    }

    try {
      const request: PrintTicketRequest = {
        ticketType: 'ouverture',
        data: ticketData,
      };
      await apiClient.post<PrintTicketResponse>('/api/print/ticket', request);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur impression ticket';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  handleBack: () => {
    const { currentStep } = get();

    if (currentStep === SESSION_STEPS.COMPTAGE || currentStep === SESSION_STEPS.SUCCES) {
      return;
    }

    if (currentStep === SESSION_STEPS.VALIDATION) {
      set({ currentStep: SESSION_STEPS.COMPTAGE, error: null });
    }
  },

  checkConcurrentSessions: async () => {
    const { isRealApi } = useDataSourceStore.getState();

    if (!isRealApi) {
      set({
        showConcurrentWarning: false,
        concurrentSessions: MOCK_CONCURRENT_SESSIONS,
        vilOpenSessions: false,
      });
      return true;
    }

    try {
      const response = await apiClient.get<CheckConcurrentSessionsResponse>('/api/session/check-concurrent');
      const data = response.data.data;

      if (data?.hasOpen) {
        set({
          showConcurrentWarning: true,
          concurrentSessions: data.sessions,
          vilOpenSessions: data.vilOpenSessions,
        });
        return false;
      }

      set({
        showConcurrentWarning: false,
        concurrentSessions: [],
        vilOpenSessions: false,
      });
      return true;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur verification sessions';
      set({ error: message });
      return false;
    }
  },

  setCurrentStep: (step) => set({ currentStep: step }),

  setError: (error) => set({ error }),

  resetState: () => set({ ...initialState }),
}));