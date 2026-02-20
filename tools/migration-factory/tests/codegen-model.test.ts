import { describe, it, expect } from 'vitest';
import { buildCodegenModel } from '../src/generators/codegen/codegen-model.js';
import type { MigrationContract } from '../src/core/types.js';

const makeContract = (overrides: Partial<MigrationContract> = {}): MigrationContract => ({
  program: {
    id: 131,
    name: 'Fermeture_Session',
    complexity: 'MEDIUM',
    callers: [121],
    callees: [192, 229],
    tasksCount: 5,
    tablesCount: 3,
    expressionsCount: 20,
  },
  rules: [
    { id: 'RM-001', description: 'Calculer solde coffre', condition: 'IF solde > 0', variables: ['D', 'E'], status: 'IMPL', targetFile: '', gapNotes: '' },
    { id: 'RM-002', description: 'Verifier ecart caisse', condition: '', variables: ['F'], status: 'MISSING', targetFile: '', gapNotes: '' },
  ],
  variables: [
    { localId: 'D', name: 'soldeCoffre', type: 'Virtual', status: 'IMPL', targetFile: '', gapNotes: '' },
    { localId: 'E', name: 'societeCode', type: 'Parameter', status: 'IMPL', targetFile: '', gapNotes: '' },
    { localId: 'F', name: 'totalOperations', type: 'Real', status: 'MISSING', targetFile: '', gapNotes: '' },
  ],
  tables: [
    { id: 849, name: 'operations_dat', mode: 'R', status: 'IMPL', targetFile: '', gapNotes: '' },
    { id: 850, name: 'coffre_caisse', mode: 'W', status: 'IMPL', targetFile: '', gapNotes: '' },
  ],
  callees: [
    { id: 192, name: 'SOLDE_COMPTE', calls: 2, context: 'read solde', status: 'IMPL', target: '', gapNotes: '' },
    { id: 229, name: 'PRINT_TICKET', calls: 1, context: 'write ticket', status: 'MISSING', target: '', gapNotes: '' },
  ],
  overall: {
    rulesTotal: 2, rulesImpl: 1, rulesPartial: 0, rulesMissing: 1, rulesNa: 0,
    variablesKeyCount: 3, calleesTotal: 2, calleesImpl: 1, calleesMissing: 1,
    coveragePct: 60, status: 'enriched', generated: '', notes: '',
  },
  ...overrides,
});

describe('buildCodegenModel', () => {
  it('should derive camelCase domain from program name', () => {
    const model = buildCodegenModel(makeContract());
    expect(model.domain).toBe('fermetureSession');
    expect(model.domainPascal).toBe('FermetureSession');
  });

  it('should strip project prefix from name', () => {
    const contract = makeContract();
    contract.program.name = 'ADH_Gestion_Caisse';
    const model = buildCodegenModel(contract);
    expect(model.domain).toBe('gestionCaisse');
    expect(model.domainPascal).toBe('GestionCaisse');
  });

  it('should map tables to entities with correct mode', () => {
    const model = buildCodegenModel(makeContract());
    expect(model.entities).toHaveLength(2);
    expect(model.entities[0].interfaceName).toBe('OperationsDat');
    expect(model.entities[0].mode).toBe('R');
    expect(model.entities[1].interfaceName).toBe('CoffreCaisse');
    expect(model.entities[1].mode).toBe('W');
  });

  it('should map rules to actions with handler names', () => {
    const model = buildCodegenModel(makeContract());
    expect(model.actions).toHaveLength(2);
    expect(model.actions[0].id).toBe('RM-001');
    expect(model.actions[0].handlerName).toBe('calculerSoldeCoffre');
    expect(model.actions[0].condition).toBe('IF solde > 0');
    expect(model.actions[1].handlerName).toBe('verifierEcartCaisse');
  });

  it('should map callees to apiCalls', () => {
    const model = buildCodegenModel(makeContract());
    expect(model.apiCalls).toHaveLength(2);
    expect(model.apiCalls[0].name).toBe('callSoldeCompte');
    expect(model.apiCalls[0].method).toBe('GET');
    expect(model.apiCalls[1].name).toBe('callPrintTicket');
    expect(model.apiCalls[1].method).toBe('POST');
  });

  it('should classify variables by type (Parameter→prop, Virtual→state, Real→computed)', () => {
    const model = buildCodegenModel(makeContract());
    expect(model.stateFields).toHaveLength(3);
    const byName = Object.fromEntries(model.stateFields.map(f => [f.name, f.source]));
    expect(byName['soldeCoffre']).toBe('state');
    expect(byName['societeCode']).toBe('prop');
    expect(byName['totalOperations']).toBe('computed');
  });

  it('should handle empty contract sections', () => {
    const contract = makeContract({ rules: [], variables: [], tables: [], callees: [] });
    const model = buildCodegenModel(contract);
    expect(model.entities).toEqual([]);
    expect(model.actions).toEqual([]);
    expect(model.apiCalls).toEqual([]);
    expect(model.stateFields).toEqual([]);
  });

  it('should preserve programId and programName', () => {
    const model = buildCodegenModel(makeContract());
    expect(model.programId).toBe(131);
    expect(model.programName).toBe('Fermeture_Session');
  });
});
