import { create } from 'zustand';
import type {
  SessionTimestamp,
  SessionInfo,
  GetSessionTimestampResponse,
  ValidateTimestampResponse,
} from '@/types/sessionTimestamp';
import { apiClient } from '@/services/api/apiClient';
import type { ApiResponse } from '@/services/api/apiClient';
import { useDataSourceStore } from '@/stores/dataSourceStore';

interface SessionTimestampState {
  sessionDate: Date | null;
  sessionTime: string;
  timestamp: number;
  isLoading: boolean;
  error: string | null;
}

interface SessionTimestampActions {
  getSessionTimestamp: () => Promise<void>;
  validateTimestamp: (timestamp: number) => Promise<boolean>;
  resetState: () => void;
}

type SessionTimestampStore = SessionTimestampState & SessionTimestampActions;

const MOCK_SESSION_TIMESTAMP: SessionTimestamp = {
  sessionDate: new Date('2026-02-21T09:15:00'),
  sessionTime: '09:15',
  timestamp: 20260221091500,
};

const _MOCK_SESSION_INFO: SessionInfo = {
  sessionDate: new Date('2026-02-21T09:15:00'),
  sessionTime: '09:15',
  timestamp: 20260221091500,
  sessionId: 'SES-2026-02-21-001',
  operatorId: 'OPR-123',
  isActive: true,
};

const initialState: SessionTimestampState = {
  sessionDate: null,
  sessionTime: '',
  timestamp: 0,
  isLoading: false,
  error: null,
};

export const useSessionTimestampStore = create<SessionTimestampStore>()((set) => ({
  ...initialState,

  getSessionTimestamp: async () => {
    const { isRealApi } = useDataSourceStore.getState();
    set({ isLoading: true, error: null });

    if (!isRealApi) {
      set({
        sessionDate: MOCK_SESSION_TIMESTAMP.sessionDate,
        sessionTime: MOCK_SESSION_TIMESTAMP.sessionTime,
        timestamp: MOCK_SESSION_TIMESTAMP.timestamp,
        isLoading: false,
      });
      return;
    }

    try {
      const response: ApiResponse<GetSessionTimestampResponse> = await apiClient.get(
        '/api/session/timestamp',
      );
      const data = response.data;
      set({
        sessionDate: new Date(data.sessionDate),
        sessionTime: data.sessionTime,
        timestamp: data.timestamp,
      });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur récupération timestamp session';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  validateTimestamp: async (timestamp: number) => {
    const { isRealApi } = useDataSourceStore.getState();

    if (!isRealApi) {
      const currentTimestamp = MOCK_SESSION_TIMESTAMP.timestamp;
      const diffMinutes = Math.abs(timestamp - currentTimestamp) / 100;
      return diffMinutes <= 1440;
    }

    try {
      const response: ApiResponse<ValidateTimestampResponse> = await apiClient.post(
        '/api/session/validate-timestamp',
        { timestamp },
      );
      return response.data.isValid;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur validation timestamp';
      set({ error: message });
      return false;
    }
  },

  resetState: () => set({ ...initialState }),
}));