// Change devises types (IDE 25)

export type ChangeOperationType = 'achat' | 'vente';

export interface Devise {
  code: string;
  libelle: string;
  symbole: string;
  tauxActuel: number;
  nbDecimales: number;
}

export interface DeviseStock {
  deviseCode: string;
  deviseLibelle: string;
  montant: number;
  nbOperations: number;
}

export interface ChangeOperation {
  id: number;
  type: ChangeOperationType;
  deviseCode: string;
  deviseLibelle: string;
  montant: number;
  taux: number;
  contreValeur: number;
  modePaiement: string;
  date: string;
  heure: string;
  operateur: string;
  annule: boolean;
}

export interface ChangeOperationSummary {
  totalAchats: number;
  totalVentes: number;
  nbOperations: number;
}
