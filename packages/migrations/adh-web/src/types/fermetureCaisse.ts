export type FermetureCaisseView = 'recap' | 'saisie' | 'ecart' | 'coffre' | 'validation';

export interface PointageDevise {
  societe: string;
  numeroSession: number;
  codeDevise: string;
  montantOuverture: number;
  montantCompte: number;
  montantCalcule: number;
  ecart: number;
  commentaireEcart: string | null;
}

export interface PointageArticle {
  societe: string;
  numeroSession: number;
  codeArticle: string;
  quantiteOuverture: number;
  quantiteComptee: number;
  quantiteCalculee: number;
  ecart: number;
}

export interface PointageApproRemise {
  societe: string;
  numeroSession: number;
  type: 'APPORT' | 'REMISE';
  montant: number;
  ticketEdite: boolean;
}

export interface MoyenPaiement {
  code: string;
  libelle: string;
  soldeOuverture: number;
  montantCompte: number;
  montantCalcule: number;
  ecart: number;
}

export interface RecapFermeture {
  societe: string;
  numeroSession: number;
  moyensPaiement: MoyenPaiement[];
  totalVersementCoffre: number;
  soldeFinal: number;
}

export interface FermetureCaisseState {
  recapFermeture: RecapFermeture | null;
  pointagesDevise: PointageDevise[];
  pointagesArticle: PointageArticle[];
  pointagesApproRemise: PointageApproRemise[];
  ecartsDetectes: boolean;
  ecartsJustifies: boolean;
  tousPointes: boolean;
  fermetureValidee: boolean;
  isLoading: boolean;
  error: string | null;
  currentView: FermetureCaisseView;

  chargerRecapFermeture: (societe: string, numeroSession: number) => Promise<void>;
  saisirMontantsComptes: (moyenPaiement: string) => Promise<void>;
  calculerEcarts: () => Promise<void>;
  justifierEcart: (moyenPaiement: string, commentaire: string) => Promise<void>;
  effectuerApportCoffre: (montant: number) => Promise<void>;
  effectuerApportArticles: (codeArticle: string, quantite: number) => Promise<void>;
  effectuerRemiseCaisse: (montant: number) => Promise<void>;
  validerFermeture: (societe: string, numeroSession: number) => Promise<void>;
  genererTickets: (societe: string, numeroSession: number) => Promise<void>;
  mettreAJourHistorique: (societe: string, numeroSession: number) => Promise<void>;
  calculerSoldeFinal: () => Promise<void>;
  afficherDetailDevises: () => Promise<void>;
  setCurrentView: (view: FermetureCaisseView) => void;
  reset: () => void;
}

export interface SaisirMontantsRequest {
  societe: string;
  numeroSession: number;
  moyenPaiement: string;
}

export interface JustifierEcartRequest {
  societe: string;
  numeroSession: number;
  moyenPaiement: string;
  commentaire: string;
}

export interface ApportCoffreRequest {
  societe: string;
  numeroSession: number;
  montant: number;
}

export interface ApportArticlesRequest {
  societe: string;
  numeroSession: number;
  codeArticle: string;
  quantite: number;
}

export interface RemiseCaisseRequest {
  societe: string;
  numeroSession: number;
  montant: number;
}

export interface ValiderFermetureRequest {
  societe: string;
  numeroSession: number;
}

export interface ValiderFermetureResponse {
  success: boolean;
  errors?: string[];
}

export interface GenererTicketsResponse {
  tickets: string[];
}

export interface FermetureCaisseApiResponse<T> extends ApiResponse<T> {
  data?: T;
}