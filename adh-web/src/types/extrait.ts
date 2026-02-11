// Extrait de compte types (IDE 69)

export type ExtraitPrintFormat = 'cumule' | 'date' | 'imputation' | 'nom' | 'date_imp' | 'service';

export interface ExtraitAccountInfo {
  societe: string;
  codeAdherent: number;
  filiation: number;
  nom: string;
  prenom: string;
  statut: 'normal' | 'bloque' | 'suspendu'; // X=bloque, A=suspendu
  hasGiftPass: boolean;
}

export type ExtraitTransactionStatus = 'normal' | 'annule' | 'regularise' | 'credit' | 'debit';

export interface ExtraitTransaction {
  id: number;
  date: string;
  heure: string;
  libelle: string;
  libelleSupplementaire?: string;
  debit: number;
  credit: number;
  solde: number;
  codeService: string;
  codeImputation: string;
  giftPassFlag: boolean;
  nbArticles?: number;
  status?: ExtraitTransactionStatus;
  numeroPiece?: string;
  modePaiement?: string;
  caissier?: string;
  commentaire?: string;
}

export interface ExtraitSummary {
  totalDebit: number;
  totalCredit: number;
  soldeActuel: number;
  nbTransactions: number;
}
