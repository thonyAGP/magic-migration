import type { ApiResponse } from "@/services/api/apiClient"

export interface FusionSeparationHistoryEntry {
  chronoEF: number
  societe: string
  compteReference: number
  filiationReference: number
  comptePointeOld: number
  filiationPointeOld: number
  comptePointeNew: number
  filiationPointeNew: number
  typeEF: string
  nom: string
  prenom: string
}

export interface FusionSeparationHistoryState {
  // SPEC-FIX: Removed historyEntries - spec shows R:0 (no read operations, write-only table)
  isLoading: boolean
  error: string | null
  currentEntry: FusionSeparationHistoryEntry | null
  writeHistoryEntry: (entry: FusionSeparationHistoryEntry) => Promise<void>
  formatFullName: (nom: string, prenom: string) => string
  setCurrentEntry: (entry: FusionSeparationHistoryEntry) => void
}

export interface FusionSeparationHistoryWriteRequest {
  entry: FusionSeparationHistoryEntry
}

// SPEC-FIX: Removed getEntries endpoint - spec indicates W:1 R:0 L:0 (write-only, no read operations)
export type FusionSeparationHistoryApiEndpoints = {
  writeEntry: ApiResponse<FusionSeparationHistoryWriteRequest, void>
}