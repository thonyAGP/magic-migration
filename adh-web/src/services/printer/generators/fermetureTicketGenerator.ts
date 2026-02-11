import type { TicketData } from '../types';

export interface FermetureTicketData {
  village: string;
  caisse: string;
  caissier: string;
  comptages: { type: string; montant: number; ecart: number }[];
  totalComptage: number;
  ecartGlobal: number;
  date: string;
  heure: string;
}

export function generateFermetureTicket(data: FermetureTicketData): TicketData {
  const lines = data.comptages.flatMap((c) => [
    { description: c.type, montant: c.montant, devise: 'EUR' },
    ...(c.ecart !== 0
      ? [{ description: `  Ecart: ${c.ecart > 0 ? '+' : ''}${c.ecart.toFixed(2)}`, montant: c.ecart, devise: 'EUR' }]
      : []),
  ]);

  return {
    header: {
      societe: data.village,
      caisse: data.caisse,
      session: 'FERMETURE',
      date: data.date,
      heure: data.heure,
      operateur: data.caissier,
    },
    lines: [
      { description: 'FERMETURE DE CAISSE', montant: 0, devise: '' },
      { description: '---', montant: 0, devise: '' },
      ...lines,
      { description: '---', montant: 0, devise: '' },
      { description: `Ecart global: ${data.ecartGlobal > 0 ? '+' : ''}${data.ecartGlobal.toFixed(2)}`, montant: data.ecartGlobal, devise: 'EUR' },
    ],
    footer: {
      total: data.totalComptage,
      devise: 'EUR',
      moyenPaiement: 'COMPTAGE',
    },
  };
}
