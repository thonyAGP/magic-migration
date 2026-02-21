import type { ApiResponse } from "@/services/api/apiClient";

// ApproTicket domain types (IDE 131 - Fermeture Caisse / Appro Ticket)

export type ApproTicketOperationType = 'apport_coffre' | 'apport_produits' | 'remise_coffre';

export interface ApproTicketLine {
  operation: ApproTicketOperationType;
  devise: string;
  montant: number;
}

export interface ApproTicketData {
  village: string;
  date: Date;
  sessionId: number;
  deviseLocale: string;
  montantApproProduit: number | null;
  lines: ApproTicketLine[];
}

export interface PrinterChoice {
  type: 'pdf-browser' | 'pdf-download' | 'escpos';
  format: 'a4' | 'thermal';
  printerId: number;
}

export interface ApproTicketState {
  ticketData: ApproTicketData | null;
  isGenerating: boolean;
  error: string | null;
  printerChoice: PrinterChoice | null;
  showPrinterDialog: boolean;
  generateApproTicket: (params: GenerateApproTicketParams) => Promise<void>;
  selectPrinter: (choice: PrinterChoice) => void;
  printTicket: (ticketData: ApproTicketData, printerChoice: PrinterChoice) => Promise<void>;
  clearError: () => void;
  resetState: () => void;
  setPrinterDialogVisible: (visible: boolean) => void;
}

export interface GenerateApproTicketParams {
  village: string;
  date: Date;
  sessionId: number;
  deviseLocale: string;
  montantApproProduit?: number;
}

export interface ApproTicketGenerateRequest {
  village: string;
  date: string;
  sessionId: number;
  deviseLocale: string;
  montantApproProduit?: number;
}

export interface ApproTicketGenerateResponse extends ApiResponse {
  data?: ApproTicketData;
}

export interface ApproTicketPrintRequest {
  ticketData: ApproTicketData;
  format: 'pdf' | 'escpos';
  printerId: number;
}

export interface ApproTicketPrintResponse extends ApiResponse {
  data?: {
    success: boolean;
    url?: string;
    jobId?: string;
  };
}

export const PRINTER_TYPES = {
  PDF_BROWSER: 'pdf-browser',
  PDF_DOWNLOAD: 'pdf-download',
  ESCPOS: 'escpos',
} as const;

export const PRINTER_FORMATS = {
  A4: 'a4',
  THERMAL: 'thermal',
} as const;

export const PRINTER_CONFIG = {
  1: {
    type: PRINTER_TYPES.PDF_BROWSER,
    format: PRINTER_FORMATS.A4,
    label: 'Imprimante PDF (Navigateur)',
  },
  9: {
    type: PRINTER_TYPES.ESCPOS,
    format: PRINTER_FORMATS.THERMAL,
    label: 'Imprimante Thermique',
  },
} as const;

export const APPRO_TICKET_OPERATIONS = {
  APPORT_COFFRE: 'apport_coffre',
  APPORT_PRODUITS: 'apport_produits',
  REMISE_COFFRE: 'remise_coffre',
} as const;

export const APPRO_TICKET_OPERATION_LABELS: Record<ApproTicketOperationType, string> = {
  apport_coffre: 'Apport Coffre',
  apport_produits: 'Apport Produits',
  remise_coffre: 'Remise Coffre',
} as const;