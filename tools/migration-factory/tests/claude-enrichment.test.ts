import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import YAML from 'yaml';
import type { MigrationContract, PipelineConfig } from '../src/core/types.js';
import { EnrichmentMode, PipelineAction } from '../src/core/types.js';
import { createClaudeClient, type ClaudeClientConfig, type ClaudeResponse } from '../src/pipeline/claude-client.js';
import {
  buildSystemPrompt,
  buildUserPrompt,
  extractRelevantSpecSections,
  extractGapItems,
  applyEnrichmentResult,
  findRelevantCodeFiles,
} from '../src/pipeline/claude-prompt.js';
import { createClaudeEnrichmentHook } from '../src/pipeline/claude-enrichment-hook.js';
import { runBatchPipeline } from '../src/pipeline/pipeline-runner.js';
import type { EnrichmentHook, EnrichmentContext } from '../src/pipeline/enrichment-hook.js';

// ─── Test Helpers ────────────────────────────────────────────────

let testDirs: string[] = [];

beforeEach(() => { testDirs = []; });
afterEach(() => {
  for (const dir of testDirs) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
  vi.restoreAllMocks();
});

const setup = () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mf-claude-'));
  testDirs.push(dir);
  return dir;
};

const makeContract = (overrides?: Partial<MigrationContract>): MigrationContract => ({
  program: { id: 200, name: 'TestProg', complexity: 'MEDIUM', callers: [], callees: [], tasksCount: 3, tablesCount: 2, expressionsCount: 10 },
  rules: [
    { id: 'RM-001', description: 'Check solde', condition: 'solde >= montant', variables: ['BA'], status: 'IMPL', targetFile: 'src/solde.ts', gapNotes: '' },
    { id: 'RM-002', description: 'Validate date', condition: 'date > today', variables: ['BC'], status: 'MISSING', targetFile: '', gapNotes: '' },
    { id: 'RM-003', description: 'Print receipt', condition: '', variables: [], status: 'MISSING', targetFile: '', gapNotes: '' },
  ],
  variables: [
    { localId: 'BA', name: 'Solde', type: 'Virtual', status: 'IMPL', targetFile: 'src/solde.ts', gapNotes: '' },
    { localId: 'EW', name: 'TempFlag', type: 'Virtual', status: 'MISSING', targetFile: '', gapNotes: '' },
  ],
  tables: [
    { id: 849, name: 'cafil008_dat', mode: 'R', status: 'IMPL', targetFile: 'src/db.ts', gapNotes: '' },
    { id: 999, name: 'tempo_ecran', mode: 'R', status: 'MISSING', targetFile: '', gapNotes: '' },
  ],
  callees: [
    { id: 180, name: 'SET_LIST_NUMBER', calls: 1, context: '', status: 'MISSING', target: '', gapNotes: '' },
  ],
  overall: {
    rulesTotal: 3, rulesImpl: 1, rulesPartial: 0, rulesMissing: 2, rulesNa: 0,
    variablesKeyCount: 2, calleesTotal: 1, calleesImpl: 0, calleesMissing: 1,
    coveragePct: 33, status: 'contracted', generated: '2026-02-19', notes: '',
  },
  ...overrides,
});

// ─── Claude Client Tests ────────────────────────────────────────

describe('createClaudeClient', () => {
  it('should throw when no API key provided', () => {
    const origKey = process.env.ANTHROPIC_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;
    try {
      expect(() => createClaudeClient()).toThrow('ANTHROPIC_API_KEY required');
    } finally {
      if (origKey) process.env.ANTHROPIC_API_KEY = origKey;
    }
  });

  it('should create client with explicit API key', () => {
    const client = createClaudeClient({ apiKey: 'test-key-123' });
    expect(client).toBeDefined();
    expect(client.classify).toBeInstanceOf(Function);
  });

  it('should create client with env API key', () => {
    const origKey = process.env.ANTHROPIC_API_KEY;
    process.env.ANTHROPIC_API_KEY = 'test-env-key';
    try {
      const client = createClaudeClient();
      expect(client).toBeDefined();
    } finally {
      if (origKey) {
        process.env.ANTHROPIC_API_KEY = origKey;
      } else {
        delete process.env.ANTHROPIC_API_KEY;
      }
    }
  });
});

// ─── Prompt Builder Tests ───────────────────────────────────────

describe('buildSystemPrompt', () => {
  it('should return a non-empty system prompt', () => {
    const prompt = buildSystemPrompt();
    expect(prompt.length).toBeGreaterThan(100);
    expect(prompt).toContain('migration');
    expect(prompt).toContain('IMPL');
    expect(prompt).toContain('N/A');
  });
});

