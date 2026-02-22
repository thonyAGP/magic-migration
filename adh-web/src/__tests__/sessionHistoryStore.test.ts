import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useSessionHistoryStore } from '@/stores/sessionHistoryStore';
import { useDataSourceStore } from '@/stores/dataSourceStore';
import { apiClient } from '@/services/api/apiClient';
import type { ApiResponse } from '@/services/api/apiClient';
import type {
  SessionHistoryItem,
  SessionDetail,
  SessionCurrency,
} from '@/types/sessionHistory';

vi.mock('@/services/api/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

vi.mock('@/stores/dataSourceStore', () => ({
  useDataSourceStore: {
    getState: vi.fn(),
  },
}));

const MOCK_SESSION_ITEM: SessionHistoryItem = {
  sessionId: 'SES-00001',
  openedDate: new Date('2026-02-20T08:00:00'),
  openedTime: '08:00',
  closedDate: new Date('2026-02-20T16:30:00'),
  closedTime: '16:30',
  operatorId: 'DUPONT J.',
  status: 'FERMEE',
  hasDetails: true,
  title: 'Session 20/02/2026',
};

const MOCK_SESSION_OPEN: SessionHistoryItem = {
  sessionId: 'SES-00002',
  openedDate: new Date('2026-02-22T09:15:00'),
  openedTime: '09:15',
  closedDate: null,
  closedTime: null,
  operatorId: 'MARTIN S.',
  status: 'OUVERTE',
  hasDetails: true,
  title: null,
};

const MOCK_SESSION_DETAIL: SessionDetail = {
  sessionId: 'SES-00001',
  totalAmount: 2350.75,
  hasDetails: true,
  isEndOfHistory: false,
};

const MOCK_SESSION_CURRENCIES: SessionCurrency[] = [
  {
    sessionId: 'SES-00001',
    currencyCode: 'EUR',
    amount: 1500.25,
    totalAmount: 2350.75,
    isLocalCurrency: true,
    isEndOfHistory: false,
  },
  {
    sessionId: 'SES-00001',
    currencyCode: 'USD',
    amount: 850.5,
    totalAmount: 2350.75,
    isLocalCurrency: false,
    isEndOfHistory: false,
  },
];

describe('sessionHistoryStore', () => {
  beforeEach(() => {
    useSessionHistoryStore.setState({
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
    });

    vi.clearAllMocks();
  });

  describe('loadSessions', () => {
    it('should load sessions successfully with mock data', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: false,
      } as ReturnType<typeof useDataSourceStore.getState>);

      const { loadSessions } = useSessionHistoryStore.getState();

      await loadSessions('PHU2512');

      const state = useSessionHistoryStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(Array.isArray(state.sessions)).toBe(true);
      expect(state.sessions.length).toBeGreaterThan(0);
    });

    it('should filter sessions by start date', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: false,
      } as ReturnType<typeof useDataSourceStore.getState>);

      const { loadSessions } = useSessionHistoryStore.getState();
      const filterDate = new Date('2026-02-15');

      await loadSessions('PHU2512', { startDate: filterDate });

      const state = useSessionHistoryStore.getState();
      state.sessions.forEach((session) => {
        expect(session.openedDate >= filterDate).toBe(true);
      });
    });

    it('should filter sessions by end date', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: false,
      } as ReturnType<typeof useDataSourceStore.getState>);

      const { loadSessions } = useSessionHistoryStore.getState();
      const filterDate = new Date('2026-02-01');

      await loadSessions('PHU2512', { endDate: filterDate });

      const state = useSessionHistoryStore.getState();
      state.sessions.forEach((session) => {
        expect(session.openedDate <= filterDate).toBe(true);
      });
    });

    it('should filter sessions by status', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: false,
      } as ReturnType<typeof useDataSourceStore.getState>);

      const { loadSessions } = useSessionHistoryStore.getState();

      await loadSessions('PHU2512', { status: 'FERMEE' });

      const state = useSessionHistoryStore.getState();
      state.sessions.forEach((session) => {
        expect(session.status).toBe('FERMEE');
      });
    });

    it('should filter sessions by operator ID', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: false,
      } as ReturnType<typeof useDataSourceStore.getState>);

      const { loadSessions } = useSessionHistoryStore.getState();

      await loadSessions('PHU2512', { operatorId: 'DUPONT' });

      const state = useSessionHistoryStore.getState();
      state.sessions.forEach((session) => {
        expect(session.operatorId.toLowerCase()).toContain('dupont');
      });
    });

    it('should load sessions from API successfully', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: true,
      } as ReturnType<typeof useDataSourceStore.getState>);

      const mockResponse: ApiResponse<SessionHistoryItem[]> = {
        success: true,
        data: [MOCK_SESSION_ITEM, MOCK_SESSION_OPEN],
      };

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockResponse });

      const { loadSessions } = useSessionHistoryStore.getState();

      await loadSessions('PHU2512');

      const state = useSessionHistoryStore.getState();
      expect(state.sessions).toEqual([MOCK_SESSION_ITEM, MOCK_SESSION_OPEN]);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should build query params correctly for API call', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: true,
      } as ReturnType<typeof useDataSourceStore.getState>);

      const mockResponse: ApiResponse<SessionHistoryItem[]> = {
        success: true,
        data: [],
      };

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockResponse });

      const { loadSessions } = useSessionHistoryStore.getState();
      const startDate = new Date('2026-02-01');
      const endDate = new Date('2026-02-28');

      await loadSessions('PHU2512', {
        startDate,
        endDate,
        status: 'FERMEE',
        operatorId: 'DUPONT',
      });

      expect(apiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('societe=PHU2512'),
      );
      expect(apiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('status=FERMEE'),
      );
      expect(apiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('operatorId=DUPONT'),
      );
    });

    it('should handle API error gracefully', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: true,
      } as ReturnType<typeof useDataSourceStore.getState>);

      const errorMessage = 'Network error';
      vi.mocked(apiClient.get).mockRejectedValue(new Error(errorMessage));

      const { loadSessions } = useSessionHistoryStore.getState();

      await loadSessions('PHU2512');

      const state = useSessionHistoryStore.getState();
      expect(state.sessions).toEqual([]);
      expect(state.error).toBe(errorMessage);
      expect(state.isLoading).toBe(false);
    });

    it('should set loading state during fetch', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: true,
      } as ReturnType<typeof useDataSourceStore.getState>);

      vi.mocked(apiClient.get).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                data: { success: true, data: [] } as ApiResponse<
                  SessionHistoryItem[]
                >,
              });
            }, 100);
          }),
      );

      const { loadSessions } = useSessionHistoryStore.getState();
      const promise = loadSessions('PHU2512');

      expect(useSessionHistoryStore.getState().isLoading).toBe(true);

      await promise;

      expect(useSessionHistoryStore.getState().isLoading).toBe(false);
    });
  });

  describe('loadSessionDetails', () => {
    it('should load session details successfully with mock data', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: false,
      } as ReturnType<typeof useDataSourceStore.getState>);

      const { loadSessionDetails } = useSessionHistoryStore.getState();

      await loadSessionDetails('SES-00001');

      const state = useSessionHistoryStore.getState();
      expect(state.selectedSessionDetails).not.toBeNull();
      expect(state.selectedSessionDetails?.sessionId).toBe('SES-00001');
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should load session details from API successfully', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: true,
      } as ReturnType<typeof useDataSourceStore.getState>);

      const mockResponse: ApiResponse<SessionDetail> = {
        success: true,
        data: MOCK_SESSION_DETAIL,
      };

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockResponse });

      const { loadSessionDetails } = useSessionHistoryStore.getState();

      await loadSessionDetails('SES-00001');

      const state = useSessionHistoryStore.getState();
      expect(state.selectedSessionDetails).toEqual(MOCK_SESSION_DETAIL);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(apiClient.get).toHaveBeenCalledWith(
        '/api/caisse/sessions/history/SES-00001/details',
      );
    });

    it('should handle API error when loading session details', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: true,
      } as ReturnType<typeof useDataSourceStore.getState>);

      const errorMessage = 'Session not found';
      vi.mocked(apiClient.get).mockRejectedValue(new Error(errorMessage));

      const { loadSessionDetails } = useSessionHistoryStore.getState();

      await loadSessionDetails('INVALID');

      const state = useSessionHistoryStore.getState();
      expect(state.selectedSessionDetails).toBeNull();
      expect(state.error).toBe(errorMessage);
      expect(state.isLoading).toBe(false);
    });
  });

  describe('loadSessionCurrencies', () => {
    it('should load session currencies successfully with mock data', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: false,
      } as ReturnType<typeof useDataSourceStore.getState>);

      const { loadSessionCurrencies } = useSessionHistoryStore.getState();

      await loadSessionCurrencies('SES-00001');

      const state = useSessionHistoryStore.getState();
      expect(Array.isArray(state.selectedSessionCurrencies)).toBe(true);
      expect(state.selectedSessionCurrencies.length).toBeGreaterThan(0);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should load session currencies from API successfully', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: true,
      } as ReturnType<typeof useDataSourceStore.getState>);

      const mockResponse: ApiResponse<SessionCurrency[]> = {
        success: true,
        data: MOCK_SESSION_CURRENCIES,
      };

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockResponse });

      const { loadSessionCurrencies } = useSessionHistoryStore.getState();

      await loadSessionCurrencies('SES-00001');

      const state = useSessionHistoryStore.getState();
      expect(state.selectedSessionCurrencies).toEqual(MOCK_SESSION_CURRENCIES);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(apiClient.get).toHaveBeenCalledWith(
        '/api/caisse/sessions/history/SES-00001/currencies',
      );
    });

    it('should identify local currency correctly', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: true,
      } as ReturnType<typeof useDataSourceStore.getState>);

      const mockResponse: ApiResponse<SessionCurrency[]> = {
        success: true,
        data: MOCK_SESSION_CURRENCIES,
      };

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockResponse });

      const { loadSessionCurrencies } = useSessionHistoryStore.getState();

      await loadSessionCurrencies('SES-00001');

      const state = useSessionHistoryStore.getState();
      const localCurrency = state.selectedSessionCurrencies.find(
        (c) => c.isLocalCurrency,
      );
      expect(localCurrency).toBeDefined();
      expect(localCurrency?.currencyCode).toBe('EUR');
    });

    it('should handle API error when loading session currencies', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: true,
      } as ReturnType<typeof useDataSourceStore.getState>);

      const errorMessage = 'Session currencies not found';
      vi.mocked(apiClient.get).mockRejectedValue(new Error(errorMessage));

      const { loadSessionCurrencies } = useSessionHistoryStore.getState();

      await loadSessionCurrencies('INVALID');

      const state = useSessionHistoryStore.getState();
      expect(state.selectedSessionCurrencies).toEqual([]);
      expect(state.error).toBe(errorMessage);
      expect(state.isLoading).toBe(false);
    });
  });

  describe('setFilters', () => {
    it('should update filters partially', () => {
      const { setFilters } = useSessionHistoryStore.getState();

      setFilters({ status: 'FERMEE' });

      const state = useSessionHistoryStore.getState();
      expect(state.filters.status).toBe('FERMEE');
      expect(state.filters.startDate).toBeNull();
      expect(state.filters.endDate).toBeNull();
      expect(state.filters.operatorId).toBeNull();
    });

    it('should merge multiple filter updates', () => {
      const { setFilters } = useSessionHistoryStore.getState();
      const startDate = new Date('2026-02-01');

      setFilters({ status: 'OUVERTE' });
      setFilters({ startDate });

      const state = useSessionHistoryStore.getState();
      expect(state.filters.status).toBe('OUVERTE');
      expect(state.filters.startDate).toEqual(startDate);
    });

    it('should update all filters at once', () => {
      const { setFilters } = useSessionHistoryStore.getState();
      const startDate = new Date('2026-02-01');
      const endDate = new Date('2026-02-28');

      setFilters({
        startDate,
        endDate,
        status: 'FERMEE',
        operatorId: 'DUPONT',
      });

      const state = useSessionHistoryStore.getState();
      expect(state.filters).toEqual({
        startDate,
        endDate,
        status: 'FERMEE',
        operatorId: 'DUPONT',
      });
    });
  });

  describe('clearFilters', () => {
    it('should reset all filters to default values', () => {
      const { setFilters, clearFilters } = useSessionHistoryStore.getState();

      setFilters({
        startDate: new Date('2026-02-01'),
        endDate: new Date('2026-02-28'),
        status: 'FERMEE',
        operatorId: 'DUPONT',
      });

      clearFilters();

      const state = useSessionHistoryStore.getState();
      expect(state.filters).toEqual({
        startDate: null,
        endDate: null,
        status: null,
        operatorId: null,
      });
    });
  });

  describe('setSociete', () => {
    it('should update societe', () => {
      const { setSociete } = useSessionHistoryStore.getState();

      setSociete('PHU2512');

      const state = useSessionHistoryStore.getState();
      expect(state.societe).toBe('PHU2512');
    });
  });

  describe('setLocalCurrencyCode', () => {
    it('should update local currency code', () => {
      const { setLocalCurrencyCode } = useSessionHistoryStore.getState();

      setLocalCurrencyCode('EUR');

      const state = useSessionHistoryStore.getState();
      expect(state.localCurrencyCode).toBe('EUR');
    });
  });

  describe('setAmountMask', () => {
    it('should update amount mask', () => {
      const { setAmountMask } = useSessionHistoryStore.getState();

      setAmountMask('999,999.99');

      const state = useSessionHistoryStore.getState();
      expect(state.amountMask).toBe('999,999.99');
    });
  });

  describe('setError', () => {
    it('should set error message', () => {
      const { setError } = useSessionHistoryStore.getState();

      setError('Custom error message');

      const state = useSessionHistoryStore.getState();
      expect(state.error).toBe('Custom error message');
    });

    it('should clear error message', () => {
      const { setError } = useSessionHistoryStore.getState();

      setError('Error');
      setError(null);

      const state = useSessionHistoryStore.getState();
      expect(state.error).toBeNull();
    });
  });

  describe('reset', () => {
    it('should reset store to initial state', () => {
      const { loadSessions, setFilters, setSociete, reset } =
        useSessionHistoryStore.getState();

      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: false,
      } as ReturnType<typeof useDataSourceStore.getState>);

      loadSessions('PHU2512');
      setFilters({ status: 'FERMEE' });
      setSociete('PHU2512');

      reset();

      const state = useSessionHistoryStore.getState();
      expect(state.sessions).toEqual([]);
      expect(state.selectedSessionDetails).toBeNull();
      expect(state.selectedSessionCurrencies).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.filters).toEqual({
        startDate: null,
        endDate: null,
        status: null,
        operatorId: null,
      });
      expect(state.societe).toBe('');
      expect(state.localCurrencyCode).toBe('');
      expect(state.amountMask).toBe('');
    });
  });
});