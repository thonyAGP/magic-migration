import { apiClient, type ApiResponse } from './apiClient';
import type {
  DeviseSession,
  SaveEcartRequest,
  SaveEcartResponse,
  UpdateDeviseSessionRequest,
  UpdateDeviseSessionResponse,
} from '@/types/sessionEcart';

export const sessionEcartApi = {
  saveEcart: (data: SaveEcartRequest) =>
    apiClient.post<ApiResponse<SaveEcartResponse>>(
      '/api/session/ecart',
      data,
    ),

  getDeviseSession: (sessionId: number, deviseCode: string) =>
    apiClient.get<ApiResponse<DeviseSession>>(
      `/api/session/devise/${sessionId}/${deviseCode}`,
    ),

  updateDeviseSession: (data: UpdateDeviseSessionRequest) =>
    apiClient.put<ApiResponse<UpdateDeviseSessionResponse>>(
      `/api/session/${data.sessionId}/devise/${data.deviseCode}`,
      {
        soldePrecedent: data.soldePrecedent,
        unibi: data.unibi,
      },
    ),
};