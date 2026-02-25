import { apiClient } from "@/services/api/apiClient"
import type { ApiResponse } from "@/services/api/apiClient"
import type { 
  ArticleZoomApiGetArticlesRequest, 
  ArticleZoomApiGetArticlesResponse,
  ArticleZoomApiGetTitleResponse,
  Article
} from "@/types/articleZoom"
import { useDataSourceStore } from "@/stores/dataSourceStore"

export const articleZoomService = {
  getArticles: async (params?: ArticleZoomApiGetArticlesRequest): Promise<ArticleZoomApiGetArticlesResponse> => {
    const isRealApi = useDataSourceStore.getState().isRealApi

    if (isRealApi) {
      return await apiClient.get<ArticleZoomApiGetArticlesResponse>('/api/articleZoom/articles', {
        params
      })
    }

    // Mock implementation for local development
    return {
      data: [
        {
          serviceVillage: 'Mock Service',
          codeArticle: 1,
          libelleArticle: 'Mock Article',
          imputation: 100,
          sousImputation: 50,
          prixUnitaire: 10.50,
          masqueMontant: null,
          passage: true
        }
      ],
      status: 200,
      message: 'Success'
    }
  },

  getTitle: async (): Promise<ArticleZoomApiGetTitleResponse> => {
    const isRealApi = useDataSourceStore.getState().isRealApi

    if (isRealApi) {
      return await apiClient.get<ArticleZoomApiGetTitleResponse>('/api/articleZoom/title')
    }

    // Mock implementation for local development
    return {
      data: { title: 'Article Zoom Screen' },
      status: 200,
      message: 'Success'
    }
  }
}