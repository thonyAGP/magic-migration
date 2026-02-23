import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useGarantieStore } from '../garantieStore';

vi.mock('@/services/api/endpoints-lot4', () => ({
  garantieApi: {
    search: vi.fn(),
    getById: vi.fn(),
    getOperations: vi.fn(),
    getSummary: vi.fn(),
    create: vi.fn(),
    versement: vi.fn(),
    retrait: vi.fn(),
    cancel: vi.fn(),
  },
}));

vi.mock('../dataSourceStore', () => ({
  useDataSourceStore: {
    getState: vi.fn(() => ({ isRealApi: true })),
  },
}));

import { garantieApi } from '@/services/api/endpoints-lot4';
import { useDataSourceStore } from '../dataSourceStore';

const mockGarantie = {
  id: 1,
  societe: 'ADH',
  codeAdherent: 1001,
  filiation: 0,
  nomAdherent: 'DUPONT Jean',
  type: 'depot' as const,
  statut: 'active' as const,
  montant: 500,
  devise: 'EUR',
  dateCreation: '2026-02-10',
  dateExpiration: '2026-03-10',
  description: 'Depot garantie chambre',
  operateur: 'CAISSIER1',
  articles: [],
};

const mockSearchResult = {
  garanties: [mockGarantie],
  total: 1,
};

const mockOperations = [
  { id: 1, garantieId: 1, type: 'depot' as const, montant: 500, date: '2026-02-10', heure: '09:00', operateur: 'CAISSIER1', motif: 'Initial' },
];

const mockSummary = {
  totalDepots: 10,
  totalActifs: 8,
  montantTotal: 5000,
  devise: 'EUR',
};

