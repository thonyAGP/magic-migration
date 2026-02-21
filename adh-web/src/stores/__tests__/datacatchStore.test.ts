// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useDataCatchStore } from '../datacatchStore';

vi.mock('@/services/api/endpoints-lot5', () => ({
  datacatchApi: {
    searchCustomer: vi.fn(),
    createSession: vi.fn(),
    getSession: vi.fn(),
    savePersonalInfo: vi.fn(),
    saveAddress: vi.fn(),
    savePreferences: vi.fn(),
    completeSession: vi.fn(),
    cancelSession: vi.fn(),
    getSummary: vi.fn(),
    getGuest: vi.fn(),
    acceptCheckout: vi.fn(),
    declineCheckout: vi.fn(),
    cancelPass: vi.fn(),
    getVillageConfig: vi.fn(),
    getSystemStatus: vi.fn(),
  },
}));

vi.mock('@/stores/dataSourceStore', () => ({
  useDataSourceStore: {
    getState: vi.fn(() => ({ isRealApi: true })),
  },
}));

import { datacatchApi } from '@/services/api/endpoints-lot5';
import { useDataSourceStore } from '@/stores/dataSourceStore';

const mockSearchResults = [
  { customerId: 1, nom: 'Dupont', prenom: 'Jean', email: 'jean@test.com', telephone: '+33601020304', scoreMatch: 95 },
  { customerId: 2, nom: 'Martin', prenom: 'Marie', email: 'marie@test.com', telephone: '+33601020305', scoreMatch: 88 },
];

const mockSession = {
  sessionId: 'sess-001',
  societe: 'ADH',
  operateur: 'USR001',
  customerId: 1,
  isNewCustomer: false,
  step: 'personal' as const,
  personalInfo: { nom: 'Dupont', prenom: 'Jean', email: 'jean@test.com', telephone: '+33601020304' },
  address: null,
  preferences: null,
  statut: 'en_cours' as const,
  dateCreation: '2026-02-10T09:00:00Z',
};

const mockPersonalInfo = {
  nom: 'Dupont',
  prenom: 'Jean',
  email: 'jean@test.com',
  telephone: '+33601020304',
};

const mockAddress = {
  rue: '1 rue de la Paix',
  codePostal: '75001',
  ville: 'Paris',
  pays: 'France',
};

const mockPreferences = {
  newsletter: true,
  langue: 'fr',
  sms: false,
};

const mockSummary = {
  totalSessions: 50,
  completedToday: 3,
};

