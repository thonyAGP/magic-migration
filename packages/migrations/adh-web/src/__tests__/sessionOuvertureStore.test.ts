import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useSessionOuvertureStore } from '@/stores/sessionOuvertureStore';
import { useDataSourceStore } from '@/stores/dataSourceStore';
import { apiClient } from '@/services/api/apiClient';
import { SESSION_STEPS } from '@/types/sessionOuverture';
import type {
  DenominationCount,
  DeviseSession,
  SoldeParMOP,
  SessionInfo,
  OpenSessionResponse,
  CheckConcurrentSessionsResponse,
  DenominationsConfigResponse,
  DevisesConfigResponse,
  PrintTicketResponse,
} from '@/types/sessionOuverture';

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

const MOCK_DENOMINATIONS: DenominationCount[] = [
  { denominationId: 1, value: 500, count: 0, total: 0 },
  { denominationId: 2, value: 200, count: 0, total: 0 },
  { denominationId: 3, value: 100, count: 2, total: 200 },
  { denominationId: 4, value: 50, count: 3, total: 150 },
  { denominationId: 5, value: 20, count: 5, total: 100 },
];

const MOCK_DEVISES: DeviseSession[] = [
  {
    deviseCode: 'EUR',
    nbInitial: 1000,
    nbApport: 0,
    nbCompte: 0,
    nbCalcule: 0,
    nbEcart: 0,
    commentaireEcart: null,
    existeEcart: false,
  },
  {
    deviseCode: 'USD',
    nbInitial: 500,
    nbApport: 0,
    nbCompte: 0,
    nbCalcule: 0,
    nbEcart: 0,
    commentaireEcart: null,
    existeEcart: false,
  },
];

const MOCK_CONCURRENT_SESSIONS: SessionInfo[] = [
  {
    chrono: 123,
    dateOuverture: new Date('2024-01-01T10:00:00Z'),
    operateur: 'OPERATOR1',
    status: 'open',
  },
];

const MOCK_SOLDE_PAR_MOP: SoldeParMOP = {
  monnaie: 450,
  produits: 0,
  cartes: 0,
  cheques: 0,
  od: 0,
  total: 450,
};

