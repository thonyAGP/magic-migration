// Data Catching types (IDE 7)

export type DataCatchStep =
  | 'welcome'
  | 'search'
  | 'personal'
  | 'address'
  | 'preferences'
  | 'review'
  | 'complete';

export type DataCatchSessionStatus = 'en_cours' | 'termine' | 'annule';

export interface CustomerSearchResult {
  customerId: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  scoreMatch: number;
}

export interface CustomerPersonalInfo {
  civilite: 'M' | 'Mme' | 'Autre';
  nom: string;
  prenom: string;
  dateNaissance: string;
  nationalite: string;
  typeIdentite: 'passeport' | 'carte_identite' | 'permis';
  numeroIdentite: string;
}

export interface CustomerAddress {
  adresse: string;
  complement: string;
  codePostal: string;
  ville: string;
  pays: string;
  telephone: string;
  email: string;
}

export interface CustomerPreferences {
  languePreferee: string;
  consentementMarketing: boolean;
  newsletter: boolean;
  consentementCommunication: boolean;
  activitesPreferees: string[];
}

export interface DataCatchSession {
  sessionId: string;
  societe: string;
  step: DataCatchStep;
  customerId: number | null;
  isNewCustomer: boolean;
  personalInfo: CustomerPersonalInfo | null;
  address: CustomerAddress | null;
  preferences: CustomerPreferences | null;
  statut: DataCatchSessionStatus;
  dateCreation: string;
  operateur: string;
}

export interface DataCatchSummary {
  nbSessionsJour: number;
  nbNouveauxClients: number;
  nbMisesAJour: number;
}
