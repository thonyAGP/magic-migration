import type { ApiResponse } from "@/services/api/apiClient";

export interface CaisseControl {
  societe: string;
  deviseLocale: string;
  modeUniBi: string;
  chronoSession: number;
  soldeInitial: number;
  soldeInitialMonnaie: number;
  soldeInitialProduits: number;
  soldeInitialCartes: number;
  soldeInitialCheques: number;
  soldeInitialOd: number;
  soldeInitialNbreDevise: number;
  approCoffre: number;
  approArticles: number;
  approNbreDevises: number;
}

export interface CaisseCalculee {
  caisseCalculee: number;
  caisseCalculeeMonnaie: number;
  caisseCalculeeProduits: number;
  caisseCalculeeCartes: number;
  caisseCalculeeCheque: number;
  caisseCalculeeOd: number;
  caisseCalculeeNbDevise: number;
}

export interface ValidationError {
  code: string;
  message: string;
  field: string | null;
}

export interface ModeUniCheck {
  isUni: boolean;
  isBi: boolean;
}

export interface ControleOuvertureCaisseRequest {
  params: CaisseControl;
}

export interface ControleOuvertureCaisseResponse extends ApiResponse {
  data?: CaisseCalculee;
  error?: ValidationError;
}

export interface ControleOuvertureCaisseState {
  isValidating: boolean;
  validationResult: CaisseCalculee | null;
  validationError: ValidationError | null;
  validateOuvertureCaisse: (params: CaisseControl) => Promise<CaisseCalculee>;
  checkModeUniBi: (mode: string) => Promise<ModeUniCheck>;
  clearValidation: () => void;
}

export const VALIDATION_ERROR_CODES = {
  SESSION_ALREADY_OPEN: "ERR_SESSION_ALREADY_OPEN",
  INSUFFICIENT_PERMISSIONS: "ERR_INSUFFICIENT_PERMISSIONS",
  MISSING_PARAMETERS: "ERR_MISSING_PARAMETERS",
  INVALID_MODE: "ERR_INVALID_MODE",
  CALCULATION_ERROR: "ERR_CALCULATION_ERROR",
} as const;

export type ValidationErrorCode = (typeof VALIDATION_ERROR_CODES)[keyof typeof VALIDATION_ERROR_CODES];

export const MODE_UNI_BI = {
  UNI: "U",
  BI: "B",
} as const;

export type ModeUniType = (typeof MODE_UNI_BI)[keyof typeof MODE_UNI_BI];