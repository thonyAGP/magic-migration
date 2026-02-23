import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useProgramDispatchStore } from '@/stores/programDispatchStore';
import { apiClient } from '@/services/api/apiClient';
import type { ApiResponse } from '@/services/api/apiClient';
import type { ProgramDispatchRoute, LastClickedResponse } from '@/types/programDispatch';
import { useDataSourceStore } from '@/stores/dataSourceStore';

vi.mock('@/services/api/apiClient', () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

const MOCK_SUCCESS_ROUTE: ApiResponse<ProgramDispatchRoute> = {
  success: true,
  data: {
    controlId: 'BTN_CHANGE',
    success: true,
    targetProgram: 'ADH-25',
  },
};

const MOCK_FAILED_ROUTE: ApiResponse<ProgramDispatchRoute> = {
  success: true,
  data: {
    controlId: 'BTN_INVALID',
    success: false,
    error: 'Programme cible non trouvé',
  },
};

const MOCK_LAST_CLICKED: ApiResponse<LastClickedResponse> = {
  success: true,
  data: {
    controlId: 'BTN_TELEPHONE',
  },
};

describe('programDispatchStore', () => {
  beforeEach(() => {
    useProgramDispatchStore.getState().reset();
    useProgramDispatchStore.getState().clearDispatch();
    useDataSourceStore.setState({ isRealApi: false });
    vi.clearAllMocks();
  });

  describe('dispatchToProgram', () => {
    it('should dispatch to valid program in mock mode', async () => {
      const { dispatchToProgram } = useProgramDispatchStore.getState();

      await dispatchToProgram('BTN_CHANGE');

      const state = useProgramDispatchStore.getState();
      expect(state.lastClickedControl).toBe('BTN_CHANGE');
      expect(state.isDispatching).toBe(false);
      expect(state.error).toBeNull();
      expect(apiClient.post).not.toHaveBeenCalled();
    });

    it('should set error for invalid control in mock mode', async () => {
      const { dispatchToProgram } = useProgramDispatchStore.getState();

      await dispatchToProgram('BTN_INVALID');

      const state = useProgramDispatchStore.getState();
      expect(state.lastClickedControl).toBe('BTN_INVALID');
      expect(state.isDispatching).toBe(false);
      expect(state.error).toContain('Programme cible non trouvé');
    });

    it('should dispatch to valid program in real API mode', async () => {
      useDataSourceStore.setState({ isRealApi: true });
      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: MOCK_SUCCESS_ROUTE });

      const { dispatchToProgram } = useProgramDispatchStore.getState();

      await dispatchToProgram('BTN_CHANGE');

      expect(apiClient.post).toHaveBeenCalledWith(
        '/api/programDispatch/route',
        null,
        { params: { controlId: 'BTN_CHANGE' } }
      );

      const state = useProgramDispatchStore.getState();
      expect(state.lastClickedControl).toBe('BTN_CHANGE');
      expect(state.isDispatching).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should set error when API returns failure in real API mode', async () => {
      useDataSourceStore.setState({ isRealApi: true });
      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: MOCK_FAILED_ROUTE });

      const { dispatchToProgram } = useProgramDispatchStore.getState();

      await dispatchToProgram('BTN_INVALID');

      const state = useProgramDispatchStore.getState();
      expect(state.isDispatching).toBe(false);
      expect(state.error).toBe('Programme cible non trouvé');
    });

    it('should handle API error in real API mode', async () => {
      useDataSourceStore.setState({ isRealApi: true });
      vi.mocked(apiClient.post).mockRejectedValueOnce(new Error('Network error'));

      const { dispatchToProgram } = useProgramDispatchStore.getState();

      await dispatchToProgram('BTN_CHANGE');

      const state = useProgramDispatchStore.getState();
      expect(state.isDispatching).toBe(false);
      expect(state.error).toBe('Network error');
    });

    it('should handle unknown error type in real API mode', async () => {
      useDataSourceStore.setState({ isRealApi: true });
      vi.mocked(apiClient.post).mockRejectedValueOnce('string error');

      const { dispatchToProgram } = useProgramDispatchStore.getState();

      await dispatchToProgram('BTN_CHANGE');

      const state = useProgramDispatchStore.getState();
      expect(state.isDispatching).toBe(false);
      expect(state.error).toBe('Erreur dispatch programme');
    });

    it('should set isDispatching to true during dispatch', async () => {
      useDataSourceStore.setState({ isRealApi: true });
      let resolvePromise: ((value: unknown) => void) | undefined;
      const promise = new Promise((resolve) => { resolvePromise = resolve; });
      vi.mocked(apiClient.post).mockReturnValueOnce(promise);

      const { dispatchToProgram } = useProgramDispatchStore.getState();
      const dispatchPromise = dispatchToProgram('BTN_CHANGE');

      expect(useProgramDispatchStore.getState().isDispatching).toBe(true);

      resolvePromise?.({ data: MOCK_SUCCESS_ROUTE });
      await dispatchPromise;

      expect(useProgramDispatchStore.getState().isDispatching).toBe(false);
    });

    it('should route to all 15 valid controls in mock mode', async () => {
      const validControls = [
        'BTN_CHANGE', 'BTN_DEPOT', 'BTN_GARANTIE', 'BTN_GRATUITES',
        'BTN_VERSEMENT', 'BTN_TELEPHONE', 'BTN_MENU_COMPTE', 'BTN_EXTRAIT',
        'BTN_CMP', 'BTN_BAR_LIMIT', 'BTN_GM_MENU', 'BTN_CAISSE_GM',
        'BTN_FORFAIT_TAI', 'BTN_SOLDE', 'BTN_IMPRESSION', 'BTN_VENTE',
      ];

      const { dispatchToProgram } = useProgramDispatchStore.getState();

      for (const controlId of validControls) {
        await dispatchToProgram(controlId);
        const state = useProgramDispatchStore.getState();
        expect(state.error).toBeNull();
      }
    });
  });

  describe('getLastClickedControl', () => {
    it('should return last clicked control in mock mode', async () => {
      const { dispatchToProgram, getLastClickedControl } = useProgramDispatchStore.getState();

      await dispatchToProgram('BTN_TELEPHONE');
      const lastClicked = await getLastClickedControl();

      expect(lastClicked).toBe('BTN_TELEPHONE');
    });

    it('should return last dispatched control via module-level mock state', async () => {
      // In mock mode, getLastClickedControl returns the module-level MOCK_LAST_CLICKED
      // which persists across store resets (reset() only resets Zustand state, not module vars).
      // After any mock-mode dispatch, getLastClickedControl will return that controlId.
      const { dispatchToProgram, getLastClickedControl } = useProgramDispatchStore.getState();

      await dispatchToProgram('BTN_CHANGE');
      const lastClicked = await getLastClickedControl();
      expect(lastClicked).toBe('BTN_CHANGE');
    });

    it('should retrieve last clicked control from API in real mode', async () => {
      useDataSourceStore.setState({ isRealApi: true });
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: MOCK_LAST_CLICKED });

      const { getLastClickedControl } = useProgramDispatchStore.getState();
      const lastClicked = await getLastClickedControl();

      expect(apiClient.get).toHaveBeenCalledWith('/api/programDispatch/lastClicked');
      expect(lastClicked).toBe('BTN_TELEPHONE');
    });

    it('should return null when API returns null control', async () => {
      useDataSourceStore.setState({ isRealApi: true });
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: { success: true, data: { controlId: null } },
      });

      const { getLastClickedControl } = useProgramDispatchStore.getState();
      const lastClicked = await getLastClickedControl();

      expect(lastClicked).toBeNull();
    });

    it('should handle API error when retrieving last clicked', async () => {
      useDataSourceStore.setState({ isRealApi: true });
      vi.mocked(apiClient.get).mockRejectedValueOnce(new Error('API error'));

      const { getLastClickedControl } = useProgramDispatchStore.getState();
      const lastClicked = await getLastClickedControl();

      expect(lastClicked).toBeNull();
      expect(useProgramDispatchStore.getState().error).toBe('API error');
    });

    it('should handle unknown error type when retrieving last clicked', async () => {
      useDataSourceStore.setState({ isRealApi: true });
      vi.mocked(apiClient.get).mockRejectedValueOnce('string error');

      const { getLastClickedControl } = useProgramDispatchStore.getState();
      const lastClicked = await getLastClickedControl();

      expect(lastClicked).toBeNull();
      expect(useProgramDispatchStore.getState().error).toBe('Erreur récupération dernier contrôle');
    });
  });

  describe('clearDispatch', () => {
    it('should clear last clicked control and error', async () => {
      const { dispatchToProgram, clearDispatch } = useProgramDispatchStore.getState();

      await dispatchToProgram('BTN_INVALID');
      expect(useProgramDispatchStore.getState().lastClickedControl).toBe('BTN_INVALID');
      expect(useProgramDispatchStore.getState().error).not.toBeNull();

      clearDispatch();

      const state = useProgramDispatchStore.getState();
      expect(state.lastClickedControl).toBeNull();
      expect(state.error).toBeNull();
    });
  });

  describe('reset', () => {
    it('should reset store to initial state', async () => {
      const { dispatchToProgram, reset } = useProgramDispatchStore.getState();

      await dispatchToProgram('BTN_CHANGE');

      reset();

      const state = useProgramDispatchStore.getState();
      expect(state.lastClickedControl).toBeNull();
      expect(state.isDispatching).toBe(false);
      expect(state.error).toBeNull();
    });
  });
});