import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useRecapFermetureStore } from '@/stores/recapFermetureStore';
import { useDataSourceStore } from '@/stores/dataSourceStore';
import { apiClient } from '@/services/api/apiClient';
import type {
  RecapFermeture,
  LigneRecap,
  RemiseEnCaisse,
  ArticleSession,
  LoadRecapFermetureResponse,
  CalculerEquivalentResponse,
} from '@/types/recapFermeture';
import type { ApiResponse } from '@/services/api/apiClient';

vi.mock('@/services/api/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock('@/stores/dataSourceStore', () => ({
  useDataSourceStore: {
    getState: vi.fn(() => ({ isRealApi: false })),
  },
}));

const MOCK_RECAP: RecapFermeture = {
  societe: 'SOC1',
  session: 42,
  deviseLocale: 'EUR',
  dateDebut: new Date('2026-02-10T08:00:00'),
  heureDebut: '08:00',
  nbreDeviseOuverture: 3,
  nbreDeviseFermeture: 3,
  nbreDevisesCalcule: 3,
  nbreDevisesCompte: 3,
};

const MOCK_LIGNES: LigneRecap[] = [
  {
    typeOperation: 'Ventes boutique',
    montantDevise: 1245.50,
    codeDevise: 'EUR',
    tauxChange: null,
    montantEquivalent: 1245.50,
    ecart: null,
  },
  {
    typeOperation: 'Change USD',
    montantDevise: 850.00,
    codeDevise: 'USD',
    tauxChange: 0.92,
    montantEquivalent: 782.00,
    ecart: 2.50,
  },
];

const MOCK_REMISES: RemiseEnCaisse[] = [
  {
    detailProduitRemiseEdite: true,
    montantRemiseMonnaie: 450.00,
    detailRemiseFinaleEdite: true,
  },
];

const MOCK_ARTICLES: ArticleSession[] = [
  {
    chronoHisto: 1,
    totalArticles: 142,
    codeArticle: 'ART-001',
    libelleArticle: 'Boissons soft',
  },
];

