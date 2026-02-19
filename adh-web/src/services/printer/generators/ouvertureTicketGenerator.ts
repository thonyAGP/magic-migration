import type { TicketData } from '../types';
import type { SoldeParMOP } from '@/types/session';

export interface OuvertureTicketData {
  village: string;
  caisse: string;
  caissier: string;
  denominations: { valeur: number; quantite: number; total: number }[];
  totalFondCaisse: number;
  date: string;
  heure: string;
  // B1: MOP breakdown for detailed ticket (IDE 137)
  mopBreakdown?: SoldeParMOP;
  apportCoffre?: number;
  apportProduits?: number;
}

export function generateOuvertureTicket(data: OuvertureTicketData): TicketData {
  const lines: TicketData['lines'] = [
    { description: 'OUVERTURE DE CAISSE', montant: 0, devise: '' },
    { description: '---', montant: 0, devise: '' },
    ...data.denominations.map((d) => ({
      description: `${d.valeur.toFixed(2)} EUR`,
      quantite: d.quantite,
      montant: d.total,
      devise: 'EUR',
    })),
  ];

  // B1: Add MOP breakdown section if available (IDE 137: FE-FF)
  if (data.mopBreakdown && data.mopBreakdown.total > 0) {
    lines.push({ description: '---', montant: 0, devise: '' });
    lines.push({ description: 'VENTILATION MOP', montant: 0, devise: '' });
    if (data.mopBreakdown.monnaie > 0) {
      lines.push({ description: 'Monnaie', montant: data.mopBreakdown.monnaie, devise: 'EUR' });
    }
    if (data.mopBreakdown.cartes > 0) {
      lines.push({ description: 'Cartes', montant: data.mopBreakdown.cartes, devise: 'EUR' });
    }
    if (data.mopBreakdown.cheques > 0) {
      lines.push({ description: 'Cheques', montant: data.mopBreakdown.cheques, devise: 'EUR' });
    }
    if (data.mopBreakdown.produits > 0) {
      lines.push({ description: 'Produits', montant: data.mopBreakdown.produits, devise: 'EUR' });
    }
    if (data.mopBreakdown.od > 0) {
      lines.push({ description: 'OD', montant: data.mopBreakdown.od, devise: 'EUR' });
    }
  }

  // B1: Add apport section if present (IDE 137: EY, RM-002)
  if ((data.apportCoffre && data.apportCoffre > 0) || (data.apportProduits && data.apportProduits > 0)) {
    lines.push({ description: '---', montant: 0, devise: '' });
    lines.push({ description: 'APPROVISIONNEMENTS', montant: 0, devise: '' });
    if (data.apportCoffre && data.apportCoffre > 0) {
      lines.push({ description: 'Apport coffre', montant: data.apportCoffre, devise: 'EUR' });
    }
    if (data.apportProduits && data.apportProduits > 0) {
      lines.push({ description: 'Apport produits', montant: data.apportProduits, devise: 'EUR' });
    }
  }

  return {
    header: {
      societe: data.village,
      caisse: data.caisse,
      session: 'OUVERTURE',
      date: data.date,
      heure: data.heure,
      operateur: data.caissier,
    },
    lines,
    footer: {
      total: data.totalFondCaisse,
      devise: 'EUR',
      moyenPaiement: 'FOND DE CAISSE',
    },
  };
}
