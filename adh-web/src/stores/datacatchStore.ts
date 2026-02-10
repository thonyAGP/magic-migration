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
    set({ isSearching: true, error: null });
    try {
      const response = await datacatchApi.searchCustomer({
        societe,
        nom,
        prenom,
        email,
        telephone,
      });
      set({ searchResults: response.data.data ?? [] });
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : 'Erreur recherche client';
      set({ searchResults: [], error: message });
    } finally {
      set({ isSearching: false });
    }
  },

  createSession: async (societe, operateur, customerId, isNewCustomer = true) => {
    set({ isSaving: true, error: null });
    try {
      const response = await datacatchApi.createSession({
        societe,
        customerId,
        isNewCustomer,
        operateur,
      });
      const sessionId = response.data.data?.sessionId;
      return { success: true, sessionId };
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : 'Erreur creation session';
      set({ error: message });
      return { success: false, error: message };
    } finally {
      set({ isSaving: false });
    }
  },

  loadSession: async (sessionId) => {
    set({ isSaving: true, error: null });
    try {
      const response = await datacatchApi.getSession(sessionId);
      const session = response.data.data;
      set({
        currentSession: session ?? null,
        currentStep: session?.step ?? 'welcome',
        personalInfo: session?.personalInfo ?? null,
        address: session?.address ?? null,
        preferences: session?.preferences ?? null,
      });
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : 'Erreur chargement session';
      set({ currentSession: null, error: message });
    } finally {
      set({ isSaving: false });
    }
  },

  savePersonalInfo: async (sessionId, data) => {
    set({ isSaving: true, error: null });
    try {
      await datacatchApi.savePersonalInfo(sessionId, data);
      set({ personalInfo: data, currentStep: 'address' });
      return { success: true };
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : 'Erreur sauvegarde info personnelle';
      set({ error: message });
      return { success: false, error: message };
    } finally {
      set({ isSaving: false });
    }
  },

  saveAddress: async (sessionId, data) => {
    set({ isSaving: true, error: null });
    try {
      await datacatchApi.saveAddress(sessionId, data);
      set({ address: data, currentStep: 'preferences' });
      return { success: true };
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : 'Erreur sauvegarde adresse';
      set({ error: message });
      return { success: false, error: message };
    } finally {
      set({ isSaving: false });
    }
  },

  savePreferences: async (sessionId, data) => {
    set({ isSaving: true, error: null });
    try {
      await datacatchApi.savePreferences(sessionId, data);
      set({ preferences: data, currentStep: 'review' });
      return { success: true };
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : 'Erreur sauvegarde preferences';
      set({ error: message });
      return { success: false, error: message };
    } finally {
      set({ isSaving: false });
    }
  },

  completeSession: async (sessionId) => {
    set({ isCompleting: true, error: null });
    try {
      await datacatchApi.completeSession(sessionId);
      set({ currentStep: 'complete' });
      return { success: true };
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : 'Erreur finalisation session';
      set({ error: message });
      return { success: false, error: message };
    } finally {
      set({ isCompleting: false });
    }
  },

  cancelSession: async (sessionId) => {
    set({ isSaving: true, error: null });
    try {
      await datacatchApi.cancelSession(sessionId);
      set({ currentStep: 'welcome', currentSession: null });
      return { success: true };
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : 'Erreur annulation session';
      set({ error: message });
      return { success: false, error: message };
    } finally {
      set({ isSaving: false });
    }
  },

  setStep: (step) => set({ currentStep: step }),

  loadSummary: async (societe) => {
    try {
      const response = await datacatchApi.getSummary(societe);
      set({ summary: response.data.data ?? null });
    } catch {
      set({ summary: null });
    }
  },

  reset: () => set({ ...initialState }),
}));
