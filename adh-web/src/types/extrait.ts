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

export interface ExtraitTransaction {
  id: number;
  date: string;
  libelle: string;
  debit: number;
  credit: number;
  solde: number;
  codeService: string;
  codeImputation: string;
  giftPassFlag: boolean;
}

export interface ExtraitSummary {
  totalDebit: number;
  totalCredit: number;
  soldeActuel: number;
  nbTransactions: number;
}
