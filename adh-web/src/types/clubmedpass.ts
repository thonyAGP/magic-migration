// Club Med Pass types (IDE 77)

export type PassStatus = 'active' | 'suspendu' | 'expire';

export interface ClubMedPass {
  id: number;
  numeroPass: string;
  titulaire: string;
  societe: string;
  codeAdherent: number;
  filiation: number;
  statut: PassStatus;
  solde: number;
  devise: string;
  limitJournaliere: number;
  limitHebdomadaire: number;
  dateExpiration: string;
  derniereUtilisation: string | null;
}

export interface PassTransaction {
  id: number;
  passId: number;
  numeroPass: string;
  type: 'debit' | 'credit';
  montant: number;
  libelle: string;
  date: string;
  heure: string;
  operateur: string;
}

export interface PassValidationResult {
  isValid: boolean;
  soldeDisponible: number;
  peutTraiter: boolean;
  raison: string | null;
  limitJournaliereRestante: number;
  limitHebdomadaireRestante: number;
}

export interface PassSummary {
  nbPassActifs: number;
  soldeTotal: number;
  nbTransactionsJour: number;
}
