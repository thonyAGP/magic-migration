// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useCaisseOpsStore } from '../caisseOpsStore';

vi.mock('@/services/api/endpoints-caisse-ops', () => ({
  caisseOpsApi: {
    apportCoffre: vi.fn(),
    apportProduits: vi.fn(),
    remiseCoffre: vi.fn(),
    telecollecte: vi.fn(),
    getPointage: vi.fn(),
    regularisation: vi.fn(),
  },
}));

vi.mock('../dataSourceStore', () => ({
  useDataSourceStore: {
    getState: vi.fn(() => ({ isRealApi: false })),
  },
}));

describe('useCaisseOpsStore', () => {
  beforeEach(() => {
    useCaisseOpsStore.getState().reset();
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have default values after reset', () => {
      const state = useCaisseOpsStore.getState();
      expect(state.currentOp).toBeNull();
      expect(state.isExecuting).toBe(false);
      expect(state.error).toBeNull();
      expect(state.lastResult).toBeNull();
      expect(state.telecollecteResult).toBeNull();
      expect(state.pointageData).toBeNull();
      expect(state.isLoadingPointage).toBe(false);
    });
  });

  describe('setCurrentOp', () => {
    it('should set current operation type', () => {
      useCaisseOpsStore.getState().setCurrentOp('APPORT_COFFRE');
      expect(useCaisseOpsStore.getState().currentOp).toBe('APPORT_COFFRE');
    });

    it('should clear error when setting new op', () => {
      useCaisseOpsStore.setState({ error: 'some error' });
      useCaisseOpsStore.getState().setCurrentOp('REMISE_COFFRE');
      expect(useCaisseOpsStore.getState().error).toBeNull();
    });

    it('should accept null to clear current op', () => {
      useCaisseOpsStore.getState().setCurrentOp('APPORT_COFFRE');
      useCaisseOpsStore.getState().setCurrentOp(null);
      expect(useCaisseOpsStore.getState().currentOp).toBeNull();
    });
  });

  describe('executeApportCoffre - mock mode', () => {
    it('should create a mock operation result', async () => {
      await useCaisseOpsStore.getState().executeApportCoffre({
        montant: 500,
        deviseCode: 'EUR',
      });

      const state = useCaisseOpsStore.getState();
      expect(state.lastResult).not.toBeNull();
      expect(state.lastResult?.type).toBe('APPORT_COFFRE');
      expect(state.lastResult?.montant).toBe(500);
      expect(state.lastResult?.deviseCode).toBe('EUR');
      expect(state.isExecuting).toBe(false);
    });

    it('should set status to termine', async () => {
      await useCaisseOpsStore.getState().executeApportCoffre({
        montant: 100,
        deviseCode: 'EUR',
      });

      expect(useCaisseOpsStore.getState().lastResult?.status).toBe('termine');
    });
  });

  describe('executeTelecollecte - mock mode', () => {
    it('should return mock telecollecte result', async () => {
      await useCaisseOpsStore.getState().executeTelecollecte({
        montantTotal: 1200,
      });

      const state = useCaisseOpsStore.getState();
      expect(state.telecollecteResult).not.toBeNull();
      expect(state.telecollecteResult?.success).toBe(true);
      expect(state.telecollecteResult?.montantCollecte).toBe(1200);
      expect(state.telecollecteResult?.nbTransactionsTraitees).toBe(45);
      expect(state.isExecuting).toBe(false);
    });
  });

  describe('loadPointage - mock mode', () => {
    it('should load mock pointage data', async () => {
      await useCaisseOpsStore.getState().loadPointage('EUR');

      const state = useCaisseOpsStore.getState();
      expect(state.pointageData).not.toBeNull();
      expect(state.pointageData?.deviseCode).toBe('EUR');
      expect(state.pointageData?.comptages).toHaveLength(3);
      expect(state.isLoadingPointage).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all state to initial values', async () => {
      // Modify state
      useCaisseOpsStore.getState().setCurrentOp('TELECOLLECTE');
      await useCaisseOpsStore.getState().executeApportCoffre({
        montant: 500,
        deviseCode: 'EUR',
      });

      // Reset
      useCaisseOpsStore.getState().reset();

      const state = useCaisseOpsStore.getState();
      expect(state.currentOp).toBeNull();
      expect(state.isExecuting).toBe(false);
      expect(state.error).toBeNull();
      expect(state.lastResult).toBeNull();
      expect(state.telecollecteResult).toBeNull();
    });
  });
});
