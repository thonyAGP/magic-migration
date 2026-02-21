import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useApportCoffreStore } from '@/stores/apportCoffreStore';
import { useDataSourceStore } from '@/stores/dataSourceStore';
import { apiClient } from '@/services/api/apiClient';
import type { ApiResponse } from '@/services/api/apiClient';
import type { CaisseConfig, ApportCoffreResponse } from '@/types/apportCoffre';

vi.mock('@/services/api/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const MOCK_DEVISES_AUTORISEES = [
  { code: 'EUR', libelle: 'Euro', venteAutorisee: true },
  { code: 'USD', libelle: 'Dollar américain', venteAutorisee: true },
  { code: 'GBP', libelle: 'Livre sterling', venteAutorisee: true },
];

const MOCK_CONFIG: CaisseConfig = {
  devisesAutorisees: MOCK_DEVISES_AUTORISEES,
  sessionActive: true,
};

const MOCK_APPORT_RESPONSE: ApportCoffreResponse = {
  success: true,
  montantCoffre: 1250.5,
};

describe('apportCoffreStore', () => {
  beforeEach(() => {
    useApportCoffreStore.setState({
      devises: [],
      isExecuting: false,
      error: null,
      deviseSelectionnee: null,
      montantSaisi: 0,
    });
    vi.clearAllMocks();
    useDataSourceStore.setState({ isRealApi: false });
  });

  describe('chargerDevises', () => {
    it('should load devises from mock when isRealApi is false', async () => {
      const { chargerDevises } = useApportCoffreStore.getState();

      await chargerDevises();

      const state = useApportCoffreStore.getState();
      expect(state.devises).toEqual(MOCK_DEVISES_AUTORISEES);
      expect(state.isExecuting).toBe(false);
      expect(state.error).toBeNull();
      expect(apiClient.get).not.toHaveBeenCalled();
    });

    it('should load devises from API when isRealApi is true', async () => {
      useDataSourceStore.setState({ isRealApi: true });
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: { data: MOCK_CONFIG } as ApiResponse<CaisseConfig>,
      } as never);

      const { chargerDevises } = useApportCoffreStore.getState();

      await chargerDevises();

      const state = useApportCoffreStore.getState();
      expect(apiClient.get).toHaveBeenCalledWith('/api/caisse/config');
      expect(state.devises).toEqual(MOCK_DEVISES_AUTORISEES);
      expect(state.isExecuting).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should set isExecuting to true during loading', async () => {
      let isExecutingDuringCall = false;

      vi.mocked(apiClient.get).mockImplementationOnce(async () => {
        isExecutingDuringCall = useApportCoffreStore.getState().isExecuting;
        return {
          data: { data: MOCK_CONFIG } as ApiResponse<CaisseConfig>,
        } as never;
      });

      useDataSourceStore.setState({ isRealApi: true });
      const { chargerDevises } = useApportCoffreStore.getState();

      await chargerDevises();

      expect(isExecutingDuringCall).toBe(true);
      expect(useApportCoffreStore.getState().isExecuting).toBe(false);
    });

    it('should handle API error when config is null', async () => {
      useDataSourceStore.setState({ isRealApi: true });
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: { data: null } as ApiResponse<CaisseConfig>,
      } as never);

      const { chargerDevises } = useApportCoffreStore.getState();

      await chargerDevises();

      const state = useApportCoffreStore.getState();
      expect(state.devises).toEqual([]);
      expect(state.error).toBe('Configuration caisse non disponible');
      expect(state.isExecuting).toBe(false);
    });

    it('should handle API network error', async () => {
      useDataSourceStore.setState({ isRealApi: true });
      vi.mocked(apiClient.get).mockRejectedValueOnce(new Error('Network error'));

      const { chargerDevises } = useApportCoffreStore.getState();

      await chargerDevises();

      const state = useApportCoffreStore.getState();
      expect(state.devises).toEqual([]);
      expect(state.error).toBe('Network error');
      expect(state.isExecuting).toBe(false);
    });

    it('should handle unknown error type', async () => {
      useDataSourceStore.setState({ isRealApi: true });
      vi.mocked(apiClient.get).mockRejectedValueOnce('unknown error');

      const { chargerDevises } = useApportCoffreStore.getState();

      await chargerDevises();

      const state = useApportCoffreStore.getState();
      expect(state.error).toBe('Erreur chargement devises');
    });
  });

  describe('validerApport', () => {
    beforeEach(() => {
      useApportCoffreStore.setState({
        devises: MOCK_DEVISES_AUTORISEES,
        deviseSelectionnee: 'EUR',
        montantSaisi: 100,
      });
    });

    it('should reject apport when montant is zero', async () => {
      const { validerApport } = useApportCoffreStore.getState();

      await validerApport('EUR', 0, 'O');

      const state = useApportCoffreStore.getState();
      expect(state.error).toBe('Le montant doit être supérieur à zéro');
      expect(state.isExecuting).toBe(false);
      expect(apiClient.post).not.toHaveBeenCalled();
    });

    it('should reject apport when montant is negative', async () => {
      const { validerApport } = useApportCoffreStore.getState();

      await validerApport('EUR', -50, 'F');

      const state = useApportCoffreStore.getState();
      expect(state.error).toBe('Le montant doit être supérieur à zéro');
      expect(state.isExecuting).toBe(false);
    });

    it('should reject apport when devise is not authorized', async () => {
      const { validerApport } = useApportCoffreStore.getState();

      await validerApport('CHF', 100, 'G');

      const state = useApportCoffreStore.getState();
      expect(state.error).toBe('Devise non autorisée');
      expect(state.isExecuting).toBe(false);
      expect(apiClient.post).not.toHaveBeenCalled();
    });

    it('should validate apport successfully with mock API', async () => {
      const { validerApport } = useApportCoffreStore.getState();

      await validerApport('EUR', 100, 'O');

      const state = useApportCoffreStore.getState();
      expect(state.error).toBeNull();
      expect(state.isExecuting).toBe(false);
      expect(state.deviseSelectionnee).toBeNull();
      expect(state.montantSaisi).toBe(0);
      expect(apiClient.post).not.toHaveBeenCalled();
    });

    it('should validate apport successfully with real API', async () => {
      useDataSourceStore.setState({ isRealApi: true });
      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: { data: MOCK_APPORT_RESPONSE } as ApiResponse<ApportCoffreResponse>,
      } as never);

      const { validerApport } = useApportCoffreStore.getState();

      await validerApport('USD', 250.5, 'F');

      const state = useApportCoffreStore.getState();
      expect(apiClient.post).toHaveBeenCalledWith('/api/caisse/operations/apport-coffre', {
        deviseCode: 'USD',
        montant: 250.5,
        context: 'F',
      });
      expect(state.error).toBeNull();
      expect(state.isExecuting).toBe(false);
      expect(state.deviseSelectionnee).toBeNull();
      expect(state.montantSaisi).toBe(0);
    });

    it('should handle API error when success is false', async () => {
      useDataSourceStore.setState({ isRealApi: true });
      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: { data: { success: false, montantCoffre: 0 } } as ApiResponse<ApportCoffreResponse>,
      } as never);

      const { validerApport } = useApportCoffreStore.getState();

      await validerApport('EUR', 100, 'G');

      const state = useApportCoffreStore.getState();
      expect(state.error).toBe('Échec enregistrement apport');
      expect(state.isExecuting).toBe(false);
    });

    it('should handle API network error during validation', async () => {
      useDataSourceStore.setState({ isRealApi: true });
      vi.mocked(apiClient.post).mockRejectedValueOnce(new Error('Timeout'));

      const { validerApport } = useApportCoffreStore.getState();

      await validerApport('GBP', 75.25, 'O');

      const state = useApportCoffreStore.getState();
      expect(state.error).toBe('Timeout');
      expect(state.isExecuting).toBe(false);
    });

    it('should handle unknown error type during validation', async () => {
      useDataSourceStore.setState({ isRealApi: true });
      vi.mocked(apiClient.post).mockRejectedValueOnce('unexpected error');

      const { validerApport } = useApportCoffreStore.getState();

      await validerApport('EUR', 100, 'F');

      const state = useApportCoffreStore.getState();
      expect(state.error).toBe('Erreur validation apport');
    });

    it('should set isExecuting to true during validation', async () => {
      let isExecutingDuringCall = false;

      vi.mocked(apiClient.post).mockImplementationOnce(async () => {
        isExecutingDuringCall = useApportCoffreStore.getState().isExecuting;
        return {
          data: { data: MOCK_APPORT_RESPONSE } as ApiResponse<ApportCoffreResponse>,
        } as never;
      });

      useDataSourceStore.setState({ isRealApi: true });
      const { validerApport } = useApportCoffreStore.getState();

      await validerApport('EUR', 100, 'O');

      expect(isExecutingDuringCall).toBe(true);
      expect(useApportCoffreStore.getState().isExecuting).toBe(false);
    });

    it('should accept all context types (O, F, G)', async () => {
      useDataSourceStore.setState({ isRealApi: true });
      vi.mocked(apiClient.post).mockResolvedValue({
        data: { data: MOCK_APPORT_RESPONSE } as ApiResponse<ApportCoffreResponse>,
      } as never);

      const { validerApport } = useApportCoffreStore.getState();

      await validerApport('EUR', 100, 'O');
      expect(apiClient.post).toHaveBeenLastCalledWith(
        '/api/caisse/operations/apport-coffre',
        expect.objectContaining({ context: 'O' }),
      );

      await validerApport('EUR', 100, 'F');
      expect(apiClient.post).toHaveBeenLastCalledWith(
        '/api/caisse/operations/apport-coffre',
        expect.objectContaining({ context: 'F' }),
      );

      await validerApport('EUR', 100, 'G');
      expect(apiClient.post).toHaveBeenLastCalledWith(
        '/api/caisse/operations/apport-coffre',
        expect.objectContaining({ context: 'G' }),
      );
    });
  });

  describe('setDeviseSelectionnee', () => {
    it('should set devise selectionnee', () => {
      const { setDeviseSelectionnee } = useApportCoffreStore.getState();

      setDeviseSelectionnee('USD');

      expect(useApportCoffreStore.getState().deviseSelectionnee).toBe('USD');
    });

    it('should clear devise selectionnee when null', () => {
      useApportCoffreStore.setState({ deviseSelectionnee: 'EUR' });
      const { setDeviseSelectionnee } = useApportCoffreStore.getState();

      setDeviseSelectionnee(null);

      expect(useApportCoffreStore.getState().deviseSelectionnee).toBeNull();
    });
  });

  describe('setMontantSaisi', () => {
    it('should set montant saisi', () => {
      const { setMontantSaisi } = useApportCoffreStore.getState();

      setMontantSaisi(123.45);

      expect(useApportCoffreStore.getState().montantSaisi).toBe(123.45);
    });

    it('should accept zero montant', () => {
      const { setMontantSaisi } = useApportCoffreStore.getState();

      setMontantSaisi(0);

      expect(useApportCoffreStore.getState().montantSaisi).toBe(0);
    });
  });

  describe('setError', () => {
    it('should set error message', () => {
      const { setError } = useApportCoffreStore.getState();

      setError('Test error');

      expect(useApportCoffreStore.getState().error).toBe('Test error');
    });

    it('should clear error when null', () => {
      useApportCoffreStore.setState({ error: 'Previous error' });
      const { setError } = useApportCoffreStore.getState();

      setError(null);

      expect(useApportCoffreStore.getState().error).toBeNull();
    });
  });

  describe('reset', () => {
    it('should reset all state to initial values', () => {
      useApportCoffreStore.setState({
        devises: MOCK_DEVISES_AUTORISEES,
        isExecuting: true,
        error: 'Some error',
        deviseSelectionnee: 'EUR',
        montantSaisi: 250,
      });

      const { reset } = useApportCoffreStore.getState();

      reset();

      const state = useApportCoffreStore.getState();
      expect(state.devises).toEqual([]);
      expect(state.isExecuting).toBe(false);
      expect(state.error).toBeNull();
      expect(state.deviseSelectionnee).toBeNull();
      expect(state.montantSaisi).toBe(0);
    });
  });
});