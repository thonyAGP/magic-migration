import type { ApiResponse } from "@/services/api/apiClient";

export type SessionStatut = "ouverte" | "fermee" | "cloture_en_cours" | "suspendue";
export type MouvementType = "apport_coffre" | "remise_coffre" | "apport_produit" | "retrait_produit";
export type DeviseCode = string;

export interface SessionCaisse {
  sessionId: number;
  dateOuverture: string;
  dateFermeture: string | null;
  operateurId: number;
  operateurNom: string;
  statut: SessionStatut;
  montantOuverture: number;
  montantFermeture: number | null;
  ecart: number | null;
}

export interface ParametresCaisse {
  caisseId: number;
  seuilAlerte: number;
  deviseLocale: string;
  impressionAuto: boolean;
}

export interface SessionCoffre {
  sessionId: number;
  montantCoffre: number;
  integrite: boolean;
}

export interface MouvementCaisse {
  mouvementId: number;
  sessionId: number;
  type: MouvementType;
  deviseCode: string;
  montant: number;
  dateHeure: string;
}

export interface SessionConcurrente {
  sessionId: number;
  posteId: string;
  operateurNom: string;
  dateOuverture: string;
}

export interface DateComptable {
  date: string;
  valide: boolean;
}

export interface ApportCoffreRequest {
  montant: number;
  deviseCode: string;
}

export interface ApportProduitRequest {
  produitId: number;
  quantite: number;
}

export interface RemiseCoffreRequest {
  montant: number;
  deviseCode: string;
}

export interface HistoriqueQueryParams {
  dateDebut?: string;
  dateFin?: string;
  operateurId?: number;
}

export type OuvrirSessionResponse = ApiResponse<SessionCaisse>;
export type FermerSessionResponse = ApiResponse<SessionCaisse>;
export type ApportCoffreResponse = ApiResponse<MouvementCaisse>;
export type ApportProduitResponse = ApiResponse<MouvementCaisse>;
export type RemiseCoffreResponse = ApiResponse<MouvementCaisse>;
export type ParametresCaisseResponse = ApiResponse<ParametresCaisse>;
export type SessionActiveResponse = ApiResponse<SessionCaisse | null>;
export type DateComptableResponse = ApiResponse<DateComptable>;
export type SessionsConcurrentesResponse = ApiResponse<SessionConcurrente[]>;
export type HistoriqueResponse = ApiResponse<SessionCaisse[]>;
export type SessionDetailResponse = ApiResponse<SessionCaisse>;
export type MouvementsResponse = ApiResponse<MouvementCaisse[]>;
export type ReimprimerTicketsResponse = ApiResponse<void>;

export interface GestionCaisseState {
  sessionActive: SessionCaisse | null;
  parametres: ParametresCaisse | null;
  sessionsConcurrentes: SessionConcurrente[];
  mouvements: MouvementCaisse[];
  historique: SessionCaisse[];
  dateComptable: DateComptable | null;
  isLoading: boolean;
  error: string | null;
  showHistoriqueDialog: boolean;
  showConsultationDialog: boolean;
  selectedSessionId: number | null;

  chargerParametres: () => Promise<void>;
  chargerSessionActive: () => Promise<void>;
  verifierDateComptable: () => Promise<void>;
  controlerCoffre: () => Promise<void>;
  detecterSessionsConcurrentes: () => Promise<void>;
  ouvrirSession: () => Promise<void>;
  apportCoffre: (montant: number, deviseCode: string) => Promise<void>;
  apportProduit: (produitId: number, quantite: number) => Promise<void>;
  remiseCoffre: (montant: number, deviseCode: string) => Promise<void>;
  fermerSession: () => Promise<void>;
  consulterHistorique: () => Promise<void>;
  consulterSession: (sessionId: number) => Promise<void>;
  reimprimerTickets: (sessionId: number) => Promise<void>;
  setShowHistoriqueDialog: (show: boolean) => void;
  setShowConsultationDialog: (show: boolean) => void;
  setSelectedSessionId: (sessionId: number | null) => void;
  setError: (error: string | null) => void;
}

export const SESSION_STATUT_LABELS = {
  ouverte: "Ouverte",
  fermee: "Fermée",
  cloture_en_cours: "Clôture en cours",
  suspendue: "Suspendue",
} as const;

export const MOUVEMENT_TYPE_LABELS = {
  apport_coffre: "Apport coffre",
  remise_coffre: "Remise coffre",
  apport_produit: "Apport produit",
  retrait_produit: "Retrait produit",
} as const;

export const MOUVEMENT_TYPE_OPTIONS = [
  { value: "apport_coffre" as const, label: MOUVEMENT_TYPE_LABELS.apport_coffre },
  { value: "remise_coffre" as const, label: MOUVEMENT_TYPE_LABELS.remise_coffre },
  { value: "apport_produit" as const, label: MOUVEMENT_TYPE_LABELS.apport_produit },
  { value: "retrait_produit" as const, label: MOUVEMENT_TYPE_LABELS.retrait_produit },
] as const;

export const SESSION_STATUT_OPTIONS = [
  { value: "ouverte" as const, label: SESSION_STATUT_LABELS.ouverte },
  { value: "fermee" as const, label: SESSION_STATUT_LABELS.fermee },
  { value: "cloture_en_cours" as const, label: SESSION_STATUT_LABELS.cloture_en_cours },
  { value: "suspendue" as const, label: SESSION_STATUT_LABELS.suspendue },
] as const;