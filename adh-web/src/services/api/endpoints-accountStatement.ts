import { apiClient } from "@/services/api/apiClient"
import type { ApiResponse } from "@/services/api/apiClient"
import type { 
  AccountStatement, 
  AuditLog, 
  AccountStatementResponse, 
  AuditLogResponse 
} from "@/types/accountStatement"
import { useDataSourceStore } from "@/stores/dataSourceStore"

export const accountStatementService = {
  // Fetch account statement for a specific member
  getMemberAccountStatement: async (
    memberCode: string, 
    printerNumber?: number
  ): Promise<AccountStatementResponse> => {
    const isRealApi = useDataSourceStore.getState().isRealApi

    return apiClient.get<AccountStatement>('/api/accountStatement/member', {
      params: { 
        memberCode, 
        ...(printerNumber && { printerNumber }) 
      },
      mock: !isRealApi
    })
  },

  // Print account statement
  printAccountStatement: async (): Promise<void> => {
    const isRealApi = useDataSourceStore.getState().isRealApi

    return apiClient.post('/api/accountStatement/print', {
      mock: !isRealApi
    })
  },

  // Fetch audit logs with optional filters
  getAuditLogs: async (
    memberCode?: string, 
    startDate?: string, 
    endDate?: string
  ): Promise<AuditLogResponse> => {
    const isRealApi = useDataSourceStore.getState().isRealApi

    return apiClient.get<AuditLog[]>('/api/accountStatement/auditLog', {
      params: {
        ...(memberCode && { memberCode }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      },
      mock: !isRealApi
    })
  },

  // Validate printer number
  validatePrinter: async (
    printerNumber: number
  ): Promise<ApiResponse<boolean>> => {
    const isRealApi = useDataSourceStore.getState().isRealApi

    return apiClient.get<boolean>('/api/accountStatement/printer/validate', {
      params: { printerNumber },
      mock: !isRealApi
    })
  },

  // Create invoice footer calculation
  createInvoiceFooter: async (
    memberCode: string,
    accountingData: unknown
  ): Promise<ApiResponse<{ taxAmount: number; totalAmount: number }>> => {
    const isRealApi = useDataSourceStore.getState().isRealApi

    return apiClient.post<{ taxAmount: number; totalAmount: number }>('/api/accountStatement/invoiceFooter', {
      memberCode,
      accountingData
    }, {
      mock: !isRealApi
    }) // RM-075
  },

  // Retrieve local currency information
  getLocalCurrency: async (
    memberCode: string
  ): Promise<ApiResponse<{ currency: string; exchangeRate: number }>> => {
    const isRealApi = useDataSourceStore.getState().isRealApi

    return apiClient.get<{ currency: string; exchangeRate: number }>('/api/accountStatement/currency', {
      params: { memberCode },
      mock: !isRealApi
    }) // RM-021
  },

  // Retrieve document title
  getDocumentTitle: async (
    documentType: string,
    memberCode: string
  ): Promise<ApiResponse<{ title: string; subtitle: string }>> => {
    const isRealApi = useDataSourceStore.getState().isRealApi // RM-043

    return apiClient.get<{ title: string; subtitle: string }>('/api/accountStatement/title', {
      params: { documentType, memberCode },
      mock: !isRealApi
    })
  },

  // Get available printer configuration
  getPrinter: async (
    printerNumber: number
  ): Promise<ApiResponse<{ printerName: string; isAvailable: boolean; config: unknown }>> => {
    const isRealApi = useDataSourceStore.getState().isRealApi

    return apiClient.get<{ printerName: string; isAvailable: boolean; config: unknown }>('/api/accountStatement/printer', {
      params: { printerNumber },
      mock: !isRealApi
    })
  },

  // Set listing number for document tracking
  setListingNumber: async (
    listingType: string,
    documentId: string
  ): Promise<ApiResponse<{ listingNumber: number }>> => {
    const isRealApi = useDataSourceStore.getState().isRealApi

    return apiClient.post<{ listingNumber: number }>('/api/accountStatement/listing', {
      listingType,
      documentId
    }, {
      mock: !isRealApi
    })
  },

  // Reset current printer state
  resetCurrentPrinter: async (): Promise<ApiResponse<void>> => {
    const isRealApi = useDataSourceStore.getState().isRealApi

    return apiClient.post<void>('/api/accountStatement/printer/reset', {}, {
      mock: !isRealApi
    }) // RM-182
  }
}