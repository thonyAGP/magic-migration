import { create } from 'zustand';
import type {
  ClubMedPass,
  PassTransaction,
  PassValidationResult,
  PassSummary,
  Affiliate,
  ForfaitTAI,
  PassCreationData,
  PassOppositionData,
} from '@/types/clubmedpass';
import { passApi } from '@/services/api/endpoints-lot5';
import { useDataSourceStore } from './dataSourceStore';

interface ClubMedPassState {
  currentPass: ClubMedPass | null;
  transactions: PassTransaction[];
  validationResult: PassValidationResult | null;
  summary: PassSummary | null;
  affiliates: Affiliate[];
  barLimit: number;
  maxBarLimit: number;
  forfaitsTAI: ForfaitTAI[];
  isValidating: boolean;
  isLoadingPass: boolean;
  isLoadingTransactions: boolean;
  isScanning: boolean;
  isLoadingAffiliates: boolean;
  isLoadingForfaits: boolean;
  isCreating: boolean;
  creationResult: ClubMedPass | null;
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
  loadAffiliates: (passId: string) => Promise<void>;
  addAffiliate: (affiliate: Omit<Affiliate, 'id' | 'isActive'>) => void;
  removeAffiliate: (affiliateId: string) => void;
  toggleAffiliate: (affiliateId: string, active: boolean) => void;
  updateBarLimit: (passId: string, limit: number) => void;
  loadForfaitsTAI: (passId: string) => Promise<void>;
  activateForfait: (forfaitId: string) => void;
  deactivateForfait: (forfaitId: string) => void;
  createPass: (data: PassCreationData) => Promise<{ success: boolean; error?: string }>;
  opposePass: (data: PassOppositionData) => Promise<{ success: boolean; error?: string }>;
  deletePass: (passId: string) => Promise<{ success: boolean; error?: string }>;
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

const MOCK_AFFILIATES: Affiliate[] = [
  { id: 'aff-1', nom: 'Dupont', prenom: 'Marie', dateNaissance: '1985-03-15', lienParente: 'conjoint', isActive: true },
  { id: 'aff-2', nom: 'Dupont', prenom: 'Lucas', dateNaissance: '2012-07-22', lienParente: 'enfant', isActive: true },
  { id: 'aff-3', nom: 'Dupont', prenom: 'Emma', dateNaissance: '2015-11-03', lienParente: 'enfant', isActive: false },
];

const MOCK_FORFAITS_TAI: ForfaitTAI[] = [
  { id: 'tai-1', libelle: 'Forfait Spa & Bien-etre', dateDebut: '2026-02-01', dateFin: '2026-02-15', montant: 150.00, isActive: true },
  { id: 'tai-2', libelle: 'Forfait Sports Nautiques', dateDebut: '2026-02-01', dateFin: '2026-02-15', montant: 200.00, isActive: false },
  { id: 'tai-3', libelle: 'Forfait Excursions', dateDebut: '2026-02-05', dateFin: '2026-02-12', montant: 120.00, isActive: true },
];

const initialState: ClubMedPassState = {
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
    set({ isLoadingTransactions: true, error: null });

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

  loadAffiliates: async (_passId) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isLoadingAffiliates: true });

    if (!isRealApi) {
      set({ affiliates: MOCK_AFFILIATES, isLoadingAffiliates: false });
      return;
    }

    // API: will be connected when backend is ready
    set({ affiliates: [], isLoadingAffiliates: false });
  },

  addAffiliate: (data) => {
    const newAffiliate: Affiliate = {
      ...data,
      id: `aff-${Date.now()}`,
      isActive: true,
    };
    set((state) => ({ affiliates: [...state.affiliates, newAffiliate] }));
  },

  removeAffiliate: (affiliateId) => {
    set((state) => ({
      affiliates: state.affiliates.filter((a) => a.id !== affiliateId),
    }));
  },

  toggleAffiliate: (affiliateId, active) => {
    set((state) => ({
      affiliates: state.affiliates.map((a) =>
        a.id === affiliateId ? { ...a, isActive: active } : a,
      ),
    }));
  },

  updateBarLimit: (_passId, limit) => {
    set({ barLimit: limit });
  },

  loadForfaitsTAI: async (_passId) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isLoadingForfaits: true });

    if (!isRealApi) {
      set({ forfaitsTAI: MOCK_FORFAITS_TAI, isLoadingForfaits: false });
      return;
    }

    // API: will be connected when backend is ready
    set({ forfaitsTAI: [], isLoadingForfaits: false });
  },

  activateForfait: (forfaitId) => {
    set((state) => ({
      forfaitsTAI: state.forfaitsTAI.map((f) =>
        f.id === forfaitId ? { ...f, isActive: true } : f,
      ),
    }));
  },

  deactivateForfait: (forfaitId) => {
    set((state) => ({
      forfaitsTAI: state.forfaitsTAI.map((f) =>
        f.id === forfaitId ? { ...f, isActive: false } : f,
      ),
    }));
  },

  createPass: async (data) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isCreating: true, error: null, creationResult: null });

    if (!isRealApi) {
      const newPass: ClubMedPass = {
        id: Date.now(),
        numeroPass: `CM-2026-${String(Date.now()).slice(-6)}`,
        titulaire: `${data.prenom} ${data.nom}`,
        societe: 'ADH',
        codeAdherent: Math.floor(Math.random() * 9000) + 1000,
        filiation: 0,
        statut: 'active',
        solde: 0,
        devise: 'EUR',
        limitJournaliere: data.plafondJournalier,
        limitHebdomadaire: data.plafondJournalier * 4,
        dateExpiration: data.dateFin,
        derniereUtilisation: null,
      };
      set({ creationResult: newPass, isCreating: false });
      return { success: true };
    }

    try {
      const response = await passApi.create(data);
      set({ creationResult: response.data.data ?? null, isCreating: false });
      return { success: true };
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur creation pass';
      set({ error: message, isCreating: false });
      return { success: false, error: message };
    }
  },

  opposePass: async (data) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ error: null });

    if (!isRealApi) {
      set((state) => ({
        currentPass: state.currentPass
          ? { ...state.currentPass, statut: 'suspendu' as const }
          : null,
      }));
      return { success: true };
    }

    try {
      await passApi.oppose(data);
      set((state) => ({
        currentPass: state.currentPass
          ? { ...state.currentPass, statut: 'suspendu' as const }
          : null,
      }));
      return { success: true };
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur opposition pass';
      set({ error: message });
      return { success: false, error: message };
    }
  },

  deletePass: async (passId) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ error: null });

    if (!isRealApi) {
      set({ currentPass: null, transactions: [], validationResult: null });
      return { success: true };
    }

    try {
      await passApi.delete(passId);
      set({ currentPass: null, transactions: [], validationResult: null });
      return { success: true };
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur suppression pass';
      set({ error: message });
      return { success: false, error: message };
    }
  },

  reset: () => set({ ...initialState }),
}));
