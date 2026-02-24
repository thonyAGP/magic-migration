/**
 * Expression extractor: parse contracts and extract all legacy expressions.
 */

import fs from 'node:fs';
import path from 'node:path';
import { parseContract } from '../core/contract.js';
import type { MigrationContract } from '../core/types.js';
import type {
  ExpressionTrace,
  ExtendedContractRule,
  LegacyExpression,
} from './expression-coverage-types.js';
import { createLogger } from '../utils/logger.js';

const log = createLogger({ component: 'expression-extractor' });

// ─── Extract Expressions from Contract ──────────────────────────────

/**
 * Extract all legacy expressions from a contract.
 * Looks for extended rules with legacyExpressions field.
 *
 * @returns Array of expression traces (may be empty if contract not extended)
 */
export const extractExpressionsFromContract = (
  contract: MigrationContract,
  contractFile: string
): ExpressionTrace[] => {
  const traces: ExpressionTrace[] = [];

  // Check if contract has extended rules with expressions
  for (const rule of contract.rules) {
    const extendedRule = rule as unknown as ExtendedContractRule;

    if (!extendedRule.legacyExpressions || extendedRule.legacyExpressions.length === 0) {
      log.debug({ ruleId: rule.id }, 'Rule has no legacy expressions (not extended yet)');
      continue;
    }

    for (const expr of extendedRule.legacyExpressions) {
      traces.push(createTrace(expr, rule.id, contractFile));
    }
  }

  log.info({
    contractFile,
    programId: contract.program.id,
    rulesTotal: contract.rules.length,
    expressionsFound: traces.length,
  }, 'Expressions extracted from contract');

  return traces;
};

/**
 * Create an ExpressionTrace from a LegacyExpression.
 */
const createTrace = (
  expr: LegacyExpression,
  ruleId: string,
  contractFile: string
): ExpressionTrace => {
  // Parse mappedTo: "validation.ts:42" -> { file, line }
  const { file: modernFile, line: modernLine } = parseMappedTo(expr.mappedTo);

  // Parse testFile: "validation.test.ts:15" -> { file, line }
  const { file: testFile, line: testLine } = parseTestFile(expr.testFile);

  return {
    exprId: expr.exprId,
    legacyFormula: expr.formula,
    modernFile,
    modernLine,
    testFile,
    testLine,
    ruleId,
    verified: expr.verified ?? false,
    lastVerified: undefined,
    failureReason: undefined,
  };
};

const parseMappedTo = (mappedTo?: string): { file: string; line: number } => {
  if (!mappedTo) {
    return { file: '', line: 0 };
  }

  const parts = mappedTo.split(':');
  return {
    file: parts[0] ?? '',
    line: parseInt(parts[1] ?? '0', 10),
  };
};

const parseTestFile = (testFile?: string): { file: string; line: number } => {
  if (!testFile) {
    return { file: '', line: 0 };
  }

  const parts = testFile.split(':');
  return {
    file: parts[0] ?? '',
    line: parseInt(parts[1] ?? '0', 10),
  };
};

// ─── Extract from Multiple Contracts ────────────────────────────────

/**
 * Extract expressions from all contracts in a directory.
 *
 * @param contractDir Directory containing .contract.yaml files
 * @param programIds Optional filter by program IDs
 * @returns Map of programId -> expressions
 */
export const extractExpressionsFromDirectory = (
  contractDir: string,
  programIds?: Set<string | number>
): Map<string | number, ExpressionTrace[]> => {
  const result = new Map<string | number, ExpressionTrace[]>();

  if (!fs.existsSync(contractDir)) {
    log.warn({ contractDir }, 'Contract directory does not exist');
    return result;
  }

  const files = fs
    .readdirSync(contractDir)
    .filter(f => f.endsWith('.contract.yaml'))
    .map(f => path.join(contractDir, f));

  log.info({ contractDir, filesFound: files.length }, 'Scanning contracts directory');

  for (const file of files) {
    try {
      const contract = parseContract(file);
      const programId = contract.program.id;

      // Filter by program IDs if specified
      if (programIds && !programIds.has(programId) && !programIds.has(String(programId))) {
        log.debug({ programId }, 'Skipping program (not in filter)');
        continue;
      }

      const expressions = extractExpressionsFromContract(contract, file);
      result.set(programId, expressions);

    } catch (error) {
      log.error({ file, error: (error as Error).message }, 'Failed to parse contract');
    }
  }

  const totalExpressions = Array.from(result.values()).reduce(
    (sum, exprs) => sum + exprs.length,
    0
  );

  log.info({
    contractsProcessed: result.size,
    totalExpressions,
  }, 'Expression extraction completed');

  return result;
};

// ─── Helper: Check if Contract is Extended ──────────────────────────

/**
 * Check if a contract has been extended with expression traceability.
 *
 * @returns true if at least one rule has legacyExpressions
 */
export const isContractExtended = (contract: MigrationContract): boolean => {
  for (const rule of contract.rules) {
    const extendedRule = rule as unknown as ExtendedContractRule;
    if (extendedRule.legacyExpressions && extendedRule.legacyExpressions.length > 0) {
      return true;
    }
  }
  return false;
};
