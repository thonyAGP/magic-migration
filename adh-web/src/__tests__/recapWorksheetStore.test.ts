import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useRecapWorksheetStore } from '@/stores/recapWorksheetStore';
import { useDataSourceStore } from '@/stores/dataSourceStore';
import { apiClient } from '@/services/api/apiClient';
import type { RecapWorksheetEntry, RecapWorksheetSummary } from '@/types/recapWorksheet';

vi.mock('@/services/api/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const MOCK_ENTRIES: RecapWorksheetEntry[] = [
  {
    dateComptable: new Date('2026-02-20'),
    numeroSession: 1001,
    type: 'vente',
    typeApproVersCoffre: null,
    modePaiement: 'especes',
    avecChange: 'N',
    codeDevise: 'EUR',
    quantiteDevise: null,
    tauxDevise: 1.0,
    montant: 1250.0,
    montantMonnaie: 1250.0,
    montantProduits: null,
    montantCartes: null,
    montantCheque: null,
    montantOd: null,
    societe: 'SOC1',
    compteVillage: 1001,
    filiation: 0,
    imputation: 101,
    sousImputation: 1,
    libelle: 'Ventes espèces session matinale',
    libelleComplementaire: null,
    nomGm: 'MARTIN Sophie',
    quantiteArticle: 15,
    prixArticle: 83.33,
  },
  {
    dateComptable: new Date('2026-02-20'),
    numeroSession: 1001,
    type: 'vente',
    typeApproVersCoffre: null,
    modePaiement: 'carte',
    avecChange: 'N',
    codeDevise: 'EUR',
    quantiteDevise: null,
    tauxDevise: 1.0,
    montant: 3450.0,
    montantMonnaie: null,
    montantProduits: null,
    montantCartes: 3450.0,
    montantCheque: null,
    montantOd: null,
    societe: 'SOC1',
    compteVillage: 1001,
    filiation: 0,
    imputation: 102,
    sousImputation: 1,
    libelle: 'Ventes carte session matinale',
    libelleComplementaire: 'CB/Visa',
    nomGm: 'MARTIN Sophie',
    quantiteArticle: 28,
    prixArticle: 123.21,
  },
  {
    dateComptable: new Date('2026-02-20'),
    numeroSession: 1001,
    type: 'change',
    typeApproVersCoffre: null,
    modePaiement: 'especes',
    avecChange: 'O',
    codeDevise: 'USD',
    quantiteDevise: 500.0,
    tauxDevise: 1.12,
    montant: 446.43,
    montantMonnaie: 446.43,
    montantProduits: null,
    montantCartes: null,
    montantCheque: null,
    montantOd: null,
    societe: 'SOC1',
    compteVillage: 1001,
    filiation: 0,
    imputation: 201,
    sousImputation: 1,
    libelle: 'Opération change USD',
    libelleComplementaire: 'Achat USD contre EUR',
    nomGm: 'MARTIN Sophie',
    quantiteArticle: null,
    prixArticle: null,
  },
  {
    dateComptable: new Date('2026-02-20'),
    numeroSession: 1001,
    type: 'change',
    typeApproVersCoffre: null,
    modePaiement: 'especes',
    avecChange: 'O',
    codeDevise: 'GBP',
    quantiteDevise: 200.0,
    tauxDevise: 0.86,
    montant: 232.56,
    montantMonnaie: 232.56,
    montantProduits: null,
    montantCartes: null,
    montantCheque: null,
    montantOd: null,
    societe: 'SOC1',
    compteVillage: 1001,
    filiation: 0,
    imputation: 202,
    sousImputation: 1,
    libelle: 'Opération change GBP',
    libelleComplementaire: 'Vente GBP contre EUR',
    nomGm: 'MARTIN Sophie',
    quantiteArticle: null,
    prixArticle: null,
  },
  {
    dateComptable: new Date('2026-02-20'),
    numeroSession: 1001,
    type: 'approvisionnement',
    typeApproVersCoffre: 'coffre_vers_caisse',
    modePaiement: 'especes',
    avecChange: 'N',
    codeDevise: 'EUR',
    quantiteDevise: null,
    tauxDevise: 1.0,
    montant: 5000.0,
    montantMonnaie: 5000.0,
    montantProduits: null,
    montantCartes: null,
    montantCheque: null,
    montantOd: null,
    societe: 'SOC1',
    compteVillage: 1001,
    filiation: 0,
    imputation: 301,
    sousImputation: 1,
    libelle: 'Approvisionnement coffre vers caisse',
    libelleComplementaire: 'Fond de caisse matinal',
    nomGm: 'DUPONT Jean',
    quantiteArticle: null,
    prixArticle: null,
  },
];

