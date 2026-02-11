import type { TicketData } from '../types';

export interface OuvertureTicketData {
  village: string;
  caisse: string;
  caissier: string;
  denominations: { valeur: number; quantite: number; total: number }[];
  totalFondCaisse: number;
  date: string;
  heure: string;
}

export function generateOuvertureTicket(data: OuvertureTicketData): TicketData {
  return {
    header: {
      societe: data.village,
      caisse: data.caisse,
      session: 'OUVERTURE',
      date: data.date,
      heure: data.heure,
      operateur: data.caissier,
    },
    lines: [
      { description: 'OUVERTURE DE CAISSE', montant: 0, devise: '' },
      { description: '---', montant: 0, devise: '' },
      ...data.denominations.map((d) => ({
        description: `${d.valeur.toFixed(2)} EUR`,
        quantite: d.quantite,
        montant: d.total,
        devise: 'EUR',
      })),
    ],
    footer: {
      total: data.totalFondCaisse,
      devise: 'EUR',
      moyenPaiement: 'FOND DE CAISSE',
    },
  };
}
