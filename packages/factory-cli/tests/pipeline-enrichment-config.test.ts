import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import YAML from 'yaml';
import { resolvePipelineConfig } from '../src/pipeline/pipeline-config.js';
import { EnrichmentMode, PipelineAction } from '../src/core/types.js';
import type { PipelineConfig, MigrationContract, Tracker } from '../src/core/types.js';
import { createManualEnrichmentHook, createClaudeEnrichmentHook } from '../src/pipeline/enrichment-hook.js';
import { runBatchPipeline } from '../src/pipeline/pipeline-runner.js';

// ─── Test Helpers (from pipeline-runner.test.ts) ────────────────

const createTestDir = (): string => fs.mkdtempSync(path.join(os.tmpdir(), 'mf-enrich-'));

const createConfig = (baseDir: string, overrides?: Partial<PipelineConfig>): PipelineConfig => ({
  projectDir: baseDir,
  migrationDir: path.join(baseDir, '.openspec', 'migration'),
  specDir: path.join(baseDir, '.openspec', 'specs'),
  codebaseDir: path.join(baseDir, 'adh-web', 'src'),
  contractSubDir: 'ADH',
  trackerFile: path.join(baseDir, '.openspec', 'migration', 'ADH', 'tracker.json'),
  autoContract: true,
  autoVerify: true,
  dryRun: false,
  generateReport: false,
  enrichmentMode: EnrichmentMode.MANUAL,
  ...overrides,
});

const writeTrackerJson = (filePath: string, tracker: { batches: Array<{
  id: string; name: string; root: number; programs: number; status: string;
  stats: { backendNa: number; frontendEnrich: number; fullyImpl: number; coverageAvgFrontend: number; totalPartial: number; totalMissing: number };
  priorityOrder: number[];
}> }): void => {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
  const doc = {
    version: '1.0', methodology: 'SPECMAP', created: '2026-02-19', updated: '2026-02-19', status: 'active',
    stats: { total_programs: 0, live_programs: 0, orphan_programs: 0, ecf_programs: 0, contracted: 0, enriched: 0, verified: 0, max_level: 0, last_computed: '' },
    batches: tracker.batches.map(b => ({
      id: b.id, name: b.name, root: b.root, programs: b.programs, status: b.status,
      stats: { backend_na: 0, frontend_enrich: 0, fully_impl: 0, coverage_avg_frontend: 0, total_partial: 0, total_missing: 0 },
      priority_order: b.priorityOrder,
    })),
    notes: [],
  };
  fs.writeFileSync(filePath, JSON.stringify(doc, null, 2), 'utf8');
};

const writeContractYaml = (filePath: string, contract: Partial<MigrationContract>): void => {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
  const doc = {
    program: {
      id: contract.program?.id ?? 1, name: contract.program?.name ?? 'Test',
      complexity: contract.program?.complexity ?? 'MEDIUM',
      callers: contract.program?.callers ?? [], callees: contract.program?.callees ?? [],
      tasks_count: contract.program?.tasksCount ?? 0, tables_count: contract.program?.tablesCount ?? 0,
      expressions_count: contract.program?.expressionsCount ?? 0,
    },
    rules: (contract.rules ?? []).map(r => ({
      id: r.id, description: r.description, condition: r.condition,
      variables: r.variables, status: r.status, target_file: r.targetFile, gap_notes: r.gapNotes,
    })),
    variables: (contract.variables ?? []).map(v => ({
      local_id: v.localId, name: v.name, type: v.type,
      status: v.status, target_file: v.targetFile, gap_notes: v.gapNotes,
    })),
    tables: (contract.tables ?? []).map(t => ({
      id: t.id, name: t.name, mode: t.mode,
      status: t.status, target_file: t.targetFile, gap_notes: t.gapNotes,
    })),
    callees: (contract.callees ?? []).map(c => ({
      id: c.id, name: c.name, calls: c.calls, context: c.context,
      status: c.status, target: c.target, gap_notes: c.gapNotes,
    })),
    overall: {
      rules_total: contract.overall?.rulesTotal ?? 0, rules_impl: contract.overall?.rulesImpl ?? 0,
      rules_partial: contract.overall?.rulesPartial ?? 0, rules_missing: contract.overall?.rulesMissing ?? 0,
      rules_na: contract.overall?.rulesNa ?? 0, variables_key_count: contract.overall?.variablesKeyCount ?? 0,
      callees_total: contract.overall?.calleesTotal ?? 0, callees_impl: contract.overall?.calleesImpl ?? 0,
      callees_missing: contract.overall?.calleesMissing ?? 0,
      coverage_pct: contract.overall?.coveragePct ?? 0, status: contract.overall?.status ?? 'pending',
      generated: contract.overall?.generated ?? '2026-02-19T00:00:00Z', notes: contract.overall?.notes ?? '',
    },
  };
  fs.writeFileSync(filePath, YAML.stringify(doc), 'utf8');
};