describe('useSessionOuvertureStore', () => {
  beforeEach(() => {
    const store = useSessionOuvertureStore.getState();
    store.resetState();
    vi.clearAllMocks();
  });

  describe('initOuverture', () => {
    it('should initialize with mock data when isRealApi is false', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: false } as never);

      const store = useSessionOuvertureStore.getState();
      await store.initOuverture();

      const state = useSessionOuvertureStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(null);
      expect(state.currentStep).toBe(SESSION_STEPS.COMPTAGE);
      expect(state.comptage.length).toBeGreaterThan(0);
      expect(state.devises.length).toBeGreaterThan(0);
    });

    it('should fetch real data when isRealApi is true and no concurrent sessions', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as never);

      const mockDenominationsResponse: DenominationsConfigResponse = {
        success: true,
        message: 'Success',
        data: [
          { id: 1, value: 500, libelle: '500€', type: 'billet' },
          { id: 2, value: 200, libelle: '200€', type: 'billet' },
        ],
      };

      const mockDevisesResponse: DevisesConfigResponse = {
        success: true,
        message: 'Success',
        data: [
          { code: 'EUR', libelle: 'Euro', symbole: '€' },
          { code: 'USD', libelle: 'Dollar', symbole: '$' },
        ],
      };

      const mockConcurrentResponse: CheckConcurrentSessionsResponse = {
        success: true,
        message: 'No concurrent sessions',
        data: {
          hasOpen: false,
          sessions: [],
          vilOpenSessions: false,
        },
      };

      vi.mocked(apiClient.get)
        .mockResolvedValueOnce({ data: mockConcurrentResponse })
        .mockResolvedValueOnce({ data: mockDenominationsResponse })
        .mockResolvedValueOnce({ data: mockDevisesResponse });

      const store = useSessionOuvertureStore.getState();
      await store.initOuverture();

      const state = useSessionOuvertureStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(null);
      expect(state.currentStep).toBe(SESSION_STEPS.COMPTAGE);
      expect(state.comptage).toHaveLength(2);
      expect(state.devises).toHaveLength(2);
      expect(state.showConcurrentWarning).toBe(false);
    });

    it('should stop initialization when concurrent sessions detected', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as never);

      const mockConcurrentResponse: CheckConcurrentSessionsResponse = {
        success: true,
        message: 'Concurrent sessions found',
        data: {
          hasOpen: true,
          sessions: MOCK_CONCURRENT_SESSIONS,
          vilOpenSessions: true,
        },
      };

      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockConcurrentResponse });

      const store = useSessionOuvertureStore.getState();
      await store.initOuverture();

      const state = useSessionOuvertureStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.showConcurrentWarning).toBe(true);
      expect(state.concurrentSessions).toEqual(MOCK_CONCURRENT_SESSIONS);
      expect(state.comptage).toHaveLength(0);
    });

    it('should handle API errors during initialization', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as never);

      const mockConcurrentResponse: CheckConcurrentSessionsResponse = {
        success: true,
        message: 'No concurrent sessions',
        data: {
          hasOpen: false,
          sessions: [],
          vilOpenSessions: false,
        },
      };

      vi.mocked(apiClient.get)
        .mockResolvedValueOnce({ data: mockConcurrentResponse })
        .mockRejectedValueOnce(new Error('Network error'));

      const store = useSessionOuvertureStore.getState();
      await store.initOuverture();

      const state = useSessionOuvertureStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Network error');
    });
  });

  describe('handleCountChange', () => {
    it('should update denomination count and recompute results', () => {
      const store = useSessionOuvertureStore.getState();
      useSessionOuvertureStore.setState({ comptage: [...MOCK_DENOMINATIONS] });

      store.handleCountChange(3, 10);

      const state = useSessionOuvertureStore.getState();
      const updated = state.comptage.find((d) => d.denominationId === 3);
      expect(updated?.count).toBe(10);
      expect(updated?.total).toBe(1000);
      expect(state.soldeParMOP).not.toBe(null);
    });

    it('should preserve other denomination counts when updating one', () => {
      const store = useSessionOuvertureStore.getState();
      useSessionOuvertureStore.setState({ comptage: [...MOCK_DENOMINATIONS] });

      store.handleCountChange(3, 5);

      const state = useSessionOuvertureStore.getState();
      const other = state.comptage.find((d) => d.denominationId === 4);
      expect(other?.count).toBe(3);
      expect(other?.total).toBe(150);
    });
  });

  describe('computeResults', () => {
    it('should calculate total from all denominations', () => {
      const store = useSessionOuvertureStore.getState();
      useSessionOuvertureStore.setState({ comptage: [...MOCK_DENOMINATIONS] });

      const result = store.computeResults();

      expect(result.monnaie).toBe(450);
      expect(result.produits).toBe(0);
      expect(result.cartes).toBe(0);
      expect(result.cheques).toBe(0);
      expect(result.od).toBe(0);
      expect(result.total).toBe(450);
    });

    it('should return zero total when no counts', () => {
      const store = useSessionOuvertureStore.getState();
      const emptyComptage = MOCK_DENOMINATIONS.map((d) => ({ ...d, count: 0, total: 0 }));
      useSessionOuvertureStore.setState({ comptage: emptyComptage });

      const result = store.computeResults();

      expect(result.total).toBe(0);
    });
  });

  describe('validateComptage', () => {
    it('should reject validation when no denominations counted', async () => {
      const store = useSessionOuvertureStore.getState();
      const emptyComptage = MOCK_DENOMINATIONS.map((d) => ({ ...d, count: 0, total: 0 }));
      useSessionOuvertureStore.setState({ comptage: emptyComptage });

      await store.validateComptage();

      const state = useSessionOuvertureStore.getState();
      expect(state.error).toBe('Aucune denomination comptee');
      expect(state.currentStep).toBe(SESSION_STEPS.COMPTAGE);
    });

    it('should reject validation when total is zero', async () => {
      const store = useSessionOuvertureStore.getState();
      useSessionOuvertureStore.setState({
        comptage: [...MOCK_DENOMINATIONS],
        soldeParMOP: { ...MOCK_SOLDE_PAR_MOP, total: 0 },
      });

      await store.validateComptage();

      const state = useSessionOuvertureStore.getState();
      expect(state.error).toBe('Le solde total doit etre superieur a 0');
    });

    it('should advance to validation step when valid', async () => {
      const store = useSessionOuvertureStore.getState();
      useSessionOuvertureStore.setState({
        comptage: [...MOCK_DENOMINATIONS],
        soldeParMOP: MOCK_SOLDE_PAR_MOP,
      });

      await store.validateComptage();

      const state = useSessionOuvertureStore.getState();
      expect(state.error).toBe(null);
      expect(state.currentStep).toBe(SESSION_STEPS.VALIDATION);
    });
  });

  describe('executeOuverture', () => {
    it('should execute mock opening when isRealApi is false', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: false } as never);

      const store = useSessionOuvertureStore.getState();
      useSessionOuvertureStore.setState({
        comptage: [...MOCK_DENOMINATIONS],
        devises: [...MOCK_DEVISES],
      });

      await store.executeOuverture();

      const state = useSessionOuvertureStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.currentStep).toBe(SESSION_STEPS.SUCCES);
      expect(state.sessionChrono).toBeGreaterThan(0);
      expect(state.soldeParMOP).not.toBe(null);
    });

    it('should execute real opening when isRealApi is true', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as never);

      const mockResponse: OpenSessionResponse = {
        success: true,
        message: 'Session opened',
        data: {
          chrono: 42,
          soldeParMOP: MOCK_SOLDE_PAR_MOP,
          devises: MOCK_DEVISES,
        },
      };

      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockResponse });

      const store = useSessionOuvertureStore.getState();
      useSessionOuvertureStore.setState({
        comptage: [...MOCK_DENOMINATIONS],
        devises: [...MOCK_DEVISES],
      });

      await store.executeOuverture();

      const state = useSessionOuvertureStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.currentStep).toBe(SESSION_STEPS.SUCCES);
      expect(state.sessionChrono).toBe(42);
      expect(state.soldeParMOP).toEqual(MOCK_SOLDE_PAR_MOP);
    });

    it('should handle API errors during opening', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as never);

      vi.mocked(apiClient.post).mockRejectedValueOnce(new Error('Server error'));

      const store = useSessionOuvertureStore.getState();
      useSessionOuvertureStore.setState({
        comptage: [...MOCK_DENOMINATIONS],
        devises: [...MOCK_DEVISES],
      });

      await store.executeOuverture();

      const state = useSessionOuvertureStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Server error');
      expect(state.currentStep).toBe(SESSION_STEPS.VALIDATION);
    });

    it('should reject when API response has no data', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as never);

      const mockResponse: OpenSessionResponse = {
        success: true,
        message: 'No data',
      };

      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockResponse });

      const store = useSessionOuvertureStore.getState();
      useSessionOuvertureStore.setState({
        comptage: [...MOCK_DENOMINATIONS],
        devises: [...MOCK_DEVISES],
      });

      await store.executeOuverture();

      const state = useSessionOuvertureStore.getState();
      expect(state.error).toBe('Reponse API invalide');
      expect(state.currentStep).toBe(SESSION_STEPS.VALIDATION);
    });
  });

  describe('handlePrint', () => {
    it('should skip API call when isRealApi is false', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: false } as never);

      const store = useSessionOuvertureStore.getState();
      useSessionOuvertureStore.setState({
        sessionChrono: 42,
        soldeParMOP: MOCK_SOLDE_PAR_MOP,
        devises: MOCK_DEVISES,
      });

      await store.handlePrint();

      const state = useSessionOuvertureStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(null);
      expect(apiClient.post).not.toHaveBeenCalled();
    });

    it('should call print API when isRealApi is true', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as never);

      const mockResponse: PrintTicketResponse = {
        success: true,
        message: 'Printed',
        data: {
          success: true,
          ticketId: 'TICKET-123',
        },
      };

      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockResponse });

      const store = useSessionOuvertureStore.getState();
      useSessionOuvertureStore.setState({
        sessionChrono: 42,
        soldeParMOP: MOCK_SOLDE_PAR_MOP,
        devises: MOCK_DEVISES,
      });

      await store.handlePrint();

      expect(apiClient.post).toHaveBeenCalledWith('/api/print/ticket', expect.objectContaining({
        ticketType: 'ouverture',
        data: expect.objectContaining({
          chrono: 42,
          soldeParMOP: MOCK_SOLDE_PAR_MOP,
        }),
      }));

      const state = useSessionOuvertureStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(null);
    });

    it('should reject when session data is missing', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: false } as never);

      const store = useSessionOuvertureStore.getState();
      useSessionOuvertureStore.setState({
        sessionChrono: null,
        soldeParMOP: null,
        devises: [],
      });

      await store.handlePrint();

      const state = useSessionOuvertureStore.getState();
      expect(state.error).toBe('Donnees session manquantes');
    });

    it('should handle print API errors', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as never);

      vi.mocked(apiClient.post).mockRejectedValueOnce(new Error('Printer offline'));

      const store = useSessionOuvertureStore.getState();
      useSessionOuvertureStore.setState({
        sessionChrono: 42,
        soldeParMOP: MOCK_SOLDE_PAR_MOP,
        devises: MOCK_DEVISES,
      });

      await store.handlePrint();

      const state = useSessionOuvertureStore.getState();
      expect(state.error).toBe('Printer offline');
    });
  });

  describe('handleBack', () => {
    it('should go back from validation to comptage', () => {
      const store = useSessionOuvertureStore.getState();
      useSessionOuvertureStore.setState({ currentStep: SESSION_STEPS.VALIDATION });

      store.handleBack();

      const state = useSessionOuvertureStore.getState();
      expect(state.currentStep).toBe(SESSION_STEPS.COMPTAGE);
      expect(state.error).toBe(null);
    });

    it('should not go back from comptage step', () => {
      const store = useSessionOuvertureStore.getState();
      useSessionOuvertureStore.setState({ currentStep: SESSION_STEPS.COMPTAGE });

      store.handleBack();

      const state = useSessionOuvertureStore.getState();
      expect(state.currentStep).toBe(SESSION_STEPS.COMPTAGE);
    });

    it('should not go back from succes step', () => {
      const store = useSessionOuvertureStore.getState();
      useSessionOuvertureStore.setState({ currentStep: SESSION_STEPS.SUCCES });

      store.handleBack();

      const state = useSessionOuvertureStore.getState();
      expect(state.currentStep).toBe(SESSION_STEPS.SUCCES);
    });
  });

  describe('checkConcurrentSessions', () => {
    it('should return true when no concurrent sessions in mock mode', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: false } as never);

      const store = useSessionOuvertureStore.getState();
      const result = await store.checkConcurrentSessions();

      expect(result).toBe(true);
      const state = useSessionOuvertureStore.getState();
      expect(state.showConcurrentWarning).toBe(false);
      expect(state.concurrentSessions).toEqual([]);
    });

    it('should return false when concurrent sessions exist', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as never);

      const mockResponse: CheckConcurrentSessionsResponse = {
        success: true,
        message: 'Concurrent sessions found',
        data: {
          hasOpen: true,
          sessions: MOCK_CONCURRENT_SESSIONS,
          vilOpenSessions: true,
        },
      };

      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockResponse });

      const store = useSessionOuvertureStore.getState();
      const result = await store.checkConcurrentSessions();

      expect(result).toBe(false);
      const state = useSessionOuvertureStore.getState();
      expect(state.showConcurrentWarning).toBe(true);
      expect(state.concurrentSessions).toEqual(MOCK_CONCURRENT_SESSIONS);
      expect(state.vilOpenSessions).toBe(true);
    });

    it('should return true when no concurrent sessions', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as never);

      const mockResponse: CheckConcurrentSessionsResponse = {
        success: true,
        message: 'No concurrent sessions',
        data: {
          hasOpen: false,
          sessions: [],
          vilOpenSessions: false,
        },
      };

      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockResponse });

      const store = useSessionOuvertureStore.getState();
      const result = await store.checkConcurrentSessions();

      expect(result).toBe(true);
      const state = useSessionOuvertureStore.getState();
      expect(state.showConcurrentWarning).toBe(false);
      expect(state.concurrentSessions).toEqual([]);
    });

    it('should handle API errors during concurrent check', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as never);

      vi.mocked(apiClient.get).mockRejectedValueOnce(new Error('Connection failed'));

      const store = useSessionOuvertureStore.getState();
      const result = await store.checkConcurrentSessions();

      expect(result).toBe(false);
      const state = useSessionOuvertureStore.getState();
      expect(state.error).toBe('Connection failed');
    });
  });

  describe('setCurrentStep', () => {
    it('should update current step', () => {
      const store = useSessionOuvertureStore.getState();
      store.setCurrentStep(SESSION_STEPS.VALIDATION);

      const state = useSessionOuvertureStore.getState();
      expect(state.currentStep).toBe(SESSION_STEPS.VALIDATION);
    });
  });

  describe('setError', () => {
    it('should set error message', () => {
      const store = useSessionOuvertureStore.getState();
      store.setError('Test error');

      const state = useSessionOuvertureStore.getState();
      expect(state.error).toBe('Test error');
    });

    it('should clear error when null', () => {
      const store = useSessionOuvertureStore.getState();
      useSessionOuvertureStore.setState({ error: 'Existing error' });

      store.setError(null);

      const state = useSessionOuvertureStore.getState();
      expect(state.error).toBe(null);
    });
  });

  describe('resetState', () => {
    it('should reset all state to initial values', () => {
      const store = useSessionOuvertureStore.getState();
      useSessionOuvertureStore.setState({
        currentStep: SESSION_STEPS.SUCCES,
        isLoading: true,
        error: 'Some error',
        comptage: [...MOCK_DENOMINATIONS],
        devises: [...MOCK_DEVISES],
        soldeParMOP: MOCK_SOLDE_PAR_MOP,
        sessionChrono: 42,
        showConcurrentWarning: true,
        concurrentSessions: MOCK_CONCURRENT_SESSIONS,
        vilOpenSessions: true,
      });

      store.resetState();

      const state = useSessionOuvertureStore.getState();
      expect(state.currentStep).toBe(SESSION_STEPS.COMPTAGE);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(null);
      expect(state.comptage).toEqual([]);
      expect(state.devises).toEqual([]);
      expect(state.soldeParMOP).toBe(null);
      expect(state.sessionChrono).toBe(null);
      expect(state.showConcurrentWarning).toBe(false);
      expect(state.concurrentSessions).toEqual([]);
      expect(state.vilOpenSessions).toBe(false);
    });
  });
});