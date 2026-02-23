import { apiClient, type ApiResponse } from "./apiClient";
import type {
  CheckStringRequest,
  CheckStringResponse,
  ForbiddenCharactersResponse,
  ValidateCharactersResponse,
} from "@/types/characterValidation";

export const characterValidationApi = {
  getForbiddenCharacters: () =>
    apiClient.get<ApiResponse<ForbiddenCharactersResponse>>(
      "/api/validation/forbidden-characters",
    ),

  checkString: (data: CheckStringRequest) =>
    apiClient.post<ApiResponse<CheckStringResponse>>(
      "/api/validation/check-string",
      data,
    ),

  validateCharacters: (input: string) =>
    apiClient.post<ApiResponse<ValidateCharactersResponse>>(
      "/api/validation/check-string",
      { input } as CheckStringRequest,
    ),
};