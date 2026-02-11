// @vitest-environment node
import { describe, it, expect } from 'vitest';
import {
  apportCoffreSchema,
  apportProduitsSchema,
  remiseCoffreSchema,
  telecollecteSchema,
  regularisationSchema,
} from '../schemas';

describe('apportCoffreSchema', () => {
  it('should accept valid data', () => {
    const result = apportCoffreSchema.safeParse({ montant: 100, deviseCode: 'EUR', motif: 'Test' });
    expect(result.success).toBe(true);
  });

  it('should reject negative montant', () => {
    const result = apportCoffreSchema.safeParse({ montant: -10, deviseCode: 'EUR', motif: 'Test' });
    expect(result.success).toBe(false);
  });

  it('should reject empty motif', () => {
    const result = apportCoffreSchema.safeParse({ montant: 100, deviseCode: 'EUR', motif: '' });
    expect(result.success).toBe(false);
  });
});

describe('apportProduitsSchema', () => {
  it('should accept valid products', () => {
    const result = apportProduitsSchema.safeParse({
      produits: [{ codeProduit: 'P1', libelle: 'Test', quantite: 2, prixUnitaire: 10 }],
    });
    expect(result.success).toBe(true);
  });

  it('should reject empty products array', () => {
    const result = apportProduitsSchema.safeParse({ produits: [] });
    expect(result.success).toBe(false);
  });
});

describe('remiseCoffreSchema', () => {
  it('should accept valid data', () => {
    const result = remiseCoffreSchema.safeParse({ montant: 50, deviseCode: 'USD', motif: 'Remise' });
    expect(result.success).toBe(true);
  });

  it('should reject zero montant', () => {
    const result = remiseCoffreSchema.safeParse({ montant: 0, deviseCode: 'EUR', motif: 'Test' });
    expect(result.success).toBe(false);
  });
});

describe('telecollecteSchema', () => {
  it('should accept valid terminal', () => {
    const result = telecollecteSchema.safeParse({ terminalId: 'TPE-01' });
    expect(result.success).toBe(true);
  });

  it('should reject empty terminal', () => {
    const result = telecollecteSchema.safeParse({ terminalId: '' });
    expect(result.success).toBe(false);
  });
});

describe('regularisationSchema', () => {
  it('should accept valid regularisation', () => {
    const result = regularisationSchema.safeParse({
      montantEcart: -5,
      motif: 'Ecart especes',
      typeRegularisation: 'ajustement_positif',
    });
    expect(result.success).toBe(true);
  });

  it('should reject short motif', () => {
    const result = regularisationSchema.safeParse({
      montantEcart: -5,
      motif: 'ab',
      typeRegularisation: 'ajustement_positif',
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid type', () => {
    const result = regularisationSchema.safeParse({
      montantEcart: -5,
      motif: 'Test motif',
      typeRegularisation: 'invalid',
    });
    expect(result.success).toBe(false);
  });
});
