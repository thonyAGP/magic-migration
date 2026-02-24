/**
 * Tests for SWARM Complexity Calculator
 */

import { describe, it, expect } from 'vitest';
import { calculateComplexity, formatComplexityReport } from '../../src/swarm/complexity-calculator.js';
import type { MigrationContract } from '../../src/core/contract.js';

describe('Complexity Calculator', () => {
  describe('calculateComplexity', () => {
    it('should calculate SIMPLE complexity for minimal program', () => {
      const contract: MigrationContract = {
        metadata: {
          version: '1.0.0',
          program_id: 1,
          program_name: 'Simple Test',
          status: 'pending',
          legacy_expressions: [
            { expr_id: 'expr1', formula: 'A+B', mapped_to: 'test.ts:10', test_file: 'test.test.ts:20', verified: true },
          ],
          tables: [{ name: 'users', fields: [] }],
        },
        business_logic: {
          objective: 'Simple operation',
          rules: { calculations: [], validations: [] },
          complexity: { nesting_depth: 1 },
        },
        modern_implementation: {
          technology_stack: { language: 'TypeScript', framework: 'React' },
          notes: '',
        },
      };

      const result = calculateComplexity(contract);

      expect(result.score).toBeLessThan(20);
      expect(result.level).toBe('SIMPLE');
      expect(result.useSwarm).toBe(false);
      expect(result.requiresDoubleVote).toBe(false);
    });

    it('should calculate MEDIUM complexity for moderate program', () => {
      const contract: MigrationContract = {
        metadata: {
          version: '1.0.0',
          program_id: 2,
          program_name: 'Medium Test',
          status: 'pending',
          legacy_expressions: Array.from({ length: 15 }, (_, i) => ({
            expr_id: `expr${i}`,
            formula: 'A+B',
            mapped_to: 'test.ts:10',
            test_file: 'test.test.ts:20',
            verified: true,
          })),
          tables: [
            { name: 'users', fields: [] },
            { name: 'orders', fields: [] },
          ],
        },
        business_logic: {
          objective: 'Moderate operation',
          rules: { calculations: [], validations: [] },
          complexity: { nesting_depth: 2 },
        },
        modern_implementation: {
          technology_stack: { language: 'TypeScript', framework: 'React' },
          notes: '',
        },
      };

      const result = calculateComplexity(contract);

      expect(result.score).toBeGreaterThanOrEqual(20);
      expect(result.score).toBeLessThan(50);
      expect(result.level).toBe('MEDIUM');
      expect(result.useSwarm).toBe(false);
    });

    it('should calculate COMPLEX complexity for large program', () => {
      const contract: MigrationContract = {
        metadata: {
          version: '1.0.0',
          program_id: 3,
          program_name: 'Complex Test',
          status: 'pending',
          legacy_expressions: Array.from({ length: 35 }, (_, i) => ({
            expr_id: `expr${i}`,
            formula: 'IF(A>0,B,C)',
            mapped_to: 'test.ts:10',
            test_file: 'test.test.ts:20',
            verified: true,
          })),
          tables: Array.from({ length: 4 }, (_, i) => ({ name: `table${i}`, fields: [] })),
        },
        business_logic: {
          objective: 'Complex operation',
          rules: {
            calculations: [{ name: 'calc1', formula: 'A*B' }],
            validations: [{ field: 'amount', rule: 'required' }],
          },
          complexity: { nesting_depth: 4 },
        },
        modern_implementation: {
          technology_stack: { language: 'TypeScript', framework: 'React' },
          notes: 'Uses Zustand state management',
        },
      };

      const result = calculateComplexity(contract);

      expect(result.score).toBeGreaterThanOrEqual(50);
      expect(result.level).toBe('COMPLEX');
      expect(result.useSwarm).toBe(true);
      expect(result.requiresDoubleVote).toBe(true); // 30+ expressions + business logic
    });

    it('should mark as CRITICAL for payment programs', () => {
      const contract: MigrationContract = {
        metadata: {
          version: '1.0.0',
          program_id: 4,
          program_name: 'Payment Processor',
          status: 'pending',
          legacy_expressions: [],
          tables: [],
        },
        business_logic: {
          objective: 'Process credit card payments securely',
          rules: { calculations: [], validations: [] },
        },
        modern_implementation: {
          technology_stack: { language: 'TypeScript', framework: 'React' },
          notes: '',
        },
      };

      const result = calculateComplexity(contract);

      expect(result.score).toBe(100);
      expect(result.level).toBe('CRITICAL');
      expect(result.useSwarm).toBe(true);
      expect(result.requiresDoubleVote).toBe(true);
      expect(result.indicators.isCritical).toBe(true);
    });

    it('should detect business logic indicators', () => {
      const contract: MigrationContract = {
        metadata: {
          version: '1.0.0',
          program_id: 5,
          program_name: 'Logic Test',
          status: 'pending',
          legacy_expressions: [
            { expr_id: 'expr1', formula: 'IF(amount>0,Calc(tax),0)', mapped_to: 'test.ts:10', test_file: 'test.test.ts:20', verified: true },
          ],
          tables: [],
        },
        business_logic: {
          objective: 'Calculate tax',
          rules: {
            calculations: [{ name: 'tax', formula: 'amount * 0.2' }],
            validations: [],
          },
        },
        modern_implementation: {
          technology_stack: { language: 'TypeScript', framework: 'React' },
          notes: '',
        },
      };

      const result = calculateComplexity(contract);

      expect(result.indicators.hasBusinessLogic).toBe(true);
    });

    it('should detect state management indicators', () => {
      const contract: MigrationContract = {
        metadata: {
          version: '1.0.0',
          program_id: 6,
          program_name: 'State Test',
          status: 'pending',
          legacy_expressions: [],
          tables: [],
        },
        business_logic: {
          objective: 'Manage state',
          rules: { calculations: [], validations: [] },
        },
        modern_implementation: {
          technology_stack: { language: 'TypeScript', framework: 'React' },
          notes: 'Uses useState hook for local state',
        },
      };

      const result = calculateComplexity(contract);

      expect(result.indicators.hasStateManagement).toBe(true);
    });

    it('should detect external integrations', () => {
      const contract: MigrationContract = {
        metadata: {
          version: '1.0.0',
          program_id: 7,
          program_name: 'API Test',
          status: 'pending',
          legacy_expressions: [],
          tables: [],
          dependencies: [
            { program_id: 100, type: 'external', name: 'Payment API' },
          ],
        },
        business_logic: {
          objective: 'Call external API',
          rules: { calculations: [], validations: [] },
        },
        modern_implementation: {
          technology_stack: { language: 'TypeScript', framework: 'React' },
          notes: 'Calls external payment API',
        },
      };

      const result = calculateComplexity(contract);

      expect(result.indicators.hasExternalIntegrations).toBe(true);
    });
  });

  describe('formatComplexityReport', () => {
    it('should format complexity report as markdown', () => {
      const complexity = {
        score: 75,
        level: 'COMPLEX' as const,
        useSwarm: true,
        requiresDoubleVote: true,
        indicators: {
          expressionCount: 40,
          tableCount: 3,
          nestingDepth: 4,
          hasBusinessLogic: true,
          hasStateManagement: true,
          isCritical: false,
          hasExternalIntegrations: true,
        },
        explanation: 'Test explanation',
      };

      const report = formatComplexityReport(complexity);

      expect(report).toContain('# Complexity Analysis');
      expect(report).toContain('**Score**: 75/100');
      expect(report).toContain('**Level**: COMPLEX');
      expect(report).toContain('**SWARM Recommended**: ✅ Yes');
      expect(report).toContain('**Double Vote Required**: ✅ Yes');
      expect(report).toContain('- Expressions: 40');
      expect(report).toContain('- Tables: 3');
      expect(report).toContain('- Nesting depth: 4');
      expect(report).toContain('- Business logic: ✅');
      expect(report).toContain('- State management: ✅');
      expect(report).toContain('- External integrations: ✅');
    });
  });
});
