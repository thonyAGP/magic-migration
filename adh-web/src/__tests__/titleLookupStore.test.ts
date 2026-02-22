import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useTitleLookupStore } from '@/stores/titleLookupStore';
import { useDataSourceStore } from '@/stores/dataSourceStore';
import { apiClient } from '@/services/api/apiClient';
import type { ApiResponse } from '@/services/api/apiClient';
import type { Title } from '@/types/titleLookup';

vi.mock('@/services/api/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

const MOCK_TITLES: Title[] = [
  { code: 'M', label: 'M.', type: 'CA' },
  { code: 'MME', label: 'Mme', type: 'CA' },
  { code: 'MLLE', label: 'Mlle', type: 'CA' },
  { code: 'DR', label: 'Dr', type: 'CA' },
  { code: 'M', label: 'Mr', type: 'CB' },
  { code: 'MME', label: 'Mrs', type: 'CB' },
];

describe('titleLookupStore', () => {
  beforeEach(() => {
    useTitleLookupStore.getState().reset();
    useDataSourceStore.setState({ isRealApi: false });
    vi.clearAllMocks();
  });

  describe('getTitleByCode', () => {
    it('should return label from mock data when code exists (CA type)', async () => {
      const result = await useTitleLookupStore.getState().getTitleByCode('M', 'CA');

      expect(result).toBe('M.');
    });

    it('should return label from mock data when code exists (CB type)', async () => {
      const result = await useTitleLookupStore.getState().getTitleByCode('MME', 'CB');

      expect(result).toBe('Mrs');
    });

    it('should use CA as default programType when not provided (RM-001)', async () => {
      const result = await useTitleLookupStore.getState().getTitleByCode('MME');

      expect(result).toBe('Mme');
    });

    it('should return code when title not found in mock data', async () => {
      const result = await useTitleLookupStore.getState().getTitleByCode('UNKNOWN', 'CA');

      expect(result).toBe('UNKNOWN');
    });

    it('should call API with correct params when using real API', async () => {
      useDataSourceStore.setState({ isRealApi: true });
      const mockResponse: ApiResponse<{ label: string }> = {
        success: true,
        data: { label: 'Monsieur' },
      };
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockResponse });

      const result = await useTitleLookupStore.getState().getTitleByCode('M', 'CA');

      expect(apiClient.get).toHaveBeenCalledWith('/api/titles/M?programType=CA');
      expect(result).toBe('Monsieur');
    });

    it('should use CA as default programType in API call when not provided', async () => {
      useDataSourceStore.setState({ isRealApi: true });
      const mockResponse: ApiResponse<{ label: string }> = {
        success: true,
        data: { label: 'Madame' },
      };
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockResponse });

      await useTitleLookupStore.getState().getTitleByCode('MME');

      expect(apiClient.get).toHaveBeenCalledWith('/api/titles/MME?programType=CA');
    });

    it('should return code when API returns no data', async () => {
      useDataSourceStore.setState({ isRealApi: true });
      const mockResponse: ApiResponse<{ label: string }> = {
        success: true,
        data: null,
      };
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockResponse });

      const result = await useTitleLookupStore.getState().getTitleByCode('M', 'CA');

      expect(result).toBe('M');
    });

    it('should set error and return code when API call fails', async () => {
      useDataSourceStore.setState({ isRealApi: true });
      const error = new Error('Network error');
      vi.mocked(apiClient.get).mockRejectedValue(error);

      const result = await useTitleLookupStore.getState().getTitleByCode('M', 'CA');

      expect(result).toBe('M');
      expect(useTitleLookupStore.getState().error).toBe('Network error');
    });

    it('should set generic error message when error is not an Error instance', async () => {
      useDataSourceStore.setState({ isRealApi: true });
      vi.mocked(apiClient.get).mockRejectedValue('string error');

      const result = await useTitleLookupStore.getState().getTitleByCode('M', 'CA');

      expect(result).toBe('M');
      expect(useTitleLookupStore.getState().error).toBe('Erreur recherche titre');
    });
  });

  describe('loadTitles', () => {
    it('should set loading state while loading', async () => {
      expect(useTitleLookupStore.getState().isLoading).toBe(false);
      
      const loadPromise = useTitleLookupStore.getState().loadTitles();
      
      expect(useTitleLookupStore.getState().isLoading).toBe(true);
      
      await loadPromise;
      
      expect(useTitleLookupStore.getState().isLoading).toBe(false);
    });

    it('should load mock titles when using mock data', async () => {
      await useTitleLookupStore.getState().loadTitles();

      expect(useTitleLookupStore.getState().titles).toHaveLength(8);
      expect(useTitleLookupStore.getState().titles[0]).toEqual({ code: 'M', label: 'M.', type: 'CA' });
    });

    it('should call API and set titles when using real API', async () => {
      useDataSourceStore.setState({ isRealApi: true });
      const mockResponse: ApiResponse<Title[]> = {
        success: true,
        data: [
          { code: 'M', label: 'Monsieur', type: 'CA' },
          { code: 'MME', label: 'Madame', type: 'CA' },
        ],
      };
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockResponse });

      await useTitleLookupStore.getState().loadTitles();

      expect(apiClient.get).toHaveBeenCalledWith('/api/titles');
      expect(useTitleLookupStore.getState().titles).toHaveLength(2);
      expect(useTitleLookupStore.getState().titles[0]).toEqual({ code: 'M', label: 'Monsieur', type: 'CA' });
    });

    it('should set empty array when API returns no data', async () => {
      useDataSourceStore.setState({ isRealApi: true });
      const mockResponse: ApiResponse<Title[]> = {
        success: true,
        data: null,
      };
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockResponse });

      await useTitleLookupStore.getState().loadTitles();

      expect(useTitleLookupStore.getState().titles).toEqual([]);
    });

    it('should clear error before loading', async () => {
      useTitleLookupStore.setState({ error: 'Previous error' });

      await useTitleLookupStore.getState().loadTitles();

      expect(useTitleLookupStore.getState().error).toBeNull();
    });

    it('should set error and empty titles when API call fails', async () => {
      useDataSourceStore.setState({ isRealApi: true });
      const error = new Error('API error');
      vi.mocked(apiClient.get).mockRejectedValue(error);

      await useTitleLookupStore.getState().loadTitles();

      expect(useTitleLookupStore.getState().error).toBe('API error');
      expect(useTitleLookupStore.getState().titles).toEqual([]);
      expect(useTitleLookupStore.getState().isLoading).toBe(false);
    });

    it('should set generic error message when error is not an Error instance', async () => {
      useDataSourceStore.setState({ isRealApi: true });
      vi.mocked(apiClient.get).mockRejectedValue('string error');

      await useTitleLookupStore.getState().loadTitles();

      expect(useTitleLookupStore.getState().error).toBe('Erreur chargement titres');
    });
  });

  describe('setTitles', () => {
    it('should update titles state', () => {
      const newTitles: Title[] = [
        { code: 'TEST', label: 'Test', type: 'CA' },
      ];

      useTitleLookupStore.getState().setTitles(newTitles);

      expect(useTitleLookupStore.getState().titles).toEqual(newTitles);
    });
  });

  describe('setIsLoading', () => {
    it('should update loading state to true', () => {
      useTitleLookupStore.getState().setIsLoading(true);

      expect(useTitleLookupStore.getState().isLoading).toBe(true);
    });

    it('should update loading state to false', () => {
      useTitleLookupStore.setState({ isLoading: true });

      useTitleLookupStore.getState().setIsLoading(false);

      expect(useTitleLookupStore.getState().isLoading).toBe(false);
    });
  });

  describe('setError', () => {
    it('should update error state', () => {
      useTitleLookupStore.getState().setError('Test error');

      expect(useTitleLookupStore.getState().error).toBe('Test error');
    });

    it('should clear error when set to null', () => {
      useTitleLookupStore.setState({ error: 'Previous error' });

      useTitleLookupStore.getState().setError(null);

      expect(useTitleLookupStore.getState().error).toBeNull();
    });
  });

  describe('reset', () => {
    it('should reset state to initial values', () => {
      useTitleLookupStore.setState({
        titles: [{ code: 'M', label: 'M.', type: 'CA' }],
        isLoading: true,
        error: 'Some error',
      });

      useTitleLookupStore.getState().reset();

      expect(useTitleLookupStore.getState().titles).toEqual([]);
      expect(useTitleLookupStore.getState().isLoading).toBe(false);
      expect(useTitleLookupStore.getState().error).toBeNull();
    });
  });
});