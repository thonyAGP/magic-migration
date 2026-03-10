/**
 * Programmatic Coverage Checker - Deterministic analysis of contract→code coverage.
 * Scans generated files for RM-XXX rule IDs, table references, variables, and callee functions.
 * Used by phase-review as fallback and by coverage-audit CLI as standalone.
 */

import fs from 'node:fs';
import path from 'node:path';
import type { MigrationContract } from '../../core/types.js';
import type { CoverageReport, CoverageItem, AnalysisDocument } from '../migrate-types.js';
import type { MigrateConfig } from '../migrate-types.js';
import { buildContext } from '../migrate-context.js';

// ─── File Scanner ─────────────────────────────────────────────

interface FileContent {
  path: string;
  content: string;
  lines: string[];
}

const loadGeneratedFiles = (
  targetDir: string,
  domain: string,
  domainPascal: string,
): FileContent[] => {
  const files: FileContent[] = [];

  const candidates = [
    path.join(targetDir, 'src', 'types', `${domain}.ts`),
    path.join(targetDir, 'src', 'stores', `${domain}Store.ts`),
    path.join(targetDir, 'src', 'services', 'api', `endpoints-${domain}.ts`),
    path.join(targetDir, 'src', 'pages', `${domainPascal}Page.tsx`),
  ];

  // Also scan component directories
  const compDir = path.join(targetDir, 'src', 'components', 'caisse', domain);
  if (fs.existsSync(compDir)) {
    const compFiles = fs.readdirSync(compDir).filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));
    for (const f of compFiles) {
      candidates.push(path.join(compDir, f));
    }
  }

  for (const filePath of candidates) {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      files.push({
        path: filePath,
        content,
        lines: content.split('\n'),
      });
    }
  }

  return files;
};

// ─── Search helpers ───────────────────────────────────────────

const findInFiles = (
  files: FileContent[],
  patterns: string[],
  requireCodeLine = false,
): { found: boolean; file?: string; line?: number } => {
  for (const file of files) {
    for (const pattern of patterns) {
      const lowerPattern = pattern.toLowerCase();
      for (let i = 0; i < file.lines.length; i++) {
        if (file.lines[i].toLowerCase().includes(lowerPattern)) {
          if (requireCodeLine) {
            const trimmed = file.lines[i].trim();
            if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
              continue;
            }
          }
          return {
            found: true,
            file: path.basename(file.path),
            line: i + 1,
          };
        }
      }
    }
  }
  return { found: false };
};

const normalizeTableName = (name: string): string =>
  name.replace(/[-_\s]+/g, '').toLowerCase();

// ─── Main Checker ─────────────────────────────────────────────

