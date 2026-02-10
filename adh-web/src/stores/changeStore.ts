import { create } from 'zustand';
import type {
  Devise,
  DeviseStock,
  ChangeOperation,
  ChangeOperationSummary,
  ChangeOperationType,
} from '@/types/change';
import { changeApi } from '@/services/api/endpoints-lot3';

interface ChangeState {
  devises: Devise[];
  stock: DeviseStock[];
  operations: ChangeOperation[];
  summary: ChangeOperationSummary | null;
  isLoadingDevises: boolean;
  isLoadingStock: boolean;
  isLoadingOperations: boolean;
  isSubmitting: boolean;
  isCancelling: boolean;
  error: string | null;
}

interface ChangeActions {
  loadDevises: (societe: string) => Promise<void>;
  loadStock: (societe: string) => Promise<void>;
  loadOperations: (societe: string) => Promise<void>;
  createOperation: (
    societe: string,
    type: ChangeOperationType,
    deviseCode: string,
    montant: number,
    taux: number,
    modePaiement: string,
    operateur: string,
  ) => Promise<{ success: boolean; error?: string }>;
  cancelOperation: (
    operationId: number,
    motif: string,
  ) => Promise<{ success: boolean; error?: string }>;
  reset: () => void;
}

type ChangeStore = ChangeState & ChangeActions;

const MOCK_DEVISES: Devise[] = [
  { code: 'USD', libelle: 'Dollar US', symbole: '$', tauxActuel: 1.0856, nbDecimales: 2 },
  { code: 'GBP', libelle: 'Livre Sterling', symbole: '\u00a3', tauxActuel: 0.8534, nbDecimales: 2 },
  { code: 'CHF', libelle: 'Franc Suisse', symbole: 'CHF', tauxActuel: 0.9412, nbDecimales: 2 },
];

const initialState: ChangeState = {
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
};

export const useChangeStore = create<ChangeStore>()((set, get) => ({
  ...initialState,

  loadDevises: async (societe) => {
    set({ isLoadingDevises: true, error: null });
    try {
      const response = await changeApi.getDevises(societe);
      const devises = response.data.data;
      set({ devises: devises && devises.length > 0 ? devises : MOCK_DEVISES });
    } catch {
      set({ devises: MOCK_DEVISES, error: 'Mode dev: devises mock chargees' });
    } finally {
      set({ isLoadingDevises: false });
    }
  },

  loadStock: async (societe) => {
    set({ isLoadingStock: true });
    try {
      const response = await changeApi.getStock(societe);
      set({ stock: response.data.data ?? [] });
    } catch {
      set({ stock: [] });
    } finally {
      set({ isLoadingStock: false });
    }
  },

  loadOperations: async (societe) => {
    set({ isLoadingOperations: true });
    try {
      const response = await changeApi.getOperations(societe);
      set({
        operations: response.data.data.operations ?? [],
        summary: response.data.data.summary ?? null,
      });
    } catch {
      set({ operations: [], summary: null });
    } finally {
      set({ isLoadingOperations: false });
    }
  },

  createOperation: async (societe, type, deviseCode, montant, taux, modePaiement, operateur) => {
    set({ isSubmitting: true, error: null });
    try {
      await changeApi.createOperation({
        societe,
        type,
        deviseCode,
        montant,
        taux,
        modePaiement,
        operateur,
      });
      // Reload operations and stock after creation
      const state = get();
      await Promise.all([
        state.loadOperations(societe),
        state.loadStock(societe),
      ]);
      return { success: true };
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Erreur lors de la creation";
      set({ error: message });
      return { success: false, error: message };
    } finally {
      set({ isSubmitting: false });
    }
  },

  cancelOperation: async (operationId, motif) => {
    set({ isCancelling: true, error: null });
    try {
      await changeApi.cancelOperation(operationId, { motif });
      // Mark operation as cancelled locally
      set((state) => ({
        operations: state.operations.map((op) =>
          op.id === operationId ? { ...op, annule: true } : op,
        ),
      }));
      return { success: true };
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Erreur lors de l'annulation";
      set({ error: message });
      return { success: false, error: message };
    } finally {
      set({ isCancelling: false });
    }
  },

  reset: () => set({ ...initialState }),
}));