describe('recapFermetureStore', () => {
  beforeEach(() => {
    useRecapFermetureStore.getState().reset();
    vi.clearAllMocks();
    vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: false } as ReturnType<typeof useDataSourceStore.getState>);
  });

  describe('loadRecapFermeture', () => {
    it('should load recap in mock mode', async () => {
      const { loadRecapFermeture, recap, lignesRecap, remises, articles, finTache } = useRecapFermetureStore.getState();

      await loadRecapFermeture('SOC1', 42);

      const state = useRecapFermetureStore.getState();
      expect(state.recap).toEqual(MOCK_RECAP);
      expect(state.lignesRecap).toHaveLength(10);
      expect(state.remises).toHaveLength(3);
      expect(state.articles).toHaveLength(8);
      expect(state.finTache).toBe(true);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should load recap from API in real mode', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as ReturnType<typeof useDataSourceStore.getState>);

      const mockResponse: ApiResponse<LoadRecapFermetureResponse> = {
        success: true,
        data: {
          recap: MOCK_RECAP,
          lignesRecap: MOCK_LIGNES,
          remises: MOCK_REMISES,
          articles: MOCK_ARTICLES,
        },
      };

      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockResponse });

      await useRecapFermetureStore.getState().loadRecapFermeture('SOC1', 42);

      const state = useRecapFermetureStore.getState();
      expect(apiClient.get).toHaveBeenCalledWith('/api/recap-fermeture/SOC1/42');
      expect(state.recap).toEqual(MOCK_RECAP);
      expect(state.lignesRecap).toEqual(MOCK_LIGNES);
      expect(state.remises).toEqual(MOCK_REMISES);
      expect(state.articles).toEqual(MOCK_ARTICLES);
      expect(state.finTache).toBe(true);
      expect(state.isLoading).toBe(false);
    });

    it('should handle API error', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as ReturnType<typeof useDataSourceStore.getState>);
      vi.mocked(apiClient.get).mockRejectedValueOnce(new Error('Network error'));

      await useRecapFermetureStore.getState().loadRecapFermeture('SOC1', 42);

      const state = useRecapFermetureStore.getState();
      expect(state.error).toBe('Network error');
      expect(state.isLoading).toBe(false);
    });

    it('should set loading state during fetch', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as ReturnType<typeof useDataSourceStore.getState>);

      let loadingDuringFetch = false;
      vi.mocked(apiClient.get).mockImplementationOnce(() => {
        loadingDuringFetch = useRecapFermetureStore.getState().isLoading;
        return Promise.resolve({ data: { success: true, data: { recap: MOCK_RECAP, lignesRecap: [], remises: [], articles: [] } } });
      });

      await useRecapFermetureStore.getState().loadRecapFermeture('SOC1', 42);

      expect(loadingDuringFetch).toBe(true);
      expect(useRecapFermetureStore.getState().isLoading).toBe(false);
    });
  });

  describe('genererTableau', () => {
    it('should generate tableau in mock mode when printer is 1', async () => {
      useRecapFermetureStore.getState().setPrinterCourant(1);

      await useRecapFermetureStore.getState().genererTableau('SOC1', 42);

      const state = useRecapFermetureStore.getState();
      expect(state.isPrinting).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should generate tableau in mock mode when printer is 9', async () => {
      useRecapFermetureStore.getState().setPrinterCourant(9);

      await useRecapFermetureStore.getState().genererTableau('SOC1', 42);

      const state = useRecapFermetureStore.getState();
      expect(state.isPrinting).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should fail if printer is not 1 or 9', async () => {
      useRecapFermetureStore.getState().setPrinterCourant(5);

      await useRecapFermetureStore.getState().genererTableau('SOC1', 42);

      const state = useRecapFermetureStore.getState();
      expect(state.error).toBe('Imprimante courante doit être n°1 ou n°9');
    });

    it('should generate tableau via API in real mode', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as ReturnType<typeof useDataSourceStore.getState>);
      useRecapFermetureStore.getState().setPrinterCourant(1);

      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: { success: true, data: { success: true, documentUrl: 'http://example.com/doc.pdf' } },
      });

      await useRecapFermetureStore.getState().genererTableau('SOC1', 42);

      expect(apiClient.post).toHaveBeenCalledWith('/api/recap-fermeture/generer', { societe: 'SOC1', session: 42 });
      expect(useRecapFermetureStore.getState().isPrinting).toBe(false);
    });

    it('should handle API error during generation', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as ReturnType<typeof useDataSourceStore.getState>);
      useRecapFermetureStore.getState().setPrinterCourant(1);
      vi.mocked(apiClient.post).mockRejectedValueOnce(new Error('Print failed'));

      await useRecapFermetureStore.getState().genererTableau('SOC1', 42);

      expect(useRecapFermetureStore.getState().error).toBe('Print failed');
      expect(useRecapFermetureStore.getState().isPrinting).toBe(false);
    });
  });

  describe('calculerEquivalent', () => {
    it('should calculate equivalent with mock rates', async () => {
      const result = await useRecapFermetureStore.getState().calculerEquivalent(100, 'USD', 'EUR');

      expect(result).toBe(92);
    });

    it('should calculate equivalent for GBP with mock rates', async () => {
      const result = await useRecapFermetureStore.getState().calculerEquivalent(100, 'GBP', 'EUR');

      expect(result).toBe(118);
    });

    it('should return same amount for same currency', async () => {
      const result = await useRecapFermetureStore.getState().calculerEquivalent(100, 'EUR', 'EUR');

      expect(result).toBe(100);
    });

    it('should calculate equivalent via API in real mode', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as ReturnType<typeof useDataSourceStore.getState>);

      const mockResponse: ApiResponse<CalculerEquivalentResponse> = {
        success: true,
        data: { montantEquivalent: 92.5 },
      };

      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockResponse });

      const result = await useRecapFermetureStore.getState().calculerEquivalent(100, 'USD', 'EUR');

      expect(apiClient.post).toHaveBeenCalledWith('/api/recap-fermeture/calculer-equivalent', {
        montant: 100,
        deviseSource: 'USD',
        deviseCible: 'EUR',
      });
      expect(result).toBe(92.5);
    });

    it('should return 0 on API error', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as ReturnType<typeof useDataSourceStore.getState>);
      vi.mocked(apiClient.post).mockRejectedValueOnce(new Error('Calc failed'));

      const result = await useRecapFermetureStore.getState().calculerEquivalent(100, 'USD', 'EUR');

      expect(result).toBe(0);
      expect(useRecapFermetureStore.getState().error).toBe('Calc failed');
    });
  });

  describe('saveRemise', () => {
    it('should save remise in mock mode', async () => {
      const newRemise: RemiseEnCaisse = {
        detailProduitRemiseEdite: true,
        montantRemiseMonnaie: 250.00,
        detailRemiseFinaleEdite: false,
      };

      await useRecapFermetureStore.getState().saveRemise(newRemise);

      const state = useRecapFermetureStore.getState();
      expect(state.remises).toHaveLength(1);
      expect(state.remises[0]).toEqual(newRemise);
      expect(state.isLoading).toBe(false);
    });

    it('should save remise via API in real mode', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as ReturnType<typeof useDataSourceStore.getState>);

      const newRemise: RemiseEnCaisse = {
        detailProduitRemiseEdite: true,
        montantRemiseMonnaie: 250.00,
        detailRemiseFinaleEdite: false,
      };

      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: { success: true, data: { success: true } },
      });

      await useRecapFermetureStore.getState().saveRemise(newRemise);

      expect(apiClient.post).toHaveBeenCalledWith('/api/recap-fermeture/remise', newRemise);
      expect(useRecapFermetureStore.getState().remises).toContainEqual(newRemise);
    });

    it('should handle API error on save remise', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as ReturnType<typeof useDataSourceStore.getState>);
      vi.mocked(apiClient.post).mockRejectedValueOnce(new Error('Save failed'));

      const newRemise: RemiseEnCaisse = {
        detailProduitRemiseEdite: true,
        montantRemiseMonnaie: 250.00,
        detailRemiseFinaleEdite: false,
      };

      await useRecapFermetureStore.getState().saveRemise(newRemise);

      expect(useRecapFermetureStore.getState().error).toBe('Save failed');
      expect(useRecapFermetureStore.getState().isLoading).toBe(false);
    });
  });

  describe('saveDiscount', () => {
    it('should complete in mock mode', async () => {
      await useRecapFermetureStore.getState().saveDiscount({ amount: 50 });

      expect(useRecapFermetureStore.getState().isLoading).toBe(false);
    });

    it('should save discount via API in real mode', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as ReturnType<typeof useDataSourceStore.getState>);

      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: { success: true, data: { success: true } },
      });

      const discount = { amount: 50, reason: 'promo' };
      await useRecapFermetureStore.getState().saveDiscount(discount);

      expect(apiClient.post).toHaveBeenCalledWith('/api/recap-fermeture/discount', discount);
      expect(useRecapFermetureStore.getState().isLoading).toBe(false);
    });

    it('should handle API error on save discount', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as ReturnType<typeof useDataSourceStore.getState>);
      vi.mocked(apiClient.post).mockRejectedValueOnce(new Error('Discount save failed'));

      await useRecapFermetureStore.getState().saveDiscount({ amount: 50 });

      expect(useRecapFermetureStore.getState().error).toBe('Discount save failed');
    });
  });

  describe('setModeReimpression', () => {
    it('should set mode D in mock mode', async () => {
      await useRecapFermetureStore.getState().setModeReimpression('D');

      expect(useRecapFermetureStore.getState().modeReimpression).toBe('D');
      expect(useRecapFermetureStore.getState().error).toBeNull();
    });

    it('should set mode G in mock mode', async () => {
      await useRecapFermetureStore.getState().setModeReimpression('G');

      expect(useRecapFermetureStore.getState().modeReimpression).toBe('G');
    });

    it('should set mode null in mock mode', async () => {
      await useRecapFermetureStore.getState().setModeReimpression(null);

      expect(useRecapFermetureStore.getState().modeReimpression).toBeNull();
    });

    it('should reject invalid mode', async () => {
      await useRecapFermetureStore.getState().setModeReimpression('X' as 'D');

      expect(useRecapFermetureStore.getState().error).toBe('Mode réimpression invalide (D ou G requis)');
    });

    it('should set mode via API in real mode', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as ReturnType<typeof useDataSourceStore.getState>);

      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: { success: true, data: { success: true } },
      });

      await useRecapFermetureStore.getState().setModeReimpression('D');

      expect(apiClient.post).toHaveBeenCalledWith('/api/recap-fermeture/mode-reimpression', { mode: 'D' });
      expect(useRecapFermetureStore.getState().modeReimpression).toBe('D');
    });

    it('should handle API error on set mode', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as ReturnType<typeof useDataSourceStore.getState>);
      vi.mocked(apiClient.post).mockRejectedValueOnce(new Error('Mode failed'));

      await useRecapFermetureStore.getState().setModeReimpression('G');

      expect(useRecapFermetureStore.getState().error).toBe('Mode failed');
    });
  });

  describe('checkPrinter', () => {
    it('should return true for printer 1 in mock mode', async () => {
      const available = await useRecapFermetureStore.getState().checkPrinter(1);

      expect(available).toBe(true);
      expect(useRecapFermetureStore.getState().printerCourant).toBe(1);
    });

    it('should return true for printer 9 in mock mode', async () => {
      const available = await useRecapFermetureStore.getState().checkPrinter(9);

      expect(available).toBe(true);
      expect(useRecapFermetureStore.getState().printerCourant).toBe(9);
    });

    it('should return false for other printers in mock mode', async () => {
      const available = await useRecapFermetureStore.getState().checkPrinter(5);

      expect(available).toBe(false);
      expect(useRecapFermetureStore.getState().printerCourant).toBeNull();
    });

    it('should check printer via API in real mode', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as ReturnType<typeof useDataSourceStore.getState>);

      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: { success: true, data: { available: true } },
      });

      const available = await useRecapFermetureStore.getState().checkPrinter(1);

      expect(apiClient.post).toHaveBeenCalledWith('/api/recap-fermeture/check-printer', { printerNum: 1 });
      expect(available).toBe(true);
      expect(useRecapFermetureStore.getState().printerCourant).toBe(1);
    });

    it('should return false when API says unavailable', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as ReturnType<typeof useDataSourceStore.getState>);

      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: { success: true, data: { available: false } },
      });

      const available = await useRecapFermetureStore.getState().checkPrinter(5);

      expect(available).toBe(false);
      expect(useRecapFermetureStore.getState().printerCourant).toBeNull();
    });

    it('should handle API error on check printer', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as ReturnType<typeof useDataSourceStore.getState>);
      vi.mocked(apiClient.post).mockRejectedValueOnce(new Error('Check failed'));

      const available = await useRecapFermetureStore.getState().checkPrinter(1);

      expect(available).toBe(false);
      expect(useRecapFermetureStore.getState().error).toBe('Check failed');
    });
  });

  describe('exportRecap', () => {
    it('should fail if no recap loaded', async () => {
      await expect(useRecapFermetureStore.getState().exportRecap('PDF')).rejects.toThrow('Aucune récap à exporter');
      expect(useRecapFermetureStore.getState().error).toBe('Aucune récap à exporter');
    });

    it('should export recap in mock mode', async () => {
      await useRecapFermetureStore.getState().loadRecapFermeture('SOC1', 42);

      const blob = await useRecapFermetureStore.getState().exportRecap('PDF');

      expect(blob).toBeInstanceOf(Blob);
      expect(useRecapFermetureStore.getState().isLoading).toBe(false);
    });

    it('should export recap via API in real mode', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as ReturnType<typeof useDataSourceStore.getState>);

      const mockRecapResponse: ApiResponse<LoadRecapFermetureResponse> = {
        success: true,
        data: {
          recap: MOCK_RECAP,
          lignesRecap: [],
          remises: [],
          articles: [],
        },
      };

      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockRecapResponse });

      await useRecapFermetureStore.getState().loadRecapFermeture('SOC1', 42);

      const mockBlob = new Blob(['PDF content'], { type: 'application/pdf' });
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockBlob });

      const blob = await useRecapFermetureStore.getState().exportRecap('PDF');

      expect(apiClient.get).toHaveBeenCalledWith(
        '/api/recap-fermeture/SOC1/42/export?format=PDF',
        { responseType: 'blob' }
      );
      expect(blob).toBe(mockBlob);
    });

    it('should handle API error on export', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as ReturnType<typeof useDataSourceStore.getState>);

      const mockRecapResponse: ApiResponse<LoadRecapFermetureResponse> = {
        success: true,
        data: {
          recap: MOCK_RECAP,
          lignesRecap: [],
          remises: [],
          articles: [],
        },
      };

      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockRecapResponse });

      await useRecapFermetureStore.getState().loadRecapFermeture('SOC1', 42);

      vi.mocked(apiClient.get).mockRejectedValueOnce(new Error('Export failed'));

      await expect(useRecapFermetureStore.getState().exportRecap('EXCEL')).rejects.toThrow('Export failed');
      expect(useRecapFermetureStore.getState().error).toBe('Export failed');
    });
  });

  describe('state setters', () => {
    it('should set loading state', () => {
      useRecapFermetureStore.getState().setIsLoading(true);
      expect(useRecapFermetureStore.getState().isLoading).toBe(true);

      useRecapFermetureStore.getState().setIsLoading(false);
      expect(useRecapFermetureStore.getState().isLoading).toBe(false);
    });

    it('should set error state', () => {
      useRecapFermetureStore.getState().setError('Test error');
      expect(useRecapFermetureStore.getState().error).toBe('Test error');

      useRecapFermetureStore.getState().setError(null);
      expect(useRecapFermetureStore.getState().error).toBeNull();
    });

    it('should set printing state', () => {
      useRecapFermetureStore.getState().setIsPrinting(true);
      expect(useRecapFermetureStore.getState().isPrinting).toBe(true);

      useRecapFermetureStore.getState().setIsPrinting(false);
      expect(useRecapFermetureStore.getState().isPrinting).toBe(false);
    });

    it('should set printer courant', () => {
      useRecapFermetureStore.getState().setPrinterCourant(1);
      expect(useRecapFermetureStore.getState().printerCourant).toBe(1);

      useRecapFermetureStore.getState().setPrinterCourant(null);
      expect(useRecapFermetureStore.getState().printerCourant).toBeNull();
    });

    it('should set fin tache', () => {
      useRecapFermetureStore.getState().setFinTache(true);
      expect(useRecapFermetureStore.getState().finTache).toBe(true);

      useRecapFermetureStore.getState().setFinTache(false);
      expect(useRecapFermetureStore.getState().finTache).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all state to initial values', async () => {
      await useRecapFermetureStore.getState().loadRecapFermeture('SOC1', 42);
      useRecapFermetureStore.getState().setError('Some error');
      useRecapFermetureStore.getState().setIsPrinting(true);
      useRecapFermetureStore.getState().setPrinterCourant(1);

      useRecapFermetureStore.getState().reset();

      const state = useRecapFermetureStore.getState();
      expect(state.recap).toBeNull();
      expect(state.lignesRecap).toEqual([]);
      expect(state.remises).toEqual([]);
      expect(state.articles).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.isPrinting).toBe(false);
      expect(state.modeReimpression).toBeNull();
      expect(state.printerCourant).toBeNull();
      expect(state.finTache).toBe(false);
    });
  });
});