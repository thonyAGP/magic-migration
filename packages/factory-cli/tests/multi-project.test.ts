import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { resolveCodebaseDir, readProjectRegistry, type RegistryEntry } from '../src/dashboard/project-discovery.js';
import { parseSpecContent } from '../src/generators/spec-parser.js';
import { resolvePipelineConfig } from '../src/pipeline/pipeline-config.js';

// ─── Test Helpers ────────────────────────────────────────────────

let testDir: string;

beforeEach(() => {
  testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mf-multi-'));
});

afterEach(() => {
  if (testDir) fs.rmSync(testDir, { recursive: true, force: true });
});

// ─── resolveCodebaseDir ──────────────────────────────────────────

describe('resolveCodebaseDir', () => {
  it('should use codebaseDir from registry if present', () => {
    const registry: RegistryEntry[] = [
      { name: 'ADH', programs: 135, description: 'Test', codebaseDir: 'adh-web/src' },
    ];
    const result = resolveCodebaseDir(testDir, 'ADH', registry);
    expect(result).toBe(path.join(testDir, 'adh-web', 'src'));
  });

  it('should fallback to convention {name}-web/src if directory exists', () => {
    const conventionDir = path.join(testDir, 'pbp-web', 'src');
    fs.mkdirSync(conventionDir, { recursive: true });
    const result = resolveCodebaseDir(testDir, 'PBP', []);
    expect(result).toBe(conventionDir);
  });

  it('should fallback to projectDir if nothing exists', () => {
    const result = resolveCodebaseDir(testDir, 'REF', []);
    expect(result).toBe(testDir);
  });

  it('should use lowercase convention for project name', () => {
    const conventionDir = path.join(testDir, 'vil-web', 'src');
    fs.mkdirSync(conventionDir, { recursive: true });
    const result = resolveCodebaseDir(testDir, 'VIL', []);
    expect(result).toBe(conventionDir);
  });

  it('should prefer registry over convention', () => {
    const conventionDir = path.join(testDir, 'adh-web', 'src');
    fs.mkdirSync(conventionDir, { recursive: true });
    const registry: RegistryEntry[] = [
      { name: 'ADH', programs: 135, description: 'Test', codebaseDir: 'custom-dir/src' },
    ];
    const result = resolveCodebaseDir(testDir, 'ADH', registry);
    expect(result).toBe(path.join(testDir, 'custom-dir', 'src'));
  });
});

// ─── resolvePipelineConfig multi-project ─────────────────────────

describe('resolvePipelineConfig multi-project', () => {
  it('should resolve codebaseDir for ADH via registry', () => {
    const migDir = path.join(testDir, '.openspec', 'migration');
    fs.mkdirSync(migDir, { recursive: true });
    fs.writeFileSync(path.join(migDir, 'projects-registry.json'), JSON.stringify({
      projects: [{ name: 'ADH', programs: 135, description: 'Test', codebaseDir: 'adh-web/src' }],
    }), 'utf8');

    const config = resolvePipelineConfig({ projectDir: testDir, dir: 'ADH' });
    expect(config.codebaseDir).toBe(path.join(testDir, 'adh-web', 'src'));
  });

  it('should fallback codebaseDir for PBP without registry entry', () => {
    const migDir = path.join(testDir, '.openspec', 'migration');
    fs.mkdirSync(migDir, { recursive: true });
    fs.writeFileSync(path.join(migDir, 'projects-registry.json'), JSON.stringify({ projects: [] }), 'utf8');

    const config = resolvePipelineConfig({ projectDir: testDir, dir: 'PBP' });
    // No pbp-web/src directory exists → fallback to projectDir
    expect(config.codebaseDir).toBe(testDir);
  });
});

// ─── parseSpecContent multi-project ──────────────────────────────

describe('parseSpecContent multi-project', () => {
  it('should parse header "# ADH IDE 237"', () => {
    const result = parseSpecContent('# ADH IDE 237 - Vente Gift Pass');
    expect(result.programId).toBe(237);
    expect(result.programName).toBe('Vente Gift Pass');
  });

  it('should parse header "# PBP IDE 243 - MECANO"', () => {
    const result = parseSpecContent('# PBP IDE 243 - MECANO');
    expect(result.programId).toBe(243);
    expect(result.programName).toBe('MECANO');
  });

  it('should parse header "# REF IDE 901 - Tables"', () => {
    const result = parseSpecContent('# REF IDE 901 - Tables partagees');
    expect(result.programId).toBe(901);
    expect(result.programName).toBe('Tables partagees');
  });

  it('should parse header "# VIL IDE 100 - Village"', () => {
    const result = parseSpecContent('# VIL IDE 100 - Village Editions');
    expect(result.programId).toBe(100);
    expect(result.programName).toBe('Village Editions');
  });
});
