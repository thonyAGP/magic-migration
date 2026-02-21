import { apiClient, type ApiResponse } from './apiClient';
import type {
  GetSessionTimestampResponse,
  GetSessionCurrentResponse,
  ValidateTimestampRequest,
  ValidateTimestampResponse,
} from '@/types/sessionTimestamp';

export const sessionTimestampApi = {
  getSessionTimestamp: () =>
    apiClient.get<ApiResponse<GetSessionTimestampResponse>>(
      '/api/session/timestamp',
    ),

  getSessionCurrent: () =>
    apiClient.get<ApiResponse<GetSessionCurrentResponse>>(
      '/api/session/current',
    ),

  validateTimestamp: (data: ValidateTimestampRequest) =>
    apiClient.post<ApiResponse<ValidateTimestampResponse>>(
      '/api/session/validate-timestamp',
      data,
    ),
};