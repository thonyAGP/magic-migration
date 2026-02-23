import { apiClient } from './apiClient';
import type {
  LogSessionDetailResponse,
} from '@/types/sessionDetail';

export const sessionDetailApi = {
  logSessionDetail: (data: LogSessionDetailRequest): Promise<LogSessionDetailResponse> =>
    apiClient.post<LogSessionDetailResponse>(
      '/api/session-detail/log',
      data,
    ),
};