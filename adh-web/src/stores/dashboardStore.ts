import { create } from 'zustand';
import type { DashboardStats, DailyActivity } from '@/types/notification';
import { dashboardApi } from '@/services/api/endpoints-lot7';
import { useDataSourceStore } from './dataSourceStore';

const MOCK_STATS: DashboardStats = {
  sessionsAujourdhui: 3,
  transactionsAujourdhui: 47,
  caTotal: 12580.50,
  devise: 'EUR',
  derniereSynchro: '2026-02-10T10:30:00Z',
  statusConnexion: 'connected',
  caissesActives: 2,
};

const MOCK_DAILY_ACTIVITY: DailyActivity[] = [
  { heure: '08:00', transactions: 2, montant: 450.00 },
  { heure: '09:00', transactions: 5, montant: 1200.00 },
  { heure: '10:00', transactions: 8, montant: 2100.50 },
  { heure: '11:00', transactions: 6, montant: 1550.00 },
  { heure: '12:00', transactions: 3, montant: 780.00 },
  { heure: '13:00', transactions: 2, montant: 320.00 },
  { heure: '14:00', transactions: 7, montant: 1890.00 },
  { heure: '15:00', transactions: 5, montant: 1340.00 },
  { heure: '16:00', transactions: 4, montant: 980.00 },
  { heure: '17:00', transactions: 3, montant: 720.00 },
  { heure: '18:00', transactions: 1, montant: 250.00 },
  { heure: '19:00', transactions: 1, montant: 1000.00 },
];

interface DashboardState {
  stats: DashboardStats | null;
  dailyActivity: DailyActivity[];
  isLoading: boolean;
  error: string | null;
}

interface DashboardActions {
  loadStats: () => Promise<void>;
  loadDailyActivity: () => Promise<void>;
  refresh: () => Promise<void>;
}

type DashboardStore = DashboardState & DashboardActions;

const initialState: DashboardState = {
  stats: null,
  dailyActivity: [],
  isLoading: false,
  error: null,
};

export const useDashboardStore = create<DashboardStore>()((set, get) => ({
  ...initialState,

  loadStats: async () => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isLoading: true, error: null });

    if (!isRealApi) {
      set({ stats: MOCK_STATS, isLoading: false });
      return;
    }

    try {
      const response = await dashboardApi.getStats();
      set({ stats: response.data.data ?? null, isLoading: false });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur chargement statistiques';
      set({ error: message, isLoading: false });
    }
  },

  loadDailyActivity: async () => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isLoading: true, error: null });

    if (!isRealApi) {
      set({ dailyActivity: MOCK_DAILY_ACTIVITY, isLoading: false });
      return;
    }

    try {
      const response = await dashboardApi.getDailyActivity();
      set({ dailyActivity: response.data.data ?? [], isLoading: false });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur chargement activite';
      set({ error: message, isLoading: false });
    }
  },

  refresh: async () => {
    await Promise.all([get().loadStats(), get().loadDailyActivity()]);
  },
}));
