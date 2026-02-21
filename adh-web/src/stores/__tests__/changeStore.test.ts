// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useChangeStore } from '../changeStore';
import { useDataSourceStore } from '../dataSourceStore';

vi.mock('@/services/api/endpoints-lot3', () => ({
  changeApi: {
    getDevises: vi.fn(),
    getStock: vi.fn(),
    getOperations: vi.fn(),
    createOperation: vi.fn(),
    cancelOperation: vi.fn(),
  },
}));

vi.mock('../dataSourceStore', () => ({
  useDataSourceStore: {
    getState: vi.fn(() => ({ isRealApi: true })),
  },
}));

import { changeApi } from '@/services/api/endpoints-lot3';

const mockDevises = [
  { code: 'USD', libelle: 'Dollar US', symbole: '$', tauxActuel: 1.0856, nbDecimales: 2 },
  { code: 'GBP', libelle: 'Livre Sterling', symbole: '£', tauxActuel: 0.8534, nbDecimales: 2 },
];

const mockStock = [
  { deviseCode: 'USD', deviseLibelle: 'Dollar US', montant: 5000, nbOperations: 12 },
  { deviseCode: 'GBP', deviseLibelle: 'Livre Sterling', montant: 2000, nbOperations: 8 },
];

const mockOperations = [
  { id: 1, type: 'achat' as const, deviseCode: 'USD', deviseLibelle: 'Dollar US', montant: 100, taux: 1.08, contreValeur: 92.59, modePaiement: 'ESP', date: '2026-02-10', heure: '10:00', operateur: 'user1', annule: false },
];

const mockSummary = {
  totalAchats: 500,
  totalVentes: 300,
  nbOperations: 5,
};

