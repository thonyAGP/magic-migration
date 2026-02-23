import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Session, SessionStatus, DeviseSession, SessionHistoryItem, ConcurrentSessionInfo, NetworkClosureResult, NetworkClosureStatus, StockCoherenceResult, SoldeParMOP, SessionEcart } from '@/types';
import { createEmptySoldeParMOP } from '@/types/session';
import { sessionApi } from '@/services/api/endpoints';
import type { OpenSessionRequest, CloseSessionRequest } from '@/services/api/types';
import type { CountingResult } from '@/types/denomination';
import { apiClient } from '@/services/api/apiClient';
import { useDataSourceStore } from './dataSourceStore';

interface SessionStore {
  currentSession: Session | null;
  status: SessionStatus;
  history: SessionHistoryItem[];
  isLoadingHistory: boolean;
  vilOpenSessions: boolean;
  mockConcurrentSession: boolean;
  // B1 MOP enrichment (IDE 126/129)
  lastMopComptee: SoldeParMOP | null;
  lastMopSoldeInitial: SoldeParMOP | null;
  lastEcartOuverture: SessionEcart | null;
  setSession: (session: Session) => void;
  updateStatus: (status: SessionStatus) => void;
  updateDevise: (deviseCode: string, updates: Partial<DeviseSession>) => void;
  clearSession: () => void;
  openSession: (data: OpenSessionRequest) => Promise<Session>;
  closeSession: (data: CloseSessionRequest) => Promise<void>;
  loadHistory: (page?: number, pageSize?: number) => Promise<void>;
  checkConcurrentSessions: () => Promise<ConcurrentSessionInfo | null>;
  setVilOpenSessions: (value: boolean) => void;
  setMockConcurrentSession: (value: boolean) => void;
  // B1 MOP enrichment
  calculateMopFromResults: (results: CountingResult[]) => SoldeParMOP;
  calculateEcartOuverture: (mopComptee: SoldeParMOP, mopSoldeInitial: SoldeParMOP) => SessionEcart;
  // T4-A1: Network closure + stock coherence checks
  networkClosureStatus: NetworkClosureStatus | null;
  stockCoherenceResult: StockCoherenceResult | null;
  checkNetworkClosure: () => Promise<NetworkClosureResult>;
  checkStockCoherence: () => Promise<StockCoherenceResult>;
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

const MOCK_CONCURRENT_SESSION: ConcurrentSessionInfo = {
  sessionId: 99,
  userId: 2,
  userName: 'autre_caissier',
  dateOuverture: new Date(Date.now() - 3600000).toISOString(),
  caisseId: 1,
};

export const useSessionStore = create<SessionStore>()(
  persist(
    (set, get) => ({
      currentSession: null,
      status: 'closed',
      history: [],
      isLoadingHistory: false,
      vilOpenSessions: false,
      mockConcurrentSession: false,
      lastMopComptee: null,
      lastMopSoldeInitial: null,
      lastEcartOuverture: null,
      networkClosureStatus: null,
      stockCoherenceResult: null,

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
          // B1: Store MOP if provided, mock solde initial as zero (first opening)
          const mopComptee = data.mopComptee
            ? { ...data.mopComptee }
            : null;
          set({
            currentSession: session,
            status: 'open',
            lastMopComptee: mopComptee ? { ...mopComptee } : null,
            lastMopSoldeInitial: createEmptySoldeParMOP(),
          });
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

      checkConcurrentSessions: async () => {
        const { isRealApi } = useDataSourceStore.getState();
        const { vilOpenSessions, mockConcurrentSession } = get();

        // If VIL allows multiple sessions, skip check
        if (vilOpenSessions) return null;

        if (!isRealApi) {
          return mockConcurrentSession ? MOCK_CONCURRENT_SESSION : null;
        }

        try {
          const response = await apiClient.get<{ data: ConcurrentSessionInfo | null }>('/caisse/sessions/concurrent');
          return response.data?.data ?? null;
        } catch {
          return null;
        }
      },

      setVilOpenSessions: (value) => set({ vilOpenSessions: value }),

      setMockConcurrentSession: (value) => set({ mockConcurrentSession: value }),

      // T4-A1: Network closure check before opening
      checkNetworkClosure: async (): Promise<NetworkClosureResult> => {
        const { isRealApi } = useDataSourceStore.getState();

        if (!isRealApi) {
          // Mock: always completed
          const result: NetworkClosureResult = { status: 'completed' };
          set({ networkClosureStatus: result.status });
          return result;
        }

        try {
          const response = await apiClient.get<{ data: NetworkClosureResult }>('/caisse/network-closure/status');
          const result = response.data?.data ?? { status: 'completed' as const };
          set({ networkClosureStatus: result.status });
          return result;
        } catch {
          const result: NetworkClosureResult = { status: 'error' };
          set({ networkClosureStatus: result.status });
          return result;
        }
      },

      // T4-A1: Stock coherence check before opening
      checkStockCoherence: async (): Promise<StockCoherenceResult> => {
        const { isRealApi } = useDataSourceStore.getState();

        if (!isRealApi) {
          // Mock: always coherent
          const result: StockCoherenceResult = { coherent: true };
          set({ stockCoherenceResult: result });
          return result;
        }

        try {
          const response = await apiClient.get<{ data: StockCoherenceResult }>('/caisse/stock/coherence');
          const result = response.data?.data ?? { coherent: true };
          set({ stockCoherenceResult: result });
          return result;
        } catch {
          const result: StockCoherenceResult = { coherent: true };
          set({ stockCoherenceResult: result });
          return result;
        }
      },

      // B1: Calculate MOP breakdown from counting results (IDE 126)
      calculateMopFromResults: (results: CountingResult[]): SoldeParMOP => {
        const mop = createEmptySoldeParMOP();
        for (const result of results) {
          if (result.mopBreakdown) {
            mop.monnaie += result.mopBreakdown.monnaie;
            mop.produits += result.mopBreakdown.produits;
            mop.cartes += result.mopBreakdown.cartes;
            mop.cheques += result.mopBreakdown.cheques;
            mop.od += result.mopBreakdown.od;
          } else {
            // Fallback: all denominations are monnaie (billets+pieces)
            mop.monnaie += result.totalCompte;
          }
        }
        mop.total = mop.monnaie + mop.produits + mop.cartes + mop.cheques + mop.od;
        return mop;
      },

      // B1: Calculate ouverture ecart with MOP breakdown (IDE 129)
      calculateEcartOuverture: (mopComptee: SoldeParMOP, mopSoldeInitial: SoldeParMOP): SessionEcart => {
        const ecartTotal = mopComptee.total - mopSoldeInitial.total;
        const mopEcart: SoldeParMOP = {
          total: ecartTotal,
          monnaie: mopComptee.monnaie - mopSoldeInitial.monnaie,
          produits: mopComptee.produits - mopSoldeInitial.produits,
          cartes: mopComptee.cartes - mopSoldeInitial.cartes,
          cheques: mopComptee.cheques - mopSoldeInitial.cheques,
          od: mopComptee.od - mopSoldeInitial.od,
        };

        const statut = Math.abs(ecartTotal) < 0.01 ? 'equilibre' as const
          : Math.abs(ecartTotal) > 5 ? 'alerte' as const
          : ecartTotal > 0 ? 'positif' as const
          : 'negatif' as const;

        const ecart: SessionEcart = {
          attendu: mopSoldeInitial.total,
          compte: mopComptee.total,
          ecart: ecartTotal,
          estEquilibre: statut === 'equilibre',
          statut,
          ecartsDevises: [],
          mopCompte: mopComptee,
          mopAttendu: mopSoldeInitial,
          mopEcart,
        };

        set({ lastMopComptee: mopComptee, lastMopSoldeInitial: mopSoldeInitial, lastEcartOuverture: ecart });
        return ecart;
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
          const raw = (response.data.data ?? []) as unknown as Record<string, unknown>[];
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
