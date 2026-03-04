import type { ApiResponse } from "@/services/api/apiClient";

export const OPERATION_TYPES = {
  ENTRY: 'E',
  FUSION: 'F',
} as const;

export type OperationType = typeof OPERATION_TYPES[keyof typeof OPERATION_TYPES];

// SPEC-FIX: Updated interface to match only 6 columns from table 343 that are actually used (A-F)
export interface HistoFusionSeparationSaisie {
  chronoEF: number; // i chrono E/F [A]
  societe: string; // i societe [B]
  compteReference: number; // i compte reference [C]
  filiationReference: number; // i filiation reference [D]
  comptePointeOld: number; // i compte pointe old [E]
  filiationPointeOld: number; // i filiation pointe old [F]
}

export interface DeleteHistoFusionSeparationRequest {
  chronoEF?: number;
  societe?: string;
  compteReference?: number;
  filiationReference?: number;
  comptePointeOld?: number;
  filiationPointeOld?: number;
}

export type DeleteHistoFusionSeparationResponse = ApiResponse<{ deletedCount: number }>;

// SPEC-FIX: Write request matching only 6 variables from spec that are actually used (A-F)
export interface WriteHistoFusionSeparationRequest {
  chronoEF: number;
  societe: string;
  compteReference: number;
  filiationReference: number;
  comptePointeOld: number;
  filiationPointeOld: number;
}

export type WriteHistoFusionSeparationResponse = ApiResponse<HistoFusionSeparationSaisie>;

export interface FusionSeparationHistoryEntry {
  chronoId: number;
  companyCode: string;
  referenceAccount: number;
  referenceFiliation: number;
  oldPointedAccount: number;
  oldPointedFiliation: number;
  newPointedAccount: number;
  newPointedFiliation: number;
  operationType: OperationType;
  lastName: string;
  firstName: string;
  fullName: string;
  timestamp: Date;
}

export interface CreateHistoryEntryRequest {
  companyCode: string;
  referenceAccount: number;
  referenceFiliation: number;
  oldPointedAccount: number;
  oldPointedFiliation: number;
  newPointedAccount: number;
  newPointedFiliation: number;
  operationType: OperationType;
  lastName: string;
  firstName: string;
}

export interface CreateSaisieHistoryRequest {
  companyCode: string;
  accountNumber: number;
  filiationNumber: number;
  targetAccountNumber: number;
  targetFiliationNumber: number;
  operationType: OperationType;
  operatorLastName: string;
  operatorFirstName: string;
  remarks?: string;
}

export type CreateHistoryEntryResponse = ApiResponse<FusionSeparationHistoryEntry>;
export type CreateSaisieHistoryResponse = ApiResponse<HistoFusionSeparationSaisie>;

export interface GetHistoryByAccountRequest {
  accountNumber: number;
  filiationNumber?: number;
}

export type GetHistoryByAccountResponse = ApiResponse<FusionSeparationHistoryEntry[]>;
export type GetSaisieHistoryResponse = ApiResponse<HistoFusionSeparationSaisie[]>;

export interface GetHistoryByDateRangeRequest {
  startDate: Date;
  endDate: Date;
  operationType?: OperationType;
}

export type GetHistoryByDateRangeResponse = ApiResponse<FusionSeparationHistoryEntry[]>;

export interface GetSaisieHistoryByDateRangeRequest {
  startDate: Date;
  endDate: Date;
  operationType?: OperationType;
  status?: 'PENDING' | 'COMPLETED' | 'CANCELLED';
}

export type GetSaisieHistoryByDateRangeResponse = ApiResponse<HistoFusionSeparationSaisie[]>;

// SPEC-FIX: State focused on delete operations as per spec - this program deletes from table
export interface AccountMergeHistoryState {
  isLoading: boolean;
  error: string | null;
  lastDeletedCount: number;
  historyEntries: FusionSeparationHistoryEntry[];
}

export interface ExtendedAccountMergeHistoryState extends AccountMergeHistoryState {
  saisieEntries: HistoFusionSeparationSaisie[];
  lastCreatedSaisieEntry: HistoFusionSeparationSaisie | null;
}

