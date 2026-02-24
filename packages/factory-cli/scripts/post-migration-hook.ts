#!/usr/bin/env tsx
/**
 * Post-Migration Hook
 *
 * Automatically captures learnings after a successful migration:
 * - Analyzes contracts for new patterns
 * - Suggests decision records if needed
 * - Updates pattern statistics
 * - Logs migration metrics
 *
 * Usage:
 *   tsx scripts/post-migration-hook.ts --contract <path> --output <dir>
 *   tsx scripts/post-migration-hook.ts --batch <id> --project <dir>
 *
 * Examples:
 *   # Single contract
 *   tsx scripts/post-migration-hook.ts \
 *     --contract .openspec/migration/ADH/ADH-IDE-48.contract.yaml \
 *     --output ../adh-web/src
 *
 *   # Entire batch
 *   tsx scripts/post-migration-hook.ts \
 *     --batch B2 \
 *     --project ../../
 */

import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import YAML from 'yaml';

interface ExpressionTrace {
  expr_id: string;
  formula: string;
  mapped_to?: string;
  test_file?: string;
  verified?: boolean;
}

interface ContractRule {
  id: string;
  description: string;
  status: string;
  legacy_expressions?: ExpressionTrace[];
}

interface MigrationContract {
  program: {
    id: number;
    name: string;
  };
  rules: ContractRule[];
}

interface PatternCandidate {
  formula_pattern: string;
  occurrences: number;
  programs: number[];
  examples: Array<{
    program_id: number;
    expr_id: string;
    formula: string;
  }>;
}

interface MigrationStats {
  timestamp: string;
  contract_file: string;
  program_id: number;
  program_name: string;
  total_rules: number;
  total_expressions: number;
  mapped_expressions: number;
  tested_expressions: number;
  verified_expressions: number;
  coverage_pct: number;
  new_patterns_detected: number;
  decision_records_suggested: number;
}

// ============================================================================
// Pattern Detection
// ============================================================================

/**
 * Extract formula pattern by removing variable parts
 */
function extractFormulaPattern(formula: string): string {
  // Replace variable names/letters with placeholders
  let pattern = formula;

  // Replace field letters like [A], [BH], [V] with [X]
  pattern = pattern.replace(/\[[A-Z]{1,2}\]/g, '[X]');

  // Replace variable references like {0,3}, {1,5} with {N,M}
  pattern = pattern.replace(/\{\d+,\d+\}/g, '{N,M}');

  // Replace string literals with 'X'
  pattern = pattern.replace(/'[^']*'/g, "'X'");

  // Replace number literals with N
  pattern = pattern.replace(/\b\d+\b/g, 'N');

  return pattern;
}

/**
 * Detect recurring patterns across multiple expressions
 */
function detectPatterns(
  contract: MigrationContract,
  minOccurrences: number = 2
): PatternCandidate[] {
  const patternMap = new Map<string, PatternCandidate>();

  for (const rule of contract.rules) {
    if (!rule.legacy_expressions) continue;

    for (const expr of rule.legacy_expressions) {
      const pattern = extractFormulaPattern(expr.formula);

      if (!patternMap.has(pattern)) {
        patternMap.set(pattern, {
          formula_pattern: pattern,
          occurrences: 0,
          programs: [],
          examples: [],
        });
      }

      const candidate = patternMap.get(pattern)!;
      candidate.occurrences++;

      if (!candidate.programs.includes(contract.program.id)) {
        candidate.programs.push(contract.program.id);
      }

      if (candidate.examples.length < 3) {
        candidate.examples.push({
          program_id: contract.program.id,
          expr_id: expr.expr_id,
          formula: expr.formula,
        });
      }
    }
  }

  // Filter patterns with minimum occurrences
  return Array.from(patternMap.values())
    .filter((p) => p.occurrences >= minOccurrences)
    .sort((a, b) => b.occurrences - a.occurrences);
}

// ============================================================================
// Decision Record Suggestions
// ============================================================================

