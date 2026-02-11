export type SessionStatus = 'closed' | 'opening' | 'open' | 'closing';

export interface DeviseSession {
  deviseCode: string;
  fondCaisse: number;
  totalVentes: number;
  totalEncaissements: number;
}

export interface Session {
  id: number;
  caisseId: number;
  userId: number;
  dateOuverture: string;
  dateFermeture?: string;
  status: SessionStatus;
  devises: DeviseSession[];
}

export type SessionDetailType = 'I' | 'C' | 'K' | 'L';
export type SessionDetailQuand = 'O' | 'F';

export interface SessionDetail {
  type: SessionDetailType;
  quand: SessionDetailQuand;
  montant: number;
  montantMonnaie: number;
  montantProduits: number;
  montantCartes: number;
  montantCheques: number;
  montantOd: number;
  nbreDevises: number;
}

export interface EcartDevise {
  deviseCode: string;
  attendu: number;
  compte: number;
  ecart: number;
}

export interface SessionEcart {
  attendu: number;
  compte: number;
  ecart: number;
  estEquilibre: boolean;
  statut: 'equilibre' | 'positif' | 'negatif' | 'alerte';
  ecartsDevises: EcartDevise[];
}

export interface SessionHistoryItem {
  id: number;
  caisseId: number;
  caisseNumero: string;
  userId: number;
  userLogin: string;
  dateOuverture: string;
  dateFermeture?: string;
  status: SessionStatus;
  ecart?: SessionEcart;
}

export interface SessionSummary {
  session: Session;
  details: SessionDetail[];
  ecart?: SessionEcart;
}

export interface ConcurrentSessionInfo {
  sessionId: number;
  userId: number;
  userName: string;
  dateOuverture: string;
  caisseId: number;
}

export interface SessionVilConfig {
  vilOpenSessions: boolean;
}

// Network closure status for pre-opening check
const NETWORK_CLOSURE_STATUS = {
  pending: 'pending',
  completed: 'completed',
  error: 'error',
} as const;

export type NetworkClosureStatus = (typeof NETWORK_CLOSURE_STATUS)[keyof typeof NETWORK_CLOSURE_STATUS];

export interface NetworkClosureResult {
  status: NetworkClosureStatus;
  lastDate?: string;
}

export interface StockCoherenceResult {
  coherent: boolean;
  details?: string[];
}

// Fermeture recap column types
const FERMETURE_COLUMN_TYPE = {
  cash: 'cash',
  cartes: 'cartes',
  cheques: 'cheques',
  produits: 'produits',
  od: 'od',
  devises: 'devises',
} as const;

export type FermetureColumnType = (typeof FERMETURE_COLUMN_TYPE)[keyof typeof FERMETURE_COLUMN_TYPE];

export interface FermetureRecapColumn {
  type: FermetureColumnType;
  label: string;
  montantAttendu: number;
  montantCompte: number;
  ecart: number;
}

export { NETWORK_CLOSURE_STATUS, FERMETURE_COLUMN_TYPE };
