// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from "vitest"
import { useSalesTicketPrintStore } from "@/stores/salesTicketPrintStore"
import type { ApiResponse } from "@/services/api/apiClient"
import { apiClient } from "@/services/api/apiClient"
import { useDataSourceStore } from "@/stores/dataSourceStore"
import type { SalesTicket, PaymentMethod, StayDates, TicketReduction } from "@/types/salesTicketPrint"

vi.mock("@/services/api/apiClient")
vi.mock("@/stores/dataSourceStore")

// Mock data constants
const MOCK_TICKET_ID = 12345
const MOCK_REPRINT_MODE = true

const MOCK_TICKET_DATA: SalesTicket = {
  ticketNumber: 12345,
  saleDate: new Date("2024-01-15T14:30:00"),
  totalAmount: 89.50,
  taxAmount: 17.90,
  printerNumber: 1
}

const MOCK_PAYMENT_METHODS: PaymentMethod[] = [
  { code: "CB", label: "Carte Bancaire", amount: 45.50 },
  { code: "ESP", label: "Espèces", amount: 44.00 }
]

const MOCK_STAY_DATES: StayDates = {
  checkInDate: new Date("2024-01-14T15:00:00"),
  checkOutDate: new Date("2024-01-17T11:00:00"),
  consumptionDate: new Date("2024-01-15T19:30:00")
}

const MOCK_REDUCTIONS: TicketReduction[] = [
  { type: "PROMO_WEEKEND", amount: -5.00, percentage: 10 },
  { type: "FIDELITE", amount: -2.50, percentage: null }
]

const MOCK_FOOTER = "Merci de votre visite\nHôtel des Alpes - SIRET: 123 456 789 00012\nTerminal: T001 - Caisse: C001"

