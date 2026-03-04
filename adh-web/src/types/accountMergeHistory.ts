import type { ApiResponse } from "@/services/api/apiClient";

export const OPERATION_TYPES = {
  ENTRY: 'E',
  FUSION: 'F',
  SEPARATION: 'S',
} as const;

export type OperationType = typeof OPERATION_TYPES[keyof typeof OPERATION_TYPES];

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

// RM-343: histo_fusionseparation_saisie table structure
export interface HistoFusionSeparationSaisie {
  id: number;
  companyCode: string;
  accountNumber: number;
  filiationNumber: number;
  targetAccountNumber: number;
  targetFiliationNumber: number;
  operationType: OperationType;
  operatorLastName: string;
  operatorFirstName: string;
  operatorFullName: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  remarks: string | null;
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

// RM-343: Create request for histo_fusionseparation_saisie
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

// RM-343: Response type for saisie history creation
export type CreateSaisieHistoryResponse = ApiResponse<HistoFusionSeparationSaisie>;

export interface GetHistoryByAccountRequest {
  accountNumber: number;
  filiationNumber?: number;
}

export type GetHistoryByAccountResponse = ApiResponse<FusionSeparationHistoryEntry[]>;

// RM-343: Get saisie history response
export type GetSaisieHistoryResponse = ApiResponse<HistoFusionSeparationSaisie[]>;

export interface GetHistoryByDateRangeRequest {
  startDate: Date;
  endDate: Date;
  operationType?: OperationType;
}

export type GetHistoryByDateRangeResponse = ApiResponse<FusionSeparationHistoryEntry[]>;

// RM-343: Get saisie history by date range
export interface GetSaisieHistoryByDateRangeRequest {
  startDate: Date;
  endDate: Date;
  operationType?: OperationType;
  status?: 'PENDING' | 'COMPLETED' | 'CANCELLED';
}

export type GetSaisieHistoryByDateRangeResponse = ApiResponse<HistoFusionSeparationSaisie[]>;

export interface AccountMergeHistoryState {
  isLoading: boolean;
  error: string | null;
  lastCreatedEntry: FusionSeparationHistoryEntry | null;
  historyEntries: FusionSeparationHistoryEntry[];
}

// RM-343: Extended state for saisie history
export interface ExtendedAccountMergeHistoryState extends AccountMergeHistoryState {
  saisieEntries: HistoFusionSeparationSaisie[];
  lastCreatedSaisieEntry: HistoFusionSeparationSaisie | null;
}

export interface AccountMergeHistoryActions {
  createHistoryEntry: (entry: Omit<FusionSeparationHistoryEntry, 'chronoId' | 'timestamp' | 'fullName'>) => Promise<FusionSeparationHistoryEntry>;
  getHistoryByAccount: (accountNumber: number, filiationNumber?: number) => Promise<FusionSeparationHistoryEntry[]>;
  getHistoryByDateRange: (startDate: Date, endDate: Date, operationType?: OperationType) => Promise<FusionSeparationHistoryEntry[]>;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setLastCreatedEntry: (entry: FusionSeparationHistoryEntry | null) => void;
  setHistoryEntries: (entries: FusionSeparationHistoryEntry[]) => void;
  clearState: () => void;
}

// RM-343: Extended actions for saisie history
export interface ExtendedAccountMergeHistoryActions extends AccountMergeHistoryActions {
  createSaisieHistoryEntry: (entry: CreateSaisieHistoryRequest) => Promise<HistoFusionSeparationSaisie>;
  getSaisieHistoryByAccount: (accountNumber: number, filiationNumber?: number) => Promise<HistoFusionSeparationSaisie[]>;
  getSaisieHistoryByDateRange: (startDate: Date, endDate: Date, operationType?: OperationType, status?: 'PENDING' | 'COMPLETED' | 'CANCELLED') => Promise<HistoFusionSeparationSaisie[]>;
  updateSaisieHistoryStatus: (id: number, status: 'PENDING' | 'COMPLETED' | 'CANCELLED') => Promise<HistoFusionSeparationSaisie>;
  setSaisieEntries: (entries: HistoFusionSeparationSaisie[]) => void;
  setLastCreatedSaisieEntry: (entry: HistoFusionSeparationSaisie | null) => void;
}

export type AccountMergeHistoryStore = AccountMergeHistoryState & AccountMergeHistoryActions;

// RM-343: Extended store type
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
    operationType: rand([OPERATION_TYPES.FUSION, OPERATION_TYPES.SEPARATION]),
    lastName,
    firstName,
    fullName: `${lastName} ${firstName}`.trim(),
    timestamp: new Date(Date.now() - (Math.floor(Math.random() * 30) + 1) * 24 * 60 * 60 * 1000),
  } as FusionSeparationHistoryEntry;
});

// RM-343: Mock saisie history entries
export const mockSaisieHistoryEntries = Array.from({ length: 5 }, (_, i) => {
  const lastName = rand(LAST_NAMES);
  const firstName = rand(FIRST_NAMES);

  return {
    id: i + 1,
    companyCode: String(((i % 5) + 1)).padStart(2, '0'),
    accountNumber: Math.floor(Math.random() * 8000) + 1000,
    filiationNumber: (i % 5) + 1,
    targetAccountNumber: Math.floor(Math.random() * 8000) + 1000,
    targetFiliationNumber: (i % 5) + 1,
    operationType: rand([OPERATION_TYPES.FUSION, OPERATION_TYPES.SEPARATION]),
    operatorLastName: lastName,
    operatorFirstName: firstName,
    operatorFullName: `${lastName} ${firstName}`.trim(),
    createdAt: new Date(Date.now() - (Math.floor(Math.random() * 30) + 1) * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - (Math.floor(Math.random() * 15) + 1) * 24 * 60 * 60 * 1000),
    status: rand(['PENDING', 'COMPLETED', 'CANCELLED'] as const),
    remarks: Math.random() > 0.5 ? `Remarque ${i + 1}` : null,
  } as HistoFusionSeparationSaisie;
});