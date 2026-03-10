/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from "vitest"
import type { ApiResponse } from "@/services/api/apiClient"
import { apiClient } from "@/services/api/apiClient"
import { useDataSourceStore } from "@/stores/dataSourceStore"
import { useSaisieContenuCaisseStore } from "@/stores/saisieContenuCaisseStore"
import type {
  MontantsComptesResponse,
  GestionDeviseSession,
  GestionArticleSession,
  ValiderRemiseRequest,
  ValiderRemiseResponse,
  GenererPvRequest,
  GenererPvResponse,
  PvComptable
} from "@/types/saisieContenuCaisse"
import { REMISE_TYPES, ANOMALIE_TYPES } from "@/types/saisieContenuCaisse"

vi.mock("@/services/api/apiClient", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn()
  }
}))

vi.mock("@/stores/dataSourceStore", () => ({
  useDataSourceStore: {
    getState: vi.fn(() => ({ isRealApi: false }))
  }
}))

const MOCK_MONTANTS_COMPTES: MontantsComptesResponse = {
  monnaie: 1250.75,
  produits: 45.90,
  cartes: 2340.50,
  cheques: 150.00,
  od: 75.25,
  devises: 890.30
}

const MOCK_DEVISES_SESSION: GestionDeviseSession[] = [
  {
    deviseLocale: "EUR",
    nombreDevises: 15,
    nombreDevisesComptees: 14,
    montantVersementDevises: 890.30
  },
  {
    deviseLocale: "USD",
    nombreDevises: 8,
    nombreDevisesComptees: 8,
    montantVersementDevises: 456.20
  }
]

const MOCK_STOCKS_ARTICLES: GestionArticleSession[] = [
  {
    stockProduit: 25,
    total: 1125.50
  },
  {
    stockProduit: 42,
    total: 2310.75
  }
]

const MOCK_ANOMALIES: PvComptable[] = [
  {
    dateComptable: new Date("2024-01-15"),
    typeAnomalie: ANOMALIE_TYPES.MANQUANT,
    montantEcart: -50.00
  }
]

