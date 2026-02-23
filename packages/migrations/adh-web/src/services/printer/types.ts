export interface TicketHeader {
  societe: string;
  caisse: string;
  session: string;
  date: string;
  heure: string;
  operateur: string;
}

export interface TicketLine {
  description: string;
  quantite?: number;
  montant: number;
  devise: string;
}

export interface TicketFooter {
  total: number;
  devise: string;
  moyenPaiement: string;
  rendu?: number;
}

export interface TicketData {
  header: TicketHeader;
  lines: TicketLine[];
  footer: TicketFooter;
  duplicata?: boolean;
}

export interface PrinterConfig {
  type: 'pdf' | 'escpos';
  paperWidth?: number;
}

export const TicketType = {
  VENTE: 'VENTE',
  OUVERTURE: 'OUVERTURE',
  FERMETURE: 'FERMETURE',
  APPRO: 'APPRO',
  RECAP: 'RECAP',
  GARANTIE: 'GARANTIE',
  CHANGE: 'CHANGE',
} as const;

export type TicketType = typeof TicketType[keyof typeof TicketType];

export type PrinterChoice = 'pdf-browser' | 'pdf-download' | 'escpos';
