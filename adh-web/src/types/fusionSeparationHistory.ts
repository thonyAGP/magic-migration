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

export type FusionSeparationHistoryApiEndpoints = {
  writeEntry: (request: FusionSeparationHistoryWriteRequest) => Promise<void> // SPEC-FIX
}