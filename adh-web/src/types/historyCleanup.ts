import type { ApiResponse } from "@/services/api/apiClient"

export interface HistoFusionSeparationSaisie {
  chronoEF: number
  societe: string
  compteReference: number
  filiationReference: number
  comptePointeOld: number
  filiationPointeOld: number
  iComptePointeOld: number
  iFiliationPointeOld: number
}

export interface HistoFusionSeparationCriteria {
  chronoEF?: number
  societe?: string
  compteReference?: number
  filiationReference?: number
  comptePointeOld?: number
  filiationPointeOld?: number
  iComptePointeOld?: number
  iFiliationPointeOld?: number
}

export interface DeletionResult {
  recordsDeleted: number
  success: boolean
  timestamp: string
}

export interface HistoryCleanupState {
  isLoading: boolean
  error: string | null
  deletionCriteria: HistoFusionSeparationCriteria | null
  deletionResult: DeletionResult | null
}

export interface HistoryCleanupActions {
  deleteHistoFusionSeparationSaisie: (
    criteria: HistoFusionSeparationCriteria
  ) => Promise<DeletionResult>

  validateDeletionCriteria: (
    criteria: HistoFusionSeparationCriteria
  ) => Promise<boolean>
}

export interface AuditLogEntry {
  operation: "delete"
  table: "histo_Fus_Sep_Saisie"
  criteria: HistoFusionSeparationCriteria
  recordCount: number
  timestamp: string
  sessionId?: string
  userId?: string
}

export interface GlobalContext {
  sessionKey?: number
  currentSociete?: string
  operationContext?: {
    compteReference?: number
    filiationReference?: number
    comptePointeOld?: number
    filiationPointeOld?: number
    iComptePointeOld?: number
    iFiliationPointeOld?: number
  }
}

export type DeleteHistoFusionSeparationSaisieRequest = {
  criteria: HistoFusionSeparationCriteria
}

export type DeleteHistoFusionSeparationSaisieResponse = ApiResponse<DeletionResult>