describe("salesTicketPrintStore", () => {
  beforeEach(() => {
    useSalesTicketPrintStore.getState().reset()
    vi.clearAllMocks()
  })

  describe("initial state", () => {
    it("should have correct initial state", () => {
      const store = useSalesTicketPrintStore.getState()
      
      expect(store.ticketData).toBeNull()
      expect(store.paymentMethods).toEqual([])
      expect(store.stayDates).toBeNull()
      expect(store.reductions).toEqual([])
      expect(store.isLoading).toBe(false)
      expect(store.isPrinting).toBe(false)
      expect(store.error).toBeNull()
      expect(store.currentPrinterNumber).toBe(1) // Default printer number
    })
  })

  describe("printSalesTicket with real API", () => {
    beforeEach(() => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: true
      } as never)
    })

    it("should print sales ticket successfully", async () => {
      const mockResponse: ApiResponse<unknown> = {
        success: true,
        data: null
      }
      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse)

      const store = useSalesTicketPrintStore.getState()
      await store.printSalesTicket(MOCK_TICKET_ID)

      expect(apiClient.post).toHaveBeenCalledWith("/api/salesTicketPrint/print", {
        ticketId: MOCK_TICKET_ID,
        printerNumber: 1, // Default printer number
        reprint: undefined
      })
      expect(store.isPrinting).toBe(false)
      expect(store.error).toBeNull()
    })

    it("should print sales ticket with reprint mode", async () => {
      const mockResponse: ApiResponse<unknown> = {
        success: true,
        data: null
      }
      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse)

      const store = useSalesTicketPrintStore.getState()
      await store.printSalesTicket(MOCK_TICKET_ID, MOCK_REPRINT_MODE)

      expect(apiClient.post).toHaveBeenCalledWith("/api/salesTicketPrint/print", {
        ticketId: MOCK_TICKET_ID,
        printerNumber: 1,
        reprint: MOCK_REPRINT_MODE
      })
    })

    it("should handle print error", async () => {
      const errorMessage = "Printer offline"
      vi.mocked(apiClient.post).mockRejectedValueOnce(new Error(errorMessage))

      const store = useSalesTicketPrintStore.getState()
      
      try {
        await store.printSalesTicket(MOCK_TICKET_ID)
      } catch {
        // Expected error
      }
      
      const finalState = useSalesTicketPrintStore.getState()
      expect(finalState.error).toBe(errorMessage)
      expect(finalState.isPrinting).toBe(false)
    })

    it("should set loading states during printing", async () => {
      const mockResponse: ApiResponse<unknown> = {
        success: true,
        data: null
      }
      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse)

      const store = useSalesTicketPrintStore.getState()
      const printPromise = store.printSalesTicket(MOCK_TICKET_ID)

      expect(useSalesTicketPrintStore.getState().isPrinting).toBe(true)
      expect(useSalesTicketPrintStore.getState().error).toBeNull()

      await printPromise

      expect(useSalesTicketPrintStore.getState().isPrinting).toBe(false)
    })
  })

  describe("printSalesTicket with mock data", () => {
    beforeEach(() => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: false
      } as never)
    })

    it("should simulate printing with mock data", async () => {
      const store = useSalesTicketPrintStore.getState()
      await store.printSalesTicket(MOCK_TICKET_ID)

      expect(apiClient.post).not.toHaveBeenCalled()
      expect(store.isPrinting).toBe(false)
      expect(store.error).toBeNull()
    })
  })

  describe("loadTicketData with real API", () => {
    beforeEach(() => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: true
      } as never)
    })

    it("should load ticket data successfully", async () => {
      const mockResponse: ApiResponse<SalesTicket> = {
        success: true,
        data: MOCK_TICKET_DATA
      }
      vi.mocked(apiClient.get).mockResolvedValueOnce(mockResponse)

      const store = useSalesTicketPrintStore.getState()
      const result = await store.loadTicketData(MOCK_TICKET_ID)

      expect(apiClient.get).toHaveBeenCalledWith(`/api/salesTicketPrint/ticket/${MOCK_TICKET_ID}`)
      expect(result).toEqual(MOCK_TICKET_DATA)
      
      const finalState = useSalesTicketPrintStore.getState()
      expect(finalState.ticketData).toEqual(MOCK_TICKET_DATA)
      expect(finalState.isLoading).toBe(false)
    })

    it("should handle load ticket data error", async () => {
      const errorMessage = "Ticket not found"
      vi.mocked(apiClient.get).mockRejectedValueOnce(new Error(errorMessage))

      const store = useSalesTicketPrintStore.getState()
      
      try {
        await store.loadTicketData(MOCK_TICKET_ID)
      } catch {
        // Expected error
      }
      
      const finalState = useSalesTicketPrintStore.getState()
      expect(finalState.error).toBe(errorMessage)
      expect(finalState.isLoading).toBe(false)
    })
  })

  describe("loadTicketData with mock data", () => {
    beforeEach(() => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: false
      } as never)
    })

    it("should load mock ticket data", async () => {
      const store = useSalesTicketPrintStore.getState()
      const result = await store.loadTicketData(MOCK_TICKET_ID)

      expect(apiClient.get).not.toHaveBeenCalled()
      expect(result).toEqual(MOCK_TICKET_DATA)
      
      const finalState = useSalesTicketPrintStore.getState()
      expect(finalState.ticketData).toEqual(result)
    })
  })

  describe("loadPaymentMethods with real API", () => {
    beforeEach(() => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: true
      } as never)
    })

    it("should load payment methods successfully", async () => {
      const mockResponse: ApiResponse<PaymentMethod[]> = {
        success: true,
        data: MOCK_PAYMENT_METHODS
      }
      vi.mocked(apiClient.get).mockResolvedValueOnce(mockResponse)

      const store = useSalesTicketPrintStore.getState()
      const result = await store.loadPaymentMethods(MOCK_TICKET_ID)

      expect(apiClient.get).toHaveBeenCalledWith(`/api/salesTicketPrint/paymentMethods/${MOCK_TICKET_ID}`)
      expect(result).toEqual(MOCK_PAYMENT_METHODS)
      
      const finalState = useSalesTicketPrintStore.getState()
      expect(finalState.paymentMethods).toEqual(MOCK_PAYMENT_METHODS)
      expect(finalState.isLoading).toBe(false)
    })

    it("should handle load payment methods error", async () => {
      const errorMessage = "Payment methods unavailable"
      vi.mocked(apiClient.get).mockRejectedValueOnce(new Error(errorMessage))

      const store = useSalesTicketPrintStore.getState()
      
      try {
        await store.loadPaymentMethods(MOCK_TICKET_ID)
      } catch {
        // Expected error
      }
      
      const finalState = useSalesTicketPrintStore.getState()
      expect(finalState.error).toBe(errorMessage)
      expect(finalState.isLoading).toBe(false)
    })
  })

  describe("loadPaymentMethods with mock data", () => {
    beforeEach(() => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: false
      } as never)
    })

    it("should load mock payment methods", async () => {
      const store = useSalesTicketPrintStore.getState()
      const result = await store.loadPaymentMethods(MOCK_TICKET_ID)

      expect(apiClient.get).not.toHaveBeenCalled()
      expect(result).toEqual(MOCK_PAYMENT_METHODS)
      
      const finalState = useSalesTicketPrintStore.getState()
      expect(finalState.paymentMethods).toEqual(result)
    })
  })

  describe("loadStayDates with real API", () => {
    beforeEach(() => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: true
      } as never)
    })

    it("should load stay dates successfully", async () => {
      const mockResponse: ApiResponse<StayDates> = {
        success: true,
        data: MOCK_STAY_DATES
      }
      vi.mocked(apiClient.get).mockResolvedValueOnce(mockResponse)

      const store = useSalesTicketPrintStore.getState()
      const result = await store.loadStayDates(MOCK_TICKET_ID)

      expect(apiClient.get).toHaveBeenCalledWith(`/api/salesTicketPrint/stayDates/${MOCK_TICKET_ID}`)
      expect(result).toEqual(MOCK_STAY_DATES)
      
      const finalState = useSalesTicketPrintStore.getState()
      expect(finalState.stayDates).toEqual(MOCK_STAY_DATES)
      expect(finalState.isLoading).toBe(false)
    })

    it("should handle load stay dates error", async () => {
      const errorMessage = "Stay dates not found"
      vi.mocked(apiClient.get).mockRejectedValueOnce(new Error(errorMessage))

      const store = useSalesTicketPrintStore.getState()
      
      try {
        await store.loadStayDates(MOCK_TICKET_ID)
      } catch {
        // Expected error
      }
      
      const finalState = useSalesTicketPrintStore.getState()
      expect(finalState.error).toBe(errorMessage)
      expect(finalState.isLoading).toBe(false)
    })
  })

  describe("loadStayDates with mock data", () => {
    beforeEach(() => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: false
      } as never)
    })

    it("should load mock stay dates", async () => {
      const store = useSalesTicketPrintStore.getState()
      const result = await store.loadStayDates(MOCK_TICKET_ID)

      expect(apiClient.get).not.toHaveBeenCalled()
      expect(result).toEqual(MOCK_STAY_DATES)
      
      const finalState = useSalesTicketPrintStore.getState()
      expect(finalState.stayDates).toEqual(result)
    })
  })

  describe("printReductions with real API", () => {
    beforeEach(() => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: true
      } as never)
    })

    it("should print reductions successfully", async () => {
      const mockResponse: ApiResponse<TicketReduction[]> = {
        success: true,
        data: MOCK_REDUCTIONS
      }
      vi.mocked(apiClient.get).mockResolvedValueOnce(mockResponse)

      const store = useSalesTicketPrintStore.getState()
      await store.printReductions(MOCK_TICKET_ID)

      expect(apiClient.get).toHaveBeenCalledWith(`/api/salesTicketPrint/reductions/${MOCK_TICKET_ID}`)
      
      const finalState = useSalesTicketPrintStore.getState()
      expect(finalState.reductions).toEqual(MOCK_REDUCTIONS)
      expect(finalState.isPrinting).toBe(false)
    })

    it("should handle print reductions error", async () => {
      const errorMessage = "Cannot load reductions"
      vi.mocked(apiClient.get).mockRejectedValueOnce(new Error(errorMessage))

      const store = useSalesTicketPrintStore.getState()
      
      try {
        await store.printReductions(MOCK_TICKET_ID)
      } catch {
        // Expected error
      }
      
      const finalState = useSalesTicketPrintStore.getState()
      expect(finalState.error).toBe(errorMessage)
      expect(finalState.isPrinting).toBe(false)
    })
  })

  describe("printReductions with mock data", () => {
    beforeEach(() => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: false
      } as never)
    })

    it("should print mock reductions", async () => {
      const store = useSalesTicketPrintStore.getState()
      await store.printReductions(MOCK_TICKET_ID)

      expect(apiClient.get).not.toHaveBeenCalled()
      
      const finalState = useSalesTicketPrintStore.getState()
      expect(finalState.reductions).toEqual(MOCK_REDUCTIONS)
      expect(finalState.isPrinting).toBe(false)
    })
  })

  describe("printTaxDetails with real API", () => {
    beforeEach(() => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: true
      } as never)
    })

    it("should print tax details successfully", async () => {
      const mockResponse: ApiResponse<unknown> = {
        success: true,
        data: null
      }
      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse)

      const store = useSalesTicketPrintStore.getState()
      await store.printTaxDetails(MOCK_TICKET_ID)

      expect(apiClient.post).toHaveBeenCalledWith("/api/salesTicketPrint/print", {
        ticketId: MOCK_TICKET_ID,
        type: "tax_details",
        printerNumber: 1 // Default printer number
      })
      expect(store.isPrinting).toBe(false)
    })

    it("should handle print tax details error", async () => {
      const errorMessage = "Tax calculation error"
      vi.mocked(apiClient.post).mockRejectedValueOnce(new Error(errorMessage))

      const store = useSalesTicketPrintStore.getState()
      
      try {
        await store.printTaxDetails(MOCK_TICKET_ID)
      } catch {
        // Expected error
      }
      
      const finalState = useSalesTicketPrintStore.getState()
      expect(finalState.error).toBe(errorMessage)
      expect(finalState.isPrinting).toBe(false)
    })
  })

  describe("printTaxDetails with mock data", () => {
    beforeEach(() => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: false
      } as never)
    })

    it("should simulate tax details printing with mock data", async () => {
      const store = useSalesTicketPrintStore.getState()
      await store.printTaxDetails(MOCK_TICKET_ID)

      expect(apiClient.post).not.toHaveBeenCalled()
      expect(store.isPrinting).toBe(false)
      expect(store.error).toBeNull()
    })
  })

  describe("createTicketFooter with real API", () => {
    beforeEach(() => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: true
      } as never)
    })

    it("should create ticket footer successfully", async () => {
      const mockResponse: ApiResponse<string> = {
        success: true,
        data: MOCK_FOOTER
      }
      vi.mocked(apiClient.get).mockResolvedValueOnce(mockResponse)

      const store = useSalesTicketPrintStore.getState()
      const result = await store.createTicketFooter(MOCK_TICKET_ID)

      expect(apiClient.get).toHaveBeenCalledWith(`/api/salesTicketPrint/footer/${MOCK_TICKET_ID}`)
      expect(result).toBe(MOCK_FOOTER)
      expect(store.isLoading).toBe(false)
    })

    it("should handle create ticket footer error", async () => {
      const errorMessage = "Footer template error"
      vi.mocked(apiClient.get).mockRejectedValueOnce(new Error(errorMessage))

      const store = useSalesTicketPrintStore.getState()
      
      try {
        await store.createTicketFooter(MOCK_TICKET_ID)
      } catch {
        // Expected error
      }
      
      const finalState = useSalesTicketPrintStore.getState()
      expect(finalState.error).toBe(errorMessage)
      expect(finalState.isLoading).toBe(false)
    })
  })

  describe("createTicketFooter with mock data", () => {
    beforeEach(() => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: false
      } as never)
    })

    it("should create mock ticket footer", async () => {
      const store = useSalesTicketPrintStore.getState()
      const result = await store.createTicketFooter(MOCK_TICKET_ID)

      expect(apiClient.get).not.toHaveBeenCalled()
      expect(result).toBe(MOCK_FOOTER)
      expect(store.isLoading).toBe(false)
    })
  })

  describe("reset", () => {
    it("should reset store to initial state", () => {
      const store = useSalesTicketPrintStore.getState()
      
      // Set some state
      useSalesTicketPrintStore.setState({
        ticketData: MOCK_TICKET_DATA,
        paymentMethods: MOCK_PAYMENT_METHODS,
        stayDates: MOCK_STAY_DATES,
        reductions: MOCK_REDUCTIONS,
        isLoading: true,
        isPrinting: true,
        error: "Some error",
        currentPrinterNumber: 5
      })

      store.reset()

      const resetState = useSalesTicketPrintStore.getState()
      expect(resetState.ticketData).toBeNull()
      expect(resetState.paymentMethods).toEqual([])
      expect(resetState.stayDates).toBeNull()
      expect(resetState.reductions).toEqual([])
      expect(resetState.isLoading).toBe(false)
      expect(resetState.isPrinting).toBe(false)
      expect(resetState.error).toBeNull()
      expect(resetState.currentPrinterNumber).toBe(1)
    })
  })

  describe("printer number business rules", () => {
    beforeEach(() => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: true
      } as never)
    })

    it("should use current printer number in print calls", async () => {
      const mockResponse: ApiResponse<unknown> = {
        success: true,
        data: null
      }
      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse)

      // Set different printer number
      useSalesTicketPrintStore.setState({ currentPrinterNumber: 4 })
      
      const store = useSalesTicketPrintStore.getState()
      await store.printSalesTicket(MOCK_TICKET_ID)

      expect(apiClient.post).toHaveBeenCalledWith("/api/salesTicketPrint/print", {
        ticketId: MOCK_TICKET_ID,
        printerNumber: 4, // Uses updated printer number
        reprint: undefined
      })
    })

    // RM-001: Printer 1 verification
    it("should handle printer number 1", async () => {
      useSalesTicketPrintStore.setState({ currentPrinterNumber: 1 })
      
      const mockResponse: ApiResponse<unknown> = {
        success: true,
        data: null
      }
      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse)

      const store = useSalesTicketPrintStore.getState()
      await store.printSalesTicket(MOCK_TICKET_ID)

      expect(store.currentPrinterNumber).toBe(1)
    })

    // RM-002: Printer 4 verification  
    it("should handle printer number 4", async () => {
      useSalesTicketPrintStore.setState({ currentPrinterNumber: 4 })
      
      const mockResponse: ApiResponse<unknown> = {
        success: true,
        data: null
      }
      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse)

      const store = useSalesTicketPrintStore.getState()
      await store.printSalesTicket(MOCK_TICKET_ID)

      expect(store.currentPrinterNumber).toBe(4)
    })

    // RM-003: Printer 5 verification
    it("should handle printer number 5", async () => {
      useSalesTicketPrintStore.setState({ currentPrinterNumber: 5 })
      
      const mockResponse: ApiResponse<unknown> = {
        success: true,
        data: null
      }
      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse)

      const store = useSalesTicketPrintStore.getState()
      await store.printSalesTicket(MOCK_TICKET_ID)

      expect(store.currentPrinterNumber).toBe(5)
    })

    // RM-004: Printer 8 verification
    it("should handle printer number 8", async () => {
      useSalesTicketPrintStore.setState({ currentPrinterNumber: 8 })
      
      const mockResponse: ApiResponse<unknown> = {
        success: true,
        data: null
      }
      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse)

      const store = useSalesTicketPrintStore.getState()
      await store.printSalesTicket(MOCK_TICKET_ID)

      expect(store.currentPrinterNumber).toBe(8)
    })

    // RM-005: Printer 9 verification
    it("should handle printer number 9", async () => {
      useSalesTicketPrintStore.setState({ currentPrinterNumber: 9 })
      
      const mockResponse: ApiResponse<unknown> = {
        success: true,
        data: null
      }
      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse)

      const store = useSalesTicketPrintStore.getState()
      await store.printSalesTicket(MOCK_TICKET_ID)

      expect(store.currentPrinterNumber).toBe(9)
    })
  })
})