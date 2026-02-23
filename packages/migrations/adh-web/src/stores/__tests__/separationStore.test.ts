import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useSeparationStore } from '../separationStore';

vi.mock('@/services/api/endpoints-lot6', () => ({
  separationApi: {
    searchAccount: vi.fn(),
    validate: vi.fn(),
    execute: vi.fn(),
    getProgress: vi.fn(),
    getResult: vi.fn(),
  },
}));

vi.mock('@/stores/dataSourceStore', () => ({
  useDataSourceStore: {
    getState: () => ({ isRealApi: false }),
  },
}));

vi.mock('@/stores/sessionStore', () => ({
  useSessionStore: {
    getState: () => ({
      currentSession: { id: 'session-1', status: 'open' },
      status: 'open',
      checkNetworkClosure: vi.fn().mockResolvedValue({ status: 'completed' }),
    }),
  },
}));

const mockAccounts = [
  { codeAdherent: 1001, filiation: 0, nom: 'Dupont', prenom: 'Jean', societe: 'ADH', solde: 1250, nbTransactions: 45 },
  { codeAdherent: 1002, filiation: 0, nom: 'Martin', prenom: 'Marie', societe: 'ADH', solde: 890.5, nbTransactions: 23 },
];

describe('useSeparationStore', () => {
  beforeEach(() => {
    useSeparationStore.getState().reset();
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have default values', () => {
      const state = useSeparationStore.getState();
      expect(state.compteSource).toBeNull();
      expect(state.compteDestination).toBeNull();
      expect(state.preview).toBeNull();
      expect(state.result).toBeNull();
      expect(state.progress).toBeNull();
      expect(state.currentStep).toBe('selection');
      expect(state.searchResults).toEqual([]);
      expect(state.isSearching).toBe(false);
      expect(state.isValidating).toBe(false);
      expect(state.isExecuting).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('searchAccount', () => {
    it('should filter mock accounts by name', async () => {
      await useSeparationStore.getState().searchAccount('ADH', 'Dupont');

      const state = useSeparationStore.getState();
      expect(state.searchResults.length).toBeGreaterThan(0);
      expect(state.searchResults[0].nom).toBe('Dupont');
      expect(state.isSearching).toBe(false);
    });

    it('should return empty for non-matching query', async () => {
      await useSeparationStore.getState().searchAccount('ADH', 'zzzzz');

      expect(useSeparationStore.getState().searchResults).toEqual([]);
      expect(useSeparationStore.getState().isSearching).toBe(false);
    });
  });

  describe('selectSource', () => {
    it('should set source account', () => {
      useSeparationStore.getState().selectSource(mockAccounts[0] as never);
      expect(useSeparationStore.getState().compteSource).toEqual(mockAccounts[0]);
    });
  });

  describe('selectDestination', () => {
    it('should set destination account', () => {
      useSeparationStore.getState().selectDestination(mockAccounts[1] as never);
      expect(useSeparationStore.getState().compteDestination).toEqual(mockAccounts[1]);
    });
  });

  describe('validateSeparation', () => {
    it('should return error if accounts not selected', async () => {
      const result = await useSeparationStore.getState().validateSeparation('ADH', 'user1');
      expect(result).toEqual({ success: false, error: 'Comptes source et destination requis' });
    });

    it('should validate and set preview on success in mock mode', async () => {
      useSeparationStore.setState({
        compteSource: mockAccounts[0] as never,
        compteDestination: mockAccounts[1] as never,
      });

      const result = await useSeparationStore.getState().validateSeparation('ADH', 'user1');

      expect(result).toEqual({ success: true });
      const state = useSeparationStore.getState();
      expect(state.preview).not.toBeNull();
      expect(state.currentStep).toBe('preview');
      expect(state.isValidating).toBe(false);
    });
  });

  describe('executeSeparation', () => {
    it('should return error if accounts not selected', async () => {
      const result = await useSeparationStore.getState().executeSeparation('ADH', 'user1');
      expect(result).toEqual({ success: false, error: 'Comptes source et destination requis' });
    });

    it('should execute and set result in mock mode', async () => {
      useSeparationStore.setState({
        compteSource: mockAccounts[0] as never,
        compteDestination: mockAccounts[1] as never,
      });

      const result = await useSeparationStore.getState().executeSeparation('ADH', 'user1');

      expect(result.success).toBe(true);
      const state = useSeparationStore.getState();
      expect(state.result).not.toBeNull();
      expect(state.result!.success).toBe(true);
      expect(state.currentStep).toBe('result');
      expect(state.isExecuting).toBe(false);
    });
  });

  describe('pollProgress', () => {
    it('should set result in mock mode', async () => {
      useSeparationStore.setState({
        compteSource: mockAccounts[0] as never,
        compteDestination: mockAccounts[1] as never,
      });

      await useSeparationStore.getState().pollProgress('op-001');

      const state = useSeparationStore.getState();
      expect(state.result).not.toBeNull();
      expect(state.currentStep).toBe('result');
    });
  });

  describe('setStep', () => {
    it('should change the current step', () => {
      useSeparationStore.getState().setStep('preview');
      expect(useSeparationStore.getState().currentStep).toBe('preview');
    });
  });

  describe('reset', () => {
    it('should reset all state', () => {
      useSeparationStore.setState({
        compteSource: mockAccounts[0] as never,
        compteDestination: mockAccounts[1] as never,
        currentStep: 'result',
        error: 'error',
      });

      useSeparationStore.getState().reset();

      const state = useSeparationStore.getState();
      expect(state.compteSource).toBeNull();
      expect(state.compteDestination).toBeNull();
      expect(state.currentStep).toBe('selection');
      expect(state.error).toBeNull();
    });
  });

  describe('retryFailedStep', () => {
    it('should clear failedStep and error', () => {
      useSeparationStore.setState({
        failedStep: { name: 'test', error: 'err' },
        error: 'err',
      });

      useSeparationStore.getState().retryFailedStep();

      expect(useSeparationStore.getState().failedStep).toBeNull();
      expect(useSeparationStore.getState().error).toBeNull();
    });
  });

  describe('markFailedStepDone', () => {
    it('should mark as done with result', () => {
      useSeparationStore.setState({
        compteSource: mockAccounts[0] as never,
        compteDestination: mockAccounts[1] as never,
        failedStep: { name: 'test', error: 'err' },
        isExecuting: true,
      });

      useSeparationStore.getState().markFailedStepDone();

      const state = useSeparationStore.getState();
      expect(state.failedStep).toBeNull();
      expect(state.result).not.toBeNull();
      expect(state.currentStep).toBe('result');
      expect(state.isExecuting).toBe(false);
    });
  });

  describe('skipFailedStep', () => {
    it('should skip with unsuccessful result', () => {
      useSeparationStore.setState({
        compteSource: mockAccounts[0] as never,
        compteDestination: mockAccounts[1] as never,
        failedStep: { name: 'test', error: 'err' },
        isExecuting: true,
      });

      useSeparationStore.getState().skipFailedStep();

      const state = useSeparationStore.getState();
      expect(state.failedStep).toBeNull();
      expect(state.result).not.toBeNull();
      expect(state.result!.success).toBe(false);
      expect(state.currentStep).toBe('result');
      expect(state.isExecuting).toBe(false);
    });
  });

  describe('loadFiliations', () => {
    it('should load mock filiations for known account', async () => {
      await useSeparationStore.getState().loadFiliations('1001');
      expect(useSeparationStore.getState().filiations.length).toBe(2);
    });

    it('should return empty for unknown account', async () => {
      await useSeparationStore.getState().loadFiliations('9999');
      expect(useSeparationStore.getState().filiations).toEqual([]);
    });
  });
});
