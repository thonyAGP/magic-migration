import { describe, it, expect } from 'vitest';
import { inferFieldType, inferDefaultValue, applyHeuristicEnrichment } from '../src/generators/codegen/enrich-heuristics.js';
import { emptyEnrichment } from '../src/generators/codegen/enrich-model.js';
import { buildCodegenModel } from '../src/generators/codegen/codegen-model.js';
import { generateTypes } from '../src/generators/codegen/type-generator.js';
import { generateStore } from '../src/generators/codegen/store-generator.js';
import { generateTests } from '../src/generators/codegen/test-generator.js';
import { buildCodegenSystemPrompt, buildCodegenUserPrompt, parseClaudeEnrichmentResponse } from '../src/generators/codegen/enrich-prompt.js';
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
    { localId: 'D', name: 'montant', type: 'Virtual', status: 'IMPL', targetFile: '', gapNotes: 'montant total' },
    { localId: 'E', name: 'compteId', type: 'Parameter', status: 'IMPL', targetFile: '', gapNotes: '' },
    { localId: 'F', name: 'estValide', type: 'Virtual', status: 'IMPL', targetFile: '', gapNotes: 'validation flag' },
    { localId: 'G', name: 'dateComptable', type: 'Virtual', status: 'IMPL', targetFile: '', gapNotes: '' },
  ],
  tables: [
    { id: 300, name: 'cc_ventes', mode: 'RW', status: 'IMPL', targetFile: '', gapNotes: '' },
  ],
  callees: [
    { id: 229, name: 'PRINT_TICKET', calls: 1, context: 'write ticket', status: 'IMPL', target: '', gapNotes: '' },
  ],
  overall: {
    rulesTotal: 2, rulesImpl: 1, rulesPartial: 0, rulesMissing: 1, rulesNa: 0,
    variablesKeyCount: 4, calleesTotal: 1, calleesImpl: 1, calleesMissing: 0,
    coveragePct: 80, status: 'enriched', generated: '', notes: '',
  },
});

// ─── Tier 1: Heuristic inference ────────────────────────────────

describe('inferFieldType', () => {
  it('should infer number for montant/solde/nbre/total', () => {
    expect(inferFieldType('montant')).toBe('number');
    expect(inferFieldType('soldeCompte')).toBe('number');
    expect(inferFieldType('nbreArticles')).toBe('number');
    expect(inferFieldType('totalGeneral')).toBe('number');
    expect(inferFieldType('quantite')).toBe('number');
    expect(inferFieldType('prixUnitaire')).toBe('number');
    expect(inferFieldType('tauxChange')).toBe('number');
  });

  it('should infer boolean for est*/is*/has*/flag', () => {
    expect(inferFieldType('estValide')).toBe('boolean');
    expect(inferFieldType('isActive')).toBe('boolean');
    expect(inferFieldType('hasAccount')).toBe('boolean');
    expect(inferFieldType('flagRejet')).toBe('boolean');
  });

  it('should infer string for date patterns', () => {
    expect(inferFieldType('dateComptable')).toBe('string');
    expect(inferFieldType('dateDebut')).toBe('string');
    expect(inferFieldType('createdAt')).toBe('string');
  });

  it('should default to string for unknown', () => {
    expect(inferFieldType('commentaire')).toBe('string');
    expect(inferFieldType('codeDevise')).toBe('string');
    expect(inferFieldType('nomClient')).toBe('string');
  });

  it('should use description as fallback', () => {
    expect(inferFieldType('myField', 'montant restant')).toBe('number');
    expect(inferFieldType('myFlag', 'oui/non booleen')).toBe('boolean');
  });
});

describe('inferDefaultValue', () => {
  it('should return typed defaults', () => {
    expect(inferDefaultValue('number')).toBe('0');
    expect(inferDefaultValue('boolean')).toBe('false');
    expect(inferDefaultValue('string')).toBe("''");
    expect(inferDefaultValue('unknown')).toBe('null');
  });
});

