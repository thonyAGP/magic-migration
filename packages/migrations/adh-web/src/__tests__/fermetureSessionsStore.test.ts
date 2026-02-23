import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useFermetureSessionsStore } from '@/stores/fermetureSessionsStore';
import { apiClient } from '@/services/api/apiClient';
import type { ApiResponse } from '@/services/api/apiClient';
import { useDataSourceStore } from '@/stores/dataSourceStore';
import type { Session, UnilateralBilateral, SessionClosureResult } from '@/types/fermetureSessions';

vi.mock('@/services/api/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock('@/stores/dataSourceStore', () => ({
  useDataSourceStore: {
    getState: vi.fn(),
  },
}));

const MOCK_SESSIONS: Session[] = [
  { id: 1, dateOuverture: new Date('2026-02-19T08:00:00'), dateFermeture: null, statut: 'O' },
  { id: 2, dateOuverture: new Date('2026-02-18T08:00:00'), dateFermeture: null, statut: 'O' },
  { id: 3, dateOuverture: new Date('2026-02-17T08:00:00'), dateFermeture: new Date('2026-02-17T18:00:00'), statut: 'C' },
];

const MOCK_TYPES: UnilateralBilateral[] = [
  { code: 'UNI', libelle: 'Unilateral', type: 'unilateral' },
  { code: 'BIL', libelle: 'Bilateral', type: 'bilateral' },
];