describe('extractRelevantSpecSections', () => {
  it('should extract rules section', () => {
    const spec = `# ADH IDE 200

## Onglet 2 : Technique

### 5. Regles metier
| ID | Description |
|----|-------------|
| RM-001 | Check solde |

### 10. Tables utilisees
| Table | Nom |
|-------|-----|
| 849 | cafil008 |
`;
    const result = extractRelevantSpecSections(spec);
    expect(result).toContain('RM-001');
    expect(result).toContain('cafil008');
  });

  it('should truncate long sections', () => {
    const longContent = 'x'.repeat(10000);
    const spec = `### 5. Regles metier\n${longContent}\n### 10. Tables\nshort`;
    const result = extractRelevantSpecSections(spec, 2000);
    expect(result.length).toBeLessThan(3000);
  });

  it('should fallback to raw content when no sections match', () => {
    const spec = 'This is just raw text without any structured sections';
    const result = extractRelevantSpecSections(spec, 100);
    expect(result).toBe(spec.slice(0, 100));
  });
});

describe('extractGapItems', () => {
  it('should extract only MISSING/PARTIAL items', () => {
    const contract = makeContract();
    const gaps = extractGapItems(contract);

    // Should include: RM-002 (MISSING), RM-003 (MISSING), EW (MISSING), tempo_ecran (MISSING), SET_LIST_NUMBER (MISSING)
    expect(gaps.length).toBe(5);
    expect(gaps.every(g => g.status === 'MISSING' || g.status === 'PARTIAL')).toBe(true);
  });

  it('should not include IMPL or N/A items', () => {
    const contract = makeContract();
    const gaps = extractGapItems(contract);

    expect(gaps.find(g => g.id === 'RM-001')).toBeUndefined();
    expect(gaps.find(g => g.id === 'BA')).toBeUndefined();
  });

  it('should return empty for fully implemented contract', () => {
    const contract = makeContract({
      rules: [{ id: 'R1', description: 'done', condition: '', variables: [], status: 'IMPL', targetFile: '', gapNotes: '' }],
      variables: [],
      tables: [{ id: 1, name: 'test', mode: 'R', status: 'N/A', targetFile: '', gapNotes: '' }],
      callees: [],
    });
    const gaps = extractGapItems(contract);
    expect(gaps).toHaveLength(0);
  });

  it('should categorize items by type', () => {
    const contract = makeContract();
    const gaps = extractGapItems(contract);

    const types = new Set(gaps.map(g => g.type));
    expect(types.has('rule')).toBe(true);
    expect(types.has('variable')).toBe(true);
    expect(types.has('table')).toBe(true);
    expect(types.has('callee')).toBe(true);
  });
});

describe('buildUserPrompt', () => {
  it('should build prompt with spec, gaps, and snippets', () => {
    const contract = makeContract();
    const gaps = extractGapItems(contract);
    const prompt = buildUserPrompt('# Spec content here', gaps, [
      { file: 'src/test.ts', content: 'export const foo = 42;' },
    ]);

    expect(prompt).toContain('Legacy Program Specification');
    expect(prompt).toContain('Spec content here');
    expect(prompt).toContain('Web Codebase Files');
    expect(prompt).toContain('src/test.ts');
    expect(prompt).toContain('Items to Classify');
    expect(prompt).toContain('RM-002');
  });

  it('should return empty string for 0 gaps', () => {
    const prompt = buildUserPrompt('spec', [], []);
    expect(prompt).toBe('');
  });

  it('should include items as JSON', () => {
    const gaps = [{ id: 'RM-005', type: 'rule' as const, description: 'test rule', status: 'MISSING' as const }];
    const prompt = buildUserPrompt('spec', gaps, []);
    expect(prompt).toContain('"RM-005"');
    expect(prompt).toContain('"rule"');
  });
});

// ─── Apply Result Tests ─────────────────────────────────────────

