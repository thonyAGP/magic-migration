import { apiClient, type ApiResponse } from './apiClient';
import type {
  ClubMedPass,
  PassTransaction,
  PassValidationResult,
  PassSummary,
  PassCreationData,
  PassOppositionData,
} from '@/types/clubmedpass';
import type {
  CustomerSearchResult,
  DataCatchSession,
  DataCatchSummary,
  GuestData,
  VillageConfig,
  SystemStatus,
} from '@/types/datacatch';
import type {
  ValidatePassRequest,
  ScanPassRequest,
  SearchCustomerRequest,
  CreateDataCatchSessionRequest,
  SavePersonalInfoRequest,
  SaveAddressRequest,
  SavePreferencesRequest,
} from './types-lot5';

// Club Med Pass endpoints (IDE 77)
export const passApi = {
  validate: (data: ValidatePassRequest) =>
    apiClient.post<ApiResponse<PassValidationResult>>('/pass/validate', data),
  getByNumber: (numeroPass: string) =>
    apiClient.get<ApiResponse<ClubMedPass>>(
      `/pass/${encodeURIComponent(numeroPass)}`,
    ),
  getTransactions: (numeroPass: string, limit?: number) =>
    apiClient.get<ApiResponse<PassTransaction[]>>(
      `/pass/${encodeURIComponent(numeroPass)}/transactions${limit ? `?limit=${limit}` : ''}`,
    ),
  scan: (data: ScanPassRequest) =>
    apiClient.post<ApiResponse<ClubMedPass>>('/pass/scan', data),
  getSummary: (societe: string) =>
    apiClient.get<ApiResponse<PassSummary>>(
      `/pass/summary?societe=${societe}`,
    ),
  create: (data: PassCreationData) =>
    apiClient.post<ApiResponse<ClubMedPass>>('/pass', data),
  oppose: (data: PassOppositionData) =>
    apiClient.post<ApiResponse<void>>('/pass/oppose', data),
  delete: (passId: string) =>
    apiClient.delete<ApiResponse<void>>(
      `/pass/${encodeURIComponent(passId)}`,
    ),
};

// Data Catching endpoints (IDE 7)
export const datacatchApi = {
  searchCustomer: (data: SearchCustomerRequest) =>
    apiClient.post<ApiResponse<CustomerSearchResult[]>>(
      '/datacatch/search',
      data,
    ),
  getCustomer: (customerId: number) =>
    apiClient.get<ApiResponse<DataCatchSession>>(
      `/datacatch/customer/${customerId}`,
    ),
  createSession: (data: CreateDataCatchSessionRequest) =>
    apiClient.post<ApiResponse<{ sessionId: string }>>(
      '/datacatch/session',
      data,
    ),
  getSession: (sessionId: string) =>
    apiClient.get<ApiResponse<DataCatchSession>>(
      `/datacatch/session/${sessionId}`,
    ),
  savePersonalInfo: (sessionId: string, data: SavePersonalInfoRequest) =>
    apiClient.put<ApiResponse<void>>(
      `/datacatch/session/${sessionId}/personal`,
      data,
    ),
  saveAddress: (sessionId: string, data: SaveAddressRequest) =>
    apiClient.put<ApiResponse<void>>(
      `/datacatch/session/${sessionId}/address`,
      data,
    ),
  savePreferences: (sessionId: string, data: SavePreferencesRequest) =>
    apiClient.put<ApiResponse<void>>(
      `/datacatch/session/${sessionId}/preferences`,
      data,
    ),
  completeSession: (sessionId: string) =>
    apiClient.post<ApiResponse<void>>(
      `/datacatch/session/${sessionId}/complete`,
      {},
    ),
  cancelSession: (sessionId: string) =>
    apiClient.post<ApiResponse<void>>(
      `/datacatch/session/${sessionId}/cancel`,
      {},
    ),
  getSummary: (societe: string) =>
    apiClient.get<ApiResponse<DataCatchSummary>>(
      `/datacatch/summary?societe=${societe}`,
    ),
  // Checkout endpoints (IDE 8)
  getGuest: (guestId: string) =>
    apiClient.get<ApiResponse<GuestData>>(
      `/datacatch/guest/${encodeURIComponent(guestId)}`,
    ),
  acceptCheckout: (guestId: string) =>
    apiClient.post<ApiResponse<void>>(
      `/datacatch/guest/${encodeURIComponent(guestId)}/checkout/accept`,
      {},
    ),
  declineCheckout: (guestId: string, reason: string) =>
    apiClient.post<ApiResponse<void>>(
      `/datacatch/guest/${encodeURIComponent(guestId)}/checkout/decline`,
      { reason },
    ),
  cancelPass: (guestId: string) =>
    apiClient.post<ApiResponse<void>>(
      `/datacatch/guest/${encodeURIComponent(guestId)}/pass/cancel`,
      {},
    ),
  // Village config endpoints (IDE 9)
  getVillageConfig: () =>
    apiClient.get<ApiResponse<VillageConfig>>('/datacatch/village/config'),
  getSystemStatus: () =>
    apiClient.get<ApiResponse<SystemStatus>>('/datacatch/system/status'),
};
