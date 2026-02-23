import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useSessionConcurrencyStore } from '@/stores/sessionConcurrencyStore';
import { apiClient } from '@/services/api/apiClient';
import { useDataSourceStore } from '@/stores/dataSourceStore';
import type {
  SessionConcurrency,
  SessionConflictResult,
} from '@/types/sessionConcurrency';

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

const MOCK_SESSION: SessionConcurrency = {
  societe: 'SOC1',
  compte: 1001,
  filiation: 0,
  terminalId: 'TERM01',
  timestamp: new Date('2026-02-21T08:30:00'),
  codeCalcul: 'C',
  coffreEnCoursComptage: false,
};

const MOCK_CONFLICT_RESULT: SessionConflictResult = {
  allowed: false,
  conflictingSession: MOCK_SESSION,
  reason: 'Session déjà ouverte sur terminal TERM01 depuis 08:30:00',
};

const _MOCK_NO_CONFLICT_RESULT: SessionConflictResult = {
  allowed: true,
};

describe('sessionConcurrencyStore', () => {
  beforeEach(() => {
    useSessionConcurrencyStore.setState({
      activeSessions: [],
      isLoading: false,
      error: null,
      conflictDetected: false,
      conflictingSession: null,
    });
    vi.clearAllMocks();
  });

  describe('checkConcurrency', () => {
    it('should check concurrency against module-level mock data', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: false });

      // In mock mode, checkConcurrency searches the module-level MOCK_SESSIONS
      // (not state.activeSessions). MOCK_SESSIONS timestamps are fixed dates
      // (2026-02-21). Conflict is detected only if timestamp >= today midnight.
      const result = await useSessionConcurrencyStore
        .getState()
        .checkConcurrency('SOC1', 1001, 0);

      const state = useSessionConcurrencyStore.getState();

      // Whether conflict is detected depends on whether MOCK_SESSIONS timestamps are >= today
      const mockTimestamp = new Date('2026-02-21T08:30:00');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const expectConflict = mockTimestamp >= today;

      expect(result.allowed).toBe(!expectConflict);
      expect(state.conflictDetected).toBe(expectConflict);
      expect(state.isLoading).toBe(false);
    });

    it('should allow session when no conflict in mock mode', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: false });

      const result = await useSessionConcurrencyStore
        .getState()
        .checkConcurrency('SOC1', 9999, 0);

      const state = useSessionConcurrencyStore.getState();

      expect(result.allowed).toBe(true);
      expect(result.conflictingSession).toBeUndefined();
      expect(state.conflictDetected).toBe(false);
      expect(state.conflictingSession).toBeNull();
      expect(state.isLoading).toBe(false);
    });

    it('should call API in real mode with success', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true });
      vi.mocked(apiClient.get).mockResolvedValue({
        data: { data: MOCK_CONFLICT_RESULT },
      });

      const result = await useSessionConcurrencyStore
        .getState()
        .checkConcurrency('SOC1', 1001, 0);

      const state = useSessionConcurrencyStore.getState();

      expect(apiClient.get).toHaveBeenCalledWith(
        '/api/caisse/sessions/concurrent',
        {
          params: { societe: 'SOC1', compte: 1001, filiation: 0 },
        },
      );
      expect(result.allowed).toBe(false);
      expect(state.conflictDetected).toBe(true);
      expect(state.isLoading).toBe(false);
    });

    it('should handle API error in real mode', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true });
      const error = new Error('Network error');
      vi.mocked(apiClient.get).mockRejectedValue(error);

      await expect(
        useSessionConcurrencyStore.getState().checkConcurrency('SOC1', 1001, 0),
      ).rejects.toThrow('Network error');

      const state = useSessionConcurrencyStore.getState();
      expect(state.error).toBe('Network error');
      expect(state.conflictDetected).toBe(false);
      expect(state.isLoading).toBe(false);
    });

    it('should set loading state during check', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: false });

      // In mock mode, the operation completes synchronously.
      // Use subscribe to catch the intermediate isLoading=true state.
      let sawLoading = false;
      const unsubscribe = useSessionConcurrencyStore.subscribe((state) => {
        if (state.isLoading === true) sawLoading = true;
      });

      await useSessionConcurrencyStore.getState().checkConcurrency('SOC1', 1001, 0);
      unsubscribe();

      expect(sawLoading).toBe(true);
      expect(useSessionConcurrencyStore.getState().isLoading).toBe(false);
    });
  });

  describe('registerSession', () => {
    it('should register session in mock mode', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: false });

      await useSessionConcurrencyStore
        .getState()
        .registerSession('SOC1', 1001, 0, 'TERM01', 'C');

      const state = useSessionConcurrencyStore.getState();

      expect(state.activeSessions).toHaveLength(1);
      expect(state.activeSessions[0].societe).toBe('SOC1');
      expect(state.activeSessions[0].compte).toBe(1001);
      expect(state.activeSessions[0].terminalId).toBe('TERM01');
      expect(state.activeSessions[0].codeCalcul).toBe('C');
      expect(state.activeSessions[0].coffreEnCoursComptage).toBe(true);
      expect(state.isLoading).toBe(false);
    });

    it('should set coffreEnCoursComptage to false when codeCalcul is not C', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: false });

      await useSessionConcurrencyStore
        .getState()
        .registerSession('SOC1', 1001, 0, 'TERM01', 'D');

      const state = useSessionConcurrencyStore.getState();

      expect(state.activeSessions[0].coffreEnCoursComptage).toBe(false);
    });

    it('should call API in real mode with success', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true });
      vi.mocked(apiClient.post).mockResolvedValue({
        data: { data: { success: true } },
      });

      await useSessionConcurrencyStore
        .getState()
        .registerSession('SOC1', 1001, 0, 'TERM01', 'C');

      expect(apiClient.post).toHaveBeenCalledWith('/api/caisse/sessions/register', {
        societe: 'SOC1',
        compte: 1001,
        filiation: 0,
        terminalId: 'TERM01',
        codeCalcul: 'C',
      });

      const state = useSessionConcurrencyStore.getState();
      expect(state.activeSessions).toHaveLength(1);
      expect(state.isLoading).toBe(false);
    });

    it('should handle API error in real mode', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true });
      const error = new Error('Registration failed');
      vi.mocked(apiClient.post).mockRejectedValue(error);

      await expect(
        useSessionConcurrencyStore
          .getState()
          .registerSession('SOC1', 1001, 0, 'TERM01', 'C'),
      ).rejects.toThrow('Registration failed');

      const state = useSessionConcurrencyStore.getState();
      expect(state.error).toBe('Registration failed');
      expect(state.isLoading).toBe(false);
    });
  });

  describe('releaseSession', () => {
    beforeEach(() => {
      useSessionConcurrencyStore.setState({
        activeSessions: [MOCK_SESSION],
      });
    });

    it('should release session in mock mode', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: false });

      await useSessionConcurrencyStore
        .getState()
        .releaseSession('SOC1', 1001, 0, 'TERM01');

      const state = useSessionConcurrencyStore.getState();

      expect(state.activeSessions).toHaveLength(0);
      expect(state.isLoading).toBe(false);
    });

    it('should not remove other sessions in mock mode', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: false });

      const otherSession: SessionConcurrency = {
        ...MOCK_SESSION,
        compte: 1002,
        terminalId: 'TERM02',
      };

      useSessionConcurrencyStore.setState({
        activeSessions: [MOCK_SESSION, otherSession],
      });

      await useSessionConcurrencyStore
        .getState()
        .releaseSession('SOC1', 1001, 0, 'TERM01');

      const state = useSessionConcurrencyStore.getState();

      expect(state.activeSessions).toHaveLength(1);
      expect(state.activeSessions[0].compte).toBe(1002);
    });

    it('should call API in real mode with success', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true });
      vi.mocked(apiClient.post).mockResolvedValue({
        data: { data: { success: true } },
      });

      await useSessionConcurrencyStore
        .getState()
        .releaseSession('SOC1', 1001, 0, 'TERM01');

      expect(apiClient.post).toHaveBeenCalledWith('/api/caisse/sessions/release', {
        societe: 'SOC1',
        compte: 1001,
        filiation: 0,
        terminalId: 'TERM01',
      });

      const state = useSessionConcurrencyStore.getState();
      expect(state.activeSessions).toHaveLength(0);
      expect(state.isLoading).toBe(false);
    });

    it('should handle API error in real mode', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true });
      const error = new Error('Release failed');
      vi.mocked(apiClient.post).mockRejectedValue(error);

      await expect(
        useSessionConcurrencyStore
          .getState()
          .releaseSession('SOC1', 1001, 0, 'TERM01'),
      ).rejects.toThrow('Release failed');

      const state = useSessionConcurrencyStore.getState();
      expect(state.error).toBe('Release failed');
      expect(state.isLoading).toBe(false);
    });
  });

  describe('forceOpenSession', () => {
    beforeEach(() => {
      useSessionConcurrencyStore.setState({
        conflictDetected: true,
        conflictingSession: MOCK_SESSION,
      });
    });

    it('should clear conflict and remove conflicting session in mock mode', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: false });

      useSessionConcurrencyStore.setState({
        activeSessions: [MOCK_SESSION],
      });

      await useSessionConcurrencyStore
        .getState()
        .forceOpenSession('SOC1', 1001, 0, 'TERM02', 'Override needed');

      const state = useSessionConcurrencyStore.getState();

      expect(state.activeSessions).toHaveLength(0);
      expect(state.conflictDetected).toBe(false);
      expect(state.conflictingSession).toBeNull();
      expect(state.isLoading).toBe(false);
    });

    it('should call API in real mode with success', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true });
      vi.mocked(apiClient.post).mockResolvedValue({
        data: { data: { success: true } },
      });

      await useSessionConcurrencyStore
        .getState()
        .forceOpenSession('SOC1', 1001, 0, 'TERM02', 'Override needed');

      expect(apiClient.post).toHaveBeenCalledWith(
        '/api/caisse/sessions/force-open',
        {
          societe: 'SOC1',
          compte: 1001,
          filiation: 0,
          terminalId: 'TERM02',
          reason: 'Override needed',
        },
      );

      const state = useSessionConcurrencyStore.getState();
      expect(state.conflictDetected).toBe(false);
      expect(state.conflictingSession).toBeNull();
      expect(state.isLoading).toBe(false);
    });

    it('should handle API error in real mode', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true });
      const error = new Error('Force open failed');
      vi.mocked(apiClient.post).mockRejectedValue(error);

      await expect(
        useSessionConcurrencyStore
          .getState()
          .forceOpenSession('SOC1', 1001, 0, 'TERM02', 'Override needed'),
      ).rejects.toThrow('Force open failed');

      const state = useSessionConcurrencyStore.getState();
      expect(state.error).toBe('Force open failed');
      expect(state.isLoading).toBe(false);
    });
  });

  describe('setError', () => {
    it('should set error message', () => {
      useSessionConcurrencyStore.getState().setError('Test error');

      expect(useSessionConcurrencyStore.getState().error).toBe('Test error');
    });

    it('should clear error when null', () => {
      useSessionConcurrencyStore.setState({ error: 'Previous error' });

      useSessionConcurrencyStore.getState().setError(null);

      expect(useSessionConcurrencyStore.getState().error).toBeNull();
    });
  });

  describe('clearConflict', () => {
    it('should clear conflict state and error', () => {
      useSessionConcurrencyStore.setState({
        conflictDetected: true,
        conflictingSession: MOCK_SESSION,
        error: 'Some error',
      });

      useSessionConcurrencyStore.getState().clearConflict();

      const state = useSessionConcurrencyStore.getState();
      expect(state.conflictDetected).toBe(false);
      expect(state.conflictingSession).toBeNull();
      expect(state.error).toBeNull();
    });
  });

  describe('reset', () => {
    it('should reset store to initial state', () => {
      useSessionConcurrencyStore.setState({
        activeSessions: [MOCK_SESSION],
        isLoading: true,
        error: 'Some error',
        conflictDetected: true,
        conflictingSession: MOCK_SESSION,
      });

      useSessionConcurrencyStore.getState().reset();

      const state = useSessionConcurrencyStore.getState();
      expect(state.activeSessions).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.conflictDetected).toBe(false);
      expect(state.conflictingSession).toBeNull();
    });
  });
});