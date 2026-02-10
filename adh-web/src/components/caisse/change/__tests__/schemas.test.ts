// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { changeOperationSchema, cancellationSchema } from '../schemas';

describe('changeOperationSchema', () => {
  it('should accept valid operation data', () => {
    const result = changeOperationSchema.safeParse({
      type: 'achat',
      deviseCode: 'USD',
      montant: 100,
      taux: 1.0856,
      modePaiement: 'especes',
    });
    expect(result.success).toBe(true);
  });

  it('should reject empty devise code', () => {
    const result = changeOperationSchema.safeParse({
      type: 'achat',
      deviseCode: '',
      montant: 100,
      taux: 1.0856,
      modePaiement: 'especes',
    });
    expect(result.success).toBe(false);
  });

  it('should reject negative montant', () => {
    const result = changeOperationSchema.safeParse({
      type: 'vente',
      deviseCode: 'GBP',
      montant: -50,
      taux: 0.8534,
      modePaiement: 'carte',
    });
    expect(result.success).toBe(false);
  });

  it('should reject zero taux', () => {
    const result = changeOperationSchema.safeParse({
      type: 'achat',
      deviseCode: 'CHF',
      montant: 200,
      taux: 0,
      modePaiement: 'especes',
    });
    expect(result.success).toBe(false);
  });

  it('should reject empty mode de paiement', () => {
    const result = changeOperationSchema.safeParse({
      type: 'achat',
      deviseCode: 'USD',
      montant: 100,
      taux: 1.0856,
      modePaiement: '',
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid type', () => {
    const result = changeOperationSchema.safeParse({
      type: 'transfert',
      deviseCode: 'USD',
      montant: 100,
      taux: 1.0856,
      modePaiement: 'especes',
    });
    expect(result.success).toBe(false);
  });
});

describe('cancellationSchema', () => {
  it('should accept valid motif', () => {
    const result = cancellationSchema.safeParse({ motif: 'Erreur de saisie' });
    expect(result.success).toBe(true);
  });

  it('should reject motif shorter than 3 chars', () => {
    const result = cancellationSchema.safeParse({ motif: 'ab' });
    expect(result.success).toBe(false);
  });

  it('should reject empty motif', () => {
    const result = cancellationSchema.safeParse({ motif: '' });
    expect(result.success).toBe(false);
  });

  it('should reject motif longer than 200 chars', () => {
    const result = cancellationSchema.safeParse({ motif: 'a'.repeat(201) });
    expect(result.success).toBe(false);
  });
});
