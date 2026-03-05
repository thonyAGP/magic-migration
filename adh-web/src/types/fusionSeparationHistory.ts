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

export interface FusionSeparationHistoryGetResponse extends Array<FusionSeparationHistoryEntry> {}

export interface HistoFusionSeparationSaisieTable {
  iChronoEF: number
  iSociete: string
  iCompteReference: number
  iFiliationReference: number
  iComptePointeOld: number
  iFiliationPointeOld: number
  iComptePointeNew: number
  iFiliationPointeNew: number
  iTypeEF: string
  iNom: string
  iPrenom: string
}

export interface HistoFusionSeparationSaisieWriteRequest {
  data: HistoFusionSeparationSaisieTable
}

export type FusionSeparationHistoryApiEndpoints = {
  writeEntry: (request: FusionSeparationHistoryWriteRequest) => Promise<ApiResponse<void>>
  writeHistoFusionSeparationSaisie: (request: HistoFusionSeparationSaisieWriteRequest) => Promise<ApiResponse<void>>
}