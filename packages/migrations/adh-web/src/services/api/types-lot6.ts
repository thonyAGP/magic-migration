// Account search (shared)
export interface SearchAccountRequest {
  societe: string;
  query: string;
}

// Separation requests
export interface SeparationValidateRequest {
  societe: string;
  codeAdherentSource: number;
  filiationSource: number;
  codeAdherentDest: number;
  filiationDest: number;
}

export interface SeparationExecuteRequest {
  societe: string;
  codeAdherentSource: number;
  filiationSource: number;
  codeAdherentDest: number;
  filiationDest: number;
  operateur: string;
}

// Fusion requests
export interface FusionValidateRequest {
  societe: string;
  codeAdherentPrincipal: number;
  filiationPrincipal: number;
  codeAdherentSecondaire: number;
  filiationSecondaire: number;
}

export interface FusionExecuteRequest {
  societe: string;
  codeAdherentPrincipal: number;
  filiationPrincipal: number;
  codeAdherentSecondaire: number;
  filiationSecondaire: number;
  operateur: string;
}
