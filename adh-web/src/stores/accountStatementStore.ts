import { create } from "zustand"
import type { AccountStatementState, AccountStatementActions, AccountStatement, AuditLog } from "@/types/accountStatement"
import { useDataSourceStore } from "@/stores/dataSourceStore"
import { apiClient } from "@/services/api/apiClient"
import type { ApiResponse } from "@/services/api/apiClient"

const mockAccountStatements: AccountStatement[] = [
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
  },
  {
    memberCode: "ADH003",
    memberName: "Bernard Jean",
    memberNumber: "12347",
    currency: "EUR",
    accountingPeriod: "2024-02",
    printMask: "FREE_EXTRA",
    editionLabel: "Free Extra Statement"
  },
  {
    memberCode: "ADH004",
    memberName: "Leroy Marie",
    memberNumber: "12348",
    currency: "GBP",
    accountingPeriod: "2024-02",
    printMask: "STANDARD",
    editionLabel: "Account Statement"
  },
  {
    memberCode: "ADH005",
    memberName: "Moreau Paul",
    memberNumber: "12349",
    currency: "EUR",
    accountingPeriod: "2024-03",
    printMask: null,
    editionLabel: null
  }
]

interface AccountStatementStore extends AccountStatementState, AccountStatementActions {
  reset: () => void
  getPrinterConfiguration: (printerNumber: number) => Promise<{ available: boolean; name: string; type: string }>
  validateComponentAccess: () => boolean
  handleAsyncError: (error: unknown, operation: string) => void
  razCurrentPrinter: () => Promise<void>
  setPrinterConfiguration: (printerNumber: number, config: { available: boolean; name: string; type: string }) => Promise<void>
}

// RM-001: GetParam function to retrieve actual printer configuration
const getParam = async (paramName: string): Promise<string> => {
  if (useDataSourceStore.getState().isRealApi) {
    const response = await apiClient.get<ApiResponse<string>>(`/api/params/${paramName}`)
    return response.data.data
  }

  // Mock configuration values
  const mockParams: Record<string, string> = {
    CURRENTPRINTERNUM: "9",
    PRINTER_1_CONFIG: '{"available":true,"name":"Main Printer","type":"LASER"}',
    PRINTER_6_CONFIG: '{"available":true,"name":"Receipt Printer","type":"THERMAL"}',
    PRINTER_8_CONFIG: '{"available":true,"name":"Label Printer","type":"LABEL"}',
    PRINTER_9_CONFIG: '{"available":true,"name":"Gift Pass Printer","type":"INKJET"}'
  }

  return mockParams[paramName] || ""
}

const getCurrentPrinterNumber = async (): Promise<number> => {
  try {
    const printerNum = await getParam("CURRENTPRINTERNUM")
    return parseInt(printerNum, 10) || 1
  } catch (error) {
    throw new Error(`Failed to get current printer number: ${error instanceof Error ? error.message : String(error)}`)
  }
}

