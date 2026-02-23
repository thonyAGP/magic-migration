import { create } from 'zustand';
import type {
  MoyenPaiementCatalog,
  ForfaitData,
  PreCheckResult,
  EditionConfig,
  GiftPassResult,
  ResortCreditResult,
  SelectedMOP,
  TransactionDraft,
} from '@/types/transaction-lot2';
import type { PaymentSide } from '@/types/transaction';
import { transactionLot2Api } from '@/services/api/endpoints-lot2';
import type { CompleteTransactionRequest } from '@/services/api/types-lot2';
import {
  MOCK_MOP_CATALOG,
  MOCK_FORFAITS,
  MOCK_EDITION_CONFIG,
  MOCK_PRE_CHECK,
} from '@/fixtures/mock-transaction-catalogs';
import { useDataSourceStore } from './dataSourceStore';

interface TransactionState {
  // Catalogues (charges au mount)
  catalogMOP: MoyenPaiementCatalog[];
  catalogForfaits: ForfaitData[];
  editionConfig: EditionConfig | null;
  preCheckResult: PreCheckResult | null;

  // Draft transaction
  draft: TransactionDraft | null;

  // Payment
  paymentSide: PaymentSide;
  selectedMOP: SelectedMOP[];

  // Async checks
  giftPassBalance: GiftPassResult | null;
  resortCreditBalance: ResortCreditResult | null;

  // Loading states
  isLoadingCatalogs: boolean;
  isSubmitting: boolean;

  // Errors
  tpeError: string | null;
  catalogErrors: string[];
}

interface TransactionActions {
  // Chargement catalogues - Promise.all avec fail-safe INDIVIDUEL (Decision D1/D4)
  loadCatalogs: () => Promise<void>;

  // Draft
  setDraft: (draft: TransactionDraft | null) => void;

  // MOP management
  addMOP: (code: string, montant: number) => void;
  removeMOP: (code: string) => void;
  togglePaymentSide: () => void;

  // Balance checks
  checkGiftPass: (
    txId: number,
    societe: string,
    compte: number,
    filiation: number,
  ) => Promise<void>;
  checkResortCredit: (
    txId: number,
    societe: string,
    compte: number,
    filiation: number,
  ) => Promise<void>;

  // Submit
  submitTransaction: (
    txId: number,
    data: CompleteTransactionRequest,
  ) => Promise<{ success: boolean; error?: string }>;
  recoverTPE: (txId: number, newMOP: SelectedMOP[]) => Promise<void>;

  // Reset
  resetTransaction: () => void;
}

type TransactionStore = TransactionState & TransactionActions;

const initialState: TransactionState = {
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
};

// Mock data for gift pass and resort credit
const MOCK_GIFT_PASS: GiftPassResult = {
  available: true,
  balance: 150.00,
  devise: 'EUR',
};

const MOCK_RESORT_CREDIT: ResortCreditResult = {
  available: true,
  balance: 200.00,
  devise: 'EUR',
};

