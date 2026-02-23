import { apiClient, type ApiResponse } from './apiClient';
import type {
  GetMatriculeResponse,
} from '@/types/authentication';

export const authenticationApi = {
  getMatricule: (login: string) =>
    apiClient.get<ApiResponse<GetMatriculeResponse>>(
      `/authentication/matricule?login=${encodeURIComponent(login)}`,
    ),
};