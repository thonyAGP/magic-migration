import type { ApiResponse } from "@/services/api/apiClient"
import { apiClient } from "@/services/api/apiClient"
import type {
  MergeValidation,
  MergeHistory,
  ValidateMergeRequest,
  ExecuteMergeRequest,
  FetchMergeHistoryRequest,
  RollbackMergeRequest,
  PrintMergeTicketRequest,
} from "@/types/accountMerge"

interface AccountMergeLog {
  id?: number
  mergeId: number
  timestamp: Date
  action: string
  details: string
}

interface AccountMergeDetail {
  id?: number
  mergeId: number
  accountId: string
  fieldName: string
  oldValue: string
  newValue: string
}

interface AccountMergeRecord {
  id?: number
  mergeId: number
  sourceAccountId: string
  targetAccountId: string
  mergeDate: Date
  status: string
}

interface AccountMergeInput {
  id?: number
  sessionId: string
  accountId: string
  inputData: Record<string, unknown>
}

interface AccountTitle {
  accountId: string
  title: string
  civility: string
}

interface PrinterInfo {
  printerId: string
  printerName: string
  isDefault: boolean
}

const buildQueryString = (params: Record<string, string | Date | unknown>): string => {
  const urlParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      const stringValue = value instanceof Date ? value.toISOString() : String(value)
      urlParams.append(key, stringValue)
    }
  })
  
  return urlParams.toString()
}

const validateAccountId = (accountId: string, context: string): void => {
  if (!accountId || accountId.trim().length === 0) {
    throw new Error(`Account ID is required for ${context}`)
  }
}

const validateMergeId = (mergeId: number, context: string): void => {
  if (mergeId <= 0) {
    throw new Error(`Valid merge ID is required for ${context}`)
  }
}

const validatePrintType = (printType: string): void => {
  if (printType !== "separation" && printType !== "fusion") {
    throw new Error("Print type must be either 'separation' or 'fusion'")
  }
}

const validateMerge = async (
  sourceAccountId: string,
  targetAccountId: string
): Promise<ApiResponse<MergeValidation>> => {
  const queryString = buildQueryString({ sourceAccountId, targetAccountId })
  return apiClient.get<MergeValidation>(`/api/accountMerge/validation?${queryString}`)
}

const executeMerge = async (
  sourceAccountId: string,
  targetAccountId: string
): Promise<ApiResponse<MergeHistory>> => {
  const payload: ExecuteMergeRequest = {
    sourceAccountId,
    targetAccountId,
  }
  return apiClient.post<MergeHistory>("/api/accountMerge/execute", payload)
}

const fetchMergeHistory = async (
  filters?: FetchMergeHistoryRequest
): Promise<ApiResponse<MergeHistory[]>> => {
  if (!filters) {
    return apiClient.get<MergeHistory[]>("/api/accountMerge/history")
  }

  const queryParams: Record<string, string | Date> = {}
  
  if (filters.accountId) {
    queryParams.accountId = filters.accountId
  }
  if (filters.dateFrom) {
    queryParams.dateFrom = filters.dateFrom
  }
  if (filters.dateTo) {
    queryParams.dateTo = filters.dateTo
  }

  const queryString = buildQueryString(queryParams)
  const path = queryString.length > 0 
    ? `/api/accountMerge/history?${queryString}`
    : "/api/accountMerge/history"

  return apiClient.get<MergeHistory[]>(path)
}

const rollbackMerge = async (
  mergeHistoryId: number
): Promise<ApiResponse<void>> => {
  const payload: RollbackMergeRequest = {
    mergeHistoryId,
  }
  return apiClient.post<void>("/api/accountMerge/rollback", payload)
}

const printMergeTicket = async (
  mergeHistoryId: number
): Promise<ApiResponse<void>> => {
  const payload: PrintMergeTicketRequest = {
    mergeHistoryId,
  }
  return apiClient.post<void>("/api/accountMerge/print-ticket", payload)
}