// SPEC-FIX: Actions focused on delete operations as per spec - primary function is deleting history
export interface AccountMergeHistoryActions {
  deleteHistoEntries: (criteria: DeleteHistoFusionSeparationRequest) => Promise<{ deletedCount: number }>;
  writeHistoEntry: (entry: WriteHistoFusionSeparationRequest) => Promise<HistoFusionSeparationSaisie>;
  createHistoryEntry: (entry: Omit<FusionSeparationHistoryEntry, 'chronoId' | 'timestamp' | 'fullName'>) => Promise<FusionSeparationHistoryEntry>;
  getHistoryByAccount: (accountNumber: number, filiationNumber?: number) => Promise<FusionSeparationHistoryEntry[]>;
  getHistoryByDateRange: (startDate: Date, endDate: Date, operationType?: OperationType) => Promise<FusionSeparationHistoryEntry[]>;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setLastDeletedCount: (count: number) => void;
  setHistoryEntries: (entries: FusionSeparationHistoryEntry[]) => void;
  clearState: () => void;
}

export interface ExtendedAccountMergeHistoryActions extends AccountMergeHistoryActions {
  createSaisieHistoryEntry: (entry: CreateSaisieHistoryRequest) => Promise<HistoFusionSeparationSaisie>;
  getSaisieHistoryByAccount: (accountNumber: number, filiationNumber?: number) => Promise<HistoFusionSeparationSaisie[]>;
  getSaisieHistoryByDateRange: (startDate: Date, endDate: Date, operationType?: OperationType, status?: 'PENDING' | 'COMPLETED' | 'CANCELLED') => Promise<HistoFusionSeparationSaisie[]>;
  updateSaisieHistoryStatus: (id: number, status: 'PENDING' | 'COMPLETED' | 'CANCELLED') => Promise<HistoFusionSeparationSaisie>;
  setSaisieEntries: (entries: HistoFusionSeparationSaisie[]) => void;
  setLastCreatedSaisieEntry: (entry: HistoFusionSeparationSaisie | null) => void;
}

export type AccountMergeHistoryStore = AccountMergeHistoryState & AccountMergeHistoryActions;
export type ExtendedAccountMergeHistoryStore = ExtendedAccountMergeHistoryState & ExtendedAccountMergeHistoryActions;

const FIRST_NAMES = ['Jean', 'Marie', 'Pierre', 'Sophie', 'Luc', 'Anne', 'Marc', 'Claire'] as const;
const LAST_NAMES = ['Dupont', 'Martin', 'Bernard', 'Thomas', 'Robert', 'Richard', 'Petit', 'Durand'] as const;

const rand = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const mockHistoryEntries = Array.from({ length: 5 }, (_, i) => {
  const lastName = rand(LAST_NAMES);
  const firstName = rand(FIRST_NAMES);

  return {
    chronoId: i + 1,
    companyCode: String(((i % 5) + 1)).padStart(2, '0'),
    referenceAccount: Math.floor(Math.random() * 8000) + 1000,
    referenceFiliation: (i % 5) + 1,
    oldPointedAccount: Math.floor(Math.random() * 8000) + 1000,
    oldPointedFiliation: (i % 5) + 1,
    newPointedAccount: Math.floor(Math.random() * 8000) + 1000,
    newPointedFiliation: (i % 5) + 1,
    operationType: rand([OPERATION_TYPES.FUSION, OPERATION_TYPES.ENTRY]),
    lastName,
    firstName,
    fullName: `${lastName} ${firstName}`.trim(),
    timestamp: new Date(Date.now() - (Math.floor(Math.random() * 30) + 1) * 24 * 60 * 60 * 1000),
  } as FusionSeparationHistoryEntry;
});

// SPEC-FIX: Mock data matching only 6 columns from table 343 structure (A-F) that are actually used
export const mockSaisieHistoryEntries = Array.from({ length: 5 }, (_, i) => {
  return {
    chronoEF: i + 1,
    societe: String(((i % 5) + 1)).padStart(2, '0'),
    compteReference: Math.floor(Math.random() * 8000) + 1000,
    filiationReference: (i % 5) + 1,
    comptePointeOld: Math.floor(Math.random() * 8000) + 1000,
    filiationPointeOld: (i % 5) + 1,
  } as HistoFusionSeparationSaisie;
});