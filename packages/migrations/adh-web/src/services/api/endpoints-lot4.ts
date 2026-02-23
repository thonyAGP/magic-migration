import { apiClient, type ApiResponse } from './apiClient';
import type {
  Garantie,
  GarantieOperation,
  GarantieSummaryData,
  GarantieSearchResult,
} from '@/types/garantie';
import type {
  Facture,
  FactureSummary,
  FactureSearchResult,
} from '@/types/facture';
import type {
  CreateGarantieRequest,
  GarantieVersementRequest,
  GarantieRetraitRequest,
  CancelGarantieRequest,
  CreateFactureRequest,
  UpdateFactureLigneRequest,
  ValidateFactureRequest,
} from './types-lot4';

// Garantie endpoints (IDE 111)
export const garantieApi = {
  search: (societe: string, query: string) =>
    apiClient.get<ApiResponse<GarantieSearchResult>>(
      `/garanties/search?societe=${societe}&q=${encodeURIComponent(query)}`,
    ),
  getById: (id: number) =>
    apiClient.get<ApiResponse<Garantie>>(`/garanties/${id}`),
  getOperations: (garantieId: number) =>
    apiClient.get<ApiResponse<GarantieOperation[]>>(
      `/garanties/${garantieId}/operations`,
    ),
  getSummary: (societe: string) =>
    apiClient.get<ApiResponse<GarantieSummaryData>>(
      `/garanties/summary?societe=${societe}`,
    ),
  create: (data: CreateGarantieRequest) =>
    apiClient.post<ApiResponse<{ id: number }>>('/garanties', data),
  versement: (garantieId: number, data: GarantieVersementRequest) =>
    apiClient.post<ApiResponse<void>>(
      `/garanties/${garantieId}/versement`,
      data,
    ),
  retrait: (garantieId: number, data: GarantieRetraitRequest) =>
    apiClient.post<ApiResponse<void>>(
      `/garanties/${garantieId}/retrait`,
      data,
    ),
  cancel: (garantieId: number, data: CancelGarantieRequest) =>
    apiClient.post<ApiResponse<void>>(
      `/garanties/${garantieId}/cancel`,
      data,
    ),
  printReceipt: (garantieId: number) =>
    apiClient.post<ApiResponse<{ jobId: string }>>(
      `/garanties/${garantieId}/print`,
      {},
    ),
};

// Facture TVA endpoints (IDE 97)
export const factureApi = {
  search: (
    societe: string,
    query?: string,
    dateDebut?: string,
    dateFin?: string,
  ) =>
    apiClient.get<ApiResponse<FactureSearchResult>>(
      `/factures/search?societe=${societe}${query ? `&q=${encodeURIComponent(query)}` : ''}${dateDebut ? `&dateDebut=${dateDebut}` : ''}${dateFin ? `&dateFin=${dateFin}` : ''}`,
    ),
  getById: (id: number) =>
    apiClient.get<ApiResponse<Facture>>(`/factures/${id}`),
  create: (data: CreateFactureRequest) =>
    apiClient.post<ApiResponse<{ id: number; reference: string }>>(
      '/factures',
      data,
    ),
  updateLignes: (factureId: number, data: UpdateFactureLigneRequest) =>
    apiClient.put<ApiResponse<FactureSummary>>(
      `/factures/${factureId}/lignes`,
      data,
    ),
  validate: (factureId: number, data: ValidateFactureRequest) =>
    apiClient.post<ApiResponse<void>>(
      `/factures/${factureId}/validate`,
      data,
    ),
  cancel: (factureId: number, motif: string) =>
    apiClient.post<ApiResponse<void>>(
      `/factures/${factureId}/cancel`,
      { motif },
    ),
  print: (factureId: number) =>
    apiClient.post<ApiResponse<{ jobId: string }>>(
      `/factures/${factureId}/print`,
      {},
    ),
  getTVABreakdown: (factureId: number) =>
    apiClient.get<ApiResponse<FactureSummary>>(
      `/factures/${factureId}/tva`,
    ),
};