describe('applyHeuristicEnrichment', () => {
  it('should enrich state field types from variable names', () => {
    const model = buildCodegenModel(makeContract());
    const enriched = applyHeuristicEnrichment(model);

    expect(enriched.enrichments).toBeDefined();
    expect(enriched.enrichments!.stateFieldTypes['montant']).toBe('number');
    expect(enriched.enrichments!.stateFieldTypes['compteId']).toBe('string'); // Parameter → string
    expect(enriched.enrichments!.stateFieldTypes['estValide']).toBe('boolean');
    expect(enriched.enrichments!.stateFieldTypes['dateComptable']).toBe('string');
  });

  it('should set default values matching types', () => {
    const model = buildCodegenModel(makeContract());
    const enriched = applyHeuristicEnrichment(model);

    expect(enriched.enrichments!.stateFieldDefaults['montant']).toBe('0');
    expect(enriched.enrichments!.stateFieldDefaults['compteId']).toBe("''");
    expect(enriched.enrichments!.stateFieldDefaults['estValide']).toBe('false');
  });

  it('should generate entity fields with at least id', () => {
    const model = buildCodegenModel(makeContract());
    const enriched = applyHeuristicEnrichment(model);

    expect(enriched.enrichments!.entityFields['CcVentes']).toBeDefined();
    expect(enriched.enrichments!.entityFields['CcVentes'][0].name).toBe('id');
  });

  it('should generate test assertions', () => {
    const model = buildCodegenModel(makeContract());
    const enriched = applyHeuristicEnrichment(model);

    expect(enriched.enrichments!.testAssertions['montant']).toContain('expect(state.montant).toBe(0)');
    expect(enriched.enrichments!.testAssertions['estValide']).toContain('expect(state.estValide).toBe(false)');
  });

  it('should not modify original model', () => {
    const model = buildCodegenModel(makeContract());
    expect(model.enrichments).toBeUndefined();
    applyHeuristicEnrichment(model);
    expect(model.enrichments).toBeUndefined();
  });
});

// ─── Enrichment-aware generators ────────────────────────────────

describe('generators with enrichment', () => {
  it('should use enriched types in type-generator', () => {
    const model = applyHeuristicEnrichment(buildCodegenModel(makeContract()));
    const output = generateTypes(model);

    expect(output).toContain('montant: number;');
    expect(output).toContain('estValide: boolean;');
    expect(output).toContain('dateComptable: string;');
    expect(output).not.toContain('unknown');
  });

  it('should use enriched entity fields in type-generator', () => {
    const model = applyHeuristicEnrichment(buildCodegenModel(makeContract()));
    const output = generateTypes(model);

    expect(output).toContain('id: number;');
    expect(output).not.toContain('id: string | number');
  });

  it('should use enriched defaults in store-generator', () => {
    const model = applyHeuristicEnrichment(buildCodegenModel(makeContract()));
    const output = generateStore(model);

    expect(output).toContain('montant: 0,');
    expect(output).toContain("compteId: '',");
    expect(output).toContain('estValide: false,');
  });

  it('should use enriched action bodies in store-generator', () => {
    const model = applyHeuristicEnrichment(buildCodegenModel(makeContract()));
    const output = generateStore(model);

    // RM-001 uses variable D = montant, should have set({ montant: 0 })
    expect(output).toContain('set({ montant: 0 });');
  });

  it('should not have TODO for enriched actions', () => {
    const model = applyHeuristicEnrichment(buildCodegenModel(makeContract()));
    const output = generateStore(model);

    // RM-001 has a body, so no TODO for it
    expect(output).not.toContain('// TODO: implement RM-001');
    // RM-002 variable E = compteId (Parameter, mapped to compteId), should have body
    // Actually let's check: RM-002 variable is 'E', stateField name for E is 'compteId'
  });

  it('should use enriched defaults in test-generator beforeEach', () => {
    const model = applyHeuristicEnrichment(buildCodegenModel(makeContract()));
    const output = generateTests(model);

    expect(output).toContain('montant: 0,');
    expect(output).toContain('estValide: false,');
  });

  it('should use enriched assertions in test-generator', () => {
    const model = applyHeuristicEnrichment(buildCodegenModel(makeContract()));
    const output = generateTests(model);

    expect(output).toContain('expect(state.montant).toBe(0)');
    expect(output).toContain('expect(state.estValide).toBe(false)');
  });

  it('should still work without enrichment (v8 compat)', () => {
    const model = buildCodegenModel(makeContract());
    const output = generateTypes(model);

    // Without enrichment, props get 'string', others get 'unknown'
    expect(output).toContain('compteId: string;');
    // montant is Virtual without enrichment → unknown
    expect(output).toContain('montant: unknown;');
  });

  it('should still have TODO for unenriched store', () => {
    const model = buildCodegenModel(makeContract());
    const output = generateStore(model);
    expect(output).toContain('// TODO: implement RM-001');
  });
});

// ─── emptyEnrichment ────────────────────────────────────────────

describe('emptyEnrichment', () => {
  it('should return empty records', () => {
    const e = emptyEnrichment();
    expect(Object.keys(e.stateFieldTypes)).toHaveLength(0);
    expect(Object.keys(e.stateFieldDefaults)).toHaveLength(0);
    expect(Object.keys(e.entityFields)).toHaveLength(0);
    expect(Object.keys(e.actionBodies)).toHaveLength(0);
    expect(Object.keys(e.testAssertions)).toHaveLength(0);
  });
});

