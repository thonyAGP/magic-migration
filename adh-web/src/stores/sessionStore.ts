import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Session, SessionStatus, DeviseSession, SessionHistoryItem } from '@/types';
import { sessionApi } from '@/services/api/endpoints';
import type { OpenSessionRequest, CloseSessionRequest } from '@/services/api/types';
import { useDataSourceStore } from './dataSourceStore';

interface SessionStore {
  currentSession: Session | null;
  status: SessionStatus;
  history: SessionHistoryItem[];
  isLoadingHistory: boolean;
  setSession: (session: Session) => void;
  updateStatus: (status: SessionStatus) => void;
  updateDevise: (deviseCode: string, updates: Partial<DeviseSession>) => void;
  clearSession: () => void;
  openSession: (data: OpenSessionRequest) => Promise<Session>;
  closeSession: (data: CloseSessionRequest) => Promise<void>;
  loadHistory: (page?: number, pageSize?: number) => Promise<void>;
}

const MOCK_SESSION: Session = {
  id: 1,
  caisseId: 1,
  userId: 1,
  dateOuverture: new Date().toISOString(),
  status: 'open',
  devises: [],
};

const MOCK_HISTORY: SessionHistoryItem[] = [
  {
    id: 1,
    caisseId: 1,
    caisseNumero: 'C01',
    userId: 1,
    userLogin: 'demo',
    dateOuverture: '2026-02-10T08:00:00Z',
    dateFermeture: '2026-02-10T18:00:00Z',
    status: 'closed',
  },
  {
    id: 2,
    caisseId: 1,
    caisseNumero: 'C01',
    userId: 1,
    userLogin: 'demo',
    dateOuverture: '2026-02-09T08:00:00Z',
    dateFermeture: '2026-02-09T18:00:00Z',
    status: 'closed',
  },
];

export const useSessionStore = create<SessionStore>()(
  persist(
    (set) => ({
      currentSession: null,
      status: 'closed',
      history: [],
      isLoadingHistory: false,

      setSession: (session) =>
        set({ currentSession: session, status: session.status }),

      updateStatus: (status) =>
        set((state) => ({
          status,
          currentSession: state.currentSession
            ? { ...state.currentSession, status }
            : null,
        })),

      updateDevise: (deviseCode, updates) =>
        set((state) => {
          if (!state.currentSession) return state;
          return {
            currentSession: {
              ...state.currentSession,
              devises: state.currentSession.devises.map((d) =>
                d.deviseCode === deviseCode ? { ...d, ...updates } : d
              ),
            },
          };
        }),

      clearSession: () => set({ currentSession: null, status: 'closed' }),

      openSession: async (data) => {
        const { isRealApi } = useDataSourceStore.getState();

        if (!isRealApi) {
          // Mode Mock - retourne une session fictive immediatement
          const session: Session = {
            ...MOCK_SESSION,
            caisseId: data.caisseId,
            userId: data.userId,
            dateOuverture: new Date().toISOString(),
          };
          set({ currentSession: session, status: 'open' });
          return session;
        }

        set((state) => ({
          ...state,
          status: 'opening',
        }));
        try {
          const response = await sessionApi.open(data);
          const session: Session = {
            id: response.data.data.id,
            caisseId: response.data.data.caisseId,
            userId: response.data.data.userId,
            dateOuverture: response.data.data.dateOuverture,
            status: 'open',
            devises: [],
          };
          set({ currentSession: session, status: 'open' });
          return session;
        } catch (error) {
          set((state) => ({
            ...state,
            status: state.currentSession ? state.currentSession.status : 'closed',
          }));
          throw error;
        }
      },

      closeSession: async (data) => {
        const { isRealApi } = useDataSourceStore.getState();

        if (!isRealApi) {
          // Mode Mock - ferme la session immediatement
          set({ currentSession: null, status: 'closed' });
          return;
        }

        set((state) => ({
          ...state,
          status: 'closing',
        }));
        try {
          await sessionApi.close(data);
          set({ currentSession: null, status: 'closed' });
        } catch (error) {
          set((state) => ({
            ...state,
            status: state.currentSession ? state.currentSession.status : 'closed',
          }));
          throw error;
        }
      },

      loadHistory: async (_page = 1, pageSize = 20) => {
        const { isRealApi } = useDataSourceStore.getState();
        set({ isLoadingHistory: true });

        if (!isRealApi) {
          // Mode Mock - retourne un historique fictif
          set({ history: MOCK_HISTORY.slice(0, pageSize), isLoadingHistory: false });
          return;
        }

        try {
          const response = await sessionApi.getHistory({ page: _page, pageSize });
          const raw = (response.data.data ?? []) as Record<string, unknown>[];
          const formatMagicDate = (d: string, h: string) => {
            if (!d || d.length < 8) return '';
            const iso = `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`;
            if (h && h.length >= 6) return `${iso}T${h.slice(0, 2)}:${h.slice(2, 4)}:${h.slice(4, 6)}`;
            return iso;
          };
          const items: SessionHistoryItem[] = raw.map((s, idx) => ({
            id: (s.id as number) ?? idx + 1,
            caisseId: (s.chrono as number) ?? 0,
            caisseNumero: `C${String((s.chrono as number) ?? 0).padStart(2, '0')}`,
            userId: 0,
            userLogin: (s.utilisateur as string) ?? '',
            dateOuverture: formatMagicDate((s.dateDebut as string) ?? '', (s.heureDebut as string) ?? ''),
            dateFermeture: formatMagicDate((s.dateFin as string) ?? '', (s.heureFin as string) ?? ''),
            status: (s.estOuverte as boolean) ? 'open' as const : 'closed' as const,
          }));
          set({ history: items, isLoadingHistory: false });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erreur chargement historique';
          set({ isLoadingHistory: false });
          throw new Error(message);
        }
      },
    }),
    { name: 'adh-session' }
  )
);
