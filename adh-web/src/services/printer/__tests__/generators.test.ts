import { describe, it, expect } from 'vitest';
import { generateVenteTicket } from '../generators/venteTicketGenerator';
import { generateOuvertureTicket } from '../generators/ouvertureTicketGenerator';
import { generateFermetureTicket } from '../generators/fermetureTicketGenerator';
import { generateApproTicket } from '../generators/approTicketGenerator';
import { generateRecapTicket } from '../generators/recapTicketGenerator';
import { generateGarantieTicket } from '../generators/garantieTicketGenerator';
import { generateChangeTicket } from '../generators/changeTicketGenerator';
import type { TicketData } from '../types';

function assertValidTicket(ticket: TicketData) {
  expect(ticket.header).toBeDefined();
  expect(ticket.header.societe).toBeTruthy();
  expect(ticket.lines).toBeDefined();
  expect(Array.isArray(ticket.lines)).toBe(true);
  expect(ticket.footer).toBeDefined();
  expect(typeof ticket.footer.total).toBe('number');
  expect(ticket.footer.devise).toBeTruthy();
}

describe('Ticket Generators', () => {
  describe('generateVenteTicket', () => {
    it('should generate a valid vente ticket with lines', () => {
      const ticket = generateVenteTicket({
        village: 'Opio',
        caisse: 'C01',
        caissier: 'Jean',
        compteNumero: '12345',
        compteNom: 'Dupont',
        mode: 'GP',
        lignes: [
          { description: 'Boisson', quantite: 2, prixUnitaire: 3.5, montant: 7.0 },
          { description: 'Snack', quantite: 1, prixUnitaire: 2.0, montant: 2.0 },
        ],
        mopUtilisee: 'CB',
        totalTransaction: 9.0,
        reference: 'V-001',
        date: '11/02/2026',
      });

      assertValidTicket(ticket);
      expect(ticket.header.societe).toBe('Opio');
      expect(ticket.header.caisse).toBe('C01');
      expect(ticket.header.operateur).toBe('Jean');
      expect(ticket.footer.total).toBe(9.0);
      expect(ticket.footer.moyenPaiement).toBe('CB');
      expect(ticket.lines.length).toBeGreaterThanOrEqual(5); // header lines + 2 articles
    });

    it('should handle zero articles', () => {
      const ticket = generateVenteTicket({
        village: 'Opio',
        caisse: 'C01',
        caissier: 'Jean',
        compteNumero: '12345',
        compteNom: 'Dupont',
        mode: 'Boutique',
        lignes: [],
        mopUtilisee: 'ESPECES',
        totalTransaction: 0,
        reference: 'V-002',
        date: '11/02/2026',
      });

      assertValidTicket(ticket);
      expect(ticket.footer.total).toBe(0);
    });
  });

  describe('generateOuvertureTicket', () => {
    it('should generate a valid ouverture ticket', () => {
      const ticket = generateOuvertureTicket({
        village: 'Opio',
        caisse: 'C01',
        caissier: 'Marie',
        denominations: [
          { valeur: 50, quantite: 2, total: 100 },
          { valeur: 20, quantite: 5, total: 100 },
          { valeur: 10, quantite: 10, total: 100 },
        ],
        totalFondCaisse: 300,
        date: '11/02/2026',
        heure: '08:00',
      });

      assertValidTicket(ticket);
      expect(ticket.header.session).toBe('OUVERTURE');
      expect(ticket.footer.total).toBe(300);
      // 1 title + 1 separator + 3 denoms = 5
      expect(ticket.lines.length).toBe(5);
    });

    it('should handle empty denominations', () => {
      const ticket = generateOuvertureTicket({
        village: 'Opio',
        caisse: 'C01',
        caissier: 'Marie',
        denominations: [],
        totalFondCaisse: 0,
        date: '11/02/2026',
        heure: '08:00',
      });

      assertValidTicket(ticket);
      expect(ticket.footer.total).toBe(0);
    });
  });

  describe('generateFermetureTicket', () => {
    it('should generate a valid fermeture ticket', () => {
      const ticket = generateFermetureTicket({
        village: 'Opio',
        caisse: 'C01',
        caissier: 'Marie',
        comptages: [
          { type: 'Especes', montant: 500, ecart: -5 },
          { type: 'CB', montant: 1200, ecart: 0 },
        ],
        totalComptage: 1700,
        ecartGlobal: -5,
        date: '11/02/2026',
        heure: '22:00',
      });

      assertValidTicket(ticket);
      expect(ticket.header.session).toBe('FERMETURE');
      expect(ticket.footer.total).toBe(1700);
      // Lines include ecart for Especes but not CB
      const ecartLine = ticket.lines.find((l) => l.description.includes('Ecart global'));
      expect(ecartLine).toBeDefined();
    });

    it('should handle no ecarts', () => {
      const ticket = generateFermetureTicket({
        village: 'Opio',
        caisse: 'C01',
        caissier: 'Marie',
        comptages: [{ type: 'CB', montant: 500, ecart: 0 }],
        totalComptage: 500,
        ecartGlobal: 0,
        date: '11/02/2026',
        heure: '22:00',
      });

      assertValidTicket(ticket);
      // No ecart lines for CB (ecart=0)
      const ecartLines = ticket.lines.filter((l) => l.description.startsWith('  Ecart:'));
      expect(ecartLines.length).toBe(0);
    });
  });

  describe('generateApproTicket', () => {
    it('should generate a valid appro ticket for APPORT_COFFRE', () => {
      const ticket = generateApproTicket({
        village: 'Opio',
        caisse: 'C01',
        caissier: 'Pierre',
        typeOperation: 'APPORT_COFFRE',
        details: [
          { description: 'Billets 50 EUR', montant: 500 },
          { description: 'Billets 20 EUR', montant: 200 },
        ],
        montantTotal: 700,
        date: '11/02/2026',
      });

      assertValidTicket(ticket);
      expect(ticket.header.session).toBe('APPORT_COFFRE');
      expect(ticket.footer.total).toBe(700);
      expect(ticket.lines.some((l) => l.description === 'Apport Coffre')).toBe(true);
    });

    it('should handle REMISE_COFFRE operation type', () => {
      const ticket = generateApproTicket({
        village: 'Opio',
        caisse: 'C01',
        caissier: 'Pierre',
        typeOperation: 'REMISE_COFFRE',
        details: [{ description: 'Remise especes', montant: 1000 }],
        montantTotal: 1000,
        date: '11/02/2026',
      });

      assertValidTicket(ticket);
      expect(ticket.lines.some((l) => l.description === 'Remise Coffre')).toBe(true);
    });
  });

  describe('generateRecapTicket', () => {
    it('should generate a valid recap ticket with sections', () => {
      const ticket = generateRecapTicket({
        village: 'Opio',
        caisse: 'C01',
        date: '11/02/2026',
        sections: [
          {
            titre: 'Especes',
            lignes: [
              { label: 'Ventes', montant: 500 },
              { label: 'Remboursements', montant: -50 },
            ],
            sousTotal: 450,
          },
          {
            titre: 'CB',
            lignes: [{ label: 'Ventes', montant: 1200 }],
            sousTotal: 1200,
          },
        ],
        totalGeneral: 1650,
      });

      assertValidTicket(ticket);
      expect(ticket.header.session).toBe('RECAPITULATIF');
      expect(ticket.footer.total).toBe(1650);
      expect(ticket.lines.some((l) => l.description.includes('Especes'))).toBe(true);
      expect(ticket.lines.some((l) => l.description.includes('CB'))).toBe(true);
    });

    it('should handle empty sections', () => {
      const ticket = generateRecapTicket({
        village: 'Opio',
        caisse: 'C01',
        date: '11/02/2026',
        sections: [],
        totalGeneral: 0,
      });

      assertValidTicket(ticket);
      expect(ticket.lines.length).toBe(0);
      expect(ticket.footer.total).toBe(0);
    });
  });

  describe('generateGarantieTicket', () => {
    it('should generate a valid depot garantie ticket', () => {
      const ticket = generateGarantieTicket({
        village: 'Opio',
        compteNumero: '12345',
        compteNom: 'Dupont',
        typeGarantie: 'DEPOT',
        articles: [
          { description: 'Raquette tennis', montant: 50 },
          { description: 'VTT', montant: 200 },
        ],
        montantTotal: 250,
        date: '11/02/2026',
        reference: 'G-001',
      });

      assertValidTicket(ticket);
      expect(ticket.lines.some((l) => l.description === 'DEPOT GARANTIE')).toBe(true);
      expect(ticket.footer.total).toBe(250);
    });

    it('should generate retrait garantie ticket', () => {
      const ticket = generateGarantieTicket({
        village: 'Opio',
        compteNumero: '12345',
        compteNom: 'Dupont',
        typeGarantie: 'RETRAIT',
        articles: [{ description: 'Raquette tennis', montant: 50 }],
        montantTotal: 50,
        date: '11/02/2026',
        reference: 'G-002',
      });

      assertValidTicket(ticket);
      expect(ticket.lines.some((l) => l.description === 'RETRAIT GARANTIE')).toBe(true);
    });

    it('should handle no articles', () => {
      const ticket = generateGarantieTicket({
        village: 'Opio',
        compteNumero: '12345',
        compteNom: 'Dupont',
        typeGarantie: 'DEPOT',
        articles: [],
        montantTotal: 0,
        date: '11/02/2026',
        reference: 'G-003',
      });

      assertValidTicket(ticket);
      expect(ticket.footer.total).toBe(0);
    });
  });

  describe('generateChangeTicket', () => {
    it('should generate a valid change ticket', () => {
      const ticket = generateChangeTicket({
        village: 'Opio',
        compteNumero: '12345',
        deviseSource: 'USD',
        montantSource: 100,
        deviseCible: 'EUR',
        montantCible: 92.5,
        taux: 0.925,
        commission: 2.5,
        date: '11/02/2026',
        reference: 'CHG-001',
      });

      assertValidTicket(ticket);
      expect(ticket.lines.some((l) => l.description === 'CHANGE DEVISES')).toBe(true);
      expect(ticket.footer.total).toBe(92.5);
      expect(ticket.footer.devise).toBe('EUR');
      // Verify taux line
      const tauxLine = ticket.lines.find((l) => l.description.includes('Taux'));
      expect(tauxLine).toBeDefined();
      expect(tauxLine!.description).toContain('0.9250');
    });

    it('should handle negative commission', () => {
      const ticket = generateChangeTicket({
        village: 'Opio',
        compteNumero: '12345',
        deviseSource: 'GBP',
        montantSource: 50,
        deviseCible: 'EUR',
        montantCible: 58.0,
        taux: 1.16,
        commission: -1.0,
        date: '11/02/2026',
        reference: 'CHG-002',
      });

      assertValidTicket(ticket);
      const commLine = ticket.lines.find((l) => l.description === 'Commission');
      expect(commLine).toBeDefined();
      expect(commLine!.montant).toBe(-1.0);
    });
  });
});
