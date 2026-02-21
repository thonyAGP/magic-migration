import { apiClient, type ApiResponse } from '@/services/api/apiClient';
import type {
  SessionConcurrency,
  RegisterSessionRequest,
  ReleaseSessionRequest,
  ForceOpenSessionRequest,
  CheckConcurrencyResponse,
  RegisterSessionResponse,
  ReleaseSessionResponse,
  ForceOpenSessionResponse,
} from '@/types/sessionConcurrency';

export const sessionConcurrencyApi = {
  getConcurrentSession: (terminal: string, devise?: string) =>
    apiClient.get<ApiResponse<SessionConcurrency | null>>(
      `/api/caisse/sessions/concurrent?terminal=${encodeURIComponent(terminal)}${devise ? `&devise=${encodeURIComponent(devise)}` : ''}`,
    ),

  checkConcurrency: (
    societe: string,
    compte: number,
    filiation: number,
  ) =>
    apiClient.get<CheckConcurrencyResponse>(
      `/api/caisse/sessions/check?societe=${encodeURIComponent(societe)}&compte=${compte}&filiation=${filiation}`,
    ),

  registerSession: (data: RegisterSessionRequest) =>
    apiClient.post<RegisterSessionResponse>(
      '/api/caisse/sessions/register',
      data,
    ),

  releaseSession: (data: ReleaseSessionRequest) =>
    apiClient.post<ReleaseSessionResponse>(
      '/api/caisse/sessions/release',
      data,
    ),

  forceOpenSession: (data: ForceOpenSessionRequest) =>
    apiClient.post<ForceOpenSessionResponse>(
      '/api/caisse/sessions/force-open',
      data,
    ),
};