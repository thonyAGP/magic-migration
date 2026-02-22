import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useSessionsOuvertesStore } from '@/stores/sessionsOuvertesStore';
import { useDataSourceStore } from '@/stores/dataSourceStore';
import { apiClient } from '@/services/api/apiClient';
import type { ApiResponse } from '@/services/api/apiClient';
import type { GetSessionsOuvertesResponse, VerifierExistenceSessionResponse, SessionOuverte } from '@/types/sessionsOuvertes';

vi.mock('@/services/api/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

const MOCK_SESSION_1: SessionOuverte = {
  societe: 'SMRNS1',
  compte: 'CAI001',
  filiation: 0,
  numeroSession: 1001,
  operateur: 'MARTIN S.',
  deviseLocale: 'EUR',
  montantCoffre: 1500,
  dateOuverture: new Date('2026-02-21T08:00:00'),
  heureOuverture: '08:00',
};

const MOCK_SESSION_2: SessionOuverte = {
  societe: 'SMRNS1',
  compte: 'CAI002',
  filiation: 0,
  numeroSession: 1002,
  operateur: 'DUPONT J.',
  deviseLocale: 'EUR',
  montantCoffre: 2000,
  dateOuverture: new Date('2026-02-21T08:15:00'),
  heureOuverture: '08:15',
};

const MOCK_SESSION_3: SessionOuverte = {
  societe: 'SMRNS2',
  compte: 'CAI003',
  filiation: 0,
  numeroSession: 1003,
  operateur: 'BERNARD M.',
  deviseLocale: 'USD',
  montantCoffre: 3000,
  dateOuverture: new Date('2026-02-21T09:00:00'),
  heureOuverture: '09:00',
};

describe('sessionsOuvertesStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSessionsOuvertesStore.setState({
      sessions: [],
      isLoading: false,
      error: null,
      selectedSession: null,
      filtreSociete: '',
      filtreOperateur: '',
    });
  });

  describe('chargerSessionsOuvertes', () => {
    it('should load all sessions in mock mode', async () => {
      useDataSourceStore.setState({ isRealApi: false });

      await useSessionsOuvertesStore.getState().chargerSessionsOuvertes();

      const state = useSessionsOuvertesStore.getState();
      expect(state.sessions.length).toBeGreaterThan(0);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should filter by societe in mock mode', async () => {
      useDataSourceStore.setState({ isRealApi: false });

      await useSessionsOuvertesStore.getState().chargerSessionsOuvertes('SMRNS1');

      const state = useSessionsOuvertesStore.getState();
      expect(state.sessions.every((s) => s.societe === 'SMRNS1')).toBe(true);
      expect(state.isLoading).toBe(false);
    });

    it('should filter by operateur in mock mode', async () => {
      useDataSourceStore.setState({ isRealApi: false });

      await useSessionsOuvertesStore.getState().chargerSessionsOuvertes(undefined, 'MARTIN S.');

      const state = useSessionsOuvertesStore.getState();
      expect(state.sessions.every((s) => s.operateur === 'MARTIN S.')).toBe(true);
    });

    it('should filter by societe AND operateur in mock mode (RM-002)', async () => {
      useDataSourceStore.setState({ isRealApi: false });

      await useSessionsOuvertesStore.getState().chargerSessionsOuvertes('SMRNS1', 'MARTIN S.');

      const state = useSessionsOuvertesStore.getState();
      expect(state.sessions.every((s) => s.societe === 'SMRNS1' && s.operateur === 'MARTIN S.')).toBe(true);
    });

    it('should sort sessions by date chronologically', async () => {
      useDataSourceStore.setState({ isRealApi: false });

      await useSessionsOuvertesStore.getState().chargerSessionsOuvertes();

      const state = useSessionsOuvertesStore.getState();
      const dates = state.sessions.map((s) => s.dateOuverture.getTime());
      const sortedDates = [...dates].sort((a, b) => a - b);
      expect(dates).toEqual(sortedDates);
    });

    it('should load sessions from API in real mode', async () => {
      useDataSourceStore.setState({ isRealApi: true });

      const mockResponse: ApiResponse<GetSessionsOuvertesResponse> = {
        data: {
          sessions: [
            { ...MOCK_SESSION_1, dateOuverture: '2026-02-21T08:00:00' } as unknown as SessionOuverte,
            { ...MOCK_SESSION_2, dateOuverture: '2026-02-21T08:15:00' } as unknown as SessionOuverte,
          ],
        },
        success: true,
        message: 'OK',
      };

      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockResponse });

      await useSessionsOuvertesStore.getState().chargerSessionsOuvertes();

      const state = useSessionsOuvertesStore.getState();
      expect(state.sessions).toHaveLength(2);
      expect(state.sessions[0].numeroSession).toBe(1001);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should send filters to API when provided', async () => {
      useDataSourceStore.setState({ isRealApi: true });

      const mockResponse: ApiResponse<GetSessionsOuvertesResponse> = {
        data: { sessions: [] },
        success: true,
        message: 'OK',
      };

      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockResponse });

      await useSessionsOuvertesStore.getState().chargerSessionsOuvertes('SMRNS1', 'MARTIN S.');

      expect(apiClient.get).toHaveBeenCalledWith('/api/sessions/ouvertes', {
        params: { societe: 'SMRNS1', operateur: 'MARTIN S.' },
      });
    });

    it('should handle API error', async () => {
      useDataSourceStore.setState({ isRealApi: true });

      vi.mocked(apiClient.get).mockRejectedValueOnce(new Error('Network error'));

      await useSessionsOuvertesStore.getState().chargerSessionsOuvertes();

      const state = useSessionsOuvertesStore.getState();
      expect(state.sessions).toEqual([]);
      expect(state.error).toBe('Network error');
      expect(state.isLoading).toBe(false);
    });

    it('should set isLoading during request', async () => {
      useDataSourceStore.setState({ isRealApi: true });

      const mockResponse: ApiResponse<GetSessionsOuvertesResponse> = {
        data: { sessions: [] },
        success: true,
        message: 'OK',
      };

      vi.mocked(apiClient.get).mockImplementation(
        () =>
          new Promise((resolve) => {
            const state = useSessionsOuvertesStore.getState();
            expect(state.isLoading).toBe(true);
            setTimeout(() => resolve({ data: mockResponse }), 10);
          }),
      );

      await useSessionsOuvertesStore.getState().chargerSessionsOuvertes();

      expect(useSessionsOuvertesStore.getState().isLoading).toBe(false);
    });
  });

  describe('selectionnerSession', () => {
    it('should select a session', () => {
      useSessionsOuvertesStore.getState().selectionnerSession(MOCK_SESSION_1);

      const state = useSessionsOuvertesStore.getState();
      expect(state.selectedSession).toEqual(MOCK_SESSION_1);
      expect(state.error).toBeNull();
    });

    it('should replace previously selected session', () => {
      useSessionsOuvertesStore.getState().selectionnerSession(MOCK_SESSION_1);
      useSessionsOuvertesStore.getState().selectionnerSession(MOCK_SESSION_2);

      const state = useSessionsOuvertesStore.getState();
      expect(state.selectedSession).toEqual(MOCK_SESSION_2);
    });

    it('should clear error on selection', () => {
      useSessionsOuvertesStore.setState({ error: 'Previous error' });

      useSessionsOuvertesStore.getState().selectionnerSession(MOCK_SESSION_1);

      expect(useSessionsOuvertesStore.getState().error).toBeNull();
    });
  });

  describe('verifierExistenceSession', () => {
    it('should return true if session exists in mock mode (RM-001)', async () => {
      useDataSourceStore.setState({ isRealApi: false });

      const existe = await useSessionsOuvertesStore.getState().verifierExistenceSession(1001);

      expect(existe).toBe(true);
    });

    it('should return false if session does not exist in mock mode (RM-001)', async () => {
      useDataSourceStore.setState({ isRealApi: false });

      const existe = await useSessionsOuvertesStore.getState().verifierExistenceSession(9999);

      expect(existe).toBe(false);
    });

    it('should call API in real mode', async () => {
      useDataSourceStore.setState({ isRealApi: true });

      const mockResponse: ApiResponse<VerifierExistenceSessionResponse> = {
        data: { existe: true },
        success: true,
        message: 'OK',
      };

      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockResponse });

      const existe = await useSessionsOuvertesStore.getState().verifierExistenceSession(1001);

      expect(existe).toBe(true);
      expect(apiClient.get).toHaveBeenCalledWith('/api/sessions/existe/1001');
    });

    it('should return false on API error', async () => {
      useDataSourceStore.setState({ isRealApi: true });

      vi.mocked(apiClient.get).mockRejectedValueOnce(new Error('API error'));

      const existe = await useSessionsOuvertesStore.getState().verifierExistenceSession(1001);

      expect(existe).toBe(false);
      expect(useSessionsOuvertesStore.getState().error).toBe('API error');
    });
  });

  describe('rafraichir', () => {
    it('should reload sessions with current filters', async () => {
      useDataSourceStore.setState({ isRealApi: false });
      useSessionsOuvertesStore.setState({
        filtreSociete: 'SMRNS1',
        filtreOperateur: 'MARTIN S.',
      });

      await useSessionsOuvertesStore.getState().rafraichir();

      const state = useSessionsOuvertesStore.getState();
      expect(state.sessions.every((s) => s.societe === 'SMRNS1' && s.operateur === 'MARTIN S.')).toBe(true);
    });

    it('should reload all sessions if no filters set', async () => {
      useDataSourceStore.setState({ isRealApi: false });

      await useSessionsOuvertesStore.getState().rafraichir();

      const state = useSessionsOuvertesStore.getState();
      expect(state.sessions.length).toBeGreaterThan(0);
    });
  });

  describe('appliquerFiltres', () => {
    it('should update filter states and reload sessions (RM-002)', async () => {
      useDataSourceStore.setState({ isRealApi: false });

      await useSessionsOuvertesStore.getState().appliquerFiltres('SMRNS1', 'MARTIN S.');

      const state = useSessionsOuvertesStore.getState();
      expect(state.filtreSociete).toBe('SMRNS1');
      expect(state.filtreOperateur).toBe('MARTIN S.');
      expect(state.sessions.every((s) => s.societe === 'SMRNS1' && s.operateur === 'MARTIN S.')).toBe(true);
    });

    it('should clear filters when empty strings provided', async () => {
      useDataSourceStore.setState({ isRealApi: false });
      useSessionsOuvertesStore.setState({
        filtreSociete: 'SMRNS1',
        filtreOperateur: 'MARTIN S.',
      });

      await useSessionsOuvertesStore.getState().appliquerFiltres('', '');

      const state = useSessionsOuvertesStore.getState();
      expect(state.filtreSociete).toBe('');
      expect(state.filtreOperateur).toBe('');
      expect(state.sessions.length).toBeGreaterThan(2);
    });
  });

  describe('reset', () => {
    it('should reset store to initial state', () => {
      useSessionsOuvertesStore.setState({
        sessions: [MOCK_SESSION_1],
        selectedSession: MOCK_SESSION_1,
        error: 'Some error',
        filtreSociete: 'SMRNS1',
        filtreOperateur: 'MARTIN S.',
      });

      useSessionsOuvertesStore.getState().reset();

      const state = useSessionsOuvertesStore.getState();
      expect(state.sessions).toEqual([]);
      expect(state.selectedSession).toBeNull();
      expect(state.error).toBeNull();
      expect(state.filtreSociete).toBe('');
      expect(state.filtreOperateur).toBe('');
      expect(state.isLoading).toBe(false);
    });
  });
});