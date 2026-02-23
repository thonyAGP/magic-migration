import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useTicketFermetureSessionStore } from '@/stores/ticketFermetureSessionStore';
import { useDataSourceStore } from '@/stores/dataSourceStore';
import { apiClient } from '@/services/api/apiClient';
import type { ApiResponse } from '@/services/api/apiClient';
import type {
  RecapFermetureSession,
  MontantComptable,
} from '@/types/ticketFermetureSession';

vi.mock('@/services/api/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const MOCK_RECAP: RecapFermetureSession = {
  societe: 'SOC1',
  session: 142,
  dateComptable: new Date('2026-02-08'),
  heureDebutSession: '08:00',
  caisseDepart: 500,
  apportCoffre: 2000,
  versement: 1500,
  retrait: 300,
  soldeCash: 3200,
  soldeCarte: 1850,
  change: 450,
  fraisChange: 15,
  deviseLocale: 'EUR',
  nomVillage: 'Club Med Peisey-Vallandry',
  editionDetaillee: true,
};

const MOCK_MONTANTS: MontantComptable[] = [
  {
    cumulQuantite: 12,
    cumulMontant: 540,
    totalMontant: 540,
    equivalent: 540,
  },
  {
    cumulQuantite: 8,
    cumulMontant: 320,
    totalMontant: 320,
    equivalent: 320,
  },
  {
    cumulQuantite: 5,
    cumulMontant: 175,
    totalMontant: 175,
    equivalent: 175,
  },
];

