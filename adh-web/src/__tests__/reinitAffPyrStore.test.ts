import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useReinitAffPyrStore } from '@/stores/reinitAffPyrStore';
import { useDataSourceStore } from '@/stores/dataSourceStore';
import { apiClient } from '@/services/api/apiClient';
import type { ApiResponse } from '@/services/api/apiClient';
import type { ReinitAffectationResponse, AffectationStatusResponse } from '@/types/reinitAffPyr';

vi.mock('@/services/api/apiClient', () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

const MOCK_RESET_RESPONSE: ApiResponse<ReinitAffectationResponse> = {
  success: true,
  data: { affectedCount: 2 },
};

const MOCK_STATUS_RESPONSE: ApiResponse<AffectationStatusResponse> = {
  success: true,
  data: { hasActiveAffectations: true, count: 3 },
};

const MOCK_STATUS_EMPTY_RESPONSE: ApiResponse<AffectationStatusResponse> = {
  success: true,
  data: { hasActiveAffectations: false, count: 0 },
};

describe('reinitAffPyrStore', () => {
  beforeEach(() => {
    useReinitAffPyrStore.getState().reset();
    useDataSourceStore.setState({ isRealApi: false });
    vi.clearAllMocks();
  });

  describe('reinitAffectationPyr - Mock Mode', () => {
    it('should reset affectations for societe and compte', async () => {
      const count = await useReinitAffPyrStore.getState().reinitAffectationPyr({
        societe: 'SOC1',
        compte: 1001,
      });

      const state = useReinitAffPyrStore.getState();
      expect(count).toBe(2);
      expect(state.lastResetCount).toBe(2);
      expect(state.isProcessing).toBe(false);
      expect(state.error).toBe(null);
    });

    it('should reset affectations filtered by chambre', async () => {
      const count = await useReinitAffPyrStore.getState().reinitAffectationPyr({
        societe: 'SOC1',
        compte: 1001,
        chambre: '101',
      });

      expect(count).toBe(1);
      expect(useReinitAffPyrStore.getState().lastResetCount).toBe(1);
    });

    it('should return 0 when no records match filters', async () => {
      const count = await useReinitAffPyrStore.getState().reinitAffectationPyr({
        societe: 'SOC999',
        compte: 9999,
      });

      expect(count).toBe(0);
      expect(useReinitAffPyrStore.getState().lastResetCount).toBe(0);
    });

    it('should include empty chambre records', async () => {
      const count = await useReinitAffPyrStore.getState().reinitAffectationPyr({
        societe: 'SOC1',
        compte: 1002,
      });

      expect(count).toBe(2);
    });

    it('should set isProcessing to true during operation', async () => {
      const promise = useReinitAffPyrStore.getState().reinitAffectationPyr({
        societe: 'SOC1',
        compte: 1001,
      });

      // Mock mode uses setTimeout, so isProcessing should be true before await
      expect(useReinitAffPyrStore.getState().isProcessing).toBe(true);

      await promise;

      expect(useReinitAffPyrStore.getState().isProcessing).toBe(false);
    });
  });

  describe('reinitAffectationPyr - Real API Mode', () => {
    beforeEach(() => {
      useDataSourceStore.setState({ isRealApi: true });
    });

    it('should call API with correct params and return count', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ data: MOCK_RESET_RESPONSE });

      const count = await useReinitAffPyrStore.getState().reinitAffectationPyr({
        societe: 'SOC1',
        compte: 1001,
      });

      const state = useReinitAffPyrStore.getState();
      expect(apiClient.post).toHaveBeenCalledWith(
        '/api/reinitAffPyr/reset?societe=SOC1&compte=1001',
      );
      expect(count).toBe(2);
      expect(state.lastResetCount).toBe(2);
      expect(state.isProcessing).toBe(false);
    });

    it('should include chambre in query params when provided', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ data: MOCK_RESET_RESPONSE });
      
      await useReinitAffPyrStore.getState().reinitAffectationPyr({
        societe: 'SOC1',
        compte: 1001,
        chambre: '101',
      });

      expect(apiClient.post).toHaveBeenCalledWith(
        '/api/reinitAffPyr/reset?societe=SOC1&compte=1001&chambre=101',
      );
    });

    it('should handle API error and set error state', async () => {
      const apiError = new Error('API connection failed');
      vi.mocked(apiClient.post).mockRejectedValue(apiError);

      await expect(
        useReinitAffPyrStore.getState().reinitAffectationPyr({
          societe: 'SOC1',
          compte: 1001,
        }),
      ).rejects.toThrow('API connection failed');

      const state = useReinitAffPyrStore.getState();
      expect(state.error).toEqual(apiError);
      expect(state.isProcessing).toBe(false);
    });

    it('should handle non-Error exceptions', async () => {
      vi.mocked(apiClient.post).mockRejectedValue('String error');

      await expect(
        useReinitAffPyrStore.getState().reinitAffectationPyr({
          societe: 'SOC1',
          compte: 1001,
        }),
      ).rejects.toThrow('Erreur réinitialisation affectation PYR');

      const state = useReinitAffPyrStore.getState();
      expect(state.error).toBeInstanceOf(Error);
      expect(state.isProcessing).toBe(false);
    });

    it('should handle missing data in response', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({
        data: {
          success: true,
          data: undefined,
        } as unknown as ApiResponse<ReinitAffectationResponse>,
      });
      
      const count = await useReinitAffPyrStore.getState().reinitAffectationPyr({
        societe: 'SOC1',
        compte: 1001,
      });

      expect(count).toBe(0);
      expect(useReinitAffPyrStore.getState().lastResetCount).toBe(0);
    });
  });

  describe('resetAllAffectations - Mock Mode', () => {
    it('should reset all affectations and return total count', async () => {
      const count = await useReinitAffPyrStore.getState().resetAllAffectations();

      const state = useReinitAffPyrStore.getState();
      expect(count).toBe(10);
      expect(state.lastResetCount).toBe(10);
      expect(state.isProcessing).toBe(false);
      expect(state.error).toBe(null);
    });

    it('should set isProcessing during operation', async () => {
      const promise = useReinitAffPyrStore.getState().resetAllAffectations();

      expect(useReinitAffPyrStore.getState().isProcessing).toBe(true);

      await promise;

      expect(useReinitAffPyrStore.getState().isProcessing).toBe(false);
    });
  });

  describe('resetAllAffectations - Real API Mode', () => {
    beforeEach(() => {
      useDataSourceStore.setState({ isRealApi: true });
    });

    it('should call API and return count', async () => {
      const mockResponse: ApiResponse<ReinitAffectationResponse> = {
        success: true,
        data: { affectedCount: 150 },
      };
      vi.mocked(apiClient.post).mockResolvedValue({ data: mockResponse });

      const count = await useReinitAffPyrStore.getState().resetAllAffectations();

      const state = useReinitAffPyrStore.getState();
      expect(apiClient.post).toHaveBeenCalledWith('/api/reinitAffPyr/reset-all');
      expect(count).toBe(150);
      expect(state.lastResetCount).toBe(150);
      expect(state.isProcessing).toBe(false);
    });

    it('should handle API error and set error state', async () => {
      const apiError = new Error('Server error');
      vi.mocked(apiClient.post).mockRejectedValue(apiError);

      await expect(
        useReinitAffPyrStore.getState().resetAllAffectations(),
      ).rejects.toThrow('Server error');

      const state = useReinitAffPyrStore.getState();
      expect(state.error).toEqual(apiError);
      expect(state.isProcessing).toBe(false);
    });

    it('should handle non-Error exceptions', async () => {
      vi.mocked(apiClient.post).mockRejectedValue({ message: 'Object error' });

      await expect(
        useReinitAffPyrStore.getState().resetAllAffectations(),
      ).rejects.toThrow('Erreur réinitialisation globale');

      expect(useReinitAffPyrStore.getState().error).toBeInstanceOf(Error);
    });

    it('should handle missing data in response', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({
        data: {
          success: true,
          data: undefined,
        } as unknown as ApiResponse<ReinitAffectationResponse>,
      });
      
      const count = await useReinitAffPyrStore.getState().resetAllAffectations();

      expect(count).toBe(0);
      expect(useReinitAffPyrStore.getState().lastResetCount).toBe(0);
    });
  });

  describe('getAffectationStatus - Mock Mode', () => {
    it('should return status with active affectations', async () => {
      const status = await useReinitAffPyrStore.getState().getAffectationStatus('SOC1', 1001);

      expect(status.hasActiveAffectations).toBe(true);
      expect(status.count).toBe(2);
    });

    it('should exclude null and empty affectations', async () => {
      const status = await useReinitAffPyrStore.getState().getAffectationStatus('SOC1', 1003);

      expect(status.hasActiveAffectations).toBe(false);
      expect(status.count).toBe(0);
    });

    it('should return false when no records match', async () => {
      const status = await useReinitAffPyrStore.getState().getAffectationStatus('SOC999', 9999);

      expect(status.hasActiveAffectations).toBe(false);
      expect(status.count).toBe(0);
    });

    it('should count records with non-empty affectationPyr', async () => {
      const status = await useReinitAffPyrStore.getState().getAffectationStatus('SOC1', 1004);

      expect(status.hasActiveAffectations).toBe(true);
      expect(status.count).toBe(2);
    });
  });

  describe('getAffectationStatus - Real API Mode', () => {
    beforeEach(() => {
      useDataSourceStore.setState({ isRealApi: true });
    });

    it('should call API with correct params and return status', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: MOCK_STATUS_RESPONSE });

      const status = await useReinitAffPyrStore.getState().getAffectationStatus('SOC1', 1001);

      expect(apiClient.get).toHaveBeenCalledWith(
        '/api/reinitAffPyr/status?societe=SOC1&compte=1001',
      );
      expect(status.hasActiveAffectations).toBe(true);
      expect(status.count).toBe(3);
    });

    it('should handle empty status response', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: MOCK_STATUS_EMPTY_RESPONSE });
      
      const status = await useReinitAffPyrStore.getState().getAffectationStatus('SOC1', 1001);

      expect(status.hasActiveAffectations).toBe(false);
      expect(status.count).toBe(0);
    });

    it('should handle API error and set error state', async () => {
      const apiError = new Error('Connection timeout');
      vi.mocked(apiClient.get).mockRejectedValue(apiError);

      await expect(
        useReinitAffPyrStore.getState().getAffectationStatus('SOC1', 1001),
      ).rejects.toThrow('Connection timeout');

      expect(useReinitAffPyrStore.getState().error).toEqual(apiError);
    });

    it('should handle non-Error exceptions', async () => {
      vi.mocked(apiClient.get).mockRejectedValue(null);

      await expect(
        useReinitAffPyrStore.getState().getAffectationStatus('SOC1', 1001),
      ).rejects.toThrow('Erreur vérification statut');

      expect(useReinitAffPyrStore.getState().error).toBeInstanceOf(Error);
    });

    it('should handle missing data in response', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: {
          success: true,
          data: undefined,
        } as unknown as ApiResponse<AffectationStatusResponse>,
      });
      
      const status = await useReinitAffPyrStore.getState().getAffectationStatus('SOC1', 1001);

      expect(status.hasActiveAffectations).toBe(false);
      expect(status.count).toBe(0);
    });
  });

  describe('clearError', () => {
    it('should clear error state', async () => {
      useDataSourceStore.setState({ isRealApi: true });
      vi.mocked(apiClient.post).mockRejectedValue(new Error('Test error'));

      await expect(
        useReinitAffPyrStore.getState().reinitAffectationPyr({ societe: 'SOC1', compte: 1001 }),
      ).rejects.toThrow();

      expect(useReinitAffPyrStore.getState().error).not.toBe(null);

      useReinitAffPyrStore.getState().clearError();

      expect(useReinitAffPyrStore.getState().error).toBe(null);
    });
  });

  describe('reset', () => {
    it('should reset store to initial state', async () => {
      useDataSourceStore.setState({ isRealApi: true });
      vi.mocked(apiClient.post).mockResolvedValue({ data: MOCK_RESET_RESPONSE });

      await useReinitAffPyrStore.getState().reinitAffectationPyr({ societe: 'SOC1', compte: 1001 });

      expect(useReinitAffPyrStore.getState().lastResetCount).toBe(2);

      useReinitAffPyrStore.getState().reset();

      const resetStore = useReinitAffPyrStore.getState();
      expect(resetStore.isProcessing).toBe(false);
      expect(resetStore.error).toBe(null);
      expect(resetStore.lastResetCount).toBe(0);
    });
  });

  describe('Business Rules', () => {
    it('should handle RM-001: empty chambre vs non-empty chambre logic', async () => {
      const countWithEmptyChambre = await useReinitAffPyrStore.getState().reinitAffectationPyr({
        societe: 'SOC1',
        compte: 1002,
        chambre: '',
      });

      const countWithChambre = await useReinitAffPyrStore.getState().reinitAffectationPyr({
        societe: 'SOC1',
        compte: 1002,
        chambre: '201',
      });

      expect(countWithEmptyChambre).toBe(1);
      expect(countWithChambre).toBe(1);
    });

    it('should reset all PYR markers for compte indépendamment des chambres', async () => {
      const count = await useReinitAffPyrStore.getState().reinitAffectationPyr({
        societe: 'SOC1',
        compte: 1004,
      });

      expect(count).toBe(2);
    });

    it('should process masse update without complex validation', async () => {
      useDataSourceStore.setState({ isRealApi: true });
      vi.mocked(apiClient.post).mockResolvedValue({
        data: {
          success: true,
          data: { affectedCount: 50 },
        },
      });
      
      const count = await useReinitAffPyrStore.getState().reinitAffectationPyr({
        societe: 'SOC1',
        compte: 1001,
      });

      expect(count).toBe(50);
      expect(apiClient.post).toHaveBeenCalledTimes(1);
    });

    it('should support global reset for caisse closure scenario', async () => {
      useDataSourceStore.setState({ isRealApi: true });
      vi.mocked(apiClient.post).mockResolvedValue({
        data: {
          success: true,
          data: { affectedCount: 200 },
        },
      });
      
      const count = await useReinitAffPyrStore.getState().resetAllAffectations();

      expect(count).toBe(200);
      expect(apiClient.post).toHaveBeenCalledWith('/api/reinitAffPyr/reset-all');
    });
  });
});