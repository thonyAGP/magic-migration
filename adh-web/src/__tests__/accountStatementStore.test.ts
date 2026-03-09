// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from "vitest"
import { useAccountStatementStore } from "@/stores/accountStatementStore"
import { useDataSourceStore } from "@/stores/dataSourceStore"
import { apiClient } from "@/services/api/apiClient"
import type { ApiResponse } from "@/services/api/apiClient"
import type { AccountStatement, AuditLog } from "@/types/accountStatement"

vi.mock("@/stores/dataSourceStore")
vi.mock("@/services/api/apiClient")

const MOCK_ACCOUNT_STATEMENTS: AccountStatement[] = [
  {
    memberCode: "ADH001",
    memberName: "Durand Pierre",
    memberNumber: "12345",
    currency: "EUR",
    accountingPeriod: "2024-01",
    printMask: "STANDARD",
    editionLabel: "Extrait de compte - Club Med"
  },
  {
    memberCode: "ADH002",
    memberName: "Martin Sophie", 
    memberNumber: "12346",
    currency: "USD",
    accountingPeriod: "2024-01",
    printMask: "GIFT_PASS",
    editionLabel: "Gift Pass Statement"
  }
]

const MOCK_AUDIT_LOGS: AuditLog[] = [
  {
    id: 1,
    operation: "PRINT_STATEMENT",
    timestamp: new Date("2024-01-15T10:30:00Z"),
    memberCode: "ADH001",
    printerNumber: 1
  },
  {
    id: 2,
    operation: "PRINT_STATEMENT", 
    timestamp: new Date("2024-01-16T14:20:00Z"),
    memberCode: "ADH002",
    printerNumber: 6
  }
]

