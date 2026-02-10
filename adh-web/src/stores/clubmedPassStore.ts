import { create } from 'zustand';
import type {
  ClubMedPass,
  PassTransaction,
  PassValidationResult,
  PassSummary,
} from '@/types/clubmedpass';
import { passApi } from '@/services/api/endpoints-lot5';
import { useDataSourceStore } from './dataSourceStore';

interface ClubMedPassState {
  currentPass: ClubMedPass | null;
  transactions: PassTransaction[];
  validationResult: PassValidationResult | null;
  summary: PassSummary | null;
  isValidating: boolean;
  isLoadingPass: boolean;
  isLoadingTransactions: boolean;
  isScanning: boolean;
  error: string | null;
}

interface ClubMedPassActions {
  validatePass: (
    numeroPass: string,
    montantTransaction: number,
    societe: string,
  ) => Promise<{ success: boolean; error?: string }>;
  loadPass: (numeroPass: string) => Promise<void>;
  loadTransactions: (numeroPass: string, limit?: number) => Promise<void>;
  scanCard: (
    numeroPass: string,
    societe: string,
  ) => Promise<{ success: boolean; error?: string }>;
  loadSummary: (societe: string) => Promise<void>;
  reset: () => void;
}

type ClubMedPassStore = ClubMedPassState & ClubMedPassActions;

const MOCK_PASS: ClubMedPass = {
  id: 1,
  numeroPass: 'CM-2026-001234',
  titulaire: 'Jean Dupont',
  societe: 'ADH',
  codeAdherent: 1001,
  filiation: 0,
  statut: 'active',
  solde: 250.0,
  devise: 'EUR',
  limitJournaliere: 500,
  limitHebdomadaire: 2000,
  dateExpiration: '2026-12-31',
  derniereUtilisation: '2026-02-09',
};

const MOCK_TRANSACTIONS: PassTransaction[] = [
  { id: 1, passId: 1, numeroPass: 'CM-2026-001234', date: '2026-02-09', heure: '14:30', montant: 45.00, type: 'debit', libelle: 'Achat boutique', operateur: 'USR001' },
  { id: 2, passId: 1, numeroPass: 'CM-2026-001234', date: '2026-02-08', heure: '10:15', montant: 120.00, type: 'credit', libelle: 'Rechargement', operateur: 'USR002' },
];

const MOCK_VALIDATION: PassValidationResult = {
  isValid: true,
  soldeDisponible: 250.00,
  peutTraiter: true,
  raison: null,
  limitJournaliereRestante: 455.00,
  limitHebdomadaireRestante: 1750.00,
};

const MOCK_SUMMARY: PassSummary = {
  nbPassActifs: 150,
  soldeTotal: 37500.00,
  nbTransactionsJour: 23,
};

const initialState: ClubMedPassState = {
  currentPass: null,
  transactions: [],
  validationResult: null,
  summary: null,
  isValidating: false,
  isLoadingPass: false,
  isLoadingTransactions: false,
  isScanning: false,
  error: null,
};

export const useClubMedPassStore = create<ClubMedPassStore>()((set, get) => ({
  ...initialState,

  validatePass: async (numeroPass, montantTransaction, societe) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isValidating: true, error: null });

    if (!isRealApi) {
      set({ validationResult: MOCK_VALIDATION, isValidating: false });
      return { success: true };
    }

    try {
      const response = await passApi.validate({
        numeroPass,
        montantTransaction,
        societe,
      });
      set({ validationResult: response.data.data ?? null, isValidating: false });
      return { success: true };
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : 'Erreur validation pass';
      set({ error: message, isValidating: false });
      return { success: false, error: message };
    }
  },

  loadPass: async (numeroPass) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isLoadingPass: true, error: null });

    if (!isRealApi) {
      set({ currentPass: { ...MOCK_PASS, numeroPass }, isLoadingPass: false });
      return;
    }

    try {
      const response = await passApi.getByNumber(numeroPass);
      set({ currentPass: response.data.data ?? null, isLoadingPass: false });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur chargement pass';
      set({ error: message, isLoadingPass: false });
    }
  },

  loadTransactions: async (numeroPass, limit) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isLoadingTransactions: true });

    if (!isRealApi) {
      const txs = limit ? MOCK_TRANSACTIONS.slice(0, limit) : MOCK_TRANSACTIONS;
      set({ transactions: txs, isLoadingTransactions: false });
      return;
    }

    try {
      const response = await passApi.getTransactions(numeroPass, limit);
      set({ transactions: response.data.data ?? [], isLoadingTransactions: false });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur chargement transactions';
      set({ error: message, transactions: [], isLoadingTransactions: false });
    }
  },

  scanCard: async (numeroPass, societe) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isScanning: true, error: null });

    if (!isRealApi) {
      set({ currentPass: { ...MOCK_PASS, numeroPass, societe }, transactions: MOCK_TRANSACTIONS, isScanning: false });
      return { success: true };
    }

    try {
      const response = await passApi.scan({ numeroPass, societe });
      const pass = response.data.data;
      set({ currentPass: pass ?? null, isScanning: false });
      await get().loadTransactions(numeroPass);
      return { success: true };
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur scan pass';
      set({ error: message, isScanning: false });
      return { success: false, error: message };
    }
  },

  loadSummary: async (societe) => {
    const { isRealApi } = useDataSourceStore.getState();

    if (!isRealApi) {
      set({ summary: MOCK_SUMMARY });
      return;
    }

    try {
      const response = await passApi.getSummary(societe);
      set({ summary: response.data.data ?? null });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur chargement resume';
      set({ error: message, summary: null });
    }
  },

  reset: () => set({ ...initialState }),
}));
