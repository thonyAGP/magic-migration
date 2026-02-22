import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useRaisonsUtilisationStore } from '@/stores/raisonsUtilisationStore';
import { apiClient } from '@/services/api/apiClient';
import { useDataSourceStore } from '@/stores/dataSourceStore';
import type { GetRaisonsUtilisationResponse, ValiderSelectionResponse } from '@/types/raisonsUtilisation';

vi.mock('@/services/api/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock('@/stores/dataSourceStore', () => ({
  useDataSourceStore: {
    getState: vi.fn(() => ({ isRealApi: false })),
  },
}));

const MOCK_RAISONS = [
  {
    idPrimaire: 1,
    idSecondaire: null,
    commentaire: 'Paiement service bar',
    existeRaisonSecondaire: false,
  },
  {
    idPrimaire: 6,
    idSecondaire: 61,
    commentaire: 'Retrait espèces',
    existeRaisonSecondaire: true,
  },
  {
    idPrimaire: 3,
    idSecondaire: null,
    commentaire: 'Paiement boutique',
    existeRaisonSecondaire: false,
  },
] as const;

const MOCK_API_RESPONSE: GetRaisonsUtilisationResponse = {
  success: true,
  message: 'Success',
  data: [...MOCK_RAISONS],
};

const MOCK_VALIDATION_RESPONSE: ValiderSelectionResponse = {
  success: true,
  message: 'Validation réussie',
  data: {
    idPrimaire: 6,
    idSecondaire: 61,
    commentaire: 'Test commentaire',
  },
};

