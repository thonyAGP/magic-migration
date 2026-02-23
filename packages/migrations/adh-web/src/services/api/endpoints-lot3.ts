import { apiClient, type ApiResponse } from './apiClient';
import type {
  ExtraitAccountInfo,
  ExtraitTransaction,
  ExtraitSummary,
} from '@/types/extrait';
import type {
  Devise,
  DeviseStock,
  ChangeOperation,
  ChangeOperationSummary,
} from '@/types/change';
import type {
  PrintExtraitRequest,
  CreateChangeOperationRequest,
  CancelChangeOperationRequest,
} from './types-lot3';

// Extrait de compte endpoints (IDE 69)
export const extraitApi = {
  searchAccount: (societe: string, query: string) =>
    apiClient.get<ApiResponse<ExtraitAccountInfo[]>>(
      `/extrait/search?societe=${societe}&q=${encodeURIComponent(query)}`,
    ),
  getExtrait: (
    societe: string,
    codeAdherent: number,
    filiation: number,
    dateDebut?: string,
    dateFin?: string,
  ) =>
    apiClient.get<
      ApiResponse<{
        account: ExtraitAccountInfo;
        transactions: ExtraitTransaction[];
        summary: ExtraitSummary;
      }>
    >(
      `/extrait/${societe}/${codeAdherent}/${filiation}${dateDebut ? `?dateDebut=${dateDebut}` : ''}${dateFin ? `&dateFin=${dateFin}` : ''}`,
    ),
  printExtrait: (data: PrintExtraitRequest) =>
    apiClient.post<ApiResponse<{ jobId: string }>>(
      '/extrait/print',
      data,
    ),
};

// Change devises endpoints (IDE 25)
export const changeApi = {
  getDevises: (societe: string) =>
    apiClient.get<ApiResponse<Devise[]>>(
      `/change/taux/${societe}`,
    ),
  getStock: (societe: string) =>
    apiClient.get<ApiResponse<DeviseStock[]>>(
      `/devises/stock?societe=${societe}`,
    ),
  getOperations: (
    societe: string,
    dateDebut?: string,
    dateFin?: string,
  ) =>
    apiClient.get<
      ApiResponse<{
        operations: ChangeOperation[];
        summary: ChangeOperationSummary;
      }>
    >(
      `/change/operations?societe=${societe}${dateDebut ? `&dateDebut=${dateDebut}` : ''}${dateFin ? `&dateFin=${dateFin}` : ''}`,
    ),
  createOperation: (data: CreateChangeOperationRequest) =>
    apiClient.post<ApiResponse<{ id: number }>>(
      '/change/operations',
      data,
    ),
  cancelOperation: (id: number, data: CancelChangeOperationRequest) =>
    apiClient.post<ApiResponse<void>>(
      `/change/operations/${id}/cancel`,
      data,
    ),
  printReceipt: (operationId: number) =>
    apiClient.post<ApiResponse<{ jobId: string }>>(
      `/change/operations/${operationId}/print`,
      {},
    ),
};
