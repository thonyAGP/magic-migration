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

export const useTransactionStore = create<TransactionStore>()((set) => ({
  ...initialState,

  loadCatalogs: async () => {
    set({ isLoadingCatalogs: true, catalogErrors: [] });
    try {
      const errors: string[] = [];

      const [preCheck, mop, forfaits, edition] = await Promise.all([
        transactionLot2Api
          .preCheck()
          .catch((e: Error) => {
            errors.push('preCheck: ' + e.message);
            return { data: { data: { canSell: true } as PreCheckResult } };
          }),
        transactionLot2Api
          .getMoyenPaiements()
          .catch((e: Error) => {
            errors.push('mop: ' + e.message);
            return { data: { data: [] as MoyenPaiementCatalog[] } };
          }),
        transactionLot2Api
          .getForfaits('default')
          .catch((e: Error) => {
            errors.push('forfaits: ' + e.message);
            return { data: { data: [] as ForfaitData[] } };
          }),
        transactionLot2Api
          .getEditionConfig()
          .catch((e: Error) => {
            errors.push('edition: ' + e.message);
            return { data: { data: null as EditionConfig | null } };
          }),
      ]);

      set({
        preCheckResult: preCheck.data.data,
        catalogMOP: mop.data.data,
        catalogForfaits: forfaits.data.data,
        editionConfig: edition.data.data,
        catalogErrors: errors,
      });
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
    try {
      const response = await transactionLot2Api.checkGiftPass(txId, {
        societe,
        compte,
        filiation,
      });
      set({ giftPassBalance: response.data.data });
    } catch {
      set({ giftPassBalance: null });
    }
  },

  checkResortCredit: async (txId, societe, compte, filiation) => {
    try {
      const response = await transactionLot2Api.checkResortCredit(txId, {
        societe,
        compte,
        filiation,
      });
      set({ resortCreditBalance: response.data.data });
    } catch {
      set({ resortCreditBalance: null });
    }
  },

  submitTransaction: async (txId, data) => {
    set({ isSubmitting: true, tpeError: null });
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
    set({ isSubmitting: true, tpeError: null });
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
