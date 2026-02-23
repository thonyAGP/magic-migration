// Types for caisse operations (Apport/Remise coffre, Produits, Telecollecte, Pointage)

export const CaisseOpType = {
  APPORT_COFFRE: 'APPORT_COFFRE',
  APPORT_PRODUITS: 'APPORT_PRODUITS',
  REMISE_COFFRE: 'REMISE_COFFRE',
  TELECOLLECTE: 'TELECOLLECTE',
  POINTAGE: 'POINTAGE',
} as const;
export type CaisseOpType = (typeof CaisseOpType)[keyof typeof CaisseOpType];

export interface ApportCoffreData {
  montant: number;
  deviseCode: string;
  motif: string;
  denominations?: { denominationId: number; quantite: number }[];
}

export interface ApportProduitsData {
  produits: {
    codeProduit: string;
    libelle: string;
    quantite: number;
    prixUnitaire: number;
  }[];
  montantTotal: number;
}

export interface RemiseCoffreData {
  montant: number;
  deviseCode: string;
  motif: string;
  denominations?: { denominationId: number; quantite: number }[];
}

export interface TelecollecteData {
  terminalId: string;
  montantTotal: number;
  nbTransactions: number;
  dateDebut: string;
  dateFin: string;
}

export interface TelecollecteResult {
  success: boolean;
  montantCollecte: number;
  nbTransactionsTraitees: number;
  erreurs?: string[];
}

export interface PointageComptage {
  type: string;
  montantAttendu: number;
  montantCompte: number;
  ecart: number;
}

export interface PointageData {
  deviseCode: string;
  comptages: PointageComptage[];
}

export interface RegularisationData {
  deviseCode: string;
  montantEcart: number;
  motif: string;
  typeRegularisation: 'ajustement_positif' | 'ajustement_negatif';
}

export const CaisseOpStatus = {
  EN_COURS: 'en_cours',
  TERMINE: 'termine',
  ERREUR: 'erreur',
} as const;
export type CaisseOpStatus =
  (typeof CaisseOpStatus)[keyof typeof CaisseOpStatus];

export interface CaisseOperation {
  id: number;
  type: CaisseOpType;
  montant: number;
  deviseCode: string;
  date: string;
  heure: string;
  userId: number;
  reference?: string;
  status: CaisseOpStatus;
}
