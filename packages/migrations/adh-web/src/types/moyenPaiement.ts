import type { ApiResponse } from "@/services/api/apiClient";

export type TypeDevise = "UNI" | "BI";
export type ClasseMOP = "UNI" | "BI" | "TRANSF" | "CHQ";

export interface MoyenPaiement {
  code: string;
  libelle: string;
  classe: ClasseMOP;
  typeDevise: TypeDevise;
}

export interface MoyenReglement {
  code: string;
  libelle: string;
}

export interface MOPInfo {
  classe: ClasseMOP;
  libelle: string;
  existe: boolean;
}

export interface MOPExistsResponse {
  existe: boolean;
}

export interface GetMOPInfoRequest {
  code: string;
  typeDevise?: TypeDevise;
}

export interface GetMOPInfoResponse extends ApiResponse {
  data: MOPInfo;
}

export interface CheckMOPExistsRequest {
  code: string;
  societe: string;
}

export interface CheckMOPExistsResponse extends ApiResponse {
  data: MOPExistsResponse;
}

export interface GetMOPByCodeRequest {
  code: string;
}

export interface GetMOPByCodeResponse extends ApiResponse {
  data: MoyenPaiement | null;
}

export interface MoyenPaiementState {
  moyensPaiement: MoyenPaiement[];
  selectedMOP: MoyenPaiement | null;
  isLoading: boolean;
  error: string | null;
}

export interface MoyenPaiementActions {
  getMOPInfo: (
    codeMOP: string,
    typeDevise: TypeDevise
  ) => Promise<{ classe: ClasseMOP; libelle: string; existe: boolean }>;
  checkMOPExists: (codeMOP: string, societe: string) => Promise<boolean>;
  getMOPByCode: (codeMOP: string) => Promise<MoyenPaiement | null>;
  setMoyensPaiement: (moyens: MoyenPaiement[]) => void;
  setSelectedMOP: (mop: MoyenPaiement | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export type MoyenPaiementStore = MoyenPaiementState & MoyenPaiementActions;