import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useGestionChequeStore } from '@/stores/gestionChequeStore';
import { apiClient } from '@/services/api/apiClient';
import { useDataSourceStore } from '@/stores/dataSourceStore';
import type { Cheque } from '@/types/gestionCheque';

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

const MOCK_CHEQUE: Cheque = {
  numeroCheque: 'CHQ-123456',
  montant: 500.0,
  dateEmission: new Date('2026-02-15'),
  banque: 'BNP Paribas',
  titulaire: 'DUPONT Jean',
  estPostdate: false,
};

const MOCK_CHEQUE_POSTDATE: Cheque = {
  numeroCheque: 'CHQ-789012',
  montant: 1200.0,
  dateEmission: new Date('2026-03-01'),
  banque: 'Société Générale',
  titulaire: 'MARTIN Sophie',
  estPostdate: true,
};

const MOCK_CHEQUES: Cheque[] = [
  {
    numeroCheque: 'CHQ-111111',
    montant: 750.0,
    dateEmission: new Date('2026-01-10'),
    banque: 'Crédit Agricole',
    titulaire: 'BERNARD Pierre',
    estPostdate: false,
  },
  {
    numeroCheque: 'CHQ-222222',
    montant: 2500.0,
    dateEmission: new Date('2026-02-05'),
    banque: 'BNP Paribas',
    titulaire: 'DUBOIS Marie',
    estPostdate: true,
  },
];

