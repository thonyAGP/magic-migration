import { describe, it, expect } from 'vitest';
import { buildXfitCodegenModel } from '../src/generators/codegen/xfit-codegen-builder.js';
import type { BusinessRulesResult } from '@magic-migration/data-model';
import type { Table } from '@magic-migration/data-model';

// ─── Fixtures ────────────────────────────────────────────────────────────────

const makeRules = (overrides: Partial<BusinessRulesResult> = {}): BusinessRulesResult => ({
  programId: 69,
  programName: 'EXTRAIT_COMPTE',
  generatedAt: '2026-01-01T00:00:00.000Z',
  rules: [],
  summary: {
    total: 0,
    byType: { validation: 0, calculation: 0, navigation: 0, 'data-read': 0, 'data-write': 0 },
    tablesRead: [],
    tablesWritten: [],
    calleesReferenced: [],
  },
  ...overrides,
});

const makeTable = (id: number, name: string, cols: Array<{ name: string; type: string }>): Table => ({
  id,
  name,
  confidence: 0.95,
  columns: cols.map((c, i) => ({
    id: i + 1,
    name: c.name,
    type: c.type,
    nullable: true,
    isPrimaryKey: false,
    isForeignKey: false,
  })),
});

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('buildXfitCodegenModel', () => {
  it('should derive domain and domainPascal from program name', () => {
    const model = buildXfitCodegenModel({
      rulesResult: makeRules(),
      kbTables: [],
      programTables: [],
    });
    expect(model.domain).toBe('extraitCompte');
    expect(model.domainPascal).toBe('ExtraitCompte');
    expect(model.programId).toBe(69);
    expect(model.programName).toBe('EXTRAIT_COMPTE');
  });

  it('should handle simple program names without prefix', () => {
    const model = buildXfitCodegenModel({
      rulesResult: makeRules({ programName: 'GESTION_CAISSE' }),
      kbTables: [],
      programTables: [],
    });
    expect(model.domain).toBe('gestionCaisse');
    expect(model.domainPascal).toBe('GestionCaisse');
  });

  describe('entities from tables', () => {
    it('should build entity from programTable columns', () => {
      const table = makeTable(40, 'comptable', [
        { name: 'cte_compte_gm', type: 'NUMERIC' },
        { name: 'cte_montant', type: 'NUMERIC' },
        { name: 'cte_libelle', type: 'ALPHA' },
      ]);
      const model = buildXfitCodegenModel({
        rulesResult: makeRules(),
        kbTables: [],
        programTables: [table],
      });
      expect(model.entities).toHaveLength(1);
      const entity = model.entities[0];
      expect(entity.interfaceName).toBe('Comptable');
      expect(entity.fields).toHaveLength(3);
      expect(entity.fields[0].name).toBe('cteCompteGm');
      expect(entity.fields[0].type).toBe('number');
      expect(entity.fields[1].name).toBe('cteMontant');
      expect(entity.fields[2].name).toBe('cteLibelle');
      expect(entity.fields[2].type).toBe('string');
    });

    it('should prefer KB table when it has more columns', () => {
      const irTable = makeTable(31, 'gm_complet', [
        { name: 'gmc_compte', type: 'NUMERIC' },
      ]);
      const kbTable = makeTable(31, 'gm_complet', [
        { name: 'gmc_compte', type: 'NUMERIC' },
        { name: 'gmc_nom', type: 'ALPHA' },
        { name: 'gmc_prenom', type: 'ALPHA' },
        { name: 'gmc_date_naissance', type: 'DATE' },
      ]);
      const model = buildXfitCodegenModel({
        rulesResult: makeRules(),
        kbTables: [kbTable],
        programTables: [irTable],
      });
      // KB has 4 cols vs IR's 1 → should prefer KB
      expect(model.entities[0].fields).toHaveLength(4);
    });

    it('should use programTable when KB has fewer columns', () => {
      const irTable = makeTable(40, 'comptable', [
        { name: 'cte_id', type: 'NUMERIC' },
        { name: 'cte_montant', type: 'NUMERIC' },
        { name: 'cte_libelle', type: 'ALPHA' },
      ]);
      const kbTable = makeTable(40, 'comptable', [
        { name: 'cte_id', type: 'NUMERIC' },
      ]);
      const model = buildXfitCodegenModel({
        rulesResult: makeRules(),
        kbTables: [kbTable],
        programTables: [irTable],
      });
      expect(model.entities[0].fields).toHaveLength(3);
    });

    it('should map all MagicTypes to TypeScript', () => {
      const table = makeTable(1, 'test_table', [
        { name: 'col_alpha', type: 'ALPHA' },
        { name: 'col_numeric', type: 'NUMERIC' },
        { name: 'col_date', type: 'DATE' },
        { name: 'col_time', type: 'TIME' },
        { name: 'col_logical', type: 'LOGICAL' },
        { name: 'col_blob', type: 'BLOB' },
        { name: 'col_memo', type: 'MEMO' },
      ]);
      const model = buildXfitCodegenModel({ rulesResult: makeRules(), kbTables: [], programTables: [table] });
      const fields = model.entities[0].fields;
      expect(fields[0].type).toBe('string');   // ALPHA
      expect(fields[1].type).toBe('number');   // NUMERIC
      expect(fields[2].type).toBe('Date');     // DATE
      expect(fields[3].type).toBe('string');   // TIME
      expect(fields[4].type).toBe('boolean');  // LOGICAL
      expect(fields[5].type).toBe('Blob | null'); // BLOB
      expect(fields[6].type).toBe('string');   // MEMO
    });
  });

  describe('actions from logic rules', () => {
    it('should build actions from validation rules', () => {
      const rules = makeRules({
        rules: [
          {
            id: 'RM-001',
            type: 'validation',
            description: 'Condition [RECORD_PREFIX]: A=1',
            source: 'Task 69.1 > Handler RECORD_PREFIX > line 3',
            expression: 'A=1',
            variables: ['A'],
            tables: [],
            event: 'RECORD_PREFIX',
          },
        ],
        summary: {
          total: 1,
          byType: { validation: 1, calculation: 0, navigation: 0, 'data-read': 0, 'data-write': 0 },
          tablesRead: [],
          tablesWritten: [],
          calleesReferenced: [],
        },
      });
      const model = buildXfitCodegenModel({ rulesResult: rules, kbTables: [], programTables: [] });
      expect(model.actions).toHaveLength(1);
      expect(model.actions[0].id).toBe('RM-001');
      expect(model.actions[0].condition).toBe('A=1');
      expect(model.actions[0].description).toContain('RECORD_PREFIX');
      expect(model.actions[0].variables).toContain('A');
    });

    it('should build actions from calculation rules', () => {
      const rules = makeRules({
        rules: [{
          id: 'RM-002',
          type: 'calculation',
          description: 'Calculation [RECORD_SUFFIX]: K = A + B',
          source: 'Task 69.2 > Handler RECORD_SUFFIX > line 1',
          expression: 'K = A + B',
          variables: ['K', 'A', 'B'],
          tables: [],
          event: 'RECORD_SUFFIX',
        }],
        summary: { total: 1, byType: { validation: 0, calculation: 1, navigation: 0, 'data-read': 0, 'data-write': 0 }, tablesRead: [], tablesWritten: [], calleesReferenced: [] },
      });
      const model = buildXfitCodegenModel({ rulesResult: rules, kbTables: [], programTables: [] });
      expect(model.actions).toHaveLength(1);
      expect(model.actions[0].id).toBe('RM-002');
    });

    it('should NOT create actions from navigation/data rules', () => {
      const rules = makeRules({
        rules: [
          { id: 'RM-001', type: 'navigation', description: 'Call IDE 236', source: 'T1', callTarget: 236, variables: [], tables: [] },
          { id: 'RM-002', type: 'data-read', description: 'Read comptable', source: 'DV1', variables: [], tables: ['comptable'] },
        ],
        summary: { total: 2, byType: { validation: 0, calculation: 0, navigation: 1, 'data-read': 1, 'data-write': 0 }, tablesRead: ['comptable'], tablesWritten: [], calleesReferenced: [236] },
      });
      const model = buildXfitCodegenModel({ rulesResult: rules, kbTables: [], programTables: [] });
      expect(model.actions).toHaveLength(0);
    });
  });

  describe('apiCalls from navigation rules', () => {
    it('should build API calls from navigation rules', () => {
      const rules = makeRules({
        rules: [
          { id: 'RM-001', type: 'navigation', description: 'Call IDE 236', source: 'T1', callTarget: 236, variables: [], tables: [] },
        ],
        summary: { total: 1, byType: { validation: 0, calculation: 0, navigation: 1, 'data-read': 0, 'data-write': 0 }, tablesRead: [], tablesWritten: [], calleesReferenced: [236] },
      });
      const model = buildXfitCodegenModel({ rulesResult: rules, kbTables: [], programTables: [] });
      expect(model.apiCalls).toHaveLength(1);
      expect(model.apiCalls[0].calleeId).toBe(236);
      expect(model.apiCalls[0].path).toContain('236');
      expect(model.apiCalls[0].method).toBe('POST');
    });

    it('should deduplicate same callTarget', () => {
      const rules = makeRules({
        rules: [
          { id: 'RM-001', type: 'navigation', description: 'Call IDE 236 A', source: 'T1', callTarget: 236, variables: [], tables: [] },
          { id: 'RM-002', type: 'navigation', description: 'Call IDE 236 B', source: 'T2', callTarget: 236, variables: [], tables: [] },
        ],
        summary: { total: 2, byType: { validation: 0, calculation: 0, navigation: 2, 'data-read': 0, 'data-write': 0 }, tablesRead: [], tablesWritten: [], calleesReferenced: [236] },
      });
      const model = buildXfitCodegenModel({ rulesResult: rules, kbTables: [], programTables: [] });
      expect(model.apiCalls).toHaveLength(1);
    });
  });

  describe('stateFields from tables', () => {
    it('should build list + selected state fields for read tables', () => {
      const table = makeTable(40, 'comptable', [{ name: 'cte_id', type: 'NUMERIC' }]);
      const rules = makeRules({
        summary: { total: 0, byType: { validation: 0, calculation: 0, navigation: 0, 'data-read': 1, 'data-write': 0 }, tablesRead: ['comptable'], tablesWritten: [], calleesReferenced: [] },
      });
      const model = buildXfitCodegenModel({ rulesResult: rules, kbTables: [], programTables: [table] });
      const names = model.stateFields.map(f => f.name);
      expect(names).toContain('comptableList');
      expect(names).toContain('selectedComptable');
    });

    it('should return empty stateFields when no tables read', () => {
      const model = buildXfitCodegenModel({ rulesResult: makeRules(), kbTables: [], programTables: [] });
      expect(model.stateFields).toHaveLength(0);
    });
  });
});
