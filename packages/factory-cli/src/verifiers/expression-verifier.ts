/**
 * Expression verifier: check that expressions are implemented and tested.
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import type {
  ExpressionTrace,
  ExpressionCoverageReport,
  ExpressionGap,
  ExpressionGapReason,
  VerificationOptions,
  VerificationResult,
} from './expression-coverage-types.js';
import { ExpressionGapReason as GapReason } from './expression-coverage-types.js';
import { createLogger, startTimer, logError } from '../utils/logger.js';
import type { MigrationContract } from '../core/types.js';

const log = createLogger({ component: 'expression-verifier' });

// ─── Verify Single Expression ───────────────────────────────────────

/**
 * Verify a single expression trace.
 * Checks: modern file exists, test file exists, (optionally) test passes.
 *
 * @returns Updated trace with verification status
 */
export const verifyExpression = (
  trace: ExpressionTrace,
  outputDir: string,
  options: { runTests?: boolean } = {}
): ExpressionTrace => {
  const updated: ExpressionTrace = { ...trace, verified: false };

  // 1. Check modern file exists
  if (!trace.modernFile || trace.modernFile === '') {
    updated.failureReason = 'No modern file mapping';
    return updated;
  }

  const modernFilePath = path.join(outputDir, trace.modernFile);
  if (!fs.existsSync(modernFilePath)) {
    updated.failureReason = `Modern file not found: ${trace.modernFile}`;
    log.debug({ exprId: trace.exprId, modernFile: trace.modernFile }, 'Modern file missing');
    return updated;
  }

  // 2. Check test file exists
  if (!trace.testFile || trace.testFile === '') {
    updated.failureReason = 'No test file mapping';
    return updated;
  }

  const testFilePath = path.join(outputDir, trace.testFile);
  if (!fs.existsSync(testFilePath)) {
    updated.failureReason = `Test file not found: ${trace.testFile}`;
    log.debug({ exprId: trace.exprId, testFile: trace.testFile }, 'Test file missing');
    return updated;
  }

  // 3. (Optional) Run test to verify it passes
  if (options.runTests) {
    const testPassed = runTest(testFilePath, outputDir);
    if (!testPassed) {
      updated.failureReason = `Test failed: ${trace.testFile}`;
      log.warn({ exprId: trace.exprId, testFile: trace.testFile }, 'Test execution failed');
      return updated;
    }
  }

  // All checks passed
  updated.verified = true;
  updated.lastVerified = new Date().toISOString();
  updated.failureReason = undefined;

  log.debug({ exprId: trace.exprId }, 'Expression verified successfully');

  return updated;
};

/**
 * Run a test file and return whether it passed.
 * Uses vitest to run a single test file.
 */
const runTest = (testFilePath: string, cwd: string): boolean => {
  try {
    // Run vitest on specific file, suppress output
    execSync(`npx vitest run ${testFilePath}`, {
      cwd,
      stdio: 'pipe',
      timeout: 30000, // 30s timeout
    });
    return true;
  } catch (error) {
    log.debug({ testFilePath, error: (error as Error).message }, 'Test execution failed');
    return false;
  }
};

// ─── Verify All Expressions ─────────────────────────────────────────

/**
 * Verify all expressions for a contract.
 *
 * @returns Coverage report with gaps
 */
export const verifyContract = (
  contract: MigrationContract,
  expressions: ExpressionTrace[],
  contractFile: string,
  options: VerificationOptions
): ExpressionCoverageReport => {
  const endTimer = startTimer(
    { programId: contract.program.id },
    `Verify contract ${contract.program.id}`
  );

  log.info({
    programId: contract.program.id,
    expressionsTotal: expressions.length,
    runTests: options.runTests ?? false,
  }, 'Starting contract verification');

  const verified: ExpressionTrace[] = [];
  const gaps: ExpressionGap[] = [];

  for (const expr of expressions) {
    const result = verifyExpression(expr, options.outputDir, {
      runTests: options.runTests,
    });

    if (result.verified) {
      verified.push(result);
    } else {
      gaps.push({
        exprId: expr.exprId,
        legacyFormula: expr.legacyFormula,
        ruleId: expr.ruleId,
        reason: categorizeGapReason(result.failureReason),
        details: result.failureReason,
      });
    }
  }

  endTimer();

  const report: ExpressionCoverageReport = {
    total: expressions.length,
    covered: verified.length,
    gaps: gaps.length,
    coveragePct: expressions.length > 0
      ? Math.round((verified.length / expressions.length) * 100)
      : 100,
    gapDetails: gaps,
    generatedAt: new Date().toISOString(),
    contractFile,
    programId: contract.program.id,
    programName: contract.program.name,
  };

  log.info({
    programId: contract.program.id,
    total: report.total,
    covered: report.covered,
    gaps: report.gaps,
    coveragePct: report.coveragePct,
  }, 'Contract verification completed');

  return report;
};

/**
 * Categorize gap reason from failure message.
 */
const categorizeGapReason = (failureReason?: string): ExpressionGapReason => {
  if (!failureReason) return GapReason.NO_MAPPING;

  if (failureReason.includes('Modern file not found')) {
    return GapReason.MISSING_MODERN_FILE;
  }
  if (failureReason.includes('Test file not found')) {
    return GapReason.MISSING_TEST_FILE;
  }
  if (failureReason.includes('Test failed')) {
    return GapReason.TEST_FAILED;
  }

  return GapReason.NO_MAPPING;
};

// ─── Verify Multiple Contracts ──────────────────────────────────────

/**
 * Verify all contracts in a directory.
 *
 * @returns Overall verification result
 */
export const verifyAllContracts = (
  expressionsByProgram: Map<string | number, ExpressionTrace[]>,
  contractsByProgram: Map<string | number, MigrationContract>,
  contractFilesByProgram: Map<string | number, string>,
  options: VerificationOptions
): VerificationResult => {
  const reports: ExpressionCoverageReport[] = [];

  log.info({
    contractsToVerify: expressionsByProgram.size,
    runTests: options.runTests ?? false,
  }, 'Starting batch verification');

  const endTimer = startTimer({}, 'Verify all contracts');

  for (const [programId, expressions] of expressionsByProgram.entries()) {
    const contract = contractsByProgram.get(programId);
    const contractFile = contractFilesByProgram.get(programId);

    if (!contract || !contractFile) {
      log.warn({ programId }, 'Contract or file not found - skipping');
      continue;
    }

    try {
      const report = verifyContract(contract, expressions, contractFile, options);
      reports.push(report);
    } catch (error) {
      logError({ programId }, error as Error, 'Contract verification failed');
    }
  }

  endTimer();

  // Calculate overall statistics
  const totalExpressions = reports.reduce((sum, r) => sum + r.total, 0);
  const coveredExpressions = reports.reduce((sum, r) => sum + r.covered, 0);
  const totalGaps = reports.reduce((sum, r) => sum + r.gaps, 0);
  const coveragePct = totalExpressions > 0
    ? Math.round((coveredExpressions / totalExpressions) * 100)
    : 100;

  const threshold = options.coverageThreshold ?? 100;
  const passed = coveragePct >= threshold;

  log.info({
    contractsVerified: reports.length,
    totalExpressions,
    coveredExpressions,
    totalGaps,
    coveragePct,
    threshold,
    passed,
  }, 'Batch verification completed');

  return {
    reports,
    overall: {
      totalExpressions,
      coveredExpressions,
      totalGaps,
      coveragePct,
    },
    passed,
    threshold,
  };
};