/**
 * Suggest decision records based on contract complexity
 */
function suggestDecisionRecords(contract: MigrationContract): string[] {
  const suggestions: string[] = [];

  // Check for multiple implementation approaches
  const statusTypes = new Set(contract.rules.map((r) => r.status));
  if (statusTypes.has('IMPL') && statusTypes.has('N/A')) {
    suggestions.push(
      `Why some rules are N/A vs IMPL in ${contract.program.name}`
    );
  }

  // Check for complex expression patterns
  const allExpressions = contract.rules.flatMap(
    (r) => r.legacy_expressions || []
  );
  const complexExpressions = allExpressions.filter(
    (e) => e.formula.includes('IF(') && e.formula.split('IF(').length > 2
  );

  if (complexExpressions.length >= 3) {
    suggestions.push(
      `Nested IF expression handling strategy (${complexExpressions.length} found)`
    );
  }

  // Check for validation patterns
  const validationExpressions = allExpressions.filter(
    (e) => e.formula.includes('Msg(') || e.formula.includes('Error')
  );

  if (validationExpressions.length >= 3) {
    suggestions.push(
      `Validation error handling pattern (${validationExpressions.length} found)`
    );
  }

  return suggestions;
}

// ============================================================================
// Statistics Collection
// ============================================================================

/**
 * Calculate migration statistics for a contract
 */
function calculateStats(contract: MigrationContract): MigrationStats {
  const allExpressions = contract.rules.flatMap(
    (r) => r.legacy_expressions || []
  );

  const mappedCount = allExpressions.filter((e) => e.mapped_to).length;
  const testedCount = allExpressions.filter((e) => e.test_file).length;
  const verifiedCount = allExpressions.filter((e) => e.verified).length;

  const coveragePct =
    allExpressions.length > 0
      ? Math.round((verifiedCount / allExpressions.length) * 100)
      : 0;

  const patterns = detectPatterns(contract, 2);
  const suggestions = suggestDecisionRecords(contract);

  return {
    timestamp: new Date().toISOString(),
    contract_file: '', // Will be set by caller
    program_id: contract.program.id,
    program_name: contract.program.name,
    total_rules: contract.rules.length,
    total_expressions: allExpressions.length,
    mapped_expressions: mappedCount,
    tested_expressions: testedCount,
    verified_expressions: verifiedCount,
    coverage_pct: coveragePct,
    new_patterns_detected: patterns.length,
    decision_records_suggested: suggestions.length,
  };
}

// ============================================================================
// Reporting
// ============================================================================

/**
 * Write migration stats to log file
 */
function logStats(stats: MigrationStats, historyDir: string): void {
  const logFile = path.join(historyDir, 'migration-stats.jsonl');

  const logLine = JSON.stringify(stats) + '\n';

  fs.mkdirSync(historyDir, { recursive: true });
  fs.appendFileSync(logFile, logLine, 'utf8');
}

/**
 * Update pattern statistics
 */
function updatePatternStats(
  patterns: PatternCandidate[],
  historyDir: string
): void {
  const statsFile = path.join(historyDir, 'patterns', 'stats.json');

  let stats: Record<string, { occurrences: number; programs: number[] }> = {};

  if (fs.existsSync(statsFile)) {
    stats = JSON.parse(fs.readFileSync(statsFile, 'utf8'));
  }

  for (const pattern of patterns) {
    if (!stats[pattern.formula_pattern]) {
      stats[pattern.formula_pattern] = {
        occurrences: 0,
        programs: [],
      };
    }

    stats[pattern.formula_pattern].occurrences += pattern.occurrences;

    for (const progId of pattern.programs) {
      if (!stats[pattern.formula_pattern].programs.includes(progId)) {
        stats[pattern.formula_pattern].programs.push(progId);
      }
    }
  }

  fs.mkdirSync(path.dirname(statsFile), { recursive: true });
  fs.writeFileSync(statsFile, JSON.stringify(stats, null, 2), 'utf8');
}

