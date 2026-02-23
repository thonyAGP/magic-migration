import { describe, it, expect } from 'vitest';
import { denominationCountSchema, countingSubmitSchema } from '../schemas';

describe('denominationCountSchema', () => {
  it('should validate a correct count entry', () => {
    const result = denominationCountSchema.safeParse({
      denominationId: 1,
      quantite: 5,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ denominationId: 1, quantite: 5 });
    }
  });

  it('should accept zero quantite', () => {
    const result = denominationCountSchema.safeParse({
      denominationId: 1,
      quantite: 0,
    });

    expect(result.success).toBe(true);
  });

  it('should reject negative quantite', () => {
    const result = denominationCountSchema.safeParse({
      denominationId: 1,
      quantite: -3,
    });

    expect(result.success).toBe(false);
  });

  it('should reject non-integer denominationId', () => {
    const result = denominationCountSchema.safeParse({
      denominationId: 1.5,
      quantite: 2,
    });

    expect(result.success).toBe(false);
  });

  it('should reject zero denominationId', () => {
    const result = denominationCountSchema.safeParse({
      denominationId: 0,
      quantite: 2,
    });

    expect(result.success).toBe(false);
  });

  it('should reject negative denominationId', () => {
    const result = denominationCountSchema.safeParse({
      denominationId: -1,
      quantite: 2,
    });

    expect(result.success).toBe(false);
  });

  it('should reject non-integer quantite', () => {
    const result = denominationCountSchema.safeParse({
      denominationId: 1,
      quantite: 2.7,
    });

    expect(result.success).toBe(false);
  });
});

describe('countingSubmitSchema', () => {
  it('should validate a correct submit payload', () => {
    const result = countingSubmitSchema.safeParse({
      sessionId: 42,
      type: 'ouverture',
      counts: [{ denominationId: 1, quantite: 5 }],
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.sessionId).toBe(42);
      expect(result.data.type).toBe('ouverture');
      expect(result.data.counts).toHaveLength(1);
    }
  });

  it('should validate with type fermeture', () => {
    const result = countingSubmitSchema.safeParse({
      sessionId: 1,
      type: 'fermeture',
      counts: [{ denominationId: 1, quantite: 0 }],
    });

    expect(result.success).toBe(true);
  });

  it('should validate with multiple counts', () => {
    const result = countingSubmitSchema.safeParse({
      sessionId: 1,
      type: 'ouverture',
      counts: [
        { denominationId: 1, quantite: 5 },
        { denominationId: 2, quantite: 10 },
        { denominationId: 3, quantite: 20 },
      ],
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.counts).toHaveLength(3);
    }
  });

  it('should reject empty counts array', () => {
    const result = countingSubmitSchema.safeParse({
      sessionId: 1,
      type: 'ouverture',
      counts: [],
    });

    expect(result.success).toBe(false);
  });

  it('should reject invalid type', () => {
    const result = countingSubmitSchema.safeParse({
      sessionId: 1,
      type: 'comptage',
      counts: [{ denominationId: 1, quantite: 5 }],
    });

    expect(result.success).toBe(false);
  });

  it('should reject non-positive sessionId', () => {
    const result = countingSubmitSchema.safeParse({
      sessionId: 0,
      type: 'ouverture',
      counts: [{ denominationId: 1, quantite: 5 }],
    });

    expect(result.success).toBe(false);
  });

  it('should reject when counts contain invalid entries', () => {
    const result = countingSubmitSchema.safeParse({
      sessionId: 1,
      type: 'ouverture',
      counts: [{ denominationId: -1, quantite: 5 }],
    });

    expect(result.success).toBe(false);
  });
});