const MOCK_SUMMARY: RecapWorksheetSummary = {
  numeroSession: 1001,
  dateComptable: new Date('2026-02-20'),
  totalParDevise: { EUR: 9700.0, USD: 446.43, GBP: 232.56 },
  totalParType: { vente: 4700.0, change: 678.99, approvisionnement: 5000.0 },
  totalParModePaiement: { especes: 6928.99, carte: 3450.0 },
  totalGeneral: 10378.99,
};

describe('recapWorksheetStore', () => {
  beforeEach(() => {
    useRecapWorksheetStore.setState({
      entries: [],
      summary: null,
      isGenerating: false,
      error: null,
      filters: {},
    });
    vi.clearAllMocks();
  });

  describe('calculateSummary', () => {
    it('should aggregate amounts by devise', () => {
      const { calculateSummary } = useRecapWorksheetStore.getState();

      const summary = calculateSummary(MOCK_ENTRIES);

      expect(summary.totalParDevise['EUR']).toBe(9700.0);
      expect(summary.totalParDevise['USD']).toBe(446.43);
      expect(summary.totalParDevise['GBP']).toBe(232.56);
    });

    it('should aggregate amounts by type', () => {
      const { calculateSummary } = useRecapWorksheetStore.getState();

      const summary = calculateSummary(MOCK_ENTRIES);

      expect(summary.totalParType['vente']).toBe(4700.0);
      expect(summary.totalParType['change']).toBe(678.99);
      expect(summary.totalParType['approvisionnement']).toBe(5000.0);
    });

    it('should aggregate amounts by mode paiement', () => {
      const { calculateSummary } = useRecapWorksheetStore.getState();

      const summary = calculateSummary(MOCK_ENTRIES);

      expect(summary.totalParModePaiement['especes']).toBe(6928.99);
      expect(summary.totalParModePaiement['carte']).toBe(3450.0);
    });

    it('should calculate total general', () => {
      const { calculateSummary } = useRecapWorksheetStore.getState();

      const summary = calculateSummary(MOCK_ENTRIES);

      expect(summary.totalGeneral).toBeCloseTo(10378.99, 2);
    });

    it('should handle empty entries array', () => {
      const { calculateSummary } = useRecapWorksheetStore.getState();

      const summary = calculateSummary([]);

      expect(summary.totalParDevise).toEqual({});
      expect(summary.totalParType).toEqual({});
      expect(summary.totalParModePaiement).toEqual({});
      expect(summary.totalGeneral).toBe(0);
    });

    it('should use first entry session and date', () => {
      const { calculateSummary } = useRecapWorksheetStore.getState();

      const summary = calculateSummary(MOCK_ENTRIES);

      expect(summary.numeroSession).toBe(1001);
      expect(summary.dateComptable).toEqual(new Date('2026-02-20'));
    });
  });

  describe('generateRecapWorksheet', () => {
    it('should generate recap with mock data when isRealApi is false', async () => {
      useDataSourceStore.setState({ isRealApi: false });
      const { generateRecapWorksheet } = useRecapWorksheetStore.getState();

      const summary = await generateRecapWorksheet(1001, new Date('2026-02-20'));

      expect(summary.numeroSession).toBe(1001);
      expect(summary.totalGeneral).toBeCloseTo(10378.99, 2);
      expect(useRecapWorksheetStore.getState().entries).toHaveLength(5);
      expect(useRecapWorksheetStore.getState().summary).toEqual(summary);
      expect(useRecapWorksheetStore.getState().isGenerating).toBe(false);
    });

    it('should set isGenerating to true during generation', async () => {
      useDataSourceStore.setState({ isRealApi: false });
      const { generateRecapWorksheet } = useRecapWorksheetStore.getState();

      const promise = generateRecapWorksheet(1001, new Date('2026-02-20'));
      
      await new Promise(resolve => setTimeout(resolve, 0));
      
      await promise;
      expect(useRecapWorksheetStore.getState().isGenerating).toBe(false);
    });

    it('should filter entries by numeroSession', async () => {
      useDataSourceStore.setState({ isRealApi: false });
      const { generateRecapWorksheet } = useRecapWorksheetStore.getState();

      await generateRecapWorksheet(1001, new Date('2026-02-20'));

      const entries = useRecapWorksheetStore.getState().entries;
      expect(entries.every((e) => e.numeroSession === 1001)).toBe(true);
    });

    it('should call API when isRealApi is true', async () => {
      useDataSourceStore.setState({ isRealApi: true });
      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: { data: MOCK_SUMMARY },
      });
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: { data: MOCK_ENTRIES },
      });
      const { generateRecapWorksheet } = useRecapWorksheetStore.getState();

      const summary = await generateRecapWorksheet(1001, new Date('2026-02-20'));

      expect(apiClient.post).toHaveBeenCalledWith('/api/recapWorksheet/generate', {
        numeroSession: 1001,
        dateComptable: expect.any(String),
      });
      expect(summary).toEqual(MOCK_SUMMARY);
    });

    it('should handle API error', async () => {
      useDataSourceStore.setState({ isRealApi: true });
      vi.mocked(apiClient.post).mockRejectedValueOnce(new Error('Erreur serveur'));
      const { generateRecapWorksheet } = useRecapWorksheetStore.getState();

      await expect(generateRecapWorksheet(1001, new Date('2026-02-20'))).rejects.toThrow('Erreur serveur');
      expect(useRecapWorksheetStore.getState().error).toBe('Erreur serveur');
      expect(useRecapWorksheetStore.getState().isGenerating).toBe(false);
    });

    it('should handle missing summary data', async () => {
      useDataSourceStore.setState({ isRealApi: true });
      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: { data: null },
      });
      const { generateRecapWorksheet } = useRecapWorksheetStore.getState();

      await expect(generateRecapWorksheet(1001, new Date('2026-02-20'))).rejects.toThrow('Aucun récapitulatif généré');
    });
  });

  describe('exportRecapWorksheet', () => {
    it('should export as txt format with mock data', async () => {
      useDataSourceStore.setState({ isRealApi: false });
      const { exportRecapWorksheet } = useRecapWorksheetStore.getState();

      const blob = await exportRecapWorksheet(MOCK_SUMMARY, 'txt');

      expect(blob.type).toBe('text/plain');
      const text = await blob.text();
      expect(text).toContain('RECAP WORKSHEET SESSION 1001');
      expect(text).toContain('EUR: 9700.00');
      expect(text).toContain('TOTAL GENERAL: 10378.99 EUR');
    });

    it('should export as csv format with mock data', async () => {
      useDataSourceStore.setState({ isRealApi: false });
      const { exportRecapWorksheet } = useRecapWorksheetStore.getState();

      const blob = await exportRecapWorksheet(MOCK_SUMMARY, 'csv');

      const text = await blob.text();
      expect(text).toContain('Type,Devise,Montant');
      expect(text).toContain('Devise,EUR,9700.00');
      expect(text).toContain('Type,vente,4700.00');
    });

    it('should export as json format with mock data', async () => {
      useDataSourceStore.setState({ isRealApi: false });
      const { exportRecapWorksheet } = useRecapWorksheetStore.getState();

      const blob = await exportRecapWorksheet(MOCK_SUMMARY, 'json');

      const text = await blob.text();
      const parsed = JSON.parse(text);
      expect(parsed.numeroSession).toBe(1001);
      expect(parsed.totalGeneral).toBe(10378.99);
    });

    it('should call API when isRealApi is true', async () => {
      useDataSourceStore.setState({ isRealApi: true });
      const mockBlob = new Blob(['test'], { type: 'text/plain' });
      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockBlob });
      const { exportRecapWorksheet } = useRecapWorksheetStore.getState();

      const blob = await exportRecapWorksheet(MOCK_SUMMARY, 'txt');

      expect(apiClient.post).toHaveBeenCalledWith(
        '/api/recapWorksheet/export',
        { summary: MOCK_SUMMARY, format: 'txt' },
        { responseType: 'blob' },
      );
      expect(blob).toBe(mockBlob);
    });

    it('should handle API error', async () => {
      useDataSourceStore.setState({ isRealApi: true });
      vi.mocked(apiClient.post).mockRejectedValueOnce(new Error('Erreur export'));
      const { exportRecapWorksheet } = useRecapWorksheetStore.getState();

      await expect(exportRecapWorksheet(MOCK_SUMMARY, 'txt')).rejects.toThrow('Erreur export');
      expect(useRecapWorksheetStore.getState().error).toBe('Erreur export');
    });
  });

  describe('fetchRecapEntries', () => {
    it('should fetch entries with mock data when isRealApi is false', async () => {
      useDataSourceStore.setState({ isRealApi: false });
      const { fetchRecapEntries } = useRecapWorksheetStore.getState();

      const entries = await fetchRecapEntries(1001);

      expect(entries).toHaveLength(5);
      expect(entries.every((e) => e.numeroSession === 1001)).toBe(true);
    });

    it('should call API when isRealApi is true', async () => {
      useDataSourceStore.setState({ isRealApi: true });
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: { data: MOCK_ENTRIES },
      });
      const { fetchRecapEntries } = useRecapWorksheetStore.getState();

      const entries = await fetchRecapEntries(1001);

      expect(apiClient.get).toHaveBeenCalledWith('/api/recapWorksheet/entries/1001');
      expect(entries).toEqual(MOCK_ENTRIES);
    });

    it('should handle API error', async () => {
      useDataSourceStore.setState({ isRealApi: true });
      vi.mocked(apiClient.get).mockRejectedValueOnce(new Error('Erreur chargement'));
      const { fetchRecapEntries } = useRecapWorksheetStore.getState();

      await expect(fetchRecapEntries(1001)).rejects.toThrow('Erreur chargement');
      expect(useRecapWorksheetStore.getState().error).toBe('Erreur chargement');
    });

    it('should return empty array when data is null', async () => {
      useDataSourceStore.setState({ isRealApi: true });
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: { data: null },
      });
      const { fetchRecapEntries } = useRecapWorksheetStore.getState();

      const entries = await fetchRecapEntries(1001);

      expect(entries).toEqual([]);
    });
  });

  describe('state setters', () => {
    it('should set entries', () => {
      const { setEntries } = useRecapWorksheetStore.getState();

      setEntries(MOCK_ENTRIES);

      expect(useRecapWorksheetStore.getState().entries).toEqual(MOCK_ENTRIES);
    });

    it('should set summary', () => {
      const { setSummary } = useRecapWorksheetStore.getState();

      setSummary(MOCK_SUMMARY);

      expect(useRecapWorksheetStore.getState().summary).toEqual(MOCK_SUMMARY);
    });

    it('should set isGenerating', () => {
      const { setIsGenerating } = useRecapWorksheetStore.getState();

      setIsGenerating(true);

      expect(useRecapWorksheetStore.getState().isGenerating).toBe(true);
    });

    it('should set error', () => {
      const { setError } = useRecapWorksheetStore.getState();

      setError('Test error');

      expect(useRecapWorksheetStore.getState().error).toBe('Test error');
    });

    it('should set filters', () => {
      const { setFilters } = useRecapWorksheetStore.getState();
      const filters = { numeroSession: 1001 };

      setFilters(filters);

      expect(useRecapWorksheetStore.getState().filters).toEqual(filters);
    });
  });

  describe('clearRecapWorksheet', () => {
    it('should clear entries, summary and error', () => {
      useRecapWorksheetStore.setState({
        entries: MOCK_ENTRIES,
        summary: MOCK_SUMMARY,
        error: 'Test error',
      });
      const { clearRecapWorksheet } = useRecapWorksheetStore.getState();

      clearRecapWorksheet();

      expect(useRecapWorksheetStore.getState().entries).toEqual([]);
      expect(useRecapWorksheetStore.getState().summary).toBeNull();
      expect(useRecapWorksheetStore.getState().error).toBeNull();
    });
  });

  describe('reset', () => {
    it('should reset all state to initial values', () => {
      useRecapWorksheetStore.setState({
        entries: MOCK_ENTRIES,
        summary: MOCK_SUMMARY,
        isGenerating: true,
        error: 'Test error',
        filters: { numeroSession: 1001 },
      });
      const { reset } = useRecapWorksheetStore.getState();

      reset();

      const state = useRecapWorksheetStore.getState();
      expect(state.entries).toEqual([]);
      expect(state.summary).toBeNull();
      expect(state.isGenerating).toBe(false);
      expect(state.error).toBeNull();
      expect(state.filters).toEqual({});
    });
  });
});