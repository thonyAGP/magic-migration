/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, vi } from "vitest"
import { useGestionCaisseStore } from "@/stores/gestionCaisseStore"
import { useDataSourceStore } from "@/stores/dataSourceStore"
import { apiClient } from "@/services/api/apiClient"
import { SessionStatut, MouvementType } from "@/types/gestionCaisse"
import type { 
  ParametresCaisse, 
  SessionCaisse, 
  SessionConcurrente, 
  MouvementCaisse, 
  DateComptable,
  ApiResponse 
} from "@/types/gestionCaisse"

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

const MOCK_PARAMETRES: ParametresCaisse = {
  caisseId: 1,
  seuilAlerte: 100,
  deviseLocale: "EUR",
  impressionAuto: true
}

const MOCK_SESSION_ACTIVE: SessionCaisse = {
  sessionId: 1,
  dateOuverture: new Date("2024-01-15T08:30:00Z"),
  dateFermeture: null,
  operateurId: 101,
  operateurNom: "Marie Dubois",
  statut: SessionStatut.OUVERT,
  montantOuverture: 500.00,
  montantFermeture: null,
  ecart: null
}

const MOCK_SESSIONS_CONCURRENTES: SessionConcurrente[] = [
  {
    sessionId: 2,
    posteId: "CAISSE_02",
    operateurNom: "Pierre Martin",
    dateOuverture: new Date("2024-01-15T09:00:00Z")
  }
]

const MOCK_MOUVEMENT: MouvementCaisse = {
  mouvementId: 1,
  sessionId: 1,
  type: MouvementType.APPORT,
  deviseCode: "EUR",
  montant: 200.00,
  dateHeure: new Date("2024-01-15T10:15:00Z")
}

const MOCK_DATE_COMPTABLE: DateComptable = {
  date: new Date("2024-01-15"),
  valide: true
}

const MOCK_HISTORIQUE: SessionCaisse[] = [
  {
    sessionId: 10,
    dateOuverture: new Date("2024-01-14T08:30:00Z"),
    dateFermeture: new Date("2024-01-14T18:00:00Z"),
    operateurId: 101,
    operateurNom: "Marie Dubois",
    statut: SessionStatut.FERME,
    montantOuverture: 500.00,
    montantFermeture: 485.50,
    ecart: -14.50
  }
]

