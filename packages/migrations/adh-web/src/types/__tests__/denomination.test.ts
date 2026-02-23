import { describe, it, expect } from 'vitest';
import { denominationCountSchema, countingSubmitSchema } from '@/components/caisse/denomination/schemas';
import type {
  DenominationCatalog,
  DenominationCounting,
  CountingResult,
  CountingSession,
} from '@/types/denomination';

describe('denomination types runtime validation', () => {
  describe('DenominationCatalog', () => {
    it('should satisfy the type shape for billet', () => {
      const billet: DenominationCatalog = {
        id: 1,
        deviseCode: 'EUR',
        valeur: 50,
        type: 'billet',
        libelle: '50 EUR',
        ordre: 1,
      };

      expect(billet.type).toBe('billet');
      expect(billet.valeur).toBe(50);
      expect(billet.deviseCode).toBe('EUR');
    });

    it('should satisfy the type shape for piece', () => {
      const piece: DenominationCatalog = {
        id: 5,
        deviseCode: 'EUR',
        valeur: 0.5,
        type: 'piece',
        libelle: '50 cents',
        ordre: 10,
      };

      expect(piece.type).toBe('piece');
      expect(piece.valeur).toBe(0.5);
    });
  });

  describe('DenominationCounting', () => {
    it('should compute total as quantity * value', () => {
      const counting: DenominationCounting = {
        denominationId: 1,
        quantite: 5,
        total: 250, // 5 * 50
      };

      expect(counting.total).toBe(counting.quantite * 50);
    });
  });

  describe('CountingResult', () => {
    it('should calculate ecart as totalCompte - totalAttendu', () => {
      const result: CountingResult = {
        deviseCode: 'EUR',
        totalCompte: 490,
        totalAttendu: 500,
        ecart: -10,
        details: [],
      };

      expect(result.ecart).toBe(result.totalCompte - result.totalAttendu);
    });

    it('should contain detail entries', () => {
      const result: CountingResult = {
        deviseCode: 'EUR',
        totalCompte: 250,
        totalAttendu: 250,
        ecart: 0,
        details: [
          { denominationId: 1, quantite: 5, total: 250 },
        ],
      };

      expect(result.details).toHaveLength(1);
      expect(result.details[0].total).toBe(250);
    });
  });

  describe('CountingSession', () => {
    it('should accept ouverture type', () => {
      const session: CountingSession = {
        sessionId: 42,
        type: 'ouverture',
        deviseResults: [],
        timestamp: '2026-02-09T08:30:00Z',
      };

      expect(session.type).toBe('ouverture');
    });

    it('should accept fermeture type', () => {
      const session: CountingSession = {
        sessionId: 42,
        type: 'fermeture',
        deviseResults: [],
        timestamp: '2026-02-09T18:00:00Z',
      };

      expect(session.type).toBe('fermeture');
    });
  });

  describe('Zod schema integration with types', () => {
    it('should parse valid denomination count matching DenominationCounting shape', () => {
      const result = denominationCountSchema.safeParse({
        denominationId: 1,
        quantite: 5,
      });

      expect(result.success).toBe(true);
    });

    it('should parse valid counting submit matching CountingSession shape', () => {
      const result = countingSubmitSchema.safeParse({
        sessionId: 42,
        type: 'ouverture',
        counts: [
          { denominationId: 1, quantite: 5 },
          { denominationId: 2, quantite: 10 },
        ],
      });

      expect(result.success).toBe(true);
    });
  });
});
