/**
 * Tests for MigrationLogger - persistent JSONL logging.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { MigrationLogger } from '../src/migrate/migrate-logger.js';

// Helper to create unique test directory per test
const createTestDir = () => {
  const testId = `test-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return path.join(os.tmpdir(), 'factory-cli-tests', 'migrate-logger', testId);
};

// Helper to create logger with isolated test directory
const createTestLogger = (
  testDir: string,
  project: string,
  batch: string,
  programs: Map<number | string, string>
) => {
  const originalCwd = process.cwd();
  process.chdir(testDir);
  const logger = new MigrationLogger(project, batch, programs);
  process.chdir(originalCwd);
  return logger;
};

describe('MigrationLogger', () => {
  let testDir: string;
  let batchId: string;

  beforeEach(() => {
    testDir = createTestDir();
    batchId = `B${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    fs.mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  it('should create log directory structure', () => {
    const programNames = new Map([[117, 'GESTION_CAISSE']]);
    const logger = createTestLogger(testDir, 'ADH', batchId, programNames);

    // Directory is created lazily on first log write
    logger.logPhaseEvent(117, 'types', { event: 'start' });
    expect(fs.existsSync(logger.getLogDir())).toBe(true);
  });

  it('should log phase start event', () => {
    const programNames = new Map([[117, 'GESTION_CAISSE']]);
    const logger = createTestLogger(testDir, 'ADH', batchId, programNames);

    logger.logPhaseEvent(117, 'types', {
      event: 'start',
      model: 'haiku',
      prompt_size: 15000,
    });

    const logs = logger.readPhaseLogs(117, 'types');
    expect(logs).toHaveLength(1);
    expect(logs[0]).toMatchObject({
      program: 117,
      phase: 'types',
      event: 'start',
      model: 'haiku',
      prompt_size: 15000,
    });
  });

  it('should log timeout to errors.jsonl', () => {
    const programNames = new Map([[117, 'GESTION_CAISSE']]);
    const logger = createTestLogger(testDir, 'ADH', batchId, programNames);

    logger.logPhaseEvent(117, 'types', {
      event: 'timeout',
      model: 'haiku',
      duration_ms: 120000,
    });

    expect(logger.hasErrors()).toBe(true);

    const errors = logger.readErrors();
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatchObject({
      program: 117,
      phase: 'types',
      event: 'timeout',
      model: 'haiku',
    });
  });

  it('should append multiple events to same file', () => {
    const programNames = new Map([[117, 'GESTION_CAISSE']]);
    const logger = createTestLogger(testDir, 'ADH', batchId, programNames);

    logger.logPhaseEvent(117, 'types', { event: 'start', model: 'haiku' });
    logger.logPhaseEvent(117, 'types', { event: 'retry', attempt: 1, model: 'haiku' });
    logger.logPhaseEvent(117, 'types', { event: 'success', duration_ms: 15000, tokens_used: 2000 });

    const logs = logger.readPhaseLogs(117, 'types');
    expect(logs).toHaveLength(3);
    expect(logs.map(l => l.event)).toEqual(['start', 'retry', 'success']);
  });

  it('should format program name correctly', () => {
    const programNames = new Map([[117, 'Gestion Caisse - Édition']]);
    const logger = createTestLogger(testDir, 'ADH', batchId, programNames);

    const formatted = logger.formatProgramName(117);
    // Multi-byte characters are replaced with underscores
    expect(formatted).toMatch(/^117-Gestion_Caisse/);
    expect(formatted).toContain('_');
  });

  it('should log batch summary', () => {
    const programNames = new Map([[117, 'GESTION_CAISSE'], [125, 'VENTE']]);
    const logger = createTestLogger(testDir, 'ADH', batchId, programNames);

    logger.logBatchSummary({
      batchId,
      totalPrograms: 2,
      completed: 1,
      failed: 1,
      duration_ms: 120000,
      totalTokens: { input: 50000, output: 20000 },
    });

    const summaryFile = path.join(logger.getLogDir(), 'batch-summary.json');
    expect(fs.existsSync(summaryFile)).toBe(true);

    const summary = JSON.parse(fs.readFileSync(summaryFile, 'utf8'));
    expect(summary).toMatchObject({
      batchId,
      totalPrograms: 2,
      completed: 1,
      failed: 1,
    });
  });

  it('should list phases with logs', () => {
    const programNames = new Map([[117, 'GESTION_CAISSE']]);
    const logger = createTestLogger(testDir, 'ADH', batchId, programNames);

    logger.logPhaseEvent(117, 'types', { event: 'start' });
    logger.logPhaseEvent(117, 'store', { event: 'start' });
    logger.logPhaseEvent(117, 'api', { event: 'start' });

    const phases = logger.listPhases();
    expect(phases).toContain('types');
    expect(phases).toContain('store');
    expect(phases).toContain('api');
    expect(phases).toHaveLength(3);
  });

  it('should count total log entries across all phases', () => {
    const programNames = new Map([[117, 'GESTION_CAISSE'], [125, 'VENTE']]);
    const logger = createTestLogger(testDir, 'ADH', batchId, programNames);

    logger.logPhaseEvent(117, 'types', { event: 'start' });
    logger.logPhaseEvent(117, 'types', { event: 'success' });
    logger.logPhaseEvent(125, 'types', { event: 'start' });
    logger.logPhaseEvent(125, 'types', { event: 'error', error_message: 'Test error' });
    logger.logPhaseEvent(117, 'store', { event: 'start' });

    const count = logger.countTotalEntries();
    expect(count).toBe(5);
  });

  it('should return empty array for non-existent phase logs', () => {
    const programNames = new Map([[117, 'GESTION_CAISSE']]);
    const logger = createTestLogger(testDir, 'ADH', batchId, programNames);

    const logs = logger.readPhaseLogs(117, 'types');
    expect(logs).toEqual([]);
  });

  it('should handle multiple programs in same batch', () => {
    const programNames = new Map([
      [117, 'GESTION_CAISSE'],
      [125, 'VENTE'],
      [237, 'EXTRAIT'],
    ]);
    const logger = createTestLogger(testDir, 'ADH', batchId, programNames);

    logger.logPhaseEvent(117, 'types', { event: 'start' });
    logger.logPhaseEvent(125, 'types', { event: 'start' });
    logger.logPhaseEvent(237, 'types', { event: 'start' });

    expect(logger.readPhaseLogs(117, 'types')).toHaveLength(1);
    expect(logger.readPhaseLogs(125, 'types')).toHaveLength(1);
    expect(logger.readPhaseLogs(237, 'types')).toHaveLength(1);
  });
});
