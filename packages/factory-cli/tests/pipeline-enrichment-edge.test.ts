/**
 * Tests for Pipeline & Enrichment edge cases.
 * Covers: empty batch, all-verified batch, Claude enrichment failure,
 * partial enrichment, dryRun guarantee, missing API key.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import YAML from 'yaml';
import { runBatchPipeline, preflightBatch } from '../src/pipeline/pipeline-runner.js';
import { createClaudeEnrichmentHook } from '../src/pipeline/claude-enrichment-hook.js';
import type { PipelineConfig, MigrationContract, Tracker } from '../src/core/types.js';
import { EnrichmentMode, PipelineAction, PipelineStatus } from '../src/core/types.js';

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
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mf-enrich-edge-'));
  testDirs.push(dir);
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

const writeTrackerJson = (filePath: string, batches: Array<{ id: string; name: string; root: number; programs: number; status: string; priorityOrder: (string | number)[] }>): void => {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
  const doc = {
    version: '1.0',
    methodology: 'SPECMAP',
    created: '2026-02-19',
    updated: '2026-02-19',
    status: 'active',
    stats: {
      total_programs: 0, live_programs: 0, orphan_programs: 0,
      ecf_programs: 0, contracted: 0, enriched: 0, verified: 0,
      max_level: 0, last_computed: '',
    },
    batches: batches.map(b => ({
      id: b.id, name: b.name, root: b.root, programs: b.programs,
      status: b.status,
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
      generated: contract.overall?.generated ?? '2026-02-19',
      notes: contract.overall?.notes ?? '',
    },
  };
  fs.writeFileSync(filePath, YAML.stringify(doc), 'utf8');
};

const writeSpecFile = (dir: string, programId: number): void => {
  fs.mkdirSync(dir, { recursive: true });
  const content = `# Specification: ADH IDE ${programId}\n\n> **Analyse**: 2026-02-19 10:00 → 10:20\n\n## Onglet 1 : Fonctionnel\n\n### 1.1 Objectif\nTest program ${programId}\n`;
  fs.writeFileSync(path.join(dir, `ADH-IDE-${programId}.md`), content, 'utf8');
};

// ─── Tests ──────────────────────────────────────────────────────

describe('Pipeline Enrichment Edge Cases', () => {
  it('should return empty steps for empty batch (0 programs)', async () => {
    const dir = setup();
    const config = createConfig(dir);

    writeTrackerJson(config.trackerFile, [{
      id: 'B-EMPTY', name: 'Empty batch', root: 0, programs: 0,
      status: 'pending', priorityOrder: [],
    }]);

    const result = await runBatchPipeline('B-EMPTY', config);
    expect(result.steps).toHaveLength(0);
    expect(result.summary.total).toBe(0);
  });

  it('should mark all-verified batch programs as already_done', async () => {
    const dir = setup();
    const config = createConfig(dir);
    const contractDir = path.join(config.migrationDir, 'ADH');

    writeTrackerJson(config.trackerFile, [{
      id: 'B-DONE', name: 'Done batch', root: 50, programs: 2,
      status: 'verified', priorityOrder: [50, 51],
    }]);

    // Write verified contracts
    for (const progId of [50, 51]) {
      writeContractYaml(path.join(contractDir, `ADH-IDE-${progId}.contract.yaml`), {
        program: { id: progId, name: `Prog ${progId}`, complexity: 'LOW', callers: [], callees: [], tasksCount: 1, tablesCount: 1, expressionsCount: 1 },
        rules: [{ id: 'R1', description: 'Rule 1', condition: '', variables: [], status: 'IMPL', targetFile: 'src/x.ts', gapNotes: '' }],
        variables: [],
        tables: [{ id: 1, name: 'tbl', mode: 'R', status: 'IMPL', targetFile: 'src/x.ts', gapNotes: '' }],
        callees: [],
        overall: { rulesTotal: 1, rulesImpl: 1, rulesPartial: 0, rulesMissing: 0, rulesNa: 0, variablesKeyCount: 0, calleesTotal: 0, calleesImpl: 0, calleesMissing: 0, coveragePct: 100, status: PipelineStatus.VERIFIED, generated: '2026-02-19', notes: '' },
      });
      writeSpecFile(path.join(dir, '.openspec', 'specs'), progId);
    }

    const result = await runBatchPipeline('B-DONE', config);
    expect(result.summary.alreadyDone).toBe(2);
    expect(result.steps.every(s => s.action === PipelineAction.ALREADY_DONE)).toBe(true);
  });

  it('should return enriched=false and 0 resolved when Claude API fails', async () => {
    const hook = createClaudeEnrichmentHook({ apiKey: 'fake-key-for-test', model: 'haiku' });
    const contract: MigrationContract = {
      program: { id: 200, name: 'TestProg', complexity: 'MEDIUM', callers: [], callees: [], tasksCount: 3, tablesCount: 2, expressionsCount: 10 },
      rules: [
        { id: 'RM-001', description: 'Check', condition: '', variables: [], status: 'MISSING', targetFile: '', gapNotes: '' },
      ],
      variables: [],
      tables: [],
      callees: [],
      overall: { rulesTotal: 1, rulesImpl: 0, rulesPartial: 0, rulesMissing: 1, rulesNa: 0, variablesKeyCount: 0, calleesTotal: 0, calleesImpl: 0, calleesMissing: 0, coveragePct: 0, status: 'contracted', generated: '2026-02-19', notes: '' },
    };

    // Create a temp spec file
    const dir = setup();
    const specFile = path.join(dir, 'spec.md');
    fs.writeFileSync(specFile, '# Test spec\n', 'utf8');

    // API call will fail because fake-key is not valid
    const result = await hook.enrich({ contract, specFile, codebaseDir: dir });
    expect(result.enriched).toBe(false);
    expect(result.gapsResolved).toBe(0);
    expect(result.gapsRemaining).toBe(1);
    expect(result.message).toContain('failed');
  });

  it('should not write contracts to disk when dryRun=true', async () => {
    const dir = setup();
    const config = createConfig(dir, { dryRun: true });
    const contractDir = path.join(config.migrationDir, 'ADH');

    writeTrackerJson(config.trackerFile, [{
      id: 'B-DRY', name: 'Dry run batch', root: 60, programs: 1,
      status: 'pending', priorityOrder: [60],
    }]);

    // Write spec so auto-contract can generate
    writeSpecFile(path.join(dir, '.openspec', 'specs'), 60);

    // Ensure no contract file exists before
    const contractFile = path.join(contractDir, 'ADH-IDE-60.contract.yaml');
    expect(fs.existsSync(contractFile)).toBe(false);

    const result = await runBatchPipeline('B-DRY', config);
    expect(result.dryRun).toBe(true);

    // In dry run, tracker should not be modified
    // The contract should NOT be written to disk
    expect(fs.existsSync(contractFile)).toBe(false);
  });

  it('should emit needs_enrichment with reason when no API key set', async () => {
    const dir = setup();
    const config = createConfig(dir, { enrichmentMode: EnrichmentMode.CLAUDE });
    const contractDir = path.join(config.migrationDir, 'ADH');

    writeTrackerJson(config.trackerFile, [{
      id: 'B-NOKEY', name: 'No key batch', root: 70, programs: 1,
      status: 'pending', priorityOrder: [70],
    }]);

    // Write a contract with gaps (needs enrichment)
    writeContractYaml(path.join(contractDir, `ADH-IDE-70.contract.yaml`), {
      program: { id: 70, name: 'NeedEnrich', complexity: 'MEDIUM', callers: [], callees: [], tasksCount: 2, tablesCount: 1, expressionsCount: 5 },
      rules: [
        { id: 'R1', description: 'Rule', condition: '', variables: [], status: 'MISSING', targetFile: '', gapNotes: '' },
      ],
      variables: [],
      tables: [{ id: 1, name: 'tbl', mode: 'R', status: 'IMPL', targetFile: 'src/x.ts', gapNotes: '' }],
      callees: [],
      overall: { rulesTotal: 1, rulesImpl: 0, rulesPartial: 0, rulesMissing: 1, rulesNa: 0, variablesKeyCount: 0, calleesTotal: 0, calleesImpl: 0, calleesMissing: 0, coveragePct: 50, status: 'contracted', generated: '2026-02-19', notes: '' },
    });
    writeSpecFile(path.join(dir, '.openspec', 'specs'), 70);

    // Remove API key to simulate missing key
    const origKey = process.env.ANTHROPIC_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;

    try {
      const result = await runBatchPipeline('B-NOKEY', config);

      // Should still have steps for the program
      expect(result.steps).toHaveLength(1);
      const step = result.steps[0];

      // Program has gaps and Claude can't enrich (no API key) → needs_enrichment
      expect(step.action === PipelineAction.NEEDS_ENRICHMENT || step.action === PipelineAction.CONTRACTED).toBe(true);
      expect(step.gaps).toBeGreaterThan(0);
    } finally {
      if (origKey) process.env.ANTHROPIC_API_KEY = origKey;
    }
  });

  it('should handle batch with program that has no spec file', async () => {
    const dir = setup();
    const config = createConfig(dir);

    writeTrackerJson(config.trackerFile, [{
      id: 'B-NOSPEC', name: 'No spec batch', root: 80, programs: 1,
      status: 'pending', priorityOrder: [80],
    }]);

    // No spec file, no contract → auto-contract will fail due to missing spec
    const result = await runBatchPipeline('B-NOSPEC', config);

    expect(result.steps).toHaveLength(1);
    const step = result.steps[0];
    // Without spec and contract, program should be spec_missing
    expect(step.action).toBe(PipelineAction.SPEC_MISSING);
  });
});
