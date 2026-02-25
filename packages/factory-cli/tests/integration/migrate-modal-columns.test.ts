import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Integration Test: Migration Modal Columns
 *
 * Validates that html-report.ts contains the 3 new columns:
 * - Phase (last completed phase)
 * - En cours (current running phase)
 * - Tokens (input/output per program)
 */

describe('Migration Modal Columns - Source Code Validation', () => {
  let sourceCode: string;

  beforeAll(() => {
    const htmlReportPath = path.resolve(__dirname, '../../src/dashboard/html-report.ts');
    sourceCode = readFileSync(htmlReportPath, 'utf-8');
  });

  it('should include "Phase" column header in table HTML', () => {
    expect(sourceCode).toContain('<th>Phase</th>');
  });

  it('should include "En cours" column header in table HTML', () => {
    expect(sourceCode).toContain('<th>En cours</th>');
  });

  it('should include "Tokens" column header in table HTML', () => {
    expect(sourceCode).toContain('<th>Tokens</th>');
  });

  it('should generate rows with mp-phase cell creation', () => {
    expect(sourceCode).toMatch(/mp-phase.*id="mp-phase-/);
    expect(sourceCode).toContain("'<td class=\"mp-phase\" id=\"mp-phase-'");
  });

  it('should generate rows with mp-current cell creation', () => {
    expect(sourceCode).toMatch(/mp-current.*id="mp-current-/);
    expect(sourceCode).toContain("'<td class=\"mp-current\" id=\"mp-current-'");
  });

  it('should generate rows with mp-tokens cell creation', () => {
    expect(sourceCode).toMatch(/mp-tokens.*id="mp-tokens-/);
    expect(sourceCode).toContain("'<td class=\"mp-tokens\" id=\"mp-tokens-'");
  });

  it('should NOT contain mp-task-info section (removed)', () => {
    expect(sourceCode).not.toContain('id="mp-task-info"');
    expect(sourceCode).not.toContain('id="mp-last-task"');
    expect(sourceCode).not.toContain('id="mp-current-task"');
  });

  it('should NOT contain updateTaskInfoDisplay function (removed)', () => {
    expect(sourceCode).not.toContain('function updateTaskInfoDisplay');
    expect(sourceCode).not.toContain('updateTaskInfoDisplay()');
  });

  it('should initialize estimatedDurationMs from estimatedHours', () => {
    expect(sourceCode).toContain('migrateState.estimatedHours');
    expect(sourceCode).toContain('migrateState.estimatedDurationMs = migrateState.estimatedHours * 3600000');
  });

  it('should update mp-phase cell on phase_started event', () => {
    // Check that phase_started handler updates mp-phase cell
    expect(sourceCode).toMatch(/phaseCell.*=.*getElementById.*mp-phase/);
    expect(sourceCode).toMatch(/phaseCell.*textContent.*=.*prev/);
  });

  it('should update mp-current cell on phase_started event', () => {
    // Check that phase_started handler updates mp-current cell
    expect(sourceCode).toMatch(/currentCell.*=.*getElementById.*mp-current/);
    expect(sourceCode).toMatch(/currentCell.*textContent.*=.*phase/);
  });

  it('should clear mp-current cell on phase_completed event', () => {
    // Check that phase_completed handler clears mp-current cell
    expect(sourceCode).toMatch(/currentCell.*getElementById.*mp-current/);
    expect(sourceCode).toMatch(/currentCell.*textContent = ''/);
  });

  it('should clear mp-current cell on program_completed event', () => {
    // Check that program_completed handler clears mp-current cell
    const programCompletedSection = sourceCode.match(/if \(msg\.type === 'program_completed'\)[\s\S]{1,2000}/);
    expect(programCompletedSection).toBeTruthy();

    if (programCompletedSection) {
      const section = programCompletedSection[0];
      expect(section).toContain("getElementById('mp-current-'");
      expect(section).toMatch(/textContent = ''/);
    }
  });

  it('should update mp-tokens cell on program_completed event', () => {
    // Check that program_completed handler updates mp-tokens cell
    expect(sourceCode).toMatch(/tokenCell.*getElementById.*mp-tokens/);
    expect(sourceCode).toMatch(/tokenCell.*textContent.*=.*formatTokens/);
  });

  it('should have correct table structure with 9 columns', () => {
    // Extract thead HTML
    const theadMatch = sourceCode.match(/<thead><tr>(.*?)<\/tr><\/thead>/);
    expect(theadMatch).toBeTruthy();

    if (theadMatch) {
      const thead = theadMatch[1];
      // Count <th> tags
      const thCount = (thead.match(/<th>/g) || []).length;
      expect(thCount).toBe(9); // IDE, Programme, Icon, Durée, Phase, Phases, En cours, ETA, Tokens
    }
  });

  it('should have correct row structure with 9 cells', () => {
    // Check that all 9 cell IDs are generated in tr.innerHTML
    const cellIds = [
      'mp-icon-',
      'mp-dur-',
      'mp-phase-',
      'mp-current-',
      'mp-eta-',
      'mp-tokens-',
    ];

    for (const cellId of cellIds) {
      expect(sourceCode).toMatch(new RegExp(`id="${cellId}`));
    }

    // Also check for mp-dots div (phases column)
    expect(sourceCode).toContain('<div class="mp-dots">');
  });
});
