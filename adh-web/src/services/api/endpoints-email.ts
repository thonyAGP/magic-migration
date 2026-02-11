import { apiClient, type ApiResponse } from './apiClient';

export interface EmailSendRequest {
  to: string;
  subject: string;
  documentType: string;
  documentId: string;
  message?: string;
}

export const emailApi = {
  sendDocument: (req: EmailSendRequest) =>
    apiClient.post<ApiResponse<{ sent: boolean }>>('/email/send', req),
};
