import { describe, it, expect } from 'vitest';
import { buildCodegenModel } from '../src/generators/codegen/codegen-model.js';
import { generateTypes } from '../src/generators/codegen/type-generator.js';
import { generateStore } from '../src/generators/codegen/store-generator.js';
import { generatePage } from '../src/generators/codegen/page-generator.js';
import { generateApi } from '../src/generators/codegen/api-generator.js';
import { generateTests } from '../src/generators/codegen/test-generator.js';
import type { MigrationContract } from '../src/core/types.js';

const makeContract = (): MigrationContract => ({
  program: {
    id: 237, name: 'Vente_GiftPass', complexity: 'LOW',
    callers: [166], callees: [229], tasksCount: 3, tablesCount: 2, expressionsCount: 10,
  },
  rules: [
    { id: 'RM-001', description: 'Calculer montant vente', condition: 'IF quantite > 0', variables: ['D'], status: 'IMPL', targetFile: '', gapNotes: '' },
    { id: 'RM-002', description: 'Appliquer remise membre', condition: '', variables: ['E'], status: 'MISSING', targetFile: '', gapNotes: '' },
  ],
  variables: [
    { localId: 'D', name: 'montant', type: 'Virtual', status: 'IMPL', targetFile: '', gapNotes: '' },
    { localId: 'E', name: 'compteId', type: 'Parameter', status: 'IMPL', targetFile: '', gapNotes: '' },
  ],
  tables: [
    { id: 300, name: 'cc_ventes', mode: 'RW', status: 'IMPL', targetFile: '', gapNotes: '' },
  ],
  callees: [
    { id: 229, name: 'PRINT_TICKET', calls: 1, context: 'write ticket', status: 'IMPL', target: '', gapNotes: '' },
  ],
  overall: {
    rulesTotal: 2, rulesImpl: 1, rulesPartial: 0, rulesMissing: 1, rulesNa: 0,
    variablesKeyCount: 2, calleesTotal: 1, calleesImpl: 1, calleesMissing: 0,
    coveragePct: 80, status: 'enriched', generated: '', notes: '',
  },
});

describe('generateTypes', () => {
  it('should produce interfaces for entities', () => {
    const model = buildCodegenModel(makeContract());
    const output = generateTypes(model);
    expect(output).toContain('export interface CcVentes');
    expect(output).toContain('id: string | number');
  });

  it('should produce state interface', () => {
    const model = buildCodegenModel(makeContract());
    const output = generateTypes(model);
    expect(output).toContain('export interface VenteGiftPassState');
    expect(output).toContain('isLoading: boolean');
    expect(output).toContain('error: string | null');
    expect(output).toContain('montant:');
    expect(output).toContain('cc_ventesList:');
  });

  it('should use type for action unions', () => {
    const model = buildCodegenModel(makeContract());
    const output = generateTypes(model);
    expect(output).toContain("export type VenteGiftPassAction =");
    expect(output).toContain("| 'RM-001'");
    expect(output).toContain("| 'RM-002'");
  });
});

describe('generateStore', () => {
  it('should follow Zustand create pattern', () => {
    const model = buildCodegenModel(makeContract());
    const output = generateStore(model);
    expect(output).toContain("import { create } from 'zustand'");
    expect(output).toContain('create<VenteGiftPassStore>()((set, get) => ({');
    expect(output).toContain('useVenteGiftPassStore');
  });

  it('should include TODO for each rule', () => {
    const model = buildCodegenModel(makeContract());
    const output = generateStore(model);
    expect(output).toContain('// TODO: RM-001 - Calculer montant vente');
    expect(output).toContain('// TODO: RM-002 - Appliquer remise membre');
  });

  it('should import from @/types and @/services', () => {
    const model = buildCodegenModel(makeContract());
    const output = generateStore(model);
    expect(output).toContain("from '@/types/venteGiftPass'");
    expect(output).toContain("from '@/services/api/venteGiftPassApi'");
  });

  it('should include async action pattern with try/catch/finally', () => {
    const model = buildCodegenModel(makeContract());
    const output = generateStore(model);
    expect(output).toContain('set({ isLoading: true, error: null })');
    expect(output).toContain('} catch (err) {');
    expect(output).toContain('set({ isLoading: false })');
  });
});

describe('generatePage', () => {
  it('should use store selectors first, then useState', () => {
    const model = buildCodegenModel(makeContract());
    const output = generatePage(model);
    const selectorPos = output.indexOf('useVenteGiftPassStore((s) =>');
    const useStatePos = output.indexOf('useState<string | null>');
    expect(selectorPos).toBeLessThan(useStatePos);
  });

  it('should include TODO comments', () => {
    const model = buildCodegenModel(makeContract());
    const output = generatePage(model);
    expect(output).toContain('// TODO: RM-001');
    expect(output).toContain('{/* TODO: implement UI */}');
  });

  it('should generate action buttons', () => {
    const model = buildCodegenModel(makeContract());
    const output = generatePage(model);
    expect(output).toContain('Calculer montant vente');
  });
});

describe('generateApi', () => {
  it('should export endpoint object', () => {
    const model = buildCodegenModel(makeContract());
    const output = generateApi(model);
    expect(output).toContain('export const venteGiftPassApi');
    expect(output).toContain('callPrintTicket');
  });

  it('should use apiClient with generics', () => {
    const model = buildCodegenModel(makeContract());
    const output = generateApi(model);
    expect(output).toContain("apiClient.");
    expect(output).toContain("ApiResponse<unknown>");
  });

  it('should handle empty callees', () => {
    const contract = makeContract();
    contract.callees = [];
    const model = buildCodegenModel(contract);
    const output = generateApi(model);
    expect(output).toContain('export const venteGiftPassApi = {}');
  });
});

describe('generateTests', () => {
  it('should include beforeEach reset', () => {
    const model = buildCodegenModel(makeContract());
    const output = generateTests(model);
    expect(output).toContain('beforeEach(() =>');
    expect(output).toContain('useVenteGiftPassStore.setState');
  });

  it('should test initial state', () => {
    const model = buildCodegenModel(makeContract());
    const output = generateTests(model);
    expect(output).toContain("it('should have correct initial state'");
    expect(output).toContain('expect(state.isLoading).toBe(false)');
  });

  it('should have one test per action', () => {
    const model = buildCodegenModel(makeContract());
    const output = generateTests(model);
    expect(output).toContain("it('should handle calculerMontantVente'");
    expect(output).toContain("it('should handle appliquerRemiseMembre'");
  });

  it('should include reset test', () => {
    const model = buildCodegenModel(makeContract());
    const output = generateTests(model);
    expect(output).toContain("it('should reset state'");
  });
});
