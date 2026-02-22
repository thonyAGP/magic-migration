import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useSaisieDateStore, getTitre } from '@/stores/saisieDateStore';
import { useDataSourceStore } from '@/stores/dataSourceStore';
import { apiClient } from '@/services/api/apiClient';
import type { DateRange, GetTitreResponse } from '@/types/saisieDate';
import type { ApiResponse } from '@/services/api/apiClient';

vi.mock('@/services/api/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock('@/stores/dataSourceStore', () => ({
  useDataSourceStore: {
    getState: vi.fn(),
  },
}));

const MOCK_DATE_MIN = new Date('2025-01-01');
const MOCK_DATE_MAX = new Date('2025-12-31');
const MOCK_DATE_INVALID = new Date('2025-12-31');
const MOCK_DATE_VALID_MIN = new Date('2025-06-01');

describe('saisieDateStore', () => {
  beforeEach(() => {
    useSaisieDateStore.setState({
      dateMin: null,
      dateMax: null,
      isValid: false,
      errorMessage: null,
    });
    vi.clearAllMocks();
  });

  describe('setDateMin', () => {
    it('should update dateMin and validate', () => {
      const { setDateMin } = useSaisieDateStore.getState();

      setDateMin(MOCK_DATE_MIN);

      const state = useSaisieDateStore.getState();
      expect(state.dateMin).toEqual(MOCK_DATE_MIN);
      expect(state.isValid).toBe(true);
      expect(state.errorMessage).toBeNull();
    });

    it('should invalidate when dateMin > dateMax', () => {
      const { setDateMin, setDateMax } = useSaisieDateStore.getState();

      setDateMax(MOCK_DATE_MIN);
      setDateMin(MOCK_DATE_MAX);

      const state = useSaisieDateStore.getState();
      expect(state.isValid).toBe(false);
      expect(state.errorMessage).toBe('La date minimum doit être inférieure ou égale à la date maximum');
    });

    it('should clear dateMin when null is provided', () => {
      const { setDateMin, setDateMax } = useSaisieDateStore.getState();

      setDateMin(MOCK_DATE_MIN);
      setDateMax(MOCK_DATE_MAX);
      setDateMin(null);

      const state = useSaisieDateStore.getState();
      expect(state.dateMin).toBeNull();
      expect(state.isValid).toBe(true);
    });
  });

  describe('setDateMax', () => {
    it('should update dateMax and validate', () => {
      const { setDateMax } = useSaisieDateStore.getState();

      setDateMax(MOCK_DATE_MAX);

      const state = useSaisieDateStore.getState();
      expect(state.dateMax).toEqual(MOCK_DATE_MAX);
      expect(state.isValid).toBe(true);
      expect(state.errorMessage).toBeNull();
    });

    it('should invalidate when dateMax < dateMin', () => {
      const { setDateMin, setDateMax } = useSaisieDateStore.getState();

      setDateMin(MOCK_DATE_MAX);
      setDateMax(MOCK_DATE_MIN);

      const state = useSaisieDateStore.getState();
      expect(state.isValid).toBe(false);
      expect(state.errorMessage).toBe('La date minimum doit être inférieure ou égale à la date maximum');
    });

    it('should clear dateMax when null is provided', () => {
      const { setDateMin, setDateMax } = useSaisieDateStore.getState();

      setDateMin(MOCK_DATE_MIN);
      setDateMax(MOCK_DATE_MAX);
      setDateMax(null);

      const state = useSaisieDateStore.getState();
      expect(state.dateMax).toBeNull();
      expect(state.isValid).toBe(true);
    });
  });

  describe('validateDates', () => {
    it('should return false when no dates are set', () => {
      const { validateDates } = useSaisieDateStore.getState();

      const result = validateDates();

      expect(result).toBe(false);
      const state = useSaisieDateStore.getState();
      expect(state.isValid).toBe(false);
      expect(state.errorMessage).toBe('Au moins une date doit être saisie');
    });

    it('should return true when only dateMin is set', () => {
      const { setDateMin, validateDates } = useSaisieDateStore.getState();

      setDateMin(MOCK_DATE_MIN);
      const result = validateDates();

      expect(result).toBe(true);
      const state = useSaisieDateStore.getState();
      expect(state.isValid).toBe(true);
      expect(state.errorMessage).toBeNull();
    });

    it('should return true when only dateMax is set', () => {
      const { setDateMax, validateDates } = useSaisieDateStore.getState();

      setDateMax(MOCK_DATE_MAX);
      const result = validateDates();

      expect(result).toBe(true);
      const state = useSaisieDateStore.getState();
      expect(state.isValid).toBe(true);
      expect(state.errorMessage).toBeNull();
    });

    it('should return true when dateMin <= dateMax', () => {
      useSaisieDateStore.setState({
        dateMin: MOCK_DATE_MIN,
        dateMax: MOCK_DATE_MAX,
      });

      const { validateDates } = useSaisieDateStore.getState();
      const result = validateDates();

      expect(result).toBe(true);
      const state = useSaisieDateStore.getState();
      expect(state.isValid).toBe(true);
      expect(state.errorMessage).toBeNull();
    });

    it('should return false when dateMin > dateMax', () => {
      useSaisieDateStore.setState({
        dateMin: MOCK_DATE_MAX,
        dateMax: MOCK_DATE_MIN,
      });

      const { validateDates } = useSaisieDateStore.getState();
      const result = validateDates();

      expect(result).toBe(false);
      const state = useSaisieDateStore.getState();
      expect(state.isValid).toBe(false);
      expect(state.errorMessage).toBe('La date minimum doit être inférieure ou égale à la date maximum');
    });

    it('should return true when dateMin equals dateMax', () => {
      useSaisieDateStore.setState({
        dateMin: MOCK_DATE_MIN,
        dateMax: MOCK_DATE_MIN,
      });

      const { validateDates } = useSaisieDateStore.getState();
      const result = validateDates();

      expect(result).toBe(true);
      const state = useSaisieDateStore.getState();
      expect(state.isValid).toBe(true);
      expect(state.errorMessage).toBeNull();
    });
  });

  describe('submitDates', () => {
    it('should return null when validation fails', async () => {
      const { submitDates } = useSaisieDateStore.getState();

      const result = await submitDates();

      expect(result).toBeNull();
      const state = useSaisieDateStore.getState();
      expect(state.isValid).toBe(false);
    });

    it('should return date range in mock mode when valid', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: false } as never);

      useSaisieDateStore.setState({
        dateMin: MOCK_DATE_MIN,
        dateMax: MOCK_DATE_MAX,
      });

      const { submitDates } = useSaisieDateStore.getState();
      const result = await submitDates();

      expect(result).toEqual({
        dateMin: MOCK_DATE_MIN,
        dateMax: MOCK_DATE_MAX,
      });
    });

    it('should call API and return data when in real API mode', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as never);

      const mockResponse: ApiResponse<DateRange> = {
        data: {
          success: true,
          data: {
            dateMin: MOCK_DATE_MIN,
            dateMax: MOCK_DATE_MAX,
          },
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as never,
      };

      vi.mocked(apiClient.post).mockResolvedValue(mockResponse);

      useSaisieDateStore.setState({
        dateMin: MOCK_DATE_MIN,
        dateMax: MOCK_DATE_MAX,
      });

      const { submitDates } = useSaisieDateStore.getState();
      const result = await submitDates();

      expect(apiClient.post).toHaveBeenCalledWith('/api/saisie-date/submit', {
        dateMin: MOCK_DATE_MIN,
        dateMax: MOCK_DATE_MAX,
      });
      expect(result).toEqual({
        dateMin: MOCK_DATE_MIN,
        dateMax: MOCK_DATE_MAX,
      });
    });

    it('should handle API error response', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as never);

      const mockResponse: ApiResponse<DateRange> = {
        data: {
          success: false,
          error: 'Invalid date range',
        },
        status: 400,
        statusText: 'Bad Request',
        headers: {},
        config: {} as never,
      };

      vi.mocked(apiClient.post).mockResolvedValue(mockResponse);

      useSaisieDateStore.setState({
        dateMin: MOCK_DATE_MIN,
        dateMax: MOCK_DATE_MAX,
      });

      const { submitDates } = useSaisieDateStore.getState();
      const result = await submitDates();

      expect(result).toBeNull();
      const state = useSaisieDateStore.getState();
      expect(state.errorMessage).toBe('Invalid date range');
    });

    it('should handle API network error', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as never);

      vi.mocked(apiClient.post).mockRejectedValue(new Error('Network error'));

      useSaisieDateStore.setState({
        dateMin: MOCK_DATE_MIN,
        dateMax: MOCK_DATE_MAX,
      });

      const { submitDates } = useSaisieDateStore.getState();
      const result = await submitDates();

      expect(result).toBeNull();
      const state = useSaisieDateStore.getState();
      expect(state.errorMessage).toBe('Network error');
    });

    it('should handle unknown API error', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as never);

      vi.mocked(apiClient.post).mockRejectedValue('unknown error');

      useSaisieDateStore.setState({
        dateMin: MOCK_DATE_MIN,
        dateMax: MOCK_DATE_MAX,
      });

      const { submitDates } = useSaisieDateStore.getState();
      const result = await submitDates();

      expect(result).toBeNull();
      const state = useSaisieDateStore.getState();
      expect(state.errorMessage).toBe('Erreur lors de la soumission des dates');
    });

    it('should handle API response without data', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as never);

      const mockResponse: ApiResponse<DateRange> = {
        data: {
          success: true,
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as never,
      };

      vi.mocked(apiClient.post).mockResolvedValue(mockResponse);

      useSaisieDateStore.setState({
        dateMin: MOCK_DATE_MIN,
        dateMax: MOCK_DATE_MAX,
      });

      const { submitDates } = useSaisieDateStore.getState();
      const result = await submitDates();

      expect(result).toEqual({
        dateMin: MOCK_DATE_MIN,
        dateMax: MOCK_DATE_MAX,
      });
    });
  });

  describe('cancel', () => {
    it('should reset all state to initial values', () => {
      useSaisieDateStore.setState({
        dateMin: MOCK_DATE_MIN,
        dateMax: MOCK_DATE_MAX,
        isValid: true,
        errorMessage: 'Some error',
      });

      const { cancel } = useSaisieDateStore.getState();
      cancel();

      const state = useSaisieDateStore.getState();
      expect(state.dateMin).toBeNull();
      expect(state.dateMax).toBeNull();
      expect(state.isValid).toBe(false);
      expect(state.errorMessage).toBeNull();
    });
  });

  describe('reset', () => {
    it('should reset all state to initial values', () => {
      useSaisieDateStore.setState({
        dateMin: MOCK_DATE_MIN,
        dateMax: MOCK_DATE_MAX,
        isValid: true,
        errorMessage: 'Some error',
      });

      const { reset } = useSaisieDateStore.getState();
      reset();

      const state = useSaisieDateStore.getState();
      expect(state.dateMin).toBeNull();
      expect(state.dateMax).toBeNull();
      expect(state.isValid).toBe(false);
      expect(state.errorMessage).toBeNull();
    });
  });
});

describe('getTitre', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return default title in mock mode', async () => {
    vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: false } as never);

    const result = await getTitre();

    expect(result).toBe('Saisie dates');
    expect(apiClient.get).not.toHaveBeenCalled();
  });

  it('should fetch title from API in real mode', async () => {
    vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as never);

    const mockResponse: ApiResponse<GetTitreResponse> = {
      data: {
        success: true,
        data: {
          titre: 'Sélection période',
        },
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as never,
    };

    vi.mocked(apiClient.get).mockResolvedValue(mockResponse);

    const result = await getTitre();

    expect(apiClient.get).toHaveBeenCalledWith('/api/saisie-date/titre');
    expect(result).toBe('Sélection période');
  });

  it('should return default title when API response has no data', async () => {
    vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as never);

    const mockResponse: ApiResponse<GetTitreResponse> = {
      data: {
        success: true,
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as never,
    };

    vi.mocked(apiClient.get).mockResolvedValue(mockResponse);

    const result = await getTitre();

    expect(result).toBe('Saisie dates');
  });

  it('should return default title on API error', async () => {
    vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as never);

    vi.mocked(apiClient.get).mockRejectedValue(new Error('Network error'));

    const result = await getTitre();

    expect(result).toBe('Saisie dates');
  });
});