export const useTransactionStore = create<TransactionStore>()((set) => ({
  ...initialState,

  loadCatalogs: async () => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isLoadingCatalogs: true, catalogErrors: [] });

    if (!isRealApi) {
      // Mode Mock - retourne les catalogues fictifs immediatement
      set({
        preCheckResult: MOCK_PRE_CHECK,
        catalogMOP: MOCK_MOP_CATALOG,
        catalogForfaits: MOCK_FORFAITS,
        editionConfig: MOCK_EDITION_CONFIG,
        catalogErrors: [],
        isLoadingCatalogs: false,
      });
      return;
    }

    try {
      const errors: string[] = [];

      const [preCheck, mop, forfaits, edition] = await Promise.all([
        transactionLot2Api
          .preCheck()
          .catch((e: Error) => {
            errors.push('preCheck: ' + e.message);
            return { data: { data: MOCK_PRE_CHECK } };
          }),
        transactionLot2Api
          .getMoyenPaiements()
          .catch((e: Error) => {
            errors.push('mop: ' + e.message);
            return { data: { data: MOCK_MOP_CATALOG } };
          }),
        transactionLot2Api
          .getForfaits('default')
          .catch((e: Error) => {
            errors.push('forfaits: ' + e.message);
            return { data: { data: MOCK_FORFAITS } };
          }),
        transactionLot2Api
          .getEditionConfig()
          .catch((e: Error) => {
            errors.push('edition: ' + e.message);
            return { data: { data: MOCK_EDITION_CONFIG } };
          }),
      ]);

      set({
        preCheckResult: preCheck.data.data,
        catalogMOP: mop.data.data,
        catalogForfaits: forfaits.data.data,
        editionConfig: edition.data.data,
        catalogErrors: errors,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur chargement catalogues';
      set({ catalogErrors: [message] });
    } finally {
      set({ isLoadingCatalogs: false });
    }
  },

  setDraft: (draft) => set({ draft }),

  addMOP: (code, montant) =>
    set((state) => {
      const existing = state.selectedMOP.find((m) => m.code === code);
      if (existing) {
        return {
          selectedMOP: state.selectedMOP.map((m) =>
            m.code === code ? { ...m, montant } : m,
          ),
        };
      }
      return {
        selectedMOP: [...state.selectedMOP, { code, montant }],
      };
    }),

  removeMOP: (code) =>
    set((state) => ({
      selectedMOP: state.selectedMOP.filter((m) => m.code !== code),
    })),

  togglePaymentSide: () =>
    set((state) => ({
      paymentSide:
        state.paymentSide === 'unilateral' ? 'bilateral' : 'unilateral',
    })),

  checkGiftPass: async (txId, societe, compte, filiation) => {
    const { isRealApi } = useDataSourceStore.getState();

    if (!isRealApi) {
      set({ giftPassBalance: MOCK_GIFT_PASS });
      return;
    }

    try {
      const response = await transactionLot2Api.checkGiftPass(txId, {
        societe,
        compte,
        filiation,
      });
      set({ giftPassBalance: response.data.data });
    } catch {
      // API unavailable - fallback to mock
      set({ giftPassBalance: MOCK_GIFT_PASS });
    }
  },

  checkResortCredit: async (txId, societe, compte, filiation) => {
    const { isRealApi } = useDataSourceStore.getState();

    if (!isRealApi) {
      set({ resortCreditBalance: MOCK_RESORT_CREDIT });
      return;
    }

    try {
      const response = await transactionLot2Api.checkResortCredit(txId, {
        societe,
        compte,
        filiation,
      });
      set({ resortCreditBalance: response.data.data });
    } catch {
      // API unavailable - fallback to mock
      set({ resortCreditBalance: MOCK_RESORT_CREDIT });
    }
  },

  submitTransaction: async (txId, data) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isSubmitting: true, tpeError: null });

    if (!isRealApi) {
      // Mode Mock - simule un succes
      set({ isSubmitting: false });
      return { success: true };
    }

    try {
      await transactionLot2Api.complete(txId, data);
      return { success: true };
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : 'Erreur lors de la soumission';
      set({ tpeError: message });
      return { success: false, error: message };
    } finally {
      set({ isSubmitting: false });
    }
  },

  recoverTPE: async (txId, newMOP) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isSubmitting: true, tpeError: null });

    if (!isRealApi) {
      // Mode Mock - simule recovery
      set({ selectedMOP: newMOP, isSubmitting: false });
      return;
    }

    try {
      await transactionLot2Api.recoverTPE(txId, { newMOP });
      set({ selectedMOP: newMOP });
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : 'Erreur recovery TPE';
      set({ tpeError: message });
    } finally {
      set({ isSubmitting: false });
    }
  },

  resetTransaction: () => set({ ...initialState }),
}));
