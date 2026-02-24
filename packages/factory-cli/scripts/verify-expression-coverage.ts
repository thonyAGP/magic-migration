#!/usr/bin/env tsx
/**
 * Verify Expression Coverage Script
 *
 * Ensures 100% coverage of legacy expressions in modern code + tests.
 * Fails CI/CD if coverage threshold is not met.
 *
 * Usage:
 *   tsx scripts/verify-expression-coverage.ts --contract-dir .openspec/migration/ADH/contracts --output-dir ../adh-web/src
 *   tsx scripts/verify-expression-coverage.ts --help
 */

import fs from 'node:fs';
import path from 'node:path';
import { parseContract } from '../src/core/contract.js';
import { extractExpressionsFromDirectory } from '../src/verifiers/expression-extractor.js';
import { verifyAllContracts } from '../src/verifiers/expression-verifier.js';
import type {
  VerificationOptions,
  ExpressionCoverageReport,
  ExpressionGap,
} from '../src/verifiers/expression-coverage-types.js';
import { ExpressionGapReason } from '../src/verifiers/expression-coverage-types.js';
import { createLogger, withCorrelationSync } from '../src/core/correlation.js';
import type { MigrationContract } from '../src/core/types.js';

// ─── CLI Arguments ───────────────────────────────────────────────────

const args = process.argv.slice(2);

const getArg = (name: string): string | undefined => {
  const idx = args.indexOf(`--${name}`);
  return idx >= 0 && idx + 1 < args.length ? args[idx + 1] : undefined;
};

const hasFlag = (name: string): boolean => args.includes(`--${name}`);

if (hasFlag('help')) {
  console.log(`
Usage: tsx scripts/verify-expression-coverage.ts [options]

Options:
  --contract-dir <path>    Directory containing .contract.yaml files (required)
  --output-dir <path>      Output directory with generated code (required)
  --programs <ids>         Filter by program IDs (comma-separated)
  --run-tests              Run tests to verify they pass (slow)
  --threshold <number>     Coverage threshold (default: 100)
  --verbose                Verbose output
  --json                   Output as JSON
  --help                   Show this help

Examples:
  # Verify all contracts
  tsx scripts/verify-expression-coverage.ts \\
    --contract-dir .openspec/migration/ADH/contracts \\
    --output-dir ../adh-web/src

  # Verify specific programs
  tsx scripts/verify-expression-coverage.ts \\
    --contract-dir .openspec/migration/ADH/contracts \\
    --output-dir ../adh-web/src \\
    --programs 237,184

  # Run with test execution
  tsx scripts/verify-expression-coverage.ts \\
    --contract-dir .openspec/migration/ADH/contracts \\
    --output-dir ../adh-web/src \\
    --run-tests
  `);
  process.exit(0);
}

const contractDir = getArg('contract-dir');
const outputDir = getArg('output-dir');

if (!contractDir || !outputDir) {
  console.error('Error: --contract-dir and --output-dir are required');
  console.error('Run with --help for usage information');
  process.exit(1);
}

const options: VerificationOptions = {
  contractDir,
  outputDir,
  runTests: hasFlag('run-tests'),
  programs: getArg('programs'),
  coverageThreshold: getArg('threshold') ? parseInt(getArg('threshold')!, 10) : 100,
  verbose: hasFlag('verbose'),
};

// ─── Main Script ─────────────────────────────────────────────────────

