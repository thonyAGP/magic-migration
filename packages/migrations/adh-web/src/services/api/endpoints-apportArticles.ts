import { apiClient, type ApiResponse } from "@/services/api/apiClient";
import type {
  ApportArticlesRequest,
} from "@/types/apportArticles";

export const apportArticlesApi = {
  submitApport: (data: ApportArticlesRequest) =>
    apiClient.post<ApiResponse<ApportArticlesResponse>>(
      "/api/caisse/operations/apport-articles",
      data,
    ),
};