const writeSpecFile = (dir: string, programId: number): void => {
  fs.mkdirSync(dir, { recursive: true });
  const content = `# Specification: ADH IDE ${programId}

> **Analyse**: 2026-02-19 10:00 → 10:20

## Onglet 1 : Fonctionnel

### 1.1 Objectif
Test program ${programId}

## Onglet 2 : Technique

### 2.1 Tables
| Table | Nom | Mode |
|-------|-----|------|
| 100 | test_table | R |

### 2.2 Parametres
Aucun.

### 2.3 Regles metier
| ID | Description | Condition |
|----|-------------|-----------|
| RULE_001 | Test rule | Always |

## Onglet 3 : Cartographie

### 3.1 Chaine depuis Main
Main → ${programId}
`;
  fs.writeFileSync(path.join(dir, `ADH-IDE-${programId}.md`), content, 'utf8');
};

// ─── Cleanup ─────────────────────────────────────────────────────

let testDirs: string[] = [];
beforeEach(() => { testDirs = []; });
afterEach(() => {
  for (const dir of testDirs) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
  vi.restoreAllMocks();
});

const setup = () => {
  const dir = createTestDir();
  testDirs.push(dir);
  return dir;
};

// ─── resolvePipelineConfig: enrichment mode mapping ─────────────

describe('resolvePipelineConfig enrichment modes', () => {
  const createProjectDir = (): string => {
    const dir = createTestDir();
    testDirs.push(dir);
    const migDir = path.join(dir, '.openspec', 'migration');
    fs.mkdirSync(migDir, { recursive: true });
    return dir;
  };

  it('should map enrich=undefined to MANUAL', () => {
    const projectDir = createProjectDir();
    const config = resolvePipelineConfig({ projectDir });
    expect(config.enrichmentMode).toBe(EnrichmentMode.MANUAL);
  });

  it('should map enrich="none" to MANUAL', () => {
    const projectDir = createProjectDir();
    const config = resolvePipelineConfig({ projectDir, enrich: 'none' });
    expect(config.enrichmentMode).toBe(EnrichmentMode.MANUAL);
  });

  it('should map enrich="heuristic" to MANUAL', () => {
    const projectDir = createProjectDir();
    const config = resolvePipelineConfig({ projectDir, enrich: 'heuristic' });
    expect(config.enrichmentMode).toBe(EnrichmentMode.MANUAL);
  });

  it('should map enrich="claude" to CLAUDE', () => {
    const projectDir = createProjectDir();
    const config = resolvePipelineConfig({ projectDir, enrich: 'claude' });
    expect(config.enrichmentMode).toBe(EnrichmentMode.CLAUDE);
  });

  it('should map enrich="claude-cli" to CLAUDE', () => {
    const projectDir = createProjectDir();
    const config = resolvePipelineConfig({ projectDir, enrich: 'claude-cli' });
    expect(config.enrichmentMode).toBe(EnrichmentMode.CLAUDE);
  });

  it('should map enrich="claude-bedrock" to CLAUDE', () => {
    const projectDir = createProjectDir();
    const config = resolvePipelineConfig({ projectDir, enrich: 'claude-bedrock' });
    expect(config.enrichmentMode).toBe(EnrichmentMode.CLAUDE);
  });

  it('should map unknown enrich value to MANUAL', () => {
    const projectDir = createProjectDir();
    const config = resolvePipelineConfig({ projectDir, enrich: 'random-garbage' });
    expect(config.enrichmentMode).toBe(EnrichmentMode.MANUAL);
  });

  it('should map empty string to MANUAL', () => {
    const projectDir = createProjectDir();
    const config = resolvePipelineConfig({ projectDir, enrich: '' });
    expect(config.enrichmentMode).toBe(EnrichmentMode.MANUAL);
  });
});

// ─── Enrichment Hook Resolution ──────────────────────────────────

