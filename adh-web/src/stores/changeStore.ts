import { create } from 'zustand';
import type {
  Devise,
  DeviseStock,
  ChangeOperation,
  ChangeOperationSummary,
  ChangeOperationType,
} from '@/types/change';
import { changeApi } from '@/services/api/endpoints-lot3';
import { useDataSourceStore } from './dataSourceStore';

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

const MOCK_STOCK: DeviseStock[] = [
  { deviseCode: 'USD', deviseLibelle: 'Dollar US', montant: 5000, nbOperations: 12 },
  { deviseCode: 'GBP', deviseLibelle: 'Livre Sterling', montant: 3200, nbOperations: 8 },
  { deviseCode: 'CHF', deviseLibelle: 'Franc Suisse', montant: 1500, nbOperations: 4 },
];

const MOCK_OPERATIONS: ChangeOperation[] = [
  { id: 1, type: 'achat', deviseCode: 'USD', deviseLibelle: 'Dollar US', montant: 500, taux: 1.0856, contreValeur: 460.58, modePaiement: 'CB', date: '2026-02-10', heure: '10:30', operateur: 'CAISSIER1', annule: false },
  { id: 2, type: 'vente', deviseCode: 'GBP', deviseLibelle: 'Livre Sterling', montant: 200, taux: 0.8534, contreValeur: 234.36, modePaiement: 'ESP', date: '2026-02-10', heure: '11:15', operateur: 'CAISSIER1', annule: false },
];

const MOCK_SUMMARY: ChangeOperationSummary = {
  totalAchats: 460.58,
  totalVentes: 234.36,
  nbOperations: 2,
};

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
    const { isRealApi } = useDataSourceStore.getState();
    set({ isLoadingDevises: true, error: null });

    if (!isRealApi) {
      set({ devises: MOCK_DEVISES, isLoadingDevises: false });
      return;
    }

    try {
      const response = await changeApi.getDevises(societe);
      const devises = response.data.data;
      set({ devises: devises && devises.length > 0 ? devises : [] });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur chargement devises';
      set({ devises: [], error: message });
    } finally {
      set({ isLoadingDevises: false });
    }
  },

  loadStock: async (societe) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isLoadingStock: true, error: null });

    if (!isRealApi) {
      set({ stock: MOCK_STOCK, isLoadingStock: false });
      return;
    }

    try {
      const response = await changeApi.getStock(societe);
      set({ stock: response.data.data ?? [] });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur chargement stock';
      set({ stock: [], error: message });
    } finally {
      set({ isLoadingStock: false });
    }
  },

  loadOperations: async (societe) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isLoadingOperations: true });

    if (!isRealApi) {
      set({ operations: MOCK_OPERATIONS, summary: MOCK_SUMMARY, isLoadingOperations: false });
      return;
    }

    try {
      const response = await changeApi.getOperations(societe);
      set({
        operations: response.data.data.operations ?? [],
        summary: response.data.data.summary ?? null,
      });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur chargement operations';
      set({ operations: [], summary: null, error: message });
    } finally {
      set({ isLoadingOperations: false });
    }
  },

  createOperation: async (societe, type, deviseCode, montant, taux, modePaiement, operateur) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isSubmitting: true, error: null });

    if (!isRealApi) {
      const newOp: ChangeOperation = {
        id: Date.now(),
        type,
        deviseCode,
        deviseLibelle: MOCK_DEVISES.find((d) => d.code === deviseCode)?.libelle ?? deviseCode,
        montant,
        taux,
        contreValeur: montant / taux,
        modePaiement,
        date: new Date().toISOString().slice(0, 10),
        heure: new Date().toTimeString().slice(0, 5),
        operateur,
        annule: false,
      };
      set((state) => ({
        operations: [...state.operations, newOp],
        isSubmitting: false,
      }));
      return { success: true };
    }

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
    const { isRealApi } = useDataSourceStore.getState();
    set({ isCancelling: true, error: null });

    if (!isRealApi) {
      set((state) => ({
        operations: state.operations.map((op) =>
          op.id === operationId ? { ...op, annule: true } : op,
        ),
        isCancelling: false,
      }));
      return { success: true };
    }

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