describe('fermetureSessionsStore', () => {
  beforeEach(() => {
    const store = useFermetureSessionsStore.getState();
    store.reset();
    vi.clearAllMocks();
  });

  describe('loadSessions', () => {
    it('should load sessions from mock when isRealApi is false', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: false } as never);

      await useFermetureSessionsStore.getState().loadSessions();

      const state = useFermetureSessionsStore.getState();
      expect(state.sessions.length).toBeGreaterThan(0);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(null);
    });

    it('should filter sessions by status when filter provided', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: false } as never);

      const store = useFermetureSessionsStore.getState();
      await store.loadSessions({ statut: 'C' });

      const state = useFermetureSessionsStore.getState();
      expect(state.sessions.every(s => s.statut === 'C')).toBe(true);
    });

    it('should load sessions from API when isRealApi is true', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as never);
      vi.mocked(apiClient.get).mockResolvedValue({
        data: { data: { sessions: MOCK_SESSIONS } },
      } as ApiResponse<{ sessions: Session[] }>);

      const store = useFermetureSessionsStore.getState();
      await store.loadSessions();

      expect(apiClient.get).toHaveBeenCalledWith('/api/fermeture-sessions/sessions');
      const state = useFermetureSessionsStore.getState();
      expect(state.sessions).toEqual(MOCK_SESSIONS);
      expect(state.isLoading).toBe(false);
    });

    it('should handle API error', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as never);
      vi.mocked(apiClient.get).mockRejectedValue(new Error('Network error'));

      const store = useFermetureSessionsStore.getState();
      await store.loadSessions();

      const state = useFermetureSessionsStore.getState();
      expect(state.error).toBe('Network error');
      expect(state.sessions).toEqual([]);
      expect(state.isLoading).toBe(false);
    });

    it('should set isLoading to true during fetch', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as never);
      vi.mocked(apiClient.get).mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      const store = useFermetureSessionsStore.getState();
      const promise = store.loadSessions();

      expect(useFermetureSessionsStore.getState().isLoading).toBe(true);
      await promise;
    });
  });

  describe('loadUnilateralBilateralTypes', () => {
    it('should load types from mock when isRealApi is false', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: false } as never);

      await useFermetureSessionsStore.getState().loadUnilateralBilateralTypes();

      const state = useFermetureSessionsStore.getState();
      expect(state.unilateralBilateralTypes.length).toBeGreaterThan(0);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(null);
    });

    it('should load types from API when isRealApi is true', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as never);
      vi.mocked(apiClient.get).mockResolvedValue({
        data: { data: { types: MOCK_TYPES } },
      } as ApiResponse<{ types: UnilateralBilateral[] }>);

      const store = useFermetureSessionsStore.getState();
      await store.loadUnilateralBilateralTypes();

      expect(apiClient.get).toHaveBeenCalledWith('/api/fermeture-sessions/types');
      const state = useFermetureSessionsStore.getState();
      expect(state.unilateralBilateralTypes).toEqual(MOCK_TYPES);
    });

    it('should handle API error', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as never);
      vi.mocked(apiClient.get).mockRejectedValue(new Error('Fetch failed'));

      const store = useFermetureSessionsStore.getState();
      await store.loadUnilateralBilateralTypes();

      const state = useFermetureSessionsStore.getState();
      expect(state.error).toBe('Fetch failed');
      expect(state.unilateralBilateralTypes).toEqual([]);
    });
  });

  describe('generateClosureCode', () => {
    it('should generate code N15CZ when sessionId % 10 = 0', () => {
      const store = useFermetureSessionsStore.getState();
      const code = store.generateClosureCode(10);

      expect(code).toBe('N15CZ');
    });

    it('should generate code N15.5CZ when sessionId % 10 = 5', () => {
      const store = useFermetureSessionsStore.getState();
      const code = store.generateClosureCode(5);

      expect(code).toBe('N15.5CZ');
    });

    it('should generate code N15.3CZ when sessionId % 10 = 3', () => {
      const store = useFermetureSessionsStore.getState();
      const code = store.generateClosureCode(23);

      expect(code).toBe('N15.3CZ');
    });

    it('should generate code N15.9CZ when sessionId % 10 = 9', () => {
      const store = useFermetureSessionsStore.getState();
      const code = store.generateClosureCode(9);

      expect(code).toBe('N15.9CZ');
    });
  });

  describe('validateSessionClosure', () => {
    it('should return true for open session in mock mode', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: false } as never);
      useFermetureSessionsStore.setState({ sessions: MOCK_SESSIONS });

      const store = useFermetureSessionsStore.getState();
      const isValid = await store.validateSessionClosure(1);

      expect(isValid).toBe(true);
    });

    it('should return false and set error if session not found', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: false } as never);
      useFermetureSessionsStore.setState({ sessions: MOCK_SESSIONS });

      const store = useFermetureSessionsStore.getState();
      const isValid = await store.validateSessionClosure(999);

      expect(isValid).toBe(false);
      expect(useFermetureSessionsStore.getState().error).toBe('Session introuvable');
    });

    it('should return false and set error if session is closed', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: false } as never);
      useFermetureSessionsStore.setState({ sessions: MOCK_SESSIONS });

      const store = useFermetureSessionsStore.getState();
      const isValid = await store.validateSessionClosure(3);

      expect(isValid).toBe(false);
      expect(useFermetureSessionsStore.getState().error).toBe('Seules les sessions ouvertes peuvent être fermées');
    });

    it('should call API validation when isRealApi is true', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as never);
      vi.mocked(apiClient.post).mockResolvedValue({
        data: { data: { valid: true, errors: [] } },
      } as ApiResponse<{ valid: boolean; errors: string[] }>);
      useFermetureSessionsStore.setState({ sessions: MOCK_SESSIONS });

      const store = useFermetureSessionsStore.getState();
      const isValid = await store.validateSessionClosure(1);

      expect(apiClient.post).toHaveBeenCalledWith('/api/fermeture-sessions/validate/1', {});
      expect(isValid).toBe(true);
    });

    it('should return false and set error when API validation fails', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as never);
      vi.mocked(apiClient.post).mockResolvedValue({
        data: { data: { valid: false, errors: ['Pending operations exist'] } },
      } as ApiResponse<{ valid: boolean; errors: string[] }>);
      useFermetureSessionsStore.setState({ sessions: MOCK_SESSIONS });

      const store = useFermetureSessionsStore.getState();
      const isValid = await store.validateSessionClosure(1);

      expect(isValid).toBe(false);
      expect(useFermetureSessionsStore.getState().error).toBe('Pending operations exist');
    });

    it('should handle API error during validation', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as never);
      vi.mocked(apiClient.post).mockRejectedValue(new Error('Validation error'));
      useFermetureSessionsStore.setState({ sessions: MOCK_SESSIONS });

      const store = useFermetureSessionsStore.getState();
      const isValid = await store.validateSessionClosure(1);

      expect(isValid).toBe(false);
      expect(useFermetureSessionsStore.getState().error).toBe('Validation error');
    });
  });

  describe('fermerSession', () => {
    it('should close session in mock mode after validation', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: false } as never);
      useFermetureSessionsStore.setState({ sessions: MOCK_SESSIONS });

      const store = useFermetureSessionsStore.getState();
      await store.fermerSession(1);

      const state = useFermetureSessionsStore.getState();
      const closedSession = state.sessions.find(s => s.id === 1);
      expect(closedSession?.statut).toBe('C');
      expect(closedSession?.dateFermeture).toBeInstanceOf(Date);
      expect(state.isClosing).toBe(false);
    });

    it('should update currentSession when closing current session', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: false } as never);
      useFermetureSessionsStore.setState({ 
        sessions: MOCK_SESSIONS,
        currentSession: MOCK_SESSIONS[0],
      });

      const store = useFermetureSessionsStore.getState();
      await store.fermerSession(1);

      const state = useFermetureSessionsStore.getState();
      expect(state.currentSession?.statut).toBe('C');
      expect(state.currentSession?.dateFermeture).toBeInstanceOf(Date);
    });

    it('should not close session if validation fails', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: false } as never);
      useFermetureSessionsStore.setState({ sessions: MOCK_SESSIONS });

      const store = useFermetureSessionsStore.getState();
      await store.fermerSession(3);

      const state = useFermetureSessionsStore.getState();
      expect(state.error).toBe('Session non éligible à la fermeture');
      expect(state.isClosing).toBe(false);
    });

    it('should call API to close session when isRealApi is true', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as never);
      vi.mocked(apiClient.post).mockImplementation((url: string) => {
        if (url.includes('/validate/')) {
          return Promise.resolve({
            data: { data: { valid: true, errors: [] } },
          } as ApiResponse<{ valid: boolean; errors: string[] }>);
        }
        return Promise.resolve({
          data: { data: { success: true, closureCode: 'N15.1CZ', sessionId: 1, closedAt: new Date() } },
        } as ApiResponse<SessionClosureResult>);
      });
      useFermetureSessionsStore.setState({ sessions: MOCK_SESSIONS });

      const store = useFermetureSessionsStore.getState();
      await store.fermerSession(1);

      expect(apiClient.post).toHaveBeenCalledWith('/api/fermeture-sessions/close/1', {});
      const state = useFermetureSessionsStore.getState();
      const closedSession = state.sessions.find(s => s.id === 1);
      expect(closedSession?.statut).toBe('C');
    });

    it('should set error if API closure fails', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as never);
      vi.mocked(apiClient.post).mockImplementation((url: string) => {
        if (url.includes('/validate/')) {
          return Promise.resolve({
            data: { data: { valid: true, errors: [] } },
          } as ApiResponse<{ valid: boolean; errors: string[] }>);
        }
        return Promise.resolve({
          data: { data: { success: false, closureCode: '', sessionId: 1, closedAt: new Date() } },
        } as ApiResponse<SessionClosureResult>);
      });
      useFermetureSessionsStore.setState({ sessions: MOCK_SESSIONS });

      const store = useFermetureSessionsStore.getState();
      await store.fermerSession(1);

      const state = useFermetureSessionsStore.getState();
      expect(state.error).toBe('Échec fermeture session');
    });

    it('should handle API error during closure', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as never);
      vi.mocked(apiClient.post).mockImplementation((url: string) => {
        if (url.includes('/validate/')) {
          return Promise.resolve({
            data: { data: { valid: true, errors: [] } },
          } as ApiResponse<{ valid: boolean; errors: string[] }>);
        }
        return Promise.reject(new Error('Closure failed'));
      });
      useFermetureSessionsStore.setState({ sessions: MOCK_SESSIONS });

      const store = useFermetureSessionsStore.getState();
      await store.fermerSession(1);

      const state = useFermetureSessionsStore.getState();
      expect(state.error).toBe('Closure failed');
      expect(state.isClosing).toBe(false);
    });

    it('should set isClosing to true during closure', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as never);
      vi.mocked(apiClient.post).mockImplementation((url: string) => {
        if (url.includes('/validate/')) {
          return Promise.resolve({
            data: { data: { valid: true, errors: [] } },
          } as ApiResponse<{ valid: boolean; errors: string[] }>);
        }
        return new Promise(resolve => setTimeout(() => resolve({
          data: { data: { success: true, closureCode: 'N15CZ', sessionId: 1, closedAt: new Date() } },
        } as ApiResponse<SessionClosureResult>), 100));
      });
      useFermetureSessionsStore.setState({ sessions: MOCK_SESSIONS });

      const store = useFermetureSessionsStore.getState();
      const promise = store.fermerSession(1);

      expect(useFermetureSessionsStore.getState().isClosing).toBe(true);
      await promise;
    });
  });

  describe('setCurrentSession', () => {
    it('should set current session and clear error', () => {
      const session = MOCK_SESSIONS[0];
      useFermetureSessionsStore.setState({ error: 'Some error' });

      const store = useFermetureSessionsStore.getState();
      store.setCurrentSession(session);

      const state = useFermetureSessionsStore.getState();
      expect(state.currentSession).toEqual(session);
      expect(state.error).toBe(null);
    });

    it('should clear current session when passed null', () => {
      useFermetureSessionsStore.setState({ currentSession: MOCK_SESSIONS[0] });

      const store = useFermetureSessionsStore.getState();
      store.setCurrentSession(null);

      const state = useFermetureSessionsStore.getState();
      expect(state.currentSession).toBe(null);
    });
  });

  describe('clearError', () => {
    it('should clear error', () => {
      useFermetureSessionsStore.setState({ error: 'Test error' });

      const store = useFermetureSessionsStore.getState();
      store.clearError();

      expect(useFermetureSessionsStore.getState().error).toBe(null);
    });
  });

  describe('reset', () => {
    it('should reset store to initial state', () => {
      useFermetureSessionsStore.setState({
        sessions: MOCK_SESSIONS,
        currentSession: MOCK_SESSIONS[0],
        unilateralBilateralTypes: MOCK_TYPES,
        isLoading: true,
        error: 'Error',
        isClosing: true,
      });

      const store = useFermetureSessionsStore.getState();
      store.reset();

      const state = useFermetureSessionsStore.getState();
      expect(state.sessions).toEqual([]);
      expect(state.currentSession).toBe(null);
      expect(state.unilateralBilateralTypes).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(null);
      expect(state.isClosing).toBe(false);
    });
  });
});