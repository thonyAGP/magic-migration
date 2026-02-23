/**
 * Coherence Checker - Detects and fixes desynchronization between
 * generated code and existing codebase (pages barrel, exports, imports, component barrels).
 *
 * Zero external dependencies. Regex-based (no AST parser needed).
 */

import fs from 'node:fs';
import path from 'node:path';

export interface CoherenceResult {
  check: string;
  status: 'ok' | 'warn' | 'error';
  message: string;
  fix?: { file: string; action: string; content?: string };
}

export interface CoherenceOptions {
  fix?: boolean;
}

// Known import alias rewrites: wrong path → correct path
const IMPORT_ALIAS_MAP: Record<string, string> = {
  '@/components/ui/DataGrid': '@/components/data/DataGrid',
  '@/components/ui/DataGridPagination': '@/components/data/DataGridPagination',
  '@/components/ui/DataGridSkeleton': '@/components/data/DataGridSkeleton',
};

/**
 * C1: Check that every page .tsx exports a default export.
 * Generated pages use `export const XxxPage = ...` without default.
 * App.tsx imports many pages as default imports.
 */
const checkPageExports = (pagesDir: string, options: CoherenceOptions): CoherenceResult[] => {
  const results: CoherenceResult[] = [];

  if (!fs.existsSync(pagesDir)) return results;

  const pageFiles = fs.readdirSync(pagesDir).filter(f => f.endsWith('.tsx') && f !== 'index.tsx');

  for (const file of pageFiles) {
    const filePath = path.join(pagesDir, file);
    const content = fs.readFileSync(filePath, 'utf8');

    const hasDefaultExport = /export default \w+/.test(content);
    const namedExportMatch = content.match(/export const (\w+Page)\b/);

    if (hasDefaultExport) {
      results.push({ check: 'C1-export', status: 'ok', message: `${file}: has default export` });
      continue;
    }

    if (!namedExportMatch) {
      results.push({ check: 'C1-export', status: 'warn', message: `${file}: no Page export found` });
      continue;
    }

    const exportName = namedExportMatch[1];

    if (options.fix) {
      const trimmed = content.trimEnd();
      const newContent = trimmed + `\n\nexport default ${exportName};\n`;
      fs.writeFileSync(filePath, newContent, 'utf8');
      results.push({
        check: 'C1-export',
        status: 'warn',
        message: `${file}: added default export for ${exportName}`,
        fix: { file: filePath, action: 'add-default-export', content: `export default ${exportName};` },
      });
    } else {
      results.push({
        check: 'C1-export',
        status: 'error',
        message: `${file}: missing default export (has named: ${exportName})`,
        fix: { file: filePath, action: 'add-default-export', content: `export default ${exportName};` },
      });
    }
  }

  return results;
};

/**
 * C2: Check that pages/index.ts barrel re-exports all page files.
 * Pages present on disk but absent from the barrel cause import failures
 * when using `import { XxxPage } from '@/pages'`.
 */
