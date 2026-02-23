import type { ApiResponse as _ApiResponse } from "@/services/api/apiClient";

// Comptage Historization - Backend service for saving caisse counting history

export interface ComptageHistoHeader {
  chronoHisto: number;
  chronoSession: number;
  dateValidation: Date;
  timeValidation: string;
  totalCaisse: number;
  quand: "O" | "F";
}

export interface ComptageHistoDevise {
  chronoHisto: number;
  deviseCode: string;
  montantCompte: number;
  ecart: number;
  total: number;
}

export interface SaveComptageHistorizationRequest {
  chronoSession: number;
  quand: "O" | "F";
  totalCaisse: number;
  deviseDetails: Array<{
    deviseCode: string;
    montantCompte: number;
    ecart: number;
    total: number;
  }>;
}

export interface SaveComptageHistorizationResponse {
  chronoHisto: number;
}

export interface ComptageHistorizationState {
  isLoading: boolean;
  error: string | null;
  lastHistoId: number | null;
  saveComptageHistorization: (
    request: SaveComptageHistorizationRequest
  ) => Promise<number>;
}

export const QUAND_OPTIONS = {
  OUVERTURE: "O",
  FERMETURE: "F",
} as const;

export type QuandType = typeof QUAND_OPTIONS[keyof typeof QUAND_OPTIONS];

export const createMockComptageHistoHeader = (
  overrides?: Partial<ComptageHistoHeader>
): ComptageHistoHeader => ({
  chronoHisto: Math.floor(Math.random() * 100000),
  chronoSession: 12345,
  dateValidation: new Date(),
  timeValidation: "14:30:45",
  totalCaisse: 5000,
  quand: "O",
  ...overrides,
});

export const createMockComptageHistoDevise = (
  chronoHisto: number,
  overrides?: Partial<ComptageHistoDevise>
): ComptageHistoDevise => ({
  chronoHisto,
  deviseCode: "EUR",
  montantCompte: 5000,
  ecart: 0,
  total: 5000,
  ...overrides,
});

export const generateMockHistorizationData = () => {
  const ouvertureHisto = createMockComptageHistoHeader({
    quand: "O",
    chronoHisto: 1000,
    dateValidation: new Date("2026-02-22T08:00:00"),
    timeValidation: "08:00:00",
    totalCaisse: 0,
  });

  const fermeture1Histo = createMockComptageHistoHeader({
    quand: "F",
    chronoHisto: 1001,
    dateValidation: new Date("2026-02-22T18:00:00"),
    timeValidation: "18:00:00",
    totalCaisse: 8750,
  });

  const fermeture2Histo = createMockComptageHistoHeader({
    quand: "F",
    chronoHisto: 1002,
    dateValidation: new Date("2026-02-23T18:00:00"),
    timeValidation: "18:00:00",
    totalCaisse: 9250,
  });

  return {
    headers: [ouvertureHisto, fermeture1Histo, fermeture2Histo],
    devises: [
      createMockComptageHistoDevise(1001, {
        deviseCode: "EUR",
        montantCompte: 7500,
        ecart: 0,
        total: 7500,
      }),
      createMockComptageHistoDevise(1001, {
        deviseCode: "USD",
        montantCompte: 1000,
        ecart: 50,
        total: 1050,
      }),
      createMockComptageHistoDevise(1001, {
        deviseCode: "GBP",
        montantCompte: 200,
        ecart: 0,
        total: 200,
      }),
      createMockComptageHistoDevise(1002, {
        deviseCode: "EUR",
        montantCompte: 8000,
        ecart: -50,
        total: 7950,
      }),
      createMockComptageHistoDevise(1002, {
        deviseCode: "USD",
        montantCompte: 1100,
        ecart: 100,
        total: 1200,
      }),
      createMockComptageHistoDevise(1002, {
        deviseCode: "GBP",
        montantCompte: 100,
        ecart: 0,
        total: 100,
      }),
    ],
  };
};