describe("accountStatementStore", () => {
  let store: ReturnType<typeof useAccountStatementStore>
  const gs = () => useAccountStatementStore.getState()

  beforeEach(() => {
    store = useAccountStatementStore.getState()
    useAccountStatementStore.setState({
      accountStatements: [],
      auditLogs: [],
      isLoading: false,
      error: null,
      currentPrinter: 1,
      isDirectCall: false,
      processingStatus: "idle"
    })
    vi.clearAllMocks()
  })

  describe("validatePrinter1 with real API", () => {
    beforeEach(() => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: true
      } as unknown)
      useAccountStatementStore.setState({ currentPrinter: 1 })
    })

    it("should validate printer 1 successfully when current printer is 1", async () => {
      const mockPrinterResponse: ApiResponse<string> = {
        success: true,
        data: '{"available":true,"name":"Main Printer","type":"LASER"}'
      }
      const mockValidationResponse: ApiResponse<boolean> = {
        success: true,
        data: true
      }
      vi.mocked(apiClient.get)
        .mockResolvedValueOnce({ data: mockPrinterResponse })
        .mockResolvedValueOnce({ data: mockValidationResponse })

      const result = await store.validatePrinter1()

      expect(apiClient.get).toHaveBeenCalledWith("/api/params/PRINTER_1_CONFIG")
      expect(apiClient.get).toHaveBeenCalledWith("/api/accountStatement/printer/validate", {
        params: { printerNumber: 1 }
      })
      expect(result).toBe(true)
      expect(store.isLoading).toBe(false)
      expect(store.error).toBe(null)
    })

    it("should return false when current printer is not 1", async () => {
      useAccountStatementStore.setState({ currentPrinter: 6 })
      const mockPrinterResponse: ApiResponse<string> = {
        success: true,
        data: '{"available":true,"name":"Main Printer","type":"LASER"}'
      }
      const mockValidationResponse: ApiResponse<boolean> = {
        success: true,
        data: true
      }
      vi.mocked(apiClient.get)
        .mockResolvedValueOnce({ data: mockPrinterResponse })
        .mockResolvedValueOnce({ data: mockValidationResponse })

      const result = await store.validatePrinter1()

      expect(result).toBe(false)
    })

    it("should handle API error", async () => {
      const mockError = new Error("Printer validation failed")
      vi.mocked(apiClient.get).mockRejectedValueOnce(mockError)

      const result = await store.validatePrinter1()

      expect(result).toBe(false)
      expect(gs().error).toBe("Printer validation failed")
      expect(gs().isLoading).toBe(false)
    })
  })

  describe("validatePrinter1 with mock data", () => {
    beforeEach(() => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: false
      } as unknown)
    })

    it("should validate printer 1 with mock when current printer is 1", async () => {
      useAccountStatementStore.setState({ currentPrinter: 1 })

      const result = await store.validatePrinter1()

      expect(apiClient.get).not.toHaveBeenCalled()
      expect(result).toBe(true)
    })

    it("should return false with mock when current printer is not 1", async () => {
      useAccountStatementStore.setState({ currentPrinter: 8 })

      const result = await store.validatePrinter1()

      expect(result).toBe(false)
    })
  })

  describe("validatePrinter6 with real API", () => {
    beforeEach(() => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: true
      } as unknown)
      useAccountStatementStore.setState({ currentPrinter: 6 })
    })

    it("should validate printer 6 successfully", async () => {
      const mockPrinterResponse: ApiResponse<string> = {
        success: true,
        data: '{"available":true,"name":"Receipt Printer","type":"THERMAL"}'
      }
      const mockValidationResponse: ApiResponse<boolean> = {
        success: true,
        data: true
      }
      vi.mocked(apiClient.get)
        .mockResolvedValueOnce({ data: mockPrinterResponse })
        .mockResolvedValueOnce({ data: mockValidationResponse })

      const result = await store.validatePrinter6()

      expect(apiClient.get).toHaveBeenCalledWith("/api/params/PRINTER_6_CONFIG")
      expect(apiClient.get).toHaveBeenCalledWith("/api/accountStatement/printer/validate", {
        params: { printerNumber: 6 }
      })
      expect(result).toBe(true)
    })
  })

  describe("validatePrinter8 with real API", () => {
    beforeEach(() => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: true
      } as unknown)
      useAccountStatementStore.setState({ currentPrinter: 8 })
    })

    it("should validate printer 8 successfully", async () => {
      const mockPrinterResponse: ApiResponse<string> = {
        success: true,
        data: '{"available":true,"name":"Label Printer","type":"LABEL"}'
      }
      const mockValidationResponse: ApiResponse<boolean> = {
        success: true,
        data: true
      }
      vi.mocked(apiClient.get)
        .mockResolvedValueOnce({ data: mockPrinterResponse })
        .mockResolvedValueOnce({ data: mockValidationResponse })

      const result = await store.validatePrinter8()

      expect(apiClient.get).toHaveBeenCalledWith("/api/params/PRINTER_8_CONFIG")
      expect(apiClient.get).toHaveBeenCalledWith("/api/accountStatement/printer/validate", {
        params: { printerNumber: 8 }
      })
      expect(result).toBe(true)
    })
  })

  describe("validatePrinter9 with real API", () => {
    beforeEach(() => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: true
      } as unknown)
      useAccountStatementStore.setState({ currentPrinter: 9 })
    })

    it("should validate printer 9 successfully", async () => {
      const mockPrinterConfigResponse: ApiResponse<string> = {
        success: true,
        data: '{"available":true,"name":"Gift Pass Printer","type":"INKJET"}'
      }
      const mockCurrentPrinterResponse: ApiResponse<string> = {
        success: true,
        data: "9"
      }
      const mockValidationResponse: ApiResponse<boolean> = {
        success: true,
        data: true
      }
      vi.mocked(apiClient.get)
        .mockResolvedValueOnce({ data: mockPrinterConfigResponse })
        .mockResolvedValueOnce({ data: mockCurrentPrinterResponse })
        .mockResolvedValueOnce({ data: mockValidationResponse })

      const result = await store.validatePrinter9()

      expect(apiClient.get).toHaveBeenCalledWith("/api/params/PRINTER_9_CONFIG")
      expect(apiClient.get).toHaveBeenCalledWith("/api/params/CURRENTPRINTERNUM")
      expect(apiClient.get).toHaveBeenCalledWith("/api/accountStatement/printer/validate", {
        params: { printerNumber: 9 }
      })
      expect(result).toBe(true)
    })
  })

  describe("validateDirectCall with real API", () => {
    beforeEach(() => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: true
      } as unknown)
      useAccountStatementStore.setState({ 
        currentPrinter: 1,
        isDirectCall: false
      })
    })

    it("should validate direct call when conditions are met", async () => {
      const mockResponse: ApiResponse<boolean> = {
        success: true,
        data: true
      }
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockResponse })

      const result = await store.validateDirectCall()

      expect(apiClient.get).toHaveBeenCalledWith("/api/accountStatement/printer/validate", {
        params: { printerNumber: 1 }
      })
      expect(result).toBe(true)
    })

    it("should return false when isDirectCall is true", async () => {
      useAccountStatementStore.setState({ isDirectCall: true })
      const mockResponse: ApiResponse<boolean> = {
        success: true,
        data: true
      }
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockResponse })

      const result = await store.validateDirectCall()

      expect(result).toBe(false)
    })
  })

  describe("validateDirectCall with mock data", () => {
    beforeEach(() => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: false
      } as unknown)
    })

    it("should validate direct call with mock when not direct call", async () => {
      useAccountStatementStore.setState({ isDirectCall: false })

      const result = await store.validateDirectCall()

      expect(apiClient.get).not.toHaveBeenCalled()
      expect(result).toBe(true)
    })

    it("should return false with mock when direct call", async () => {
      useAccountStatementStore.setState({ isDirectCall: true })

      const result = await store.validateDirectCall()

      expect(result).toBe(false)
    })
  })

  describe("generateAccountStatement with real API", () => {
    const MOCK_MEMBER_CODE = "ADH001"
    const MOCK_PRINTER_NUMBER = 1
    
    beforeEach(() => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: true
      } as unknown)
      useAccountStatementStore.setState({ isDirectCall: false })
    })

    it("should generate account statement successfully", async () => {
      const MOCK_STATEMENT = MOCK_ACCOUNT_STATEMENTS[0]
      const mockPrinterResponse: ApiResponse<string> = {
        success: true,
        data: '{"available":true,"name":"Main Printer","type":"LASER"}'
      }
      const mockStatementResponse: ApiResponse<AccountStatement> = {
        success: true,
        data: MOCK_STATEMENT
      }
      const mockAuditResponse: ApiResponse<AuditLog[]> = {
        success: true,
        data: MOCK_AUDIT_LOGS
      }

      vi.mocked(apiClient.get)
        .mockResolvedValueOnce({ data: mockPrinterResponse })
        .mockResolvedValueOnce({ data: mockStatementResponse })
        .mockResolvedValueOnce({ data: mockAuditResponse })
      vi.mocked(apiClient.post).mockResolvedValue(undefined)

      const result = await store.generateAccountStatement(MOCK_MEMBER_CODE, MOCK_PRINTER_NUMBER)

      expect(apiClient.get).toHaveBeenCalledWith("/api/params/PRINTER_1_CONFIG")
      expect(apiClient.get).toHaveBeenCalledWith("/api/accountStatement/member", {
        params: { memberCode: MOCK_MEMBER_CODE, printerNumber: MOCK_PRINTER_NUMBER }
      })
      expect(result).toEqual(MOCK_STATEMENT)
      expect(gs().accountStatements).toHaveLength(1)
      expect(gs().accountStatements[0]).toEqual(MOCK_STATEMENT)
      expect(gs().processingStatus).toBe("completed")
    })

    it("should sort account statements by member name", async () => {
      const STATEMENT_A = { ...MOCK_ACCOUNT_STATEMENTS[0], memberName: "Apple John" }
      const STATEMENT_Z = { ...MOCK_ACCOUNT_STATEMENTS[1], memberName: "Zebra Jane" }

      const mockPrinterResponse: ApiResponse<string> = {
        success: true,
        data: '{"available":true,"name":"Main Printer","type":"LASER"}'
      }
      const mockAuditResponse: ApiResponse<AuditLog[]> = {
        success: true,
        data: MOCK_AUDIT_LOGS
      }

      vi.mocked(apiClient.get)
        .mockResolvedValueOnce({ data: mockPrinterResponse })
        .mockResolvedValueOnce({ data: { success: true, data: STATEMENT_Z } })
        .mockResolvedValueOnce({ data: mockAuditResponse })
        .mockResolvedValueOnce({ data: mockPrinterResponse })
        .mockResolvedValueOnce({ data: { success: true, data: STATEMENT_A } })
        .mockResolvedValueOnce({ data: mockAuditResponse })
      vi.mocked(apiClient.post).mockResolvedValue(undefined)

      await store.generateAccountStatement("ADH002", 1)
      await store.generateAccountStatement("ADH001", 1)

      expect(gs().accountStatements).toHaveLength(2)
      expect(gs().accountStatements[0].memberName).toBe("Apple John")
      expect(gs().accountStatements[1].memberName).toBe("Zebra Jane")
    })

    it("should handle generation error", async () => {
      const mockError = new Error("Printer 1 is not available")
      vi.mocked(apiClient.get).mockRejectedValueOnce(mockError)

      await expect(store.generateAccountStatement(MOCK_MEMBER_CODE, MOCK_PRINTER_NUMBER)).rejects.toThrow("Printer 1 is not available")

      expect(gs().error).toBe("Printer 1 is not available")
      expect(gs().processingStatus).toBe("error")
      expect(gs().isLoading).toBe(false)
    })
  })

  describe("generateAccountStatement with mock data", () => {
    const MOCK_MEMBER_CODE = "ADH001"
    const MOCK_PRINTER_NUMBER = 9
    
    beforeEach(() => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: false
      } as unknown)
      useAccountStatementStore.setState({ isDirectCall: false })
    })

    it("should generate statement with mock data for existing member", async () => {
      const result = await store.generateAccountStatement(MOCK_MEMBER_CODE, MOCK_PRINTER_NUMBER)

      expect(apiClient.get).not.toHaveBeenCalled()
      expect(result.memberCode).toBe(MOCK_MEMBER_CODE)
      expect(result.printMask).toBe("GIFT_PASS")
      expect(result.editionLabel).toBe("Gift Pass Statement")
      expect(gs().processingStatus).toBe("completed")
    })

    it("should generate statement with mock data for unknown member", async () => {
      const UNKNOWN_MEMBER = "ADH999"
      const STANDARD_PRINTER = 1

      const result = await store.generateAccountStatement(UNKNOWN_MEMBER, STANDARD_PRINTER)

      expect(result.memberCode).toBe(UNKNOWN_MEMBER)
      expect(result.memberName).toBe("Mock Member")
      expect(result.printMask).toBe("STANDARD")
      expect(result.editionLabel).toBe("Account Statement")
    })
  })

  describe("printStatementByName with real API", () => {
    const MOCK_MEMBER_CODE = "ADH001"
    const MOCK_PRINTER_NUMBER = 1
    
    beforeEach(() => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: true
      } as unknown)
      useAccountStatementStore.setState({ isDirectCall: false })
    })

    it("should print statement by name successfully", async () => {
      const mockPrinterResponse: ApiResponse<string> = {
        success: true,
        data: '{"available":true,"name":"Main Printer","type":"LASER"}'
      }
      const mockAuditResponse: ApiResponse<AuditLog[]> = {
        success: true,
        data: MOCK_AUDIT_LOGS
      }
      vi.mocked(apiClient.get)
        .mockResolvedValueOnce({ data: mockPrinterResponse })
        .mockResolvedValueOnce({ data: mockAuditResponse })
      vi.mocked(apiClient.post).mockResolvedValue(undefined)

      await store.printStatementByName(MOCK_MEMBER_CODE, MOCK_PRINTER_NUMBER)

      expect(apiClient.post).toHaveBeenCalledWith("/api/accountStatement/print", {
        memberCode: MOCK_MEMBER_CODE,
        printerNumber: MOCK_PRINTER_NUMBER,
        sortBy: "name"
      })
      expect(gs().processingStatus).toBe("printed")
      expect(gs().error).toBe(null)
    })

    it("should handle print error", async () => {
      const mockError = new Error("Printer 1 is not available")
      vi.mocked(apiClient.get).mockRejectedValueOnce(mockError)

      await store.printStatementByName(MOCK_MEMBER_CODE, MOCK_PRINTER_NUMBER)

      expect(gs().error).toBe("Printer 1 is not available")
      expect(gs().processingStatus).toBe("error")
      expect(gs().isLoading).toBe(false)
    })
  })

  describe("printStatementByName with mock data", () => {
    const MOCK_MEMBER_CODE = "ADH001"
    const MOCK_PRINTER_NUMBER = 1
    
    beforeEach(() => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: false
      } as unknown)
      useAccountStatementStore.setState({ isDirectCall: false })
    })

    it("should print statement with mock delay", async () => {
      const startTime = Date.now()
      await store.printStatementByName(MOCK_MEMBER_CODE, MOCK_PRINTER_NUMBER)
      const elapsed = Date.now() - startTime

      expect(elapsed).toBeGreaterThanOrEqual(1500)
      expect(gs().processingStatus).toBe("printed")
      expect(gs().auditLogs).toHaveLength(1)
      expect(gs().auditLogs[0].memberCode).toBe(MOCK_MEMBER_CODE)
      expect(gs().auditLogs[0].printerNumber).toBe(MOCK_PRINTER_NUMBER)
      expect(gs().auditLogs[0].operation).toBe("PRINT_BY_NAME")
    })
  })

  describe("logPrintOperation with real API", () => {
    const MOCK_MEMBER_CODE = "ADH001"
    const MOCK_PRINTER_NUMBER = 1
    const MOCK_OPERATION = "PRINT_STATEMENT"
    
    beforeEach(() => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: true
      } as unknown)
    })

    it("should log print operation and refresh audit logs", async () => {
      const mockAuditResponse: ApiResponse<AuditLog[]> = {
        success: true,
        data: MOCK_AUDIT_LOGS
      }
      vi.mocked(apiClient.post).mockResolvedValue(undefined)
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockAuditResponse })

      await store.logPrintOperation(MOCK_MEMBER_CODE, MOCK_PRINTER_NUMBER, MOCK_OPERATION)

      expect(apiClient.post).toHaveBeenCalledWith("/api/accountStatement/auditLog", {
        memberCode: MOCK_MEMBER_CODE,
        printerNumber: MOCK_PRINTER_NUMBER,
        operation: MOCK_OPERATION,
        timestamp: expect.any(String)
      })
      expect(apiClient.get).toHaveBeenCalledWith("/api/accountStatement/auditLog")
      expect(gs().auditLogs).toEqual(MOCK_AUDIT_LOGS)
    })

    it("should handle logging error", async () => {
      const mockError = new Error("Log operation failed")
      vi.mocked(apiClient.post).mockRejectedValueOnce(mockError)

      await store.logPrintOperation(MOCK_MEMBER_CODE, MOCK_PRINTER_NUMBER, MOCK_OPERATION)

      expect(gs().error).toBe("Log operation failed")
    })
  })

  describe("logPrintOperation with mock data", () => {
    const MOCK_MEMBER_CODE = "ADH001"
    const MOCK_PRINTER_NUMBER = 1
    const MOCK_OPERATION = "PRINT_STATEMENT"
    
    beforeEach(() => {
      vi.mocked(useDataSourceStore.getState).mockReturnValue({
        isRealApi: false
      } as unknown)
    })

    it("should create mock audit log entry", async () => {
      const initialLogCount = gs().auditLogs.length

      await store.logPrintOperation(MOCK_MEMBER_CODE, MOCK_PRINTER_NUMBER, MOCK_OPERATION)

      expect(apiClient.post).not.toHaveBeenCalled()
      expect(apiClient.get).not.toHaveBeenCalled()
      expect(gs().auditLogs).toHaveLength(initialLogCount + 1)

      const newLog = gs().auditLogs[0]
      expect(newLog.memberCode).toBe(MOCK_MEMBER_CODE)
      expect(newLog.printerNumber).toBe(MOCK_PRINTER_NUMBER)
      expect(newLog.operation).toBe(MOCK_OPERATION)
      expect(newLog.id).toEqual(expect.any(Number))
      expect(newLog.timestamp).toBeInstanceOf(Date)
    })
  })

  describe("reset", () => {
    it("should reset all store state to initial values", () => {
      useAccountStatementStore.setState({
        accountStatements: MOCK_ACCOUNT_STATEMENTS,
        auditLogs: MOCK_AUDIT_LOGS,
        isLoading: true,
        error: "Test error",
        currentPrinter: 9,
        isDirectCall: true,
        processingStatus: "completed"
      })

      store.reset()

      expect(gs().accountStatements).toEqual([])
      expect(gs().auditLogs).toEqual([])
      expect(gs().isLoading).toBe(false)
      expect(gs().error).toBe(null)
      expect(gs().currentPrinter).toBe(1)
      expect(gs().isDirectCall).toBe(false)
      expect(gs().processingStatus).toBe("idle")
    })
  })
})