import type { ApiResponse } from "@/services/api/apiClient";

export type VenteType = 'standard' | 'VRL' | 'VSL' | 'OD';
export type HebergementStatut = 'actif' | 'libere' | 'bloque' | 'termine';
export type OperationDiverseType = 'compte' | 'service' | 'statistiques' | 'biking' | 'lco';

export interface Vente {
  id: number;
  societe: string;
  compte: string;
  filiation: number;
  dateEncaissement: Date | null;
  montant: number;
  annulation: boolean;
  typeVente: VenteType | null;
  modePaiement?: string;
  operateur?: string;
}

export interface OperationDiverse {
  id: number;
  societe: string;
  compte: string;
  typeOD: OperationDiverseType;
  montant: number;
  dateOperation: Date;
  description?: string;
}

export interface CompteGM {
  societe: string;
  compte: string;
  solde: number;
  dateMAJ: Date;
}

export interface Hebergement {
  societe: string;
  compte: string;
  chambre: string | null;
  dateDebut: Date | null;
  dateFin: Date | null;
  statut: HebergementStatut | null;
}

export interface TransfertAffectation {
  id: number;
  venteId: number;
  affectation: string | null;
  dateTransfert: Date;
}

export interface ComplementBiking {
  id: number;
  venteId: number;
  typeVelo: string;
  quantite: number;
  dateRetour: Date | null;
}

export interface DeversementResult {
  success: boolean;
  venteId: number;
  operationsDiverses: OperationDiverse[];
  numeroTicket?: number;
  compteGMAncienSolde: number;
  compteGMNouveauSolde: number;
  transfertAffectationId?: number;
}

export interface DeverserVenteRequest {
  venteId: number;
  annulation: boolean;
  affectation?: string;
}

export type DeverserVenteResponse = ApiResponse<DeversementResult>;

export interface AffecterTransfertRequest {
  venteId: number;
  affectation: string;
}

export type AffecterTransfertResponse = ApiResponse<{ success: boolean; transfertId: number }>;

export interface RazAffectationRequest {
  venteId: number;
}

export type RazAffectationResponse = ApiResponse<{ success: boolean }>;

export interface IncrementNumeroTicketRequest {
  typeVente: 'VRL' | 'VSL';
}

export type IncrementNumeroTicketResponse = ApiResponse<{ numeroTicket: number }>;

export interface GetCompteGMRequest {
  societe: string;
  compte: string;
}

export type GetCompteGMResponse = ApiResponse<CompteGM>;

export interface GetOperationsDiversesRequest {
  venteId: number;
}

export type GetOperationsDiversesResponse = ApiResponse<OperationDiverse[]>;

export interface DeversementState {
  vente: Vente | null;
  operationsDiverses: OperationDiverse[];
  compteGM: CompteGM | null;
  hebergement: Hebergement | null;
  transfertAffectation: TransfertAffectation | null;
  isProcessing: boolean;
  error: string | null;
  affectationTransfert: string;
  showAffectationModal: boolean;
  numeroTicket: number | null;
  venteVrlVsl: boolean;
  complementsBiking: ComplementBiking[];
  deversementHistory: DeversementResult[];
}

export interface DeversementActions {
  setVente: (vente: Vente | null) => void;
  setOperationsDiverses: (operations: OperationDiverse[]) => void;
  setCompteGM: (compte: CompteGM | null) => void;
  setHebergement: (hebergement: Hebergement | null) => void;
  setTransfertAffectation: (transfert: TransfertAffectation | null) => void;
  setIsProcessing: (isProcessing: boolean) => void;
  setError: (error: string | null) => void;
  setAffectationTransfert: (affectation: string) => void;
  setShowAffectationModal: (show: boolean) => void;
  setNumeroTicket: (numero: number | null) => void;
  setVenteVrlVsl: (vrlvsl: boolean) => void;
  setComplementsBiking: (complements: ComplementBiking[]) => void;
  deverserVente: (venteId: number, annulation: boolean, affectation?: string) => Promise<void>;
  creerOperationDiverse: (vente: Vente, typeOD: OperationDiverseType, montant: number) => Promise<OperationDiverse>;
  mettreAJourCompteGM: (societe: string, compte: string, montant: number, annulation: boolean) => Promise<void>;
  mettreAJourHebergement: (societe: string, compte: string, statut: HebergementStatut) => Promise<void>;
  affecterTransfert: (venteId: number, affectation: string) => Promise<void>;
  razAffectationTransfert: (venteId: number) => Promise<void>;
  incrementerNumeroTicket: (typeVente: 'VRL' | 'VSL') => Promise<number>;
  mettreAJourComplementsBiking: (venteId: number) => Promise<void>;
  verifierEtEnvoyerMail: (venteId: number) => Promise<void>;
  chargerCompteGM: (societe: string, compte: string) => Promise<void>;
  chargerOperationsDiverses: (venteId: number) => Promise<void>;
  resetState: () => void;
}

export const OPERATION_DIVERSE_TYPES = {
  COMPTE: 'compte',
  SERVICE: 'service',
  STATISTIQUES: 'statistiques',
  BIKING: 'biking',
  LCO: 'lco',
} as const;

export const HEBERGEMENT_STATUTS = {
  ACTIF: 'actif',
  LIBERE: 'libere',
  BLOQUE: 'bloque',
  TERMINE: 'termine',
} as const;

export const VENTE_TYPES = {
  STANDARD: 'standard',
  VRL: 'VRL',
  VSL: 'VSL',
  OD: 'OD',
} as const;

export const BUSINESS_RULES = {
  RM001: 'Si le type de compte est OD, utiliser OD comme préfixe',
  RM002: 'Si annulation, additionner le montant absolu au solde, sinon le soustraire',
  CREER_9_OD: 'Créer 9 opérations diverses (OD) pour différents comptes et services',
  MAJ_COMPTE_GM: 'Mettre à jour le compte GM avec le nouveau solde',
  MAJ_HEBERGEMENT: 'Mettre à jour l\'hébergement si applicable',
  INCREMENTER_COMPTEURS: 'Incrémenter les compteurs de ventes',
  GERER_VRL_VSL: 'Gérer les ventes VRL/VSL avec numérotation de ticket spécifique',
  CREER_TRANSFERT: 'Créer les enregistrements de transfert si affectation définie',
  MAJ_BIKING: 'Mettre à jour les compléments biking si applicable',
  GERER_LCO: 'Gérer la libération LCO et l\'heure de libération',
  ENVOYER_MAIL: 'Vérifier et envoyer les notifications email si configuré',
} as const;