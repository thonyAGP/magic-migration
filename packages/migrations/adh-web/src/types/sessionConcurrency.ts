import type { ApiResponse } from "@/services/api/apiClient";

export type SessionConcurrencyCodeCalcul = 'C' | 'D';

export interface SessionConcurrency {
  societe: string;
  compte: number;
  filiation: number;
  terminalId: string;
  timestamp: Date;
  codeCalcul: string | null;
  coffreEnCoursComptage: boolean;
}

export interface SessionConflictResult {
  allowed: boolean;
  conflictingSession?: SessionConcurrency;
  reason?: string;
}

export interface RegisterSessionRequest {
  societe: string;
  compte: number;
  filiation: number;
  terminalId: string;
  codeCalcul: SessionConcurrencyCodeCalcul;
}

export interface ReleaseSessionRequest {
  societe: string;
  compte: number;
  filiation: number;
  terminalId: string;
}

export interface ForceOpenSessionRequest {
  societe: string;
  compte: number;
  filiation: number;
  terminalId: string;
  reason: string;
}

export interface CheckConcurrencyResponse extends ApiResponse {
  data: SessionConflictResult;
}

export interface RegisterSessionResponse extends ApiResponse {
  data: {
    success: boolean;
  };
}

export interface ReleaseSessionResponse extends ApiResponse {
  data: {
    success: boolean;
  };
}

export interface ForceOpenSessionResponse extends ApiResponse {
  data: {
    success: boolean;
  };
}

export interface SessionConcurrencyState {
  activeSessions: SessionConcurrency[];
  isLoading: boolean;
  error: string | null;
  conflictDetected: boolean;
  conflictingSession: SessionConcurrency | null;
  checkConcurrency: (
    societe: string,
    compte: number,
    filiation: number
  ) => Promise<SessionConflictResult>;
  registerSession: (
    societe: string,
    compte: number,
    filiation: number,
    terminalId: string,
    codeCalcul: SessionConcurrencyCodeCalcul
  ) => Promise<void>;
  releaseSession: (
    societe: string,
    compte: number,
    filiation: number,
    terminalId: string
  ) => Promise<void>;
  forceOpenSession: (
    societe: string,
    compte: number,
    filiation: number,
    terminalId: string,
    reason: string
  ) => Promise<void>;
  setError: (error: string | null) => void;
  clearConflict: () => void;
}