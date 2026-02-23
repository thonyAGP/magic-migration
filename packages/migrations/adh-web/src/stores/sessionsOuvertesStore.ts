import { create } from 'zustand';
import type {
  SessionOuverte,
  SessionsOuvertesState,
  GetSessionsOuvertesRequest,
  GetSessionsOuvertesResponse,
  VerifierExistenceSessionResponse,
} from '@/types/sessionsOuvertes';
import { apiClient } from '@/services/api/apiClient';
import type { ApiResponse } from '@/services/api/apiClient';
import { useDataSourceStore } from '@/stores/dataSourceStore';

interface SessionsOuvertesActions {
  chargerSessionsOuvertes: (societe?: string, operateur?: string) => Promise<void>;
  selectionnerSession: (session: SessionOuverte) => void;
  verifierExistenceSession: (numeroSession: number) => Promise<boolean>;
  rafraichir: () => Promise<void>;
  appliquerFiltres: (societe: string, operateur: string) => Promise<void>;
  reset: () => void;
}

type SessionsOuvertesStore = SessionsOuvertesState & SessionsOuvertesActions;

const MOCK_SESSIONS: SessionOuverte[] = [
  {
    societe: 'SMRNS1',
    compte: 'CAI001',
    filiation: 0,
    numeroSession: 1001,
    operateur: 'MARTIN S.',
    deviseLocale: 'EUR',
    montantCoffre: 1500,
    dateOuverture: new Date('2026-02-21T08:00:00'),
    heureOuverture: '08:00',
  },
  {
    societe: 'SMRNS1',
    compte: 'CAI002',
    filiation: 0,
    numeroSession: 1002,
    operateur: 'DUPONT J.',
    deviseLocale: 'EUR',
    montantCoffre: 2000,
    dateOuverture: new Date('2026-02-21T08:15:00'),
    heureOuverture: '08:15',
  },
  {
    societe: 'SMRNS2',
    compte: 'CAI003',
    filiation: 0,
    numeroSession: 1003,
    operateur: 'BERNARD M.',
    deviseLocale: 'USD',
    montantCoffre: 3000,
    dateOuverture: new Date('2026-02-21T09:00:00'),
    heureOuverture: '09:00',
  },
  {
    societe: 'SMRNS1',
    compte: 'CAI004',
    filiation: 1,
    numeroSession: 1004,
    operateur: 'MARTIN S.',
    deviseLocale: 'EUR',
    montantCoffre: 500,
    dateOuverture: new Date('2026-02-21T10:30:00'),
    heureOuverture: '10:30',
  },
  {
    societe: 'SMRNS2',
    compte: 'CAI005',
    filiation: 0,
    numeroSession: 1005,
    operateur: 'LECLERC A.',
    deviseLocale: 'GBP',
    montantCoffre: 2500,
    dateOuverture: new Date('2026-02-21T11:00:00'),
    heureOuverture: '11:00',
  },
  {
    societe: 'SMRNS1',
    compte: 'CAI006',
    filiation: 0,
    numeroSession: 1006,
    operateur: 'DUPONT J.',
    deviseLocale: 'EUR',
    montantCoffre: 1800,
    dateOuverture: new Date('2026-02-22T08:00:00'),
    heureOuverture: '08:00',
  },
  {
    societe: 'SMRNS2',
    compte: 'CAI007',
    filiation: 0,
    numeroSession: 1007,
    operateur: 'BERNARD M.',
    deviseLocale: 'USD',
    montantCoffre: 5000,
    dateOuverture: new Date('2026-02-22T08:30:00'),
    heureOuverture: '08:30',
  },
  {
    societe: 'SMRNS1',
    compte: 'CAI008',
    filiation: 0,
    numeroSession: 1008,
    operateur: 'LECLERC A.',
    deviseLocale: 'EUR',
    montantCoffre: 1200,
    dateOuverture: new Date('2026-02-22T09:15:00'),
    heureOuverture: '09:15',
  },
];

const initialState: SessionsOuvertesState = {
  sessions: [],
  isLoading: false,
  error: null,
  selectedSession: null,
  filtreSociete: '',
  filtreOperateur: '',
  chargerSessionsOuvertes: async () => {},
  selectionnerSession: () => {},
  verifierExistenceSession: async () => false,
  rafraichir: async () => {},
  appliquerFiltres: async () => {},
};

export const useSessionsOuvertesStore = create<SessionsOuvertesStore>()((set, get) => ({
  ...initialState,

  chargerSessionsOuvertes: async (societe, operateur) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isLoading: true, error: null });

    if (!isRealApi) {
      let filtered = [...MOCK_SESSIONS];

      if (societe) {
        filtered = filtered.filter((s) => s.societe === societe);
      }
      if (operateur) {
        filtered = filtered.filter((s) => s.operateur === operateur);
      }

      filtered.sort((a, b) => a.dateOuverture.getTime() - b.dateOuverture.getTime());

      set({ sessions: filtered, isLoading: false });
      return;
    }

    try {
      const params: GetSessionsOuvertesRequest = {};
      if (societe) params.societe = societe;
      if (operateur) params.operateur = operateur;

      const response = await apiClient.get<ApiResponse<GetSessionsOuvertesResponse>>(
        '/api/sessions/ouvertes',
        { params },
      );

      const sessionsData = response.data.data?.sessions ?? [];
      const sessions = sessionsData.map((s) => ({
        ...s,
        dateOuverture: new Date(s.dateOuverture),
      }));

      sessions.sort((a, b) => a.dateOuverture.getTime() - b.dateOuverture.getTime());

      set({ sessions });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur chargement sessions ouvertes';
      set({ sessions: [], error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  selectionnerSession: (session) => {
    set({ selectedSession: session, error: null });
  },

  verifierExistenceSession: async (numeroSession) => {
    const { isRealApi } = useDataSourceStore.getState();

    if (!isRealApi) {
      return MOCK_SESSIONS.some((s) => s.numeroSession === numeroSession);
    }

    try {
      const response = await apiClient.get<ApiResponse<VerifierExistenceSessionResponse>>(
        `/api/sessions/existe/${numeroSession}`,
      );
      return response.data.data?.existe ?? false;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur vérification session';
      set({ error: message });
      return false;
    }
  },

  rafraichir: async () => {
    const { filtreSociete, filtreOperateur } = get();
    await get().chargerSessionsOuvertes(
      filtreSociete || undefined,
      filtreOperateur || undefined,
    );
  },

  appliquerFiltres: async (societe, operateur) => {
    set({ filtreSociete: societe, filtreOperateur: operateur });
    await get().chargerSessionsOuvertes(societe || undefined, operateur || undefined);
  },

  reset: () => set({ ...initialState }),
}));