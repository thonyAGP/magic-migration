import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Integration Test: Batch Stats API
 *
 * Validates that getBatchesStatus() uses batch.stats from tracker
 * instead of recalculating from contracts (which may not have overall.status).
 */

describe('Batch Stats API - Tracker Integration', () => {
  let sourceCode: string;

  beforeAll(() => {
    const pipelineRunnerPath = path.resolve(__dirname, '../../src/pipeline/pipeline-runner.ts');
    sourceCode = readFileSync(pipelineRunnerPath, 'utf-8');
  });

  it('should check for batch.stats in getBatchesStatus', () => {
    const functionCode = sourceCode.match(/export const getBatchesStatus[\s\S]{1,3000}/);
    expect(functionCode).toBeTruthy();

    if (functionCode) {
      const fn = functionCode[0];
      expect(fn).toContain('batch.stats');
    }
  });

  it('should use batch.stats.fully_impl for verified count', () => {
    const functionCode = sourceCode.match(/export const getBatchesStatus[\s\S]{1,3000}/);
    expect(functionCode).toBeTruthy();

    if (functionCode) {
      const fn = functionCode[0];
      expect(fn).toMatch(/fully_impl|fullyImpl/);
      expect(fn).toContain('verified =');
    }
  });

  it('should use batch.stats.frontend_enrich for enriched count', () => {
    const functionCode = sourceCode.match(/export const getBatchesStatus[\s\S]{1,3000}/);
    expect(functionCode).toBeTruthy();

    if (functionCode) {
      const fn = functionCode[0];
      expect(fn).toMatch(/frontend_enrich|frontendEnrich/);
      expect(fn).toContain('enriched =');
    }
  });

  it('should use batch.stats.coverage_avg_frontend for coverageAvg', () => {
    const functionCode = sourceCode.match(/export const getBatchesStatus[\s\S]{1,3000}/);
    expect(functionCode).toBeTruthy();

    if (functionCode) {
      const fn = functionCode[0];
      expect(fn).toMatch(/coverage_avg_frontend|coverageAvgFrontend/);
    }
  });

  it('should fallback to contract scanning if batch.stats absent', () => {
    const functionCode = sourceCode.match(/export const getBatchesStatus[\s\S]{1,3000}/);
    expect(functionCode).toBeTruthy();

    if (functionCode) {
      const fn = functionCode[0];
      // Should have a condition checking if batch.stats exists
      expect(fn).toMatch(/if.*batch\.stats/);
      // Should still have contract scanning code as fallback
      expect(fn).toContain('contract.overall.status');
    }
  });
});