describe('enrichment hook resolution', () => {
  it('should create manual hook that always returns canEnrich=false', () => {
    const hook = createManualEnrichmentHook();
    expect(hook.name).toBe('manual');
    const canEnrich = hook.canEnrich({ contract: {} as MigrationContract, specFile: '/tmp/nonexistent', codebaseDir: '/tmp' });
    expect(canEnrich).toBe(false);
  });

  it('should create claude hook that checks for API key', () => {
    const hook = createClaudeEnrichmentHook();
    expect(hook.name).toBe('claude-api');
  });

  it('should return canEnrich=false when ANTHROPIC_API_KEY is not set and no spec', () => {
    const originalKey = process.env.ANTHROPIC_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;
    try {
      const hook = createClaudeEnrichmentHook();
      const canEnrich = hook.canEnrich({
        contract: {} as MigrationContract,
        specFile: '/tmp/nonexistent-spec-file.md',
        codebaseDir: '/tmp',
      });
      expect(canEnrich).toBe(false);
    } finally {
      if (originalKey !== undefined) process.env.ANTHROPIC_API_KEY = originalKey;
    }
  });

  it('should return canEnrich=false when spec file is missing even with API key', () => {
    const originalKey = process.env.ANTHROPIC_API_KEY;
    process.env.ANTHROPIC_API_KEY = 'test-key-for-testing';
    try {
      const hook = createClaudeEnrichmentHook();
      const canEnrich = hook.canEnrich({
        contract: {} as MigrationContract,
        specFile: '/tmp/nonexistent-spec-file-12345.md',
        codebaseDir: '/tmp',
      });
      expect(canEnrich).toBe(false);
    } finally {
      if (originalKey !== undefined) {
        process.env.ANTHROPIC_API_KEY = originalKey;
      } else {
        delete process.env.ANTHROPIC_API_KEY;
      }
    }
  });

  it('should return canEnrich=true when API key is set and spec file exists', () => {
    const dir = setup();
    const specFile = path.join(dir, 'test-spec.md');
    fs.writeFileSync(specFile, '# Test spec', 'utf8');

    const originalKey = process.env.ANTHROPIC_API_KEY;
    process.env.ANTHROPIC_API_KEY = 'test-key-for-testing';
    try {
      const hook = createClaudeEnrichmentHook();
      const canEnrich = hook.canEnrich({
        contract: {} as MigrationContract,
        specFile,
        codebaseDir: dir,
      });
      expect(canEnrich).toBe(true);
    } finally {
      if (originalKey !== undefined) {
        process.env.ANTHROPIC_API_KEY = originalKey;
      } else {
        delete process.env.ANTHROPIC_API_KEY;
      }
    }
  });
});

// ─── Pipeline diagnostic messages ────────────────────────────────

