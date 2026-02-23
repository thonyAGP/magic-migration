export interface Session {
  id: number;
  dateOuverture: string;
  dateFermeture?: string;
  status: 'open' | 'closed';
  caisseId: number;
  userId: number;
}

export interface MOPBreakdown {
  total: number;
  monnaie: number;
  produits: number;
  cartes: number;
  cheques: number;
  od: number;
}

export interface OpenSessionRequest {
  caisseId: number;
  userId: number;
  comptage: { denominationId: number; quantite: number }[];
  // MOP breakdown of counted amounts (IDE 122/126)
  mopComptee?: MOPBreakdown;
}

export interface OpenSessionResponse {
  id: number;
  caisseId: number;
  userId: number;
  dateOuverture: string;
  // Backend-calculated MOP amounts (IDE 126: solde initial)
  mopSoldeInitial?: MOPBreakdown;
  // Backend-calculated ecart (IDE 129)
  mopEcart?: MOPBreakdown;
}

export interface CloseSessionRequest {
  sessionId: number;
  comptage: { denominationId: number; quantite: number }[];
  justification?: string;
  // MOP breakdown of counted amounts at closing (IDE 129)
  mopComptee?: MOPBreakdown;
}

export interface SessionSummary {
  id: number;
  dateOuverture: string;
  dateFermeture?: string;
  totalVentes: number;
}

export interface SessionDetailsResponse {
  session: Session;
  comptageOuverture: { denominationId: number; quantite: number; total: number }[];
  comptageFermeture?: { denominationId: number; quantite: number; total: number }[];
}

export interface Transaction {
  id: number;
  sessionId: number;
  type: string;
  montant: number;
  devise: string;
}

export interface TransactionLine {
  description: string;
  montant: number;
  devise: string;
}

export interface CreateTransactionRequest {
  sessionId: number;
  type: string;
  lignes: TransactionLine[];
}

export interface Denomination {
  id: number;
  deviseCode: string;
  valeur: number;
  type: 'billet' | 'piece';
  libelle?: string;
  ordre?: number;
}

export interface SaveCountingRequest {
  sessionId: number;
  items: { denominationId: number; quantite: number }[];
}

export interface DeviseInfo {
  code: string;
  libelle: string;
  denominations: Denomination[];
}

export interface Account {
  id: number;
  numero: string;
  nom: string;
}

export interface ExtraitCompte {
  compte: Account;
  operations: { date: string; libelle: string; montant: number }[];
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

// Lot 2 types re-export
export type {
  CreateTransactionLot2Request,
  GiftPassCheckRequest,
  ResortCreditCheckRequest,
  CompleteTransactionRequest,
  TPERecoverRequest,
} from './types-lot2';
