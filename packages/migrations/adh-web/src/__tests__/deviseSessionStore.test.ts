import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useDeviseSessionStore } from '@/stores/deviseSessionStore';
import { apiClient } from '@/services/api/apiClient';
import { useDataSourceStore } from '@/stores/dataSourceStore';

vi.mock('@/services/api/apiClient', () => ({
  apiClient: {
    put: vi.fn(),
  },
}));

vi.mock('@/stores/dataSourceStore', () => ({
  useDataSourceStore: {
    getState: vi.fn(),
  },
}));

const MOCK_UPDATE_REQUEST = {
  codeDevise: 'USD',
  modePaiement: 'CB',
  quand: 'AVANT',
  type: 'ACHAT',
  quantite: 100,
  cumulOpChange: false,
};

describe('deviseSessionStore', () => {
  beforeEach(() => {
    useDeviseSessionStore.getState().reset();
    vi.clearAllMocks();
  });

  describe('updateDeviseSession', () => {
    it('should update devise session successfully with real API', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as ReturnType<typeof useDataSourceStore.getState>);
      vi.mocked(apiClient.put).mockResolvedValue({ data: undefined, success: true });

      const { isLoading: loadingBefore, error: errorBefore } = useDeviseSessionStore.getState();
      expect(loadingBefore).toBe(false);
      expect(errorBefore).toBe(null);

      const promise = useDeviseSessionStore.getState().updateDeviseSession(
        MOCK_UPDATE_REQUEST.codeDevise,
        MOCK_UPDATE_REQUEST.modePaiement,
        MOCK_UPDATE_REQUEST.quand,
        MOCK_UPDATE_REQUEST.type,
        MOCK_UPDATE_REQUEST.quantite,
        MOCK_UPDATE_REQUEST.cumulOpChange,
      );

      expect(useDeviseSessionStore.getState().isLoading).toBe(true);

      await promise;

      expect(apiClient.put).toHaveBeenCalledWith('/api/caisse/devise-session', MOCK_UPDATE_REQUEST);
      expect(useDeviseSessionStore.getState().isLoading).toBe(false);
      expect(useDeviseSessionStore.getState().error).toBe(null);
    });

    it('should skip API call when using mock data', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: false } as ReturnType<typeof useDataSourceStore.getState>);

      await useDeviseSessionStore.getState().updateDeviseSession(
        MOCK_UPDATE_REQUEST.codeDevise,
        MOCK_UPDATE_REQUEST.modePaiement,
        MOCK_UPDATE_REQUEST.quand,
        MOCK_UPDATE_REQUEST.type,
        MOCK_UPDATE_REQUEST.quantite,
        MOCK_UPDATE_REQUEST.cumulOpChange,
      );

      expect(apiClient.put).not.toHaveBeenCalled();
      expect(useDeviseSessionStore.getState().isLoading).toBe(false);
      expect(useDeviseSessionStore.getState().error).toBe(null);
    });

    it('should handle API error correctly', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as ReturnType<typeof useDataSourceStore.getState>);
      const errorMessage = 'Network error';
      vi.mocked(apiClient.put).mockRejectedValue(new Error(errorMessage));

      await useDeviseSessionStore.getState().updateDeviseSession(
        MOCK_UPDATE_REQUEST.codeDevise,
        MOCK_UPDATE_REQUEST.modePaiement,
        MOCK_UPDATE_REQUEST.quand,
        MOCK_UPDATE_REQUEST.type,
        MOCK_UPDATE_REQUEST.quantite,
        MOCK_UPDATE_REQUEST.cumulOpChange,
      );

      expect(useDeviseSessionStore.getState().isLoading).toBe(false);
      expect(useDeviseSessionStore.getState().error).toBe(errorMessage);
    });

    it('should handle non-Error exception', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as ReturnType<typeof useDataSourceStore.getState>);
      vi.mocked(apiClient.put).mockRejectedValue('Unknown error');

      await useDeviseSessionStore.getState().updateDeviseSession(
        MOCK_UPDATE_REQUEST.codeDevise,
        MOCK_UPDATE_REQUEST.modePaiement,
        MOCK_UPDATE_REQUEST.quand,
        MOCK_UPDATE_REQUEST.type,
        MOCK_UPDATE_REQUEST.quantite,
        MOCK_UPDATE_REQUEST.cumulOpChange,
      );

      expect(useDeviseSessionStore.getState().isLoading).toBe(false);
      expect(useDeviseSessionStore.getState().error).toBe('Erreur mise à jour session devise');
    });

    it('should send correct payload with cumulOpChange true', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as ReturnType<typeof useDataSourceStore.getState>);
      vi.mocked(apiClient.put).mockResolvedValue({ data: undefined, success: true });

      await useDeviseSessionStore.getState().updateDeviseSession(
        'EUR',
        'ESP',
        'APRES',
        'VENTE',
        250,
        true,
      );

      expect(apiClient.put).toHaveBeenCalledWith('/api/caisse/devise-session', {
        codeDevise: 'EUR',
        modePaiement: 'ESP',
        quand: 'APRES',
        type: 'VENTE',
        quantite: 250,
        cumulOpChange: true,
      });
    });

    it('should send correct payload with cumulOpChange false (overwrite mode)', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as ReturnType<typeof useDataSourceStore.getState>);
      vi.mocked(apiClient.put).mockResolvedValue({ data: undefined, success: true });

      await useDeviseSessionStore.getState().updateDeviseSession(
        'GBP',
        'CHQ',
        'AVANT',
        'ACHAT',
        75,
        false,
      );

      expect(apiClient.put).toHaveBeenCalledWith('/api/caisse/devise-session', {
        codeDevise: 'GBP',
        modePaiement: 'CHQ',
        quand: 'AVANT',
        type: 'ACHAT',
        quantite: 75,
        cumulOpChange: false,
      });
    });
  });

  describe('reset', () => {
    it('should reset state to initial values', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as ReturnType<typeof useDataSourceStore.getState>);
      vi.mocked(apiClient.put).mockRejectedValue(new Error('Test error'));

      await useDeviseSessionStore.getState().updateDeviseSession(
        MOCK_UPDATE_REQUEST.codeDevise,
        MOCK_UPDATE_REQUEST.modePaiement,
        MOCK_UPDATE_REQUEST.quand,
        MOCK_UPDATE_REQUEST.type,
        MOCK_UPDATE_REQUEST.quantite,
        MOCK_UPDATE_REQUEST.cumulOpChange,
      );

      expect(useDeviseSessionStore.getState().error).not.toBe(null);

      useDeviseSessionStore.getState().reset();

      expect(useDeviseSessionStore.getState().isLoading).toBe(false);
      expect(useDeviseSessionStore.getState().error).toBe(null);
    });
  });
});