describe('useGarantieStore', () => {
  beforeEach(() => {
    useGarantieStore.setState({
      currentGarantie: null,
      operations: [],
      summary: null,
      searchResults: null,
      selectedArticle: null,
      isSearching: false,
      isLoadingGarantie: false,
      isLoadingOperations: false,
      isLoadingSummary: false,
      isSubmitting: false,
      isCancelling: false,
      error: null,
    });
    vi.clearAllMocks();
    vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as never);
  });

  describe('initial state', () => {
    it('should have default values', () => {
      const state = useGarantieStore.getState();
      expect(state.currentGarantie).toBeNull();
      expect(state.operations).toEqual([]);
      expect(state.summary).toBeNull();
      expect(state.searchResults).toBeNull();
      expect(state.isSearching).toBe(false);
      expect(state.isLoadingGarantie).toBe(false);
      expect(state.isSubmitting).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('searchGarantie', () => {
    it('should set search results on success', async () => {
      vi.mocked(garantieApi.search).mockResolvedValue({
        data: { data: mockSearchResult },
      } as never);

      await useGarantieStore.getState().searchGarantie('ADH', 'Dupont');

      expect(useGarantieStore.getState().searchResults).toEqual(mockSearchResult);
      expect(useGarantieStore.getState().isSearching).toBe(false);
    });

    it('should set error on failure', async () => {
      vi.mocked(garantieApi.search).mockRejectedValue(new Error('Search failed'));

      await useGarantieStore.getState().searchGarantie('ADH', 'test');

      expect(useGarantieStore.getState().searchResults).toBeNull();
      expect(useGarantieStore.getState().error).toBe('Search failed');
    });

    it('should clear error before search', async () => {
      useGarantieStore.setState({ error: 'old error' });
      vi.mocked(garantieApi.search).mockResolvedValue({
        data: { data: mockSearchResult },
      } as never);

      await useGarantieStore.getState().searchGarantie('ADH', 'test');
      expect(useGarantieStore.getState().error).toBeNull();
    });
  });

  describe('loadGarantie', () => {
    it('should load garantie on success', async () => {
      vi.mocked(garantieApi.getById).mockResolvedValue({
        data: { data: mockGarantie },
      } as never);

      await useGarantieStore.getState().loadGarantie(1);

      expect(useGarantieStore.getState().currentGarantie).toEqual(mockGarantie);
      expect(useGarantieStore.getState().isLoadingGarantie).toBe(false);
    });

    it('should set null on failure', async () => {
      vi.mocked(garantieApi.getById).mockRejectedValue(new Error('Not found'));

      await useGarantieStore.getState().loadGarantie(999);

      expect(useGarantieStore.getState().currentGarantie).toBeNull();
      expect(useGarantieStore.getState().error).toBe('Not found');
    });
  });

  describe('loadOperations', () => {
    it('should load operations on success', async () => {
      vi.mocked(garantieApi.getOperations).mockResolvedValue({
        data: { data: mockOperations },
      } as never);

      await useGarantieStore.getState().loadOperations(1);

      expect(useGarantieStore.getState().operations).toEqual(mockOperations);
    });

    it('should set empty on failure', async () => {
      vi.mocked(garantieApi.getOperations).mockRejectedValue(new Error('fail'));

      await useGarantieStore.getState().loadOperations(1);

      expect(useGarantieStore.getState().operations).toEqual([]);
    });
  });

  describe('loadSummary', () => {
    it('should load summary on success', async () => {
      vi.mocked(garantieApi.getSummary).mockResolvedValue({
        data: { data: mockSummary },
      } as never);

      await useGarantieStore.getState().loadSummary('ADH');

      expect(useGarantieStore.getState().summary).toEqual(mockSummary);
    });

    it('should set null on failure', async () => {
      vi.mocked(garantieApi.getSummary).mockRejectedValue(new Error('fail'));

      await useGarantieStore.getState().loadSummary('ADH');

      expect(useGarantieStore.getState().summary).toBeNull();
    });
  });

  describe('createDepot', () => {
    it('should create depot and reload summary', async () => {
      vi.mocked(garantieApi.create).mockResolvedValue({
        data: { data: { id: 2 } },
      } as never);
      vi.mocked(garantieApi.getSummary).mockResolvedValue({
        data: { data: mockSummary },
      } as never);

      const result = await useGarantieStore.getState().createDepot({
        societe: 'ADH',
        codeAdherent: 1001,
        filiation: 0,
        montant: 300,
        devise: 'EUR',
        description: 'Test',
      });

      expect(result).toEqual({ success: true });
      expect(garantieApi.getSummary).toHaveBeenCalledWith('ADH');
      expect(useGarantieStore.getState().isSubmitting).toBe(false);
    });

    it('should return error on failure', async () => {
      vi.mocked(garantieApi.create).mockRejectedValue(new Error('Montant invalide'));

      const result = await useGarantieStore.getState().createDepot({
        societe: 'ADH',
        codeAdherent: 1001,
        filiation: 0,
        montant: -100,
        devise: 'EUR',
        description: 'Test',
      });

      expect(result).toEqual({ success: false, error: 'Montant invalide' });
      expect(useGarantieStore.getState().error).toBe('Montant invalide');
    });
  });

  describe('recordVersement', () => {
    it('should record and reload garantie + operations', async () => {
      vi.mocked(garantieApi.versement).mockResolvedValue({ data: { data: undefined } } as never);
      vi.mocked(garantieApi.getById).mockResolvedValue({ data: { data: mockGarantie } } as never);
      vi.mocked(garantieApi.getOperations).mockResolvedValue({ data: { data: mockOperations } } as never);

      const result = await useGarantieStore.getState().recordVersement(1, 200, 'Complement');

      expect(result).toEqual({ success: true });
      expect(garantieApi.getById).toHaveBeenCalledWith(1);
      expect(garantieApi.getOperations).toHaveBeenCalledWith(1);
    });

    it('should return error on failure', async () => {
      vi.mocked(garantieApi.versement).mockRejectedValue(new Error('Limite depassee'));

      const result = await useGarantieStore.getState().recordVersement(1, 10000, 'Too much');

      expect(result).toEqual({ success: false, error: 'Limite depassee' });
    });
  });

  describe('recordRetrait', () => {
    it('should record retrait and reload', async () => {
      vi.mocked(garantieApi.retrait).mockResolvedValue({ data: { data: undefined } } as never);
      vi.mocked(garantieApi.getById).mockResolvedValue({ data: { data: mockGarantie } } as never);
      vi.mocked(garantieApi.getOperations).mockResolvedValue({ data: { data: mockOperations } } as never);

      const result = await useGarantieStore.getState().recordRetrait(1, 100, 'Remboursement');

      expect(result).toEqual({ success: true });
    });

    it('should return error on failure', async () => {
      vi.mocked(garantieApi.retrait).mockRejectedValue(new Error('Solde insuffisant'));

      const result = await useGarantieStore.getState().recordRetrait(1, 10000, 'Too much');

      expect(result).toEqual({ success: false, error: 'Solde insuffisant' });
    });
  });

  describe('cancelGarantie', () => {
    it('should cancel and reload garantie', async () => {
      vi.mocked(garantieApi.cancel).mockResolvedValue({ data: { data: undefined } } as never);
      vi.mocked(garantieApi.getById).mockResolvedValue({ data: { data: { ...mockGarantie, statut: 'annulee' as const } } } as never);

      const result = await useGarantieStore.getState().cancelGarantie(1, 'Client parti');

      expect(result).toEqual({ success: true });
      expect(useGarantieStore.getState().isCancelling).toBe(false);
    });

    it('should return error on failure', async () => {
      vi.mocked(garantieApi.cancel).mockRejectedValue(new Error('Operation non permise'));

      const result = await useGarantieStore.getState().cancelGarantie(1, 'motif');

      expect(result).toEqual({ success: false, error: 'Operation non permise' });
      expect(useGarantieStore.getState().isCancelling).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all state', () => {
      useGarantieStore.setState({
        currentGarantie: mockGarantie as never,
        operations: mockOperations as never,
        summary: mockSummary as never,
        searchResults: mockSearchResult as never,
        error: 'error',
      });

      useGarantieStore.getState().reset();

      const state = useGarantieStore.getState();
      expect(state.currentGarantie).toBeNull();
      expect(state.operations).toEqual([]);
      expect(state.summary).toBeNull();
      expect(state.searchResults).toBeNull();
      expect(state.error).toBeNull();
    });
  });
});