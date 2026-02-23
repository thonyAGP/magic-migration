import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { runCodegen } from '../src/generators/codegen/codegen-runner.js';
import type { MigrationContract } from '../src/core/types.js';

const createTestDir = (): string => fs.mkdtempSync(path.join(os.tmpdir(), 'mf-codegen-'));

const makeContract = (overrides?: Partial<MigrationContract['program']>): MigrationContract => ({
  program: {
    id: 131, name: 'Fermeture_Session', complexity: 'MEDIUM',
    callers: [121], callees: [192], tasksCount: 3, tablesCount: 2, expressionsCount: 10,
    ...overrides,
  },
  rules: [
    { id: 'RM-001', description: 'Calculer solde', condition: '', variables: ['D'], status: 'IMPL', targetFile: '', gapNotes: '' },
  ],
  variables: [
    { localId: 'D', name: 'solde', type: 'Virtual', status: 'IMPL', targetFile: '', gapNotes: '' },
  ],
  tables: [
    { id: 849, name: 'operations', mode: 'R', status: 'IMPL', targetFile: '', gapNotes: '' },
  ],
  callees: [
    { id: 192, name: 'SOLDE_COMPTE', calls: 2, context: 'read solde', status: 'IMPL', target: '', gapNotes: '' },
  ],
  overall: {
    rulesTotal: 1, rulesImpl: 1, rulesPartial: 0, rulesMissing: 0, rulesNa: 0,
    variablesKeyCount: 1, calleesTotal: 1, calleesImpl: 1, calleesMissing: 0,
    coveragePct: 100, status: 'verified', generated: '', notes: '',
  },
});

describe('runCodegen', () => {
  let testDir: string;

  beforeEach(() => { testDir = createTestDir(); });
  afterEach(() => { fs.rmSync(testDir, { recursive: true, force: true }); });

  it('should generate 5 files for simple contract', () => {
    const result = runCodegen(makeContract(), { outputDir: testDir, dryRun: false, overwrite: false });

    expect(result.programId).toBe(131);
    expect(result.programName).toBe('Fermeture_Session');
    expect(result.files).toHaveLength(5);
    expect(result.written).toBe(5);
    expect(result.skipped).toBe(0);

    // Check files exist
    expect(fs.existsSync(path.join(testDir, 'types', 'fermetureSession.ts'))).toBe(true);
    expect(fs.existsSync(path.join(testDir, 'stores', 'fermetureSessionStore.ts'))).toBe(true);
    expect(fs.existsSync(path.join(testDir, 'pages', 'FermetureSessionPage.tsx'))).toBe(true);
    expect(fs.existsSync(path.join(testDir, 'services', 'api', 'fermetureSessionApi.ts'))).toBe(true);
    expect(fs.existsSync(path.join(testDir, '__tests__', 'fermetureSessionStore.test.ts'))).toBe(true);
  });

  it('should skip existing files when overwrite=false', () => {
    // First run: generate
    runCodegen(makeContract(), { outputDir: testDir, dryRun: false, overwrite: false });

    // Second run: should skip
    const result = runCodegen(makeContract(), { outputDir: testDir, dryRun: false, overwrite: false });
    expect(result.written).toBe(0);
    expect(result.skipped).toBe(5);
  });

  it('should write files when overwrite=true', () => {
    // First run
    runCodegen(makeContract(), { outputDir: testDir, dryRun: false, overwrite: false });

    // Second run with overwrite
    const result = runCodegen(makeContract(), { outputDir: testDir, dryRun: false, overwrite: true });
    expect(result.written).toBe(5);
    expect(result.skipped).toBe(0);
  });

  it('should respect dry-run (no writes)', () => {
    const result = runCodegen(makeContract(), { outputDir: testDir, dryRun: true, overwrite: false });
    expect(result.files).toHaveLength(5);
    expect(result.written).toBe(5);

    // No files should exist
    expect(fs.existsSync(path.join(testDir, 'types', 'fermetureSession.ts'))).toBe(false);
  });

  it('should handle contract with no rules', () => {
    const contract = makeContract();
    contract.rules = [];
    const result = runCodegen(contract, { outputDir: testDir, dryRun: false, overwrite: false });
    expect(result.files).toHaveLength(5);
    expect(result.written).toBe(5);

    // Types file should still have state interface
    const typesContent = fs.readFileSync(path.join(testDir, 'types', 'fermetureSession.ts'), 'utf8');
    expect(typesContent).toContain('FermetureSessionState');
    expect(typesContent).not.toContain('FermetureSessionAction');
  });

  it('should generate valid TypeScript content', () => {
    runCodegen(makeContract(), { outputDir: testDir, dryRun: false, overwrite: false });

    const typesContent = fs.readFileSync(path.join(testDir, 'types', 'fermetureSession.ts'), 'utf8');
    expect(typesContent).toContain('export interface');
    expect(typesContent).not.toContain('undefined');

    const storeContent = fs.readFileSync(path.join(testDir, 'stores', 'fermetureSessionStore.ts'), 'utf8');
    expect(storeContent).toContain("import { create } from 'zustand'");
    expect(storeContent).toContain('export const useFermetureSessionStore');
  });
});
