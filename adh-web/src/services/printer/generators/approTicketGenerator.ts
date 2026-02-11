import type { TicketData } from '../types';

export interface ApproTicketData {
  village: string;
  caisse: string;
  caissier: string;
  typeOperation: 'APPORT_COFFRE' | 'APPORT_PRODUITS' | 'REMISE_COFFRE';
  details: { description: string; montant: number }[];
  montantTotal: number;
  date: string;
}

const OPERATION_LABELS: Record<ApproTicketData['typeOperation'], string> = {
  APPORT_COFFRE: 'Apport Coffre',
  APPORT_PRODUITS: 'Apport Produits',
  REMISE_COFFRE: 'Remise Coffre',
};

export function generateApproTicket(data: ApproTicketData): TicketData {
  const now = new Date();
  return {
    header: {
      societe: data.village,
      caisse: data.caisse,
      session: data.typeOperation,
      date: data.date,
      heure: now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      operateur: data.caissier,
    },
    lines: [
      { description: OPERATION_LABELS[data.typeOperation], montant: 0, devise: '' },
      { description: '---', montant: 0, devise: '' },
      ...data.details.map((d) => ({
        description: d.description,
        montant: d.montant,
        devise: 'EUR',
      })),
    ],
    footer: {
      total: data.montantTotal,
      devise: 'EUR',
      moyenPaiement: OPERATION_LABELS[data.typeOperation],
    },
  };
}