describe('applyEnrichmentResult', () => {
  it('should update MISSING rule to IMPL', () => {
    const contract = makeContract();
    const result = applyEnrichmentResult(contract, [
      { id: 'RM-002', type: 'rule', status: 'IMPL', targetFile: 'src/date.ts', gapNotes: 'Found date validation' },
    ]);

    const updated = result.rules.find(r => r.id === 'RM-002');
    expect(updated?.status).toBe('IMPL');
    expect(updated?.targetFile).toBe('src/date.ts');
    expect(updated?.gapNotes).toBe('Found date validation');
  });

  it('should update MISSING rule to N/A', () => {
    const contract = makeContract();
    const result = applyEnrichmentResult(contract, [
      { id: 'RM-003', type: 'rule', status: 'N/A', targetFile: '', gapNotes: 'Print is legacy-only' },
    ]);

    const updated = result.rules.find(r => r.id === 'RM-003');
    expect(updated?.status).toBe('N/A');
  });

  it('should not overwrite existing IMPL items', () => {
    const contract = makeContract();
    const result = applyEnrichmentResult(contract, [
      { id: 'RM-001', type: 'rule', status: 'MISSING', targetFile: '', gapNotes: 'wrong' },
    ]);

    const unchanged = result.rules.find(r => r.id === 'RM-001');
    expect(unchanged?.status).toBe('IMPL');
  });

  it('should recalculate coveragePct after update', () => {
    const contract = makeContract();
    const result = applyEnrichmentResult(contract, [
      { id: 'RM-002', type: 'rule', status: 'IMPL', targetFile: 'src/x.ts', gapNotes: '' },
      { id: 'RM-003', type: 'rule', status: 'N/A', targetFile: '', gapNotes: 'legacy' },
      { id: 'EW', type: 'variable', status: 'N/A', targetFile: '', gapNotes: 'temp flag' },
      { id: '999', type: 'table', status: 'N/A', targetFile: '', gapNotes: 'memory table' },
      { id: '180', type: 'callee', status: 'N/A', targetFile: '', gapNotes: 'printer utility' },
    ]);

    // All remaining items are IMPL or N/A → 100%
    expect(result.overall.coveragePct).toBe(100);
  });

  it('should ignore items with unknown IDs', () => {
    const contract = makeContract();
    const result = applyEnrichmentResult(contract, [
      { id: 'UNKNOWN-999', type: 'rule', status: 'IMPL', targetFile: '', gapNotes: '' },
    ]);

    // No items should have changed status
    expect(result.rules).toEqual(contract.rules);
    expect(result.variables).toEqual(contract.variables);
    expect(result.tables).toEqual(contract.tables);
    expect(result.callees).toEqual(contract.callees);
  });

  it('should update callee status and target', () => {
    const contract = makeContract();
    const result = applyEnrichmentResult(contract, [
      { id: '180', type: 'callee', status: 'N/A', targetFile: '', gapNotes: 'Printer utility N/A for web' },
    ]);

    const callee = result.callees.find(c => c.id === 180 || String(c.id) === '180');
    expect(callee?.status).toBe('N/A');
    expect(callee?.gapNotes).toBe('Printer utility N/A for web');
  });

  it('should update table status', () => {
    const contract = makeContract();
    const result = applyEnrichmentResult(contract, [
      { id: '999', type: 'table', status: 'N/A', targetFile: '', gapNotes: 'Memory table' },
    ]);

    const table = result.tables.find(t => t.id === 999 || String(t.id) === '999');
    expect(table?.status).toBe('N/A');
  });

  it('should update variable status', () => {
    const contract = makeContract();
    const result = applyEnrichmentResult(contract, [
      { id: 'EW', type: 'variable', status: 'IMPL', targetFile: 'src/flags.ts', gapNotes: 'TempFlag used' },
    ]);

    const v = result.variables.find(v => v.localId === 'EW');
    expect(v?.status).toBe('IMPL');
    expect(v?.targetFile).toBe('src/flags.ts');
  });
});

// ─── findRelevantCodeFiles Tests ────────────────────────────────

describe('findRelevantCodeFiles', () => {
  it('should return empty for non-existent codebase', () => {
    const contract = makeContract();
    const snippets = findRelevantCodeFiles('/non/existent/path', contract);
    expect(snippets).toEqual([]);
  });

  it('should find files matching gap item patterns', () => {
    const dir = setup();
    const codebaseDir = path.join(dir, 'src');
    fs.mkdirSync(codebaseDir, { recursive: true });
    fs.writeFileSync(path.join(codebaseDir, 'date-validator.ts'), 'export const validateDate = (d: Date) => d > new Date(); // RM-002', 'utf8');
    fs.writeFileSync(path.join(codebaseDir, 'other.ts'), 'export const unrelated = 42;', 'utf8');

    const contract = makeContract();
    const snippets = findRelevantCodeFiles(codebaseDir, contract);

    expect(snippets.length).toBeGreaterThanOrEqual(1);
    expect(snippets.some(s => s.file.includes('date-validator'))).toBe(true);
  });

  it('should return empty when contract has no gaps', () => {
    const dir = setup();
    const codebaseDir = path.join(dir, 'src');
    fs.mkdirSync(codebaseDir, { recursive: true });
    fs.writeFileSync(path.join(codebaseDir, 'test.ts'), 'export const x = 1;', 'utf8');

    const contract = makeContract({
      rules: [{ id: 'R1', description: 'done', condition: '', variables: [], status: 'IMPL', targetFile: '', gapNotes: '' }],
      variables: [],
      tables: [],
      callees: [],
    });

    const snippets = findRelevantCodeFiles(codebaseDir, contract);
    expect(snippets).toEqual([]);
  });

  it('should truncate file content to maxLines', () => {
    const dir = setup();
    const codebaseDir = path.join(dir, 'src');
    fs.mkdirSync(codebaseDir, { recursive: true });

    const longContent = Array.from({ length: 500 }, (_, i) => `// line ${i} RM-002`).join('\n');
    fs.writeFileSync(path.join(codebaseDir, 'long.ts'), longContent, 'utf8');

    const contract = makeContract();
    const snippets = findRelevantCodeFiles(codebaseDir, contract, 5, 10);

    if (snippets.length > 0) {
      const lines = snippets[0].content.split('\n');
      expect(lines.length).toBeLessThanOrEqual(10);
    }
  });
});