describe("saisieContenuCaisseStore", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useSaisieContenuCaisseStore.getState().reset()
    vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: false })
  })

  describe("initialiserRemise", () => {
    it("should initialize remise with mock data successfully", async () => {
      const store = useSaisieContenuCaisseStore.getState()
      
      await store.initialiserRemise("SOC001", "EUR", REMISE_TYPES.PRODUIT)
      
      const state = useSaisieContenuCaisseStore.getState()
      
      expect(state.remise).toEqual({
        societe: "SOC001",
        deviseLocale: "EUR",
        typeRemise: REMISE_TYPES.PRODUIT,
        montantCompte: 4752.70,
        montantVersement: 0,
        ecart: 0
      })
      
      expect(state.montantsComptes).toEqual({
        monnaie: 1250.75,
        produits: 45.90,
        cartes: 2340.50,
        cheques: 150.00,
        od: 75.25,
        devises: 890.30
      })
      
      expect(state.montantsSaisis).toEqual({
        monnaie: 0,
        produits: 0,
        cartes: 0,
        cheques: 0,
        od: 0,
        devises: 0
      })
      
      expect(state.devisesSession).toHaveLength(3)
      expect(state.stocksArticles).toHaveLength(3)
      expect(state.anomalies).toHaveLength(2)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
    })

    it("should initialize remise with real API data successfully", async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true })
      vi.mocked(apiClient.get).mockImplementation((url: string) => {
        if (url.includes('/montants-comptes')) {
          return Promise.resolve({
            data: { data: MOCK_MONTANTS_COMPTES }
          } as ApiResponse<MontantsComptesResponse>)
        }
        if (url.includes('/devises-session')) {
          return Promise.resolve({
            data: { data: MOCK_DEVISES_SESSION }
          } as ApiResponse<GestionDeviseSession[]>)
        }
        if (url.includes('/stocks-articles')) {
          return Promise.resolve({
            data: { data: MOCK_STOCKS_ARTICLES }
          } as ApiResponse<GestionArticleSession[]>)
        }
        return Promise.reject(new Error('Unknown endpoint'))
      })

      const store = useSaisieContenuCaisseStore.getState()
      
      await store.initialiserRemise("SOC001", "EUR", REMISE_TYPES.MONNAIE)
      
      const state = useSaisieContenuCaisseStore.getState()
      
      expect(state.remise).toEqual({
        societe: "SOC001",
        deviseLocale: "EUR",
        typeRemise: REMISE_TYPES.MONNAIE,
        montantCompte: 4752.70,
        montantVersement: 0,
        ecart: 0
      })
      
      expect(apiClient.get).toHaveBeenCalledTimes(3)
      expect(apiClient.get).toHaveBeenCalledWith('/api/saisie-contenu-caisse/montants-comptes?societe=SOC001')
      expect(apiClient.get).toHaveBeenCalledWith('/api/saisie-contenu-caisse/devises-session?societe=SOC001')
      expect(apiClient.get).toHaveBeenCalledWith('/api/saisie-contenu-caisse/stocks-articles?societe=SOC001')
      expect(state.isLoading).toBe(false)
    })

    it("should handle initialization error", async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true })
      vi.mocked(apiClient.get).mockRejectedValue(new Error("Network error"))

      const store = useSaisieContenuCaisseStore.getState()
      
      await store.initialiserRemise("SOC001", "EUR", REMISE_TYPES.PRODUIT)
      
      const state = useSaisieContenuCaisseStore.getState()
      
      expect(state.error).toBe("Network error")
      expect(state.isLoading).toBe(false)
      expect(state.remise).toBeNull()
    })

    it("should set loading state during initialization", async () => {
      const store = useSaisieContenuCaisseStore.getState()
      
      const initPromise = store.initialiserRemise("SOC001", "EUR", REMISE_TYPES.PRODUIT)
      
      expect(useSaisieContenuCaisseStore.getState().isLoading).toBe(true)
      
      await initPromise
      
      expect(useSaisieContenuCaisseStore.getState().isLoading).toBe(false)
    })
  })

  describe("saisirMontant", () => {
    beforeEach(async () => {
      const store = useSaisieContenuCaisseStore.getState()
      await store.initialiserRemise("SOC001", "EUR", REMISE_TYPES.PRODUIT)
    })

    it("should save valid amount and calculate ecart", async () => {
      const store = useSaisieContenuCaisseStore.getState()
      
      await store.saisirMontant("monnaie", 1300.00)
      
      const state = useSaisieContenuCaisseStore.getState()
      
      expect(state.montantsSaisis.monnaie).toBe(1300.00)
      expect(state.ecarts.monnaie).toBeCloseTo(49.25, 2)
      expect(state.remise?.montantVersement).toBe(1300.00)
      expect(state.remise?.ecart).toBeCloseTo(49.25, 2)
      expect(state.anomalies).toHaveLength(3)
      expect(state.anomalies[2].typeAnomalie).toBe(ANOMALIE_TYPES.EXCEDENT)
      expect(state.anomalies[2].montantEcart).toBeCloseTo(49.25, 2)
    })

    it("should handle negative ecart and create manquant anomaly", async () => {
      const store = useSaisieContenuCaisseStore.getState()
      
      await store.saisirMontant("monnaie", 1200.00)
      
      const state = useSaisieContenuCaisseStore.getState()
      
      expect(state.ecarts.monnaie).toBeCloseTo(-50.75, 2)
      expect(state.anomalies).toHaveLength(3)
      expect(state.anomalies[2].typeAnomalie).toBe(ANOMALIE_TYPES.MANQUANT)
      expect(state.anomalies[2].montantEcart).toBeCloseTo(50.75, 2)
    })

    it("should not create anomaly for exact amount", async () => {
      const store = useSaisieContenuCaisseStore.getState()
      
      await store.saisirMontant("monnaie", 1250.75)
      
      const state = useSaisieContenuCaisseStore.getState()
      
      expect(state.ecarts.monnaie).toBe(0)
      expect(state.anomalies).toHaveLength(2)
    })

    it("should validate negative amount", async () => {
      const store = useSaisieContenuCaisseStore.getState()
      
      await store.saisirMontant("monnaie", -100)
      
      const state = useSaisieContenuCaisseStore.getState()
      
      expect(state.validationErrors.monnaie).toBe("Le montant doit être positif ou nul")
      expect(state.montantsSaisis.monnaie).toBe(0)
    })

    it("should calculate total amounts correctly with multiple entries", async () => {
      const store = useSaisieContenuCaisseStore.getState()
      
      await store.saisirMontant("monnaie", 1250.75)
      await store.saisirMontant("produits", 50.00)
      await store.saisirMontant("cartes", 2340.50)
      
      const state = useSaisieContenuCaisseStore.getState()
      
      expect(state.remise?.montantVersement).toBe(3641.25)
      expect(state.remise?.ecart).toBeCloseTo(4.10, 2)
    })
  })

  describe("validerRemise", () => {
    beforeEach(async () => {
      const store = useSaisieContenuCaisseStore.getState()
      await store.initialiserRemise("SOC001", "EUR", REMISE_TYPES.PRODUIT)
      await store.saisirMontant("monnaie", 1300.00)
    })

    it("should validate remise with mock data successfully", async () => {
      const store = useSaisieContenuCaisseStore.getState()
      
      await store.validerRemise()
      
      const state = useSaisieContenuCaisseStore.getState()
      
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
      expect(state.stocksArticles[0].stockProduit).toBe(24)
      expect(state.stocksArticles[0].total).toBeCloseTo(1103.0, 1)
    })

    it("should validate remise with real API successfully", async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true })
      
      const mockResponse: ValiderRemiseResponse = {
        success: true,
        anomalies: [{
          dateComptable: new Date(),
          typeAnomalie: ANOMALIE_TYPES.EXCEDENT,
          montantEcart: 49.25
        }],
        ecarts: { monnaie: 49.25 }
      }
      
      vi.mocked(apiClient.post).mockResolvedValue({
        data: { data: mockResponse }
      } as ApiResponse<ValiderRemiseResponse>)

      const store = useSaisieContenuCaisseStore.getState()
      
      await store.validerRemise()
      
      const state = useSaisieContenuCaisseStore.getState()
      
      expect(apiClient.post).toHaveBeenCalledWith('/api/saisie-contenu-caisse/valider-remise', {
        societe: "SOC001",
        typeRemise: REMISE_TYPES.PRODUIT,
        montants: {
          monnaie: 1300.00,
          produits: 0,
          cartes: 0,
          cheques: 0,
          od: 0,
          devises: 0
        }
      } as ValiderRemiseRequest)
      
      expect(state.anomalies).toHaveLength(4)
      expect(state.ecarts).toEqual({ monnaie: 49.25 })
      expect(state.isLoading).toBe(false)
    })

    it("should handle validation failure from API", async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true })
      
      const mockResponse: ValiderRemiseResponse = {
        success: false,
        anomalies: [],
        ecarts: {}
      }
      
      vi.mocked(apiClient.post).mockResolvedValue({
        data: { data: mockResponse }
      } as ApiResponse<ValiderRemiseResponse>)

      const store = useSaisieContenuCaisseStore.getState()
      
      await store.validerRemise()
      
      const state = useSaisieContenuCaisseStore.getState()
      
      expect(state.error).toBe("Échec de la validation de la remise")
      expect(state.isLoading).toBe(false)
    })

    it("should handle no remise initialized", async () => {
      useSaisieContenuCaisseStore.getState().reset()
      
      const store = useSaisieContenuCaisseStore.getState()
      
      await store.validerRemise()
      
      const state = useSaisieContenuCaisseStore.getState()
      
      expect(state.error).toBe("Aucune remise initialisée")
      expect(state.isLoading).toBe(false)
    })

    it("should handle API error during validation", async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true })
      vi.mocked(apiClient.post).mockRejectedValue(new Error("Network error"))

      const store = useSaisieContenuCaisseStore.getState()
      
      await store.validerRemise()
      
      const state = useSaisieContenuCaisseStore.getState()
      
      expect(state.error).toBe("Network error")
      expect(state.isLoading).toBe(false)
    })
  })

  describe("calculerEcarts", () => {
    beforeEach(async () => {
      const store = useSaisieContenuCaisseStore.getState()
      await store.initialiserRemise("SOC001", "EUR", REMISE_TYPES.PRODUIT)
    })

    it("should calculate ecarts for all payment types", () => {
      const store = useSaisieContenuCaisseStore.getState()
      useSaisieContenuCaisseStore.setState({
        montantsSaisis: {
          monnaie: 1300.00,
          produits: 50.00,
          cartes: 2300.00,
          cheques: 150.00,
          od: 80.00,
          devises: 900.00
        }
      })
      
      store.calculerEcarts()
      
      const state = useSaisieContenuCaisseStore.getState()
      
      expect(state.ecarts.monnaie).toBeCloseTo(49.25, 2)
      expect(state.ecarts.produits).toBeCloseTo(4.10, 2)
      expect(state.ecarts.cartes).toBeCloseTo(-40.50, 2)
      expect(state.ecarts.cheques).toBeCloseTo(0, 2)
      expect(state.ecarts.od).toBeCloseTo(4.75, 2)
      expect(state.ecarts.devises).toBeCloseTo(9.70, 2)
      
      expect(state.remise?.ecart).toBeCloseTo(27.30, 2)
    })

    it("should handle missing amounts as zero", () => {
      const store = useSaisieContenuCaisseStore.getState()
      
      store.calculerEcarts()
      
      const state = useSaisieContenuCaisseStore.getState()
      
      expect(state.ecarts).toEqual({
        monnaie: -1250.75,
        produits: -45.90,
        cartes: -2340.50,
        cheques: -150.00,
        od: -75.25,
        devises: -890.30
      })
      
      expect(state.remise?.ecart).toBe(-4752.70)
    })
  })

  describe("chargerMontantsComptes", () => {
    it("should load montants with mock data successfully", async () => {
      const store = useSaisieContenuCaisseStore.getState()
      
      await store.chargerMontantsComptes("SOC001")
      
      const state = useSaisieContenuCaisseStore.getState()
      
      expect(state.montantsComptes).toEqual({
        monnaie: 1250.75,
        produits: 45.90,
        cartes: 2340.50,
        cheques: 150.00,
        od: 75.25,
        devises: 890.30
      })
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
    })

    it("should load montants with real API successfully", async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true })
      vi.mocked(apiClient.get).mockResolvedValue({
        data: { data: MOCK_MONTANTS_COMPTES }
      } as ApiResponse<MontantsComptesResponse>)

      const store = useSaisieContenuCaisseStore.getState()
      
      await store.chargerMontantsComptes("SOC002")
      
      const state = useSaisieContenuCaisseStore.getState()
      
      expect(apiClient.get).toHaveBeenCalledWith('/api/saisie-contenu-caisse/montants-comptes?societe=SOC002')
      expect(state.montantsComptes).toEqual({
        monnaie: 1250.75,
        produits: 45.90,
        cartes: 2340.50,
        cheques: 150.00,
        od: 75.25,
        devises: 890.30
      })
    })

    it("should handle loading error", async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true })
      vi.mocked(apiClient.get).mockRejectedValue(new Error("Database error"))

      const store = useSaisieContenuCaisseStore.getState()
      
      await store.chargerMontantsComptes("SOC001")
      
      const state = useSaisieContenuCaisseStore.getState()
      
      expect(state.error).toBe("Database error")
      expect(state.isLoading).toBe(false)
    })
  })

  describe("genererPvComptable", () => {
    it("should generate PV with mock data", async () => {
      const store = useSaisieContenuCaisseStore.getState()
      
      await store.genererPvComptable(ANOMALIE_TYPES.MANQUANT, 75.50)
      
      const state = useSaisieContenuCaisseStore.getState()
      
      expect(state.anomalies).toHaveLength(1)
      expect(state.anomalies[0].typeAnomalie).toBe(ANOMALIE_TYPES.MANQUANT)
      expect(state.anomalies[0].montantEcart).toBe(75.50)
      expect(state.anomalies[0].dateComptable).toBeInstanceOf(Date)
    })

    it("should generate PV with real API", async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true })
      
      const mockResponse: GenererPvResponse = {
        pvId: 12345,
        dateCreation: new Date()
      }
      
      vi.mocked(apiClient.post).mockResolvedValue({
        data: { data: mockResponse }
      } as ApiResponse<GenererPvResponse>)

      const store = useSaisieContenuCaisseStore.getState()
      
      await store.genererPvComptable(ANOMALIE_TYPES.EXCEDENT, 100.00)
      
      const state = useSaisieContenuCaisseStore.getState()
      
      expect(apiClient.post).toHaveBeenCalledWith('/api/saisie-contenu-caisse/generer-pv', {
        typeAnomalie: ANOMALIE_TYPES.EXCEDENT,
        montantEcart: 100.00,
        dateComptable: expect.any(Date)
      })
      
      expect(state.anomalies).toHaveLength(1)
      expect(state.anomalies[0].typeAnomalie).toBe(ANOMALIE_TYPES.EXCEDENT)
      expect(state.anomalies[0].montantEcart).toBe(100.00)
    })

    it("should handle PV generation error", async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true })
      vi.mocked(apiClient.post).mockRejectedValue(new Error("Server error"))

      const store = useSaisieContenuCaisseStore.getState()
      
      await store.genererPvComptable(ANOMALIE_TYPES.DIFFERENCE, 25.00)
      
      const state = useSaisieContenuCaisseStore.getState()
      
      expect(state.error).toBe("Server error")
    })
  })

  describe("mettreAJourStocks", () => {
    beforeEach(async () => {
      const store = useSaisieContenuCaisseStore.getState()
      await store.initialiserRemise("SOC001", "EUR", REMISE_TYPES.PRODUIT)
    })

    it("should update stocks with mock data", async () => {
      const store = useSaisieContenuCaisseStore.getState()
      
      await store.mettreAJourStocks()
      
      const state = useSaisieContenuCaisseStore.getState()
      
      expect(state.stocksArticles[0].stockProduit).toBe(24)
      expect(state.stocksArticles[0].total).toBeCloseTo(1103.0, 1)
      expect(state.stocksArticles[1].stockProduit).toBe(41)
      expect(state.stocksArticles[1].total).toBeCloseTo(2264.5, 1)
    })

    it("should update stocks with real API", async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true })
      vi.mocked(apiClient.post).mockResolvedValue({ data: {} })

      const store = useSaisieContenuCaisseStore.getState()
      
      await store.mettreAJourStocks()
      
      const state = useSaisieContenuCaisseStore.getState()
      
      expect(apiClient.post).toHaveBeenCalledWith('/api/saisie-contenu-caisse/maj-stocks', {})
      expect(state.stocksArticles[0].stockProduit).toBe(24)
    })

    it("should handle stock update error", async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true })
      vi.mocked(apiClient.post).mockRejectedValue(new Error("Update failed"))

      const store = useSaisieContenuCaisseStore.getState()
      
      await store.mettreAJourStocks()
      
      const state = useSaisieContenuCaisseStore.getState()
      
      expect(state.error).toBe("Update failed")
    })

    it("should ensure stock cannot go below zero", async () => {
      useSaisieContenuCaisseStore.setState({
        stocksArticles: [{
          stockProduit: 0,
          total: 100.00
        }]
      })
      
      const store = useSaisieContenuCaisseStore.getState()
      
      await store.mettreAJourStocks()
      
      const state = useSaisieContenuCaisseStore.getState()
      
      expect(state.stocksArticles[0].stockProduit).toBe(0)
      expect(state.stocksArticles[0].total).toBe(98.00)
    })
  })

  describe("reset", () => {
    it("should reset all state to initial values", async () => {
      const store = useSaisieContenuCaisseStore.getState()
      await store.initialiserRemise("SOC001", "EUR", REMISE_TYPES.PRODUIT)
      await store.saisirMontant("monnaie", 1300.00)
      
      store.reset()
      
      const state = useSaisieContenuCaisseStore.getState()
      
      expect(state.remise).toBeNull()
      expect(state.montantsSaisis).toEqual({})
      expect(state.montantsComptes).toEqual({})
      expect(state.ecarts).toEqual({})
      expect(state.anomalies).toEqual([])
      expect(state.stocksArticles).toEqual([])
      expect(state.devisesSession).toEqual([])
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
      expect(state.validationErrors).toEqual({})
      expect(state.coffre2Ouvert).toBe(false)
      expect(state.uniBI).toBe("UNI")
    })
  })

  describe("business rules validation", () => {
    it("should enforce RM-001: special handling when param quand != 'P'", async () => {
      const store = useSaisieContenuCaisseStore.getState()
      await store.initialiserRemise("SOC001", "EUR", REMISE_TYPES.MONNAIE)
      await store.saisirMontant("monnaie", 1300.00)
      
      await store.validerRemise()
      
      const state = useSaisieContenuCaisseStore.getState()
      expect(state.anomalies.length).toBeGreaterThan(0)
    })

    it("should calculate montant compte as sum of all payment types", async () => {
      const store = useSaisieContenuCaisseStore.getState()
      
      await store.initialiserRemise("SOC001", "EUR", REMISE_TYPES.PRODUIT)
      
      const state = useSaisieContenuCaisseStore.getState()
      const expectedTotal = 1250.75 + 45.90 + 2340.50 + 150.00 + 75.25 + 890.30
      
      expect(state.remise?.montantCompte).toBe(expectedTotal)
    })

    it("should validate montant >= 0 business rule", async () => {
      const store = useSaisieContenuCaisseStore.getState()
      await store.initialiserRemise("SOC001", "EUR", REMISE_TYPES.PRODUIT)
      
      await store.saisirMontant("monnaie", -50)
      
      const state = useSaisieContenuCaisseStore.getState()
      expect(state.validationErrors.monnaie).toBe("Le montant doit être positif ou nul")
    })

    it("should create anomaly only when ecart != 0", async () => {
      const store = useSaisieContenuCaisseStore.getState()
      await store.initialiserRemise("SOC001", "EUR", REMISE_TYPES.PRODUIT)
      
      const initialAnomalies = useSaisieContenuCaisseStore.getState().anomalies.length
      
      await store.saisirMontant("monnaie", 1250.75)
      
      const state = useSaisieContenuCaisseStore.getState()
      expect(state.anomalies.length).toBe(initialAnomalies)
    })
  })
})