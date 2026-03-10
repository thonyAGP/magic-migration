import { describe, it, expect } from 'vitest';
import { extractBusinessRules } from '../src/business-rules-extractor.js';
import type { ProgramIR } from '@magic-migration/parser';

// ─── Fixtures ────────────────────────────────────────────────────────────────

const makeIR = (overrides: Partial<ProgramIR> = {}): ProgramIR => ({
  id: 69,
  name: 'EXTRAIT_COMPTE',
  tasks: [],
  variables: { local: [], global: [] },
  dataViews: [],
  expressions: [],
  callGraph: { callers: [], callees: [], depth: 0 },
  metadata: { complexity: 'LOW', orphan: false, estimatedLOC: 0, taskCount: 0, variableCount: 0 },
  ...overrides,
});

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('extractBusinessRules', () => {
  it('should return empty rules for empty IR', () => {
    const result = extractBusinessRules(makeIR());
    expect(result.programId).toBe(69);
    expect(result.programName).toBe('EXTRAIT_COMPTE');
    expect(result.rules).toHaveLength(0);
    expect(result.summary.total).toBe(0);
  });

  it('should generate sequential RM-001, RM-002 IDs', () => {
    const ir = makeIR({
      dataViews: [
        {
          id: 1, tableId: 40, tableName: 'comptable',
          columns: [
            { id: 1, columnId: 10, columnName: 'cte_compte_gm', direction: 'INPUT' },
            { id: 2, columnId: 11, columnName: 'cte_montant', direction: 'OUTPUT' },
          ],
        },
      ],
    });
    const result = extractBusinessRules(ir);
    expect(result.rules[0].id).toBe('RM-001');
    expect(result.rules[1].id).toBe('RM-002');
  });

  describe('data-read rules from DataViews', () => {
    it('should extract data-read rule for INPUT columns', () => {
      const ir = makeIR({
        dataViews: [{
          id: 1, tableId: 31, tableName: 'gm_complet',
          columns: [
            { id: 1, columnId: 1, columnName: 'gmc_compte', direction: 'INPUT' },
            { id: 2, columnId: 2, columnName: 'gmc_nom', direction: 'INPUT' },
          ],
        }],
      });
      const result = extractBusinessRules(ir);
      const readRule = result.rules.find(r => r.type === 'data-read');
      expect(readRule).toBeDefined();
      expect(readRule!.tables).toContain('gm_complet');
      expect(readRule!.description).toContain('Read gm_complet');
      expect(readRule!.description).toContain('2 columns');
    });

    it('should extract data-write rule for OUTPUT columns', () => {
      const ir = makeIR({
        dataViews: [{
          id: 1, tableId: 40, tableName: 'comptable',
          columns: [
            { id: 1, columnId: 5, columnName: 'cte_montant', direction: 'OUTPUT' },
          ],
        }],
      });
      const result = extractBusinessRules(ir);
      const writeRule = result.rules.find(r => r.type === 'data-write' && r.source === 'DataView 1');
      expect(writeRule).toBeDefined();
      expect(writeRule!.tables).toContain('comptable');
    });

    it('should extract both read and write for BOTH columns', () => {
      const ir = makeIR({
        dataViews: [{
          id: 1, tableId: 40, tableName: 'comptable',
          columns: [
            { id: 1, columnId: 5, columnName: 'cte_montant', direction: 'BOTH' },
          ],
        }],
      });
      const result = extractBusinessRules(ir);
      const readRules = result.rules.filter(r => r.type === 'data-read');
      const writeRules = result.rules.filter(r => r.type === 'data-write');
      expect(readRules.length).toBeGreaterThan(0);
      expect(writeRules.length).toBeGreaterThan(0);
    });

    it('should not generate rules for tables with no columns', () => {
      const ir = makeIR({
        dataViews: [{ id: 1, tableId: 99, tableName: 'empty_table', columns: [] }],
      });
      const result = extractBusinessRules(ir);
      expect(result.rules).toHaveLength(0);
    });
  });

  describe('validation rules from CONDITION logic lines', () => {
    it('should extract validation rule from CONDITION line', () => {
      const ir = makeIR({
        tasks: [{
          id: 1, taskId: '1', level: 0, parentId: undefined, children: [],
          disabled: false,
          metadata: { lineCount: 1, complexity: 'LOW' },
          logic: [],
          handlers: [{
            id: 1, event: 'RECORD_PREFIX', disabled: false,
            lines: [{
              id: 1, lineNumber: 3, type: 'CONDITION',
              expression: 'A=1 AND VG38="FR"',
              disabled: false, rawXml: '',
            }],
          }],
        }],
      });
      const result = extractBusinessRules(ir);
      const rule = result.rules.find(r => r.type === 'validation');
      expect(rule).toBeDefined();
      expect(rule!.expression).toBe('A=1 AND VG38="FR"');
      expect(rule!.event).toBe('RECORD_PREFIX');
      expect(rule!.source).toContain('line 3');
      expect(rule!.description).toContain('Condition');
    });

    it('should extract variable letters from expression', () => {
      const ir = makeIR({
        tasks: [{
          id: 1, taskId: '1', level: 0, children: [], disabled: false,
          logic: [],
          metadata: { lineCount: 1, complexity: 'LOW' },
          handlers: [{
            id: 1, event: 'VERIFY', disabled: false,
            lines: [{
              id: 1, lineNumber: 1, type: 'CONDITION',
              expression: 'K=1 AND B>0',
              disabled: false, rawXml: '',
            }],
          }],
        }],
      });
      const result = extractBusinessRules(ir);
      const rule = result.rules.find(r => r.type === 'validation');
      expect(rule!.variables).toContain('K');
      expect(rule!.variables).toContain('B');
    });

    it('should skip disabled handlers', () => {
      const ir = makeIR({
        tasks: [{
          id: 1, taskId: '1', level: 0, children: [], disabled: false,
          logic: [],
          metadata: { lineCount: 0, complexity: 'LOW' },
          handlers: [{
            id: 1, event: 'RECORD_PREFIX', disabled: true,
            lines: [{
              id: 1, lineNumber: 1, type: 'CONDITION',
              expression: 'A=1', disabled: false, rawXml: '',
            }],
          }],
        }],
      });
      const result = extractBusinessRules(ir);
      expect(result.rules.filter(r => r.type === 'validation')).toHaveLength(0);
    });

    it('should skip disabled tasks', () => {
      const ir = makeIR({
        tasks: [{
          id: 1, taskId: '1', level: 0, children: [], disabled: true,
          logic: [],
          metadata: { lineCount: 0, complexity: 'LOW' },
          handlers: [{
            id: 1, event: 'RECORD_PREFIX', disabled: false,
            lines: [{ id: 1, lineNumber: 1, type: 'CONDITION', expression: 'A=1', disabled: false, rawXml: '' }],
          }],
        }],
      });
      const result = extractBusinessRules(ir);
      expect(result.rules).toHaveLength(0);
    });
  });

  describe('calculation rules from ASSIGNMENT logic lines', () => {
    it('should extract calculation rule from ASSIGNMENT line', () => {
      const ir = makeIR({
        tasks: [{
          id: 1, taskId: '1', level: 0, children: [], disabled: false,
          logic: [],
          metadata: { lineCount: 1, complexity: 'LOW' },
          handlers: [{
            id: 1, event: 'RECORD_SUFFIX', disabled: false,
            lines: [{
              id: 1, lineNumber: 5, type: 'ASSIGNMENT',
              expression: 'K = A + B',
              disabled: false, rawXml: '',
            }],
          }],
        }],
      });
      const result = extractBusinessRules(ir);
      const rule = result.rules.find(r => r.type === 'calculation');
      expect(rule).toBeDefined();
      expect(rule!.expression).toBe('K = A + B');
      expect(rule!.event).toBe('RECORD_SUFFIX');
    });
  });

  describe('navigation rules from CALL logic lines', () => {
    it('should extract navigation rule from CALL line', () => {
      const ir = makeIR({
        tasks: [{
          id: 1, taskId: '1', level: 0, children: [], disabled: false,
          logic: [],
          metadata: { lineCount: 1, complexity: 'LOW' },
          handlers: [{
            id: 1, event: 'CLICK', disabled: false,
            lines: [{
              id: 1, lineNumber: 2, type: 'CALL',
              callTarget: 236,
              disabled: false, rawXml: '',
            }],
          }],
        }],
      });
      const result = extractBusinessRules(ir);
      const rule = result.rules.find(r => r.type === 'navigation');
      expect(rule).toBeDefined();
      expect(rule!.callTarget).toBe(236);
      expect(rule!.description).toContain('IDE 236');
      expect(rule!.description).toContain('CLICK');
    });
  });

  describe('summary', () => {
    it('should correctly count rules by type', () => {
      const ir = makeIR({
        dataViews: [{
          id: 1, tableId: 31, tableName: 'gm',
          columns: [{ id: 1, columnId: 1, columnName: 'col', direction: 'INPUT' }],
        }],
        tasks: [{
          id: 1, taskId: '1', level: 0, children: [], disabled: false,
          logic: [],
          metadata: { lineCount: 2, complexity: 'LOW' },
          handlers: [{
            id: 1, event: 'RECORD_PREFIX', disabled: false,
            lines: [
              { id: 1, lineNumber: 1, type: 'CONDITION', expression: 'A=1', disabled: false, rawXml: '' },
              { id: 2, lineNumber: 2, type: 'CALL', callTarget: 236, disabled: false, rawXml: '' },
            ],
          }],
        }],
      });
      const result = extractBusinessRules(ir);
      expect(result.summary.byType.validation).toBe(1);
      expect(result.summary.byType.navigation).toBe(1);
      expect(result.summary.byType['data-read']).toBe(1);
      expect(result.summary.tablesRead).toContain('gm');
      expect(result.summary.calleesReferenced).toContain(236);
    });

    it('should include generatedAt timestamp', () => {
      const result = extractBusinessRules(makeIR());
      expect(result.generatedAt).toBeTruthy();
      expect(new Date(result.generatedAt).getFullYear()).toBe(new Date().getFullYear());
    });
  });

  describe('source paths', () => {
    it('should include program ID and task ID in source', () => {
      const ir = makeIR({
        id: 69,
        tasks: [{
          id: 1, taskId: '3', level: 0, children: [], disabled: false,
          logic: [],
          metadata: { lineCount: 1, complexity: 'LOW' },
          handlers: [{
            id: 1, event: 'RECORD_PREFIX', disabled: false,
            lines: [{ id: 1, lineNumber: 7, type: 'CONDITION', expression: 'A>0', disabled: false, rawXml: '' }],
          }],
        }],
      });
      const result = extractBusinessRules(ir);
      const rule = result.rules.find(r => r.type === 'validation');
      expect(rule!.source).toContain('69');
      expect(rule!.source).toContain('3');
      expect(rule!.source).toContain('7');
    });
  });
});
