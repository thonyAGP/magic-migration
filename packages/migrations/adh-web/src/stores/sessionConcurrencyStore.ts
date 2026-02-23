import { create } from 'zustand';
import type {
  SessionConcurrency,
  SessionConflictResult,
  SessionConcurrencyCodeCalcul,
} from '@/types/sessionConcurrency';
import { apiClient } from '@/services/api/apiClient';
import type { ApiResponse } from '@/services/api/apiClient';
import { useDataSourceStore } from './dataSourceStore';

interface SessionConcurrencyState {
  activeSessions: SessionConcurrency[];
  isLoading: boolean;
  error: string | null;
  conflictDetected: boolean;
  conflictingSession: SessionConcurrency | null;
}

interface SessionConcurrencyActions {
  checkConcurrency: (
    societe: string,
    compte: number,
    filiation: number,
  ) => Promise<SessionConflictResult>;
  registerSession: (
    societe: string,
    compte: number,
    filiation: number,
    terminalId: string,
    codeCalcul: SessionConcurrencyCodeCalcul,
  ) => Promise<void>;
  releaseSession: (
    societe: string,
    compte: number,
    filiation: number,
    terminalId: string,
  ) => Promise<void>;
  forceOpenSession: (
    societe: string,
    compte: number,
    filiation: number,
    terminalId: string,
    reason: string,
  ) => Promise<void>;
  setError: (error: string | null) => void;
  clearConflict: () => void;
  reset: () => void;
}

type SessionConcurrencyStore = SessionConcurrencyState & SessionConcurrencyActions;

const MOCK_SESSIONS: SessionConcurrency[] = [
  {
    societe: 'SOC1',
    compte: 1001,
    filiation: 0,
    terminalId: 'TERM01',
    timestamp: new Date('2026-02-21T08:30:00'),
    codeCalcul: 'C',
    coffreEnCoursComptage: false,
  },
  {
    societe: 'SOC1',
    compte: 1002,
    filiation: 0,
    terminalId: 'TERM02',
    timestamp: new Date('2026-02-21T09:15:00'),
    codeCalcul: 'D',
    coffreEnCoursComptage: true,
  },
];

const initialState: SessionConcurrencyState = {
  activeSessions: [],
  isLoading: false,
  error: null,
  conflictDetected: false,
  conflictingSession: null,
};

export const useSessionConcurrencyStore = create<SessionConcurrencyStore>()((set) => ({
  ...initialState,

  checkConcurrency: async (societe, compte, filiation) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isLoading: true, error: null });

    if (!isRealApi) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const conflictingSession = MOCK_SESSIONS.find(
        (s) =>
          s.societe === societe &&
          s.compte === compte &&
          s.filiation === filiation &&
          s.timestamp >= today,
      );

      const result: SessionConflictResult = {
        allowed: !conflictingSession,
        conflictingSession,
        reason: conflictingSession
          ? `Session déjà ouverte sur terminal ${conflictingSession.terminalId} depuis ${conflictingSession.timestamp.toLocaleTimeString()}`
          : undefined,
      };

      set({
        conflictDetected: !result.allowed,
        conflictingSession: conflictingSession ?? null,
        isLoading: false,
      });

      return result;
    }

    try {
      const response = await apiClient.get<ApiResponse<SessionConflictResult>>(
        '/api/caisse/sessions/concurrent',
        {
          params: { societe, compte, filiation },
        },
      );

      const result = response.data.data;
      set({
        conflictDetected: !result.allowed,
        conflictingSession: result.conflictingSession ?? null,
      });

      return result;
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : 'Erreur vérification concurrence';
      set({ error: message, conflictDetected: false, conflictingSession: null });
      throw e;
    } finally {
      set({ isLoading: false });
    }
  },

  registerSession: async (societe, compte, filiation, terminalId, codeCalcul) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isLoading: true, error: null });

    if (!isRealApi) {
      const newSession: SessionConcurrency = {
        societe,
        compte,
        filiation,
        terminalId,
        timestamp: new Date(),
        codeCalcul,
        coffreEnCoursComptage: codeCalcul === 'C',
      };

      set((state) => ({
        activeSessions: [...state.activeSessions, newSession],
        isLoading: false,
      }));
      return;
    }

    try {
      await apiClient.post('/api/caisse/sessions/register', {
        societe,
        compte,
        filiation,
        terminalId,
        codeCalcul,
      });

      set((state) => ({
        activeSessions: [
          ...state.activeSessions,
          {
            societe,
            compte,
            filiation,
            terminalId,
            timestamp: new Date(),
            codeCalcul,
            coffreEnCoursComptage: codeCalcul === 'C',
          },
        ],
      }));
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : 'Erreur enregistrement session';
      set({ error: message });
      throw e;
    } finally {
      set({ isLoading: false });
    }
  },

  releaseSession: async (societe, compte, filiation, terminalId) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isLoading: true, error: null });

    if (!isRealApi) {
      set((state) => ({
        activeSessions: state.activeSessions.filter(
          (s) =>
            !(
              s.societe === societe &&
              s.compte === compte &&
              s.filiation === filiation &&
              s.terminalId === terminalId
            ),
        ),
        isLoading: false,
      }));
      return;
    }

    try {
      await apiClient.post('/api/caisse/sessions/release', {
        societe,
        compte,
        filiation,
        terminalId,
      });

      set((state) => ({
        activeSessions: state.activeSessions.filter(
          (s) =>
            !(
              s.societe === societe &&
              s.compte === compte &&
              s.filiation === filiation &&
              s.terminalId === terminalId
            ),
        ),
      }));
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur libération session';
      set({ error: message });
      throw e;
    } finally {
      set({ isLoading: false });
    }
  },

  forceOpenSession: async (societe, compte, filiation, terminalId, reason) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isLoading: true, error: null });

    if (!isRealApi) {
      set((state) => ({
        activeSessions: state.activeSessions.filter(
          (s) =>
            !(
              s.societe === societe &&
              s.compte === compte &&
              s.filiation === filiation
            ),
        ),
        conflictDetected: false,
        conflictingSession: null,
        isLoading: false,
      }));
      return;
    }

    try {
      await apiClient.post('/api/caisse/sessions/force-open', {
        societe,
        compte,
        filiation,
        terminalId,
        reason,
      });

      set({
        conflictDetected: false,
        conflictingSession: null,
      });
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : 'Erreur ouverture forcée session';
      set({ error: message });
      throw e;
    } finally {
      set({ isLoading: false });
    }
  },

  setError: (error) => set({ error }),

  clearConflict: () =>
    set({ conflictDetected: false, conflictingSession: null, error: null }),

  reset: () => set({ ...initialState }),
}));