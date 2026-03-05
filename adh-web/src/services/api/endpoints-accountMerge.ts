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

interface HistoFusSepLog {
  id?: number
  mergeId: number
  timestamp: Date
  action: string
  details: string
}

interface HistoFusSepDet {
  id?: number
  mergeId: number
  accountId: string
  fieldName: string
  oldValue: string
  newValue: string
}

interface HistoFusSep {
  id?: number
  mergeId: number
  sourceAccountId: string
  targetAccountId: string
  mergeDate: Date
  status: string
}

interface HistoFusSepSaisie {
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

const validateMerge = async (
  sourceAccountId: string,
  targetAccountId: string
): Promise<ApiResponse<MergeValidation>> => {
  const params = new URLSearchParams({
    sourceAccountId,
    targetAccountId,
  })
  return apiClient.get<MergeValidation>(
    `/api/accountMerge/validation?${params.toString()}`
  )
}

const executeMerge = async (
  sourceAccountId: string,
  targetAccountId: string
): Promise<ApiResponse<MergeHistory>> => {
  const payload: ExecuteMergeRequest = {
    sourceAccountId,
    targetAccountId,
  }
  return apiClient.post<MergeHistory>(
    "/api/accountMerge/execute",
    payload
  )
}

const fetchMergeHistory = async (
  filters?: FetchMergeHistoryRequest
): Promise<ApiResponse<MergeHistory[]>> => {
  const params = new URLSearchParams()

  if (filters?.accountId) {
    params.append("accountId", filters.accountId)
  }

  if (filters?.dateFrom) {
    params.append(
      "dateFrom",
      filters.dateFrom instanceof Date
        ? filters.dateFrom.toISOString()
        : String(filters.dateFrom)
    )
  }

  if (filters?.dateTo) {
    params.append(
      "dateTo",
      filters.dateTo instanceof Date
        ? filters.dateTo.toISOString()
        : String(filters.dateTo)
    )
  }

  const queryString = params.toString()
  const path =
    queryString.length > 0
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

const writeHistoFusSepLog = async (logData: Omit<HistoFusSepLog, "id">): Promise<ApiResponse<HistoFusSepLog>> => {
  return apiClient.post<HistoFusSepLog>("/api/accountMerge/histo-log", logData)
}

const readHistoFusSepDet = async (mergeId: number): Promise<ApiResponse<HistoFusSepDet[]>> => {
  return apiClient.get<HistoFusSepDet[]>(`/api/accountMerge/histo-detail/${mergeId}`)
}

const writeHistoFusSepDet = async (detailData: Omit<HistoFusSepDet, "id">): Promise<ApiResponse<HistoFusSepDet>> => {
  return apiClient.post<HistoFusSepDet>("/api/accountMerge/histo-detail", detailData)
}

const writeHistoFusSep = async (histoData: Omit<HistoFusSep, "id">): Promise<ApiResponse<HistoFusSep>> => {
  return apiClient.post<HistoFusSep>("/api/accountMerge/histo", histoData)
}

const writeHistoFusSepSaisie = async (saisieData: Omit<HistoFusSepSaisie, "id">): Promise<ApiResponse<HistoFusSepSaisie>> => {
  return apiClient.post<HistoFusSepSaisie>("/api/accountMerge/histo-saisie", saisieData)
}

const deleteHistoFusSepSaisie = async (sessionId: string): Promise<ApiResponse<void>> => {
  return apiClient.delete<void>(`/api/accountMerge/histo-saisie/${sessionId}`)
}

const fetchAccountTitle = async (accountId: string): Promise<ApiResponse<AccountTitle>> => { // CALLEE 43: Recuperation du titre
  if (!accountId || accountId.trim().length === 0) {
    throw new Error("Account ID is required for title retrieval")
  }
  return apiClient.get<AccountTitle>(`/api/accountMerge/account-title/${accountId}`)
}

const readHistoFusSepLog = async (mergeId: number): Promise<ApiResponse<HistoFusSepLog[]>> => {
  return apiClient.get<HistoFusSepLog[]>(`/api/accountMerge/histo-log/${mergeId}`)
}

const printSeparationOrFusion = async (mergeId: number, printType: "separation" | "fusion"): Promise<ApiResponse<void>> => { // CALLEE 36: Print Separation ou fusion
  if (mergeId <= 0) {
    throw new Error("Valid merge ID is required for printing")
  }
  if (printType !== "separation" && printType !== "fusion") {
    throw new Error("Print type must be either 'separation' or 'fusion'")
  }
  return apiClient.post<void>("/api/accountMerge/print", { mergeId, printType })
}

const getPrinter = async (): Promise<ApiResponse<PrinterInfo>> => { // CALLEE 180: Printer choice
  const response = await apiClient.get<PrinterInfo>("/api/accountMerge/printer")
  if (response.success && !response.data) {
    throw new Error("No printer available")
  }
  return response
}

const setListingNumber = async (listingNumber: string): Promise<ApiResponse<void>> => {
  return apiClient.post<void>("/api/accountMerge/set-listing-number", { listingNumber })
}

const resetCurrentPrinter = async (): Promise<ApiResponse<void>> => { // CALLEE 182: Raz Current Printer
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
  writeHistoFusSepLog,
  readHistoFusSepDet,
  writeHistoFusSepDet,
  writeHistoFusSep,
  writeHistoFusSepSaisie,
  deleteHistoFusSepSaisie,
  fetchAccountTitle,
  readHistoFusSepLog,
  printSeparationOrFusion,
  getPrinter,
  setListingNumber,
  resetCurrentPrinter,
} as const