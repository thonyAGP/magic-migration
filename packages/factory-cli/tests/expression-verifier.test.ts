/**
 * Tests for expression coverage verifier.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import fs from 'node:fs';
import { verifyExpression } from '../src/verifiers/expression-verifier.js';
import type { ExpressionTrace } from '../src/verifiers/expression-coverage-types.js';

// Mock fs
vi.mock('node:fs');

describe('Expression Verifier', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('verifyExpression', () => {
    it('should pass verification when all files exist', () => {
      const trace: ExpressionTrace = {
        exprId: 'Prg_237:Task_5:Line_12:Expr_30',
        legacyFormula: "IF({0,3}='E',Msg('Error'))",
        modernFile: 'validation.ts',
        modernLine: 42,
        testFile: 'validation.test.ts',
        testLine: 15,
        ruleId: 'RM-001',
        verified: false,
      };

      // Mock file existence
      vi.mocked(fs.existsSync).mockReturnValue(true);

      const result = verifyExpression(trace, '/output', { runTests: false });

      expect(result.verified).toBe(true);
      expect(result.failureReason).toBeUndefined();
      expect(result.lastVerified).toBeDefined();
    });

    it('should fail when modern file is missing', () => {
      const trace: ExpressionTrace = {
        exprId: 'Prg_237:Task_5:Line_12:Expr_30',
        legacyFormula: "IF({0,3}='E',Msg('Error'))",
        modernFile: 'validation.ts',
        modernLine: 42,
        testFile: 'validation.test.ts',
        testLine: 15,
        ruleId: 'RM-001',
        verified: false,
      };

      // Mock: modern file doesn't exist, test file exists
      vi.mocked(fs.existsSync).mockImplementation((path: unknown) => {
        const p = String(path);
        return !p.includes('validation.ts');
      });

      const result = verifyExpression(trace, '/output', { runTests: false });

      expect(result.verified).toBe(false);
      expect(result.failureReason).toContain('Modern file not found');
    });

    it('should fail when test file is missing', () => {
      const trace: ExpressionTrace = {
        exprId: 'Prg_237:Task_5:Line_12:Expr_30',
        legacyFormula: "IF({0,3}='E',Msg('Error'))",
        modernFile: 'validation.ts',
        modernLine: 42,
        testFile: 'validation.test.ts',
        testLine: 15,
        ruleId: 'RM-001',
        verified: false,
      };

      // Mock: modern file exists, test file doesn't
      vi.mocked(fs.existsSync).mockImplementation((path: unknown) => {
        const p = String(path);
        return !p.includes('validation.test.ts');
      });

      const result = verifyExpression(trace, '/output', { runTests: false });

      expect(result.verified).toBe(false);
      expect(result.failureReason).toContain('Test file not found');
    });

    it('should fail when no modern file mapping', () => {
      const trace: ExpressionTrace = {
        exprId: 'Prg_237:Task_5:Line_12:Expr_30',
        legacyFormula: "IF({0,3}='E',Msg('Error'))",
        modernFile: '',
        modernLine: 0,
        testFile: 'validation.test.ts',
        testLine: 15,
        ruleId: 'RM-001',
        verified: false,
      };

      const result = verifyExpression(trace, '/output', { runTests: false });

      expect(result.verified).toBe(false);
      expect(result.failureReason).toBe('No modern file mapping');
    });

    it('should fail when no test file mapping', () => {
      const trace: ExpressionTrace = {
        exprId: 'Prg_237:Task_5:Line_12:Expr_30',
        legacyFormula: "IF({0,3}='E',Msg('Error'))",
        modernFile: 'validation.ts',
        modernLine: 42,
        testFile: '',
        testLine: 0,
        ruleId: 'RM-001',
        verified: false,
      };

      // Mock: modern file exists
      vi.mocked(fs.existsSync).mockReturnValue(true);

      const result = verifyExpression(trace, '/output', { runTests: false });

      expect(result.verified).toBe(false);
      expect(result.failureReason).toBe('No test file mapping');
    });
  });
});
