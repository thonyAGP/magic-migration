import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { scaffoldTargetDir } from '../src/migrate/migrate-scaffold.js';
import type { MigrateConfig } from '../src/migrate/migrate-types.js';

const makeConfig = (targetDir: string): MigrateConfig => ({
  projectDir: targetDir,
  targetDir,
  migrationDir: path.join(targetDir, '.migration'),
  specDir: path.join(targetDir, '.specs'),
  contractSubDir: 'ADH',
  dryRun: false,
  parallel: 1,
  maxPasses: 3,
});

let tmpDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'scaffold-test-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('scaffoldTargetDir', () => {
  it('should create all infrastructure files in empty dir', () => {
    const config = makeConfig(tmpDir);
    const result = scaffoldTargetDir(config);

    expect(result.created).toBeGreaterThan(10);
    expect(result.skipped).toBe(0);

    // tsconfig files
    expect(fs.existsSync(path.join(tmpDir, 'tsconfig.json'))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, 'tsconfig.app.json'))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, 'package.json'))).toBe(true);

    // Store stubs
    expect(fs.existsSync(path.join(tmpDir, 'src/stores/dataSourceStore.ts'))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, 'src/stores/index.ts'))).toBe(true);

    // API stubs
    expect(fs.existsSync(path.join(tmpDir, 'src/services/api/apiClient.ts'))).toBe(true);

    // Component stubs
    expect(fs.existsSync(path.join(tmpDir, 'src/components/layout/ScreenLayout.tsx'))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, 'src/components/ui/Button.tsx'))).toBe(true);

    // Utils
    expect(fs.existsSync(path.join(tmpDir, 'src/lib/utils.ts'))).toBe(true);
  });

  it('should not overwrite existing files', () => {
    const config = makeConfig(tmpDir);

    // Write a custom tsconfig
    fs.writeFileSync(path.join(tmpDir, 'tsconfig.json'), '{"custom": true}', 'utf8');

    const result = scaffoldTargetDir(config);

    expect(result.skipped).toBeGreaterThan(0);

    // Original file should be preserved
    const content = fs.readFileSync(path.join(tmpDir, 'tsconfig.json'), 'utf8');
    expect(content).toBe('{"custom": true}');
  });

  it('should be idempotent (run twice, second time all skipped)', () => {
    const config = makeConfig(tmpDir);

    const first = scaffoldTargetDir(config);
    const second = scaffoldTargetDir(config);

    expect(first.created).toBeGreaterThan(0);
    expect(second.created).toBe(0);
    expect(second.skipped).toBe(first.created);
  });

  it('should create valid tsconfig.app.json with path aliases', () => {
    const config = makeConfig(tmpDir);
    scaffoldTargetDir(config);

    const tsconfig = JSON.parse(fs.readFileSync(path.join(tmpDir, 'tsconfig.app.json'), 'utf8'));
    expect(tsconfig.compilerOptions.paths).toEqual({ '@/*': ['./src/*'] });
    expect(tsconfig.compilerOptions.jsx).toBe('react-jsx');
    expect(tsconfig.compilerOptions.verbatimModuleSyntax).toBe(true);
  });

  it('should create dataSourceStore with isRealApi', () => {
    const config = makeConfig(tmpDir);
    scaffoldTargetDir(config);

    const content = fs.readFileSync(path.join(tmpDir, 'src/stores/dataSourceStore.ts'), 'utf8');
    expect(content).toContain('isRealApi');
    expect(content).toContain('useDataSourceStore');
  });

  it('should create apiClient with ApiResponse type', () => {
    const config = makeConfig(tmpDir);
    scaffoldTargetDir(config);

    const content = fs.readFileSync(path.join(tmpDir, 'src/services/api/apiClient.ts'), 'utf8');
    expect(content).toContain('ApiResponse');
    expect(content).toContain('apiClient');
  });

  it('should create target dir if it does not exist', () => {
    const nestedDir = path.join(tmpDir, 'deep', 'nested', 'target');
    const config = makeConfig(nestedDir);

    scaffoldTargetDir(config);

    expect(fs.existsSync(nestedDir)).toBe(true);
    expect(fs.existsSync(path.join(nestedDir, 'tsconfig.json'))).toBe(true);
  });
});
