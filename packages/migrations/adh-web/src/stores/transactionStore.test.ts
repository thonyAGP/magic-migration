import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useTransactionStore } from './transactionStore';
import type {
  MoyenPaiementCatalog,
  PreCheckResult,
  EditionConfig,
  ForfaitData,
  GiftPassResult,
  ResortCreditResult,
  TransactionDraft,
} from '@/types/transaction-lot2';

vi.mock('@/services/api/endpoints-lot2', () => ({
  transactionLot2Api: {
    preCheck: vi.fn(),
    getMoyenPaiements: vi.fn(),
    getForfaits: vi.fn(),
    getEditionConfig: vi.fn(),
    checkGiftPass: vi.fn(),
    checkResortCredit: vi.fn(),
    complete: vi.fn(),
    recoverTPE: vi.fn(),
  },
}));

vi.mock('./dataSourceStore', () => ({
  useDataSourceStore: {
    getState: vi.fn(() => ({ isRealApi: true })),
  },
}));

import { transactionLot2Api } from '@/services/api/endpoints-lot2';
import { useDataSourceStore } from './dataSourceStore';

const mockMOP: MoyenPaiementCatalog[] = [
  {
    code: 'ESP',
    libelle: 'Especes',
    type: 'especes',
    classe: 'CASH',
    estTPE: false,
  },
  {
    code: 'CB',
    libelle: 'Carte bancaire',
    type: 'carte',
    classe: 'CARD',
    estTPE: true,
  },
];

const mockPreCheck: PreCheckResult = { canSell: true };

const mockEditionConfig: EditionConfig = {
  format: 'PMS28',
  printerId: 1,
  printerName: 'Caisse 1',
};

const mockForfaits: ForfaitData[] = [
  {
    code: 'SKI7',
    libelle: 'Forfait ski 7 jours',
    dateDebut: '2026-02-10',
    dateFin: '2026-02-16',
    articleType: 'default',
    prixParJour: 45,
    prixForfait: 280,
  },
];

const mockDraft: TransactionDraft = {
  compteId: 100,
  compteNom: 'Dupont Jean',
  articleType: 'default',
  lignes: [
    {
      description: 'Forfait ski',
      quantite: 1,
      prixUnitaire: 280,
      devise: 'EUR',
    },
  ],
  mop: [],
  paymentSide: 'unilateral',
  commentaire: '',
  devise: 'EUR',
  montantTotal: 280,
};

const mockGiftPass: GiftPassResult = {
  balance: 150,
  available: true,
  devise: 'EUR',
};

const mockResortCredit: ResortCreditResult = {
  balance: 200,
  available: true,
  devise: 'EUR',
};