// ─── Tier 2: Claude prompt building ─────────────────────────────

describe('buildCodegenSystemPrompt', () => {
  it('should contain JSON structure instructions', () => {
    const prompt = buildCodegenSystemPrompt();
    expect(prompt).toContain('stateFieldTypes');
    expect(prompt).toContain('entityFields');
    expect(prompt).toContain('actionBodies');
    expect(prompt).toContain('Zustand');
  });
});

describe('buildCodegenUserPrompt', () => {
  it('should include program info and heuristic types', () => {
    const model = applyHeuristicEnrichment(buildCodegenModel(makeContract()));
    const prompt = buildCodegenUserPrompt(model);
    const parsed = JSON.parse(prompt);

    expect(parsed.program.id).toBe(237);
    expect(parsed.program.name).toBe('Vente_GiftPass');
    expect(parsed.stateFields).toHaveLength(4);
    expect(parsed.stateFields[0].heuristicType).toBe('number');
  });

  it('should include entities and actions', () => {
    const model = applyHeuristicEnrichment(buildCodegenModel(makeContract()));
    const prompt = buildCodegenUserPrompt(model);
    const parsed = JSON.parse(prompt);

    expect(parsed.entities).toHaveLength(1);
    expect(parsed.entities[0].interfaceName).toBe('CcVentes');
    expect(parsed.actions).toHaveLength(2);
    expect(parsed.actions[0].id).toBe('RM-001');
  });
});

describe('parseClaudeEnrichmentResponse', () => {
  it('should parse valid JSON response', () => {
    const raw = JSON.stringify({
      stateFieldTypes: { montant: 'number' },
      stateFieldDefaults: { montant: '0' },
      entityFields: {},
      actionBodies: { 'RM-001': 'set({ montant: 42 });' },
      testAssertions: {},
    });

    const result = parseClaudeEnrichmentResponse(raw);
    expect(result.stateFieldTypes['montant']).toBe('number');
    expect(result.actionBodies['RM-001']).toContain('42');
  });

  it('should parse JSON wrapped in code block', () => {
    const raw = '```json\n{ "stateFieldTypes": { "x": "string" }, "stateFieldDefaults": {}, "entityFields": {}, "actionBodies": {}, "testAssertions": {} }\n```';
    const result = parseClaudeEnrichmentResponse(raw);
    expect(result.stateFieldTypes['x']).toBe('string');
  });

  it('should return empty records for missing fields', () => {
    const raw = '{}';
    const result = parseClaudeEnrichmentResponse(raw);
    expect(Object.keys(result.stateFieldTypes)).toHaveLength(0);
    expect(Object.keys(result.actionBodies)).toHaveLength(0);
  });

  it('should throw on invalid JSON', () => {
    expect(() => parseClaudeEnrichmentResponse('not json')).toThrow();
  });
});

// ─── Runner integration ─────────────────────────────────────────

describe('codegen runner', () => {
  it('should export runCodegenEnriched', async () => {
    const { runCodegenEnriched } = await import('../src/generators/codegen/codegen-runner.js');
    expect(typeof runCodegenEnriched).toBe('function');
  });

  it('should run heuristic enrichment without API', async () => {
    const { runCodegenEnriched } = await import('../src/generators/codegen/codegen-runner.js');
    const contract = makeContract();
    const result = await runCodegenEnriched(
      contract,
      { outputDir: '/tmp/test', dryRun: true, overwrite: false },
      { mode: 'heuristic' },
    );

    expect(result.files).toHaveLength(5);
    // Types file should have enriched types
    const typesFile = result.files.find(f => f.relativePath.includes('types/'));
    expect(typesFile).toBeDefined();
    expect(typesFile!.content).toContain('montant: number;');
    expect(typesFile!.content).not.toContain('montant: unknown;');
  });

  it('should work with mode=none (v8 compat)', async () => {
    const { runCodegenEnriched } = await import('../src/generators/codegen/codegen-runner.js');
    const contract = makeContract();
    const result = await runCodegenEnriched(
      contract,
      { outputDir: '/tmp/test', dryRun: true, overwrite: false },
      { mode: 'none' },
    );

    const typesFile = result.files.find(f => f.relativePath.includes('types/'));
    expect(typesFile!.content).toContain('montant: unknown;');
  });

  it('should preserve backward compat with sync runCodegen', async () => {
    const { runCodegen } = await import('../src/generators/codegen/codegen-runner.js');
    const contract = makeContract();
    const result = runCodegen(
      contract,
      { outputDir: '/tmp/test', dryRun: true, overwrite: false },
    );

    expect(result.files).toHaveLength(5);
    expect(result.programId).toBe(237);
  });
});
