import { apiClient, type ApiResponse } from './apiClient';
import type { ArticleType } from '@/types/transaction';
import type {
  MoyenPaiementCatalog,
  ForfaitData,
  PreCheckResult,
  EditionConfig,
  GiftPassResult,
  ResortCreditResult,
} from '@/types/transaction-lot2';
import type {
  CreateTransactionLot2Request,
  GiftPassCheckRequest,
  ResortCreditCheckRequest,
  CompleteTransactionRequest,
  TPERecoverRequest,
} from './types-lot2';

// Transaction Lot 2 endpoints (Vente GP / Boutique)
export const transactionLot2Api = {
  preCheck: () =>
    apiClient.get<ApiResponse<PreCheckResult>>(
      '/transactions/pre-check',
    ),
  getMoyenPaiements: () =>
    apiClient.get<ApiResponse<MoyenPaiementCatalog[]>>(
      '/moyen-paiements',
    ),
  getForfaits: (articleType: ArticleType) =>
    apiClient.get<ApiResponse<ForfaitData[]>>(
      `/forfaits?articleType=${articleType}`,
    ),
  getEditionConfig: () =>
    apiClient.get<ApiResponse<EditionConfig>>(
      '/terminal/edition-config',
    ),
  create: (data: CreateTransactionLot2Request) =>
    apiClient.post<ApiResponse<{ id: number }>>(
      '/transactions',
      data,
    ),
  checkGiftPass: (txId: number, data: GiftPassCheckRequest) =>
    apiClient.post<ApiResponse<GiftPassResult>>(
      `/transactions/${txId}/check-giftpass`,
      data,
    ),
  checkResortCredit: (txId: number, data: ResortCreditCheckRequest) =>
    apiClient.post<ApiResponse<ResortCreditResult>>(
      `/transactions/${txId}/check-resort-credit`,
      data,
    ),
  complete: (txId: number, data: CompleteTransactionRequest) =>
    apiClient.post<ApiResponse<void>>(
      `/transactions/${txId}/complete`,
      data,
    ),
  recoverTPE: (txId: number, data: TPERecoverRequest) =>
    apiClient.post<ApiResponse<void>>(
      `/transactions/${txId}/recover-tpe`,
      data,
    ),
};
