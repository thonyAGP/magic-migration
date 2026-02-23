import { create } from 'zustand';
import type {
  Session,
  SessionFilter,
  GetSessionsListRequest,
  GetSessionsListResponse,
} from '@/types/sessionList';
import { apiClient } from '@/services/api/apiClient';
import type { ApiResponse } from '@/services/api/apiClient';
import { useDataSourceStore } from '@/stores/dataSourceStore';

interface SessionListState {
  sessions: Session[];
  isLoading: boolean;
  error: string | null;
  filters: SessionFilter;
}

interface SessionListActions {
  fetchSessions: (filters: SessionFilter) => Promise<void>;
  setFilters: (filters: Partial<SessionFilter>) => void;
  clearError: () => void;
  reset: () => void;
}

type SessionListStore = SessionListState & SessionListActions;

const MOCK_SESSIONS: Session[] = [
  {
    id: 1,
    societe: 'CAI001',
    caisse: 'CAISSE_01',
    operateur: 'MARTIN',
    dateOuverture: new Date('2026-02-21T08:00:00'),
    etat: 'O',
    montantOuverture: 500.00,
  },
  {
    id: 2,
    societe: 'CAI001',
    caisse: 'CAISSE_02',
    operateur: 'DUPONT',
    dateOuverture: new Date('2026-02-21T08:15:00'),
    etat: 'O',
    montantOuverture: 300.00,
  },
  {
    id: 3,
    societe: 'CAI001',
    caisse: 'CAISSE_01',
    operateur: 'BERNARD',
    dateOuverture: new Date('2026-02-20T08:00:00'),
    etat: '',
    montantOuverture: 450.00,
  },
  {
    id: 4,
    societe: 'CAI002',
    caisse: 'CAISSE_03',
    operateur: 'LEFEVRE',
    dateOuverture: new Date('2026-02-21T09:00:00'),
    etat: 'O',
    montantOuverture: 600.00,
  },
  {
    id: 5,
    societe: 'CAI002',
    caisse: 'CAISSE_04',
    operateur: 'ROUSSEAU',
    dateOuverture: new Date('2026-02-20T14:00:00'),
    etat: '',
    montantOuverture: null,
  },
];

const initialState: SessionListState = {
  sessions: [],
  isLoading: false,
  error: null,
  filters: {
    existeSession: true,
    existeSessionOuverte: true,
    societe: null,
    deviseLocale: null,
  },
};

export const useSessionListStore = create<SessionListStore>()((set, get) => ({
  ...initialState,

  fetchSessions: async (filters) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isLoading: true, error: null });

    if (!isRealApi) {
      let filtered = [...MOCK_SESSIONS];

      if (filters.societe) {
        filtered = filtered.filter((s) => s.societe === filters.societe);
      }

      if (filters.existeSessionOuverte) {
        filtered = filtered.filter((s) => s.etat === 'O');
      } else if (filters.existeSession) {
        filtered = filtered.filter((s) => s.etat === '' || s.etat === 'O');
      }

      set({ sessions: filtered, isLoading: false });
      return;
    }

    try {
      const params: GetSessionsListRequest = {};

      if (filters.societe) {
        params.societe = filters.societe;
      }
      if (filters.existeSession !== undefined) {
        params.existeSession = filters.existeSession;
      }
      if (filters.existeSessionOuverte !== undefined) {
        params.existeSessionOuverte = filters.existeSessionOuverte;
      }
      if (filters.deviseLocale) {
        params.deviseLocale = filters.deviseLocale;
      }

      const response: ApiResponse<GetSessionsListResponse> = await apiClient.get(
        '/api/sessions/list',
        { params },
      );

      const sessions = (response.data.data ?? []).map((s) => ({
        ...s,
        dateOuverture: new Date(s.dateOuverture),
      }));

      set({ sessions, isLoading: false });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur chargement sessions';
      set({ sessions: [], error: message, isLoading: false });
    }
  },

  setFilters: (newFilters) => {
    const currentFilters = get().filters;
    const updatedFilters = { ...currentFilters, ...newFilters };
    set({ filters: updatedFilters });
    get().fetchSessions(updatedFilters);
  },

  clearError: () => set({ error: null }),

  reset: () => set({ ...initialState }),
}));