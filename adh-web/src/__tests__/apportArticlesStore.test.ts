import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useApportArticlesStore } from '@/stores/apportArticlesStore';
import { useDataSourceStore } from '@/stores/dataSourceStore';
import { apiClient } from '@/services/api/apiClient';
import type {
  ArticleApport,
} from '@/types/apportArticles';

vi.mock('@/services/api/apiClient', () => ({
  apiClient: {
    post: vi.fn(),
  },
}));

vi.mock('@/stores/dataSourceStore', () => ({
  useDataSourceStore: {
    getState: vi.fn(() => ({ isRealApi: false })),
  },
}));

const MOCK_ARTICLE_1: Omit<ArticleApport, 'montant'> = {
  articleCode: 'ART-001',
  libelle: 'Serviette de plage Club Med',
  quantite: 5,
  prixUnitaire: 25.0,
};

const MOCK_ARTICLE_2: Omit<ArticleApport, 'montant'> = {
  articleCode: 'ART-002',
  libelle: 'Parasol couleur',
  quantite: 3,
  prixUnitaire: 45.0,
};

const MOCK_ARTICLE_3: Omit<ArticleApport, 'montant'> = {
  articleCode: 'ART-003',
  libelle: 'Boisson fraiche 50cl',
  quantite: 10,
  prixUnitaire: 5.5,
};

