import { create } from 'zustand';
import type {
  ArticleApport,
  ApportArticlesRequest,
  ApportArticlesResponse,
} from '@/types/apportArticles';
import { apiClient } from '@/services/api/apiClient';
import type { ApiResponse } from '@/services/api/apiClient';
import { useDataSourceStore } from './dataSourceStore';

interface ApportArticlesState {
  articles: ArticleApport[];
  total: number;
  deviseCode: string;
  isExecuting: boolean;
  error: string | null;
  editingIndex: number | null;
}

interface ApportArticlesActions {
  addArticle: (article: Omit<ArticleApport, 'montant'>) => void;
  updateArticle: (
    index: number,
    article: Omit<ArticleApport, 'montant'>
  ) => void;
  removeArticle: (index: number) => void;
  submitApport: (sessionId: string, operateur: string) => Promise<void>;
  reset: () => void;
  calculateTotal: () => void;
  setEditingIndex: (index: number | null) => void;
  setDeviseCode: (code: string) => void;
  setError: (error: string | null) => void;
}

type ApportArticlesStore = ApportArticlesState & ApportArticlesActions;

const _MOCK_ARTICLES: ArticleApport[] = [
  {
    articleCode: 'ART-001',
    libelle: 'Serviette de plage Club Med',
    quantite: 5,
    prixUnitaire: 25.0,
    montant: 125.0,
  },
  {
    articleCode: 'ART-002',
    libelle: 'Parasol couleur',
    quantite: 3,
    prixUnitaire: 45.0,
    montant: 135.0,
  },
  {
    articleCode: 'ART-003',
    libelle: 'Boisson fraiche 50cl',
    quantite: 10,
    prixUnitaire: 5.5,
    montant: 55.0,
  },
  {
    articleCode: 'ART-004',
    libelle: 'Crème solaire SPF50',
    quantite: 8,
    prixUnitaire: 18.0,
    montant: 144.0,
  },
  {
    articleCode: 'ART-005',
    libelle: 'Masque et tuba enfant',
    quantite: 2,
    prixUnitaire: 22.5,
    montant: 45.0,
  },
];

const initialState: ApportArticlesState = {
  articles: [],
  total: 0,
  deviseCode: 'EUR',
  isExecuting: false,
  error: null,
  editingIndex: null,
};

export const useApportArticlesStore = create<ApportArticlesStore>()((set, get) => ({
  ...initialState,

  addArticle: (article) => {
    const montant = article.quantite * article.prixUnitaire;
    const newArticle: ArticleApport = { ...article, montant };
    set((state) => ({
      articles: [...state.articles, newArticle],
    }));
    get().calculateTotal();
  },

  updateArticle: (index, article) => {
    const montant = article.quantite * article.prixUnitaire;
    const updatedArticle: ArticleApport = { ...article, montant };
    set((state) => ({
      articles: state.articles.map((a, i) => (i === index ? updatedArticle : a)),
    }));
    get().calculateTotal();
  },

  removeArticle: (index) => {
    set((state) => ({
      articles: state.articles.filter((_, i) => i !== index),
    }));
    get().calculateTotal();
  },

  submitApport: async (sessionId, operateur) => {
    const { isRealApi } = useDataSourceStore.getState();
    const { articles, deviseCode } = get();

    if (articles.length === 0) {
      set({ error: 'Aucun article à ajouter' });
      return;
    }

    set({ isExecuting: true, error: null });

    if (!isRealApi) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      set({
        articles: [],
        total: 0,
        isExecuting: false,
        editingIndex: null,
      });
      return;
    }

    try {
      const payload: ApportArticlesRequest = {
        sessionId,
        operateur,
        articles,
        dateTime: new Date(),
        deviseCode,
      };

      const response = await apiClient.post<
        ApiResponse<ApportArticlesResponse>
      >('/api/caisse/operations/apport-articles', payload);

      if (response.data.success) {
        set({
          articles: [],
          total: 0,
          editingIndex: null,
        });
      } else {
        set({ error: response.data.error ?? 'Erreur inconnue' });
      }
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : 'Erreur lors de l\'apport articles';
      set({ error: message });
    } finally {
      set({ isExecuting: false });
    }
  },

  reset: () => set({ ...initialState }),

  calculateTotal: () => {
    const { articles } = get();
    const total = articles.reduce((sum, article) => sum + article.montant, 0);
    set({ total });
  },

  setEditingIndex: (index) => set({ editingIndex: index }),

  setDeviseCode: (code) => set({ deviseCode: code }),

  setError: (error) => set({ error }),
}));