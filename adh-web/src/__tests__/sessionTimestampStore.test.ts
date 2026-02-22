import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useSessionTimestampStore } from '@/stores/sessionTimestampStore';
import { useDataSourceStore } from '@/stores/dataSourceStore';
import { apiClient } from '@/services/api/apiClient';
import type { ApiResponse } from '@/services/api/apiClient';
import type {
  GetSessionTimestampResponse,
  ValidateTimestampResponse,
} from '@/types/sessionTimestamp';

vi.mock('@/services/api/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const MOCK_TIMESTAMP_RESPONSE: GetSessionTimestampResponse = {
  sessionDate: new Date('2026-02-21T09:15:00'),
  sessionTime: '09:15',
  timestamp: 2026022191500,
};

const MOCK_VALIDATE_RESPONSE: ValidateTimestampResponse = {
  isValid: true,
  message: 'Timestamp valide',
};

describe('sessionTimestampStore', () => {
  beforeEach(() => {
    useSessionTimestampStore.setState({
      sessionDate: null,
      sessionTime: '',
      timestamp: 0,
      isLoading: false,
      error: null,
    });
    useDataSourceStore.setState({ isRealApi: false });
    vi.clearAllMocks();
  });

  describe('getSessionTimestamp', () => {
    it('should load session timestamp from mock data when isRealApi is false', async () => {
      useDataSourceStore.setState({ isRealApi: false });

      await useSessionTimestampStore.getState().getSessionTimestamp();

      const state = useSessionTimestampStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.sessionTime).toBe('09:15');
      expect(state.timestamp).toBe(2026022191500);
      expect(state.sessionDate).toBeInstanceOf(Date);
    });

    it('should set loading state during API call', async () => {
      useDataSourceStore.setState({ isRealApi: true });
      vi.mocked(apiClient.get).mockImplementation(
        () =>
          new Promise((resolve) => {
            const currentState = useSessionTimestampStore.getState();
            expect(currentState.isLoading).toBe(true);
            resolve({
              data: MOCK_TIMESTAMP_RESPONSE,
              success: true,
              message: 'OK',
            } as ApiResponse<GetSessionTimestampResponse>);
          }),
      );

      await useSessionTimestampStore.getState().getSessionTimestamp();

      expect(useSessionTimestampStore.getState().isLoading).toBe(false);
    });

    it('should load session timestamp from API when isRealApi is true', async () => {
      useDataSourceStore.setState({ isRealApi: true });
      vi.mocked(apiClient.get).mockResolvedValue({
        data: MOCK_TIMESTAMP_RESPONSE,
        success: true,
        message: 'OK',
      } as ApiResponse<GetSessionTimestampResponse>);

      await useSessionTimestampStore.getState().getSessionTimestamp();

      const state = useSessionTimestampStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.sessionTime).toBe('09:15');
      expect(state.timestamp).toBe(2026022191500);
      expect(state.sessionDate).toBeInstanceOf(Date);
      expect(apiClient.get).toHaveBeenCalledWith('/api/session/timestamp');
    });

    it('should handle API error with Error instance', async () => {
      useDataSourceStore.setState({ isRealApi: true });
      const errorMessage = 'Network error';
      vi.mocked(apiClient.get).mockRejectedValue(new Error(errorMessage));

      await useSessionTimestampStore.getState().getSessionTimestamp();

      const state = useSessionTimestampStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(errorMessage);
      expect(state.sessionDate).toBeNull();
      expect(state.timestamp).toBe(0);
    });

    it('should handle API error with unknown error type', async () => {
      useDataSourceStore.setState({ isRealApi: true });
      vi.mocked(apiClient.get).mockRejectedValue('Unknown error');

      await useSessionTimestampStore.getState().getSessionTimestamp();

      const state = useSessionTimestampStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Erreur récupération timestamp session');
    });

    it('should guarantee timestamp calculation coherence (date*10^5 + time)', async () => {
      useDataSourceStore.setState({ isRealApi: false });

      await useSessionTimestampStore.getState().getSessionTimestamp();

      const state = useSessionTimestampStore.getState();
      const expectedDate = 20260221;
      const expectedTime = 91500;
      const expectedTimestamp = expectedDate * 100000 + expectedTime;
      expect(state.timestamp).toBe(expectedTimestamp);
    });
  });

  describe('validateTimestamp', () => {
    it('should validate timestamp within 1440 minutes (24h) in mock mode', async () => {
      useDataSourceStore.setState({ isRealApi: false });
      const mockTimestamp = 2026022191500;
      const validTimestamp = mockTimestamp + 10000;

      const result = await useSessionTimestampStore.getState().validateTimestamp(validTimestamp);

      expect(result).toBe(true);
    });

    it('should reject timestamp outside 1440 minutes in mock mode', async () => {
      useDataSourceStore.setState({ isRealApi: false });
      const mockTimestamp = 2026022191500;
      const invalidTimestamp = mockTimestamp + 200000;

      const result = await useSessionTimestampStore.getState().validateTimestamp(invalidTimestamp);

      expect(result).toBe(false);
    });

    it('should validate timestamp via API when isRealApi is true', async () => {
      useDataSourceStore.setState({ isRealApi: true });
      const timestamp = 2026022191500;
      vi.mocked(apiClient.post).mockResolvedValue({
        data: MOCK_VALIDATE_RESPONSE,
        success: true,
        message: 'OK',
      } as ApiResponse<ValidateTimestampResponse>);

      const result = await useSessionTimestampStore.getState().validateTimestamp(timestamp);

      expect(result).toBe(true);
      expect(apiClient.post).toHaveBeenCalledWith('/api/session/validate-timestamp', {
        timestamp,
      });
    });

    it('should return false and set error on API validation failure', async () => {
      useDataSourceStore.setState({ isRealApi: true });
      const timestamp = 2026022191500;
      vi.mocked(apiClient.post).mockRejectedValue(new Error('Validation failed'));

      const result = await useSessionTimestampStore.getState().validateTimestamp(timestamp);

      expect(result).toBe(false);
      expect(useSessionTimestampStore.getState().error).toBe('Validation failed');
    });

    it('should return false and set generic error on unknown validation error', async () => {
      useDataSourceStore.setState({ isRealApi: true });
      const timestamp = 2026022191500;
      vi.mocked(apiClient.post).mockRejectedValue('Unknown error');

      const result = await useSessionTimestampStore.getState().validateTimestamp(timestamp);

      expect(result).toBe(false);
      expect(useSessionTimestampStore.getState().error).toBe('Erreur validation timestamp');
    });

    it('should ensure timestamp coherence with active caisse sessions', async () => {
      useDataSourceStore.setState({ isRealApi: false });
      const currentTimestamp = 2026022191500;
      const validTimestamp = 2026022110150;
      const diffMinutes = Math.abs(validTimestamp - currentTimestamp) / 100;

      const result = await useSessionTimestampStore.getState().validateTimestamp(validTimestamp);

      expect(diffMinutes).toBeLessThanOrEqual(1440);
      expect(result).toBe(true);
    });
  });

  describe('resetState', () => {
    it('should reset store to initial state', () => {
      useSessionTimestampStore.setState({
        sessionDate: new Date(),
        sessionTime: '10:30',
        timestamp: 2026022110300,
        isLoading: true,
        error: 'Some error',
      });

      useSessionTimestampStore.getState().resetState();

      const state = useSessionTimestampStore.getState();
      expect(state.sessionDate).toBeNull();
      expect(state.sessionTime).toBe('');
      expect(state.timestamp).toBe(0);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });
});