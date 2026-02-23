// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useFactureStore } from '../factureStore';

vi.mock('@/services/api/endpoints-lot4', () => ({
  factureApi: {
    search: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    updateLignes: vi.fn(),
    validate: vi.fn(),
    cancel: vi.fn(),
    print: vi.fn(),
  },
}));

vi.mock('../dataSourceStore', () => ({
  useDataSourceStore: {
    getState: vi.fn(() => ({ isRealApi: true })),
  },
}));

import { factureApi } from '@/services/api/endpoints-lot4';
import { useDataSourceStore } from '../dataSourceStore';

const mockFacture = {
  id: 1,
  reference: 'FAC-2026-001',
  societe: 'ADH',
  codeAdherent: 1001,
  filiation: 0,
  nomAdherent: 'DUPONT Jean',
  type: 'standard' as const,
  statut: 'draft' as const,
  dateEmission: '2026-02-10',
  dateEcheance: '2026-03-10',
  montantHT: 100,
  montantTVA: 20,
  montantTTC: 120,
  devise: 'EUR',
  commentaire: '',
  operateur: 'CAISSIER1',
  dateCreation: '2026-02-10',
  lignes: [],
  totalHT: 100,
  totalTVA: 20,
  totalTTC: 120,
};

const mockSearchResult = {
  factures: [mockFacture],
  total: 1,
};

const mockSummary = {
  totalHT: 100,
  totalTVA: 20,
  totalTTC: 120,
  ventilationTVA: [{ tauxTVA: 20, baseHT: 100, montantTVA: 20 }],
};

