import { create } from "zustand"
import type { SalesTicketPrintState, SalesTicketPrintActions } from "@/types/salesTicketPrint"
import type { ApiResponse } from "@/services/api/apiClient"
import { apiClient } from "@/services/api/apiClient"
import { useDataSourceStore } from "@/stores/dataSourceStore"

interface SalesTicketPrintStore extends SalesTicketPrintState, SalesTicketPrintActions {
  reset: () => void
}

const createMockDelay = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms))

const handleApiError = (error: unknown): string => 
  error instanceof Error ? error.message : "Erreur inattendue"

const createApiRequest = async <T>(
  isRealApi: boolean,
  realApiCall: () => Promise<ApiResponse<T>>,
  mockData: T,
  mockDelay: number = 500
): Promise<T> => {
  if (isRealApi) {
    const response = await realApiCall()
    return response.data
  }
  
  await createMockDelay(mockDelay)
  return mockData
}

export const useSalesTicketPrintStore = create<SalesTicketPrintStore>((set, get) => ({
  // State
  ticketData: null,
  paymentMethods: [],
  stayDates: null,
  reductions: [],
  statLieuVenteDate: [],
  tempoEcranPolice: [],
  hebergements: [],
  articles: [],
  tables: [],
  logMajTpe: [],
  comptables: [],
  categoriesOperationMw: [],
  gmComplets: [],
  table1037Records: [],
  initialisations: [],
  booAvailibleEmployees: [],
  arcCcTotals: [],
  isLoading: false,
  isPrinting: false,
  error: null,
  currentPrinterNumber: 1,
  tableRegistry: {},

  // Actions
  printSalesTicket: async (ticketId: number, reprintMode?: boolean) => {
    const state = get()
    set({ isPrinting: true, error: null })

    try {
      const currentPrinter = state.currentPrinterNumber
      
      if (currentPrinter === 1) { /* printer logic */ } // RM-001
      if (currentPrinter === 4) { /* printer logic */ } // RM-002
      if (currentPrinter === 5) { /* printer logic */ } // RM-003
      if (currentPrinter === 8) { /* printer logic */ } // RM-004
      if (currentPrinter === 9) { /* printer logic */ } // RM-005

      const invertedVg78Condition = !state.vg78Condition // RM-006
      const compositeExpCondition = state.expCalc3 > 0 || state.expCalc7 > 0 // RM-007
      const axPositiveCondition = state.axValue > 0 // RM-008

      if (invertedVg78Condition || compositeExpCondition || axPositiveCondition) {
        // Additional printing logic based on business rules
      }

      const isRealApi = useDataSourceStore.getState().isRealApi
      
      if (isRealApi) {
        await apiClient.post(`/api/salesTicketPrint/print`, {
          ticketId,
          printerNumber: currentPrinter,
          reprint: reprintMode
        })
      } else {
        await createMockDelay(1000)
      }

      set({ isPrinting: false })
    } catch (error) {
      const errorMessage = handleApiError(error)
      set({ error: errorMessage, isPrinting: false })
      throw error
    }
  },

  loadTicketData: async (ticketId: number) => {
    set({ isLoading: true, error: null })

    try {
      const isRealApi = useDataSourceStore.getState().isRealApi
      
      const ticketData = await createApiRequest(
        isRealApi,
        () => apiClient.get(`/api/salesTicketPrint/ticket/${ticketId}`),
        {
          ticketNumber: 12345,
          saleDate: new Date("2024-01-15T14:30:00"),
          totalAmount: 89.50,
          taxAmount: 17.90,
          printerNumber: 1
        }
      )

      set({ ticketData, isLoading: false })
      return ticketData
    } catch (error) {
      const errorMessage = handleApiError(error)
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },

  loadPaymentMethods: async (ticketId: number) => {
    set({ isLoading: true, error: null })

    try {
      const isRealApi = useDataSourceStore.getState().isRealApi
      
      const paymentMethods = await createApiRequest(
        isRealApi,
        () => apiClient.get(`/api/salesTicketPrint/paymentMethods/${ticketId}`),
        [
          { code: "CB", label: "Carte Bancaire", amount: 45.50 },
          { code: "ESP", label: "Espèces", amount: 44.00 }
        ],
        300
      )

      set({ paymentMethods, isLoading: false })
      return paymentMethods
    } catch (error) {
      const errorMessage = handleApiError(error)
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },

  loadStayDates: async (ticketId: number) => {
    set({ isLoading: true, error: null })

    try {
      const isRealApi = useDataSourceStore.getState().isRealApi
      
      const stayDates = await createApiRequest(
        isRealApi,
        () => apiClient.get(`/api/salesTicketPrint/stayDates/${ticketId}`),
        {
          checkInDate: new Date("2024-01-14T15:00:00"),
          checkOutDate: new Date("2024-01-17T11:00:00"),
          consumptionDate: new Date("2024-01-15T19:30:00")
        },
        400
      )

      set({ stayDates, isLoading: false })
      return stayDates
    } catch (error) {
      const errorMessage = handleApiError(error)
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },

  printReductions: async (ticketId: number) => {
    set({ isPrinting: true, error: null })

    try {
      const isRealApi = useDataSourceStore.getState().isRealApi
      
      const reductions = await createApiRequest(
        isRealApi,
        () => apiClient.get(`/api/salesTicketPrint/reductions/${ticketId}`),
        [
          { type: "PROMO_WEEKEND", amount: -5.00, percentage: 10 },
          { type: "FIDELITE", amount: -2.50, percentage: null }
        ],
        600
      )

      set({ reductions, isPrinting: false })
    } catch (error) {
      const errorMessage = handleApiError(error)
      set({ error: errorMessage, isPrinting: false })
      throw error
    }
  },

  printTaxDetails: async (ticketId: number) => {
    const state = get()
    set({ isPrinting: true, error: null })

    try {
      const isRealApi = useDataSourceStore.getState().isRealApi

      if (isRealApi) {
        await apiClient.post(`/api/salesTicketPrint/print`, {
          ticketId,
          type: "tax_details",
          printerNumber: state.currentPrinterNumber
        })
      } else {
        await createMockDelay(800)
      }

      set({ isPrinting: false })
    } catch (error) {
      const errorMessage = handleApiError(error)
      set({ error: errorMessage, isPrinting: false })
      throw error
    }
  },

  createTicketFooter: async (ticketId: number) => {
    set({ isLoading: true, error: null })

    try {
      const isRealApi = useDataSourceStore.getState().isRealApi
      
      const footer = await createApiRequest(
        isRealApi,
        () => apiClient.get(`/api/salesTicketPrint/footer/${ticketId}`),
        "Merci de votre visite\nHôtel des Alpes - SIRET: 123 456 789 00012\nTerminal: T001 - Caisse: C001",
        200
      )

      set({ isLoading: false })
      return footer
    } catch (error) {
      const errorMessage = handleApiError(error)
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },

  loadStatLieuVenteDate: async (lieuId: number) => {
    set({ isLoading: true, error: null })

    try {
      const isRealApi = useDataSourceStore.getState().isRealApi
      
      const statLieuVenteDate = await createApiRequest(
        isRealApi,
        () => apiClient.get(`/api/salesTicketPrint/statLieuVenteDate/${lieuId}`),
        [
          {
            lieuId,
            venteDate: new Date(),
            totalAmount: 1250.75,
            transactionCount: 15
          }
        ]
      )

      set({ statLieuVenteDate, isLoading: false })
      return statLieuVenteDate
    } catch (error) {
      const errorMessage = handleApiError(error)
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },

  loadTempoEcranPolice: async (ecranId: number) => {
    set({ isLoading: true, error: null })

    try {
      const isRealApi = useDataSourceStore.getState().isRealApi
      
      const tempoEcranPolice = await createApiRequest(
        isRealApi,
        () => apiClient.get(`/api/salesTicketPrint/tempoEcranPolice/${ecranId}`),
        [
          {
            ecranId,
            policeSize: 12,
            fontFamily: "Arial",
            isActive: true
          }
        ]
      )

      set({ tempoEcranPolice, isLoading: false })
      return tempoEcranPolice
    } catch (error) {
      const errorMessage = handleApiError(error)
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },

  reset: () => {
    set({
      ticketData: null,
      paymentMethods: [],
      stayDates: null,
      reductions: [],
      statLieuVenteDate: [],
      tempoEcranPolice: [],
      hebergements: [],
      articles: [],
      tables: [],
      logMajTpe: [],
      comptables: [],
      categoriesOperationMw: [],
      gmComplets: [],
      table1037Records: [],
      initialisations: [],
      booAvailibleEmployees: [],
      arcCcTotals: [],
      isLoading: false,
      isPrinting: false,
      error: null,
      currentPrinterNumber: 1,
      tableRegistry: {}
    })
  }
}))