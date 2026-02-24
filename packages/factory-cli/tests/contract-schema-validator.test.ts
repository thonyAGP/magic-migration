/**
 * Tests for contract schema validator.
 */

import { describe, it, expect } from 'vitest';
import {
  validateExpressionId,
  validateFileReference,
  validateLocation,
  validateLegacyExpression,
  validateEnrichedRule,
  type LegacyExpression,
  type EnrichedContractRule,
} from '../src/verifiers/contract-schema-validator.js';

describe('Contract Schema Validator', () => {
  describe('validateExpressionId', () => {
    it('should pass for valid expression ID', () => {
      const result = validateExpressionId('Prg_48:Task_2:Line_5:Expr_10');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail for invalid format', () => {
      const result = validateExpressionId('InvalidFormat');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should warn for template placeholders', () => {
      const result = validateExpressionId('Prg_XXX:Task_YYY:Line_ZZZ:Expr_NNN');
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain('template placeholders');
    });
  });

  describe('validateFileReference', () => {
    it('should pass for valid file reference', () => {
      const result = validateFileReference('src/validation.ts:42', 'mapped_to');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail for missing line number', () => {
      const result = validateFileReference('src/validation.ts', 'mapped_to');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should warn for line number 0', () => {
      const result = validateFileReference('src/validation.ts:0', 'mapped_to');
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain('line number 0');
    });

    it('should warn for empty reference', () => {
      const result = validateFileReference('', 'test_file');
      expect(result.valid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('validateLocation', () => {
    it('should warn for location with zeros', () => {
      const location = {
        program_id: 0,
        task_id: 0,
        line_id: 0,
        expr_id: 0,
      };
      const result = validateLocation(location);
      expect(result.warnings.length).toBe(4);
    });

    it('should pass for valid location', () => {
      const location = {
        program_id: 48,
        task_id: 2,
        line_id: 5,
        expr_id: 10,
      };
      const result = validateLocation(location);
      expect(result.valid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });
  });

  describe('validateLegacyExpression', () => {
    it('should pass for valid legacy expression', () => {
      const expr: LegacyExpression = {
        expr_id: 'Prg_48:Task_2:Line_5:Expr_10',
        formula: "IF({0,3}='E',Msg('Error'))",
        location: {
          program_id: 48,
          task_id: 2,
          line_id: 5,
          expr_id: 10,
        },
        mapped_to: 'src/validation.ts:42',
        test_file: 'tests/validation.test.ts:15',
        verified: true,
      };

      const result = validateLegacyExpression(expr, 'RM-001');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail for empty formula', () => {
      const expr: LegacyExpression = {
        expr_id: 'Prg_48:Task_2:Line_5:Expr_10',
        formula: '',
        location: {
          program_id: 48,
          task_id: 2,
          line_id: 5,
          expr_id: 10,
        },
        verified: false,
      };

      const result = validateLegacyExpression(expr, 'RM-001');
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('formula is empty'))).toBe(true);
    });

    it('should warn for verified without test file', () => {
      const expr: LegacyExpression = {
        expr_id: 'Prg_48:Task_2:Line_5:Expr_10',
        formula: "IF({0,3}='E',Msg('Error'))",
        location: {
          program_id: 48,
          task_id: 2,
          line_id: 5,
          expr_id: 10,
        },
        verified: true,
      };

      const result = validateLegacyExpression(expr, 'RM-001');
      expect(result.warnings.some(w => w.includes('marked as verified but no test_file'))).toBe(true);
    });
  });

  describe('validateEnrichedRule', () => {
    it('should pass for valid enriched rule', () => {
      const rule: EnrichedContractRule = {
        id: 'RM-001',
        description: 'Test rule',
        condition: "P. O/T/F [A]='O'",
        variables: ['EN'],
        status: 'IMPL',
        target_file: 'src/test.ts',
        gap_notes: '',
        legacy_expressions: [
          {
            expr_id: 'Prg_48:Task_2:Line_5:Expr_10',
            formula: "IF({0,3}='E',Msg('Error'))",
            location: {
              program_id: 48,
              task_id: 2,
              line_id: 5,
              expr_id: 10,
            },
            mapped_to: 'src/validation.ts:42',
            test_file: 'tests/validation.test.ts:15',
            verified: true,
          },
        ],
      };

      const result = validateEnrichedRule(rule);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should warn for rule without legacy expressions', () => {
      const rule: EnrichedContractRule = {
        id: 'RM-001',
        description: 'Test rule',
        condition: "P. O/T/F [A]='O'",
        variables: ['EN'],
        status: 'IMPL',
        target_file: 'src/test.ts',
        gap_notes: '',
      };

      const result = validateEnrichedRule(rule);
      expect(result.warnings.some(w => w.includes('no legacy_expressions'))).toBe(true);
    });
  });
});
