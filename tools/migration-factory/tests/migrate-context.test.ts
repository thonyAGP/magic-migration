import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import YAML from 'yaml';
import {
  buildContext, loadReferencePatterns, extractSpecSection, extractSpecForPhase,
  sanitizeDomain, toCamelCase, toPascalCase,
} from '../src/migrate/migrate-context.js';
import type { MigrateConfig } from '../src/migrate/migrate-types.js';

let tmpDir: string;

const makeConfig = (overrides: Partial<MigrateConfig> = {}): MigrateConfig => ({
  projectDir: tmpDir,
  targetDir: path.join(tmpDir, 'adh-web'),
  migrationDir: path.join(tmpDir, '.openspec', 'migration'),
  specDir: path.join(tmpDir, '.openspec', 'specs'),
  contractSubDir: 'ADH',
  parallel: 1,
  maxPasses: 3,
  dryRun: false,
  ...overrides,
});

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mf-ctx-'));
  const dirs = [
    path.join(tmpDir, '.openspec', 'specs'),
    path.join(tmpDir, '.openspec', 'migration', 'ADH'),
    path.join(tmpDir, 'adh-web', 'src', 'stores'),
    path.join(tmpDir, 'adh-web', 'src', 'pages'),
    path.join(tmpDir, 'adh-web', 'src', 'services', 'api'),
    path.join(tmpDir, 'adh-web', 'src', 'types'),
    path.join(tmpDir, 'adh-web', 'src', '__tests__'),
  ];
  for (const d of dirs) fs.mkdirSync(d, { recursive: true });
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('buildContext', () => {
  it('should return null for missing spec, contract, and analysis', () => {
    const config = makeConfig();
    const ctx = buildContext(69, config);
    expect(ctx.programId).toBe(69);
    expect(ctx.project).toBe('ADH');
    expect(ctx.spec).toBeNull();
    expect(ctx.contract).toBeNull();
    expect(ctx.analysis).toBeNull();
    expect(ctx.dbMetadata).toEqual({});
  });

  it('should load spec if exists', () => {
    const config = makeConfig();
    const specFile = path.join(config.specDir, 'ADH-IDE-69.md');
    fs.writeFileSync(specFile, '# Spec for 69\n\nSome content');
    const ctx = buildContext(69, config);
    expect(ctx.spec).toContain('# Spec for 69');
  });

  it('should load analysis JSON if exists', () => {
    const config = makeConfig();
    const analysisFile = path.join(config.migrationDir, 'ADH', 'ADH-IDE-69.analysis.json');
    const analysis = { domain: 'extrait', domainPascal: 'Extrait', complexity: 'MEDIUM', entities: [], stateFields: [], actions: [], apiEndpoints: [], uiLayout: { type: 'page', sections: [] }, mockData: { count: 5, description: 'test' }, dependencies: { stores: [], sharedTypes: [], externalApis: [] } };
    fs.writeFileSync(analysisFile, JSON.stringify(analysis));
    const ctx = buildContext(69, config);
    expect(ctx.analysis?.domain).toBe('extrait');
  });

  it('should load contract if exists', () => {
    const config = makeConfig();
    const contractFile = path.join(config.migrationDir, 'ADH', 'ADH-IDE-69.contract.yaml');
    const contract = {
      program: { id: 69, name: 'EXTRAIT_COMPTE', complexity: 'MEDIUM', callers: [], callees: [], tasksCount: 3, tablesCount: 2, expressionsCount: 10 },
      rules: [], variables: [], tables: [], callees: [],
      overall: { rulesTotal: 0, rulesImpl: 0, rulesPartial: 0, rulesMissing: 0, rulesNa: 0, variablesKeyCount: 0, calleesTotal: 0, calleesImpl: 0, calleesMissing: 0, coveragePct: 0, status: 'contracted', generated: '', notes: '' },
    };
    fs.writeFileSync(contractFile, YAML.stringify(contract));
    const ctx = buildContext(69, config);
    expect(ctx.contract).not.toBeNull();
    expect(ctx.contract?.program.name).toBe('EXTRAIT_COMPTE');
  });
});

describe('loadReferencePatterns', () => {
  it('should return empty if no pattern files exist', () => {
    const patterns = loadReferencePatterns(path.join(tmpDir, 'adh-web'));
    expect(patterns).toEqual({});
  });

  it('should load existing pattern files', () => {
    const targetDir = path.join(tmpDir, 'adh-web');
    fs.mkdirSync(path.join(targetDir, 'src', 'stores', '__tests__'), { recursive: true });
    fs.writeFileSync(path.join(targetDir, 'src', 'stores', 'extraitStore.ts'), 'export const useExtraitStore = () => {};');
    fs.writeFileSync(path.join(targetDir, 'src', 'types', 'change.ts'), 'export interface Change {}');
    const patterns = loadReferencePatterns(targetDir);
    expect(patterns.store).toContain('useExtraitStore');
    expect(patterns.types).toContain('interface Change');
    expect(patterns.page).toBeUndefined();
  });
});

describe('extractSpecSection', () => {
  const spec = `# Program 69

## Tables

Table operations_dat
Table cafil048_dat

## Expressions

Expression 1: some logic

## Variables

Variable D: soldeCoffre`;

  it('should extract a matching section', () => {
    const section = extractSpecSection(spec, 'Tables');
    expect(section).toContain('Table operations_dat');
    expect(section).not.toContain('Expression 1');
  });

  it('should return null for non-existent section', () => {
    expect(extractSpecSection(spec, 'NonExistent')).toBeNull();
  });
});

describe('extractSpecForPhase', () => {
  const spec = `# Program 69\nLine 2\nLine 3\n${'Line\n'.repeat(30)}## Regles metier\n\nRule 1\n\n## Ecran\n\nLayout info\n\n## Expressions\n\nExpr 1`;

  it('should return full spec for analyze phase', () => {
    const result = extractSpecForPhase(spec, 'analyze');
    expect(result).toBe(spec);
  });

  it('should return full spec for review phase', () => {
    const result = extractSpecForPhase(spec, 'review');
    expect(result).toBe(spec);
  });

  it('should extract relevant sections for store phase', () => {
    const result = extractSpecForPhase(spec, 'store');
    expect(result).toContain('# Program 69');
    expect(result).toContain('Regles');
    expect(result).toContain('Expressions');
  });
});

describe('name utilities', () => {
  it('should sanitize domain name', () => {
    expect(sanitizeDomain('ADH_Gestion_Caisse')).toBe('GestionCaisse');
    expect(sanitizeDomain('EXTRAIT_COMPTE')).toBe('EXTRAITCOMPTE');
    expect(sanitizeDomain('PBP-Some-Name')).toBe('SomeName');
  });

  it('should convert to camelCase', () => {
    expect(toCamelCase('Fermeture_Session')).toBe('fermetureSession');
    expect(toCamelCase('ADH_Gestion_Caisse')).toBe('gestionCaisse');
  });

  it('should convert to PascalCase', () => {
    expect(toPascalCase('Fermeture_Session')).toBe('FermetureSession');
    expect(toPascalCase('ADH_Gestion_Caisse')).toBe('GestionCaisse');
  });

  it('should handle empty input', () => {
    expect(toCamelCase('')).toBe('unknown');
    expect(toPascalCase('')).toBe('Unknown');
  });
});
