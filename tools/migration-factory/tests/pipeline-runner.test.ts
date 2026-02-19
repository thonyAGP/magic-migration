import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import YAML from 'yaml';
import { preflightBatch, runBatchPipeline, getBatchesStatus } from '../src/pipeline/pipeline-runner.js';
import type { PipelineConfig, MigrationContract, Tracker } from '../src/core/types.js';
import { PipelineAction, EnrichmentMode } from '../src/core/types.js';

// ─── Test Helpers ────────────────────────────────────────────────

const createTestDir = (): string => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mf-test-'));
  return dir;
};

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

const writeTrackerJson = (filePath: string, tracker: Partial<Tracker> & { batches: Tracker['batches'] }): void => {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
  const doc = {
    version: '1.0',
    methodology: 'SPECMAP',
    created: '2026-02-19',
    updated: '2026-02-19',
    status: 'active',
    stats: {
      total_programs: 0,
      live_programs: 0,
      orphan_programs: 0,
      ecf_programs: 0,
      contracted: 0,
      enriched: 0,
      verified: 0,
      max_level: 0,
      last_computed: '',
    },
    batches: tracker.batches.map(b => ({
      id: b.id,
      name: b.name,
      root: b.root,
      programs: b.programs,
      status: b.status,
      stats: {
        backend_na: 0, frontend_enrich: 0, fully_impl: 0,
        coverage_avg_frontend: 0, total_partial: 0, total_missing: 0,
      },
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
      id: contract.program?.id ?? 1,
      name: contract.program?.name ?? 'Test',
      complexity: contract.program?.complexity ?? 'MEDIUM',
      callers: contract.program?.callers ?? [],
      callees: contract.program?.callees ?? [],
      tasks_count: contract.program?.tasksCount ?? 0,
      tables_count: contract.program?.tablesCount ?? 0,
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
      rules_total: contract.overall?.rulesTotal ?? 0,
      rules_impl: contract.overall?.rulesImpl ?? 0,
      rules_partial: contract.overall?.rulesPartial ?? 0,
      rules_missing: contract.overall?.rulesMissing ?? 0,
      rules_na: contract.overall?.rulesNa ?? 0,
      variables_key_count: contract.overall?.variablesKeyCount ?? 0,
      callees_total: contract.overall?.calleesTotal ?? 0,
      callees_impl: contract.overall?.calleesImpl ?? 0,
      callees_missing: contract.overall?.calleesMissing ?? 0,
      coverage_pct: contract.overall?.coveragePct ?? 0,
      status: contract.overall?.status ?? 'pending',
      generated: contract.overall?.generated ?? '2026-02-19T00:00:00Z',
      notes: contract.overall?.notes ?? '',
    },
  };
  fs.writeFileSync(filePath, YAML.stringify(doc), 'utf8');
};

const writeSpecFile = (dir: string, programId: number): void => {
  fs.mkdirSync(dir, { recursive: true });
  // Write a minimal spec file that the spec parser can handle
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
});

const setup = () => {
  const dir = createTestDir();
  testDirs.push(dir);
  return dir;
};

// ─── Preflight Tests ─────────────────────────────────────────────

describe('preflightBatch', () => {
  it('should fail when tracker does not exist', () => {
    const dir = setup();
    const config = createConfig(dir);
    const result = preflightBatch('B1', config);

    expect(result.checks[0].passed).toBe(false);
    expect(result.programs).toHaveLength(0);
  });

  it('should fail when batch not found in tracker', () => {
    const dir = setup();
    const config = createConfig(dir);
    writeTrackerJson(config.trackerFile, { batches: [] });

    const result = preflightBatch('B99', config);
    expect(result.checks.some(c => !c.passed && c.check === 'Batch found')).toBe(true);
  });

  it('should detect spec-missing for programs without specs', () => {
    const dir = setup();
    const config = createConfig(dir);
    writeTrackerJson(config.trackerFile, {
      batches: [{
        id: 'B1', name: 'Test Batch', root: 100, programs: 1,
        status: 'pending',
        stats: { backendNa: 0, frontendEnrich: 0, fullyImpl: 0, coverageAvgFrontend: 0, totalPartial: 0, totalMissing: 0 },
        priorityOrder: [100],
      }],
    });

    const result = preflightBatch('B1', config);
    expect(result.programs[0].action).toBe('spec-missing');
    expect(result.summary.blocked).toBe(1);
  });

  it('should predict will-contract for programs with specs but no contract', () => {
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

    const result = preflightBatch('B1', config);
    expect(result.programs[0].action).toBe('will-contract');
    expect(result.summary.willContract).toBe(1);
  });

  it('should predict already-verified for verified contracts', () => {
    const dir = setup();
    const config = createConfig(dir);
    const contractsDir = path.join(config.migrationDir, 'ADH');
    writeTrackerJson(config.trackerFile, {
      batches: [{
        id: 'B1', name: 'Test', root: 100, programs: 1, status: 'verified',
        stats: { backendNa: 0, frontendEnrich: 0, fullyImpl: 0, coverageAvgFrontend: 0, totalPartial: 0, totalMissing: 0 },
        priorityOrder: [100],
      }],
    });
    writeContractYaml(path.join(contractsDir, 'ADH-IDE-100.contract.yaml'), {
      program: { id: 100, name: 'Test', complexity: 'LOW', callers: [], callees: [], tasksCount: 1, tablesCount: 1, expressionsCount: 5 },
      rules: [{ id: 'R1', description: 'test', condition: '', variables: [], status: 'IMPL', targetFile: '', gapNotes: '' }],
      variables: [],
      tables: [],
      callees: [],
      overall: { rulesTotal: 1, rulesImpl: 1, rulesPartial: 0, rulesMissing: 0, rulesNa: 0, variablesKeyCount: 0, calleesTotal: 0, calleesImpl: 0, calleesMissing: 0, coveragePct: 100, status: 'verified', generated: '', notes: '' },
    });

    const result = preflightBatch('B1', config);
    expect(result.programs[0].action).toBe('already-verified');
    expect(result.summary.alreadyDone).toBe(1);
  });

  it('should predict needs-enrichment for contracted programs with gaps', () => {
    const dir = setup();
    const config = createConfig(dir);
    const contractsDir = path.join(config.migrationDir, 'ADH');
    writeTrackerJson(config.trackerFile, {
      batches: [{
        id: 'B1', name: 'Test', root: 200, programs: 1, status: 'contracted',
        stats: { backendNa: 0, frontendEnrich: 0, fullyImpl: 0, coverageAvgFrontend: 0, totalPartial: 0, totalMissing: 0 },
        priorityOrder: [200],
      }],
    });
    writeContractYaml(path.join(contractsDir, 'ADH-IDE-200.contract.yaml'), {
      program: { id: 200, name: 'WithGaps', complexity: 'MEDIUM', callers: [], callees: [], tasksCount: 3, tablesCount: 2, expressionsCount: 10 },
      rules: [
        { id: 'R1', description: 'done', condition: '', variables: [], status: 'IMPL', targetFile: '', gapNotes: '' },
        { id: 'R2', description: 'missing', condition: '', variables: [], status: 'MISSING', targetFile: '', gapNotes: '' },
      ],
      variables: [],
      tables: [],
      callees: [],
      overall: { rulesTotal: 2, rulesImpl: 1, rulesPartial: 0, rulesMissing: 1, rulesNa: 0, variablesKeyCount: 0, calleesTotal: 0, calleesImpl: 0, calleesMissing: 0, coveragePct: 50, status: 'contracted', generated: '', notes: '' },
    });

    const result = preflightBatch('B1', config);
    expect(result.programs[0].action).toBe('needs-enrichment');
    expect(result.programs[0].gaps).toBe(1);
  });
});

// ─── Run (dry-run) Tests ─────────────────────────────────────────

describe('runBatchPipeline (dry-run)', () => {
  it('should not write files in dry-run mode', async () => {
    const dir = setup();
    const config = createConfig(dir, { dryRun: true });
    writeTrackerJson(config.trackerFile, {
      batches: [{
        id: 'B1', name: 'Test', root: 100, programs: 1, status: 'pending',
        stats: { backendNa: 0, frontendEnrich: 0, fullyImpl: 0, coverageAvgFrontend: 0, totalPartial: 0, totalMissing: 0 },
        priorityOrder: [100],
      }],
    });
    writeSpecFile(config.specDir, 100);

    const result = await runBatchPipeline('B1', config);
    expect(result.dryRun).toBe(true);

    // No contract file should be written
    const contractsDir = path.join(config.migrationDir, 'ADH');
    const contractFiles = fs.existsSync(contractsDir)
      ? fs.readdirSync(contractsDir).filter(f => f.endsWith('.contract.yaml'))
      : [];
    expect(contractFiles).toHaveLength(0);
  });

  it('should return predicted actions in dry-run', async () => {
    const dir = setup();
    const config = createConfig(dir, { dryRun: true });
    writeTrackerJson(config.trackerFile, {
      batches: [{
        id: 'B1', name: 'Test', root: 100, programs: 1, status: 'pending',
        stats: { backendNa: 0, frontendEnrich: 0, fullyImpl: 0, coverageAvgFrontend: 0, totalPartial: 0, totalMissing: 0 },
        priorityOrder: [100],
      }],
    });
    writeSpecFile(config.specDir, 100);

    const result = await runBatchPipeline('B1', config);
    // Program should be contracted (or auto-enriched+verified depending on spec content)
    expect(result.steps).toHaveLength(1);
    expect(result.summary.total).toBe(1);
  });

  it('should emit correct events in dry-run', async () => {
    const dir = setup();
    const config = createConfig(dir, { dryRun: true });
    writeTrackerJson(config.trackerFile, {
      batches: [{
        id: 'B1', name: 'Test', root: 100, programs: 1, status: 'pending',
        stats: { backendNa: 0, frontendEnrich: 0, fullyImpl: 0, coverageAvgFrontend: 0, totalPartial: 0, totalMissing: 0 },
        priorityOrder: [100],
      }],
    });
    writeSpecFile(config.specDir, 100);

    const result = await runBatchPipeline('B1', config);
    const eventTypes = result.events.map(e => e.type);
    expect(eventTypes).toContain('pipeline_started');
    expect(eventTypes).toContain('pipeline_completed');
  });
});

// ─── Run (live) Tests ────────────────────────────────────────────

describe('runBatchPipeline (live)', () => {
  it('should auto-contract programs without contract when spec exists', async () => {
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
    // Create codebase dir so scanner can run
    fs.mkdirSync(config.codebaseDir, { recursive: true });

    const result = await runBatchPipeline('B1', config);
    expect(result.steps).toHaveLength(1);

    // Contract file should be created
    const contractsDir = path.join(config.migrationDir, 'ADH');
    const files = fs.readdirSync(contractsDir).filter(f => f.endsWith('.contract.yaml'));
    expect(files.length).toBeGreaterThan(0);
  });

  it('should skip program when spec is missing', async () => {
    const dir = setup();
    const config = createConfig(dir);
    writeTrackerJson(config.trackerFile, {
      batches: [{
        id: 'B1', name: 'Test', root: 100, programs: 1, status: 'pending',
        stats: { backendNa: 0, frontendEnrich: 0, fullyImpl: 0, coverageAvgFrontend: 0, totalPartial: 0, totalMissing: 0 },
        priorityOrder: [100],
      }],
    });
    // No spec file written

    const result = await runBatchPipeline('B1', config);
    expect(result.steps[0].action).toBe(PipelineAction.SPEC_MISSING);
    expect(result.summary.specsMissing).toBe(1);
  });

  it('should auto-verify enriched program with no gaps', async () => {
    const dir = setup();
    const config = createConfig(dir);
    const contractsDir = path.join(config.migrationDir, 'ADH');
    writeTrackerJson(config.trackerFile, {
      batches: [{
        id: 'B1', name: 'Test', root: 100, programs: 1, status: 'enriched',
        stats: { backendNa: 0, frontendEnrich: 0, fullyImpl: 0, coverageAvgFrontend: 0, totalPartial: 0, totalMissing: 0 },
        priorityOrder: [100],
      }],
    });
    writeContractYaml(path.join(contractsDir, 'ADH-IDE-100.contract.yaml'), {
      program: { id: 100, name: 'NoGaps', complexity: 'LOW', callers: [], callees: [], tasksCount: 1, tablesCount: 0, expressionsCount: 5 },
      rules: [{ id: 'R1', description: 'done', condition: '', variables: [], status: 'IMPL', targetFile: '', gapNotes: '' }],
      variables: [],
      tables: [{ id: 50, name: 'test', mode: 'R', status: 'N/A', targetFile: '', gapNotes: '' }],
      callees: [],
      overall: { rulesTotal: 1, rulesImpl: 1, rulesPartial: 0, rulesMissing: 0, rulesNa: 0, variablesKeyCount: 0, calleesTotal: 0, calleesImpl: 0, calleesMissing: 0, coveragePct: 100, status: 'enriched', generated: '', notes: '' },
    });

    const result = await runBatchPipeline('B1', config);
    expect(result.steps[0].action).toBe(PipelineAction.VERIFIED);
    expect(result.steps[0].newStatus).toBe('verified');
    expect(result.summary.verified).toBe(1);
  });

  it('should report needs-enrichment for contracted programs with gaps', async () => {
    const dir = setup();
    const config = createConfig(dir);
    const contractsDir = path.join(config.migrationDir, 'ADH');
    writeTrackerJson(config.trackerFile, {
      batches: [{
        id: 'B1', name: 'Test', root: 200, programs: 1, status: 'contracted',
        stats: { backendNa: 0, frontendEnrich: 0, fullyImpl: 0, coverageAvgFrontend: 0, totalPartial: 0, totalMissing: 0 },
        priorityOrder: [200],
      }],
    });
    writeContractYaml(path.join(contractsDir, 'ADH-IDE-200.contract.yaml'), {
      program: { id: 200, name: 'WithGaps', complexity: 'MEDIUM', callers: [], callees: [], tasksCount: 3, tablesCount: 2, expressionsCount: 10 },
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
    expect(result.steps[0].gaps).toBe(1);
  });

  it('should update tracker stats after run', async () => {
    const dir = setup();
    const config = createConfig(dir);
    const contractsDir = path.join(config.migrationDir, 'ADH');
    writeTrackerJson(config.trackerFile, {
      batches: [{
        id: 'B1', name: 'Test', root: 100, programs: 1, status: 'enriched',
        stats: { backendNa: 0, frontendEnrich: 0, fullyImpl: 0, coverageAvgFrontend: 0, totalPartial: 0, totalMissing: 0 },
        priorityOrder: [100],
      }],
    });
    writeContractYaml(path.join(contractsDir, 'ADH-IDE-100.contract.yaml'), {
      program: { id: 100, name: 'Test', complexity: 'LOW', callers: [], callees: [], tasksCount: 1, tablesCount: 0, expressionsCount: 5 },
      rules: [{ id: 'R1', description: 'done', condition: '', variables: [], status: 'IMPL', targetFile: '', gapNotes: '' }],
      variables: [],
      tables: [],
      callees: [],
      overall: { rulesTotal: 1, rulesImpl: 1, rulesPartial: 0, rulesMissing: 0, rulesNa: 0, variablesKeyCount: 0, calleesTotal: 0, calleesImpl: 0, calleesMissing: 0, coveragePct: 100, status: 'enriched', generated: '', notes: '' },
    });

    await runBatchPipeline('B1', config);

    // Re-read tracker
    const raw = JSON.parse(fs.readFileSync(config.trackerFile, 'utf8'));
    expect(raw.stats.verified).toBeGreaterThanOrEqual(1);
  });

  it('should handle batch-not-found gracefully', async () => {
    const dir = setup();
    const config = createConfig(dir);
    writeTrackerJson(config.trackerFile, { batches: [] });

    const result = await runBatchPipeline('B99', config);
    expect(result.steps).toHaveLength(0);
    expect(result.events.some(e => e.type === 'error')).toBe(true);
  });

  it('should respect --no-contract flag', async () => {
    const dir = setup();
    const config = createConfig(dir, { autoContract: false });
    writeTrackerJson(config.trackerFile, {
      batches: [{
        id: 'B1', name: 'Test', root: 100, programs: 1, status: 'pending',
        stats: { backendNa: 0, frontendEnrich: 0, fullyImpl: 0, coverageAvgFrontend: 0, totalPartial: 0, totalMissing: 0 },
        priorityOrder: [100],
      }],
    });
    writeSpecFile(config.specDir, 100);

    const result = await runBatchPipeline('B1', config);
    expect(result.steps[0].action).toBe(PipelineAction.SKIPPED);
  });

  it('should respect --no-verify flag', async () => {
    const dir = setup();
    const config = createConfig(dir, { autoVerify: false });
    const contractsDir = path.join(config.migrationDir, 'ADH');
    writeTrackerJson(config.trackerFile, {
      batches: [{
        id: 'B1', name: 'Test', root: 100, programs: 1, status: 'enriched',
        stats: { backendNa: 0, frontendEnrich: 0, fullyImpl: 0, coverageAvgFrontend: 0, totalPartial: 0, totalMissing: 0 },
        priorityOrder: [100],
      }],
    });
    writeContractYaml(path.join(contractsDir, 'ADH-IDE-100.contract.yaml'), {
      program: { id: 100, name: 'Test', complexity: 'LOW', callers: [], callees: [], tasksCount: 1, tablesCount: 0, expressionsCount: 5 },
      rules: [{ id: 'R1', description: 'done', condition: '', variables: [], status: 'IMPL', targetFile: '', gapNotes: '' }],
      variables: [],
      tables: [],
      callees: [],
      overall: { rulesTotal: 1, rulesImpl: 1, rulesPartial: 0, rulesMissing: 0, rulesNa: 0, variablesKeyCount: 0, calleesTotal: 0, calleesImpl: 0, calleesMissing: 0, coveragePct: 100, status: 'enriched', generated: '', notes: '' },
    });

    const result = await runBatchPipeline('B1', config);
    // Should not verify since autoVerify is disabled
    expect(result.steps[0].action).not.toBe(PipelineAction.VERIFIED);
  });

  it('should process programs in priorityOrder', async () => {
    const dir = setup();
    const config = createConfig(dir);
    const contractsDir = path.join(config.migrationDir, 'ADH');
    writeTrackerJson(config.trackerFile, {
      batches: [{
        id: 'B1', name: 'Test', root: 100, programs: 3, status: 'pending',
        stats: { backendNa: 0, frontendEnrich: 0, fullyImpl: 0, coverageAvgFrontend: 0, totalPartial: 0, totalMissing: 0 },
        priorityOrder: [300, 200, 100],
      }],
    });

    // No specs → all will be spec-missing
    const result = await runBatchPipeline('B1', config);
    expect(result.steps.map(s => s.programId)).toEqual([300, 200, 100]);
  });

  it('should report already-done for verified programs', async () => {
    const dir = setup();
    const config = createConfig(dir);
    const contractsDir = path.join(config.migrationDir, 'ADH');
    writeTrackerJson(config.trackerFile, {
      batches: [{
        id: 'B1', name: 'Test', root: 100, programs: 1, status: 'verified',
        stats: { backendNa: 0, frontendEnrich: 0, fullyImpl: 0, coverageAvgFrontend: 0, totalPartial: 0, totalMissing: 0 },
        priorityOrder: [100],
      }],
    });
    writeContractYaml(path.join(contractsDir, 'ADH-IDE-100.contract.yaml'), {
      program: { id: 100, name: 'Done', complexity: 'LOW', callers: [], callees: [], tasksCount: 1, tablesCount: 0, expressionsCount: 5 },
      rules: [],
      variables: [],
      tables: [],
      callees: [],
      overall: { rulesTotal: 0, rulesImpl: 0, rulesPartial: 0, rulesMissing: 0, rulesNa: 0, variablesKeyCount: 0, calleesTotal: 0, calleesImpl: 0, calleesMissing: 0, coveragePct: 100, status: 'verified', generated: '', notes: '' },
    });

    const result = await runBatchPipeline('B1', config);
    expect(result.steps[0].action).toBe(PipelineAction.ALREADY_DONE);
    expect(result.summary.alreadyDone).toBe(1);
  });

  it('should auto-enrich contracted program with 0 gaps then verify', async () => {
    const dir = setup();
    const config = createConfig(dir);
    const contractsDir = path.join(config.migrationDir, 'ADH');
    writeTrackerJson(config.trackerFile, {
      batches: [{
        id: 'B1', name: 'Test', root: 100, programs: 1, status: 'contracted',
        stats: { backendNa: 0, frontendEnrich: 0, fullyImpl: 0, coverageAvgFrontend: 0, totalPartial: 0, totalMissing: 0 },
        priorityOrder: [100],
      }],
    });
    writeContractYaml(path.join(contractsDir, 'ADH-IDE-100.contract.yaml'), {
      program: { id: 100, name: 'NoGaps', complexity: 'LOW', callers: [], callees: [], tasksCount: 1, tablesCount: 0, expressionsCount: 5 },
      rules: [{ id: 'R1', description: 'done', condition: '', variables: [], status: 'IMPL', targetFile: '', gapNotes: '' }],
      variables: [],
      tables: [],
      callees: [],
      overall: { rulesTotal: 1, rulesImpl: 1, rulesPartial: 0, rulesMissing: 0, rulesNa: 0, variablesKeyCount: 0, calleesTotal: 0, calleesImpl: 0, calleesMissing: 0, coveragePct: 100, status: 'contracted', generated: '', notes: '' },
    });

    const result = await runBatchPipeline('B1', config);
    // Should go contracted → enriched → verified in one pass
    expect(result.steps[0].action).toBe(PipelineAction.VERIFIED);
    expect(result.steps[0].newStatus).toBe('verified');
  });
});

// ─── getBatchesStatus Tests ──────────────────────────────────────

describe('getBatchesStatus', () => {
  it('should return empty array when no tracker', () => {
    const dir = setup();
    const config = createConfig(dir);
    expect(getBatchesStatus(config)).toEqual([]);
  });

  it('should list all batches with counters', () => {
    const dir = setup();
    const config = createConfig(dir);
    const contractsDir = path.join(config.migrationDir, 'ADH');

    writeTrackerJson(config.trackerFile, {
      batches: [
        {
          id: 'B1', name: 'Batch 1', root: 100, programs: 2, status: 'contracted',
          stats: { backendNa: 0, frontendEnrich: 0, fullyImpl: 0, coverageAvgFrontend: 0, totalPartial: 0, totalMissing: 0 },
          priorityOrder: [100, 101],
        },
        {
          id: 'B2', name: 'Batch 2', root: 200, programs: 1, status: 'pending',
          stats: { backendNa: 0, frontendEnrich: 0, fullyImpl: 0, coverageAvgFrontend: 0, totalPartial: 0, totalMissing: 0 },
          priorityOrder: [200],
        },
      ],
    });

    writeContractYaml(path.join(contractsDir, 'ADH-IDE-100.contract.yaml'), {
      program: { id: 100, name: 'A', complexity: 'LOW', callers: [], callees: [], tasksCount: 1, tablesCount: 0, expressionsCount: 5 },
      rules: [], variables: [], tables: [], callees: [],
      overall: { rulesTotal: 0, rulesImpl: 0, rulesPartial: 0, rulesMissing: 0, rulesNa: 0, variablesKeyCount: 0, calleesTotal: 0, calleesImpl: 0, calleesMissing: 0, coveragePct: 100, status: 'verified', generated: '', notes: '' },
    });
    writeContractYaml(path.join(contractsDir, 'ADH-IDE-101.contract.yaml'), {
      program: { id: 101, name: 'B', complexity: 'LOW', callers: [], callees: [], tasksCount: 1, tablesCount: 0, expressionsCount: 5 },
      rules: [], variables: [], tables: [], callees: [],
      overall: { rulesTotal: 0, rulesImpl: 0, rulesPartial: 0, rulesMissing: 0, rulesNa: 0, variablesKeyCount: 0, calleesTotal: 0, calleesImpl: 0, calleesMissing: 0, coveragePct: 80, status: 'contracted', generated: '', notes: '' },
    });

    const views = getBatchesStatus(config);
    expect(views).toHaveLength(2);
    expect(views[0].id).toBe('B1');
    expect(views[0].verified).toBe(1);
    expect(views[0].contracted).toBe(1);
    expect(views[0].coverageAvg).toBe(90); // (100+80)/2
    expect(views[1].id).toBe('B2');
    expect(views[1].pending).toBe(1);
  });

  it('should handle tracker with no batches', () => {
    const dir = setup();
    const config = createConfig(dir);
    writeTrackerJson(config.trackerFile, { batches: [] });

    const views = getBatchesStatus(config);
    expect(views).toEqual([]);
  });
});
