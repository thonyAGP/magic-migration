import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useSessionListStore } from '@/stores/sessionListStore';
import { useDataSourceStore } from '@/stores/dataSourceStore';
import { apiClient } from '@/services/api/apiClient';
import type { ApiResponse } from '@/services/api/apiClient';
import type { GetSessionsListResponse } from '@/types/sessionList';

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

const MOCK_API_SESSIONS: GetSessionsListResponse = [
  {
    id: 10,
    societe: 'API001',
    caisse: 'CAISSE_API',
    operateur: 'API_USER',
    dateOuverture: new Date('2026-02-22T10:00:00'),
    etat: 'O',
    montantOuverture: 1000.00,
  },
  {
    id: 11,
    societe: 'API001',
    caisse: 'CAISSE_API2',
    operateur: 'API_USER2',
    dateOuverture: new Date('2026-02-22T11:00:00'),
    etat: '',
    montantOuverture: 500.00,
  },
];

describe('sessionListStore', () => {
  beforeEach(() => {
    useSessionListStore.setState({
      sessions: [],
      isLoading: false,
      error: null,
      filters: {
        existeSession: true,
        existeSessionOuverte: true,
        societe: null,
        deviseLocale: null,
      },
    });
    vi.clearAllMocks();
  });

  describe('fetchSessions - Mock Mode', () => {
    beforeEach(() => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: false,
      } as ReturnType<typeof useDataSourceStore.getState>);
    });

    it('should set loading true then false on success', async () => {
      const store = useSessionListStore.getState();

      const promise = store.fetchSessions(store.filters);

      expect(useSessionListStore.getState().isLoading).toBe(true);

      await promise;

      expect(useSessionListStore.getState().isLoading).toBe(false);
    });

    it('should load all mock sessions with default filters', async () => {
      const store = useSessionListStore.getState();

      await store.fetchSessions({
        existeSession: true,
        existeSessionOuverte: true,
        societe: null,
        deviseLocale: null,
      });

      const state = useSessionListStore.getState();
      expect(state.sessions).toHaveLength(4);
      expect(state.sessions.every((s) => s.etat === 'O')).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should filter sessions by societe - RM-003', async () => {
      const store = useSessionListStore.getState();

      await store.fetchSessions({
        existeSession: true,
        existeSessionOuverte: true,
        societe: 'CAI002',
        deviseLocale: null,
      });

      const state = useSessionListStore.getState();
      expect(state.sessions).toHaveLength(1);
      expect(state.sessions.every((s) => s.societe === 'CAI002')).toBe(true);
    });

    it('should filter sessions where existeSessionOuverte is true - RM-004, RM-002', async () => {
      const store = useSessionListStore.getState();

      await store.fetchSessions({
        existeSession: false,
        existeSessionOuverte: true,
        societe: null,
        deviseLocale: null,
      });

      const state = useSessionListStore.getState();
      expect(state.sessions.every((s) => s.etat === 'O')).toBe(true);
    });

    it('should filter sessions where existeSession is true - RM-003, RM-001', async () => {
      const store = useSessionListStore.getState();

      await store.fetchSessions({
        existeSession: true,
        existeSessionOuverte: false,
        societe: null,
        deviseLocale: null,
      });

      const state = useSessionListStore.getState();
      expect(state.sessions.every((s) => s.etat === '' || s.etat === 'O')).toBe(true);
      expect(state.sessions).toHaveLength(5);
    });

    it('should return all sessions when both filters are false', async () => {
      const store = useSessionListStore.getState();

      await store.fetchSessions({
        existeSession: false,
        existeSessionOuverte: false,
        societe: null,
        deviseLocale: null,
      });

      const state = useSessionListStore.getState();
      expect(state.sessions).toHaveLength(5);
    });

    it('should combine societe and state filters', async () => {
      const store = useSessionListStore.getState();

      await store.fetchSessions({
        existeSession: true,
        existeSessionOuverte: true,
        societe: 'CAI001',
        deviseLocale: null,
      });

      const state = useSessionListStore.getState();
      expect(state.sessions).toHaveLength(2);
      expect(state.sessions.every((s) => s.societe === 'CAI001' && s.etat === 'O')).toBe(true);
    });
  });

  describe('fetchSessions - API Mode', () => {
    beforeEach(() => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: true,
      } as ReturnType<typeof useDataSourceStore.getState>);
    });

    it('should fetch sessions from API and convert dates', async () => {
      const mockResponse: ApiResponse<GetSessionsListResponse> = {
        data: MOCK_API_SESSIONS,
        success: true,
        message: 'OK',
      };

      vi.mocked(apiClient.get).mockResolvedValue(mockResponse);

      const store = useSessionListStore.getState();

      await store.fetchSessions({
        existeSession: true,
        existeSessionOuverte: false,
        societe: null,
        deviseLocale: null,
      });

      const state = useSessionListStore.getState();

      expect(apiClient.get).toHaveBeenCalledWith('/api/sessions/list', {
        params: {
          existeSession: true,
          existeSessionOuverte: false,
        },
      });

      expect(state.sessions).toHaveLength(2);
      expect(state.sessions[0].dateOuverture).toBeInstanceOf(Date);
      expect(state.error).toBeNull();
      expect(state.isLoading).toBe(false);
    });

    it('should send all filter params to API', async () => {
      const mockResponse: ApiResponse<GetSessionsListResponse> = {
        data: [],
        success: true,
        message: 'OK',
      };

      vi.mocked(apiClient.get).mockResolvedValue(mockResponse);

      const store = useSessionListStore.getState();

      await store.fetchSessions({
        existeSession: true,
        existeSessionOuverte: true,
        societe: 'TEST001',
        deviseLocale: 'EUR',
      });

      expect(apiClient.get).toHaveBeenCalledWith('/api/sessions/list', {
        params: {
          societe: 'TEST001',
          existeSession: true,
          existeSessionOuverte: true,
          deviseLocale: 'EUR',
        },
      });
    });

    it('should handle API error and set error message', async () => {
      const errorMessage = 'Network error';
      vi.mocked(apiClient.get).mockRejectedValue(new Error(errorMessage));

      const store = useSessionListStore.getState();

      await store.fetchSessions({
        existeSession: true,
        existeSessionOuverte: false,
        societe: null,
        deviseLocale: null,
      });

      const state = useSessionListStore.getState();

      expect(state.error).toBe(errorMessage);
      expect(state.sessions).toHaveLength(0);
      expect(state.isLoading).toBe(false);
    });

    it('should handle unknown error type', async () => {
      vi.mocked(apiClient.get).mockRejectedValue('unknown error');

      const store = useSessionListStore.getState();

      await store.fetchSessions({
        existeSession: true,
        existeSessionOuverte: false,
        societe: null,
        deviseLocale: null,
      });

      const state = useSessionListStore.getState();

      expect(state.error).toBe('Erreur chargement sessions');
      expect(state.sessions).toHaveLength(0);
      expect(state.isLoading).toBe(false);
    });

    it('should handle empty data array from API', async () => {
      const mockResponse: ApiResponse<GetSessionsListResponse> = {
        data: undefined,
        success: true,
        message: 'OK',
      };

      vi.mocked(apiClient.get).mockResolvedValue(mockResponse);

      const store = useSessionListStore.getState();

      await store.fetchSessions({
        existeSession: true,
        existeSessionOuverte: false,
        societe: null,
        deviseLocale: null,
      });

      const state = useSessionListStore.getState();

      expect(state.sessions).toHaveLength(0);
      expect(state.error).toBeNull();
    });
  });

  describe('setFilters', () => {
    beforeEach(() => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: false,
      } as ReturnType<typeof useDataSourceStore.getState>);
    });

    it('should update filters and trigger fetchSessions', async () => {
      const store = useSessionListStore.getState();

      store.setFilters({ societe: 'CAI001' });

      await vi.waitFor(() => {
        const state = useSessionListStore.getState();
        expect(state.filters.societe).toBe('CAI001');
        expect(state.sessions.every((s) => s.societe === 'CAI001')).toBe(true);
      });
    });

    it('should merge partial filters with existing filters', async () => {
      const store = useSessionListStore.getState();

      store.setFilters({ societe: 'CAI002' });

      await vi.waitFor(() => {
        const state = useSessionListStore.getState();
        expect(state.filters.societe).toBe('CAI002');
        expect(state.filters.existeSession).toBe(true);
        expect(state.filters.existeSessionOuverte).toBe(true);
        expect(state.filters.deviseLocale).toBeNull();
      });
    });

    it('should allow updating multiple filters at once', async () => {
      const store = useSessionListStore.getState();

      store.setFilters({
        societe: 'CAI001',
        existeSessionOuverte: false,
        deviseLocale: 'EUR',
      });

      await vi.waitFor(() => {
        const state = useSessionListStore.getState();
        expect(state.filters.societe).toBe('CAI001');
        expect(state.filters.existeSessionOuverte).toBe(false);
        expect(state.filters.deviseLocale).toBe('EUR');
      });
    });
  });

  describe('clearError', () => {
    it('should clear error message', () => {
      useSessionListStore.setState({ error: 'Test error' });

      const store = useSessionListStore.getState();
      store.clearError();

      const state = useSessionListStore.getState();
      expect(state.error).toBeNull();
    });

    it('should not affect other state properties', () => {
      useSessionListStore.setState({
        error: 'Test error',
        sessions: [
          {
            id: 1,
            societe: 'TEST',
            caisse: 'C1',
            operateur: 'OP1',
            dateOuverture: new Date(),
            etat: 'O',
            montantOuverture: 100,
          },
        ],
        isLoading: true,
      });

      const store = useSessionListStore.getState();
      store.clearError();

      const state = useSessionListStore.getState();
      expect(state.error).toBeNull();
      expect(state.sessions).toHaveLength(1);
      expect(state.isLoading).toBe(true);
    });
  });

  describe('reset', () => {
    it('should reset all state to initial values', () => {
      useSessionListStore.setState({
        sessions: [
          {
            id: 1,
            societe: 'TEST',
            caisse: 'C1',
            operateur: 'OP1',
            dateOuverture: new Date(),
            etat: 'O',
            montantOuverture: 100,
          },
        ],
        isLoading: true,
        error: 'Test error',
        filters: {
          existeSession: false,
          existeSessionOuverte: false,
          societe: 'TEST',
          deviseLocale: 'USD',
        },
      });

      const store = useSessionListStore.getState();
      store.reset();

      const state = useSessionListStore.getState();
      expect(state.sessions).toHaveLength(0);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.filters).toEqual({
        existeSession: true,
        existeSessionOuverte: true,
        societe: null,
        deviseLocale: null,
      });
    });
  });
});