describe('useDataCatchStore', () => {
  beforeEach(() => {
    useDataCatchStore.setState({
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
    });
    vi.clearAllMocks();
    vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as never);
  });

  describe('initial state', () => {
    it('should have default values', () => {
      const state = useDataCatchStore.getState();
      expect(state.currentSession).toBeNull();
      expect(state.searchResults).toEqual([]);
      expect(state.summary).toBeNull();
      expect(state.currentStep).toBe('welcome');
      expect(state.personalInfo).toBeNull();
      expect(state.address).toBeNull();
      expect(state.preferences).toBeNull();
      expect(state.isSearching).toBe(false);
      expect(state.isSaving).toBe(false);
      expect(state.isCompleting).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('searchCustomer', () => {
    it('should set search results on success', async () => {
      vi.mocked(datacatchApi.searchCustomer).mockResolvedValue({
        data: { data: mockSearchResults },
      } as never);

      await useDataCatchStore.getState().searchCustomer('ADH', 'Dupont');

      expect(useDataCatchStore.getState().searchResults).toEqual(mockSearchResults);
      expect(useDataCatchStore.getState().isSearching).toBe(false);
    });

    it('should set error on failure', async () => {
      vi.mocked(datacatchApi.searchCustomer).mockRejectedValue(new Error('Search error'));

      await useDataCatchStore.getState().searchCustomer('ADH', 'test');

      expect(useDataCatchStore.getState().searchResults).toEqual([]);
      expect(useDataCatchStore.getState().error).toBe('Search error');
    });

    it('should handle non-Error exceptions', async () => {
      vi.mocked(datacatchApi.searchCustomer).mockRejectedValue('unknown');

      await useDataCatchStore.getState().searchCustomer('ADH');

      expect(useDataCatchStore.getState().error).toBe('Erreur recherche client');
    });

    it('should handle null data', async () => {
      vi.mocked(datacatchApi.searchCustomer).mockResolvedValue({
        data: { data: null },
      } as never);

      await useDataCatchStore.getState().searchCustomer('ADH', 'test');
      expect(useDataCatchStore.getState().searchResults).toEqual([]);
    });
  });

  describe('createSession', () => {
    it('should return sessionId on success', async () => {
      vi.mocked(datacatchApi.createSession).mockResolvedValue({
        data: { data: { sessionId: 'sess-002' } },
      } as never);

      const result = await useDataCatchStore.getState().createSession('ADH', 'user1', 1, true);

      expect(result).toEqual({ success: true, sessionId: 'sess-002' });
      expect(useDataCatchStore.getState().isSaving).toBe(false);
    });

    it('should return error on failure', async () => {
      vi.mocked(datacatchApi.createSession).mockRejectedValue(new Error('Session limit'));

      const result = await useDataCatchStore.getState().createSession('ADH', 'user1');

      expect(result).toEqual({ success: false, error: 'Session limit' });
      expect(useDataCatchStore.getState().error).toBe('Session limit');
    });
  });

  describe('loadSession', () => {
    it('should load session and update wizard state', async () => {
      vi.mocked(datacatchApi.getSession).mockResolvedValue({
        data: { data: mockSession },
      } as never);

      await useDataCatchStore.getState().loadSession('sess-001');

      const state = useDataCatchStore.getState();
      expect(state.currentSession).toEqual(mockSession);
      expect(state.currentStep).toBe('personal');
      expect(state.personalInfo).toEqual(mockSession.personalInfo);
    });

    it('should set error on failure', async () => {
      vi.mocked(datacatchApi.getSession).mockRejectedValue(new Error('Session not found'));

      await useDataCatchStore.getState().loadSession('bad-id');

      expect(useDataCatchStore.getState().currentSession).toBeNull();
      expect(useDataCatchStore.getState().error).toBe('Session not found');
    });

    it('should handle null session data', async () => {
      vi.mocked(datacatchApi.getSession).mockResolvedValue({
        data: { data: null },
      } as never);

      await useDataCatchStore.getState().loadSession('null-sess');

      expect(useDataCatchStore.getState().currentSession).toBeNull();
      expect(useDataCatchStore.getState().currentStep).toBe('welcome');
    });
  });

  describe('savePersonalInfo', () => {
    it('should save and advance to address step', async () => {
      vi.mocked(datacatchApi.savePersonalInfo).mockResolvedValue({
        data: { data: undefined },
      } as never);

      const result = await useDataCatchStore.getState().savePersonalInfo('sess-001', mockPersonalInfo as never);

      expect(result).toEqual({ success: true });
      expect(useDataCatchStore.getState().personalInfo).toEqual(mockPersonalInfo);
      expect(useDataCatchStore.getState().currentStep).toBe('address');
    });

    it('should return error on failure', async () => {
      vi.mocked(datacatchApi.savePersonalInfo).mockRejectedValue(new Error('Invalid email'));

      const result = await useDataCatchStore.getState().savePersonalInfo('sess-001', mockPersonalInfo as never);

      expect(result).toEqual({ success: false, error: 'Invalid email' });
    });
  });

  describe('saveAddress', () => {
    it('should save and advance to preferences step', async () => {
      vi.mocked(datacatchApi.saveAddress).mockResolvedValue({
        data: { data: undefined },
      } as never);

      const result = await useDataCatchStore.getState().saveAddress('sess-001', mockAddress as never);

      expect(result).toEqual({ success: true });
      expect(useDataCatchStore.getState().address).toEqual(mockAddress);
      expect(useDataCatchStore.getState().currentStep).toBe('preferences');
    });

    it('should return error on failure', async () => {
      vi.mocked(datacatchApi.saveAddress).mockRejectedValue(new Error('Address invalid'));

      const result = await useDataCatchStore.getState().saveAddress('sess-001', mockAddress as never);

      expect(result).toEqual({ success: false, error: 'Address invalid' });
    });
  });

  describe('savePreferences', () => {
    it('should save and advance to review step', async () => {
      vi.mocked(datacatchApi.savePreferences).mockResolvedValue({
        data: { data: undefined },
      } as never);

      const result = await useDataCatchStore.getState().savePreferences('sess-001', mockPreferences as never);

      expect(result).toEqual({ success: true });
      expect(useDataCatchStore.getState().preferences).toEqual(mockPreferences);
      expect(useDataCatchStore.getState().currentStep).toBe('review');
    });

    it('should return error on failure', async () => {
      vi.mocked(datacatchApi.savePreferences).mockRejectedValue(new Error('Prefs error'));

      const result = await useDataCatchStore.getState().savePreferences('sess-001', mockPreferences as never);

      expect(result).toEqual({ success: false, error: 'Prefs error' });
    });
  });

  describe('completeSession', () => {
    it('should complete and set step to complete', async () => {
      vi.mocked(datacatchApi.completeSession).mockResolvedValue({
        data: { data: undefined },
      } as never);

      const result = await useDataCatchStore.getState().completeSession('sess-001');

      expect(result).toEqual({ success: true });
      expect(useDataCatchStore.getState().currentStep).toBe('complete');
      expect(useDataCatchStore.getState().isCompleting).toBe(false);
    });

    it('should return error on failure', async () => {
      vi.mocked(datacatchApi.completeSession).mockRejectedValue(new Error('Incomplete data'));

      const result = await useDataCatchStore.getState().completeSession('sess-001');

      expect(result).toEqual({ success: false, error: 'Incomplete data' });
      expect(useDataCatchStore.getState().isCompleting).toBe(false);
    });
  });

  describe('cancelSession', () => {
    it('should cancel and reset to welcome', async () => {
      vi.mocked(datacatchApi.cancelSession).mockResolvedValue({
        data: { data: undefined },
      } as never);

      useDataCatchStore.setState({ currentStep: 'address', currentSession: mockSession as never });

      const result = await useDataCatchStore.getState().cancelSession('sess-001');

      expect(result).toEqual({ success: true });
      expect(useDataCatchStore.getState().currentStep).toBe('welcome');
      expect(useDataCatchStore.getState().currentSession).toBeNull();
    });

    it('should return error on failure', async () => {
      vi.mocked(datacatchApi.cancelSession).mockRejectedValue(new Error('Cancel failed'));

      const result = await useDataCatchStore.getState().cancelSession('sess-001');

      expect(result).toEqual({ success: false, error: 'Cancel failed' });
    });
  });

  describe('setStep', () => {
    it('should change the current step', () => {
      useDataCatchStore.getState().setStep('preferences');
      expect(useDataCatchStore.getState().currentStep).toBe('preferences');
    });
  });

  describe('loadSummary', () => {
    it('should load summary on success', async () => {
      vi.mocked(datacatchApi.getSummary).mockResolvedValue({
        data: { data: mockSummary },
      } as never);

      await useDataCatchStore.getState().loadSummary('ADH');
      expect(useDataCatchStore.getState().summary).toEqual(mockSummary);
    });

    it('should set null on failure', async () => {
      vi.mocked(datacatchApi.getSummary).mockRejectedValue(new Error('fail'));

      await useDataCatchStore.getState().loadSummary('ADH');
      expect(useDataCatchStore.getState().summary).toBeNull();
    });
  });

  describe('reset', () => {
    it('should reset all state', () => {
      useDataCatchStore.setState({
        currentSession: mockSession as never,
        searchResults: mockSearchResults as never,
        currentStep: 'review',
        personalInfo: mockPersonalInfo as never,
        address: mockAddress as never,
        preferences: mockPreferences as never,
        error: 'error',
      });

      useDataCatchStore.getState().reset();

      const state = useDataCatchStore.getState();
      expect(state.currentSession).toBeNull();
      expect(state.searchResults).toEqual([]);
      expect(state.currentStep).toBe('welcome');
      expect(state.personalInfo).toBeNull();
      expect(state.address).toBeNull();
      expect(state.preferences).toBeNull();
      expect(state.error).toBeNull();
    });
  });
});