export const checkContractCoverage = (
  contract: MigrationContract,
  files: FileContent[],
): CoverageReport => {
  const rules: CoverageItem[] = [];
  const tables: CoverageItem[] = [];
  const variables: CoverageItem[] = [];
  const callees: CoverageItem[] = [];
  const gaps: string[] = [];

  // 1. Check rules — STRICT: RM-XXX must be on a CODE line (inline comment), not standalone comment
  for (const rule of contract.rules) {
    const result = findInFiles(files, [rule.id], true);
    if (result.found) {
      rules.push({ id: rule.id, name: rule.description, found: true, file: result.file, line: result.line });
    } else {
      rules.push({ id: rule.id, name: rule.description, found: false });
      gaps.push(`Rule ${rule.id}: ${rule.description}`);
    }
  }

  // 2. Check tables
  for (const table of contract.tables) {
    const tableName = String(table.name);
    const normalized = normalizeTableName(tableName);
    const patterns = [
      tableName,
      normalized,
      // Also try camelCase variants
      tableName.replace(/[-_]+(.)/g, (_, c: string) => c.toUpperCase()),
    ];
    const result = findInFiles(files, patterns);
    tables.push({
      id: String(table.id),
      name: tableName,
      found: result.found,
      file: result.file,
      line: result.line,
    });
    if (!result.found) {
      gaps.push(`Table ${table.id}: ${tableName} (${table.mode})`);
    }
  }

  // 3. Check variables
  for (const variable of contract.variables) {
    const patterns = [variable.name, variable.localId];
    // Also add camelCase variant
    const camelName = variable.name
      .replace(/[-_]+(.)/g, (_, c: string) => c.toUpperCase())
      .replace(/^(.)/, (_, c: string) => c.toLowerCase());
    patterns.push(camelName);

    const result = findInFiles(files, patterns);
    variables.push({
      id: variable.localId,
      name: variable.name,
      found: result.found,
      file: result.file,
      line: result.line,
    });
    if (!result.found) {
      gaps.push(`Variable ${variable.localId}: ${variable.name}`);
    }
  }

  // 4. Check callees
  for (const callee of contract.callees) {
    const calleeName = String(callee.name);
    const patterns = [
      calleeName,
      calleeName.replace(/[-_]+(.)/g, (_, c: string) => c.toUpperCase()),
      calleeName.replace(/[-_\s]+/g, '').toLowerCase(),
    ];
    const result = findInFiles(files, patterns);
    callees.push({
      id: String(callee.id),
      name: calleeName,
      found: result.found,
      file: result.file,
      line: result.line,
    });
    if (!result.found) {
      gaps.push(`Callee ${callee.id}: ${calleeName}`);
    }
  }

  // 5. Compute coverage
  const totalItems = rules.length + tables.length + variables.length + callees.length;
  const foundItems = rules.filter(r => r.found).length
    + tables.filter(t => t.found).length
    + variables.filter(v => v.found).length
    + callees.filter(c => c.found).length;

  const coveragePct = totalItems > 0 ? Math.round((foundItems / totalItems) * 100) : 0;

  // Flag sparse contracts so REMEDIATE knows to use spec-guided fallback
  if (rules.length === 0 && totalItems <= 2) {
    gaps.push('SPARSE_CONTRACT: No rules defined — programmatic coverage unreliable. Needs spec-guided review.');
  }

  return {
    programId: contract.program.id,
    rules,
    tables,
    variables,
    callees,
    coveragePct,
    gaps,
  };
};

// ─── Convenience: check by programId + config ─────────────────

export const checkCoverageForProgram = (
  programId: string | number,
  config: MigrateConfig,
  analysis?: AnalysisDocument | null,
): CoverageReport | null => {
  const ctx = buildContext(programId, config);
  if (!ctx.contract) return null;

  const domain = analysis?.domain ?? ctx.analysis?.domain;
  const domainPascal = analysis?.domainPascal ?? ctx.analysis?.domainPascal;

  if (!domain || !domainPascal) return null;

  const files = loadGeneratedFiles(config.targetDir, domain, domainPascal);
  return checkContractCoverage(ctx.contract, files);
};

// ─── Format report for CLI display ────────────────────────────

export const formatCoverageReport = (report: CoverageReport, programName?: string): string => {
  const lines: string[] = [];
  const header = programName
    ? `=== Coverage Audit: IDE ${report.programId} (${programName}) ===`
    : `=== Coverage Audit: IDE ${report.programId} ===`;
  lines.push(header);

  const fmtSection = (label: string, items: CoverageItem[]) => {
    const found = items.filter(i => i.found).length;
    const icon = found === items.length ? '  ' : '  ';
    lines.push(`${label}: ${found}/${items.length} IMPL (${items.length > 0 ? Math.round((found / items.length) * 100) : 0}%) ${icon}`);
    for (const item of items) {
      const status = item.found ? '  OK' : '  MISSING';
      const loc = item.file ? ` -> ${item.file}${item.line ? ':' + item.line : ''}` : ' -> NOT FOUND';
      lines.push(`  ${status} ${item.id}: ${item.name}${loc}`);
    }
  };

  if (report.rules.length > 0) fmtSection('Rules', report.rules);
  if (report.tables.length > 0) fmtSection('Tables', report.tables);
  if (report.variables.length > 0) fmtSection('Variables', report.variables);
  if (report.callees.length > 0) fmtSection('Callees', report.callees);

  lines.push('');
  lines.push(`TOTAL: ${report.coveragePct}% coverage`);

  if (report.gaps.length > 0) {
    lines.push('');
    lines.push(`Gaps (${report.gaps.length}):`);
    for (const gap of report.gaps) {
      lines.push(`  - ${gap}`);
    }
  }

  return lines.join('\n');
};
