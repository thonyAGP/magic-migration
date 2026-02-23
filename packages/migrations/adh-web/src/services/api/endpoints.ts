import { apiClient, type ApiResponse } from './apiClient';
import type {
  Session,
  OpenSessionRequest,
  CloseSessionRequest,
  SessionSummary,
  SessionDetailsResponse,
  Transaction,
  CreateTransactionRequest,
  Denomination,
  SaveCountingRequest,
  DeviseInfo,
  Account,
  ExtraitCompte,
  PaginationParams,
} from './types';

// Session endpoints
export const sessionApi = {
  getCurrent: () =>
    apiClient.get<ApiResponse<Session>>('/sessions/current'),
  open: (data: OpenSessionRequest) =>
    apiClient.post<ApiResponse<Session>>('/sessions/ouvrir', data),
  close: (data: CloseSessionRequest) =>
    apiClient.post<ApiResponse<void>>('/sessions/fermer', data),
  getHistory: (params: PaginationParams & { caisseId?: number }) =>
    apiClient.get<ApiResponse<SessionSummary[]>>('/sessions', {
      params,
    }),
  getDetails: (sessionId: number) =>
    apiClient.get<ApiResponse<SessionDetailsResponse>>(
      `/sessions/${sessionId}/details`,
    ),
};

// Transaction endpoints
export const transactionApi = {
  create: (data: CreateTransactionRequest) =>
    apiClient.post<ApiResponse<Transaction>>('/transactions', data),
  getBySession: (sessionId: number) =>
    apiClient.get<ApiResponse<Transaction[]>>(
      `/sessions/${sessionId}/transactions`,
    ),
};

// Denomination endpoints
export const denominationApi = {
  getByDevise: (deviseCode: string) =>
    apiClient.get<ApiResponse<Denomination[]>>(
      `/denominations/${deviseCode}`,
    ),
  getCatalog: () =>
    apiClient.get<ApiResponse<DeviseInfo[]>>('/denominations/catalog'),
  saveCounting: (data: SaveCountingRequest) =>
    apiClient.post<ApiResponse<void>>('/denominations/counting', data),
};

// Account endpoints
export const accountApi = {
  search: (query: string) =>
    apiClient.get<ApiResponse<Account[]>>('/accounts/search', {
      params: { q: query },
    }),
  getExtrait: (accountId: number) =>
    apiClient.get<ApiResponse<ExtraitCompte>>(
      `/accounts/${accountId}/extrait`,
    ),
};

// Lot 2 endpoints re-export
export { transactionLot2Api } from './endpoints-lot2';
