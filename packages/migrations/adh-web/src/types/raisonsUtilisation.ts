import type { ApiResponse } from "@/services/api/apiClient";

export interface RaisonUtilisation {
  idPrimaire: number;
  idSecondaire: number | null;
  commentaire: string;
  existeRaisonSecondaire: boolean;
}

export interface RaisonsUtilisationState {
  raisons: RaisonUtilisation[];
  selectedRaisonPrimaire: number | null;
  selectedRaisonSecondaire: number | null;
  commentaireSaisi: string;
  confirmation: boolean;
  retourRaison: boolean;
  isLoading: boolean;
  error: string | null;

  loadRaisonsUtilisation: (serviceCode?: number) => Promise<void>;
  selectRaisonPrimaire: (idPrimaire: number) => Promise<void>;
  selectRaisonSecondaire: (idSecondaire: number) => Promise<void>;
  validerSelection: () => Promise<void>;
  abandonner: () => Promise<void>;
  updateCommentaire: (commentaire: string) => void;
  reset: () => void;
}

export interface GetRaisonsUtilisationRequest {
  serviceCode?: number;
}

export interface GetRaisonsUtilisationResponse extends ApiResponse {
  data: RaisonUtilisation[];
}

export interface SelectRaisonPrimaireRequest {
  idPrimaire: number;
}

export interface SelectRaisonSecondaireRequest {
  idSecondaire: number;
}

export interface ValiderSelectionRequest {
  commentaire: string;
  selectedRaisonPrimaire: number;
  selectedRaisonSecondaire: number | null;
}

export interface ValiderSelectionResponse extends ApiResponse {
  data: {
    idPrimaire: number;
    idSecondaire: number | null;
    commentaire: string;
  };
}

export const RAISON_UTILISATION_MOCK = [
  {
    idPrimaire: 1,
    idSecondaire: null,
    commentaire: "Paiement service bar",
    existeRaisonSecondaire: false,
  },
  {
    idPrimaire: 2,
    idSecondaire: null,
    commentaire: "Paiement restaurant",
    existeRaisonSecondaire: false,
  },
  {
    idPrimaire: 3,
    idSecondaire: null,
    commentaire: "Paiement boutique",
    existeRaisonSecondaire: false,
  },
  {
    idPrimaire: 4,
    idSecondaire: null,
    commentaire: "Caution",
    existeRaisonSecondaire: false,
  },
  {
    idPrimaire: 5,
    idSecondaire: null,
    commentaire: "Dépôt espèces",
    existeRaisonSecondaire: false,
  },
  {
    idPrimaire: 6,
    idSecondaire: 61,
    commentaire: "Retrait espèces",
    existeRaisonSecondaire: true,
  },
  {
    idPrimaire: 7,
    idSecondaire: null,
    commentaire: "Frais divers",
    existeRaisonSecondaire: false,
  },
  {
    idPrimaire: 8,
    idSecondaire: null,
    commentaire: "Remboursement",
    existeRaisonSecondaire: false,
  },
  {
    idPrimaire: 9,
    idSecondaire: null,
    commentaire: "Ajustement compte",
    existeRaisonSecondaire: false,
  },
  {
    idPrimaire: 10,
    idSecondaire: null,
    commentaire: "Autre motif",
    existeRaisonSecondaire: false,
  },
] as const satisfies readonly RaisonUtilisation[];