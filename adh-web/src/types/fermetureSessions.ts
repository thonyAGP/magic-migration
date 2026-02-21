// Fermeture Sessions types (ADH IDE 131)

export type SessionStatus = 'O' | 'C' | 'B'; // Open, Closed, Blocked

export interface Session {
  id: number;
  dateOuverture: Date;
  dateFermeture: Date | null;
  statut: SessionStatus;
}

export interface UnilateralBilateral {
  code: string;
  libelle: string;
  type: string;
}

export interface SessionClosureCode {
  sessionId: number;
  code: string;
  generatedAt: Date;
}

export interface SessionValidation {
  valid: boolean;
  errors: string[];
}

export interface SessionClosureResult {
  success: boolean;
  closureCode: string;
  sessionId: number;
  closedAt: Date;
}

// API Request/Response types

export interface FetchSessionsRequest {
  statut?: SessionStatus;
}

export interface FetchSessionsResponse {
  sessions: Session[];
}

export type FetchUnilateralBilateralRequest = Record<string, never>;

export interface FetchUnilateralBilateralResponse {
  types: UnilateralBilateral[];
}

export interface ValidateSessionClosureRequest {
  sessionId: number;
}

export interface ValidateSessionClosureResponse {
  valid: boolean;
  errors: string[];
}

export interface CloseSessionRequest {
  sessionId: number;
}

export interface CloseSessionResponse {
  success: boolean;
  closureCode: string;
}

// Store state interface

export interface FermetureSessionsState {
  sessions: Session[];
  currentSession: Session | null;
  unilateralBilateralTypes: UnilateralBilateral[];
  isLoading: boolean;
  error: string | null;
  isClosing: boolean;

  // Actions
  loadSessions: (filters?: FetchSessionsRequest) => Promise<void>;
  loadUnilateralBilateralTypes: () => Promise<void>;
  fermerSession: (sessionId: number) => Promise<void>;
  generateClosureCode: (sessionId: number) => string;
  validateSessionClosure: (sessionId: number) => Promise<boolean>;
  setCurrentSession: (session: Session | null) => void;
  clearError: () => void;
  reset: () => void;
}

// Mock data helpers

export const mockSession = (overrides?: Partial<Session>): Session => ({
  id: Math.floor(Math.random() * 10000),
  dateOuverture: new Date(2026, 1, 20),
  dateFermeture: null,
  statut: 'O',
  ...overrides,
});

export const mockUnilateralBilateral = (overrides?: Partial<UnilateralBilateral>): UnilateralBilateral => ({
  code: 'UNI',
  libelle: 'Unilateral',
  type: 'unilateral',
  ...overrides,
});

export const DEFAULT_SESSIONS: Session[] = [
  mockSession({ id: 1, dateOuverture: new Date(2026, 1, 19) }),
  mockSession({ id: 2, dateOuverture: new Date(2026, 1, 18) }),
  mockSession({ id: 3, dateOuverture: new Date(2026, 1, 17) }),
  mockSession({ id: 4, dateOuverture: new Date(2026, 1, 16) }),
  mockSession({ id: 5, dateOuverture: new Date(2026, 1, 15) }),
];

export const DEFAULT_UNILATERAL_BILATERAL: UnilateralBilateral[] = [
  mockUnilateralBilateral({ code: 'UNI', libelle: 'Unilateral', type: 'unilateral' }),
  mockUnilateralBilateral({ code: 'BIL', libelle: 'Bilateral', type: 'bilateral' }),
  mockUnilateralBilateral({ code: 'MIX', libelle: 'Mixed', type: 'mixed' }),
];