/**
 * Print summary report
 */
function printSummary(
  stats: MigrationStats,
  patterns: PatternCandidate[],
  suggestions: string[]
): void {
  console.log('\n📊 Post-Migration Summary\n');
  console.log(`Program: ${stats.program_name} (ID ${stats.program_id})`);
  console.log(`Contract: ${stats.contract_file}`);
  console.log(`\nCoverage:`);
  console.log(`  Total expressions: ${stats.total_expressions}`);
  console.log(`  Mapped: ${stats.mapped_expressions}`);
  console.log(`  Tested: ${stats.tested_expressions}`);
  console.log(`  Verified: ${stats.verified_expressions}`);
  console.log(`  Coverage: ${stats.coverage_pct}%`);

  if (patterns.length > 0) {
    console.log(`\n🔍 Patterns detected: ${patterns.length}`);
    patterns.slice(0, 3).forEach((p, i) => {
      console.log(
        `  ${i + 1}. ${p.formula_pattern} (${p.occurrences}x across ${p.programs.length} program(s))`
      );
    });
  }

  if (suggestions.length > 0) {
    console.log(`\n💡 Decision records suggested: ${suggestions.length}`);
    suggestions.forEach((s, i) => {
      console.log(`  ${i + 1}. ${s}`);
    });
    console.log(
      `\n   Create decision records using:`
    );
    console.log(
      `   cp .migration-history/decisions/TEMPLATE.md \\`
    );
    console.log(
      `      .migration-history/decisions/$(date +%Y-%m-%d)-<topic>.md`
    );
  }

  console.log('\n✅ Post-migration hook complete\n');
}

// ============================================================================
// Main
// ============================================================================

async function main(): Promise<void> {
  const { values } = parseArgs({
    args: process.argv.slice(2),
    options: {
      contract: { type: 'string' },
      output: { type: 'string' },
      batch: { type: 'string' },
      project: { type: 'string' },
    },
  });

  const contractPath = values.contract as string | undefined;
  const outputDir = values.output as string | undefined;
  const batchId = values.batch as string | undefined;
  const projectDir = values.project as string | undefined;

  // Single contract mode
  if (contractPath && outputDir) {
    if (!fs.existsSync(contractPath)) {
      console.error(`❌ Contract not found: ${contractPath}`);
      process.exit(1);
    }

    const contractContent = fs.readFileSync(contractPath, 'utf8');
    const contract = YAML.parse(contractContent) as MigrationContract;

    const stats = calculateStats(contract);
    stats.contract_file = contractPath;

    const patterns = detectPatterns(contract, 2);
    const suggestions = suggestDecisionRecords(contract);

    // Get history dir - assume contract is in .openspec/migration/XXX/
    // Navigate to project root then to .migration-history
    const absoluteContractPath = path.resolve(contractPath);
    const contractDir = path.dirname(absoluteContractPath);

    // From contract dir (.openspec/migration/ADH), go up 3 levels to project root
    const projectRoot = path.resolve(contractDir, '../../..');
    const historyDir = path.join(projectRoot, '.migration-history');

    logStats(stats, historyDir);
    updatePatternStats(patterns, historyDir);
    printSummary(stats, patterns, suggestions);

    return;
  }

  // Batch mode
  if (batchId && projectDir) {
    console.error('❌ Batch mode not yet implemented');
    console.error('   Use single contract mode for now:');
    console.error(
      '   tsx scripts/post-migration-hook.ts --contract <path> --output <dir>'
    );
    process.exit(1);
  }

  // Invalid usage
  console.error('Usage:');
  console.error(
    '  Single contract: tsx scripts/post-migration-hook.ts --contract <path> --output <dir>'
  );
  console.error(
    '  Batch: tsx scripts/post-migration-hook.ts --batch <id> --project <dir>'
  );
  process.exit(1);
}

main().catch((error) => {
  console.error('❌ Post-migration hook failed:', error);
  process.exit(1);
});
