export interface Devise {
  code: string;
  libelle: string;
  venteAutorisee: boolean;
}

export interface ApportCoffre {
  deviseCode: string;
  montant: number;
  dateHeure: Date;
  context: 'O' | 'F' | 'G';
}

export interface ApportCoffreRequest {
  deviseCode: string;
  montant: number;
  context: 'O' | 'F' | 'G';
}

export interface ApportCoffreResponse {
  success: boolean;
  montantCoffre: number;
}

export interface CaisseConfig {
  devisesAutorisees: Devise[];
  sessionActive: boolean;
}

export interface ApportCoffreState {
  devises: Devise[];
  isExecuting: boolean;
  error: string | null;
  deviseSelectionnee: string | null;
  montantSaisi: number;
  chargerDevises: () => Promise<void>;
  validerApport: (deviseCode: string, montant: number, context: 'O' | 'F' | 'G') => Promise<void>;
  setDeviseSelectionnee: (code: string | null) => void;
  setMontantSaisi: (montant: number) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const CONTEXT_LABELS = {
  O: 'Ouverture',
  F: 'Fermeture',
  G: 'Gestion',
} as const;

export const APPORT_COFFRE_VALIDATION = {
  MONTANT_MIN: 0.01,
  MONTANT_MAX: 999999.99,
} as const;