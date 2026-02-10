import { create } from 'zustand';
import type {
  DataCatchStep,
  CustomerSearchResult,
  CustomerPersonalInfo,
  CustomerAddress,
  CustomerPreferences,
  DataCatchSession,
  DataCatchSummary,
} from '@/types/datacatch';
import { datacatchApi } from '@/services/api/endpoints-lot5';
import { useDataSourceStore } from './dataSourceStore';

interface DataCatchState {
  currentSession: DataCatchSession | null;
  searchResults: CustomerSearchResult[];
  summary: DataCatchSummary | null;
  currentStep: DataCatchStep;
  personalInfo: CustomerPersonalInfo | null;
  address: CustomerAddress | null;
  preferences: CustomerPreferences | null;
  isSearching: boolean;
  isSaving: boolean;
  isCompleting: boolean;
  error: string | null;
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

const initialState: DataCatchState = {
  currentSession: null,
  searchResults: [],
  summary: null,
  currentStep: 'welcome',
  personalInfo: null,
  address: null,
  preferences: null,
  isSearching: false,
  isSaving: false,
  isCompleting: false,
  error: null,
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