const writeAccountMergeLog = async (
  logData: Omit<AccountMergeLog, "id">
): Promise<ApiResponse<AccountMergeLog>> => {
  return apiClient.post<AccountMergeLog>("/api/accountMerge/histo-log", logData)
}

const readAccountMergeDetail = async (
  mergeId: number
): Promise<ApiResponse<AccountMergeDetail[]>> => {
  return apiClient.get<AccountMergeDetail[]>(`/api/accountMerge/histo-detail/${mergeId}`)
}

const writeAccountMergeDetail = async (
  detailData: Omit<AccountMergeDetail, "id">
): Promise<ApiResponse<AccountMergeDetail>> => {
  return apiClient.post<AccountMergeDetail>("/api/accountMerge/histo-detail", detailData)
}

const writeAccountMergeRecord = async (
  recordData: Omit<AccountMergeRecord, "id">
): Promise<ApiResponse<AccountMergeRecord>> => {
  return apiClient.post<AccountMergeRecord>("/api/accountMerge/histo", recordData)
}

const writeAccountMergeInput = async (
  inputData: Omit<AccountMergeInput, "id">
): Promise<ApiResponse<AccountMergeInput>> => {
  return apiClient.post<AccountMergeInput>("/api/accountMerge/histo-saisie", inputData)
}

const deleteAccountMergeInput = async (sessionId: string): Promise<ApiResponse<void>> => {
  return apiClient.delete<void>(`/api/accountMerge/histo-saisie/${sessionId}`)
}

const fetchAccountTitle = async (accountId: string): Promise<ApiResponse<AccountTitle>> => {
  // CALLEE 43: Recuperation du titre
  validateAccountId(accountId, "title retrieval")
  return apiClient.get<AccountTitle>(`/api/accountMerge/account-title/${accountId}`)
}

const readAccountMergeLog = async (
  mergeId: number
): Promise<ApiResponse<AccountMergeLog[]>> => {
  return apiClient.get<AccountMergeLog[]>(`/api/accountMerge/histo-log/${mergeId}`)
}

const printSeparationOrFusion = async (
  mergeId: number,
  printType: "separation" | "fusion"
): Promise<ApiResponse<void>> => {
  // CALLEE 36: Print Separation ou fusion
  validateMergeId(mergeId, "printing")
  validatePrintType(printType)
  return apiClient.post<void>("/api/accountMerge/print", { mergeId, printType })
}

const getPrinter = async (): Promise<ApiResponse<PrinterInfo>> => {
  // CALLEE 180: Printer choice
  const response = await apiClient.get<PrinterInfo>("/api/accountMerge/printer")
  if (response.success && !response.data) {
    throw new Error("No printer available")
  }
  return response
}

const setListingNumber = async (listingNumber: string): Promise<ApiResponse<void>> => {
  return apiClient.post<void>("/api/accountMerge/set-listing-number", { listingNumber })
}

const resetCurrentPrinter = async (): Promise<ApiResponse<void>> => {
  // CALLEE 182: Raz Current Printer
  const response = await apiClient.post<void>("/api/accountMerge/reset-printer", {})
  if (!response.success) {
    throw new Error("Failed to reset current printer")
  }
  return response
}

export const accountMergeApi = {
  validateMerge,
  executeMerge,
  fetchMergeHistory,
  rollbackMerge,
  printMergeTicket,
  writeHistoFusSepLog: writeAccountMergeLog,
  readHistoFusSepDet: readAccountMergeDetail,
  writeHistoFusSepDet: writeAccountMergeDetail,
  writeHistoFusSep: writeAccountMergeRecord,
  writeHistoFusSepSaisie: writeAccountMergeInput,
  deleteHistoFusSepSaisie: deleteAccountMergeInput,
  fetchAccountTitle,
  readHistoFusSepLog: readAccountMergeLog,
  printSeparationOrFusion,
  getPrinter,
  setListingNumber,
  resetCurrentPrinter,
} as const