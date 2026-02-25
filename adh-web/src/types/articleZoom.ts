// @/types/articleZoom.ts
import type { ApiResponse } from "@/services/api/apiClient"

export interface Article {
  serviceVillage: string | null
  codeArticle: number
  libelleArticle: string
  imputation: number | null
  sousImputation: number | null
  prixUnitaire: number
  masqueMontant: string | null
  passage: boolean
}

export interface ArticleZoomState {
  articles: Article[]
  isLoading: boolean
  error: string | null
  selectedArticle: Article | null
  titreEcran: string
  searchFilter: string
}

export type ArticleZoomAction = {
  validateServiceVillage: (serviceVillage: string) => string
  checkPassageCondition: (passage: boolean) => boolean
  validateCompositeCondition: (imputation: string, sousImputation: string) => boolean
  loadArticles: () => Promise<void>
  selectArticle: (article: Article) => Promise<void>
  loadTitle: () => Promise<void>
}

export type ArticleZoomApiGetArticlesRequest = {
  search?: string
  serviceVillage?: string
}

export type ArticleZoomApiGetArticlesResponse = ApiResponse<Article[]>

export type ArticleZoomApiGetTitleResponse = ApiResponse<{ title: string }>

export const ArticleZoomModalSections = {
  header: ['titleDisplay', 'searchInput'],
  articleGrid: ['dataGrid', 'scrollContainer'],
  footer: ['selectButton', 'quitButton']
} as const