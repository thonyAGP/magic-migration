import type { TicketData } from '../types';

export interface VenteTicketData {
  village: string;
  caisse: string;
  caissier: string;
  compteNumero: string;
  compteNom: string;
  mode: 'GP' | 'Boutique';
  lignes: { description: string; quantite: number; prixUnitaire: number; montant: number }[];
  mopUtilisee: string;
  totalTransaction: number;
  reference: string;
  date: string;
}

export function generateVenteTicket(data: VenteTicketData): TicketData {
  const now = new Date();
  return {
    header: {
      societe: data.village,
      caisse: data.caisse,
      session: data.reference,
      date: data.date,
      heure: now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      operateur: data.caissier,
    },
    lines: [
      { description: `Compte: ${data.compteNumero} - ${data.compteNom}`, montant: 0, devise: '' },
      { description: `Mode: ${data.mode}`, montant: 0, devise: '' },
      { description: '---', montant: 0, devise: '' },
      ...data.lignes.map((l) => ({
        description: l.description,
        quantite: l.quantite,
        montant: l.montant,
        devise: 'EUR',
      })),
    ],
    footer: {
      total: data.totalTransaction,
      devise: 'EUR',
      moyenPaiement: data.mopUtilisee,
    },
  };
}