export const useAccountStatementStore = create<AccountStatementStore>((set, get) => ({
  accountStatements: [],
  auditLogs: [],
  isLoading: false,
  error: null,
  currentPrinter: 1,
  isDirectCall: false,
  processingStatus: "idle",

  // RM-002: Enhanced error handling for all async operations
  handleAsyncError: (error: unknown, operation: string) => {
    const errorMessage = error instanceof Error ? error.message : `Unknown error in ${operation}`
    console.error(`Operation ${operation} failed:`, error)
    set({ error: errorMessage, processingStatus: "error", isLoading: false })
  },

  // RM-003: GetParam function implementation for printer configuration
  getPrinterConfiguration: async (printerNumber: number) => {
    const configJson = await getParam(`PRINTER_${printerNumber}_CONFIG`)
    if (!configJson) {
      return { available: false, name: `Printer ${printerNumber}`, type: "UNKNOWN" }
    }
    return JSON.parse(configJson) as { available: boolean; name: string; type: string }
  },

  // RM-004: IsComponent validation check
  validateComponentAccess: () => {
    const state = get()
    const isComponent = !state.isDirectCall
    const hasValidPrinter = state.currentPrinter > 0
    return isComponent && hasValidPrinter
  },

  // RM-005: RAZ Current Printer implementation
  razCurrentPrinter: async () => {
    try {
      set({ isLoading: true, error: null })
      
      if (useDataSourceStore.getState().isRealApi) {
        await apiClient.post("/api/printer/reset", { printerNumber: get().currentPrinter })
      }
      
      set({ currentPrinter: 1, processingStatus: "idle" })
    } catch (error) {
      get().handleAsyncError(error, "razCurrentPrinter")
    } finally {
      set({ isLoading: false })
    }
  },

  // RM-006: Set printer configuration
  setPrinterConfiguration: async (printerNumber: number, config: { available: boolean; name: string; type: string }) => {
    try {
      set({ isLoading: true, error: null })
      
      if (useDataSourceStore.getState().isRealApi) {
        await apiClient.post(`/api/printer/${printerNumber}/config`, config)
      }
      
      set({ currentPrinter: printerNumber })
    } catch (error) {
      get().handleAsyncError(error, `setPrinterConfiguration(${printerNumber})`)
    } finally {
      set({ isLoading: false })
    }
  },

  validatePrinter1: async (): Promise<boolean> => {
    try {
      set({ isLoading: true, error: null })
      
      if (!get().validateComponentAccess()) {
        return false
      }
      
      const printerConfig = await get().getPrinterConfiguration(1)
      if (!printerConfig.available) {
        return false
      }
      
      if (useDataSourceStore.getState().isRealApi) {
        const response = await apiClient.get<ApiResponse<boolean>>("/api/accountStatement/printer/validate", {
          params: { printerNumber: 1 }
        })
        const isValid = get().currentPrinter === 1
        return response.data.data && isValid
      } else {
        const isValid = get().currentPrinter === 1
        return isValid
      }
    } catch (error) {
      get().handleAsyncError(error, "validatePrinter1")
      return false
    } finally {
      set({ isLoading: false })
    }
  },

  validatePrinter6: async (): Promise<boolean> => {
    try {
      set({ isLoading: true, error: null })
      
      if (!get().validateComponentAccess()) {
        return false
      }
      
      const printerConfig = await get().getPrinterConfiguration(6)
      if (!printerConfig.available) {
        return false
      }
      
      if (useDataSourceStore.getState().isRealApi) {
        const response = await apiClient.get<ApiResponse<boolean>>("/api/accountStatement/printer/validate", {
          params: { printerNumber: 6 }
        })
        const isValid = get().currentPrinter === 6
        return response.data.data && isValid
      } else {
        const isValid = get().currentPrinter === 6
        return isValid
      }
    } catch (error) {
      get().handleAsyncError(error, "validatePrinter6")
      return false
    } finally {
      set({ isLoading: false })
    }
  },

  validatePrinter8: async (): Promise<boolean> => {
    try {
      set({ isLoading: true, error: null })
      
      if (!get().validateComponentAccess()) {
        return false
      }
      
      const printerConfig = await get().getPrinterConfiguration(8)
      if (!printerConfig.available) {
        return false
      }
      
      if (useDataSourceStore.getState().isRealApi) {
        const response = await apiClient.get<ApiResponse<boolean>>("/api/accountStatement/printer/validate", {
          params: { printerNumber: 8 }
        })
        const isValid = get().currentPrinter === 8
        return response.data.data && isValid
      } else {
        const isValid = get().currentPrinter === 8
        return isValid
      }
    } catch (error) {
      get().handleAsyncError(error, "validatePrinter8")
      return false
    } finally {
      set({ isLoading: false })
    }
  },

  validatePrinter9: async (): Promise<boolean> => {
    try {
      set({ isLoading: true, error: null })
      
      if (!get().validateComponentAccess()) {
        return false
      }
      
      const printerConfig = await get().getPrinterConfiguration(9)
      if (!printerConfig.available) {
        return false
      }
      
      const currentPrinterNum = await getCurrentPrinterNumber()
      const isCurrentPrinter9 = currentPrinterNum === 9
      
      if (useDataSourceStore.getState().isRealApi) {
        const response = await apiClient.get<ApiResponse<boolean>>("/api/accountStatement/printer/validate", {
          params: { printerNumber: 9 }
        })
        const isValid = get().currentPrinter === 9
        return response.data.data && isValid && isCurrentPrinter9
      } else {
        const isValid = get().currentPrinter === 9
        return isValid && isCurrentPrinter9
      }
    } catch (error) {
      get().handleAsyncError(error, "validatePrinter9")
      return false
    } finally {
      set({ isLoading: false })
    }
  },

  validateDirectCall: async (): Promise<boolean> => {
    try {
      set({ isLoading: true, error: null })
      
      const state = get()
      const isValid = get().validateComponentAccess()
      
      if (useDataSourceStore.getState().isRealApi) {
        const response = await apiClient.get<ApiResponse<boolean>>("/api/accountStatement/printer/validate", {
          params: { printerNumber: state.currentPrinter }
        })
        return response.data.data && isValid
      } else {
        return isValid
      }
    } catch (error) {
      get().handleAsyncError(error, "validateDirectCall")
      return false
    } finally {
      set({ isLoading: false })
    }
  },

  generateAccountStatement: async (memberCode: string, printerNumber: number): Promise<AccountStatement> => {
    try {
      set({ isLoading: true, error: null, processingStatus: "generating" })
      
      if (!get().validateComponentAccess()) {
        throw new Error("Component access validation failed")
      }
      
      const printerConfig = await get().getPrinterConfiguration(printerNumber)
      if (!printerConfig.available) {
        throw new Error(`Printer ${printerNumber} is not available`)
      }
      
      if (useDataSourceStore.getState().isRealApi) {
        const response = await apiClient.get<ApiResponse<AccountStatement>>("/api/accountStatement/member", {
          params: { memberCode, printerNumber }
        })
        
        const statement = response.data.data
        set(state => ({
          accountStatements: [...state.accountStatements, statement].sort((a, b) => a.memberName.localeCompare(b.memberName)),
          processingStatus: "completed"
        }))
        
        await get().logPrintOperation(memberCode, printerNumber, "GENERATE_STATEMENT")
        return statement
      } else {
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const found = mockAccountStatements.find(s => s.memberCode === memberCode)
        const statement = found ? {
          ...found,
          printMask: printerNumber === 9 ? "GIFT_PASS" : (found.printMask ?? "STANDARD"),
          editionLabel: printerNumber === 9 ? "Gift Pass Statement" : (found.editionLabel ?? "Account Statement")
        } : {
          memberCode,
          memberName: "Mock Member",
          memberNumber: "99999",
          currency: "EUR",
          accountingPeriod: "2024-01",
          printMask: printerNumber === 9 ? "GIFT_PASS" : "STANDARD",
          editionLabel: printerNumber === 9 ? "Gift Pass Statement" : "Account Statement"
        }
        
        set(state => ({
          accountStatements: [...state.accountStatements, statement].sort((a, b) => a.memberName.localeCompare(b.memberName)),
          processingStatus: "completed"
        }))
        
        await get().logPrintOperation(memberCode, printerNumber, "GENERATE_STATEMENT")
        return statement
      }
    } catch (error) {
      get().handleAsyncError(error, "generateAccountStatement")
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  printStatementByName: async (memberCode: string, printerNumber: number): Promise<void> => {
    try {
      set({ isLoading: true, error: null, processingStatus: "printing" })
      
      if (!get().validateComponentAccess()) {
        throw new Error("Component access validation failed")
      }
      
      const printerConfig = await get().getPrinterConfiguration(printerNumber)
      if (!printerConfig.available) {
        throw new Error(`Printer ${printerNumber} is not available`)
      }
      
      if (useDataSourceStore.getState().isRealApi) {
        await apiClient.post("/api/accountStatement/print", {
          memberCode,
          printerNumber,
          sortBy: "name"
        })
      } else {
        await new Promise(resolve => setTimeout(resolve, 1500))
      }
      
      await get().logPrintOperation(memberCode, printerNumber, "PRINT_BY_NAME")
      set({ processingStatus: "printed" })
    } catch (error) {
      get().handleAsyncError(error, "printStatementByName")
    } finally {
      set({ isLoading: false })
    }
  },

  logPrintOperation: async (memberCode: string, printerNumber: number, operation: string): Promise<void> => {
    try {
      if (useDataSourceStore.getState().isRealApi) {
        await apiClient.post("/api/accountStatement/auditLog", {
          memberCode,
          printerNumber,
          operation,
          timestamp: new Date().toISOString()
        })
        
        const response = await apiClient.get<ApiResponse<AuditLog[]>>("/api/accountStatement/auditLog")
        set({ auditLogs: response.data.data })
      } else {
        const newLog: AuditLog = {
          id: Date.now(),
          operation,
          timestamp: new Date(),
          memberCode,
          printerNumber
        }
        
        set(state => ({
          auditLogs: [newLog, ...state.auditLogs]
        }))
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Logging error"
      console.error(`Operation logPrintOperation failed:`, error)
      set({ error: errorMessage })
    }
  },

  reset: () => {
    set({
      accountStatements: [],
      auditLogs: [],
      isLoading: false,
      error: null,
      currentPrinter: 1,
      isDirectCall: false,
      processingStatus: "idle"
    })
  }
}))