describe("gestionCaisseStore", () => {
  beforeEach(() => {
    useGestionCaisseStore.getState().reset()
    vi.clearAllMocks()
    vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: false })
  })

  describe("chargerParametres", () => {
    it("should load parameters successfully with mock data", async () => {
      const store = useGestionCaisseStore.getState()

      await store.chargerParametres()

      const state = useGestionCaisseStore.getState()
      expect(state.parametres).toEqual(MOCK_PARAMETRES)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
    })

    it("should load parameters successfully with real API", async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true })
      const mockResponse: ApiResponse<ParametresCaisse> = {
        success: true,
        data: MOCK_PARAMETRES
      }
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      const store = useGestionCaisseStore.getState()

      await store.chargerParametres()

      expect(apiClient.get).toHaveBeenCalledWith("/api/gestion-caisse/parametres")
      const state = useGestionCaisseStore.getState()
      expect(state.parametres).toEqual(MOCK_PARAMETRES)
      expect(state.isLoading).toBe(false)
    })

    it("should handle API error when loading parameters", async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true })
      const mockResponse: ApiResponse<ParametresCaisse> = {
        success: false,
        error: "Configuration invalide"
      }
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      const store = useGestionCaisseStore.getState()

      await store.chargerParametres()

      const state = useGestionCaisseStore.getState()
      expect(state.error).toBe("Configuration invalide")
      expect(state.parametres).toBeNull()
      expect(state.isLoading).toBe(false)
    })

    it("should handle network error when loading parameters", async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true })
      vi.mocked(apiClient.get).mockRejectedValue(new Error("Network error"))

      const store = useGestionCaisseStore.getState()

      await store.chargerParametres()

      const state = useGestionCaisseStore.getState()
      expect(state.error).toBe("Network error")
      expect(state.isLoading).toBe(false)
    })
  })

  describe("chargerSessionActive", () => {
    it("should load active session successfully with mock data", async () => {
      const store = useGestionCaisseStore.getState()

      await store.chargerSessionActive()

      const state = useGestionCaisseStore.getState()
      expect(state.sessionActive).toEqual(MOCK_SESSION_ACTIVE)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
    })

    it("should load active session successfully with real API", async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true })
      const mockResponse: ApiResponse<SessionCaisse> = {
        success: true,
        data: MOCK_SESSION_ACTIVE
      }
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      const store = useGestionCaisseStore.getState()

      await store.chargerSessionActive()

      expect(apiClient.get).toHaveBeenCalledWith("/api/gestion-caisse/session-active")
      const state = useGestionCaisseStore.getState()
      expect(state.sessionActive).toEqual(MOCK_SESSION_ACTIVE)
      expect(state.isLoading).toBe(false)
    })

    it("should handle API error when loading active session", async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true })
      const mockResponse: ApiResponse<SessionCaisse> = {
        success: false,
        error: "Session non trouvée"
      }
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      const store = useGestionCaisseStore.getState()

      await store.chargerSessionActive()

      const state = useGestionCaisseStore.getState()
      expect(state.error).toBe("Session non trouvée")
      expect(state.sessionActive).toBeNull()
    })
  })

  describe("verifierDateComptable", () => {
    it("should verify date comptable successfully with mock data", async () => {
      const store = useGestionCaisseStore.getState()

      await store.verifierDateComptable()

      const state = useGestionCaisseStore.getState()
      expect(state.dateComptable).toEqual(MOCK_DATE_COMPTABLE)
      expect(state.isLoading).toBe(false)
    })

    it("should verify date comptable successfully with real API", async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true })
      const mockResponse: ApiResponse<DateComptable> = {
        success: true,
        data: MOCK_DATE_COMPTABLE
      }
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      const store = useGestionCaisseStore.getState()

      await store.verifierDateComptable()

      expect(apiClient.get).toHaveBeenCalledWith("/api/gestion-caisse/date-comptable")
      const state = useGestionCaisseStore.getState()
      expect(state.dateComptable).toEqual(MOCK_DATE_COMPTABLE)
    })

    it("should handle invalid date comptable", async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true })
      const mockResponse: ApiResponse<DateComptable> = {
        success: false,
        error: "Journée comptable fermée"
      }
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      const store = useGestionCaisseStore.getState()

      await store.verifierDateComptable()

      const state = useGestionCaisseStore.getState()
      expect(state.error).toBe("Journée comptable fermée")
    })
  })

  describe("controlerCoffre", () => {
    it("should control coffre successfully with mock data", async () => {
      const store = useGestionCaisseStore.getState()

      await store.controlerCoffre()

      const state = useGestionCaisseStore.getState()
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
    })

    it("should control coffre successfully with real API", async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true })
      vi.mocked(apiClient.post).mockResolvedValue({ success: true })

      const store = useGestionCaisseStore.getState()

      await store.controlerCoffre()

      expect(apiClient.post).toHaveBeenCalledWith("/api/gestion-caisse/controler-coffre")
      const state = useGestionCaisseStore.getState()
      expect(state.isLoading).toBe(false)
    })

    it("should handle coffre control error", async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true })
      vi.mocked(apiClient.post).mockRejectedValue(new Error("Coffre inaccessible"))

      const store = useGestionCaisseStore.getState()

      await store.controlerCoffre()

      const state = useGestionCaisseStore.getState()
      expect(state.error).toBe("Coffre inaccessible")
    })
  })

  describe("detecterSessionsConcurrentes", () => {
    it("should detect concurrent sessions successfully", async () => {
      const store = useGestionCaisseStore.getState()

      await store.detecterSessionsConcurrentes()

      const state = useGestionCaisseStore.getState()
      expect(state.sessionsConcurrentes).toHaveLength(2)
      expect(state.sessionsConcurrentes[0]).toMatchObject({
        sessionId: 2,
        posteId: "CAISSE_02",
        operateurNom: "Pierre Martin"
      })
      expect(state.isLoading).toBe(false)
    })

    it("should detect concurrent sessions with real API", async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true })
      const mockResponse: ApiResponse<SessionConcurrente[]> = {
        success: true,
        data: MOCK_SESSIONS_CONCURRENTES
      }
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      const store = useGestionCaisseStore.getState()

      await store.detecterSessionsConcurrentes()

      expect(apiClient.get).toHaveBeenCalledWith("/api/gestion-caisse/sessions-concurrentes")
      const state = useGestionCaisseStore.getState()
      expect(state.sessionsConcurrentes).toEqual(MOCK_SESSIONS_CONCURRENTES)
    })
  })

  describe("ouvrirSession", () => {
    it("should open session successfully with mock data", async () => {
      const store = useGestionCaisseStore.getState()

      await store.ouvrirSession()

      const state = useGestionCaisseStore.getState()
      expect(state.sessionActive).toBeDefined()
      expect(state.sessionActive?.statut).toBe(SessionStatut.OUVERT)
      expect(state.isLoading).toBe(false)
    })

    it("should open session successfully with real API", async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true })
      const mockResponse: ApiResponse<SessionCaisse> = {
        success: true,
        data: MOCK_SESSION_ACTIVE
      }
      vi.mocked(apiClient.post).mockResolvedValue(mockResponse)

      const store = useGestionCaisseStore.getState()

      await store.ouvrirSession()

      expect(apiClient.post).toHaveBeenCalledWith("/api/gestion-caisse/ouvrir-session")
      const state = useGestionCaisseStore.getState()
      expect(state.sessionActive).toEqual(MOCK_SESSION_ACTIVE)
    })

    it("should handle session opening error", async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true })
      const mockResponse: ApiResponse<SessionCaisse> = {
        success: false,
        error: "Clôture en cours"
      }
      vi.mocked(apiClient.post).mockResolvedValue(mockResponse)

      const store = useGestionCaisseStore.getState()

      await store.ouvrirSession()

      const state = useGestionCaisseStore.getState()
      expect(state.error).toBe("Clôture en cours")
      expect(state.sessionActive).toBeNull()
    })
  })

  describe("apportCoffre", () => {
    it("should add coffre contribution successfully", async () => {
      const store = useGestionCaisseStore.getState()

      await store.apportCoffre(200, "EUR")

      const state = useGestionCaisseStore.getState()
      expect(state.mouvements).toHaveLength(1)
      expect(state.mouvements[0].type).toBe(MouvementType.APPORT)
      expect(state.mouvements[0].montant).toBe(200)
      expect(state.mouvements[0].deviseCode).toBe("EUR")
      expect(state.isLoading).toBe(false)
    })

    it("should add coffre contribution with real API", async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true })
      const mockResponse: ApiResponse<MouvementCaisse> = {
        success: true,
        data: MOCK_MOUVEMENT
      }
      vi.mocked(apiClient.post).mockResolvedValue(mockResponse)

      const store = useGestionCaisseStore.getState()

      await store.apportCoffre(200, "EUR")

      expect(apiClient.post).toHaveBeenCalledWith("/api/gestion-caisse/apport-coffre", {
        montant: 200,
        deviseCode: "EUR"
      })
      const state = useGestionCaisseStore.getState()
      expect(state.mouvements).toContain(MOCK_MOUVEMENT)
    })

    it("should handle coffre contribution error", async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true })
      const mockResponse: ApiResponse<MouvementCaisse> = {
        success: false,
        error: "Montant invalide"
      }
      vi.mocked(apiClient.post).mockResolvedValue(mockResponse)

      const store = useGestionCaisseStore.getState()

      await store.apportCoffre(-100, "EUR")

      const state = useGestionCaisseStore.getState()
      expect(state.error).toBe("Montant invalide")
      expect(state.mouvements).toHaveLength(0)
    })
  })

  describe("apportProduit", () => {
    it("should add product contribution successfully", async () => {
      const store = useGestionCaisseStore.getState()

      await store.apportProduit(1, 5)

      const state = useGestionCaisseStore.getState()
      expect(state.mouvements).toHaveLength(1)
      expect(state.mouvements[0].type).toBe(MouvementType.APPORT)
      expect(state.mouvements[0].montant).toBe(5)
      expect(state.mouvements[0].deviseCode).toBe("PRODUIT")
      expect(state.isLoading).toBe(false)
    })

    it("should add product contribution with real API", async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true })
      const mockResponse: ApiResponse<MouvementCaisse> = {
        success: true,
        data: MOCK_MOUVEMENT
      }
      vi.mocked(apiClient.post).mockResolvedValue(mockResponse)

      const store = useGestionCaisseStore.getState()

      await store.apportProduit(1, 5)

      expect(apiClient.post).toHaveBeenCalledWith("/api/gestion-caisse/apport-produit", {
        produitId: 1,
        quantite: 5
      })
    })

    it("should handle product contribution error", async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true })
      vi.mocked(apiClient.post).mockRejectedValue(new Error("Produit introuvable"))

      const store = useGestionCaisseStore.getState()

      await store.apportProduit(999, 1)

      const state = useGestionCaisseStore.getState()
      expect(state.error).toBe("Produit introuvable")
    })
  })

  describe("remiseCoffre", () => {
    it("should add coffre remittance successfully", async () => {
      const store = useGestionCaisseStore.getState()

      await store.remiseCoffre(150, "USD")

      const state = useGestionCaisseStore.getState()
      expect(state.mouvements).toHaveLength(1)
      expect(state.mouvements[0].type).toBe(MouvementType.REMISE)
      expect(state.mouvements[0].montant).toBe(150)
      expect(state.mouvements[0].deviseCode).toBe("USD")
      expect(state.isLoading).toBe(false)
    })

    it("should add coffre remittance with real API", async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true })
      const remiseMouvement = { ...MOCK_MOUVEMENT, type: MouvementType.REMISE }
      const mockResponse: ApiResponse<MouvementCaisse> = {
        success: true,
        data: remiseMouvement
      }
      vi.mocked(apiClient.post).mockResolvedValue(mockResponse)

      const store = useGestionCaisseStore.getState()

      await store.remiseCoffre(150, "USD")

      expect(apiClient.post).toHaveBeenCalledWith("/api/gestion-caisse/remise-coffre", {
        montant: 150,
        deviseCode: "USD"
      })
    })
  })

  describe("fermerSession", () => {
    it("should close session successfully", async () => {
      useGestionCaisseStore.setState({ sessionActive: MOCK_SESSION_ACTIVE })
      const store = useGestionCaisseStore.getState()

      await store.fermerSession()

      const state = useGestionCaisseStore.getState()
      expect(state.sessionActive?.statut).toBe(SessionStatut.FERME)
      expect(state.sessionActive?.dateFermeture).toBeDefined()
      expect(state.sessionActive?.montantFermeture).toBeDefined()
      expect(state.sessionActive?.ecart).toBeDefined()
      expect(state.isLoading).toBe(false)
    })

    it("should close session with real API", async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true })
      const closedSession = { ...MOCK_SESSION_ACTIVE, statut: SessionStatut.FERME }
      const mockResponse: ApiResponse<SessionCaisse> = {
        success: true,
        data: closedSession
      }
      vi.mocked(apiClient.post).mockResolvedValue(mockResponse)

      const store = useGestionCaisseStore.getState()

      await store.fermerSession()

      expect(apiClient.post).toHaveBeenCalledWith("/api/gestion-caisse/fermer-session")
      const state = useGestionCaisseStore.getState()
      expect(state.sessionActive).toEqual(closedSession)
    })

    it("should handle session closing error", async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true })
      const mockResponse: ApiResponse<SessionCaisse> = {
        success: false,
        error: "Écarts non justifiés"
      }
      vi.mocked(apiClient.post).mockResolvedValue(mockResponse)

      const store = useGestionCaisseStore.getState()

      await store.fermerSession()

      const state = useGestionCaisseStore.getState()
      expect(state.error).toBe("Écarts non justifiés")
    })
  })

  describe("consulterHistorique", () => {
    it("should load history successfully", async () => {
      const store = useGestionCaisseStore.getState()

      await store.consulterHistorique()

      const state = useGestionCaisseStore.getState()
      expect(state.historique).toHaveLength(5)
      expect(state.historique[0]).toMatchObject({
        sessionId: 10,
        operateurNom: "Marie Dubois"
      })
      expect(state.showHistoriqueDialog).toBe(true)
      expect(state.isLoading).toBe(false)
    })

    it("should load history with real API", async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true })
      const mockResponse: ApiResponse<SessionCaisse[]> = {
        success: true,
        data: MOCK_HISTORIQUE
      }
      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      const store = useGestionCaisseStore.getState()

      await store.consulterHistorique()

      expect(apiClient.get).toHaveBeenCalledWith("/api/gestion-caisse/historique")
      const state = useGestionCaisseStore.getState()
      expect(state.historique).toEqual(MOCK_HISTORIQUE)
      expect(state.showHistoriqueDialog).toBe(true)
    })
  })

  describe("consulterSession", () => {
    it("should consult session successfully", async () => {
      const store = useGestionCaisseStore.getState()

      await store.consulterSession(10)

      const state = useGestionCaisseStore.getState()
      expect(state.selectedSessionId).toBe(10)
      expect(state.showConsultationDialog).toBe(true)
      expect(state.mouvements).toBeDefined()
      expect(state.isLoading).toBe(false)
    })

    it("should consult session with real API", async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true })
      const sessionResponse: ApiResponse<SessionCaisse> = {
        success: true,
        data: MOCK_SESSION_ACTIVE
      }
      const mouvementsResponse: ApiResponse<MouvementCaisse[]> = {
        success: true,
        data: [MOCK_MOUVEMENT]
      }
      vi.mocked(apiClient.get).mockResolvedValueOnce(sessionResponse).mockResolvedValueOnce(mouvementsResponse)

      const store = useGestionCaisseStore.getState()

      await store.consulterSession(10)

      expect(apiClient.get).toHaveBeenCalledWith("/api/gestion-caisse/session/10")
      expect(apiClient.get).toHaveBeenCalledWith("/api/gestion-caisse/mouvements/10")
      const state = useGestionCaisseStore.getState()
      expect(state.mouvements).toEqual([MOCK_MOUVEMENT])
      expect(state.showConsultationDialog).toBe(true)
    })

    it("should handle session consultation error", async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true })
      const sessionResponse: ApiResponse<SessionCaisse> = {
        success: false,
        error: "Session introuvable"
      }
      const mouvementsResponse: ApiResponse<MouvementCaisse[]> = {
        success: true,
        data: []
      }
      vi.mocked(apiClient.get).mockResolvedValueOnce(sessionResponse).mockResolvedValueOnce(mouvementsResponse)

      const store = useGestionCaisseStore.getState()

      await store.consulterSession(999)

      const state = useGestionCaisseStore.getState()
      expect(state.error).toBe("Session introuvable")
    })
  })

  describe("reimprimerTickets", () => {
    it("should reprint tickets successfully", async () => {
      const store = useGestionCaisseStore.getState()

      await store.reimprimerTickets(10)

      const state = useGestionCaisseStore.getState()
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
    })

    it("should reprint tickets with real API", async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true })
      vi.mocked(apiClient.post).mockResolvedValue({ success: true })

      const store = useGestionCaisseStore.getState()

      await store.reimprimerTickets(10)

      expect(apiClient.post).toHaveBeenCalledWith("/api/gestion-caisse/reimprimer-tickets/10")
      const state = useGestionCaisseStore.getState()
      expect(state.isLoading).toBe(false)
    })

    it("should handle ticket reprint error", async () => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({ isRealApi: true })
      vi.mocked(apiClient.post).mockRejectedValue(new Error("Imprimante hors ligne"))

      const store = useGestionCaisseStore.getState()

      await store.reimprimerTickets(10)

      const state = useGestionCaisseStore.getState()
      expect(state.error).toBe("Imprimante hors ligne")
    })
  })

  describe("dialog state management", () => {
    it("should set historique dialog visibility", () => {
      const store = useGestionCaisseStore.getState()

      store.setShowHistoriqueDialog(true)

      expect(useGestionCaisseStore.getState().showHistoriqueDialog).toBe(true)

      store.setShowHistoriqueDialog(false)

      expect(useGestionCaisseStore.getState().showHistoriqueDialog).toBe(false)
    })

    it("should set consultation dialog visibility", () => {
      useGestionCaisseStore.setState({ selectedSessionId: 10 })
      const store = useGestionCaisseStore.getState()

      store.setShowConsultationDialog(true)

      const state1 = useGestionCaisseStore.getState()
      expect(state1.showConsultationDialog).toBe(true)
      expect(state1.selectedSessionId).toBe(10)

      store.setShowConsultationDialog(false)

      const state2 = useGestionCaisseStore.getState()
      expect(state2.showConsultationDialog).toBe(false)
      expect(state2.selectedSessionId).toBeNull()
    })
  })

  describe("reset", () => {
    it("should reset store to initial state", () => {
      useGestionCaisseStore.setState({
        sessionActive: MOCK_SESSION_ACTIVE,
        parametres: MOCK_PARAMETRES,
        sessionsConcurrentes: MOCK_SESSIONS_CONCURRENTES,
        mouvements: [MOCK_MOUVEMENT],
        historique: MOCK_HISTORIQUE,
        dateComptable: MOCK_DATE_COMPTABLE,
        isLoading: true,
        error: "Some error",
        showHistoriqueDialog: true,
        showConsultationDialog: true,
        selectedSessionId: 10
      })

      const store = useGestionCaisseStore.getState()
      store.reset()

      const state = useGestionCaisseStore.getState()
      expect(state.sessionActive).toBeNull()
      expect(state.parametres).toBeNull()
      expect(state.sessionsConcurrentes).toEqual([])
      expect(state.mouvements).toEqual([])
      expect(state.historique).toEqual([])
      expect(state.dateComptable).toBeNull()
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
      expect(state.showHistoriqueDialog).toBe(false)
      expect(state.showConsultationDialog).toBe(false)
      expect(state.selectedSessionId).toBeNull()
    })
  })
})