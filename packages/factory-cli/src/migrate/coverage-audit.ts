#!/usr/bin/env tsx
/**
 * Coverage Audit CLI - Standalone script for auditing contract→code coverage.
 *
 * Usage:
 *   tsx src/migrate/coverage-audit.ts --program 28
 *   tsx src/migrate/coverage-audit.ts --batch B14
 *   tsx src/migrate/coverage-audit.ts --batch B14 --json
 *
 * Options:
 *   --program <id>   Audit a single program by IDE number
 *   --batch <id>     Audit all programs in a batch
 *   --json           Output JSON instead of formatted text
 *   --project <name> Project subdirectory (default: ADH)
 *   --help           Show this help
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadContracts, parseContract } from '../core/contract.js';
import { readTracker } from '../core/tracker.js';
import { checkContractCoverage, formatCoverageReport } from './phases/phase-coverage.js';
import type { CoverageReport } from './migrate-types.js';
import type { MigrationContract } from '../core/types.js';

// ─── CLI Arguments ────────────────────────────────────────────

const args = process.argv.slice(2);

const getArg = (name: string): string | undefined => {
  const idx = args.indexOf(`--${name}`);
  return idx >= 0 && idx + 1 < args.length ? args[idx + 1] : undefined;
};

const hasFlag = (name: string): boolean => args.includes(`--${name}`);

if (hasFlag('help')) {
  console.log(`
Coverage Audit CLI - Deterministic contract→code coverage checker

Usage:
  tsx src/migrate/coverage-audit.ts --program 28
  tsx src/migrate/coverage-audit.ts --batch B14
  tsx src/migrate/coverage-audit.ts --batch B14 --json

Options:
  --program <id>   Audit a single program by IDE number
  --batch <id>     Audit all programs in a batch
  --json           Output JSON instead of formatted text
  --project <name> Project subdirectory (default: ADH)
  --help           Show this help
`);
  process.exit(0);
}

// ─── Resolve Paths ────────────────────────────────────────────

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const factoryRoot = path.resolve(__dirname, '..', '..');
const repoRoot = path.resolve(factoryRoot, '..', '..');

const project = getArg('project') ?? 'ADH';
const contractDir = path.join(repoRoot, '.openspec', 'migration', project);
const targetDir = path.join(repoRoot, 'packages', 'migrations', 'adh-web');
const trackerFile = path.join(repoRoot, '.openspec', 'migration', project, 'tracker.json');

const outputJson = hasFlag('json');
const programArg = getArg('program');
const batchArg = getArg('batch');

if (!programArg && !batchArg) {
  console.error('Error: specify --program <id> or --batch <id>');
  process.exit(1);
}

// ─── File Loader ──────────────────────────────────────────────

interface FileContent {
  path: string;
  content: string;
  lines: string[];
}

const loadFiles = (domain: string, domainPascal: string): FileContent[] => {
  const files: FileContent[] = [];

  const candidates = [
    path.join(targetDir, 'src', 'types', `${domain}.ts`),
    path.join(targetDir, 'src', 'stores', `${domain}Store.ts`),
    path.join(targetDir, 'src', 'services', 'api', `endpoints-${domain}.ts`),
    path.join(targetDir, 'src', 'pages', `${domainPascal}Page.tsx`),
  ];

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
      files.push({ path: filePath, content, lines: content.split('\n') });
    }
  }

  return files;
};

// ─── Resolve domain from analysis JSON ────────────────────────

const resolveAnalysis = (programId: string | number): { domain: string; domainPascal: string } | null => {
  const analysisFile = path.join(contractDir, `${project}-IDE-${programId}.analysis.json`);
  if (!fs.existsSync(analysisFile)) return null;
  const doc = JSON.parse(fs.readFileSync(analysisFile, 'utf8'));
  return { domain: doc.domain, domainPascal: doc.domainPascal };
};

// ─── Audit a single program ──────────────────────────────────

const auditProgram = (contract: MigrationContract): CoverageReport | null => {
  const analysis = resolveAnalysis(contract.program.id);
  if (!analysis) {
    console.error(`  No analysis.json found for IDE ${contract.program.id}`);
    return null;
  }

  const files = loadFiles(analysis.domain, analysis.domainPascal);
  if (files.length === 0) {
    console.error(`  No generated files found for domain ${analysis.domain}`);
    return null;
  }

  return checkContractCoverage(contract, files);
};

// ─── Main ─────────────────────────────────────────────────────

const reports: CoverageReport[] = [];

if (programArg) {
  const contractFile = path.join(contractDir, `${project}-IDE-${programArg}.contract.yaml`);
  if (!fs.existsSync(contractFile)) {
    console.error(`Contract not found: ${contractFile}`);
    process.exit(1);
  }

  const contract = parseContract(contractFile);
  const report = auditProgram(contract);
  if (report) reports.push(report);
}

if (batchArg) {
  if (!fs.existsSync(trackerFile)) {
    console.error(`Tracker not found: ${trackerFile}`);
    process.exit(1);
  }

  const tracker = readTracker(trackerFile);
  const batch = tracker.batches.find(b => b.id === batchArg);
  if (!batch) {
    console.error(`Batch ${batchArg} not found in tracker`);
    process.exit(1);
  }

  const contracts = loadContracts(contractDir);

  for (const programId of batch.priorityOrder) {
    const contract = contracts.get(programId);
    if (!contract) {
      console.error(`  Contract not found for IDE ${programId}`);
      continue;
    }
    const report = auditProgram(contract);
    if (report) reports.push(report);
  }
}

// ─── Output ───────────────────────────────────────────────────

if (reports.length === 0) {
  console.error('No reports generated.');
  process.exit(1);
}

if (outputJson) {
  const summary = {
    audit: batchArg ?? `IDE-${programArg}`,
    timestamp: new Date().toISOString(),
    programs: reports,
    summary: {
      totalPrograms: reports.length,
      avgCoverage: Math.round(reports.reduce((sum, r) => sum + r.coveragePct, 0) / reports.length),
      totalGaps: reports.reduce((sum, r) => sum + r.gaps.length, 0),
    },
  };
  console.log(JSON.stringify(summary, null, 2));
} else {
  for (const report of reports) {
    console.log(formatCoverageReport(report));
    console.log('');
  }

  if (reports.length > 1) {
    const avgCoverage = Math.round(reports.reduce((sum, r) => sum + r.coveragePct, 0) / reports.length);
    const totalGaps = reports.reduce((sum, r) => sum + r.gaps.length, 0);
    console.log('=== Summary ===');
    console.log(`Programs: ${reports.length}`);
    console.log(`Average coverage: ${avgCoverage}%`);
    console.log(`Total gaps: ${totalGaps}`);
  }
}