withCorrelationSync((correlationId) => {
  const log = createLogger({
    component: 'verify-expression-coverage',
    correlationId,
  });

  log.info({
    contractDir: options.contractDir,
    outputDir: options.outputDir,
    runTests: options.runTests,
    threshold: options.coverageThreshold,
  }, 'Starting expression coverage verification');

  // 1. Extract expressions from contracts
  const programIds = options.programs
    ? new Set(options.programs.split(',').map(id => id.trim()))
    : undefined;

  const expressionsByProgram = extractExpressionsFromDirectory(
    options.contractDir,
    programIds
  );

  if (expressionsByProgram.size === 0) {
    console.error('\n❌ No contracts found with expression traceability');
    console.error('\nContracts must be extended with legacyExpressions field.');
    console.error('See: docs/expression-traceability.md\n');
    process.exit(1);
  }

  // 2. Load contracts
  const contractsByProgram = new Map<string | number, MigrationContract>();
  const contractFilesByProgram = new Map<string | number, string>();

  for (const [programId] of expressionsByProgram) {
    const files = fs
      .readdirSync(options.contractDir)
      .filter(f =>
        f.endsWith('.contract.yaml') &&
        (f.includes(`-IDE-${programId}.`) || f.includes(`-${programId}.`))
      );

    if (files.length > 0) {
      const file = path.join(options.contractDir, files[0]);
      const contract = parseContract(file);
      contractsByProgram.set(programId, contract);
      contractFilesByProgram.set(programId, file);
    }
  }

  // 3. Verify all contracts
  const result = verifyAllContracts(
    expressionsByProgram,
    contractsByProgram,
    contractFilesByProgram,
    options
  );

  // 4. Output results
  if (hasFlag('json')) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    printReport(result.reports, result.overall, result.threshold);
  }

  // 5. Exit with appropriate code
  if (!result.passed) {
    log.error({
      coveragePct: result.overall.coveragePct,
      threshold: result.threshold,
    }, 'Coverage threshold not met');
    process.exit(1);
  }

  log.info('Expression coverage verification passed');
  process.exit(0);
});

// ─── Report Formatting ───────────────────────────────────────────────

function printReport(
  reports: ExpressionCoverageReport[],
  overall: { totalExpressions: number; coveredExpressions: number; totalGaps: number; coveragePct: number },
  threshold: number
): void {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 EXPRESSION COVERAGE REPORT');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Overall summary
  const statusIcon = overall.coveragePct >= threshold ? '✅' : '❌';
  console.log(`${statusIcon} Overall Coverage: ${overall.coveragePct}% (threshold: ${threshold}%)`);
  console.log(`   Total expressions: ${overall.totalExpressions}`);
  console.log(`   Covered: ${overall.coveredExpressions}`);
  console.log(`   Gaps: ${overall.totalGaps}\n`);

  if (reports.length === 0) {
    console.log('No reports generated.\n');
    return;
  }

  // Per-contract details
  console.log('Per-Contract Details:\n');

  for (const report of reports) {
    const icon = report.coveragePct >= threshold ? '✅' : '❌';
    console.log(`${icon} Program ${report.programId} - ${report.programName}`);
    console.log(`   Coverage: ${report.coveragePct}% (${report.covered}/${report.total})`);

    if (report.gaps > 0) {
      console.log(`   Gaps: ${report.gaps}`);
      printGaps(report.gapDetails.slice(0, 5)); // Show first 5 gaps

      if (report.gaps > 5) {
        console.log(`   ... and ${report.gaps - 5} more gaps\n`);
      } else {
        console.log();
      }
    } else {
      console.log();
    }
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

function printGaps(gaps: ExpressionGap[]): void {
  if (gaps.length === 0) return;

  console.log('   Gaps:');
  for (const gap of gaps) {
    const icon = getGapIcon(gap.reason);
    console.log(`     ${icon} ${gap.exprId} (${gap.ruleId})`);
    console.log(`        Formula: ${gap.legacyFormula.substring(0, 60)}${gap.legacyFormula.length > 60 ? '...' : ''}`);
    console.log(`        Reason: ${gap.details}`);
  }
}

function getGapIcon(reason: string): string {
  switch (reason) {
    case ExpressionGapReason.MISSING_MODERN_FILE:
      return '📄';
    case ExpressionGapReason.MISSING_TEST_FILE:
      return '🧪';
    case ExpressionGapReason.TEST_FAILED:
      return '❌';
    default:
      return '⚠️';
  }
}
