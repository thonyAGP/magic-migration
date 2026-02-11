import type { TicketData } from '../types';

export interface RecapTicketData {
  village: string;
  caisse: string;
  date: string;
  sections: {
    titre: string;
    lignes: { label: string; montant: number }[];
    sousTotal: number;
  }[];
  totalGeneral: number;
}

export function generateRecapTicket(data: RecapTicketData): TicketData {
  const lines = data.sections.flatMap((s) => [
    { description: `== ${s.titre} ==`, montant: 0, devise: '' },
    ...s.lignes.map((l) => ({
      description: l.label,
      montant: l.montant,
      devise: 'EUR',
    })),
    { description: `Sous-total ${s.titre}`, montant: s.sousTotal, devise: 'EUR' },
    { description: '---', montant: 0, devise: '' },
  ]);

  return {
    header: {
      societe: data.village,
      caisse: data.caisse,
      session: 'RECAPITULATIF',
      date: data.date,
      heure: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      operateur: '',
    },
    lines,
    footer: {
      total: data.totalGeneral,
      devise: 'EUR',
      moyenPaiement: 'RECAP',
    },
  };
}
