import { apiClient, type ApiResponse } from './apiClient';
import type {
  RecapWorksheetEntry,
  RecapWorksheetSummary,
  ExportRecapWorksheetRequest,
} from '@/types/recapWorksheet';

export const recapWorksheetApi = {
  getEntries: (numeroSession: number) =>
    apiClient.get<ApiResponse<RecapWorksheetEntry[]>>(
      `/api/recapWorksheet/entries/${numeroSession}`,
    ),

  generate: (numeroSession: number, dateComptable: Date) =>
    apiClient.post<ApiResponse<RecapWorksheetSummary>>(
      '/api/recapWorksheet/generate',
      {
        numeroSession,
        dateComptable,
      },
    ),

  export: (summary: RecapWorksheetSummary, format?: 'txt' | 'csv' | 'json') =>
    apiClient.post<Blob>(
      `/api/recapWorksheet/export${format ? `?format=${format}` : ''}`,
      { summary },
      { responseType: 'blob' },
    ),
};