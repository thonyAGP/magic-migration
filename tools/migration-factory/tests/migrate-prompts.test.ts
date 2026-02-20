import { describe, it, expect } from 'vitest';
import {
  buildSpecPrompt, buildAnalyzePrompt, buildTypesPrompt,
  buildStorePrompt, buildApiPrompt, buildPagePrompt,
  buildComponentPrompt, buildTestUnitPrompt, buildTestUiPrompt,
  buildFixTscPrompt, buildFixTestsPrompt, buildIntegratePrompt,
  buildReviewPrompt,
} from '../src/migrate/migrate-prompts.js';
import type { MigrateContext } from '../src/migrate/migrate-context.js';
import type { AnalysisDocument } from '../src/migrate/migrate-types.js';

const makeAnalysis = (overrides: Partial<AnalysisDocument> = {}): AnalysisDocument => ({
  domain: 'extraitCompte',
  domainPascal: 'ExtraitCompte',
  complexity: 'MEDIUM',
  entities: [{ name: 'Mouvement', fields: [{ name: 'id', type: 'number', source: 'ops.id' }] }],
  stateFields: [{ name: 'mouvements', type: 'Mouvement[]', default: '[]' }],
  actions: [{ name: 'charger', params: ['id: string'], businessRules: ['Load data'], returns: 'Promise<void>' }],
  apiEndpoints: [{ method: 'GET', path: '/api/extrait', queryParams: [], response: 'Mouvement[]' }],
  uiLayout: { type: 'page', sections: [{ name: 'grid', controls: ['table'] }] },
  mockData: { count: 5, description: 'test data' },
  dependencies: { stores: [], sharedTypes: [], externalApis: [] },
  ...overrides,
});

const makeCtx = (overrides: Partial<MigrateContext> = {}): MigrateContext => ({
  programId: 69,
  project: 'ADH',
  spec: '# Spec 69\n## Tables\nTable ops\n## Expressions\nExpr 1',
  contract: null,
  analysis: null,
  dbMetadata: {},
  ...overrides,
});

describe('buildSpecPrompt', () => {
  it('should include KB data and program info', () => {
    const prompt = buildSpecPrompt('tree data here', 69, 'ADH');
    expect(prompt).toContain('ADH IDE 69');
    expect(prompt).toContain('tree data here');
    expect(prompt).toContain('specification');
  });

  it('should request markdown output', () => {
    const prompt = buildSpecPrompt('data', 42, 'PBP');
    expect(prompt).toContain('Markdown');
  });
});

describe('buildAnalyzePrompt', () => {
  it('should include spec when available', () => {
    const ctx = makeCtx({ spec: '# My Spec\nRules here' });
    const prompt = buildAnalyzePrompt(ctx);
    expect(prompt).toContain('PROGRAM SPEC');
    expect(prompt).toContain('My Spec');
  });

  it('should include contract when available', () => {
    const ctx = makeCtx({
      contract: {
        program: { id: 69, name: 'TEST', complexity: 'LOW', callers: [], callees: [], tasksCount: 1, tablesCount: 1, expressionsCount: 5 },
        rules: [], variables: [], tables: [], callees: [],
        overall: { rulesTotal: 0, rulesImpl: 0, rulesPartial: 0, rulesMissing: 0, rulesNa: 0, variablesKeyCount: 0, calleesTotal: 0, calleesImpl: 0, calleesMissing: 0, coveragePct: 0, status: 'contracted', generated: '', notes: '' },
      },
    });
    const prompt = buildAnalyzePrompt(ctx);
    expect(prompt).toContain('CONTRACT');
  });

  it('should include DB metadata when available', () => {
    const ctx = makeCtx({ dbMetadata: { ops: 'Column: id INT, date DATE' } });
    const prompt = buildAnalyzePrompt(ctx);
    expect(prompt).toContain('DB METADATA');
    expect(prompt).toContain('id INT');
  });

  it('should include JSON schema template', () => {
    const ctx = makeCtx();
    const prompt = buildAnalyzePrompt(ctx);
    expect(prompt).toContain('"domain"');
    expect(prompt).toContain('"entities"');
  });
});

describe('buildTypesPrompt', () => {
  it('should include analysis domain', () => {
    const ctx = makeCtx();
    const analysis = makeAnalysis();
    const prompt = buildTypesPrompt(ctx, analysis);
    expect(prompt).toContain('extraitCompte');
    expect(prompt).toContain('ANALYSIS DOCUMENT');
  });

  it('should include pattern reference when provided', () => {
    const ctx = makeCtx();
    const analysis = makeAnalysis();
    const prompt = buildTypesPrompt(ctx, analysis, 'export interface Change {}');
    expect(prompt).toContain('REFERENCE PATTERN');
    expect(prompt).toContain('interface Change');
  });
});

