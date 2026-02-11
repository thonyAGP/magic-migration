import { create } from 'zustand';
import type {
  DataCatchStep,
  CustomerSearchResult,
  CustomerPersonalInfo,
  CustomerAddress,
  CustomerPreferences,
  DataCatchSession,
  DataCatchSummary,
  GuestData,
  CheckoutStatus,
  VillageConfig,
  SystemStatus,
} from '@/types/datacatch';
import { datacatchApi } from '@/services/api/endpoints-lot5';
import { useDataSourceStore } from './dataSourceStore';

interface CounterOccupation {
  current: number;
  max: number;
  waiting: number;
}

interface CatchingStats {
  treatedToday: number;
  avgTimeMinutes: number;
  completionRate: number;
}

interface DataCatchState {
  currentSession: DataCatchSession | null;
  searchResults: CustomerSearchResult[];
  summary: DataCatchSummary | null;
  currentStep: DataCatchStep;
  personalInfo: CustomerPersonalInfo | null;
  address: CustomerAddress | null;
  preferences: CustomerPreferences | null;
  // Counter & stats (IDE 7/17)
  counterOccupation: CounterOccupation;
  catchingStats: CatchingStats;
  isSearching: boolean;
  isSaving: boolean;
  isCompleting: boolean;
  error: string | null;
  // Checkout (IDE 8)
  guestData: GuestData | null;
  checkoutStatus: CheckoutStatus;
  // Village config (IDE 9)
  villageConfig: VillageConfig | null;
  systemStatus: SystemStatus | null;
}

interface DataCatchActions {
  searchCustomer: (
    societe: string,
    nom?: string,
    prenom?: string,
    email?: string,
    telephone?: string,
  ) => Promise<void>;
  createSession: (
    societe: string,
    operateur: string,
    customerId?: number,
    isNewCustomer?: boolean,
  ) => Promise<{ success: boolean; sessionId?: string; error?: string }>;
  loadSession: (sessionId: string) => Promise<void>;
  savePersonalInfo: (
    sessionId: string,
    data: CustomerPersonalInfo,
  ) => Promise<{ success: boolean; error?: string }>;
  saveAddress: (
    sessionId: string,
    data: CustomerAddress,
  ) => Promise<{ success: boolean; error?: string }>;
  savePreferences: (
    sessionId: string,
    data: CustomerPreferences,
  ) => Promise<{ success: boolean; error?: string }>;
  completeSession: (
    sessionId: string,
  ) => Promise<{ success: boolean; error?: string }>;
  cancelSession: (
    sessionId: string,
  ) => Promise<{ success: boolean; error?: string }>;
  setStep: (step: DataCatchStep) => void;
  loadSummary: (societe: string) => Promise<void>;
  // Counter & stats actions (IDE 7/17)
  updateCounter: () => void;
  loadCatchingStats: () => void;
  // Checkout actions (IDE 8)
  loadGuestData: (guestId: string) => Promise<void>;
  acceptCheckout: () => Promise<{ success: boolean; error?: string }>;
  declineCheckout: (reason: string) => Promise<{ success: boolean; error?: string }>;
  cancelPass: () => Promise<{ success: boolean; error?: string }>;
  // Village config actions (IDE 9)
  loadVillageConfig: () => Promise<void>;
  checkSystemStatus: () => Promise<void>;
  reset: () => void;
}

type DataCatchStore = DataCatchState & DataCatchActions;

const MOCK_SEARCH_RESULTS: CustomerSearchResult[] = [
  { customerId: 1, nom: 'Dupont', prenom: 'Jean', email: 'jean.dupont@email.com', telephone: '+33612345678', scoreMatch: 95 },
  { customerId: 2, nom: 'Martin', prenom: 'Marie', email: 'marie.martin@email.com', telephone: '+33698765432', scoreMatch: 88 },
];

const MOCK_SESSION: DataCatchSession = {
  sessionId: 'MOCK-DC-001',
  societe: 'ADH',
  operateur: 'USR001',
  customerId: 1,
  isNewCustomer: false,
  step: 'personal',
  personalInfo: null,
  address: null,
  preferences: null,
  statut: 'en_cours',
  dateCreation: '2026-02-10T09:00:00Z',
};

const MOCK_SUMMARY: DataCatchSummary = {
  nbSessionsJour: 45,
  nbNouveauxClients: 8,
  nbMisesAJour: 37,
};

const MOCK_GUEST: GuestData = {
  id: 'GUEST-001',
  nom: 'Dupont',
  prenom: 'Jean',
  chambre: '214',
  dateArrivee: '2026-02-08',
  dateDepart: '2026-02-15',
  passId: 'CMP-2026-0042',
  solde: 45.50,
  status: 'checking_out',
};

const MOCK_VILLAGE: VillageConfig = {
  code: 'OIR',
  nom: 'Opio en Provence',
  pays: 'France',
  timezone: 'Europe/Paris',
  saison: 'toutes_saisons',
  capacite: 430,
  deviseLocale: 'EUR',
};

const MOCK_SYSTEM_STATUS: SystemStatus = {
  database: 'ok',
  network: 'ok',
  printer: 'ok',
  lastSync: new Date().toISOString(),
};