const checkPagesBarrel = (pagesDir: string, options: CoherenceOptions): CoherenceResult[] => {
  const results: CoherenceResult[] = [];
  const barrelPath = path.join(pagesDir, 'index.ts');

  if (!fs.existsSync(pagesDir)) return results;

  const pageFiles = fs.readdirSync(pagesDir)
    .filter(f => f.endsWith('.tsx') && f !== 'index.tsx')
    .map(f => f.replace('.tsx', ''));

  if (!fs.existsSync(barrelPath)) {
    if (pageFiles.length === 0) return results;

    if (options.fix) {
      const lines = pageFiles.map(p => `export { ${p} } from './${p}';`);
      fs.writeFileSync(barrelPath, lines.join('\n') + '\n', 'utf8');
      results.push({
        check: 'C2-barrel',
        status: 'warn',
        message: `pages/index.ts: created with ${pageFiles.length} exports`,
        fix: { file: barrelPath, action: 'create-barrel' },
      });
    } else {
      results.push({
        check: 'C2-barrel',
        status: 'error',
        message: `pages/index.ts: missing (${pageFiles.length} pages on disk)`,
        fix: { file: barrelPath, action: 'create-barrel' },
      });
    }
    return results;
  }

  const barrelContent = fs.readFileSync(barrelPath, 'utf8');

  // Extract already-exported names from barrel
  const exportedModules = new Set<string>();
  const exportRegex = /export\s+\{[^}]*\}\s+from\s+['"]\.\/([\w-]+)['"]/g;
  let match: RegExpExecArray | null;
  while ((match = exportRegex.exec(barrelContent)) !== null) {
    exportedModules.add(match[1]);
  }

  const missing = pageFiles.filter(p => !exportedModules.has(p));

  if (missing.length === 0) {
    results.push({ check: 'C2-barrel', status: 'ok', message: `pages/index.ts: all ${pageFiles.length} pages exported` });
    return results;
  }

  if (options.fix) {
    const newLines = missing.map(p => `export { ${p} } from './${p}';`);
    const updatedContent = barrelContent.trimEnd() + '\n' + newLines.join('\n') + '\n';
    fs.writeFileSync(barrelPath, updatedContent, 'utf8');
    results.push({
      check: 'C2-barrel',
      status: 'warn',
      message: `pages/index.ts: added ${missing.length} missing exports (${missing.join(', ')})`,
      fix: { file: barrelPath, action: 'add-exports' },
    });
  } else {
    results.push({
      check: 'C2-barrel',
      status: 'error',
      message: `pages/index.ts: ${missing.length} pages missing from barrel (${missing.slice(0, 5).join(', ')}${missing.length > 5 ? '...' : ''})`,
      fix: { file: barrelPath, action: 'add-exports' },
    });
  }

  return results;
};

/**
 * C3: Check import paths resolve to correct locations.
 * The generator may produce `@/components/ui/DataGrid` when the real path is `@/components/data/DataGrid`.
 */
const checkImportResolve = (targetDir: string, options: CoherenceOptions): CoherenceResult[] => {
  const results: CoherenceResult[] = [];

  if (!fs.existsSync(targetDir)) return results;

  const scanDirs = ['pages', 'components', 'stores'].map(d => path.join(targetDir, d));
  const tsFiles: string[] = [];

  for (const dir of scanDirs) {
    if (!fs.existsSync(dir)) continue;
    collectTsFiles(dir, tsFiles);
  }

  let totalFixed = 0;

  for (const filePath of tsFiles) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    for (const [wrongPath, correctPath] of Object.entries(IMPORT_ALIAS_MAP)) {
      // Match import statements with the wrong path
      const escapedWrong = wrongPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const importRegex = new RegExp(`from\\s+['"]${escapedWrong}['"]`, 'g');

      if (importRegex.test(content)) {
        if (options.fix) {
          content = content.replace(
            new RegExp(`from\\s+['"]${escapedWrong}['"]`, 'g'),
            `from '${correctPath}'`,
          );
          modified = true;
          totalFixed++;
        } else {
          const relPath = path.relative(targetDir, filePath).replace(/\\/g, '/');
          results.push({
            check: 'C3-import',
            status: 'error',
            message: `${relPath}: wrong import ${wrongPath} → should be ${correctPath}`,
            fix: { file: filePath, action: 'rewrite-import' },
          });
        }
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
    }
  }

  if (options.fix && totalFixed > 0) {
    results.push({
      check: 'C3-import',
      status: 'warn',
      message: `Fixed ${totalFixed} wrong import path(s)`,
    });
  } else if (!options.fix && results.filter(r => r.check === 'C3-import').length === 0) {
    results.push({ check: 'C3-import', status: 'ok', message: 'All import paths resolve correctly' });
  }

  return results;
};

/**
 * C4: Check component barrel coherence.
 * For each components/{domain}/index.ts, verify that exported modules exist as files
 * and that all files in the directory are re-exported.
 */