describe('raisonsUtilisationStore', () => {
  beforeEach(() => {
    useRaisonsUtilisationStore.getState().reset();
    vi.clearAllMocks();
    vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: false } as never);
  });

  describe('loadRaisonsUtilisation', () => {
    it('should load and sort raisons in mock mode without filter', async () => {
      const store = useRaisonsUtilisationStore.getState();

      await store.loadRaisonsUtilisation();

      const { raisons, isLoading, error } = useRaisonsUtilisationStore.getState();
      expect(isLoading).toBe(false);
      expect(error).toBe(null);
      expect(raisons).toHaveLength(10);
      expect(raisons[0].idPrimaire).toBe(1);
      expect(raisons[raisons.length - 1].idPrimaire).toBe(10);
    });

    it('should filter raisons by serviceCode in mock mode', async () => {
      const store = useRaisonsUtilisationStore.getState();

      await store.loadRaisonsUtilisation(6);

      const { raisons } = useRaisonsUtilisationStore.getState();
      expect(raisons).toHaveLength(1);
      expect(raisons[0].idPrimaire).toBe(6);
    });

    it('should load raisons from API in real mode', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as never);
      vi.mocked(apiClient.get).mockResolvedValue({ data: MOCK_API_RESPONSE });

      const store = useRaisonsUtilisationStore.getState();
      await store.loadRaisonsUtilisation();

      const { raisons, isLoading, error } = useRaisonsUtilisationStore.getState();
      expect(isLoading).toBe(false);
      expect(error).toBe(null);
      expect(raisons).toHaveLength(3);
      expect(raisons[0].idPrimaire).toBe(1);
      expect(apiClient.get).toHaveBeenCalledWith('/api/raisons-utilisation', { params: undefined });
    });

    it('should call API with serviceCode param in real mode', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as never);
      vi.mocked(apiClient.get).mockResolvedValue({ data: MOCK_API_RESPONSE });

      const store = useRaisonsUtilisationStore.getState();
      await store.loadRaisonsUtilisation(6);

      expect(apiClient.get).toHaveBeenCalledWith('/api/raisons-utilisation', {
        params: { serviceCode: 6 },
      });
    });

    it('should handle API error in real mode', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as never);
      vi.mocked(apiClient.get).mockRejectedValue(new Error('Network error'));

      const store = useRaisonsUtilisationStore.getState();
      await store.loadRaisonsUtilisation();

      const { raisons, isLoading, error } = useRaisonsUtilisationStore.getState();
      expect(isLoading).toBe(false);
      expect(error).toBe('Network error');
      expect(raisons).toEqual([]);
    });

    it('should set loading state during API call', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as never);
      const promise = new Promise((resolve) => setTimeout(resolve, 100));
      vi.mocked(apiClient.get).mockReturnValue(promise as never);

      const store = useRaisonsUtilisationStore.getState();
      const loadPromise = store.loadRaisonsUtilisation();

      expect(useRaisonsUtilisationStore.getState().isLoading).toBe(true);

      await loadPromise;
    });
  });

  describe('selectRaisonPrimaire', () => {
    beforeEach(async () => {
      const store = useRaisonsUtilisationStore.getState();
      await store.loadRaisonsUtilisation();
    });

    it('should select raison primaire without secondary raisons', async () => {
      const store = useRaisonsUtilisationStore.getState();

      await store.selectRaisonPrimaire(1);

      const { selectedRaisonPrimaire, selectedRaisonSecondaire, error } = useRaisonsUtilisationStore.getState();
      expect(selectedRaisonPrimaire).toBe(1);
      expect(selectedRaisonSecondaire).toBe(null);
      expect(error).toBe(null);
    });

    it('should select raison primaire with secondary raisons and reset secondary selection', async () => {
      const store = useRaisonsUtilisationStore.getState();

      await store.selectRaisonPrimaire(6);

      const { selectedRaisonPrimaire, selectedRaisonSecondaire, error } = useRaisonsUtilisationStore.getState();
      expect(selectedRaisonPrimaire).toBe(6);
      expect(selectedRaisonSecondaire).toBe(null);
      expect(error).toBe(null);
    });

    it('should set idSecondaire when raison has no secondary raisons', async () => {
      const store = useRaisonsUtilisationStore.getState();

      await store.selectRaisonPrimaire(5);

      const { selectedRaisonSecondaire } = useRaisonsUtilisationStore.getState();
      expect(selectedRaisonSecondaire).toBe(null);
    });

    it('should handle non-existent raison primaire', async () => {
      const store = useRaisonsUtilisationStore.getState();

      await store.selectRaisonPrimaire(999);

      const { error } = useRaisonsUtilisationStore.getState();
      expect(error).toBe('Raison primaire introuvable');
    });
  });

  describe('selectRaisonSecondaire', () => {
    beforeEach(async () => {
      const store = useRaisonsUtilisationStore.getState();
      await store.loadRaisonsUtilisation();
    });

    it('should select raison secondaire when primary is selected', async () => {
      const store = useRaisonsUtilisationStore.getState();
      await store.selectRaisonPrimaire(6);

      await store.selectRaisonSecondaire(61);

      const { selectedRaisonSecondaire, error } = useRaisonsUtilisationStore.getState();
      expect(selectedRaisonSecondaire).toBe(61);
      expect(error).toBe(null);
    });

    it('should fail when no primary raison selected', async () => {
      const store = useRaisonsUtilisationStore.getState();

      await store.selectRaisonSecondaire(61);

      const { error } = useRaisonsUtilisationStore.getState();
      expect(error).toBe('Aucune raison primaire sélectionnée');
    });

    it('should fail when primary raison has no secondary raisons', async () => {
      const store = useRaisonsUtilisationStore.getState();
      await store.selectRaisonPrimaire(1);

      await store.selectRaisonSecondaire(11);

      const { error } = useRaisonsUtilisationStore.getState();
      expect(error).toBe('Cette raison primaire ne possède pas de raisons secondaires');
    });
  });

  describe('validerSelection', () => {
    beforeEach(async () => {
      const store = useRaisonsUtilisationStore.getState();
      await store.loadRaisonsUtilisation();
      await store.selectRaisonPrimaire(6);
    });

    it('should fail when commentaire is empty', async () => {
      const store = useRaisonsUtilisationStore.getState();
      useRaisonsUtilisationStore.setState({ confirmation: true });

      await store.validerSelection();

      const { error, retourRaison } = useRaisonsUtilisationStore.getState();
      expect(error).toBe('Commentaire requis et confirmation nécessaire avant validation');
      expect(retourRaison).toBe(false);
    });

    it('should fail when confirmation is false', async () => {
      const store = useRaisonsUtilisationStore.getState();
      store.updateCommentaire('Test commentaire');

      await store.validerSelection();

      const { error, retourRaison } = useRaisonsUtilisationStore.getState();
      expect(error).toBe('Commentaire requis et confirmation nécessaire avant validation');
      expect(retourRaison).toBe(false);
    });

    it('should fail when no raison primaire selected', async () => {
      const store = useRaisonsUtilisationStore.getState();
      store.updateCommentaire('Test commentaire');
      useRaisonsUtilisationStore.setState({ confirmation: true, selectedRaisonPrimaire: null });

      await store.validerSelection();

      const { error } = useRaisonsUtilisationStore.getState();
      expect(error).toBe('Aucune raison primaire sélectionnée');
    });

    it('should succeed in mock mode with valid data', async () => {
      const store = useRaisonsUtilisationStore.getState();
      store.updateCommentaire('Test commentaire');
      useRaisonsUtilisationStore.setState({ confirmation: true });

      await store.validerSelection();

      const { confirmation, retourRaison, error } = useRaisonsUtilisationStore.getState();
      expect(confirmation).toBe(true);
      expect(retourRaison).toBe(true);
      expect(error).toBe(null);
    });

    it('should call API in real mode with valid data', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as never);
      vi.mocked(apiClient.post).mockResolvedValue({ data: MOCK_VALIDATION_RESPONSE });

      const store = useRaisonsUtilisationStore.getState();
      store.updateCommentaire('Test commentaire');
      await store.selectRaisonSecondaire(61);
      useRaisonsUtilisationStore.setState({ confirmation: true });

      await store.validerSelection();

      expect(apiClient.post).toHaveBeenCalledWith('/api/raisons-utilisation/valider', {
        commentaire: 'Test commentaire',
        selectedRaisonPrimaire: 6,
        selectedRaisonSecondaire: 61,
      });

      const { confirmation, retourRaison, error } = useRaisonsUtilisationStore.getState();
      expect(confirmation).toBe(true);
      expect(retourRaison).toBe(true);
      expect(error).toBe(null);
    });

    it('should handle API error in real mode', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as never);
      vi.mocked(apiClient.post).mockRejectedValue(new Error('Validation failed'));

      const store = useRaisonsUtilisationStore.getState();
      store.updateCommentaire('Test commentaire');
      useRaisonsUtilisationStore.setState({ confirmation: true });

      await store.validerSelection();

      const { error } = useRaisonsUtilisationStore.getState();
      expect(error).toBe('Validation failed');
    });

    it('should handle API response with success false', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true } as never);
      vi.mocked(apiClient.post).mockResolvedValue({
        data: { success: false, message: 'Custom error', data: null },
      });

      const store = useRaisonsUtilisationStore.getState();
      store.updateCommentaire('Test commentaire');
      useRaisonsUtilisationStore.setState({ confirmation: true });

      await store.validerSelection();

      const { error } = useRaisonsUtilisationStore.getState();
      expect(error).toBe('Custom error');
    });

    it('should trim whitespace from commentaire', async () => {
      const store = useRaisonsUtilisationStore.getState();
      store.updateCommentaire('  Test commentaire  ');
      useRaisonsUtilisationStore.setState({ confirmation: true });

      await store.validerSelection();

      expect(useRaisonsUtilisationStore.getState().commentaireSaisi).toBe('Test commentaire');
    });
  });

  describe('abandonner', () => {
    it('should reset confirmation and selections', async () => {
      const store = useRaisonsUtilisationStore.getState();
      await store.loadRaisonsUtilisation();
      await store.selectRaisonPrimaire(6);
      await store.selectRaisonSecondaire(61);
      store.updateCommentaire('Test');
      useRaisonsUtilisationStore.setState({ confirmation: true, retourRaison: true });

      await store.abandonner();

      const state = useRaisonsUtilisationStore.getState();
      expect(state.confirmation).toBe(false);
      expect(state.retourRaison).toBe(false);
      expect(state.selectedRaisonPrimaire).toBe(null);
      expect(state.selectedRaisonSecondaire).toBe(null);
      expect(state.commentaireSaisi).toBe('');
      expect(state.error).toBe(null);
    });
  });

  describe('updateCommentaire', () => {
    it('should update commentaire and trim whitespace', () => {
      const store = useRaisonsUtilisationStore.getState();

      store.updateCommentaire('  Test commentaire  ');

      const { commentaireSaisi, error } = useRaisonsUtilisationStore.getState();
      expect(commentaireSaisi).toBe('Test commentaire');
      expect(error).toBe(null);
    });

    it('should clear error when updating commentaire', () => {
      useRaisonsUtilisationStore.setState({ error: 'Previous error' });

      const store = useRaisonsUtilisationStore.getState();
      store.updateCommentaire('New comment');

      expect(useRaisonsUtilisationStore.getState().error).toBe(null);
    });
  });

  describe('reset', () => {
    it('should reset all state to initial values', async () => {
      const store = useRaisonsUtilisationStore.getState();
      await store.loadRaisonsUtilisation();
      await store.selectRaisonPrimaire(6);
      store.updateCommentaire('Test');
      useRaisonsUtilisationStore.setState({ confirmation: true, error: 'Some error' });

      store.reset();

      const state = useRaisonsUtilisationStore.getState();
      expect(state.raisons).toEqual([]);
      expect(state.selectedRaisonPrimaire).toBe(null);
      expect(state.selectedRaisonSecondaire).toBe(null);
      expect(state.commentaireSaisi).toBe('');
      expect(state.confirmation).toBe(false);
      expect(state.retourRaison).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(null);
    });
  });
});