describe('pipeline enrichment diagnostic messages', () => {
  it('should include reason in message when enrichment mode is MANUAL with gaps', async () => {
    const dir = setup();
    const config = createConfig(dir, { enrichmentMode: EnrichmentMode.MANUAL });
    const contractsDir = path.join(config.migrationDir, 'ADH');
    writeTrackerJson(config.trackerFile, {
      batches: [{
        id: 'B1', name: 'Test', root: 200, programs: 1, status: 'contracted',
        stats: { backendNa: 0, frontendEnrich: 0, fullyImpl: 0, coverageAvgFrontend: 0, totalPartial: 0, totalMissing: 0 },
        priorityOrder: [200],
      }],
    });
    writeContractYaml(path.join(contractsDir, 'ADH-IDE-200.contract.yaml'), {
      program: { id: 200, name: 'GapProg', complexity: 'MEDIUM', callers: [], callees: [], tasksCount: 1, tablesCount: 0, expressionsCount: 5 },
      rules: [
        { id: 'R1', description: 'done', condition: '', variables: [], status: 'IMPL', targetFile: '', gapNotes: '' },
        { id: 'R2', description: 'gap', condition: '', variables: [], status: 'MISSING', targetFile: '', gapNotes: '' },
      ],
      variables: [],
      tables: [],
      callees: [],
      overall: { rulesTotal: 2, rulesImpl: 1, rulesPartial: 0, rulesMissing: 1, rulesNa: 0, variablesKeyCount: 0, calleesTotal: 0, calleesImpl: 0, calleesMissing: 0, coveragePct: 50, status: 'contracted', generated: '', notes: '' },
    });

    const result = await runBatchPipeline('B1', config);
    expect(result.steps[0].action).toBe(PipelineAction.NEEDS_ENRICHMENT);
    expect(result.steps[0].message).toContain('enrichment mode: manual');
  });

  it('should include reason in message when enrichment mode is CLAUDE but no API key', async () => {
    const originalKey = process.env.ANTHROPIC_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;

    try {
      const dir = setup();
      const config = createConfig(dir, { enrichmentMode: EnrichmentMode.CLAUDE });
      const contractsDir = path.join(config.migrationDir, 'ADH');
      writeTrackerJson(config.trackerFile, {
        batches: [{
          id: 'B1', name: 'Test', root: 200, programs: 1, status: 'contracted',
          stats: { backendNa: 0, frontendEnrich: 0, fullyImpl: 0, coverageAvgFrontend: 0, totalPartial: 0, totalMissing: 0 },
          priorityOrder: [200],
        }],
      });
      writeSpecFile(config.specDir, 200);
      writeContractYaml(path.join(contractsDir, 'ADH-IDE-200.contract.yaml'), {
        program: { id: 200, name: 'NeedsKey', complexity: 'MEDIUM', callers: [], callees: [], tasksCount: 1, tablesCount: 0, expressionsCount: 5 },
        rules: [
          { id: 'R1', description: 'done', condition: '', variables: [], status: 'IMPL', targetFile: '', gapNotes: '' },
          { id: 'R2', description: 'gap', condition: '', variables: [], status: 'MISSING', targetFile: '', gapNotes: '' },
        ],
        variables: [],
        tables: [],
        callees: [],
        overall: { rulesTotal: 2, rulesImpl: 1, rulesPartial: 0, rulesMissing: 1, rulesNa: 0, variablesKeyCount: 0, calleesTotal: 0, calleesImpl: 0, calleesMissing: 0, coveragePct: 50, status: 'contracted', generated: '', notes: '' },
      });

      const result = await runBatchPipeline('B1', config);
      expect(result.steps[0].action).toBe(PipelineAction.NEEDS_ENRICHMENT);
      expect(result.steps[0].message).toContain('ANTHROPIC_API_KEY not set');
    } finally {
      if (originalKey !== undefined) {
        process.env.ANTHROPIC_API_KEY = originalKey;
      }
    }
  });

  it('should include reason in message when in dry-run mode with CLAUDE enrichment', async () => {
    const dir = setup();
    const config = createConfig(dir, { enrichmentMode: EnrichmentMode.CLAUDE, dryRun: true });
    const contractsDir = path.join(config.migrationDir, 'ADH');
    writeTrackerJson(config.trackerFile, {
      batches: [{
        id: 'B1', name: 'Test', root: 200, programs: 1, status: 'contracted',
        stats: { backendNa: 0, frontendEnrich: 0, fullyImpl: 0, coverageAvgFrontend: 0, totalPartial: 0, totalMissing: 0 },
        priorityOrder: [200],
      }],
    });
    writeContractYaml(path.join(contractsDir, 'ADH-IDE-200.contract.yaml'), {
      program: { id: 200, name: 'DryTest', complexity: 'LOW', callers: [], callees: [], tasksCount: 1, tablesCount: 0, expressionsCount: 5 },
      rules: [
        { id: 'R1', description: 'gap', condition: '', variables: [], status: 'MISSING', targetFile: '', gapNotes: '' },
      ],
      variables: [],
      tables: [],
      callees: [],
      overall: { rulesTotal: 1, rulesImpl: 0, rulesPartial: 0, rulesMissing: 1, rulesNa: 0, variablesKeyCount: 0, calleesTotal: 0, calleesImpl: 0, calleesMissing: 0, coveragePct: 0, status: 'contracted', generated: '', notes: '' },
    });

    const result = await runBatchPipeline('B1', config);
    expect(result.steps[0].action).toBe(PipelineAction.NEEDS_ENRICHMENT);
    expect(result.steps[0].message).toContain('dry-run mode');
  });

  it('should report spec-missing reason when CLAUDE mode but spec file absent', async () => {
    const originalKey = process.env.ANTHROPIC_API_KEY;
    process.env.ANTHROPIC_API_KEY = 'test-key-for-testing';

    try {
      const dir = setup();
      const config = createConfig(dir, { enrichmentMode: EnrichmentMode.CLAUDE });
      const contractsDir = path.join(config.migrationDir, 'ADH');
      writeTrackerJson(config.trackerFile, {
        batches: [{
          id: 'B1', name: 'Test', root: 200, programs: 1, status: 'contracted',
          stats: { backendNa: 0, frontendEnrich: 0, fullyImpl: 0, coverageAvgFrontend: 0, totalPartial: 0, totalMissing: 0 },
          priorityOrder: [200],
        }],
      });
      // NO spec file written - this should trigger "spec file missing"
      writeContractYaml(path.join(contractsDir, 'ADH-IDE-200.contract.yaml'), {
        program: { id: 200, name: 'NoSpec', complexity: 'MEDIUM', callers: [], callees: [], tasksCount: 1, tablesCount: 0, expressionsCount: 5 },
        rules: [
          { id: 'R1', description: 'gap', condition: '', variables: [], status: 'MISSING', targetFile: '', gapNotes: '' },
        ],
        variables: [],
        tables: [],
        callees: [],
        overall: { rulesTotal: 1, rulesImpl: 0, rulesPartial: 0, rulesMissing: 1, rulesNa: 0, variablesKeyCount: 0, calleesTotal: 0, calleesImpl: 0, calleesMissing: 0, coveragePct: 0, status: 'contracted', generated: '', notes: '' },
      });

      const result = await runBatchPipeline('B1', config);
      expect(result.steps[0].action).toBe(PipelineAction.NEEDS_ENRICHMENT);
      expect(result.steps[0].message).toContain('spec file missing');
    } finally {
      if (originalKey !== undefined) {
        process.env.ANTHROPIC_API_KEY = originalKey;
      } else {
        delete process.env.ANTHROPIC_API_KEY;
      }
    }
  });
});