describe('ticketFermetureSessionStore', () => {
  beforeEach(() => {
    useTicketFermetureSessionStore.getState().reset();
    useDataSourceStore.setState({ isRealApi: false });
    vi.clearAllMocks();
  });

  describe('loadRecapData', () => {
    it('should load recap data from mock when isRealApi is false', async () => {
      const { loadRecapData } =
        useTicketFermetureSessionStore.getState();

      await loadRecapData('SOC1', 142);

      const state = useTicketFermetureSessionStore.getState();
      expect(state.recapData).toEqual({ ...MOCK_RECAP, societe: 'SOC1', session: 142 });
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(null);
    });

    it('should load recap data from API when isRealApi is true', async () => {
      useDataSourceStore.setState({ isRealApi: true });

      const mockResponse: ApiResponse<RecapFermetureSession> = {
        success: true,
        data: MOCK_RECAP,
      };

      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockResponse });

      const { loadRecapData } = useTicketFermetureSessionStore.getState();
      await loadRecapData('SOC1', 142);

      const state = useTicketFermetureSessionStore.getState();
      expect(state.recapData).toEqual(MOCK_RECAP);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(null);
      expect(apiClient.get).toHaveBeenCalledWith(
        '/api/ticketFermetureSession/recap',
        { params: { societe: 'SOC1', session: 142 } },
      );
    });

    it('should set error when API call fails', async () => {
      useDataSourceStore.setState({ isRealApi: true });

      vi.mocked(apiClient.get).mockRejectedValueOnce(new Error('Network error'));

      const { loadRecapData } = useTicketFermetureSessionStore.getState();
      await loadRecapData('SOC1', 142);

      const state = useTicketFermetureSessionStore.getState();
      expect(state.recapData).toBe(null);
      expect(state.error).toBe('Network error');
      expect(state.isLoading).toBe(false);
    });

    it('should set loading state during API call', async () => {
      useDataSourceStore.setState({ isRealApi: true });

      let resolvePromise: (value: unknown) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      vi.mocked(apiClient.get).mockReturnValueOnce(promise as Promise<unknown>);

      const { loadRecapData } = useTicketFermetureSessionStore.getState();
      const loadPromise = loadRecapData('SOC1', 142);

      expect(useTicketFermetureSessionStore.getState().isLoading).toBe(true);

      resolvePromise!({
        data: { success: true, data: MOCK_RECAP },
      });

      await loadPromise;

      expect(useTicketFermetureSessionStore.getState().isLoading).toBe(false);
    });
  });

  describe('loadMontantsComptables', () => {
    it('should load montants from mock when isRealApi is false', async () => {
      const { loadMontantsComptables } = useTicketFermetureSessionStore.getState();

      await loadMontantsComptables('SOC1', 142);

      const state = useTicketFermetureSessionStore.getState();
      expect(state.montantsComptables).toEqual(MOCK_MONTANTS);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(null);
    });

    it('should load montants from API when isRealApi is true', async () => {
      useDataSourceStore.setState({ isRealApi: true });

      const mockResponse: ApiResponse<MontantComptable[]> = {
        success: true,
        data: MOCK_MONTANTS,
      };

      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockResponse });

      const { loadMontantsComptables } = useTicketFermetureSessionStore.getState();
      await loadMontantsComptables('SOC1', 142);

      const state = useTicketFermetureSessionStore.getState();
      expect(state.montantsComptables).toEqual(MOCK_MONTANTS);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(null);
      expect(apiClient.get).toHaveBeenCalledWith(
        '/api/ticketFermetureSession/montants',
        { params: { societe: 'SOC1', session: 142 } },
      );
    });

    it('should set error when API call fails', async () => {
      useDataSourceStore.setState({ isRealApi: true });

      vi.mocked(apiClient.get).mockRejectedValueOnce(new Error('Database error'));

      const { loadMontantsComptables } = useTicketFermetureSessionStore.getState();
      await loadMontantsComptables('SOC1', 142);

      const state = useTicketFermetureSessionStore.getState();
      expect(state.montantsComptables).toEqual([]);
      expect(state.error).toBe('Database error');
      expect(state.isLoading).toBe(false);
    });
  });

  describe('generateTicketFermeture', () => {
    it('should generate ticket when finTache is F and isRealApi is true', async () => {
      useDataSourceStore.setState({ isRealApi: true });
      useTicketFermetureSessionStore.setState({ finTache: 'F', printerNum: 1 });

      const mockResponse: ApiResponse<void> = {
        success: true,
      };

      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockResponse });

      const { generateTicketFermeture } = useTicketFermetureSessionStore.getState();
      const dateComptable = new Date('2026-02-08');

      await generateTicketFermeture('SOC1', 142, dateComptable);

      const state = useTicketFermetureSessionStore.getState();
      expect(state.error).toBe(null);
      expect(state.isLoading).toBe(false);
      expect(apiClient.post).toHaveBeenCalledWith(
        '/api/ticketFermetureSession/generate',
        {
          societe: 'SOC1',
          session: 142,
          dateComptable,
          printerNum: 1,
        },
      );
    });

    it('should use printer 9 when printerNum is set to 9', async () => {
      useDataSourceStore.setState({ isRealApi: true });
      useTicketFermetureSessionStore.setState({ finTache: 'F', printerNum: 9 });

      const mockResponse: ApiResponse<void> = {
        success: true,
      };

      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockResponse });

      const { generateTicketFermeture } = useTicketFermetureSessionStore.getState();
      const dateComptable = new Date('2026-02-08');

      await generateTicketFermeture('SOC1', 142, dateComptable);

      expect(apiClient.post).toHaveBeenCalledWith(
        '/api/ticketFermetureSession/generate',
        {
          societe: 'SOC1',
          session: 142,
          dateComptable,
          printerNum: 9,
        },
      );
    });

    it('should set error when finTache is not F', async () => {
      useTicketFermetureSessionStore.setState({ finTache: 'N' });

      const { generateTicketFermeture } = useTicketFermetureSessionStore.getState();
      const dateComptable = new Date('2026-02-08');

      await generateTicketFermeture('SOC1', 142, dateComptable);

      const state = useTicketFermetureSessionStore.getState();
      expect(state.error).toBe(
        'La tâche doit être marquée comme terminée (finTache = "F") avant de générer le ticket',
      );
      expect(apiClient.post).not.toHaveBeenCalled();
    });

    it('should not call API when isRealApi is false', async () => {
      useDataSourceStore.setState({ isRealApi: false });
      useTicketFermetureSessionStore.setState({ finTache: 'F' });

      const { generateTicketFermeture } = useTicketFermetureSessionStore.getState();
      const dateComptable = new Date('2026-02-08');

      await generateTicketFermeture('SOC1', 142, dateComptable);

      expect(apiClient.post).not.toHaveBeenCalled();
      expect(useTicketFermetureSessionStore.getState().isLoading).toBe(false);
    });

    it('should set error when API call fails', async () => {
      useDataSourceStore.setState({ isRealApi: true });
      useTicketFermetureSessionStore.setState({ finTache: 'F', printerNum: 1 });

      vi.mocked(apiClient.post).mockRejectedValueOnce(new Error('Print error'));

      const { generateTicketFermeture } = useTicketFermetureSessionStore.getState();
      const dateComptable = new Date('2026-02-08');

      await generateTicketFermeture('SOC1', 142, dateComptable);

      const state = useTicketFermetureSessionStore.getState();
      expect(state.error).toBe('Print error');
      expect(state.isLoading).toBe(false);
    });
  });

  describe('validateFinTache', () => {
    it('should return true when finTache is F', () => {
      const { validateFinTache } = useTicketFermetureSessionStore.getState();

      expect(validateFinTache('F')).toBe(true);
    });

    it('should return false when finTache is not F', () => {
      const { validateFinTache } = useTicketFermetureSessionStore.getState();

      expect(validateFinTache('N')).toBe(false);
      expect(validateFinTache('')).toBe(false);
      expect(validateFinTache('X')).toBe(false);
    });
  });

  describe('selectPrinter', () => {
    it('should set printerNum to 1', () => {
      const { selectPrinter } = useTicketFermetureSessionStore.getState();

      selectPrinter(1);

      expect(useTicketFermetureSessionStore.getState().printerNum).toBe(1);
    });

    it('should set printerNum to 9', () => {
      const { selectPrinter } = useTicketFermetureSessionStore.getState();

      selectPrinter(9);

      expect(useTicketFermetureSessionStore.getState().printerNum).toBe(9);
    });
  });

  describe('reset', () => {
    it('should reset all state to initial values', () => {
      useTicketFermetureSessionStore.setState({
        recapData: MOCK_RECAP,
        montantsComptables: MOCK_MONTANTS,
        isLoading: true,
        error: 'Some error',
        finTache: 'F',
        printerNum: 9,
      });

      const { reset } = useTicketFermetureSessionStore.getState();
      reset();

      const state = useTicketFermetureSessionStore.getState();
      expect(state.recapData).toBe(null);
      expect(state.montantsComptables).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(null);
      expect(state.finTache).toBe('');
      expect(state.printerNum).toBe(1);
    });
  });
});