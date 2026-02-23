import type { ApiResponse } from "@/services/api/apiClient";

// Domain enums as const
export const SESSION_STEPS = {
  COMPTAGE: "comptage",
  VALIDATION: "validation",
  OUVERTURE: "ouverture",
  SUCCES: "succes",
} as const;

export type SessionStep = (typeof SESSION_STEPS)[keyof typeof SESSION_STEPS];

// Core entities
export interface SessionOuverture {
  chrono: number;
  dateComptable: Date;
  village: string;
  societe: string;
  deviseLocale: string;
}

export interface Denomination {
  id: number;
  value: number;
  libelle: string;
  type: "billet" | "piece";
}

export interface DenominationCount {
  denominationId: number;
  value: number;
  count: number;
  total: number;
}

export interface SoldeParMOP {
  monnaie: number;
  produits: number;
  cartes: number;
  cheques: number;
  od: number;
  total: number;
}

export interface Devise {
  code: string;
  libelle: string;
  symbole: string;
}

export interface DeviseSession {
  deviseCode: string;
  nbInitial: number;
  nbApport: number;
  nbCompte: number;
  nbCalcule: number;
  nbEcart: number;
  commentaireEcart: string | null;
  existeEcart: boolean;
}

export interface SessionInfo {
  chrono: number;
  dateOuverture: Date;
  operateur: string;
  status: "open" | "closed";
}

export interface OuvertureTicketData {
  village: string;
  dateComptable: Date;
  chrono: number;
  soldeParMOP: SoldeParMOP;
  devises: DeviseSession[];
}

// API Request/Response types
export interface OpenSessionRequest {
  comptage: DenominationCount[];
  devises: DeviseSession[];
}

export interface OpenSessionResponse extends ApiResponse {
  data?: {
    chrono: number;
    soldeParMOP: SoldeParMOP;
    devises: DeviseSession[];
  };
}

export interface CheckConcurrentSessionsResponse extends ApiResponse {
  data?: {
    hasOpen: boolean;
    sessions: SessionInfo[];
    vilOpenSessions: boolean;
  };
}

export interface DenominationsConfigResponse extends ApiResponse {
  data?: Denomination[];
}

export interface DevisesConfigResponse extends ApiResponse {
  data?: Devise[];
}

export interface PrintTicketRequest {
  ticketType: "ouverture";
  data: OuvertureTicketData;
}

export interface PrintTicketResponse extends ApiResponse {
  data?: {
    success: boolean;
    ticketId?: string;
  };
}

// Zustand Store State
export interface SessionOuvertureState {
  // UI State
  currentStep: SessionStep;
  isLoading: boolean;
  error: string | null;

  // Domain Data
  comptage: DenominationCount[];
  devises: DeviseSession[];
  soldeParMOP: SoldeParMOP | null;
  sessionChrono: number | null;

  // Concurrent Session Handling
  showConcurrentWarning: boolean;
  concurrentSessions: SessionInfo[];
  vilOpenSessions: boolean;

  // Actions
  initOuverture: () => Promise<void>;
  handleCountChange: (denominationId: number, count: number) => void;
  computeResults: () => SoldeParMOP;
  validateComptage: () => Promise<void>;
  executeOuverture: () => Promise<void>;
  handlePrint: () => Promise<void>;
  handleBack: () => void;
  checkConcurrentSessions: () => Promise<boolean>;
  setCurrentStep: (step: SessionStep) => void;
  setError: (error: string | null) => void;
  resetState: () => void;
}

// Mock data type
export interface SessionOuvertureMockData {
  denomination_counts: DenominationCount[];
  devises: DeviseSession[];
  solde_par_mop: SoldeParMOP;
  concurrent_session_warning: {
    hasOpen: boolean;
    sessions: SessionInfo[];
  };
}