// ─── Events validation ──────────────────────────────────────────

describe('pipeline enrichment events', () => {
  it('should emit PROGRAM_NEEDS_ENRICHMENT event with reason in data', async () => {
    const dir = setup();
    const config = createConfig(dir, { enrichmentMode: EnrichmentMode.MANUAL });
    const contractsDir = path.join(config.migrationDir, 'ADH');
    writeTrackerJson(config.trackerFile, {
      batches: [{
        id: 'B1', name: 'Test', root: 200, programs: 1, status: 'contracted',
        stats: { backendNa: 0, frontendEnrich: 0, fullyImpl: 0, coverageAvgFrontend: 0, totalPartial: 0, totalMissing: 0 },
        priorityOrder: [200],
      }],
    });
    writeContractYaml(path.join(contractsDir, 'ADH-IDE-200.contract.yaml'), {
      program: { id: 200, name: 'EventTest', complexity: 'LOW', callers: [], callees: [], tasksCount: 1, tablesCount: 0, expressionsCount: 5 },
      rules: [
        { id: 'R1', description: 'gap', condition: '', variables: [], status: 'MISSING', targetFile: '', gapNotes: '' },
      ],
      variables: [],
      tables: [],
      callees: [],
      overall: { rulesTotal: 1, rulesImpl: 0, rulesPartial: 0, rulesMissing: 1, rulesNa: 0, variablesKeyCount: 0, calleesTotal: 0, calleesImpl: 0, calleesMissing: 0, coveragePct: 0, status: 'contracted', generated: '', notes: '' },
    });

    const result = await runBatchPipeline('B1', config);
    const enrichEvents = result.events.filter(e => e.type === 'program_needs_enrichment');
    expect(enrichEvents.length).toBeGreaterThan(0);
    expect(enrichEvents[0].message).toContain('enrichment mode: manual');
  });

  it('should emit pipeline_started and pipeline_completed events', async () => {
    const dir = setup();
    const config = createConfig(dir);
    writeTrackerJson(config.trackerFile, {
      batches: [{
        id: 'B1', name: 'Test', root: 100, programs: 1, status: 'pending',
        stats: { backendNa: 0, frontendEnrich: 0, fullyImpl: 0, coverageAvgFrontend: 0, totalPartial: 0, totalMissing: 0 },
        priorityOrder: [100],
      }],
    });
    writeSpecFile(config.specDir, 100);
    fs.mkdirSync(config.codebaseDir, { recursive: true });

    const result = await runBatchPipeline('B1', config);
    const types = result.events.map(e => e.type);
    expect(types).toContain('pipeline_started');
    expect(types).toContain('pipeline_completed');
  });
});

// ─── All dropdown values end-to-end ─────────────────────────────

describe('dropdown values end-to-end mapping', () => {
  const ALL_DROPDOWN_VALUES = [
    { value: 'none', expectedMode: EnrichmentMode.MANUAL },
    { value: 'heuristic', expectedMode: EnrichmentMode.MANUAL },
    { value: 'claude', expectedMode: EnrichmentMode.CLAUDE },
    { value: 'claude-cli', expectedMode: EnrichmentMode.CLAUDE },
    { value: 'claude-bedrock', expectedMode: EnrichmentMode.CLAUDE },
  ];

  for (const { value, expectedMode } of ALL_DROPDOWN_VALUES) {
    it(`should correctly handle enrich="${value}" from dropdown`, () => {
      const dir = createTestDir();
      testDirs.push(dir);
      const migDir = path.join(dir, '.openspec', 'migration');
      fs.mkdirSync(migDir, { recursive: true });

      const config = resolvePipelineConfig({ projectDir: dir, enrich: value });
      expect(config.enrichmentMode).toBe(expectedMode);
    });
  }
});
