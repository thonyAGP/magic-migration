export type SessionQuand = 'O' | 'F';

export interface SessionEcart {
  sessionId: number;
  deviseCode: string;
  quand: SessionQuand;
  caisseComptee: number;
  montantEcart: number;
  commentaire: string | null;
  commentaireDevise: string | null;
}

export interface DeviseSession {
  deviseCode: string;
  soldePrecedent: number;
  unibi: 'UNI' | 'BI';
}

export interface EcartValidation {
  exceeded: boolean;
  blocking: boolean;
}

export interface SaveEcartRequest {
  sessionId: number;
  deviseCode: string;
  quand: SessionQuand;
  caisseComptee: number;
  montantEcart: number;
  commentaire: string | null;
  commentaireDevise: string | null;
}

export interface SaveEcartResponse {
  success: boolean;
  ecartId?: number;
}

export interface GetDeviseSessionRequest {
  sessionId: number;
  deviseCode: string;
}

export interface UpdateDeviseSessionRequest {
  sessionId: number;
  deviseCode: string;
  soldePrecedent: number;
  unibi: 'UNI' | 'BI';
}

export interface UpdateDeviseSessionResponse {
  success: boolean;
}

export interface SessionEcartState {
  sessionId: number | null;
  deviseCode: string | null;
  caisseComptee: number;
  soldePrecedent: number;
  montantEcart: number;
  commentaire: string;
  commentaireDevise: string;
  isLoading: boolean;
  error: string | null;
  ecartSaved: boolean;
  seuilAlerte: number;

  calculerEcart: (caisseComptee: number, soldePrecedent: number) => number;
  validerSeuilEcart: (ecart: number, seuilAlerte: number) => EcartValidation;
  sauvegarderEcart: (ecart: SessionEcart) => Promise<void>;
  setSessionId: (sessionId: number | null) => void;
  setDeviseCode: (deviseCode: string | null) => void;
  setCaisseComptee: (caisseComptee: number) => void;
  setSoldePrecedent: (soldePrecedent: number) => void;
  setCommentaire: (commentaire: string) => void;
  setCommentaireDevise: (commentaireDevise: string) => void;
  setSeuilAlerte: (seuilAlerte: number) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}