describe('gestionChequeStore', () => {
  beforeEach(() => {
    useGestionChequeStore.getState().reset();
    vi.clearAllMocks();
  });

  describe('enregistrerDepot', () => {
    it('should enregistrer depot with mock data when isRealApi is false', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: false,
        setIsRealApi: vi.fn(),
      });

      const store = useGestionChequeStore.getState();

      await store.enregistrerDepot(MOCK_CHEQUE, 'SOC1', 'C001', 'F1');

      const state = useGestionChequeStore.getState();
      expect(state.cheques).toHaveLength(1);
      expect(state.cheques[0]).toEqual(MOCK_CHEQUE);
      expect(state.totalDepots).toBe(500.0);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should enregistrer depot via API when isRealApi is true', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: true,
        setIsRealApi: vi.fn(),
      });

      vi.mocked(apiClient.post).mockResolvedValue({
        data: {
          success: true,
          data: { success: true, message: 'Dépôt enregistré' },
        },
      });

      const store = useGestionChequeStore.getState();

      await store.enregistrerDepot(MOCK_CHEQUE, 'SOC1', 'C001', 'F1');

      expect(apiClient.post).toHaveBeenCalledWith('/api/gestion-cheque/depot', {
        numeroCheque: MOCK_CHEQUE.numeroCheque,
        montant: MOCK_CHEQUE.montant,
        dateEmission: MOCK_CHEQUE.dateEmission,
        banque: MOCK_CHEQUE.banque,
        titulaire: MOCK_CHEQUE.titulaire,
        societe: 'SOC1',
        compte: 'C001',
        filiation: 'F1',
      });

      const state = useGestionChequeStore.getState();
      expect(state.cheques).toHaveLength(1);
      expect(state.totalDepots).toBe(500.0);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should set error when API call fails', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: true,
        setIsRealApi: vi.fn(),
      });

      const errorMessage = 'Network error';
      vi.mocked(apiClient.post).mockRejectedValue(new Error(errorMessage));

      const store = useGestionChequeStore.getState();

      await store.enregistrerDepot(MOCK_CHEQUE, 'SOC1', 'C001', 'F1');

      const state = useGestionChequeStore.getState();
      expect(state.error).toBe(errorMessage);
      expect(state.isLoading).toBe(false);
      expect(state.cheques).toHaveLength(0);
    });

    it('should accumulate multiple depots', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: false,
        setIsRealApi: vi.fn(),
      });

      const store = useGestionChequeStore.getState();

      await store.enregistrerDepot(MOCK_CHEQUE, 'SOC1', 'C001', 'F1');
      await store.enregistrerDepot(MOCK_CHEQUE_POSTDATE, 'SOC1', 'C001', 'F1');

      const state = useGestionChequeStore.getState();
      expect(state.cheques).toHaveLength(2);
      expect(state.totalDepots).toBe(1700.0);
    });
  });

  describe('enregistrerRetrait', () => {
    it('should enregistrer retrait with mock data when isRealApi is false', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: false,
        setIsRealApi: vi.fn(),
      });

      const store = useGestionChequeStore.getState();

      await store.enregistrerRetrait(MOCK_CHEQUE, 'SOC1', 'C001', 'F1');

      const state = useGestionChequeStore.getState();
      expect(state.cheques).toHaveLength(1);
      expect(state.cheques[0]).toEqual(MOCK_CHEQUE);
      expect(state.totalRetraits).toBe(500.0);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should enregistrer retrait via API when isRealApi is true', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: true,
        setIsRealApi: vi.fn(),
      });

      vi.mocked(apiClient.post).mockResolvedValue({
        data: {
          success: true,
          data: { success: true, message: 'Retrait enregistré' },
        },
      });

      const store = useGestionChequeStore.getState();

      await store.enregistrerRetrait(MOCK_CHEQUE, 'SOC1', 'C001', 'F1');

      expect(apiClient.post).toHaveBeenCalledWith('/api/gestion-cheque/retrait', {
        numeroCheque: MOCK_CHEQUE.numeroCheque,
        montant: MOCK_CHEQUE.montant,
        dateEmission: MOCK_CHEQUE.dateEmission,
        banque: MOCK_CHEQUE.banque,
        titulaire: MOCK_CHEQUE.titulaire,
        societe: 'SOC1',
        compte: 'C001',
        filiation: 'F1',
      });

      const state = useGestionChequeStore.getState();
      expect(state.cheques).toHaveLength(1);
      expect(state.totalRetraits).toBe(500.0);
      expect(state.isLoading).toBe(false);
    });

    it('should set error when API call fails', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: true,
        setIsRealApi: vi.fn(),
      });

      const errorMessage = 'Insufficient funds';
      vi.mocked(apiClient.post).mockRejectedValue(new Error(errorMessage));

      const store = useGestionChequeStore.getState();

      await store.enregistrerRetrait(MOCK_CHEQUE, 'SOC1', 'C001', 'F1');

      const state = useGestionChequeStore.getState();
      expect(state.error).toBe(errorMessage);
      expect(state.isLoading).toBe(false);
    });
  });

  describe('validerCheque', () => {
    it('should return valide=false when numero already exists in mock data', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: false,
        setIsRealApi: vi.fn(),
      });

      const store = useGestionChequeStore.getState();

      const result = await store.validerCheque('CHQ-245781', new Date('2026-02-20'));

      expect(result.valide).toBe(false);
      expect(result.erreur).toBe('Numéro de chèque déjà utilisé');
    });

    it('should return valide=true and estPostdate=false when date is not future', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: false,
        setIsRealApi: vi.fn(),
      });

      const store = useGestionChequeStore.getState();
      const pastDate = new Date('2025-12-01');

      const result = await store.validerCheque('CHQ-NOUVEAU', pastDate);

      expect(result.valide).toBe(true);
      expect(result.estPostdate).toBe(false);
    });

    it('should return valide=true and estPostdate=true when date is future', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: false,
        setIsRealApi: vi.fn(),
      });

      const store = useGestionChequeStore.getState();
      const futureDate = new Date('2027-01-01');

      const result = await store.validerCheque('CHQ-NOUVEAU', futureDate);

      expect(result.valide).toBe(true);
      expect(result.estPostdate).toBe(true);
    });

    it('should validate via API when isRealApi is true', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: true,
        setIsRealApi: vi.fn(),
      });

      vi.mocked(apiClient.post).mockResolvedValue({
        data: {
          success: true,
          data: { valide: true, estPostdate: false },
        },
      });

      const store = useGestionChequeStore.getState();

      const result = await store.validerCheque('CHQ-123456', new Date('2026-02-15'));

      expect(apiClient.post).toHaveBeenCalledWith('/api/gestion-cheque/valider', {
        numeroCheque: 'CHQ-123456',
        dateEmission: new Date('2026-02-15'),
      });

      expect(result.valide).toBe(true);
      expect(result.estPostdate).toBe(false);
    });

    it('should return error when API call fails', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: true,
        setIsRealApi: vi.fn(),
      });

      const errorMessage = 'Validation failed';
      vi.mocked(apiClient.post).mockRejectedValue(new Error(errorMessage));

      const store = useGestionChequeStore.getState();

      const result = await store.validerCheque('CHQ-123456', new Date('2026-02-15'));

      expect(result.valide).toBe(false);
      expect(result.erreur).toBe(errorMessage);
    });
  });

  describe('listerChequesCompte', () => {
    it('should return filtered cheques with mock data when isRealApi is false', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: false,
        setIsRealApi: vi.fn(),
      });

      const store = useGestionChequeStore.getState();

      const result = await store.listerChequesCompte('SOC1', 'C001', 'F1');

      expect(result.length).toBeGreaterThan(0);
      expect(useGestionChequeStore.getState().cheques).toEqual(result);
      expect(useGestionChequeStore.getState().isLoading).toBe(false);
    });

    it('should filter by dateDebut when provided', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: false,
        setIsRealApi: vi.fn(),
      });

      const store = useGestionChequeStore.getState();
      const dateDebut = new Date('2026-02-01');

      const result = await store.listerChequesCompte('SOC1', 'C001', 'F1', { dateDebut });

      result.forEach((cheque) => {
        expect(cheque.dateEmission.getTime()).toBeGreaterThanOrEqual(dateDebut.getTime());
      });
    });

    it('should filter by dateFin when provided', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: false,
        setIsRealApi: vi.fn(),
      });

      const store = useGestionChequeStore.getState();
      const dateFin = new Date('2026-02-01');

      const result = await store.listerChequesCompte('SOC1', 'C001', 'F1', { dateFin });

      result.forEach((cheque) => {
        expect(cheque.dateEmission.getTime()).toBeLessThanOrEqual(dateFin.getTime());
      });
    });

    it('should filter by estPostdate when provided', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: false,
        setIsRealApi: vi.fn(),
      });

      const store = useGestionChequeStore.getState();

      const result = await store.listerChequesCompte('SOC1', 'C001', 'F1', { estPostdate: true });

      result.forEach((cheque) => {
        expect(cheque.estPostdate).toBe(true);
      });
    });

    it('should call API with correct query params when isRealApi is true', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: true,
        setIsRealApi: vi.fn(),
      });

      vi.mocked(apiClient.get).mockResolvedValue({
        data: {
          success: true,
          data: MOCK_CHEQUES,
        },
      });

      const store = useGestionChequeStore.getState();
      const dateDebut = new Date('2026-01-01');
      const dateFin = new Date('2026-02-28');

      await store.listerChequesCompte('SOC1', 'C001', 'F1', { dateDebut, dateFin, estPostdate: true });

      expect(apiClient.get).toHaveBeenCalledWith(
        `/api/gestion-cheque/liste/SOC1/C001/F1?dateDebut=${encodeURIComponent(dateDebut.toISOString())}&dateFin=${encodeURIComponent(dateFin.toISOString())}&estPostdate=true`,
      );
    });

    it('should set error when API call fails', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: true,
        setIsRealApi: vi.fn(),
      });

      const errorMessage = 'Network error';
      vi.mocked(apiClient.get).mockRejectedValue(new Error(errorMessage));

      const store = useGestionChequeStore.getState();

      const result = await store.listerChequesCompte('SOC1', 'C001', 'F1');

      const state = useGestionChequeStore.getState();
      expect(state.error).toBe(errorMessage);
      expect(result).toEqual([]);
      expect(state.cheques).toEqual([]);
    });
  });

  describe('calculerTotaux', () => {
    it('should return mock totals when isRealApi is false', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: false,
        setIsRealApi: vi.fn(),
      });

      const store = useGestionChequeStore.getState();

      const result = await store.calculerTotaux('SOC1', 'C001', 'F1');

      expect(result.totalDepots).toBe(12075.5);
      expect(result.totalRetraits).toBe(4850.0);
      expect(useGestionChequeStore.getState().totalDepots).toBe(12075.5);
      expect(useGestionChequeStore.getState().totalRetraits).toBe(4850.0);
      expect(useGestionChequeStore.getState().isLoading).toBe(false);
    });

    it('should call API and return totals when isRealApi is true', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: true,
        setIsRealApi: vi.fn(),
      });

      const apiTotals = { totalDepots: 15000.0, totalRetraits: 5000.0 };

      vi.mocked(apiClient.get).mockResolvedValue({
        data: {
          success: true,
          data: apiTotals,
        },
      });

      const store = useGestionChequeStore.getState();

      const result = await store.calculerTotaux('SOC1', 'C001', 'F1');

      expect(apiClient.get).toHaveBeenCalledWith('/api/gestion-cheque/totaux/SOC1/C001/F1');
      expect(result.totalDepots).toBe(15000.0);
      expect(result.totalRetraits).toBe(5000.0);
      expect(useGestionChequeStore.getState().totalDepots).toBe(15000.0);
      expect(useGestionChequeStore.getState().totalRetraits).toBe(5000.0);
    });

    it('should set error and return zeros when API call fails', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: true,
        setIsRealApi: vi.fn(),
      });

      const errorMessage = 'Calculation error';
      vi.mocked(apiClient.get).mockRejectedValue(new Error(errorMessage));

      const store = useGestionChequeStore.getState();

      const result = await store.calculerTotaux('SOC1', 'C001', 'F1');

      const state = useGestionChequeStore.getState();
      expect(state.error).toBe(errorMessage);
      expect(result.totalDepots).toBe(0);
      expect(result.totalRetraits).toBe(0);
      expect(state.totalDepots).toBe(0);
      expect(state.totalRetraits).toBe(0);
    });
  });

  describe('setters', () => {
    it('should set cheques', () => {
      const store = useGestionChequeStore.getState();

      store.setCheques(MOCK_CHEQUES);

      expect(useGestionChequeStore.getState().cheques).toEqual(MOCK_CHEQUES);
    });

    it('should set selectedCheque', () => {
      const store = useGestionChequeStore.getState();

      store.setSelectedCheque(MOCK_CHEQUE);

      expect(useGestionChequeStore.getState().selectedCheque).toEqual(MOCK_CHEQUE);
    });

    it('should set isLoading', () => {
      const store = useGestionChequeStore.getState();

      store.setIsLoading(true);

      expect(useGestionChequeStore.getState().isLoading).toBe(true);
    });

    it('should set error', () => {
      const store = useGestionChequeStore.getState();

      store.setError('Test error');

      expect(useGestionChequeStore.getState().error).toBe('Test error');
    });

    it('should set filters', () => {
      const store = useGestionChequeStore.getState();
      const filters = { dateDebut: new Date('2026-01-01'), estPostdate: true };

      store.setFilters(filters);

      expect(useGestionChequeStore.getState().filters).toEqual(filters);
    });

    it('should set totalDepots', () => {
      const store = useGestionChequeStore.getState();

      store.setTotalDepots(5000.0);

      expect(useGestionChequeStore.getState().totalDepots).toBe(5000.0);
    });

    it('should set totalRetraits', () => {
      const store = useGestionChequeStore.getState();

      store.setTotalRetraits(2000.0);

      expect(useGestionChequeStore.getState().totalRetraits).toBe(2000.0);
    });
  });

  describe('reset', () => {
    it('should reset store to initial state', () => {
      const store = useGestionChequeStore.getState();

      store.setCheques(MOCK_CHEQUES);
      store.setSelectedCheque(MOCK_CHEQUE);
      store.setIsLoading(true);
      store.setError('Error');
      store.setTotalDepots(1000.0);
      store.setTotalRetraits(500.0);

      store.reset();

      const state = useGestionChequeStore.getState();
      expect(state.cheques).toEqual([]);
      expect(state.selectedCheque).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.totalDepots).toBe(0);
      expect(state.totalRetraits).toBe(0);
      expect(state.filters).toEqual({});
    });
  });
});