describe('apportArticlesStore', () => {
  beforeEach(() => {
    useApportArticlesStore.getState().reset();
    vi.clearAllMocks();
  });

  describe('addArticle', () => {
    it('should calculate montant correctly and add article to array', () => {
      const store = useApportArticlesStore.getState();

      store.addArticle(MOCK_ARTICLE_1);

      const state = useApportArticlesStore.getState();
      expect(state.articles).toHaveLength(1);
      expect(state.articles[0]).toEqual({
        ...MOCK_ARTICLE_1,
        montant: 125.0,
      });
    });

    it('should recalculate total after adding article', () => {
      const store = useApportArticlesStore.getState();

      store.addArticle(MOCK_ARTICLE_1);

      const state = useApportArticlesStore.getState();
      expect(state.total).toBe(125.0);
    });

    it('should add multiple articles and update total correctly', () => {
      const store = useApportArticlesStore.getState();

      store.addArticle(MOCK_ARTICLE_1);
      store.addArticle(MOCK_ARTICLE_2);

      const state = useApportArticlesStore.getState();
      expect(state.articles).toHaveLength(2);
      expect(state.total).toBe(260.0);
    });

    it('should calculate montant with decimal precision', () => {
      const store = useApportArticlesStore.getState();

      store.addArticle(MOCK_ARTICLE_3);

      const state = useApportArticlesStore.getState();
      expect(state.articles[0].montant).toBe(55.0);
      expect(state.total).toBe(55.0);
    });
  });

  describe('updateArticle', () => {
    it('should calculate new montant and update article at index', () => {
      const store = useApportArticlesStore.getState();
      store.addArticle(MOCK_ARTICLE_1);

      const updatedArticle: Omit<ArticleApport, 'montant'> = {
        ...MOCK_ARTICLE_1,
        quantite: 10,
      };
      store.updateArticle(0, updatedArticle);

      const state = useApportArticlesStore.getState();
      expect(state.articles[0].quantite).toBe(10);
      expect(state.articles[0].montant).toBe(250.0);
    });

    it('should recalculate total after updating article', () => {
      const store = useApportArticlesStore.getState();
      store.addArticle(MOCK_ARTICLE_1);
      store.addArticle(MOCK_ARTICLE_2);

      const updatedArticle: Omit<ArticleApport, 'montant'> = {
        ...MOCK_ARTICLE_2,
        prixUnitaire: 50.0,
      };
      store.updateArticle(1, updatedArticle);

      const state = useApportArticlesStore.getState();
      expect(state.total).toBe(275.0);
    });

    it('should not affect other articles when updating one', () => {
      const store = useApportArticlesStore.getState();
      store.addArticle(MOCK_ARTICLE_1);
      store.addArticle(MOCK_ARTICLE_2);

      const updatedArticle: Omit<ArticleApport, 'montant'> = {
        ...MOCK_ARTICLE_1,
        quantite: 1,
      };
      store.updateArticle(0, updatedArticle);

      const state = useApportArticlesStore.getState();
      expect(state.articles[1]).toEqual({
        ...MOCK_ARTICLE_2,
        montant: 135.0,
      });
    });
  });

  describe('removeArticle', () => {
    it('should remove article from array at index', () => {
      const store = useApportArticlesStore.getState();
      store.addArticle(MOCK_ARTICLE_1);
      store.addArticle(MOCK_ARTICLE_2);

      store.removeArticle(0);

      const state = useApportArticlesStore.getState();
      expect(state.articles).toHaveLength(1);
      expect(state.articles[0].articleCode).toBe('ART-002');
    });

    it('should recalculate total after removing article', () => {
      const store = useApportArticlesStore.getState();
      store.addArticle(MOCK_ARTICLE_1);
      store.addArticle(MOCK_ARTICLE_2);

      store.removeArticle(0);

      const state = useApportArticlesStore.getState();
      expect(state.total).toBe(135.0);
    });

    it('should set total to 0 when removing last article', () => {
      const store = useApportArticlesStore.getState();
      store.addArticle(MOCK_ARTICLE_1);

      store.removeArticle(0);

      const state = useApportArticlesStore.getState();
      expect(state.articles).toHaveLength(0);
      expect(state.total).toBe(0);
    });
  });

  describe('submitApport', () => {
    it('should set error when articles array is empty', async () => {
      const store = useApportArticlesStore.getState();

      await store.submitApport('SESSION-001', 'OPR-01');

      const state = useApportArticlesStore.getState();
      expect(state.error).toBe('Aucun article à ajouter');
      expect(state.isExecuting).toBe(false);
    });

    it('should use mock mode when isRealApi is false', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: false,
      } as never);

      const store = useApportArticlesStore.getState();
      store.addArticle(MOCK_ARTICLE_1);

      await store.submitApport('SESSION-001', 'OPR-01');

      const state = useApportArticlesStore.getState();
      expect(state.articles).toHaveLength(0);
      expect(state.total).toBe(0);
      expect(state.editingIndex).toBe(null);
      expect(apiClient.post).not.toHaveBeenCalled();
    });

    it('should set isExecuting during API call', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: true,
      } as never);
      vi.mocked(apiClient.post).mockResolvedValue({
        data: { success: true, data: { success: true } },
      } as never);

      const store = useApportArticlesStore.getState();
      store.addArticle(MOCK_ARTICLE_1);

      const promise = store.submitApport('SESSION-001', 'OPR-01');

      expect(useApportArticlesStore.getState().isExecuting).toBe(true);

      await promise;

      expect(useApportArticlesStore.getState().isExecuting).toBe(false);
    });

    it('should call API with correct payload when isRealApi is true', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: true,
      } as never);
      vi.mocked(apiClient.post).mockResolvedValue({
        data: { success: true, data: { success: true } },
      } as never);

      const store = useApportArticlesStore.getState();
      store.addArticle(MOCK_ARTICLE_1);
      store.setDeviseCode('USD');

      await store.submitApport('SESSION-001', 'OPR-01');

      expect(apiClient.post).toHaveBeenCalledWith(
        '/api/caisse/operations/apport-articles',
        expect.objectContaining({
          sessionId: 'SESSION-001',
          operateur: 'OPR-01',
          articles: expect.arrayContaining([
            expect.objectContaining({
              articleCode: 'ART-001',
              quantite: 5,
              prixUnitaire: 25.0,
              montant: 125.0,
            }),
          ]),
          deviseCode: 'USD',
          dateTime: expect.any(Date),
        })
      );
    });

    it('should clear articles and total on success', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: true,
      } as never);
      vi.mocked(apiClient.post).mockResolvedValue({
        data: { success: true, data: { success: true } },
      } as never);

      const store = useApportArticlesStore.getState();
      store.addArticle(MOCK_ARTICLE_1);
      store.addArticle(MOCK_ARTICLE_2);

      await store.submitApport('SESSION-001', 'OPR-01');

      const state = useApportArticlesStore.getState();
      expect(state.articles).toHaveLength(0);
      expect(state.total).toBe(0);
      expect(state.editingIndex).toBe(null);
      expect(state.error).toBe(null);
    });

    it('should set error when API returns success false', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: true,
      } as never);
      vi.mocked(apiClient.post).mockResolvedValue({
        data: {
          success: false,
          error: 'Session invalide',
        },
      } as never);

      const store = useApportArticlesStore.getState();
      store.addArticle(MOCK_ARTICLE_1);

      await store.submitApport('SESSION-001', 'OPR-01');

      const state = useApportArticlesStore.getState();
      expect(state.error).toBe('Session invalide');
      expect(state.isExecuting).toBe(false);
    });

    it('should handle API error and set error message', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: true,
      } as never);
      vi.mocked(apiClient.post).mockRejectedValue(
        new Error('Network error')
      );

      const store = useApportArticlesStore.getState();
      store.addArticle(MOCK_ARTICLE_1);

      await store.submitApport('SESSION-001', 'OPR-01');

      const state = useApportArticlesStore.getState();
      expect(state.error).toBe('Network error');
      expect(state.isExecuting).toBe(false);
    });

    it('should handle non-Error exception', async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: true,
      } as never);
      vi.mocked(apiClient.post).mockRejectedValue('Unknown error');

      const store = useApportArticlesStore.getState();
      store.addArticle(MOCK_ARTICLE_1);

      await store.submitApport('SESSION-001', 'OPR-01');

      const state = useApportArticlesStore.getState();
      expect(state.error).toBe("Erreur lors de l'apport articles");
      expect(state.isExecuting).toBe(false);
    });
  });

  describe('reset', () => {
    it('should clear articles array', () => {
      const store = useApportArticlesStore.getState();
      store.addArticle(MOCK_ARTICLE_1);
      store.addArticle(MOCK_ARTICLE_2);

      store.reset();

      const state = useApportArticlesStore.getState();
      expect(state.articles).toHaveLength(0);
    });

    it('should reset total to 0', () => {
      const store = useApportArticlesStore.getState();
      store.addArticle(MOCK_ARTICLE_1);

      store.reset();

      const state = useApportArticlesStore.getState();
      expect(state.total).toBe(0);
    });

    it('should clear error state', () => {
      const store = useApportArticlesStore.getState();
      store.setError('Test error');

      store.reset();

      const state = useApportArticlesStore.getState();
      expect(state.error).toBe(null);
    });

    it('should reset editingIndex to null', () => {
      const store = useApportArticlesStore.getState();
      store.setEditingIndex(2);

      store.reset();

      const state = useApportArticlesStore.getState();
      expect(state.editingIndex).toBe(null);
    });

    it('should reset deviseCode to EUR', () => {
      const store = useApportArticlesStore.getState();
      store.setDeviseCode('USD');

      store.reset();

      const state = useApportArticlesStore.getState();
      expect(state.deviseCode).toBe('EUR');
    });

    it('should reset isExecuting to false', () => {
      const store = useApportArticlesStore.getState();
      useApportArticlesStore.setState({ isExecuting: true });

      store.reset();

      const state = useApportArticlesStore.getState();
      expect(state.isExecuting).toBe(false);
    });
  });

  describe('calculateTotal', () => {
    it('should sum all article montants', () => {
      const store = useApportArticlesStore.getState();
      useApportArticlesStore.setState({
        articles: [
          { ...MOCK_ARTICLE_1, montant: 125.0 },
          { ...MOCK_ARTICLE_2, montant: 135.0 },
          { ...MOCK_ARTICLE_3, montant: 55.0 },
        ],
      });

      store.calculateTotal();

      const state = useApportArticlesStore.getState();
      expect(state.total).toBe(315.0);
    });

    it('should set total to 0 when articles array is empty', () => {
      const store = useApportArticlesStore.getState();
      useApportArticlesStore.setState({ articles: [], total: 100.0 });

      store.calculateTotal();

      const state = useApportArticlesStore.getState();
      expect(state.total).toBe(0);
    });

    it('should handle single article', () => {
      const store = useApportArticlesStore.getState();
      useApportArticlesStore.setState({
        articles: [{ ...MOCK_ARTICLE_1, montant: 125.0 }],
      });

      store.calculateTotal();

      const state = useApportArticlesStore.getState();
      expect(state.total).toBe(125.0);
    });
  });

  describe('setEditingIndex', () => {
    it('should set editingIndex to provided value', () => {
      const store = useApportArticlesStore.getState();

      store.setEditingIndex(3);

      const state = useApportArticlesStore.getState();
      expect(state.editingIndex).toBe(3);
    });

    it('should set editingIndex to null', () => {
      const store = useApportArticlesStore.getState();
      store.setEditingIndex(5);

      store.setEditingIndex(null);

      const state = useApportArticlesStore.getState();
      expect(state.editingIndex).toBe(null);
    });
  });

  describe('setDeviseCode', () => {
    it('should set deviseCode to provided value', () => {
      const store = useApportArticlesStore.getState();

      store.setDeviseCode('USD');

      const state = useApportArticlesStore.getState();
      expect(state.deviseCode).toBe('USD');
    });

    it('should update deviseCode from EUR to GBP', () => {
      const store = useApportArticlesStore.getState();

      store.setDeviseCode('GBP');

      const state = useApportArticlesStore.getState();
      expect(state.deviseCode).toBe('GBP');
    });
  });

  describe('setError', () => {
    it('should set error to provided value', () => {
      const store = useApportArticlesStore.getState();

      store.setError('Test error message');

      const state = useApportArticlesStore.getState();
      expect(state.error).toBe('Test error message');
    });

    it('should clear error by setting to null', () => {
      const store = useApportArticlesStore.getState();
      store.setError('Previous error');

      store.setError(null);

      const state = useApportArticlesStore.getState();
      expect(state.error).toBe(null);
    });
  });
});