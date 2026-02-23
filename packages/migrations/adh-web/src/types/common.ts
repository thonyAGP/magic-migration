export interface Devise {
  code: string; // EUR, USD, GBP...
  libelle: string;
  symbole: string;
  nbDecimales: number;
}

export interface Societe {
  code: string;
  nom: string;
  pays: string;
}

export type Nullable<T> = T | null;
