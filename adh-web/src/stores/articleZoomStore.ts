import { create } from "zustand"
import type { ArticleZoomState, ArticleZoomAction, Article, ArticleZoomApiGetArticlesRequest, ArticleZoomApiGetArticlesResponse, ArticleZoomApiGetTitleResponse } from "@/types/articleZoom"
import { useDataSourceStore } from "@/stores/dataSourceStore"
import { apiClient } from "@/services/api/apiClient"

const mockArticles: Article[] = [
  {
    serviceVillage: "PARIS_01",
    codeArticle: 1001,
    libelleArticle: "Croissant Beurre",
    imputation: 701,
    sousImputation: 10,
    prixUnitaire: 1.50,
    masqueMontant: "##.##",
    passage: true
  },
  {
    serviceVillage: "LYON_03",
    codeArticle: 1002,
    libelleArticle: "Pain de Campagne 500g",
    imputation: 702,
    sousImputation: 20,
    prixUnitaire: 3.20,
    masqueMontant: "#.##",
    passage: false
  },
  {
    serviceVillage: null,
    codeArticle: 2001,
    libelleArticle: "Café Espresso",
    imputation: null,
    sousImputation: null,
    prixUnitaire: 2.10,
    masqueMontant: null,
    passage: true
  },
  {
    serviceVillage: "MARSEILLE_02",
    codeArticle: 3001,
    libelleArticle: "Sandwich Jambon Beurre",
    imputation: 703,
    sousImputation: 15,
    prixUnitaire: 4.80,
    masqueMontant: "##.##",
    passage: false
  },
  {
    serviceVillage: "TOULOUSE_05",
    codeArticle: 4001,
    libelleArticle: "Pâtisserie Éclair Chocolat",
    imputation: 704,
    sousImputation: 25,
    prixUnitaire: 3.50,
    masqueMontant: "#.##",
    passage: true
  }
]

export const useArticleZoomStore = create<ArticleZoomState & ArticleZoomAction>()((set, get) => ({
  articles: [],
  isLoading: false,
  error: null,
  selectedArticle: null,
  titreEcran: "",
  searchFilter: "",

  validateServiceVillage: (serviceVillage: string): string => {
    return serviceVillage.trim() !== "" ? serviceVillage : ""
  },

  checkPassageCondition: (passage: boolean): boolean => {
    return !passage
  },

  validateCompositeCondition: (imputation: string, sousImputation: string): boolean => {
    const isVrlOrVsl = imputation === "VRL" || imputation === "VSL"
    const isNotX = sousImputation !== "X"
    const isNotVrlAndNotVsl = imputation !== "VRL" && imputation !== "VSL"
    
    return (isVrlOrVsl && isNotX) || isNotVrlAndNotVsl
  },

  loadArticles: async (): Promise<void> => {
    set({ isLoading: true, error: null })
    
    try {
      if (useDataSourceStore.getState().isRealApi) {
        const { searchFilter } = get()
        const params: ArticleZoomApiGetArticlesRequest = {}
        
        if (searchFilter.trim() !== "") {
          params.search = searchFilter
        }
        
        const response = await apiClient.get<ArticleZoomApiGetArticlesResponse>("/api/articleZoom/articles", { params })
        
        if (response.success && response.data) {
          set({ articles: response.data, isLoading: false })
        } else {
          set({ error: response.message || "Failed to load articles", isLoading: false })
        }
      } else {
        const { searchFilter } = get()
        let filteredArticles = mockArticles
        
        if (searchFilter.trim() !== "") {
          const searchTerm = searchFilter.toLowerCase()
          filteredArticles = mockArticles.filter(article => 
            article.libelleArticle.toLowerCase().includes(searchTerm) ||
            article.codeArticle.toString().includes(searchTerm) ||
            (article.serviceVillage && article.serviceVillage.toLowerCase().includes(searchTerm))
          )
        }
        
        setTimeout(() => {
          set({ articles: filteredArticles, isLoading: false })
        }, 300)
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Unknown error occurred"
      set({ error: errorMessage, isLoading: false })
    }
  },

  selectArticle: async (article: Article): Promise<void> => {
    try {
      set({ selectedArticle: article })
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Failed to select article"
      set({ error: errorMessage })
    }
  },

  loadTitle: async (): Promise<void> => {
    try {
      if (useDataSourceStore.getState().isRealApi) {
        const response = await apiClient.get<ArticleZoomApiGetTitleResponse>("/api/articleZoom/title")
        
        if (response.success && response.data) {
          set({ titreEcran: response.data.title })
        } else {
          set({ error: response.message || "Failed to load title", titreEcran: "Zoom Articles" })
        }
      } else {
        setTimeout(() => {
          set({ titreEcran: "Zoom Articles - Sélection" })
        }, 100)
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Failed to load title"
      set({ error: errorMessage, titreEcran: "Zoom Articles" })
    }
  },

  reset: (): void => {
    set({
      articles: [],
      isLoading: false,
      error: null,
      selectedArticle: null,
      titreEcran: "",
      searchFilter: ""
    })
  }
}))