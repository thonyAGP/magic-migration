// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useClubMedPassStore } from '../clubmedPassStore';
import { useDataSourceStore } from '../dataSourceStore';

vi.mock('@/services/api/endpoints-lot5', () => ({
  passApi: {
    validate: vi.fn(),
    getByNumber: vi.fn(),
    getTransactions: vi.fn(),
    scan: vi.fn(),
    getSummary: vi.fn(),
    create: vi.fn(),
    oppose: vi.fn(),
    delete: vi.fn(),
  },
}));

import { passApi } from '@/services/api/endpoints-lot5';

const mockPass = {
  id: 1,
  numeroPass: 'CM-2026-001234',
  titulaire: 'Jean Dupont',
  societe: 'ADH',
  codeAdherent: 1001,
  filiation: 0,
  statut: 'active' as const,
  solde: 250.0,
  devise: 'EUR',
  limitJournaliere: 500,
  limitHebdomadaire: 2000,
  dateExpiration: '2026-12-31',
  derniereUtilisation: '2026-02-09',
};

const mockValidation = {
  isValid: true,
  soldeDisponible: 250.0,
  peutTraiter: true,
  raison: null,
  limitJournaliereRestante: 455.0,
  limitHebdomadaireRestante: 1750.0,
};

const mockTransactions = [
  { id: 1, passId: 1, numeroPass: 'CM-2026-001234', date: '2026-02-09', heure: '14:30', montant: 45.00, type: 'debit' as const, libelle: 'Achat boutique', operateur: 'USR001' },
  { id: 2, passId: 1, numeroPass: 'CM-2026-001234', date: '2026-02-08', heure: '10:15', montant: 120.00, type: 'credit' as const, libelle: 'Rechargement', operateur: 'USR002' },
];

const mockSummary = {
  nbPassActifs: 42,
  soldeTotal: 37500.0,
  nbTransactionsJour: 23,
};

