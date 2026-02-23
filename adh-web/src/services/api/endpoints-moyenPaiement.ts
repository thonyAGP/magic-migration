import { apiClient, type ApiResponse } from "@/services/api/apiClient";
import type {
  MoyenPaiement,
  MOPInfo,
  MOPExistsResponse,
  TypeDevise,
} from "@/types/moyenPaiement";

export const moyenPaiementApi = {
  getMOPInfo: (code: string, typeDevise?: TypeDevise) => {
    const params = new URLSearchParams({ code });
    if (typeDevise) {
      params.append("typeDevise", typeDevise);
    }
    return apiClient.get<ApiResponse<MOPInfo>>(
      `/api/moyenpaiement/info?${params.toString()}`,
    );
  },

  getMOPByCode: (code: string) =>
    apiClient.get<ApiResponse<MoyenPaiement>>(
      `/api/moyenpaiement/${encodeURIComponent(code)}`,
    ),

  checkMOPExists: (code: string, societe: string) => {
    const params = new URLSearchParams({ code, societe });
    return apiClient.get<ApiResponse<MOPExistsResponse>>(
      `/api/moyenpaiement/exists?${params.toString()}`,
    );
  },
};