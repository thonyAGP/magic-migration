import type { ApiResponse } from "@/services/api/apiClient";

export interface Denomination {
  id: number;
  deviseCode: string;
  valeur: number;
  libelle: string;
}

export interface ComptageDetail {
  denominationId: number;
  deviseCode: string;
  valeur: number;
  quantite: number;
  total: number;
}

export interface RecapMOP {
  moyenPaiement: string;
  moyenPaiementLibelle: string;
  attendu: number;
  compte: number;
  ecart: number;
}

export interface DeviseComptage {
  deviseCode: string;
  deviseLibelle: string;
  totalSaisi: number;
  denominations: ComptageDetail[];
}

export interface ValidationResult {
  totalCaisse: number;
  totalMonnaie: number;
  totalProduits: number;
  totalCartes: number;
  totalCheques: number;
  totalOD: number;
  shouldProcess: boolean;
  nbreDevise: number;
  fromIms: boolean;
}

export interface PersistanceResult {
  success: boolean;
  ticketUrl?: string;
  sessionId: number;
  timestamp: string;
}

export interface SaisieContenuCaisseState {
  activeDevise: string | null;
  comptageDevises: Map<string, DeviseComptage>;
  recapMOP: RecapMOP[];
  validationResult: ValidationResult | null;
  isValidating: boolean;
  validationError: string | null;
  isPersisting: boolean;
  canSubmit: boolean;
  devisesAutorisees: string[];
  sessionId: number | null;
  quand: "O" | "F" | null;

  initComptage: (
    sessionId: number,
    quand: "O" | "F",
    devisesAutorisees: string[]
  ) => Promise<void>;

  updateQuantite: (
    deviseCode: string,
    denominationId: number,
    quantite: number
  ) => void;

  switchDevise: (deviseCode: string) => void;

  validateComptage: () => Promise<ValidationResult>;

  loadRecapMOP: (sessionId: number) => Promise<RecapMOP[]>;

  persistComptage: (
    sessionId: number,
    validationResult: ValidationResult
  ) => Promise<PersistanceResult>;

  resetState: () => void;

  setValidationError: (error: string | null) => void;
}

export type GetDenominationsRequest = {
  deviseCode: string;
};

export type GetDenominationsResponse = ApiResponse<Denomination[]>;

export type ValidateComptageRequest = {
  comptageDevises: Record<string, DeviseComptage>;
  nbreDevise: number;
  fromIms: boolean;
};

export type ValidateComptageResponse = ApiResponse<ValidationResult>;

export type GetRecapMOPRequest = {
  sessionId: number;
};

export type GetRecapMOPResponse = ApiResponse<RecapMOP[]>;

export type PersistComptageRequest = {
  sessionId: number;
  validationResult: ValidationResult;
  comptageDevises: Record<string, DeviseComptage>;
  recapMOP: RecapMOP[];
};

export type PersistComptageResponse = ApiResponse<PersistanceResult>;

export const COMPTAGE_ACTION_TYPES = {
  INIT: "INIT_COMPTAGE",
  UPDATE_QUANTITE: "UPDATE_QUANTITE",
  SWITCH_DEVISE: "SWITCH_DEVISE",
  VALIDATE: "VALIDATE_COMPTAGE",
  LOAD_RECAP: "LOAD_RECAP_MOP",
  PERSIST: "PERSIST_COMPTAGE",
  SET_ERROR: "SET_VALIDATION_ERROR",
  RESET: "RESET_STATE",
} as const;

export type ComptageActionType =
  (typeof COMPTAGE_ACTION_TYPES)[keyof typeof COMPTAGE_ACTION_TYPES];

export const MOYEN_PAIEMENT_CODES = {
  MONNAIE: "M",
  CARTES: "C",
  CHEQUES: "CH",
  OD: "OD",
  PRODUITS: "P",
} as const;

export type MoyenPaiementCode =
  (typeof MOYEN_PAIEMENT_CODES)[keyof typeof MOYEN_PAIEMENT_CODES];

export const VALIDATION_RULES = {
  RM_001: "shouldProcess = totalCaisse <> 0 OR nbreDevise <> 0 OR FROM_IMS = 'O'",
  MIN_QUANTITE: 0,
  ECART_TOLERANCE: 0,
} as const;