describe('buildStorePrompt', () => {
  it('should include types content and analysis', () => {
    const ctx = makeCtx();
    const analysis = makeAnalysis();
    const prompt = buildStorePrompt(ctx, analysis, 'export interface State {}');
    expect(prompt).toContain('TYPES FILE');
    expect(prompt).toContain('interface State');
    expect(prompt).toContain('useDataSourceStore');
  });

  it('should include spec excerpt', () => {
    const ctx = makeCtx({ spec: '## Rules\nRule A applies here' });
    const analysis = makeAnalysis();
    const prompt = buildStorePrompt(ctx, analysis, '');
    expect(prompt).toContain('SPEC EXCERPT');
  });
});

describe('buildApiPrompt', () => {
  it('should include endpoints from analysis', () => {
    const analysis = makeAnalysis();
    const prompt = buildApiPrompt(analysis, 'export type T = {}');
    expect(prompt).toContain('/api/extrait');
    expect(prompt).toContain('apiClient');
  });
});

describe('buildPagePrompt', () => {
  it('should include UI layout and store content', () => {
    const ctx = makeCtx();
    const analysis = makeAnalysis();
    const prompt = buildPagePrompt(ctx, analysis, 'const store = create()', 'type T = {}');
    expect(prompt).toContain('ExtraitCompte');
    expect(prompt).toContain('ScreenLayout');
    expect(prompt).toContain('UI LAYOUT');
  });
});

describe('buildComponentPrompt', () => {
  it('should include component name and section', () => {
    const analysis = makeAnalysis();
    const section = { name: 'filters', controls: ['dateDebut', 'dateFin'] };
    const prompt = buildComponentPrompt('FiltersPanel', analysis, section, 'types', 'page');
    expect(prompt).toContain('FiltersPanel');
    expect(prompt).toContain('dateDebut');
  });
});

describe('buildTestUnitPrompt', () => {
  it('should include store content and action list', () => {
    const analysis = makeAnalysis();
    const prompt = buildTestUnitPrompt(analysis, 'store code', 'types code');
    expect(prompt).toContain('extraitCompteStore');
    expect(prompt).toContain('vi.mock');
    expect(prompt).toContain('charger');
  });
});

describe('buildTestUiPrompt', () => {
  it('should include page content and UI sections', () => {
    const analysis = makeAnalysis();
    const prompt = buildTestUiPrompt(analysis, 'page code', 'types code');
    expect(prompt).toContain('ExtraitComptePage');
    expect(prompt).toContain('fireEvent');
  });
});

describe('buildFixTscPrompt', () => {
  it('should include file content and errors', () => {
    const prompt = buildFixTscPrompt('const x = 1;', 'foo.ts', ['Line 5: TS2304 Cannot find name']);
    expect(prompt).toContain('foo.ts');
    expect(prompt).toContain('TS2304');
    expect(prompt).toContain('const x = 1');
  });

  it('should include related types when provided', () => {
    const prompt = buildFixTscPrompt('code', 'f.ts', ['err'], 'interface Foo {}');
    expect(prompt).toContain('IMPORTED TYPES');
    expect(prompt).toContain('interface Foo');
  });
});

describe('buildFixTestsPrompt', () => {
  it('should include test file, source and errors', () => {
    const prompt = buildFixTestsPrompt('test code', 'test.ts', 'source code', ['Test failed']);
    expect(prompt).toContain('test.ts');
    expect(prompt).toContain('test code');
    expect(prompt).toContain('source code');
    expect(prompt).toContain('Test failed');
  });
});

describe('buildIntegratePrompt', () => {
  it('should include route info and domains', () => {
    const prompt = buildIntegratePrompt('existing routes', [
      { domain: 'extrait', domainPascal: 'Extrait', pagePath: 'pages/ExtraitPage.tsx' },
    ]);
    expect(prompt).toContain('existing routes');
    expect(prompt).toContain('Extrait');
    expect(prompt).toContain('pagePath');
  });
});

describe('buildReviewPrompt', () => {
  it('should include contract rules and generated files', () => {
    const ctx = makeCtx({
      contract: {
        program: { id: 69, name: 'TEST', complexity: 'LOW', callers: [], callees: [], tasksCount: 1, tablesCount: 1, expressionsCount: 5 },
        rules: [{ id: 1, description: 'Rule A', status: 'impl' }],
        variables: [], tables: [], callees: [],
        overall: { rulesTotal: 1, rulesImpl: 1, rulesPartial: 0, rulesMissing: 0, rulesNa: 0, variablesKeyCount: 0, calleesTotal: 0, calleesImpl: 0, calleesMissing: 0, coveragePct: 100, status: 'verified', generated: '', notes: '' },
      },
    });
    const prompt = buildReviewPrompt(ctx, { 'store.ts': 'store code', 'page.tsx': 'page code' });
    expect(prompt).toContain('Rule A');
    expect(prompt).toContain('store.ts');
    expect(prompt).toContain('coveragePct');
  });
});
