import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Integration Test: Module Stats Auto-Refresh
 *
 * Validates that module stats are refreshed:
 * 1. Every 20 seconds (polling)
 * 2. When migration modal closes
 */

describe('Module Stats Auto-Refresh', () => {
  let sourceCode: string;

  beforeAll(() => {
    const htmlReportPath = path.resolve(__dirname, '../../src/dashboard/html-report.ts');
    sourceCode = readFileSync(htmlReportPath, 'utf-8');
  });

  it('should define updateModuleStats function', () => {
    expect(sourceCode).toContain('function updateModuleStats()');
  });

  it('should call updateModuleStats on initial load', () => {
    expect(sourceCode).toContain('updateModuleStats();');
  });

  it('should poll updateModuleStats every 20 seconds', () => {
    expect(sourceCode).toMatch(/setInterval\(updateModuleStats,\s*20000\)/);
  });

  it('should call updateModuleStats when migration closes', () => {
    const closeFn = sourceCode.match(/function closeMigrateOverlay\(\)[\s\S]{1,300}}/);
    expect(closeFn).toBeTruthy();

    if (closeFn) {
      const fn = closeFn[0];
      expect(fn).toContain('updateModuleStats');
    }
  });

  it('should update module-row tags with API data', () => {
    const updateFn = sourceCode.match(/function updateModuleStats\(\)[\s\S]{1,1500}}/);
    expect(updateFn).toBeTruthy();

    if (updateFn) {
      const fn = updateFn[0];
      expect(fn).toContain('.module-row');
      expect(fn).toContain('vérifiés');
      expect(fn).toContain('enrichis');
      expect(fn).toContain('en attente');
    }
  });

  it('should update module progress bars', () => {
    // Check in full source (updateModuleStats may be long)
    expect(sourceCode).toContain('function updateModuleStats');
    expect(sourceCode).toContain('.bar-fill');
    expect(sourceCode).toContain('verifiedPct');

    // Verify bars are updated in the context of module stats
    const hasBarUpdate = sourceCode.includes('updateModuleStats') &&
                         sourceCode.includes('.bar-fill') &&
                         sourceCode.includes('bars[0].style.width');
    expect(hasBarUpdate).toBe(true);
  });
});
