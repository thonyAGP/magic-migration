// Integrite Dates types (IDE 286)

export type DateCheckType = 'O' | 'T' | 'F';

export interface DateIntegrityCheck {
  checkType: DateCheckType;
  societe: string;
  isValid: boolean;
  hasClosureAnomaly: boolean;
  errorMessage?: string;
  timestamp: string;
}

export interface DateComptable {
  checkType: DateCheckType;
  societe: string;
  controleOk: boolean;
  anomalieFermeture: boolean;
  dateComptable: string;
  delaiJours: number;
}

export interface OuvertureValidation {
  isValid: boolean;
  dateComptable: string;
  currentDate: string;
  delaiExceeded: boolean;
}

export interface TransactionValidation {
  isValid: boolean;
  dateSession: string;
  heureSession: string;
  currentTimestamp: number;
  sessionTimestamp: number;
  isTimestampValid: boolean;
}

export interface FermetureValidation {
  isValid: boolean;
  hasAnomaly: boolean;
  blockedReason?: string;
}

export interface DateCheckRequest {
  checkType: DateCheckType;
  societe: string;
  dateSession?: string;
  heureSession?: string;
}

export interface DateCheckResponse {
  success: boolean;
  data?: DateIntegrityCheck;
  error?: string;
}

export interface DateComptableResponse {
  success: boolean;
  data?: DateComptable;
  error?: string;
}

export interface IntegriteDatesState {
  checkType: DateCheckType;
  societe: string;
  isLoading: boolean;
  error: string | null;
  validationResult: DateIntegrityCheck | null;
  ouvertureValidation: OuvertureValidation | null;
  transactionValidation: TransactionValidation | null;
  fermetureValidation: FermetureValidation | null;
  
  setCheckType: (checkType: DateCheckType) => void;
  setSociete: (societe: string) => void;
  setError: (error: string | null) => void;
  clearValidationResult: () => void;
  
  validateDateIntegrity: (checkType: DateCheckType, societe: string) => Promise<DateIntegrityCheck>;
  checkOuverture: (societe: string) => Promise<boolean>;
  checkTransaction: (societe: string, dateSession: string, heureSession: string) => Promise<boolean>;
  checkFermeture: (societe: string) => Promise<{ isValid: boolean; hasAnomaly: boolean }>;
  reset: () => void;
}

export type ValidateOuvertureRequest = {
  checkType: 'O';
  societe: string;
};

export type ValidateTransactionRequest = {
  checkType: 'T';
  societe: string;
  dateSession: string;
  heureSession: string;
};

export type ValidateFermetureRequest = {
  checkType: 'F';
  societe: string;
};

export type DateCheckActionRequest =
  | ValidateOuvertureRequest
  | ValidateTransactionRequest
  | ValidateFermetureRequest;

export const DATE_CHECK_TYPES = {
  OUVERTURE: 'O' as const,
  TRANSACTION: 'T' as const,
  FERMETURE: 'F' as const,
} as const;

export const DATE_CHECK_LABELS = {
  O: 'Ouverture',
  T: 'Transaction',
  F: 'Fermeture',
} as const;