const checkComponentBarrels = (targetDir: string, options: CoherenceOptions): CoherenceResult[] => {
  const results: CoherenceResult[] = [];
  const componentsDir = path.join(targetDir, 'components');

  if (!fs.existsSync(componentsDir)) return results;

  const subDirs = fs.readdirSync(componentsDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  for (const subDir of subDirs) {
    const dirPath = path.join(componentsDir, subDir);
    const barrelPath = path.join(dirPath, 'index.ts');

    if (!fs.existsSync(barrelPath)) continue;

    const barrelContent = fs.readFileSync(barrelPath, 'utf8');

    // Extract exports from barrel
    const exportedModules = new Set<string>();
    const exportRegex = /from\s+['"]\.\/([\w-]+)['"]/g;
    let match: RegExpExecArray | null;
    while ((match = exportRegex.exec(barrelContent)) !== null) {
      exportedModules.add(match[1]);
    }

    // Scan actual component files (not index.ts, not test/stories files)
    const componentFiles = fs.readdirSync(dirPath)
      .filter(f =>
        (f.endsWith('.tsx') || f.endsWith('.ts')) &&
        f !== 'index.ts' &&
        !f.endsWith('.test.ts') &&
        !f.endsWith('.test.tsx') &&
        !f.endsWith('.stories.tsx') &&
        !f.endsWith('.stories.ts') &&
        f !== 'types.ts',
      )
      .map(f => f.replace(/\.(tsx|ts)$/, ''));

    // Check: exports referencing non-existent files
    for (const exported of exportedModules) {
      if (!componentFiles.includes(exported)) {
        results.push({
          check: 'C4-component-barrel',
          status: 'error',
          message: `components/${subDir}/index.ts: exports '${exported}' but file not found`,
        });
      }
    }

    // Check: files not exported in barrel
    const missing = componentFiles.filter(f => !exportedModules.has(f));
    if (missing.length > 0) {
      if (options.fix) {
        const newLines = missing.map(m => `export { ${m} } from './${m}';`);
        const updatedContent = barrelContent.trimEnd() + '\n' + newLines.join('\n') + '\n';
        fs.writeFileSync(barrelPath, updatedContent, 'utf8');
        results.push({
          check: 'C4-component-barrel',
          status: 'warn',
          message: `components/${subDir}/index.ts: added ${missing.length} missing export(s)`,
          fix: { file: barrelPath, action: 'add-exports' },
        });
      } else {
        results.push({
          check: 'C4-component-barrel',
          status: 'warn',
          message: `components/${subDir}/index.ts: ${missing.length} file(s) not exported (${missing.join(', ')})`,
          fix: { file: barrelPath, action: 'add-exports' },
        });
      }
    }
  }

  if (results.filter(r => r.check === 'C4-component-barrel').length === 0) {
    results.push({ check: 'C4-component-barrel', status: 'ok', message: 'All component barrels are coherent' });
  }

  return results;
};

/** Recursively collect .ts/.tsx files */
const collectTsFiles = (dir: string, out: string[]): void => {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectTsFiles(fullPath, out);
    } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
      out.push(fullPath);
    }
  }
};

/**
 * Main entry point: run all 4 coherence checks on a target directory.
 */
export const checkCoherence = (targetDir: string, options?: CoherenceOptions): CoherenceResult[] => {
  const opts = options ?? {};
  const pagesDir = path.join(targetDir, 'pages');

  const results: CoherenceResult[] = [
    ...checkPageExports(pagesDir, opts),
    ...checkPagesBarrel(pagesDir, opts),
    ...checkImportResolve(targetDir, opts),
    ...checkComponentBarrels(targetDir, opts),
  ];

  return results;
};

/** Summary stats from coherence results */
export const summarizeResults = (results: CoherenceResult[]): { ok: number; warn: number; error: number } => {
  let ok = 0, warn = 0, error = 0;
  for (const r of results) {
    if (r.status === 'ok') ok++;
    else if (r.status === 'warn') warn++;
    else error++;
  }
  return { ok, warn, error };
};
