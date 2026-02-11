// Data Catching types (IDE 7)

export type DataCatchStep =
  | 'welcome'
  | 'search'
  | 'personal'
  | 'address'
  | 'preferences'
  | 'review'
  | 'complete'
  | 'checkout'
  | 'config';

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

// Checkout types (IDE 8)
export type CheckoutStatus = 'idle' | 'processing' | 'accepted' | 'declined' | 'cancelled';

export interface GuestData {
  id: string;
  nom: string;
  prenom: string;
  chambre: string;
  dateArrivee: string;
  dateDepart: string;
  passId?: string;
  solde: number;
  status: string; // 'checked_in' | 'checking_out' | 'checked_out'
}

// Village config types (IDE 9)
export interface VillageConfig {
  code: string;
  nom: string;
  pays: string;
  timezone: string;
  saison: string; // 'ete' | 'hiver' | 'toutes_saisons'
  capacite: number;
  deviseLocale: string;
}

export interface SystemStatus {
  database: 'ok' | 'error';
  network: 'ok' | 'error';
  printer: 'ok' | 'error' | 'unavailable';
  lastSync: string;
}