const initialState: DataCatchState = {
  currentSession: null,
  searchResults: [],
  summary: null,
  currentStep: 'welcome',
  personalInfo: null,
  address: null,
  preferences: null,
  counterOccupation: { current: 0, max: 20, waiting: 0 },
  catchingStats: { treatedToday: 0, avgTimeMinutes: 0, completionRate: 0 },
  isSearching: false,
  isSaving: false,
  isCompleting: false,
  error: null,
  guestData: null,
  checkoutStatus: 'idle',
  villageConfig: null,
  systemStatus: null,
};

export const useDataCatchStore = create<DataCatchStore>()((set) => ({
  ...initialState,

  searchCustomer: async (societe, nom, prenom, email, telephone) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isSearching: true, error: null });

    if (!isRealApi) {
      const filtered = MOCK_SEARCH_RESULTS.filter((c) => {
        if (nom && !c.nom.toLowerCase().includes(nom.toLowerCase())) return false;
        if (prenom && !c.prenom.toLowerCase().includes(prenom.toLowerCase())) return false;
        if (email && !c.email.toLowerCase().includes(email.toLowerCase())) return false;
        return true;
      });
      set({ searchResults: filtered.length > 0 ? filtered : MOCK_SEARCH_RESULTS, isSearching: false });
      return;
    }

    try {
      const response = await datacatchApi.searchCustomer({
        societe,
        nom,
        prenom,
        email,
        telephone,
      });
      set({ searchResults: response.data.data ?? [], isSearching: false });
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : 'Erreur recherche client';
      set({ searchResults: [], error: message, isSearching: false });
    }
  },

  createSession: async (societe, operateur, customerId, isNewCustomer = true) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isSaving: true, error: null });

    if (!isRealApi) {
      const mockId = `MOCK-DC-${Date.now()}`;
      set({
        currentSession: { ...MOCK_SESSION, sessionId: mockId, societe, operateur, customerId: customerId ?? null, isNewCustomer },
        currentStep: 'personal',
        isSaving: false,
      });
      return { success: true, sessionId: mockId };
    }

    try {
      const response = await datacatchApi.createSession({
        societe,
        customerId,
        isNewCustomer,
        operateur,
      });
      const sessionId = response.data.data?.sessionId;
      set({ isSaving: false });
      return { success: true, sessionId };
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : 'Erreur creation session';
      set({ error: message, isSaving: false });
      return { success: false, error: message };
    }
  },

  loadSession: async (sessionId) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isSaving: true, error: null });

    if (!isRealApi) {
      set({
        currentSession: { ...MOCK_SESSION, sessionId },
        currentStep: MOCK_SESSION.step,
        personalInfo: MOCK_SESSION.personalInfo ?? null,
        address: MOCK_SESSION.address ?? null,
        preferences: MOCK_SESSION.preferences ?? null,
        isSaving: false,
      });
      return;
    }

    try {
      const response = await datacatchApi.getSession(sessionId);
      const session = response.data.data;
      set({
        currentSession: session ?? null,
        currentStep: session?.step ?? 'welcome',
        personalInfo: session?.personalInfo ?? null,
        address: session?.address ?? null,
        preferences: session?.preferences ?? null,
        isSaving: false,
      });
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : 'Erreur chargement session';
      set({ currentSession: null, error: message, isSaving: false });
    }
  },

  savePersonalInfo: async (sessionId, data) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isSaving: true, error: null });

    if (!isRealApi) {
      set({ personalInfo: data, currentStep: 'address', isSaving: false });
      return { success: true };
    }

    try {
      await datacatchApi.savePersonalInfo(sessionId, data);
      set({ personalInfo: data, currentStep: 'address', isSaving: false });
      return { success: true };
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : 'Erreur sauvegarde info personnelle';
      set({ error: message, isSaving: false });
      return { success: false, error: message };
    }
  },

  saveAddress: async (sessionId, data) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isSaving: true, error: null });

    if (!isRealApi) {
      set({ address: data, currentStep: 'preferences', isSaving: false });
      return { success: true };
    }

    try {
      await datacatchApi.saveAddress(sessionId, data);
      set({ address: data, currentStep: 'preferences', isSaving: false });
      return { success: true };
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : 'Erreur sauvegarde adresse';
      set({ error: message, isSaving: false });
      return { success: false, error: message };
    }
  },

  savePreferences: async (sessionId, data) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isSaving: true, error: null });

    if (!isRealApi) {
      set({ preferences: data, currentStep: 'review', isSaving: false });
      return { success: true };
    }

    try {
      await datacatchApi.savePreferences(sessionId, data);
      set({ preferences: data, currentStep: 'review', isSaving: false });
      return { success: true };
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : 'Erreur sauvegarde preferences';
      set({ error: message, isSaving: false });
      return { success: false, error: message };
    }
  },

  completeSession: async (sessionId) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isCompleting: true, error: null });

    if (!isRealApi) {
      set({ currentStep: 'complete', isCompleting: false });
      return { success: true };
    }

    try {
      await datacatchApi.completeSession(sessionId);
      set({ currentStep: 'complete', isCompleting: false });
      return { success: true };
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : 'Erreur finalisation session';
      set({ error: message, isCompleting: false });
      return { success: false, error: message };
    }
  },

  cancelSession: async (sessionId) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isSaving: true, error: null });

    if (!isRealApi) {
      set({ currentStep: 'welcome', currentSession: null, isSaving: false });
      return { success: true };
    }

    try {
      await datacatchApi.cancelSession(sessionId);
      set({ currentStep: 'welcome', currentSession: null, isSaving: false });
      return { success: true };
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : 'Erreur annulation session';
      set({ error: message, isSaving: false });
      return { success: false, error: message };
    }
  },

  setStep: (step) => set({ currentStep: step }),

  updateCounter: () => {
    set({ counterOccupation: { current: Math.floor(Math.random() * 18) + 2, max: 20, waiting: Math.floor(Math.random() * 3) } });
  },

  loadCatchingStats: () => {
    set({ catchingStats: { treatedToday: 32, avgTimeMinutes: 4.2, completionRate: 87 } });
  },

  loadGuestData: async (guestId) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isSaving: true, error: null });

    if (!isRealApi) {
      set({ guestData: { ...MOCK_GUEST, id: guestId }, checkoutStatus: 'idle', isSaving: false });
      return;
    }

    try {
      const response = await datacatchApi.getGuest(guestId);
      set({ guestData: response.data.data ?? null, checkoutStatus: 'idle', isSaving: false });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur chargement guest';
      set({ guestData: null, error: message, isSaving: false });
    }
  },

  acceptCheckout: async () => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ checkoutStatus: 'processing', error: null });

    if (!isRealApi) {
      set((state) => ({
        checkoutStatus: 'accepted',
        guestData: state.guestData ? { ...state.guestData, status: 'checked_out' } : null,
      }));
      return { success: true };
    }

    try {
      const guestId = useDataCatchStore.getState().guestData?.id;
      if (!guestId) throw new Error('No guest selected');
      await datacatchApi.acceptCheckout(guestId);
      set((state) => ({
        checkoutStatus: 'accepted',
        guestData: state.guestData ? { ...state.guestData, status: 'checked_out' } : null,
      }));
      return { success: true };
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur checkout';
      set({ checkoutStatus: 'idle', error: message });
      return { success: false, error: message };
    }
  },

  declineCheckout: async (reason) => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ checkoutStatus: 'processing', error: null });

    if (!isRealApi) {
      set({ checkoutStatus: 'declined' });
      return { success: true };
    }

    try {
      const guestId = useDataCatchStore.getState().guestData?.id;
      if (!guestId) throw new Error('No guest selected');
      await datacatchApi.declineCheckout(guestId, reason);
      set({ checkoutStatus: 'declined' });
      return { success: true };
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur refus checkout';
      set({ checkoutStatus: 'idle', error: message });
      return { success: false, error: message };
    }
  },

  cancelPass: async () => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ checkoutStatus: 'processing', error: null });

    if (!isRealApi) {
      set((state) => ({
        checkoutStatus: 'cancelled',
        guestData: state.guestData ? { ...state.guestData, passId: undefined } : null,
      }));
      return { success: true };
    }

    try {
      const guestId = useDataCatchStore.getState().guestData?.id;
      if (!guestId) throw new Error('No guest selected');
      await datacatchApi.cancelPass(guestId);
      set((state) => ({
        checkoutStatus: 'cancelled',
        guestData: state.guestData ? { ...state.guestData, passId: undefined } : null,
      }));
      return { success: true };
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur annulation pass';
      set({ checkoutStatus: 'idle', error: message });
      return { success: false, error: message };
    }
  },

  loadVillageConfig: async () => {
    const { isRealApi } = useDataSourceStore.getState();

    if (!isRealApi) {
      set({ villageConfig: MOCK_VILLAGE, systemStatus: MOCK_SYSTEM_STATUS });
      return;
    }

    try {
      const response = await datacatchApi.getVillageConfig();
      set({ villageConfig: response.data.data ?? null });
    } catch {
      set({ villageConfig: null });
    }
  },

  checkSystemStatus: async () => {
    const { isRealApi } = useDataSourceStore.getState();

    if (!isRealApi) {
      set({ systemStatus: { ...MOCK_SYSTEM_STATUS, lastSync: new Date().toISOString() } });
      return;
    }

    try {
      const response = await datacatchApi.getSystemStatus();
      set({ systemStatus: response.data.data ?? null });
    } catch {
      set({
        systemStatus: {
          database: 'error',
          network: 'error',
          printer: 'unavailable',
          lastSync: new Date().toISOString(),
        },
      });
    }
  },

  loadSummary: async (societe) => {
    const { isRealApi } = useDataSourceStore.getState();

    if (!isRealApi) {
      set({ summary: MOCK_SUMMARY });
      return;
    }

    try {
      const response = await datacatchApi.getSummary(societe);
      set({ summary: response.data.data ?? null });
    } catch {
      set({ summary: null });
    }
  },

  reset: () => set({ ...initialState }),
}));
