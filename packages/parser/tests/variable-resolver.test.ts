import { describe, it, expect } from 'vitest';
import { fieldToLetter, letterToField, resolveVariableName } from '../src/variable-resolver.js';

describe('Variable Resolver', () => {
  describe('fieldToLetter', () => {
    it('should convert Field1 to A', () => {
      expect(fieldToLetter(1)).toBe('A');
    });

    it('should convert Field26 to Z', () => {
      expect(fieldToLetter(26)).toBe('Z');
    });

    it('should convert Field27 to AA', () => {
      expect(fieldToLetter(27)).toBe('AA');
    });

    it('should convert Field33 to AG', () => {
      expect(fieldToLetter(33)).toBe('AG');
    });

    it('should convert Field213 to HE', () => {
      expect(fieldToLetter(213)).toBe('HE');
    });
  });

  describe('letterToField', () => {
    it('should convert A to Field1', () => {
      expect(letterToField('A')).toBe(1);
    });

    it('should convert Z to Field26', () => {
      expect(letterToField('Z')).toBe(26);
    });

    it('should convert AA to Field27', () => {
      expect(letterToField('AA')).toBe(27);
    });

    it('should convert HE to Field213', () => {
      expect(letterToField('HE')).toBe(213);
    });
  });

  describe('resolveVariableName', () => {
    it('should resolve Field213 to HE', () => {
      expect(resolveVariableName('Field213')).toBe('HE');
    });

    it('should keep VG38 as VG38', () => {
      expect(resolveVariableName('VG38')).toBe('VG38');
    });
  });
});
