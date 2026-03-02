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
  }
}