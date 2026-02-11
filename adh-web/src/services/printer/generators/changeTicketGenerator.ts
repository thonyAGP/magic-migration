import type { TicketData } from '../types';

export interface ChangeTicketData {
  village: string;
  compteNumero: string;
  deviseSource: string;
  montantSource: number;
  deviseCible: string;
  montantCible: number;
  taux: number;
  commission: number;
  date: string;
  reference: string;
}

export function generateChangeTicket(data: ChangeTicketData): TicketData {
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
      { description: 'CHANGE DEVISES', montant: 0, devise: '' },
      { description: `Compte: ${data.compteNumero}`, montant: 0, devise: '' },
      { description: '---', montant: 0, devise: '' },
      { description: `Montant source`, montant: data.montantSource, devise: data.deviseSource },
      { description: `Taux: ${data.taux.toFixed(4)}`, montant: 0, devise: '' },
      { description: `Commission`, montant: data.commission, devise: data.deviseCible },
      { description: '---', montant: 0, devise: '' },
      { description: `Montant converti`, montant: data.montantCible, devise: data.deviseCible },
    ],
    footer: {
      total: data.montantCible,
      devise: data.deviseCible,
      moyenPaiement: 'CHANGE',
    },
  };
}