// ─── Claude Enrichment Hook Tests ───────────────────────────────

describe('createClaudeEnrichmentHook', () => {
  it('should return hook with name claude-api', () => {
    const hook = createClaudeEnrichmentHook({ apiKey: 'test' });
    expect(hook.name).toBe('claude-api');
  });

  it('canEnrich should return false without API key', () => {
    const origKey = process.env.ANTHROPIC_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;
    try {
      const hook = createClaudeEnrichmentHook();
      const dir = setup();
      const specFile = path.join(dir, 'test.md');
      fs.writeFileSync(specFile, '# Spec', 'utf8');

      expect(hook.canEnrich({
        contract: makeContract(),
        specFile,
        codebaseDir: dir,
      })).toBe(false);
    } finally {
      if (origKey) process.env.ANTHROPIC_API_KEY = origKey;
    }
  });

  it('canEnrich should return false without spec file', () => {
    const hook = createClaudeEnrichmentHook({ apiKey: 'test-key' });
    expect(hook.canEnrich({
      contract: makeContract(),
      specFile: '/non/existent/spec.md',
      codebaseDir: '/tmp',
    })).toBe(false);
  });

  it('canEnrich should return true with API key and spec file', () => {
    const hook = createClaudeEnrichmentHook({ apiKey: 'test-key' });
    const dir = setup();
    const specFile = path.join(dir, 'spec.md');
    fs.writeFileSync(specFile, '# Test spec', 'utf8');

    expect(hook.canEnrich({
      contract: makeContract(),
      specFile,
      codebaseDir: dir,
    })).toBe(true);
  });

  it('enrich should return 0 gaps when contract has no gaps', async () => {
    const hook = createClaudeEnrichmentHook({ apiKey: 'test-key' });
    const contract = makeContract({
      rules: [{ id: 'R1', description: 'done', condition: '', variables: [], status: 'IMPL', targetFile: '', gapNotes: '' }],
      variables: [],
      tables: [],
      callees: [],
      overall: {
        rulesTotal: 1, rulesImpl: 1, rulesPartial: 0, rulesMissing: 0, rulesNa: 0,
        variablesKeyCount: 0, calleesTotal: 0, calleesImpl: 0, calleesMissing: 0,
        coveragePct: 100, status: 'contracted', generated: '', notes: '',
      },
    });

    const dir = setup();
    const specFile = path.join(dir, 'spec.md');
    fs.writeFileSync(specFile, '# Spec', 'utf8');

    const result = await hook.enrich({ contract, specFile, codebaseDir: dir });
    expect(result.enriched).toBe(true);
    expect(result.gapsRemaining).toBe(0);
    expect(result.message).toContain('No gaps');
  });
});

// ─── Pipeline Runner + Hook Integration Tests ───────────────────