describe('useFactureStore', () => {
  beforeEach(() => {
    useFactureStore.setState({
      currentFacture: null,
      searchResults: null,
      summary: null,
      isSearching: false,
      isLoadingFacture: false,
      isSubmitting: false,
      isValidating: false,
      isCancelling: false,
      isPrinting: false,
      error: null,
    });
    vi.clearAllMocks();
    vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as never);
  });

  describe('initial state', () => {
    it('should have default values', () => {
      const state = useFactureStore.getState();
      expect(state.currentFacture).toBeNull();
      expect(state.searchResults).toBeNull();
      expect(state.summary).toBeNull();
      expect(state.isSearching).toBe(false);
      expect(state.isLoadingFacture).toBe(false);
      expect(state.isSubmitting).toBe(false);
      expect(state.isValidating).toBe(false);
      expect(state.isCancelling).toBe(false);
      expect(state.isPrinting).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('searchFactures', () => {
    it('should set search results on success', async () => {
      vi.mocked(factureApi.search).mockResolvedValue({
        data: { data: mockSearchResult },
      } as never);

      await useFactureStore.getState().searchFactures('ADH', 'FAC');

      expect(useFactureStore.getState().searchResults).toEqual(mockSearchResult);
      expect(useFactureStore.getState().isSearching).toBe(false);
    });

    it('should set error on failure', async () => {
      vi.mocked(factureApi.search).mockRejectedValue(new Error('Search failed'));

      await useFactureStore.getState().searchFactures('ADH');

      expect(useFactureStore.getState().searchResults).toBeNull();
      expect(useFactureStore.getState().error).toBe('Search failed');
    });

    it('should clear previous error', async () => {
      useFactureStore.setState({ error: 'old' });
      vi.mocked(factureApi.search).mockResolvedValue({
        data: { data: mockSearchResult },
      } as never);

      await useFactureStore.getState().searchFactures('ADH');
      expect(useFactureStore.getState().error).toBeNull();
    });
  });

  describe('loadFacture', () => {
    it('should load facture on success', async () => {
      vi.mocked(factureApi.getById).mockResolvedValue({
        data: { data: mockFacture },
      } as never);

      await useFactureStore.getState().loadFacture(1);

      expect(useFactureStore.getState().currentFacture).toEqual(mockFacture);
      expect(useFactureStore.getState().isLoadingFacture).toBe(false);
    });

    it('should set null and error on failure', async () => {
      vi.mocked(factureApi.getById).mockRejectedValue(new Error('Not found'));

      await useFactureStore.getState().loadFacture(999);

      expect(useFactureStore.getState().currentFacture).toBeNull();
      expect(useFactureStore.getState().error).toBe('Not found');
    });
  });

  describe('createFacture', () => {
    it('should return success with id and reference', async () => {
      vi.mocked(factureApi.create).mockResolvedValue({
        data: { data: { id: 2, reference: 'FAC-2026-002' } },
      } as never);

      const result = await useFactureStore.getState().createFacture({
        societe: 'ADH',
        codeAdherent: 1001,
        filiation: 0,
        type: 'standard' as never,
      });

      expect(result).toEqual({ success: true, id: 2, reference: 'FAC-2026-002' });
      expect(useFactureStore.getState().isSubmitting).toBe(false);
    });

    it('should return error on failure', async () => {
      vi.mocked(factureApi.create).mockRejectedValue(new Error('Creation failed'));

      const result = await useFactureStore.getState().createFacture({
        societe: 'ADH',
        codeAdherent: 1001,
        filiation: 0,
        type: 'standard' as never,
      });

      expect(result).toEqual({ success: false, error: 'Creation failed' });
      expect(useFactureStore.getState().error).toBe('Creation failed');
    });
  });

  describe('updateLignes', () => {
    it('should update lignes and reload facture', async () => {
      vi.mocked(factureApi.updateLignes).mockResolvedValue({
        data: { data: mockSummary },
      } as never);
      vi.mocked(factureApi.getById).mockResolvedValue({
        data: { data: mockFacture },
      } as never);

      const lignes = [{ codeArticle: 'ART1', libelle: 'Article 1', quantite: 2, prixUnitaireHT: 50, tauxTVA: 20 }];
      const result = await useFactureStore.getState().updateLignes(1, lignes);

      expect(result).toEqual({ success: true });
      expect(useFactureStore.getState().summary).toEqual(mockSummary);
      expect(factureApi.getById).toHaveBeenCalledWith(1);
    });

    it('should return error on failure', async () => {
      vi.mocked(factureApi.updateLignes).mockRejectedValue(new Error('Invalid ligne'));

      const result = await useFactureStore.getState().updateLignes(1, []);

      expect(result).toEqual({ success: false, error: 'Invalid ligne' });
    });
  });

  describe('validateFacture', () => {
    it('should validate and reload facture', async () => {
      vi.mocked(factureApi.validate).mockResolvedValue({ data: { data: undefined } } as never);
      vi.mocked(factureApi.getById).mockResolvedValue({
        data: { data: { ...mockFacture, statut: 'validated' } },
      } as never);

      const result = await useFactureStore.getState().validateFacture(1, 'OK');

      expect(result).toEqual({ success: true });
      expect(useFactureStore.getState().isValidating).toBe(false);
    });

    it('should return error on failure', async () => {
      vi.mocked(factureApi.validate).mockRejectedValue(new Error('Validation failed'));

      const result = await useFactureStore.getState().validateFacture(1);

      expect(result).toEqual({ success: false, error: 'Validation failed' });
      expect(useFactureStore.getState().isValidating).toBe(false);
    });
  });

  describe('cancelFacture', () => {
    it('should cancel and reload facture', async () => {
      vi.mocked(factureApi.cancel).mockResolvedValue({ data: { data: undefined } } as never);
      vi.mocked(factureApi.getById).mockResolvedValue({
        data: { data: { ...mockFacture, statut: 'cancelled' } },
      } as never);

      const result = await useFactureStore.getState().cancelFacture(1, 'Erreur');

      expect(result).toEqual({ success: true });
      expect(useFactureStore.getState().isCancelling).toBe(false);
    });

    it('should return error on failure', async () => {
      vi.mocked(factureApi.cancel).mockRejectedValue(new Error('Cancel not allowed'));

      const result = await useFactureStore.getState().cancelFacture(1, 'motif');

      expect(result).toEqual({ success: false, error: 'Cancel not allowed' });
    });
  });

  describe('printFacture', () => {
    it('should print without error', async () => {
      vi.mocked(factureApi.print).mockResolvedValue({ data: { data: { jobId: 'j1' } } } as never);

      await useFactureStore.getState().printFacture(1);

      expect(useFactureStore.getState().isPrinting).toBe(false);
      expect(useFactureStore.getState().error).toBeNull();
    });

    it('should set error on print failure', async () => {
      vi.mocked(factureApi.print).mockRejectedValue(new Error('Printer error'));

      await useFactureStore.getState().printFacture(1);

      expect(useFactureStore.getState().error).toBe('Printer error');
      expect(useFactureStore.getState().isPrinting).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all state', () => {
      useFactureStore.setState({
        currentFacture: mockFacture as never,
        searchResults: mockSearchResult as never,
        summary: mockSummary as never,
        error: 'error',
        isValidating: true,
      });

      useFactureStore.getState().reset();

      const state = useFactureStore.getState();
      expect(state.currentFacture).toBeNull();
      expect(state.searchResults).toBeNull();
      expect(state.summary).toBeNull();
      expect(state.error).toBeNull();
      expect(state.isValidating).toBe(false);
    });
  });
});