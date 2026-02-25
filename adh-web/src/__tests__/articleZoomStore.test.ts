/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi, type MockedFunction } from "vitest"
import { useArticleZoomStore } from "@/stores/articleZoomStore"
import { useDataSourceStore } from "@/stores/dataSourceStore"
import { apiClient } from "@/services/api/apiClient"
import type { Article, ArticleZoomApiGetArticlesResponse, ArticleZoomApiGetTitleResponse } from "@/types/articleZoom"
import type { ApiResponse } from "@/services/api/apiClient"

vi.mock("@/services/api/apiClient")
vi.mock("@/stores/dataSourceStore")

const mockApiClient = apiClient as { get: MockedFunction<typeof apiClient.get> }
const mockUseDataSourceStore = useDataSourceStore as unknown as { getState: MockedFunction<() => { isRealApi: boolean }> }

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
  }
]

const mockSuccessResponse: ApiResponse<Article[]> = {
  success: true,
  data: mockArticles,
  message: "Success"
}

const mockTitleResponse: ApiResponse<{ title: string }> = {
  success: true,
  data: { title: "Test Title" },
  message: "Success"
}

const mockErrorResponse: ApiResponse<Article[]> = {
  success: false,
  data: null,
  message: "API Error"
}

describe("articleZoomStore", () => {
  beforeEach(() => {
    useArticleZoomStore.getState().reset()
    vi.clearAllMocks()
  })

  describe("validateServiceVillage", () => {
    it("should return service village when not empty", () => {
      const result = useArticleZoomStore.getState().validateServiceVillage("PARIS_01")
      
      expect(result).toBe("PARIS_01")
    })

    it("should return empty string when service village is empty", () => {
      const result = useArticleZoomStore.getState().validateServiceVillage("")
      
      expect(result).toBe("")
    })

    it("should return empty string when service village is only whitespace", () => {
      const result = useArticleZoomStore.getState().validateServiceVillage("   ")
      
      expect(result).toBe("")
    })

    it("should return trimmed service village", () => {
      const result = useArticleZoomStore.getState().validateServiceVillage("  LYON_03  ")
      
      expect(result).toBe("LYON_03")
    })
  })

  describe("checkPassageCondition", () => {
    it("should return true when passage is false", () => {
      const result = useArticleZoomStore.getState().checkPassageCondition(false)
      
      expect(result).toBe(true)
    })

    it("should return false when passage is true", () => {
      const result = useArticleZoomStore.getState().checkPassageCondition(true)
      
      expect(result).toBe(false)
    })
  })

  describe("validateCompositeCondition", () => {
    it("should return true when imputation is VRL and sousImputation is not X", () => {
      const result = useArticleZoomStore.getState().validateCompositeCondition("VRL", "Y")
      
      expect(result).toBe(true)
    })

    it("should return true when imputation is VSL and sousImputation is not X", () => {
      const result = useArticleZoomStore.getState().validateCompositeCondition("VSL", "Z")
      
      expect(result).toBe(true)
    })

    it("should return false when imputation is VRL and sousImputation is X", () => {
      const result = useArticleZoomStore.getState().validateCompositeCondition("VRL", "X")
      
      expect(result).toBe(false)
    })

    it("should return false when imputation is VSL and sousImputation is X", () => {
      const result = useArticleZoomStore.getState().validateCompositeCondition("VSL", "X")
      
      expect(result).toBe(false)
    })

    it("should return true when imputation is not VRL and not VSL", () => {
      const result = useArticleZoomStore.getState().validateCompositeCondition("OTHER", "X")
      
      expect(result).toBe(true)
    })
  })

  describe("loadArticles", () => {
    describe("with real API", () => {
      beforeEach(() => {
        mockUseDataSourceStore.getState.mockReturnValue({ isRealApi: true })
      })

      it("should load articles successfully", async () => {
        mockApiClient.get.mockResolvedValueOnce(mockSuccessResponse)
        
        await useArticleZoomStore.getState().loadArticles()
        const state = useArticleZoomStore.getState()
        
        expect(state.articles).toEqual(mockArticles)
        expect(state.isLoading).toBe(false)
        expect(state.error).toBeNull()
        expect(mockApiClient.get).toHaveBeenCalledWith("/api/articleZoom/articles", { params: {} })
      })

      it("should load articles with search filter", async () => {
        useArticleZoomStore.setState({ searchFilter: "Croissant" })
        mockApiClient.get.mockResolvedValueOnce(mockSuccessResponse)
        
        await useArticleZoomStore.getState().loadArticles()
        
        expect(mockApiClient.get).toHaveBeenCalledWith("/api/articleZoom/articles", { 
          params: { search: "Croissant" } 
        })
      })

      it("should handle API error response", async () => {
        mockApiClient.get.mockResolvedValueOnce(mockErrorResponse)
        
        await useArticleZoomStore.getState().loadArticles()
        const state = useArticleZoomStore.getState()
        
        expect(state.articles).toEqual([])
        expect(state.isLoading).toBe(false)
        expect(state.error).toBe("API Error")
      })

      it("should handle API exception", async () => {
        mockApiClient.get.mockRejectedValueOnce(new Error("Network error"))
        
        await useArticleZoomStore.getState().loadArticles()
        const state = useArticleZoomStore.getState()
        
        expect(state.articles).toEqual([])
        expect(state.isLoading).toBe(false)
        expect(state.error).toBe("Network error")
      })

      it("should set loading state during API call", () => {
        mockApiClient.get.mockReturnValueOnce(new Promise(() => {}))
        
        useArticleZoomStore.getState().loadArticles()
        const state = useArticleZoomStore.getState()
        
        expect(state.isLoading).toBe(true)
        expect(state.error).toBeNull()
      })
    })

    describe("with mock data", () => {
      beforeEach(() => {
        mockUseDataSourceStore.getState.mockReturnValue({ isRealApi: false })
        vi.useFakeTimers()
      })

      afterEach(() => {
        vi.useRealTimers()
      })

      it("should load mock articles without filter", async () => {
        const loadPromise = useArticleZoomStore.getState().loadArticles()
        vi.advanceTimersByTime(300)
        await loadPromise
        
        const state = useArticleZoomStore.getState()
        expect(state.articles).toHaveLength(3)
        expect(state.isLoading).toBe(false)
      })

      it("should filter mock articles by libelle", async () => {
        useArticleZoomStore.setState({ searchFilter: "croissant" })
        
        const loadPromise = useArticleZoomStore.getState().loadArticles()
        vi.advanceTimersByTime(300)
        await loadPromise
        
        const state = useArticleZoomStore.getState()
        expect(state.articles).toHaveLength(1)
        expect(state.articles[0].libelleArticle).toContain("Croissant")
      })

      it("should filter mock articles by code", async () => {
        useArticleZoomStore.setState({ searchFilter: "1001" })
        
        const loadPromise = useArticleZoomStore.getState().loadArticles()
        vi.advanceTimersByTime(300)
        await loadPromise
        
        const state = useArticleZoomStore.getState()
        expect(state.articles).toHaveLength(1)
        expect(state.articles[0].codeArticle).toBe(1001)
      })

      it("should filter mock articles by service village", async () => {
        useArticleZoomStore.setState({ searchFilter: "paris" })
        
        const loadPromise = useArticleZoomStore.getState().loadArticles()
        vi.advanceTimersByTime(300)
        await loadPromise
        
        const state = useArticleZoomStore.getState()
        expect(state.articles).toHaveLength(1)
        expect(state.articles[0].serviceVillage).toBe("PARIS_01")
      })

      it("should return empty array when no matches found", async () => {
        useArticleZoomStore.setState({ searchFilter: "nonexistent" })
        
        const loadPromise = useArticleZoomStore.getState().loadArticles()
        vi.advanceTimersByTime(300)
        await loadPromise
        
        const state = useArticleZoomStore.getState()
        expect(state.articles).toHaveLength(0)
      })
    })
  })

  describe("selectArticle", () => {
    it("should select article successfully", async () => {
      const article = mockArticles[0]
      
      await useArticleZoomStore.getState().selectArticle(article)
      const state = useArticleZoomStore.getState()
      
      expect(state.selectedArticle).toEqual(article)
      expect(state.error).toBeNull()
    })

    it("should handle selection error", async () => {
      const originalSelectArticle = useArticleZoomStore.getState().selectArticle
      useArticleZoomStore.setState({
        selectArticle: vi.fn().mockImplementation(() => {
          throw new Error("Selection failed")
        })
      })
      
      try {
        await useArticleZoomStore.getState().selectArticle(mockArticles[0])
      } catch {
        const state = useArticleZoomStore.getState()
        expect(state.error).toBe("Selection failed")
      }
    })
  })

  describe("loadTitle", () => {
    describe("with real API", () => {
      beforeEach(() => {
        mockUseDataSourceStore.getState.mockReturnValue({ isRealApi: true })
      })

      it("should load title successfully", async () => {
        mockApiClient.get.mockResolvedValueOnce(mockTitleResponse)
        
        await useArticleZoomStore.getState().loadTitle()
        const state = useArticleZoomStore.getState()
        
        expect(state.titreEcran).toBe("Test Title")
        expect(state.error).toBeNull()
        expect(mockApiClient.get).toHaveBeenCalledWith("/api/articleZoom/title")
      })

      it("should handle API error response for title", async () => {
        const errorResponse: ApiResponse<{ title: string }> = {
          success: false,
          data: null,
          message: "Title API Error"
        }
        mockApiClient.get.mockResolvedValueOnce(errorResponse)
        
        await useArticleZoomStore.getState().loadTitle()
        const state = useArticleZoomStore.getState()
        
        expect(state.titreEcran).toBe("Zoom Articles")
        expect(state.error).toBe("Title API Error")
      })

      it("should handle API exception for title", async () => {
        mockApiClient.get.mockRejectedValueOnce(new Error("Title network error"))
        
        await useArticleZoomStore.getState().loadTitle()
        const state = useArticleZoomStore.getState()
        
        expect(state.titreEcran).toBe("Zoom Articles")
        expect(state.error).toBe("Title network error")
      })
    })

    describe("with mock data", () => {
      beforeEach(() => {
        mockUseDataSourceStore.getState.mockReturnValue({ isRealApi: false })
        vi.useFakeTimers()
      })

      afterEach(() => {
        vi.useRealTimers()
      })

      it("should load mock title", async () => {
        const loadPromise = useArticleZoomStore.getState().loadTitle()
        vi.advanceTimersByTime(100)
        await loadPromise
        
        const state = useArticleZoomStore.getState()
        expect(state.titreEcran).toBe("Zoom Articles - Sélection")
      })
    })
  })

  describe("reset", () => {
    it("should reset store to initial state", () => {
      useArticleZoomStore.setState({
        articles: mockArticles,
        isLoading: true,
        error: "Some error",
        selectedArticle: mockArticles[0],
        titreEcran: "Test Title",
        searchFilter: "test"
      })
      
      useArticleZoomStore.getState().reset()
      const state = useArticleZoomStore.getState()
      
      expect(state.articles).toEqual([])
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
      expect(state.selectedArticle).toBeNull()
      expect(state.titreEcran).toBe("")
      expect(state.searchFilter).toBe("")
    })
  })
})