describe('runBatchPipeline with enrichment hook', () => {
  const writeTrackerJson = (filePath: string, batches: unknown[]) => {
    const dir = path.dirname(filePath);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify({
      version: '1.0', methodology: 'SPECMAP', created: '2026-02-19', updated: '2026-02-19',
      status: 'active',
      stats: { total_programs: 0, live_programs: 0, orphan_programs: 0, ecf_programs: 0, contracted: 0, enriched: 0, verified: 0, max_level: 0, last_computed: '' },
      batches,
      notes: [],
    }, null, 2), 'utf8');
  };

  const writeContractYaml = (filePath: string, contract: MigrationContract) => {
    const dir = path.dirname(filePath);
    fs.mkdirSync(dir, { recursive: true });
    const doc = {
      program: {
        id: contract.program.id, name: contract.program.name, complexity: contract.program.complexity,
        callers: contract.program.callers, callees: contract.program.callees,
        tasks_count: contract.program.tasksCount, tables_count: contract.program.tablesCount,
        expressions_count: contract.program.expressionsCount,
      },
      rules: contract.rules.map(r => ({
        id: r.id, description: r.description, condition: r.condition,
        variables: r.variables, status: r.status, target_file: r.targetFile, gap_notes: r.gapNotes,
      })),
      variables: contract.variables.map(v => ({
        local_id: v.localId, name: v.name, type: v.type,
        status: v.status, target_file: v.targetFile, gap_notes: v.gapNotes,
      })),
      tables: contract.tables.map(t => ({
        id: t.id, name: t.name, mode: t.mode,
        status: t.status, target_file: t.targetFile, gap_notes: t.gapNotes,
      })),
      callees: contract.callees.map(c => ({
        id: c.id, name: c.name, calls: c.calls, context: c.context,
        status: c.status, target: c.target, gap_notes: c.gapNotes,
      })),
      overall: {
        rules_total: contract.overall.rulesTotal, rules_impl: contract.overall.rulesImpl,
        rules_partial: contract.overall.rulesPartial, rules_missing: contract.overall.rulesMissing,
        rules_na: contract.overall.rulesNa, variables_key_count: contract.overall.variablesKeyCount,
        callees_total: contract.overall.calleesTotal, callees_impl: contract.overall.calleesImpl,
        callees_missing: contract.overall.calleesMissing, coverage_pct: contract.overall.coveragePct,
        status: contract.overall.status, generated: contract.overall.generated, notes: contract.overall.notes,
      },
    };
    fs.writeFileSync(filePath, YAML.stringify(doc), 'utf8');
  };

  it('should skip hook when enrichmentMode is manual', async () => {
    const dir = setup();
    const config: PipelineConfig = {
      projectDir: dir,
      migrationDir: path.join(dir, '.openspec', 'migration'),
      specDir: path.join(dir, '.openspec', 'specs'),
      codebaseDir: path.join(dir, 'adh-web', 'src'),
      contractSubDir: 'ADH',
      trackerFile: path.join(dir, '.openspec', 'migration', 'ADH', 'tracker.json'),
      autoContract: true, autoVerify: true, dryRun: false, generateReport: false,
      enrichmentMode: EnrichmentMode.MANUAL,
    };

    const contractsDir = path.join(config.migrationDir, 'ADH');
    writeTrackerJson(config.trackerFile, [{
      id: 'B1', name: 'Test', root: 200, programs: 1, status: 'contracted',
      stats: { backend_na: 0, frontend_enrich: 0, fully_impl: 0, coverage_avg_frontend: 0, total_partial: 0, total_missing: 0 },
      priority_order: [200],
    }]);

    const contract = makeContract();
    writeContractYaml(path.join(contractsDir, 'ADH-IDE-200.contract.yaml'), contract);

    const result = await runBatchPipeline('B1', config);
    expect(result.steps[0].action).toBe(PipelineAction.NEEDS_ENRICHMENT);
    expect(result.summary.claudeEnriched).toBe(0);
  });

  it('should report needs-enrichment in dry-run even with claude mode', async () => {
    const dir = setup();
    const config: PipelineConfig = {
      projectDir: dir,
      migrationDir: path.join(dir, '.openspec', 'migration'),
      specDir: path.join(dir, '.openspec', 'specs'),
      codebaseDir: path.join(dir, 'adh-web', 'src'),
      contractSubDir: 'ADH',
      trackerFile: path.join(dir, '.openspec', 'migration', 'ADH', 'tracker.json'),
      autoContract: true, autoVerify: true, dryRun: true, generateReport: false,
      enrichmentMode: EnrichmentMode.CLAUDE,
    };

    const contractsDir = path.join(config.migrationDir, 'ADH');
    writeTrackerJson(config.trackerFile, [{
      id: 'B1', name: 'Test', root: 200, programs: 1, status: 'contracted',
      stats: { backend_na: 0, frontend_enrich: 0, fully_impl: 0, coverage_avg_frontend: 0, total_partial: 0, total_missing: 0 },
      priority_order: [200],
    }]);

    const contract = makeContract();
    writeContractYaml(path.join(contractsDir, 'ADH-IDE-200.contract.yaml'), contract);

    const result = await runBatchPipeline('B1', config);
    // In dry-run, hook is not called → needs-enrichment
    expect(result.steps[0].action).toBe(PipelineAction.NEEDS_ENRICHMENT);
  });
});
