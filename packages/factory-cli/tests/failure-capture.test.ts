/**
 * Tests for failure-capture module
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  captureFailure,
  resolveFailure,
  listFailures,
  getUnresolvedFailures,
  getFailureStats,
  type FailureRecord,
} from '../src/core/failure-capture.js';

const TEST_HISTORY_DIR = path.join(process.cwd(), 'test-failures');
const TEST_FAILURES_DIR = path.join(TEST_HISTORY_DIR, 'failures');

describe('failure-capture', () => {
  beforeEach(() => {
    // Clean test directory
    if (fs.existsSync(TEST_FAILURES_DIR)) {
      fs.rmSync(TEST_FAILURES_DIR, { recursive: true });
    }
    fs.mkdirSync(TEST_FAILURES_DIR, { recursive: true });
  });

  afterEach(() => {
    // Cleanup
    if (fs.existsSync(TEST_HISTORY_DIR)) {
      fs.rmSync(TEST_HISTORY_DIR, { recursive: true });
    }
  });

  describe('captureFailure', () => {
    it('should create a failure record with all details', async () => {
      const filepath = await captureFailure({
        programId: 237,
        programName: 'Vente GP',
        phase: 'VERIFY',
        error: new Error('Coverage below threshold'),
        context: {
          contract_file: '.openspec/migration/ADH/ADH-IDE-237.contract.yaml',
          output_dir: '../adh-web/src',
        },
        expectedCoverage: 100,
        actualCoverage: 85,
        historyDir: TEST_HISTORY_DIR,
      });

      expect(fs.existsSync(filepath)).toBe(true);

      const content = fs.readFileSync(filepath, 'utf8');
      const record: FailureRecord = JSON.parse(content);

      expect(record.program_id).toBe(237);
      expect(record.program_name).toBe('Vente GP');
      expect(record.phase).toBe('VERIFY');
      expect(record.error).toContain('Coverage below threshold');
      expect(record.error_code).toBe('ERR_COVERAGE_LOW');
      expect(record.details.expected_coverage).toBe(100);
      expect(record.details.actual_coverage).toBe(85);
      expect(record.details.context.contract_file).toBe(
        '.openspec/migration/ADH/ADH-IDE-237.contract.yaml'
      );
    });

    it('should infer error code from error message', async () => {
      const testCases = [
        { error: 'Coverage too low', expected: 'ERR_COVERAGE_LOW' },
        { error: 'Claude API failed', expected: 'ERR_CLAUDE_API' },
        { error: 'File not found', expected: 'ERR_FILE_NOT_FOUND' },
        { error: 'Parsing failed', expected: 'ERR_PARSING_FAILED' },
        { error: 'Unknown error', expected: 'ERR_UNKNOWN' },
      ];

      for (const { error, expected } of testCases) {
        const filepath = await captureFailure({
          programId: 100,
          programName: 'Test',
          phase: 'EXTRACT',
          error: new Error(error),
          context: {},
          historyDir: TEST_HISTORY_DIR,
        });

        const content = fs.readFileSync(filepath, 'utf8');
        const record: FailureRecord = JSON.parse(content);

        expect(record.error_code).toBe(expected);

        // Cleanup
        fs.unlinkSync(filepath);
      }
    });

    it('should add missing expressions if provided', async () => {
      const filepath = await captureFailure({
        programId: 237,
        programName: 'Vente GP',
        phase: 'VERIFY',
        error: 'Coverage low',
        context: {},
        missingExpressions: [
          {
            expr_id: 'Prg_237:Task_5:Line_12:Expr_30',
            formula: "IF({0,3}='E',Msg('Error'))",
            rule_id: 'RM-005',
          },
        ],
        historyDir: TEST_HISTORY_DIR,
      });

      const content = fs.readFileSync(filepath, 'utf8');
      const record: FailureRecord = JSON.parse(content);

      expect(record.details.missing_expressions).toHaveLength(1);
      expect(record.details.missing_expressions?.[0].expr_id).toBe(
        'Prg_237:Task_5:Line_12:Expr_30'
      );
    });

    it('should add tags including phase and error code', async () => {
      const filepath = await captureFailure({
        programId: 237,
        programName: 'Vente GP',
        phase: 'VERIFY',
        error: 'Coverage low',
        context: {},
        tags: ['batch-b2', 'critical'],
        historyDir: TEST_HISTORY_DIR,
      });

      const content = fs.readFileSync(filepath, 'utf8');
      const record: FailureRecord = JSON.parse(content);

      expect(record.tags).toContain('batch-b2');
      expect(record.tags).toContain('critical');
      expect(record.tags).toContain('verify');
      expect(record.tags).toContain('err_coverage_low');
    });

    it('should generate unique filenames for concurrent failures', async () => {
      const filepath1 = await captureFailure({
        programId: 237,
        programName: 'Test 1',
        phase: 'VERIFY',
        error: 'Error 1',
        context: {},
        historyDir: TEST_HISTORY_DIR,
      });

      // Wait a bit to ensure different timestamp
      await new Promise((resolve) => setTimeout(resolve, 10));

      const filepath2 = await captureFailure({
        programId: 237,
        programName: 'Test 2',
        phase: 'VERIFY',
        error: 'Error 2',
        context: {},
        historyDir: TEST_HISTORY_DIR,
      });

      expect(filepath1).not.toBe(filepath2);
      expect(fs.existsSync(filepath1)).toBe(true);
      expect(fs.existsSync(filepath2)).toBe(true);
    });
  });

  describe('resolveFailure', () => {
    it('should add resolution details to existing failure', async () => {
      const filepath = await captureFailure({
        programId: 237,
        programName: 'Vente GP',
        phase: 'VERIFY',
        error: 'Coverage low',
        context: {},
        historyDir: TEST_HISTORY_DIR,
      });

      await resolveFailure(
        filepath,
        {
          action: 'Added missing tests',
          test_files_added: ['vente.test.ts:42'],
          resolved_by: 'John Doe',
          commit: 'abc123',
          verification_passed: true,
        },
        ['Always check coverage before verify']
      );

      const content = fs.readFileSync(filepath, 'utf8');
      const record: FailureRecord = JSON.parse(content);

      expect(record.resolution).toBeDefined();
      expect(record.resolution?.action).toBe('Added missing tests');
      expect(record.resolution?.test_files_added).toContain('vente.test.ts:42');
      expect(record.resolution?.resolved_by).toBe('John Doe');
      expect(record.resolution?.verification_passed).toBe(true);
      expect(record.lessons_learned).toContain(
        'Always check coverage before verify'
      );
    });

    it('should calculate resolution time in minutes', async () => {
      const filepath = await captureFailure({
        programId: 237,
        programName: 'Test',
        phase: 'VERIFY',
        error: 'Error',
        context: {},
        historyDir: TEST_HISTORY_DIR,
      });

      // Wait a bit to simulate resolution time
      await new Promise((resolve) => setTimeout(resolve, 100));

      await resolveFailure(filepath, {
        action: 'Fixed',
        verification_passed: true,
      });

      const content = fs.readFileSync(filepath, 'utf8');
      const record: FailureRecord = JSON.parse(content);

      expect(record.resolution?.resolution_time_minutes).toBeGreaterThanOrEqual(
        0
      );
    });

    it('should throw error if failure file not found', async () => {
      const fakePath = path.join(TEST_FAILURES_DIR, 'nonexistent.json');

      await expect(
        resolveFailure(fakePath, { action: 'Fixed', verification_passed: true })
      ).rejects.toThrow('Failure record not found');
    });
  });

  describe('listFailures', () => {
    it('should return empty array if no failures', () => {
      const files = listFailures(TEST_HISTORY_DIR);
      expect(files).toHaveLength(0);
    });

    it('should list all failure files', async () => {
      await captureFailure({
        programId: 237,
        programName: 'Test 1',
        phase: 'VERIFY',
        error: 'Error 1',
        context: {},
        historyDir: TEST_HISTORY_DIR,
      });

      await captureFailure({
        programId: 238,
        programName: 'Test 2',
        phase: 'EXTRACT',
        error: 'Error 2',
        context: {},
        historyDir: TEST_HISTORY_DIR,
      });

      const files = listFailures(TEST_HISTORY_DIR);
      expect(files).toHaveLength(2);
    });

    it('should only list JSON files with Prg_ prefix', async () => {
      await captureFailure({
        programId: 237,
        programName: 'Test',
        phase: 'VERIFY',
        error: 'Error',
        context: {},
        historyDir: TEST_HISTORY_DIR,
      });

      // Create non-failure files
      fs.writeFileSync(
        path.join(TEST_FAILURES_DIR, 'other.json'),
        '{}',
        'utf8'
      );
      fs.writeFileSync(
        path.join(TEST_FAILURES_DIR, 'README.md'),
        'readme',
        'utf8'
      );

      const files = listFailures(TEST_HISTORY_DIR);
      expect(files).toHaveLength(1);
      expect(files[0]).toContain('Prg_237');
    });
  });

  describe('getUnresolvedFailures', () => {
    it('should return only unresolved failures', async () => {
      const resolved = await captureFailure({
        programId: 237,
        programName: 'Resolved',
        phase: 'VERIFY',
        error: 'Error',
        context: {},
        historyDir: TEST_HISTORY_DIR,
      });

      await captureFailure({
        programId: 238,
        programName: 'Unresolved',
        phase: 'VERIFY',
        error: 'Error',
        context: {},
        historyDir: TEST_HISTORY_DIR,
      });

      // Resolve one
      await resolveFailure(resolved, {
        action: 'Fixed',
        verification_passed: true,
      });

      const unresolvedList = getUnresolvedFailures(TEST_HISTORY_DIR);
      expect(unresolvedList).toHaveLength(1);
      expect(unresolvedList[0].program_id).toBe(238);
    });
  });

  describe('getFailureStats', () => {
    it('should return correct statistics', async () => {
      await captureFailure({
        programId: 237,
        programName: 'Test 1',
        phase: 'VERIFY',
        error: 'Coverage low',
        context: {},
        historyDir: TEST_HISTORY_DIR,
      });

      const file2 = await captureFailure({
        programId: 238,
        programName: 'Test 2',
        phase: 'EXTRACT',
        error: 'File not found',
        context: {},
        historyDir: TEST_HISTORY_DIR,
      });

      // Resolve one
      await resolveFailure(file2, {
        action: 'Fixed',
        verification_passed: true,
      });

      const stats = getFailureStats(TEST_HISTORY_DIR);

      expect(stats.total).toBe(2);
      expect(stats.unresolved).toBe(1);
      expect(stats.byPhase.VERIFY).toBe(1);
      expect(stats.byPhase.EXTRACT).toBe(1);
      expect(stats.byErrorCode.ERR_COVERAGE_LOW).toBe(1);
      expect(stats.byErrorCode.ERR_FILE_NOT_FOUND).toBe(1);
      expect(stats.avgResolutionTime).toBeGreaterThanOrEqual(0);
    });

    it('should handle empty failures directory', () => {
      const stats = getFailureStats(TEST_HISTORY_DIR);
      expect(stats.total).toBe(0);
      expect(stats.unresolved).toBe(0);
    });
  });
});
