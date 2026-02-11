import type { TicketData } from '../types';

export interface GarantieTicketData {
  village: string;
  compteNumero: string;
  compteNom: string;
  typeGarantie: 'DEPOT' | 'RETRAIT';
  articles: { description: string; montant: number }[];
  montantTotal: number;
  date: string;
  reference: string;
}

export function generateGarantieTicket(data: GarantieTicketData): TicketData {
  const label = data.typeGarantie === 'DEPOT' ? 'DEPOT GARANTIE' : 'RETRAIT GARANTIE';
  const now = new Date();

  return {
    header: {
      societe: data.village,
      caisse: '',
      session: data.reference,
      date: data.date,
      heure: now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      operateur: '',
    },
    lines: [
      { description: label, montant: 0, devise: '' },
      { description: `Compte: ${data.compteNumero} - ${data.compteNom}`, montant: 0, devise: '' },
      { description: '---', montant: 0, devise: '' },
      ...data.articles.map((a) => ({
        description: a.description,
        montant: a.montant,
        devise: 'EUR',
      })),
    ],
    footer: {
      total: data.montantTotal,
      devise: 'EUR',
      moyenPaiement: 'GARANTIE',
    },
  };
}
