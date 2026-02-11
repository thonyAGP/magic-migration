import { create } from 'zustand';
import type {
  CaisseOpType,
  CaisseOperation,
  ApportCoffreData,
  ApportProduitsData,
  RemiseCoffreData,
  TelecollecteData,
  TelecollecteResult,
  PointageData,
  RegularisationData,
} from '@/types/caisseOps';
import { caisseOpsApi } from '@/services/api/endpoints-caisse-ops';
import { useDataSourceStore } from './dataSourceStore';

interface CaisseOpsState {
  currentOp: CaisseOpType | null;
  isExecuting: boolean;
  error: string | null;
  lastResult: CaisseOperation | null;
  telecollecteResult: TelecollecteResult | null;
  pointageData: PointageData | null;
  isLoadingPointage: boolean;
}

interface CaisseOpsActions {
  setCurrentOp: (op: CaisseOpType | null) => void;
  executeApportCoffre: (data: ApportCoffreData) => Promise<void>;
  executeApportProduits: (data: ApportProduitsData) => Promise<void>;
  executeRemiseCoffre: (data: RemiseCoffreData) => Promise<void>;
  executeTelecollecte: (data: TelecollecteData) => Promise<void>;
  loadPointage: (deviseCode: string) => Promise<void>;
  executeRegularisation: (data: RegularisationData) => Promise<void>;
  reset: () => void;
}

type CaisseOpsStore = CaisseOpsState & CaisseOpsActions;

const initialState: CaisseOpsState = {
  currentOp: null,
  isExecuting: false,
  error: null,
  lastResult: null,
  telecollecteResult: null,
  pointageData: null,
  isLoadingPointage: false,
};

function mockOperation(
  type: CaisseOpType,
  montant: number,
  devise: string,
): CaisseOperation {
  return {
    id: Date.now(),
    type,
    montant,
    deviseCode: devise,
    date: new Date().toISOString().slice(0, 10),
    heure: new Date().toTimeString().slice(0, 5),
    userId: 1,
    reference: `OP-${Date.now()}`,
    status: 'termine',
  };
}

const MOCK_POINTAGE: PointageData = {
  deviseCode: 'EUR',
  comptages: [
    { type: 'Especes', montantAttendu: 500, montantCompte: 495, ecart: -5 },
    { type: 'CB', montantAttendu: 1200, montantCompte: 1200, ecart: 0 },
    { type: 'Cheques', montantAttendu: 300, montantCompte: 300, ecart: 0 },
  ],
};

const MOCK_TELECOLLECTE: TelecollecteResult = {
  success: true,
  montantCollecte: 1200,
  nbTransactionsTraitees: 45,
};

export const useCaisseOpsStore = create<CaisseOpsStore>()((set) => ({
  ...initialState,

  setCurrentOp: (op) => set({ currentOp: op, error: null }),

  executeApportCoffre: async (data) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isExecuting: true, error: null });

    if (!isRealApi) {
      const result = mockOperation('APPORT_COFFRE', data.montant, data.deviseCode);
      set({ lastResult: result, isExecuting: false });
      return;
    }

    try {
      const res = await caisseOpsApi.apportCoffre({ ...data, sessionId: 0 });
      const op = res.data.data;
      set({
        lastResult: mockOperation('APPORT_COFFRE', data.montant, data.deviseCode),
        isExecuting: false,
        error: op.success ? null : 'Erreur apport coffre',
      });
    } catch (e: unknown) {
      set({
        error: e instanceof Error ? e.message : 'Erreur apport coffre',
        isExecuting: false,
      });
    }
  },

  executeApportProduits: async (data) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isExecuting: true, error: null });

    if (!isRealApi) {
      const result = mockOperation('APPORT_PRODUITS', data.montantTotal, 'EUR');
      set({ lastResult: result, isExecuting: false });
      return;
    }

    try {
      await caisseOpsApi.apportProduits({ ...data, sessionId: 0 });
      set({
        lastResult: mockOperation('APPORT_PRODUITS', data.montantTotal, 'EUR'),
        isExecuting: false,
      });
    } catch (e: unknown) {
      set({
        error: e instanceof Error ? e.message : 'Erreur apport produits',
        isExecuting: false,
      });
    }
  },

  executeRemiseCoffre: async (data) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isExecuting: true, error: null });

    if (!isRealApi) {
      const result = mockOperation('REMISE_COFFRE', data.montant, data.deviseCode);
      set({ lastResult: result, isExecuting: false });
      return;
    }

    try {
      await caisseOpsApi.remiseCoffre({ ...data, sessionId: 0 });
      set({
        lastResult: mockOperation('REMISE_COFFRE', data.montant, data.deviseCode),
        isExecuting: false,
      });
    } catch (e: unknown) {
      set({
        error: e instanceof Error ? e.message : 'Erreur remise coffre',
        isExecuting: false,
      });
    }
  },

  executeTelecollecte: async (data) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isExecuting: true, error: null });

    if (!isRealApi) {
      set({
        telecollecteResult: MOCK_TELECOLLECTE,
        lastResult: mockOperation('TELECOLLECTE', data.montantTotal, 'EUR'),
        isExecuting: false,
      });
      return;
    }

    try {
      const res = await caisseOpsApi.telecollecte({ ...data, sessionId: 0 });
      set({
        telecollecteResult: res.data.data,
        lastResult: mockOperation('TELECOLLECTE', data.montantTotal, 'EUR'),
        isExecuting: false,
      });
    } catch (e: unknown) {
      set({
        error: e instanceof Error ? e.message : 'Erreur telecollecte',
        isExecuting: false,
      });
    }
  },

  loadPointage: async (deviseCode) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isLoadingPointage: true, error: null });

    if (!isRealApi) {
      set({
        pointageData: { ...MOCK_POINTAGE, deviseCode },
        isLoadingPointage: false,
      });
      return;
    }

    try {
      const res = await caisseOpsApi.getPointage(deviseCode);
      set({ pointageData: res.data.data, isLoadingPointage: false });
    } catch (e: unknown) {
      set({
        pointageData: { ...MOCK_POINTAGE, deviseCode },
        error: e instanceof Error ? e.message : 'Erreur chargement pointage',
        isLoadingPointage: false,
      });
    }
  },

  executeRegularisation: async (data) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isExecuting: true, error: null });

    if (!isRealApi) {
      const montant = data.typeRegularisation === 'ajustement_positif'
        ? data.montantEcart
        : -data.montantEcart;
      set({
        lastResult: mockOperation('POINTAGE', montant, data.deviseCode),
        isExecuting: false,
      });
      return;
    }

    try {
      await caisseOpsApi.regularisation({ ...data, sessionId: 0 });
      set({ isExecuting: false });
    } catch (e: unknown) {
      set({
        error: e instanceof Error ? e.message : 'Erreur regularisation',
        isExecuting: false,
      });
    }
  },

  reset: () => set({ ...initialState }),
}));
