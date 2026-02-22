import { create } from 'zustand';
import type {
  SessionHistoryItem,
  SessionDetail,
  SessionCurrency,
  SessionHistoryFilters,
} from '@/types/sessionHistory';
import { apiClient } from '@/services/api/apiClient';
import type { ApiResponse } from '@/services/api/apiClient';
import { useDataSourceStore } from './dataSourceStore';

interface SessionHistoryState {
  sessions: SessionHistoryItem[];
  selectedSessionDetails: SessionDetail | null;
  selectedSessionCurrencies: SessionCurrency[];
  isLoading: boolean;
  error: string | null;
  filters: SessionHistoryFilters;
  societe: string;
  localCurrencyCode: string;
  amountMask: string;
}

interface SessionHistoryActions {
  loadSessions: (
    societe: string,
    filters?: Partial<SessionHistoryFilters>,
  ) => Promise<void>;
  loadSessionDetails: (sessionId: string) => Promise<void>;
  loadSessionCurrencies: (sessionId: string) => Promise<void>;
  setFilters: (filters: Partial<SessionHistoryFilters>) => void;
  clearFilters: () => void;
  setSociete: (societe: string) => void;
  setLocalCurrencyCode: (code: string) => void;
  setAmountMask: (mask: string) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

type SessionHistoryStore = SessionHistoryState & SessionHistoryActions;

const generateMockSessions = (): SessionHistoryItem[] => {
  const sessions: SessionHistoryItem[] = [];
  const operators = ['DUPONT J.', 'MARTIN S.', 'DURAND P.', 'BERNARD L.'];
  const statuses = ['OUVERTE', 'FERMEE'];
  const now = new Date();

  for (let i = 0; i < 10; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const openedDate = new Date(now);
    openedDate.setDate(openedDate.getDate() - daysAgo);

    const isClosed = Math.random() > 0.3;
    const closedDate = isClosed
      ? new Date(openedDate.getTime() + Math.random() * 8 * 60 * 60 * 1000)
      : null;

    sessions.push({
      sessionId: `SES-${String(i + 1).padStart(5, '0')}`,
      openedDate,
      openedTime: `${String(8 + Math.floor(Math.random() * 4)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
      closedDate,
      closedTime: closedDate
        ? `${String(16 + Math.floor(Math.random() * 4)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`
        : null,
      operatorId: operators[Math.floor(Math.random() * operators.length)],
      status: isClosed ? 'FERMEE' : 'OUVERTE',
      hasDetails: true,
      title: isClosed ? `Session ${openedDate.toLocaleDateString()}` : null,
    });
  }

  return sessions.sort(
    (a, b) => b.openedDate.getTime() - a.openedDate.getTime(),
  );
};

const MOCK_SESSIONS = generateMockSessions();

const generateMockSessionDetails = (sessionId: string): SessionDetail => {
  return {
    sessionId,
    totalAmount: 1500 + Math.random() * 3500,
    hasDetails: true,
    isEndOfHistory: false,
  };
};

const generateMockSessionCurrencies = (
  sessionId: string,
): SessionCurrency[] => {
  const currencies = ['EUR', 'USD', 'GBP', 'CHF', 'JPY'];
  const numCurrencies = 2 + Math.floor(Math.random() * 4);
  const selectedCurrencies = currencies
    .sort(() => Math.random() - 0.5)
    .slice(0, numCurrencies);

  const totalAmount = 1500 + Math.random() * 3500;

  return selectedCurrencies.map((code, index) => ({
    sessionId,
    currencyCode: code,
    amount: 100 + Math.random() * 4900,
    totalAmount,
    isLocalCurrency: index === 0,
    isEndOfHistory: false,
  }));
};

const initialState: SessionHistoryState = {
  sessions: [],
  selectedSessionDetails: null,
  selectedSessionCurrencies: [],
  isLoading: false,
  error: null,
  filters: {
    startDate: null,
    endDate: null,
    status: null,
    operatorId: null,
  },
  societe: '',
  localCurrencyCode: '',
  amountMask: '',
};

export const useSessionHistoryStore = create<SessionHistoryStore>()((set) => ({
  ...initialState,

  loadSessions: async (societe, filters) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isLoading: true, error: null });

    if (!isRealApi) {
      let filtered = [...MOCK_SESSIONS];

      if (filters?.startDate) {
        filtered = filtered.filter(
          (s) => s.openedDate >= filters.startDate!,
        );
      }
      if (filters?.endDate) {
        filtered = filtered.filter(
          (s) => s.openedDate <= filters.endDate!,
        );
      }
      if (filters?.status) {
        filtered = filtered.filter((s) => s.status === filters.status);
      }
      if (filters?.operatorId) {
        filtered = filtered.filter((s) =>
          s.operatorId.toLowerCase().includes(filters.operatorId!.toLowerCase()),
        );
      }

      set({ sessions: filtered, isLoading: false });
      return;
    }

    try {
      const queryParams = new URLSearchParams({ societe });
      if (filters?.startDate) {
        queryParams.append('startDate', filters.startDate.toISOString());
      }
      if (filters?.endDate) {
        queryParams.append('endDate', filters.endDate.toISOString());
      }
      if (filters?.status) {
        queryParams.append('status', filters.status);
      }
      if (filters?.operatorId) {
        queryParams.append('operatorId', filters.operatorId);
      }

      const response = await apiClient.get<ApiResponse<SessionHistoryItem[]>>(
        `/api/caisse/sessions/history?${queryParams.toString()}`,
      );

      set({ sessions: response.data.data ?? [] });
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : 'Erreur chargement sessions';
      set({ sessions: [], error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  loadSessionDetails: async (sessionId) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isLoading: true, error: null });

    if (!isRealApi) {
      const details = generateMockSessionDetails(sessionId);
      set({ selectedSessionDetails: details, isLoading: false });
      return;
    }

    try {
      const response = await apiClient.get<ApiResponse<SessionDetail>>(
        `/api/caisse/sessions/history/${sessionId}/details`,
      );

      set({ selectedSessionDetails: response.data.data ?? null });
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : 'Erreur chargement détails session';
      set({ selectedSessionDetails: null, error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  loadSessionCurrencies: async (sessionId) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isLoading: true, error: null });

    if (!isRealApi) {
      const currencies = generateMockSessionCurrencies(sessionId);
      set({ selectedSessionCurrencies: currencies, isLoading: false });
      return;
    }

    try {
      const response = await apiClient.get<ApiResponse<SessionCurrency[]>>(
        `/api/caisse/sessions/history/${sessionId}/currencies`,
      );

      set({ selectedSessionCurrencies: response.data.data ?? [] });
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : 'Erreur chargement devises session';
      set({ selectedSessionCurrencies: [], error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  setFilters: (filters) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
    }));
  },

  clearFilters: () => {
    set({
      filters: {
        startDate: null,
        endDate: null,
        status: null,
        operatorId: null,
      },
    });
  },

  setSociete: (societe) => set({ societe }),

  setLocalCurrencyCode: (code) => set({ localCurrencyCode: code }),

  setAmountMask: (mask) => set({ amountMask: mask }),

  setError: (error) => set({ error }),

  reset: () => set({ ...initialState }),
}));