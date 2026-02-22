import type { ApiResponse } from '@/services/api/apiClient';

// ============================================================================
// ENTITIES
// ============================================================================

export interface SoldeOuverture {
  societe: string;
  deviseLocale: string;
  soldeOuverture: number;
  soldeOuvertureMonnaie: number;
  soldeOuvertureProduits: number;
  soldeOuvertureCartes: number;
  soldeOuvertureCheques: number;
  soldeOuvertureOd: number;
  nbreDevise: number;
  uniBi: string;
}

export interface MoyenReglement {
  id: number;
  code: string;
  libelle: string;
}

export interface GestionDeviseSession {
  id: number;
  sessionId: number;
  deviseCode: string;
  tauxChange: number;
  montant: number;
}

// ============================================================================
// CALCULATION TYPES
// ============================================================================

export interface DeviseConversion {
  devise: string;
  montant: number;
  tauxChange: number;
  montantEur: number;
}

export interface SoldeCalculationResult {
  totalEur: number;
  details: DeviseConversion[];
}

export interface CoherenceValidationResult {
  coherent: boolean;
  ecart: number | null;
}

// ============================================================================
// REQUEST/RESPONSE TYPES
// ============================================================================

export interface CalculerSoldeOuvertureRequest {
  societe: string;
  sessionId: number;
}

export interface GetSoldeOuvertureRequest {
  societe: string;
  sessionId: number;
}

export interface ValiderCoherenceSoldeRequest {
  soldeEnregistre: number;
  soldeCalcule: number;
}

export interface UpdateDeviseSessionRequest {
  sessionId: number;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export type CalculerSoldeOuvertureResponse = ApiResponse<SoldeCalculationResult>;
export type GetSoldeOuvertureResponse = ApiResponse<SoldeOuverture>;
export type ValiderCoherenceSoldeResponse = ApiResponse<CoherenceValidationResult>;
export type UpdateDeviseSessionResponse = ApiResponse<void>;

// ============================================================================
// STORE STATE
// ============================================================================

export interface SoldeOuvertureState {
  soldeOuverture: SoldeOuverture | null;
  moyensReglement: MoyenReglement[];
  devisesSessions: GestionDeviseSession[];
  isLoading: boolean;
  error: string | null;
  isCalculating: boolean;
  calculationResult: SoldeCalculationResult | null;
}

// ============================================================================
// STORE ACTIONS
// ============================================================================

export interface SoldeOuvertureActions {
  loadSoldeOuverture: (societe: string, sessionId: number) => Promise<void>;
  calculerSoldeOuverture: (
    societe: string,
    sessionId: number,
  ) => Promise<SoldeCalculationResult>;
  updateDeviseSession: (sessionId: number) => Promise<void>;
  validerCoherenceSolde: (
    soldeEnregistre: number,
    soldeCalcule: number,
  ) => Promise<CoherenceValidationResult>;
  setSoldeOuverture: (solde: SoldeOuverture | null) => void;
  setMoyensReglement: (moyens: MoyenReglement[]) => void;
  setDevisesSessions: (devises: GestionDeviseSession[]) => void;
  setCalculationResult: (result: SoldeCalculationResult | null) => void;
  clearError: () => void;
  reset: () => void;
}

export type SoldeOuvertureStore = SoldeOuvertureState & SoldeOuvertureActions;

// ============================================================================
// UI COMPONENT PROPS
// ============================================================================

export interface SoldeOuvertureDetailsProps {
  solde: SoldeOuverture;
  isLoading?: boolean;
  className?: string;
}

export interface CalculationResultsProps {
  result: SoldeCalculationResult;
  isCalculating?: boolean;
  className?: string;
}

export interface CoherenceIndicatorProps {
  validation: CoherenceValidationResult;
  className?: string;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export const SoldeOuvertureErrorCode = {
  MISSING_CURRENCY_RATE: 'MISSING_CURRENCY_RATE',
  NEGATIVE_AMOUNT: 'NEGATIVE_AMOUNT',
  INVALID_SESSION: 'INVALID_SESSION',
  COHERENCE_MISMATCH: 'COHERENCE_MISMATCH',
  LOAD_FAILED: 'LOAD_FAILED',
  CALCULATION_FAILED: 'CALCULATION_FAILED',
} as const;

export type SoldeOuvertureErrorCodeType =
  (typeof SoldeOuvertureErrorCode)[keyof typeof SoldeOuvertureErrorCode];

export interface SoldeOuvertureError {
  code: SoldeOuvertureErrorCodeType;
  message: string;
  details?: unknown;
}

// ============================================================================
// VALIDATION
// ============================================================================

export const SOLDE_OUVERTURE_CONSTRAINTS = {
  MIN_AMOUNT: 0,
  MAX_AMOUNT: 999999999.99,
  DECIMAL_PLACES: 2,
  COHERENCE_TOLERANCE: 0.01,
} as const;