describe('useChangeStore', () => {
  beforeEach(() => {
    useChangeStore.setState({
      devises: [],
      stock: [],
      operations: [],
      summary: null,
      isLoadingDevises: false,
      isLoadingStock: false,
      isLoadingOperations: false,
      isSubmitting: false,
      isCancelling: false,
      error: null,
    });
    vi.clearAllMocks();
    vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as never);
  });

  describe('initial state', () => {
    it('should have default values', () => {
      const state = useChangeStore.getState();
      expect(state.devises).toEqual([]);
      expect(state.stock).toEqual([]);
      expect(state.operations).toEqual([]);
      expect(state.summary).toBeNull();
      expect(state.isLoadingDevises).toBe(false);
      expect(state.isLoadingStock).toBe(false);
      expect(state.isLoadingOperations).toBe(false);
      expect(state.isSubmitting).toBe(false);
      expect(state.isCancelling).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('loadDevises', () => {
    it('should load devises on success', async () => {
      vi.mocked(changeApi.getDevises).mockResolvedValue({
        data: { data: mockDevises },
      } as never);

      await useChangeStore.getState().loadDevises('ADH');

      const state = useChangeStore.getState();
      expect(state.devises).toEqual(mockDevises);
      expect(state.isLoadingDevises).toBe(false);
    });

    it('should use mock devises on API failure', async () => {
      vi.mocked(changeApi.getDevises).mockRejectedValue(new Error('fail'));

      await useChangeStore.getState().loadDevises('ADH');

      const state = useChangeStore.getState();
      expect(state.devises).toEqual([]);
      expect(state.error).toBe('fail');
      expect(state.isLoadingDevises).toBe(false);
    });

    it('should use mock devises when API returns empty array', async () => {
      vi.mocked(changeApi.getDevises).mockResolvedValue({
        data: { data: [] },
      } as never);

      await useChangeStore.getState().loadDevises('ADH');

      expect(useChangeStore.getState().devises).toEqual([]);
    });

    it('should set isLoadingDevises during load', async () => {
      let resolve: (v: unknown) => void;
      const promise = new Promise((r) => { resolve = r; });
      vi.mocked(changeApi.getDevises).mockReturnValue(promise as never);

      const loadPromise = useChangeStore.getState().loadDevises('ADH');
      expect(useChangeStore.getState().isLoadingDevises).toBe(true);

      resolve!({ data: { data: mockDevises } });
      await loadPromise;
      expect(useChangeStore.getState().isLoadingDevises).toBe(false);
    });
  });

  describe('loadStock', () => {
    it('should load stock on success', async () => {
      vi.mocked(changeApi.getStock).mockResolvedValue({
        data: { data: mockStock },
      } as never);

      await useChangeStore.getState().loadStock('ADH');

      expect(useChangeStore.getState().stock).toEqual(mockStock);
      expect(useChangeStore.getState().isLoadingStock).toBe(false);
    });

    it('should set empty stock on failure', async () => {
      vi.mocked(changeApi.getStock).mockRejectedValue(new Error('fail'));

      await useChangeStore.getState().loadStock('ADH');

      expect(useChangeStore.getState().stock).toEqual([]);
      expect(useChangeStore.getState().isLoadingStock).toBe(false);
    });

    it('should handle null data', async () => {
      vi.mocked(changeApi.getStock).mockResolvedValue({
        data: { data: null },
      } as never);

      await useChangeStore.getState().loadStock('ADH');
      expect(useChangeStore.getState().stock).toEqual([]);
    });
  });

  describe('loadOperations', () => {
    it('should load operations and summary on success', async () => {
      vi.mocked(changeApi.getOperations).mockResolvedValue({
        data: { data: { operations: mockOperations, summary: mockSummary } },
      } as never);

      await useChangeStore.getState().loadOperations('ADH');

      const state = useChangeStore.getState();
      expect(state.operations).toEqual(mockOperations);
      expect(state.summary).toEqual(mockSummary);
      expect(state.isLoadingOperations).toBe(false);
    });

    it('should set empty on failure', async () => {
      vi.mocked(changeApi.getOperations).mockRejectedValue(new Error('fail'));

      await useChangeStore.getState().loadOperations('ADH');

      expect(useChangeStore.getState().operations).toEqual([]);
      expect(useChangeStore.getState().summary).toBeNull();
    });
  });

  describe('createOperation', () => {
    it('should create and reload on success', async () => {
      vi.mocked(changeApi.createOperation).mockResolvedValue({
        data: { data: { id: 1 } },
      } as never);
      vi.mocked(changeApi.getOperations).mockResolvedValue({
        data: { data: { operations: mockOperations, summary: mockSummary } },
      } as never);
      vi.mocked(changeApi.getStock).mockResolvedValue({
        data: { data: mockStock },
      } as never);

      const result = await useChangeStore.getState().createOperation(
        'ADH', 'achat', 'USD', 100, 1.08, 'ESP', 'user1',
      );

      expect(result).toEqual({ success: true });
      expect(useChangeStore.getState().isSubmitting).toBe(false);
      expect(changeApi.getOperations).toHaveBeenCalledWith('ADH');
      expect(changeApi.getStock).toHaveBeenCalledWith('ADH');
    });

    it('should return error on failure', async () => {
      vi.mocked(changeApi.createOperation).mockRejectedValue(new Error('Insufficient stock'));

      const result = await useChangeStore.getState().createOperation(
        'ADH', 'vente', 'USD', 1000, 1.08, 'ESP', 'user1',
      );

      expect(result).toEqual({ success: false, error: 'Insufficient stock' });
      expect(useChangeStore.getState().error).toBe('Insufficient stock');
      expect(useChangeStore.getState().isSubmitting).toBe(false);
    });

    it('should set isSubmitting during creation', async () => {
      let resolve: (v: unknown) => void;
      const promise = new Promise((r) => { resolve = r; });
      vi.mocked(changeApi.createOperation).mockReturnValue(promise as never);
      vi.mocked(changeApi.getOperations).mockResolvedValue({
        data: { data: { operations: [], summary: null } },
      } as never);
      vi.mocked(changeApi.getStock).mockResolvedValue({
        data: { data: [] },
      } as never);

      const createPromise = useChangeStore.getState().createOperation(
        'ADH', 'achat', 'USD', 100, 1.08, 'ESP', 'user1',
      );
      expect(useChangeStore.getState().isSubmitting).toBe(true);

      resolve!({ data: { data: { id: 1 } } });
      await createPromise;
      expect(useChangeStore.getState().isSubmitting).toBe(false);
    });
  });

  describe('cancelOperation', () => {
    it('should mark operation as cancelled locally', async () => {
      useChangeStore.setState({ operations: mockOperations as never });
      vi.mocked(changeApi.cancelOperation).mockResolvedValue({
        data: { data: undefined },
      } as never);

      const result = await useChangeStore.getState().cancelOperation(1, 'Erreur saisie');

      expect(result).toEqual({ success: true });
      expect(useChangeStore.getState().operations[0].annule).toBe(true);
      expect(useChangeStore.getState().isCancelling).toBe(false);
    });

    it('should return error on failure', async () => {
      vi.mocked(changeApi.cancelOperation).mockRejectedValue(new Error('Not allowed'));

      const result = await useChangeStore.getState().cancelOperation(1, 'motif');

      expect(result).toEqual({ success: false, error: 'Not allowed' });
      expect(useChangeStore.getState().error).toBe('Not allowed');
      expect(useChangeStore.getState().isCancelling).toBe(false);
    });

    it('should handle non-Error exceptions', async () => {
      vi.mocked(changeApi.cancelOperation).mockRejectedValue('unknown');

      const result = await useChangeStore.getState().cancelOperation(1, 'motif');

      expect(result.error).toBe("Erreur lors de l'annulation");
    });
  });

  describe('reset', () => {
    it('should reset all state', () => {
      useChangeStore.setState({
        devises: mockDevises as never,
        stock: mockStock as never,
        operations: mockOperations as never,
        summary: mockSummary as never,
        isSubmitting: true,
        error: 'old error',
      });

      useChangeStore.getState().reset();

      const state = useChangeStore.getState();
      expect(state.devises).toEqual([]);
      expect(state.stock).toEqual([]);
      expect(state.operations).toEqual([]);
      expect(state.summary).toBeNull();
      expect(state.error).toBeNull();
    });
  });
});