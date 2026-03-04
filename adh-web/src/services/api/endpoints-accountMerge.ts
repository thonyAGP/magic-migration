import { apiClient } from "@/services/api/apiClient"
import type { ApiResponse } from "@/services/api/apiClient"
import type { 
  ApiValidationRequest, 
  ApiAccountLoadRequest, 
  ApiMergeExecuteRequest, 
  ApiMergeHistoryRequest, 
  ApiMergeLogRequest,
  Account,
  MergeRequest,
  MergeHistory,
  MergeLog,
  ValidationStatus
} from "@/types/accountMerge"

export const accountMergeService = {
  validateMerge: async (): Promise<ApiValidationRequest> => {
    return await apiClient.post('/api/account-merge/validate')
  },

  loadAccounts: async (): Promise<ApiAccountLoadRequest> => {
    return await apiClient.post('/api/account-merge/load-accounts')
  },

  executeMerge: async (
    autoResume?: boolean, 
    withoutInterface?: boolean
  ): Promise<ApiMergeExecuteRequest> => {
    const queryParams = new URLSearchParams()
    if (autoResume) queryParams.append('autoResume', 'true')
    if (withoutInterface) queryParams.append('withoutInterface', 'true')

    return await apiClient.post(`/api/account-merge/execute?${queryParams.toString()}`)
  },

  recordMergeHistory: async (): Promise<ApiResponse<void>> => {
    return await apiClient.post('/api/account-merge/history')
  },

  recordMergeLogs: async (): Promise<ApiResponse<void>> => {
    return await apiClient.post('/api/account-merge/logs')
  },

  cleanupMerge: async (mergeId: number): Promise<ApiResponse<void>> => {
    return await apiClient.delete(`/api/account-merge/cleanup/${mergeId}`)
  },

  printMergeRequest: async (mergeId: number): Promise<ApiResponse<void>> => {
    return await apiClient.post(`/api/account-merge/print/${mergeId}`)
  },

  cancelMerge: async (): Promise<ApiResponse<void>> => {
    return await apiClient.delete('/api/account-merge/cancel')
  },

  getMergeHistory: async (
    startDate?: string, 
    endDate?: string, 
    accountId?: number
  ): Promise<ApiMergeHistoryRequest> => {
    const queryParams = new URLSearchParams()
    if (startDate) queryParams.append('startDate', startDate)
    if (endDate) queryParams.append('endDate', endDate)
    if (accountId) queryParams.append('accountId', accountId.toString())

    return await apiClient.get(`/api/account-merge/history?${queryParams.toString()}`)
  },

  getMergeLogs: async (mergeId: number): Promise<ApiMergeLogRequest> => {
    return await apiClient.get(`/api/account-merge/logs/${mergeId}`)
  },

  writeHistoFusSep: async (mergeData: unknown): Promise<ApiResponse<void>> => { // RM-29
    return await apiClient.post('/api/account-merge/histo-fus-sep', { data: mergeData })
  },

  readHistoFusSeprDet: async (mergeId: number): Promise<ApiResponse<unknown>> => { // RM-30
    return await apiClient.get(`/api/account-merge/histo-fus-sep-det/${mergeId}`)
  },

  writeHistoFusSeprDet: async (mergeId: number, detailData: unknown): Promise<ApiResponse<void>> => { // RM-31
    return await apiClient.post(`/api/account-merge/histo-fus-sep-det/${mergeId}`, { data: detailData })
  },

  writeHistoFusSeprSaisie: async (mergeId: number, saisieData: unknown): Promise<ApiResponse<void>> => { // RM-32
    return await apiClient.post(`/api/account-merge/histo-fus-sep-saisie/${mergeId}`, { data: saisieData })
  },

  deleteHistoFusSeprSaisie: async (mergeId: number, saisieId: number): Promise<ApiResponse<void>> => { // RM-33
    return await apiClient.delete(`/api/account-merge/histo-fus-sep-saisie/${mergeId}/${saisieId}`)
  },

  readHistoFusSeprLog: async (mergeId: number): Promise<ApiResponse<unknown[]>> => { // RM-34
    return await apiClient.get(`/api/account-merge/histo-fus-sep-log/${mergeId}`)
  },

  writeHistoFusSeprLog: async (mergeId: number, logData: unknown): Promise<ApiResponse<void>> => { // RM-35
    return await apiClient.post(`/api/account-merge/histo-fus-sep-log/${mergeId}`, { data: logData })
  },

  printSeparationOuFusion: async (mergeId: number, printOptions?: unknown): Promise<ApiResponse<void>> => { // RM-36
    return await apiClient.post(`/api/account-merge/print-separation-fusion/${mergeId}`, { options: printOptions })
  },

  recuperationDuTitre: async (accountId: number): Promise<ApiResponse<string>> => { // RM-43
    return await apiClient.get(`/api/account-merge/titre/${accountId}`)
  },

  getPrinter: async (): Promise<ApiResponse<{ printerName: string; isDefault: boolean }[]>> => { // RM-179
    return await apiClient.get('/api/system/printers')
  },

  printerChoice: async (printerName: string): Promise<ApiResponse<void>> => { // RM-180
    return await apiClient.post('/api/system/printer/select', { printerName })
  },

  setListingNumber: async (listingNumber: number): Promise<ApiResponse<void>> => { // RM-181
    return await apiClient.post('/api/system/listing-number', { listingNumber })
  },

  razCurrentPrinter: async (): Promise<ApiResponse<void>> => { // RM-182
    return await apiClient.post('/api/system/printer/reset')
  }
}