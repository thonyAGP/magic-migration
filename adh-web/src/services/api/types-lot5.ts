// Club Med Pass requests
export interface ValidatePassRequest {
  numeroPass: string;
  montantTransaction: number;
  societe: string;
}

export interface ScanPassRequest {
  numeroPass: string;
  societe: string;
}

// Data Catching requests
export interface SearchCustomerRequest {
  societe: string;
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
}

export interface CreateDataCatchSessionRequest {
  societe: string;
  customerId?: number;
  isNewCustomer: boolean;
  operateur: string;
}

export interface SavePersonalInfoRequest {
  civilite: 'M' | 'Mme' | 'Autre';
  nom: string;
  prenom: string;
  dateNaissance: string;
  nationalite: string;
  typeIdentite: 'passeport' | 'carte_identite' | 'permis';
  numeroIdentite: string;
}

export interface SaveAddressRequest {
  adresse: string;
  complement?: string;
  codePostal: string;
  ville: string;
  pays: string;
  telephone: string;
  email: string;
}

export interface SavePreferencesRequest {
  languePreferee: string;
  consentementMarketing: boolean;
  newsletter: boolean;
  consentementCommunication: boolean;
  activitesPreferees: string[];
}
