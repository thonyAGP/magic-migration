import type { ApiResponse } from "@/services/api/apiClient"

export interface MergeRequest {
  id: number
  sourceAccountId: number
  targetAccountId: number
  status: 'pending' | 'validated' | 'rejected' | 'completed'
  validatedBy: string | null
  validatedAt: Date | null
  chronoCode: string
}

export interface MergeHistory {
  id: number
  mergeRequestId: number
  timestamp: Date
  operation: string
  details: string | null
}

export interface MergeLog {
  id: number
  mergeId: number
  operation: string
  tableName: string
  recordCount: number
  timestamp: Date
  success: boolean
}

export interface Account {
  id: number
  status: 'active' | 'inactive' | 'suspended'
  balance: number
  clientName: string | null
  linkedAccounts: number | null
}

export interface ValidationStatus {
  network: boolean
  closure: boolean
  validation: string
}

export interface AccountMergeState {
  mergeRequest: MergeRequest | null
  sourceAccount: Account | null
  targetAccount: Account | null
  mergeHistory: MergeHistory[]
  mergeLogs: MergeLog[]
  validationStatus: ValidationStatus | null
  currentStep: 'validation' | 'preparation' | 'execution' | 'completion'
  isProcessing: boolean
  error: string | null
  progressData: { current: number; total: number; table: string }
}

export type ApiValidationRequest = ApiResponse<ValidationStatus>

export type ApiAccountLoadRequest = ApiResponse<{
  source: Account
  target: Account
}>

export type ApiMergeExecuteRequest = ApiResponse<MergeRequest>

export type ApiMergeHistoryRequest = ApiResponse<MergeHistory[]>

export type ApiMergeLogRequest = ApiResponse<MergeLog[]>

export const MERGE_STATUSES = {
  PENDING: 'pending',
  VALIDATED: 'validated',
  REJECTED: 'rejected',
  COMPLETED: 'completed'
} as const

export const MERGE_STEPS = {
  VALIDATION: 'validation',
  PREPARATION: 'preparation', 
  EXECUTION: 'execution',
  COMPLETION: 'completion'
} as const