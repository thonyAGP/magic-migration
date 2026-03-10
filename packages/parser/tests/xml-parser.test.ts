import { describe, it, expect } from 'vitest';
import { toArray, isDisabled } from '../src/xml-parser.js';

describe('XML Parser Utilities', () => {
  describe('toArray', () => {
    it('should return empty array for undefined', () => {
      expect(toArray(undefined)).toEqual([]);
    });

    it('should return array as-is', () => {
      expect(toArray([1, 2, 3])).toEqual([1, 2, 3]);
    });

    it('should wrap single item in array', () => {
      expect(toArray(5)).toEqual([5]);
    });

    it('should wrap object in array', () => {
      const obj = { id: 1, name: 'test' };
      expect(toArray(obj)).toEqual([obj]);
    });
  });

  describe('isDisabled', () => {
    it('should return true when Disabled=1', () => {
      expect(isDisabled({ '@_Disabled': '1' })).toBe(true);
    });

    it('should return false when Disabled=0', () => {
      expect(isDisabled({ '@_Disabled': '0' })).toBe(false);
    });

    it('should return false when Disabled not set', () => {
      expect(isDisabled({})).toBe(false);
    });
  });
});
