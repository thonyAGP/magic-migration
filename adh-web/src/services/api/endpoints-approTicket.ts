import { apiClient } from './apiClient';
import type {
  ApproTicketData,
  ApproTicketGenerateRequest,
  ApproTicketGenerateResponse,
  ApproTicketPrintResponse,
} from '@/types/approTicket';

export const approTicketApi = {
  generateApproTicket: (data: ApproTicketGenerateRequest) =>
    apiClient.post<ApproTicketGenerateResponse>(
      '/api/appro-ticket/generate',
      {
        ...data,
        date: data.date instanceof Date ? data.date.toISOString() : data.date,
      },
    ),

  printApproTicket: (
    ticketData: ApproTicketData,
    format: 'pdf' | 'escpos',
  ) =>
    apiClient.post<ApproTicketPrintResponse>(
      `/api/appro-ticket/print?format=${format}`,
      {
        ticketData,
        format,
      },
    ),
};