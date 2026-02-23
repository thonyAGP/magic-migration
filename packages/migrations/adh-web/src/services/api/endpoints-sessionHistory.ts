import { apiClient } from "./apiClient";
import type {
  GetSessionHistoryResponse,
  GetSessionDetailsResponse,
  GetSessionCurrenciesResponse,
} from "@/types/sessionHistory";

const formatDateParam = (date: Date | undefined): string | undefined => {
  if (!date) return undefined;
  return date.toISOString().split("T")[0];
};

export const sessionHistoryApi = {
  getSessionHistory: (
    societe: string,
    startDate?: Date,
    endDate?: Date,
    status?: string,
    operatorId?: string,
  ): Promise<GetSessionHistoryResponse> => {
    const params = new URLSearchParams();
    params.append("societe", societe);

    if (startDate) {
      params.append("startDate", formatDateParam(startDate) || "");
    }
    if (endDate) {
      params.append("endDate", formatDateParam(endDate) || "");
    }
    if (status) {
      params.append("status", status);
    }
    if (operatorId) {
      params.append("operatorId", operatorId);
    }

    return apiClient.get<GetSessionHistoryResponse>(
      `/api/caisse/sessions/history?${params.toString()}`,
    );
  },

  getSessionDetails: (
    sessionId: string,
  ): Promise<GetSessionDetailsResponse> =>
    apiClient.get<GetSessionDetailsResponse>(
      `/api/caisse/sessions/history/${encodeURIComponent(sessionId)}/details`,
    ),

  getSessionCurrencies: (
    sessionId: string,
  ): Promise<GetSessionCurrenciesResponse> =>
    apiClient.get<GetSessionCurrenciesResponse>(
      `/api/caisse/sessions/history/${encodeURIComponent(sessionId)}/currencies`,
    ),
};