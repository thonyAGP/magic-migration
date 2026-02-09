export type TransactionType =
  | 'vente_gp'
  | 'vente_boutique'
  | 'change'
  | 'garantie'
  | 'facture';

export type TransactionStatus = 'draft' | 'validated' | 'cancelled';

export type ArticleType = 'VRL' | 'VSL' | 'TRF' | 'PYR' | 'default';

export type PaymentSide = 'unilateral' | 'bilateral';

export interface TransactionLine {
  id: number;
  description: string;
  montant: number;
  devise: string;
  quantite: number;
}

export interface MoyenPaiement {
  code: string;
  libelle: string;
  type: 'especes' | 'carte' | 'cheque' | 'virement' | 'autre';
}

export interface Transaction {
  id: number;
  sessionId: number;
  type: TransactionType;
  status: TransactionStatus;
  compteId?: number;
  compteNom?: string;
  lignes: TransactionLine[];
  montantTotal: number;
  devise: string;
  moyenPaiement?: MoyenPaiement;
  dateCreation: string;
  commentaire?: string;
}
