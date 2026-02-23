import { apiClient, type ApiResponse } from './apiClient';
import type {
  RecapFermetureSession,
  MontantComptable,
  GenerateTicketRequest,
} from '@/types/ticketFermetureSession';

export const ticketFermetureSessionApi = {
  getRecap: (societe: string, session: number) =>
    apiClient.get<ApiResponse<RecapFermetureSession>>(
      `/api/ticketFermetureSession/recap?societe=${societe}&session=${session}`,
    ),

  getMontants: (societe: string, session: number) =>
    apiClient.get<ApiResponse<MontantComptable[]>>(
      `/api/ticketFermetureSession/montants?societe=${societe}&session=${session}`,
    ),

  generateTicket: (data: GenerateTicketRequest) =>
    apiClient.post<ApiResponse<void>>(
      '/api/ticketFermetureSession/generate',
      data,
    ),
};