describe('useTransactionStore', () => {
  beforeEach(() => {
    useTransactionStore.setState({
      catalogMOP: [],
      catalogForfaits: [],
      editionConfig: null,
      preCheckResult: null,
      draft: null,
      paymentSide: 'unilateral',
      selectedMOP: [],
      giftPassBalance: null,
      resortCreditBalance: null,
      isLoadingCatalogs: false,
      isSubmitting: false,
      tpeError: null,
      catalogErrors: [],
    });
    vi.clearAllMocks();
    vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as never);
  });

  it('should start with empty state', () => {
    const state = useTransactionStore.getState();
    expect(state.catalogMOP).toEqual([]);
    expect(state.catalogForfaits).toEqual([]);
    expect(state.editionConfig).toBeNull();
    expect(state.preCheckResult).toBeNull();
    expect(state.draft).toBeNull();
    expect(state.paymentSide).toBe('unilateral');
    expect(state.selectedMOP).toEqual([]);
    expect(state.giftPassBalance).toBeNull();
    expect(state.resortCreditBalance).toBeNull();
    expect(state.isLoadingCatalogs).toBe(false);
    expect(state.isSubmitting).toBe(false);
    expect(state.tpeError).toBeNull();
    expect(state.catalogErrors).toEqual([]);
  });

  describe('loadCatalogs', () => {
    it('should load all catalogs successfully', async () => {
      vi.mocked(transactionLot2Api.preCheck).mockResolvedValue({
        data: { data: mockPreCheck, success: true },
      } as never);
      vi.mocked(transactionLot2Api.getMoyenPaiements).mockResolvedValue({
        data: { data: mockMOP, success: true },
      } as never);
      vi.mocked(transactionLot2Api.getForfaits).mockResolvedValue({
        data: { data: mockForfaits, success: true },
      } as never);
      vi.mocked(transactionLot2Api.getEditionConfig).mockResolvedValue({
        data: { data: mockEditionConfig, success: true },
      } as never);

      await useTransactionStore.getState().loadCatalogs();

      const state = useTransactionStore.getState();
      expect(state.preCheckResult).toEqual(mockPreCheck);
      expect(state.catalogMOP).toEqual(mockMOP);
      expect(state.catalogForfaits).toEqual(mockForfaits);
      expect(state.editionConfig).toEqual(mockEditionConfig);
      expect(state.catalogErrors).toEqual([]);
      expect(state.isLoadingCatalogs).toBe(false);
    });

    it('should handle individual API failure with fail-safe', async () => {
      vi.mocked(transactionLot2Api.preCheck).mockResolvedValue({
        data: { data: mockPreCheck, success: true },
      } as never);
      vi.mocked(transactionLot2Api.getMoyenPaiements).mockRejectedValue(
        new Error('Network error'),
      );
      vi.mocked(transactionLot2Api.getForfaits).mockResolvedValue({
        data: { data: mockForfaits, success: true },
      } as never);
      vi.mocked(transactionLot2Api.getEditionConfig).mockResolvedValue({
        data: { data: mockEditionConfig, success: true },
      } as never);

      await useTransactionStore.getState().loadCatalogs();

      const state = useTransactionStore.getState();
      expect(state.preCheckResult).toEqual(mockPreCheck);
      expect(state.catalogForfaits).toEqual(mockForfaits);
      expect(state.editionConfig).toEqual(mockEditionConfig);
      expect(state.catalogErrors).toHaveLength(1);
      expect(state.catalogErrors[0]).toContain('mop');
      expect(state.isLoadingCatalogs).toBe(false);
    });

    it('should handle multiple API failures independently', async () => {
      vi.mocked(transactionLot2Api.preCheck).mockRejectedValue(
        new Error('preCheck fail'),
      );
      vi.mocked(transactionLot2Api.getMoyenPaiements).mockRejectedValue(
        new Error('mop fail'),
      );
      vi.mocked(transactionLot2Api.getForfaits).mockResolvedValue({
        data: { data: mockForfaits, success: true },
      } as never);
      vi.mocked(transactionLot2Api.getEditionConfig).mockRejectedValue(
        new Error('edition fail'),
      );

      await useTransactionStore.getState().loadCatalogs();

      const state = useTransactionStore.getState();
      expect(state.catalogForfaits).toEqual(mockForfaits);
      expect(state.catalogErrors).toHaveLength(3);
      expect(state.isLoadingCatalogs).toBe(false);
    });

    it('should set isLoadingCatalogs during loading', async () => {
      let resolvePreCheck: (value: unknown) => void;
      const preCheckPromise = new Promise((resolve) => {
        resolvePreCheck = resolve;
      });
      vi.mocked(transactionLot2Api.preCheck).mockReturnValue(
        preCheckPromise as never,
      );
      vi.mocked(transactionLot2Api.getMoyenPaiements).mockResolvedValue({
        data: { data: [], success: true },
      } as never);
      vi.mocked(transactionLot2Api.getForfaits).mockResolvedValue({
        data: { data: [], success: true },
      } as never);
      vi.mocked(transactionLot2Api.getEditionConfig).mockResolvedValue({
        data: { data: null, success: true },
      } as never);

      const loadPromise = useTransactionStore.getState().loadCatalogs();
      
      await vi.waitFor(() => {
        expect(useTransactionStore.getState().isLoadingCatalogs).toBe(true);
      });

      resolvePreCheck!({ data: { data: mockPreCheck, success: true } });
      await loadPromise;

      expect(useTransactionStore.getState().isLoadingCatalogs).toBe(false);
    });
  });

  describe('setDraft', () => {
    it('should set draft transaction', () => {
      useTransactionStore.getState().setDraft(mockDraft);

      expect(useTransactionStore.getState().draft).toEqual(mockDraft);
    });

    it('should clear draft when set to null', () => {
      useTransactionStore.getState().setDraft(mockDraft);
      useTransactionStore.getState().setDraft(null);

      expect(useTransactionStore.getState().draft).toBeNull();
    });
  });

  describe('addMOP', () => {
    it('should add a new MOP entry', () => {
      useTransactionStore.getState().addMOP('ESP', 100);

      const state = useTransactionStore.getState();
      expect(state.selectedMOP).toHaveLength(1);
      expect(state.selectedMOP[0]).toEqual({ code: 'ESP', montant: 100 });
    });

    it('should add multiple MOP entries', () => {
      useTransactionStore.getState().addMOP('ESP', 100);
      useTransactionStore.getState().addMOP('CB', 200);

      expect(useTransactionStore.getState().selectedMOP).toHaveLength(2);
    });

    it('should update montant when adding existing MOP code', () => {
      useTransactionStore.getState().addMOP('ESP', 100);
      useTransactionStore.getState().addMOP('ESP', 150);

      const state = useTransactionStore.getState();
      expect(state.selectedMOP).toHaveLength(1);
      expect(state.selectedMOP[0].montant).toBe(150);
    });
  });

  describe('removeMOP', () => {
    it('should remove a MOP entry by code', () => {
      useTransactionStore.getState().addMOP('ESP', 100);
      useTransactionStore.getState().addMOP('CB', 200);
      useTransactionStore.getState().removeMOP('ESP');

      const state = useTransactionStore.getState();
      expect(state.selectedMOP).toHaveLength(1);
      expect(state.selectedMOP[0].code).toBe('CB');
    });

    it('should do nothing when removing non-existent code', () => {
      useTransactionStore.getState().addMOP('ESP', 100);
      useTransactionStore.getState().removeMOP('UNKNOWN');

      expect(useTransactionStore.getState().selectedMOP).toHaveLength(1);
    });
  });

  describe('togglePaymentSide', () => {
    it('should toggle from unilateral to bilateral', () => {
      useTransactionStore.getState().togglePaymentSide();

      expect(useTransactionStore.getState().paymentSide).toBe('bilateral');
    });

    it('should toggle from bilateral back to unilateral', () => {
      useTransactionStore.getState().togglePaymentSide();
      useTransactionStore.getState().togglePaymentSide();

      expect(useTransactionStore.getState().paymentSide).toBe('unilateral');
    });
  });

  describe('checkGiftPass', () => {
    it('should set giftPassBalance on success', async () => {
      vi.mocked(transactionLot2Api.checkGiftPass).mockResolvedValue({
        data: { data: mockGiftPass, success: true },
      } as never);

      await useTransactionStore
        .getState()
        .checkGiftPass(1, 'ADH', 100, 1);

      expect(useTransactionStore.getState().giftPassBalance).toEqual(
        mockGiftPass,
      );
    });

    it('should set giftPassBalance to null on failure', async () => {
      vi.mocked(transactionLot2Api.checkGiftPass).mockRejectedValue(
        new Error('API error'),
      );

      await useTransactionStore
        .getState()
        .checkGiftPass(1, 'ADH', 100, 1);

      const state = useTransactionStore.getState();
      expect(state.giftPassBalance).toEqual({
        available: true,
        balance: 150,
        devise: 'EUR',
      });
    });
  });

  describe('checkResortCredit', () => {
    it('should set resortCreditBalance on success', async () => {
      vi.mocked(transactionLot2Api.checkResortCredit).mockResolvedValue({
        data: { data: mockResortCredit, success: true },
      } as never);

      await useTransactionStore
        .getState()
        .checkResortCredit(1, 'ADH', 100, 1);

      expect(useTransactionStore.getState().resortCreditBalance).toEqual(
        mockResortCredit,
      );
    });

    it('should set resortCreditBalance to null on failure', async () => {
      vi.mocked(transactionLot2Api.checkResortCredit).mockRejectedValue(
        new Error('API error'),
      );

      await useTransactionStore
        .getState()
        .checkResortCredit(1, 'ADH', 100, 1);

      const state = useTransactionStore.getState();
      expect(state.resortCreditBalance).toEqual({
        available: true,
        balance: 200,
        devise: 'EUR',
      });
    });
  });

  describe('submitTransaction', () => {
    it('should return success on successful submit', async () => {
      vi.mocked(transactionLot2Api.complete).mockResolvedValue({
        data: { data: undefined, success: true },
      } as never);

      const result = await useTransactionStore
        .getState()
        .submitTransaction(1, {
          mop: [{ code: 'ESP', montant: 100 }],
          paymentSide: 'unilateral',
        });

      expect(result).toEqual({ success: true });
      expect(useTransactionStore.getState().tpeError).toBeNull();
      expect(useTransactionStore.getState().isSubmitting).toBe(false);
    });

    it('should set tpeError and return failure on error', async () => {
      vi.mocked(transactionLot2Api.complete).mockRejectedValue(
        new Error('TPE refused'),
      );

      const result = await useTransactionStore
        .getState()
        .submitTransaction(1, {
          mop: [{ code: 'CB', montant: 100 }],
          paymentSide: 'unilateral',
        });

      expect(result).toEqual({ success: false, error: 'TPE refused' });
      expect(useTransactionStore.getState().tpeError).toBe('TPE refused');
      expect(useTransactionStore.getState().isSubmitting).toBe(false);
    });

    it('should set isSubmitting during submission', async () => {
      let resolveComplete: (value: unknown) => void;
      const completePromise = new Promise((resolve) => {
        resolveComplete = resolve;
      });
      vi.mocked(transactionLot2Api.complete).mockReturnValue(
        completePromise as never,
      );

      const submitPromise = useTransactionStore
        .getState()
        .submitTransaction(1, {
          mop: [{ code: 'ESP', montant: 100 }],
          paymentSide: 'unilateral',
        });

      await vi.waitFor(() => {
        expect(useTransactionStore.getState().isSubmitting).toBe(true);
      });

      resolveComplete!({ data: { data: undefined, success: true } });
      await submitPromise;

      expect(useTransactionStore.getState().isSubmitting).toBe(false);
    });
  });

  describe('recoverTPE', () => {
    it('should update selectedMOP on successful recovery', async () => {
      vi.mocked(transactionLot2Api.recoverTPE).mockResolvedValue({
        data: { data: undefined, success: true },
      } as never);

      const newMOP = [{ code: 'ESP', montant: 100 }];
      await useTransactionStore.getState().recoverTPE(1, newMOP);

      expect(useTransactionStore.getState().selectedMOP).toEqual(newMOP);
      expect(useTransactionStore.getState().tpeError).toBeNull();
      expect(useTransactionStore.getState().isSubmitting).toBe(false);
    });

    it('should set tpeError on recovery failure', async () => {
      vi.mocked(transactionLot2Api.recoverTPE).mockRejectedValue(
        new Error('Recovery failed'),
      );

      await useTransactionStore
        .getState()
        .recoverTPE(1, [{ code: 'ESP', montant: 100 }]);

      expect(useTransactionStore.getState().tpeError).toBe('Recovery failed');
      expect(useTransactionStore.getState().isSubmitting).toBe(false);
    });
  });

  describe('resetTransaction', () => {
    it('should reset all state to initial values', () => {
      useTransactionStore.setState({
        catalogMOP: mockMOP,
        catalogForfaits: mockForfaits,
        editionConfig: mockEditionConfig,
        preCheckResult: mockPreCheck,
        draft: mockDraft,
        paymentSide: 'bilateral',
        selectedMOP: [{ code: 'ESP', montant: 100 }],
        giftPassBalance: mockGiftPass,
        resortCreditBalance: mockResortCredit,
        isLoadingCatalogs: false,
        isSubmitting: true,
        tpeError: 'some error',
        catalogErrors: ['error1'],
      });

      useTransactionStore.getState().resetTransaction();

      const state = useTransactionStore.getState();
      expect(state.catalogMOP).toEqual([]);
      expect(state.catalogForfaits).toEqual([]);
      expect(state.editionConfig).toBeNull();
      expect(state.preCheckResult).toBeNull();
      expect(state.draft).toBeNull();
      expect(state.paymentSide).toBe('unilateral');
      expect(state.selectedMOP).toEqual([]);
      expect(state.giftPassBalance).toBeNull();
      expect(state.resortCreditBalance).toBeNull();
      expect(state.isLoadingCatalogs).toBe(false);
      expect(state.isSubmitting).toBe(false);
      expect(state.tpeError).toBeNull();
      expect(state.catalogErrors).toEqual([]);
    });
  });
});