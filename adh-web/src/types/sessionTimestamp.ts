export interface SessionTimestamp {
  sessionDate: Date;
  sessionTime: string;
  timestamp: number;
}

export interface SessionInfo {
  sessionDate: Date;
  sessionTime: string;
  timestamp: number;
  sessionId: string;
  operatorId: string;
  isActive: boolean;
}

export interface SessionTimestampState {
  sessionDate: Date | null;
  sessionTime: string;
  timestamp: number;
  isLoading: boolean;
  error: string | null;
  getSessionTimestamp: () => Promise<void>;
  validateTimestamp: (timestamp: number) => Promise<boolean>;
  resetState: () => void;
}

export type GetSessionTimestampRequest = Record<string, never>;

export type GetSessionTimestampResponse = SessionTimestamp;

export type GetSessionCurrentRequest = Record<string, never>;

export type GetSessionCurrentResponse = SessionInfo;

export type ValidateTimestampRequest = {
  timestamp: number;
};

export type ValidateTimestampResponse = {
  isValid: boolean;
  message: string;
};