describe('useClubMedPassStore', () => {
  beforeEach(() => {
    useDataSourceStore.setState({ isRealApi: true });
    useClubMedPassStore.setState({
      currentPass: null,
      transactions: [],
      validationResult: null,
      summary: null,
      affiliates: [],
      barLimit: 200,
      maxBarLimit: 1000,
      forfaitsTAI: [],
      isValidating: false,
      isLoadingPass: false,
      isLoadingTransactions: false,
      isScanning: false,
      isLoadingAffiliates: false,
      isLoadingForfaits: false,
      isCreating: false,
      creationResult: null,
      error: null,
    });
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have default values', () => {
      const state = useClubMedPassStore.getState();
      expect(state.currentPass).toBeNull();
      expect(state.transactions).toEqual([]);
      expect(state.validationResult).toBeNull();
      expect(state.summary).toBeNull();
      expect(state.isValidating).toBe(false);
      expect(state.isLoadingPass).toBe(false);
      expect(state.isLoadingTransactions).toBe(false);
      expect(state.isScanning).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('validatePass', () => {
    it('should set validation result on success', async () => {
      vi.mocked(passApi.validate).mockResolvedValue({
        data: { data: mockValidation },
      } as never);

      const result = await useClubMedPassStore.getState().validatePass('CM-2026-001', 50, 'ADH');

      expect(result).toEqual({ success: true });
      expect(useClubMedPassStore.getState().validationResult).toEqual(mockValidation);
      expect(useClubMedPassStore.getState().isValidating).toBe(false);
    });

    it('should set error on failure', async () => {
      vi.mocked(passApi.validate).mockRejectedValue(new Error('Pass expire'));

      const result = await useClubMedPassStore.getState().validatePass('CM-OLD', 50, 'ADH');

      expect(result).toEqual({ success: false, error: 'Pass expire' });
      expect(useClubMedPassStore.getState().error).toBe('Pass expire');
      expect(useClubMedPassStore.getState().isValidating).toBe(false);
    });

    it('should handle non-Error exceptions', async () => {
      vi.mocked(passApi.validate).mockRejectedValue('unknown error');

      const result = await useClubMedPassStore.getState().validatePass('CM-X', 50, 'ADH');

      expect(result.error).toBe('Erreur validation pass');
    });

    it('should set isValidating during validation', async () => {
      let resolve: (v: unknown) => void;
      const promise = new Promise((r) => { resolve = r; });
      vi.mocked(passApi.validate).mockReturnValue(promise as never);

      const validatePromise = useClubMedPassStore.getState().validatePass('CM-X', 50, 'ADH');
      expect(useClubMedPassStore.getState().isValidating).toBe(true);

      resolve!({ data: { data: mockValidation } });
      await validatePromise;
      expect(useClubMedPassStore.getState().isValidating).toBe(false);
    });
  });

  describe('loadPass', () => {
    it('should load pass on success', async () => {
      vi.mocked(passApi.getByNumber).mockResolvedValue({
        data: { data: mockPass },
      } as never);

      await useClubMedPassStore.getState().loadPass('CM-2026-001234');

      expect(useClubMedPassStore.getState().currentPass).toEqual(mockPass);
      expect(useClubMedPassStore.getState().isLoadingPass).toBe(false);
    });

    it('should use mock pass on API failure', async () => {
      useDataSourceStore.setState({ isRealApi: false });

      await useClubMedPassStore.getState().loadPass('CM-XXX');

      const pass = useClubMedPassStore.getState().currentPass;
      expect(pass).not.toBeNull();
      expect(pass?.numeroPass).toBe('CM-XXX');
      expect(useClubMedPassStore.getState().error).toBeNull();
    });

    it('should use mock when API returns null', async () => {
      vi.mocked(passApi.getByNumber).mockResolvedValue({
        data: { data: null },
      } as never);

      await useClubMedPassStore.getState().loadPass('CM-XXX');

      expect(useClubMedPassStore.getState().currentPass).toBeNull();
    });
  });

  describe('loadTransactions', () => {
    it('should load transactions on success', async () => {
      vi.mocked(passApi.getTransactions).mockResolvedValue({
        data: { data: mockTransactions },
      } as never);

      await useClubMedPassStore.getState().loadTransactions('CM-2026-001234');

      expect(useClubMedPassStore.getState().transactions).toEqual(mockTransactions);
      expect(useClubMedPassStore.getState().isLoadingTransactions).toBe(false);
    });

    it('should set empty on failure', async () => {
      vi.mocked(passApi.getTransactions).mockRejectedValue(new Error('fail'));

      await useClubMedPassStore.getState().loadTransactions('CM-XXX');

      expect(useClubMedPassStore.getState().transactions).toEqual([]);
    });

    it('should pass limit parameter', async () => {
      vi.mocked(passApi.getTransactions).mockResolvedValue({
        data: { data: [] },
      } as never);

      await useClubMedPassStore.getState().loadTransactions('CM-001', 10);

      expect(passApi.getTransactions).toHaveBeenCalledWith('CM-001', 10);
    });
  });

  describe('scanCard', () => {
    it('should scan and load transactions on success', async () => {
      vi.mocked(passApi.scan).mockResolvedValue({
        data: { data: mockPass },
      } as never);
      vi.mocked(passApi.getTransactions).mockResolvedValue({
        data: { data: mockTransactions },
      } as never);

      const result = await useClubMedPassStore.getState().scanCard('CM-2026-001234', 'ADH');

      expect(result).toEqual({ success: true });
      expect(useClubMedPassStore.getState().currentPass).toEqual(mockPass);
      expect(passApi.getTransactions).toHaveBeenCalledWith('CM-2026-001234', undefined);
      expect(useClubMedPassStore.getState().isScanning).toBe(false);
    });

    it('should use mock pass on scan failure', async () => {
      vi.mocked(passApi.scan).mockRejectedValue(new Error('Card not readable'));

      const result = await useClubMedPassStore.getState().scanCard('CM-BAD', 'ADH');

      expect(result).toEqual({ success: false, error: 'Card not readable' });
      expect(useClubMedPassStore.getState().currentPass).toBeNull();
    });
  });

  describe('loadSummary', () => {
    it('should load summary on success', async () => {
      vi.mocked(passApi.getSummary).mockResolvedValue({
        data: { data: mockSummary },
      } as never);

      await useClubMedPassStore.getState().loadSummary('ADH');

      expect(useClubMedPassStore.getState().summary).toEqual(mockSummary);
    });

    it('should set null on failure', async () => {
      vi.mocked(passApi.getSummary).mockRejectedValue(new Error('fail'));

      await useClubMedPassStore.getState().loadSummary('ADH');

      expect(useClubMedPassStore.getState().summary).toBeNull();
    });
  });

  describe('reset', () => {
    it('should reset all state', () => {
      useClubMedPassStore.setState({
        currentPass: mockPass as never,
        transactions: mockTransactions as never,
        validationResult: mockValidation as never,
        summary: mockSummary as never,
        error: 'error',
        isScanning: true,
      });

      useClubMedPassStore.getState().reset();

      const state = useClubMedPassStore.getState();
      expect(state.currentPass).toBeNull();
      expect(state.transactions).toEqual([]);
      expect(state.validationResult).toBeNull();
      expect(state.summary).toBeNull();
      expect(state.error).toBeNull();
      expect(state.isScanning).toBe(false);
    });
  });
});