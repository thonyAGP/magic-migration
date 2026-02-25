import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Integration Test: phase_progress event handling
 *
 * Validates that phase_progress updates "En cours" column,
 * not the mp-phase-label in dots.
 */

describe('Migration Modal - phase_progress Event Handling', () => {
  let sourceCode: string;

  beforeAll(() => {
    const htmlReportPath = path.resolve(__dirname, '../../src/dashboard/html-report.ts');
    sourceCode = readFileSync(htmlReportPath, 'utf-8');
  });

  it('should handle phase_progress event', () => {
    expect(sourceCode).toContain("if (msg.type === 'phase_progress')");
  });

  it('should update mp-current cell on phase_progress', () => {
    // Check that phase_progress handler updates mp-current column
    const progressHandler = sourceCode.match(/if \(msg\.type === 'phase_progress'\)[\s\S]{1,500}return;/);
    expect(progressHandler).toBeTruthy();

    if (progressHandler) {
      const handler = progressHandler[0];
      expect(handler).toContain("getElementById('mp-current-'");
      expect(handler).toContain('currentCell.textContent');
    }
  });

  it('should NOT update mp-phase-label on phase_progress', () => {
    // The old behavior (updating mp-phase-label in dots) should be removed
    const progressHandler = sourceCode.match(/if \(msg\.type === 'phase_progress'\)[\s\S]{1,500}return;/);
    expect(progressHandler).toBeTruthy();

    if (progressHandler) {
      const handler = progressHandler[0];
      expect(handler).not.toContain("querySelector('.mp-phase-label'");
      expect(handler).not.toContain('labelEl.textContent');
      expect(handler).not.toContain('labelEl.classList.add');
    }
  });

  it('should NOT generate mp-phase-label spans in dots', () => {
    // The mp-phase-label spans should be removed from HTML generation
    expect(sourceCode).not.toContain('<span class="mp-phase-label"');
  });

  it('should use stable ETA calculation in updateProgramETA', () => {
    // Check that updateProgramETA handles both regular and batch phases
    const etaFunction = sourceCode.match(/function updateProgramETA[\s\S]{1,2000}}/);
    expect(etaFunction).toBeTruthy();

    if (etaFunction) {
      const fn = etaFunction[0];
      // Should handle batch phases (review) differently
      expect(fn).toContain('batchPhaseActive');
      // Should use batchProgress for batch phase ETA
      expect(fn).toContain('batchProgress');
      // Should use estimatedDurationMs as fallback for regular phases
      expect(fn).toContain('migrateState.estimatedDurationMs');
      // Should NOT use the old formula: elapsed / completed
      expect(fn).not.toMatch(/avgPerPhase\s*=\s*elapsed\s*\/\s*completed/);
    }
  });

  it('should extract label from msg.data.label in phase_progress', () => {
    const progressHandler = sourceCode.match(/if \(msg\.type === 'phase_progress'\)[\s\S]{1,500}return;/);
    expect(progressHandler).toBeTruthy();

    if (progressHandler) {
      const handler = progressHandler[0];
      // Should check msg.data.label first
      expect(handler).toMatch(/msg\.data.*label/);
    }
  });
});
