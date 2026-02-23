import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { checkCoherence, summarizeResults } from '../src/coherence/checker.js';

const createTmpDir = (): string => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'coherence-'));
  return dir;
};

const setupDir = (base: string, files: Record<string, string>): void => {
  for (const [relPath, content] of Object.entries(files)) {
    const fullPath = path.join(base, relPath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, content, 'utf8');
  }
};

let tmpDir: string;

beforeEach(() => {
  tmpDir = createTmpDir();
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

// ─── C1: Page export pattern ────────────────────────────────

describe('C1 - Page export pattern', () => {
  it('should report ok when page has default export', () => {
    setupDir(tmpDir, {
      'pages/FooPage.tsx': 'export const FooPage = () => {};\nexport default FooPage;\n',
    });
    const results = checkCoherence(tmpDir);
    const c1 = results.filter(r => r.check === 'C1-export');
    expect(c1).toHaveLength(1);
    expect(c1[0].status).toBe('ok');
  });

  it('should report error when page has named export but no default', () => {
    setupDir(tmpDir, {
      'pages/BarPage.tsx': 'export const BarPage = () => {};\n',
    });
    const results = checkCoherence(tmpDir);
    const c1 = results.filter(r => r.check === 'C1-export');
    expect(c1).toHaveLength(1);
    expect(c1[0].status).toBe('error');
    expect(c1[0].message).toContain('missing default export');
  });

  it('should fix missing default export when fix=true', () => {
    setupDir(tmpDir, {
      'pages/BazPage.tsx': 'export const BazPage = () => {};\n',
    });
    const results = checkCoherence(tmpDir, { fix: true });
    const c1 = results.filter(r => r.check === 'C1-export');
    expect(c1).toHaveLength(1);
    expect(c1[0].status).toBe('warn');

    const content = fs.readFileSync(path.join(tmpDir, 'pages/BazPage.tsx'), 'utf8');
    expect(content).toContain('export default BazPage;');
  });

  it('should not double-add default export on repeated fix', () => {
    setupDir(tmpDir, {
      'pages/DoublePage.tsx': 'export const DoublePage = () => {};\n',
    });
    checkCoherence(tmpDir, { fix: true });
    checkCoherence(tmpDir, { fix: true }); // second pass
    const content = fs.readFileSync(path.join(tmpDir, 'pages/DoublePage.tsx'), 'utf8');
    const matches = content.match(/export default/g);
    expect(matches).toHaveLength(1);
  });

  it('should skip index.tsx', () => {
    setupDir(tmpDir, {
      'pages/index.tsx': 'export const something = 42;\n',
    });
    const results = checkCoherence(tmpDir);
    const c1 = results.filter(r => r.check === 'C1-export');
    expect(c1).toHaveLength(0);
  });
});

// ─── C2: Pages barrel sync ──────────────────────────────────

describe('C2 - Pages barrel sync', () => {
  it('should report ok when all pages are in barrel', () => {
    setupDir(tmpDir, {
      'pages/AlphaPage.tsx': 'export const AlphaPage = () => {};\nexport default AlphaPage;\n',
      'pages/BetaPage.tsx': 'export const BetaPage = () => {};\nexport default BetaPage;\n',
      'pages/index.ts': "export { AlphaPage } from './AlphaPage';\nexport { BetaPage } from './BetaPage';\n",
    });
    const results = checkCoherence(tmpDir);
    const c2 = results.filter(r => r.check === 'C2-barrel');
    expect(c2).toHaveLength(1);
    expect(c2[0].status).toBe('ok');
  });

  it('should report error when pages are missing from barrel', () => {
    setupDir(tmpDir, {
      'pages/AlphaPage.tsx': 'export const AlphaPage = () => {};\n',
      'pages/BetaPage.tsx': 'export const BetaPage = () => {};\n',
      'pages/index.ts': "export { AlphaPage } from './AlphaPage';\n",
    });
    const results = checkCoherence(tmpDir);
    const c2 = results.filter(r => r.check === 'C2-barrel');
    expect(c2).toHaveLength(1);
    expect(c2[0].status).toBe('error');
    expect(c2[0].message).toContain('1 pages missing');
  });

  it('should fix missing barrel entries when fix=true', () => {
    setupDir(tmpDir, {
      'pages/AlphaPage.tsx': 'export const AlphaPage = () => {};\n',
      'pages/GammaPage.tsx': 'export const GammaPage = () => {};\n',
      'pages/index.ts': "export { AlphaPage } from './AlphaPage';\n",
    });
    checkCoherence(tmpDir, { fix: true });
    const barrel = fs.readFileSync(path.join(tmpDir, 'pages/index.ts'), 'utf8');
    expect(barrel).toContain("export { GammaPage } from './GammaPage'");
  });

  it('should create barrel from scratch when missing and fix=true', () => {
    setupDir(tmpDir, {
      'pages/OnlyPage.tsx': 'export const OnlyPage = () => {};\n',
    });
    checkCoherence(tmpDir, { fix: true });
    expect(fs.existsSync(path.join(tmpDir, 'pages/index.ts'))).toBe(true);
    const barrel = fs.readFileSync(path.join(tmpDir, 'pages/index.ts'), 'utf8');
    expect(barrel).toContain("export { OnlyPage } from './OnlyPage'");
  });
});

// ─── C3: Import resolve ─────────────────────────────────────

describe('C3 - Import resolve', () => {
  it('should report ok when imports are correct', () => {
    setupDir(tmpDir, {
      'pages/TestPage.tsx': "import { DataGrid } from '@/components/data/DataGrid';\nexport const TestPage = () => {};\n",
    });
    const results = checkCoherence(tmpDir);
    const c3 = results.filter(r => r.check === 'C3-import');
    expect(c3).toHaveLength(1);
    expect(c3[0].status).toBe('ok');
  });

  it('should report error for wrong DataGrid import path', () => {
    setupDir(tmpDir, {
      'pages/BadPage.tsx': "import { DataGrid } from '@/components/ui/DataGrid';\nexport const BadPage = () => {};\n",
    });
    const results = checkCoherence(tmpDir);
    const c3 = results.filter(r => r.check === 'C3-import');
    expect(c3.some(r => r.status === 'error')).toBe(true);
    expect(c3[0].message).toContain('@/components/ui/DataGrid');
  });

  it('should fix wrong import path when fix=true', () => {
    setupDir(tmpDir, {
      'pages/FixPage.tsx': "import { DataGrid } from '@/components/ui/DataGrid';\nexport const FixPage = () => {};\n",
    });
    checkCoherence(tmpDir, { fix: true });
    const content = fs.readFileSync(path.join(tmpDir, 'pages/FixPage.tsx'), 'utf8');
    expect(content).toContain("from '@/components/data/DataGrid'");
    expect(content).not.toContain('@/components/ui/DataGrid');
  });
});

// ─── C4: Component barrel coherence ─────────────────────────

describe('C4 - Component barrel coherence', () => {
  it('should report ok when barrel matches files', () => {
    setupDir(tmpDir, {
      'components/session/SessionCard.tsx': 'export const SessionCard = () => {};\n',
      'components/session/index.ts': "export { SessionCard } from './SessionCard';\n",
    });
    const results = checkCoherence(tmpDir);
    const c4 = results.filter(r => r.check === 'C4-component-barrel');
    expect(c4).toHaveLength(1);
    expect(c4[0].status).toBe('ok');
  });

  it('should report error when barrel exports non-existent file', () => {
    setupDir(tmpDir, {
      'components/ui/index.ts': "export { Ghost } from './Ghost';\n",
    });
    const results = checkCoherence(tmpDir);
    const c4 = results.filter(r => r.check === 'C4-component-barrel');
    expect(c4.some(r => r.status === 'error')).toBe(true);
    expect(c4[0].message).toContain('Ghost');
  });

  it('should warn about files not exported in barrel', () => {
    setupDir(tmpDir, {
      'components/caisse/Button.tsx': 'export const Button = () => {};\n',
      'components/caisse/Input.tsx': 'export const Input = () => {};\n',
      'components/caisse/index.ts': "export { Button } from './Button';\n",
    });
    const results = checkCoherence(tmpDir);
    const c4 = results.filter(r => r.check === 'C4-component-barrel');
    expect(c4.some(r => r.message.includes('Input'))).toBe(true);
  });

  it('should fix missing component barrel exports when fix=true', () => {
    setupDir(tmpDir, {
      'components/forms/FormA.tsx': 'export const FormA = () => {};\n',
      'components/forms/FormB.tsx': 'export const FormB = () => {};\n',
      'components/forms/index.ts': "export { FormA } from './FormA';\n",
    });
    checkCoherence(tmpDir, { fix: true });
    const barrel = fs.readFileSync(path.join(tmpDir, 'components/forms/index.ts'), 'utf8');
    expect(barrel).toContain("export { FormB } from './FormB'");
  });

  it('should skip test and stories files', () => {
    setupDir(tmpDir, {
      'components/data/DataGrid.tsx': 'export const DataGrid = () => {};\n',
      'components/data/DataGrid.test.tsx': 'test("ok", () => {});\n',
      'components/data/DataGrid.stories.tsx': 'export default {};\n',
      'components/data/types.ts': 'export type Foo = string;\n',
      'components/data/index.ts': "export { DataGrid } from './DataGrid';\n",
    });
    const results = checkCoherence(tmpDir);
    const c4 = results.filter(r => r.check === 'C4-component-barrel');
    expect(c4).toHaveLength(1);
    expect(c4[0].status).toBe('ok');
  });
});

// ─── summarizeResults ───────────────────────────────────────

describe('summarizeResults', () => {
  it('should count ok/warn/error', () => {
    const results = [
      { check: 'C1', status: 'ok' as const, message: 'ok' },
      { check: 'C2', status: 'warn' as const, message: 'w' },
      { check: 'C3', status: 'error' as const, message: 'e' },
      { check: 'C4', status: 'ok' as const, message: 'ok2' },
    ];
    const summary = summarizeResults(results);
    expect(summary.ok).toBe(2);
    expect(summary.warn).toBe(1);
    expect(summary.error).toBe(1);
  });
});

// ─── Edge cases ─────────────────────────────────────────────

describe('Edge cases', () => {
  it('should handle empty target directory', () => {
    const results = checkCoherence(tmpDir);
    expect(results.length).toBeGreaterThanOrEqual(0);
    const errors = results.filter(r => r.status === 'error');
    expect(errors).toHaveLength(0);
  });

  it('should handle non-existent target directory', () => {
    const results = checkCoherence(path.join(tmpDir, 'nonexistent'));
    expect(results).toHaveLength(0);
  });
});
