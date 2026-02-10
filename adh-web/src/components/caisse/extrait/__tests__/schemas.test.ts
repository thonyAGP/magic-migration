// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { searchAccountSchema, printExtraitSchema } from '../schemas';

describe('searchAccountSchema', () => {
  it('should accept valid query', () => {
    const result = searchAccountSchema.safeParse({ query: 'Dupont' });
    expect(result.success).toBe(true);
  });

  it('should reject empty query', () => {
    const result = searchAccountSchema.safeParse({ query: '' });
    expect(result.success).toBe(false);
  });

  it('should reject query over 100 chars', () => {
    const result = searchAccountSchema.safeParse({ query: 'a'.repeat(101) });
    expect(result.success).toBe(false);
  });

  it('should accept single character query', () => {
    const result = searchAccountSchema.safeParse({ query: 'D' });
    expect(result.success).toBe(true);
  });
});

describe('printExtraitSchema', () => {
  it('should accept valid format "cumule"', () => {
    const result = printExtraitSchema.safeParse({ format: 'cumule' });
    expect(result.success).toBe(true);
  });

  it('should accept valid format "date"', () => {
    const result = printExtraitSchema.safeParse({ format: 'date' });
    expect(result.success).toBe(true);
  });

  it('should accept valid format "imputation"', () => {
    const result = printExtraitSchema.safeParse({ format: 'imputation' });
    expect(result.success).toBe(true);
  });

  it('should accept valid format "nom"', () => {
    const result = printExtraitSchema.safeParse({ format: 'nom' });
    expect(result.success).toBe(true);
  });

  it('should accept valid format "date_imp"', () => {
    const result = printExtraitSchema.safeParse({ format: 'date_imp' });
    expect(result.success).toBe(true);
  });

  it('should accept valid format "service"', () => {
    const result = printExtraitSchema.safeParse({ format: 'service' });
    expect(result.success).toBe(true);
  });

  it('should reject invalid format', () => {
    const result = printExtraitSchema.safeParse({ format: 'invalid' });
    expect(result.success).toBe(false);
  });

  it('should accept optional dates', () => {
    const result = printExtraitSchema.safeParse({
      format: 'cumule',
      dateDebut: '2026-01-01',
      dateFin: '2026-01-31',
    });
    expect(result.success).toBe(true);
  });
});
