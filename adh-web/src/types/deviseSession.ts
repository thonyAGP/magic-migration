export interface DeviseSession {
  codeDevise: string;
  modePaiement: string;
  quand: string;
  type: string;
  quantite: number;
  cumulOpChange: boolean;
}

export interface UpdateDeviseSessionRequest {
  codeDevise: string;
  modePaiement: string;
  quand: string;
  type: string;
  quantite: number;
  cumulOpChange: boolean;
}

export type UpdateDeviseSessionResponse = void;

export interface DeviseSessionState {
  isLoading: boolean;
  error: string | null;
  updateDeviseSession: (
    codeDevise: string,
    modePaiement: string,
    quand: string,
    type: string,
    quantite: number,
    cumulOpChange: boolean
  ) => Promise<void>;
}