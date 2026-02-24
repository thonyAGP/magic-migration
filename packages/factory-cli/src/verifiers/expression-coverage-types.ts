/**
 * Types for expression coverage verification.
 * Ensures 100% coverage of legacy expressions in modern code + tests.
 */

// ─── Expression Trace ────────────────────────────────────────────────

/**
 * Traces a single legacy expression to its modern implementation and test.
 */
export interface ExpressionTrace {
  /** Unique ID: "Prg_237:Task_5:Line_12:Expr_30" */
  exprId: string;

  /** Legacy formula: "IF({0,3}='E',Msg('Error'))" */
  legacyFormula: string;

  /** Modern file path: "src/validation.ts" */
  modernFile: string;

  /** Line number in modern file: 42 */
  modernLine: number;

  /** Test file path: "tests/validation.test.ts" */
  testFile: string;

  /** Line number in test file: 15 */
  testLine: number;

  /** Rule ID this expression belongs to: "RM-001" */
  ruleId: string;

  /** Has this expression been verified? */
  verified: boolean;

  /** Last verification timestamp (ISO) */
  lastVerified?: string;

  /** Verification failure reason if not verified */
  failureReason?: string;
}

// ─── Coverage Report ─────────────────────────────────────────────────

/**
 * Overall coverage report for a migration contract.
 */
export interface ExpressionCoverageReport {
  /** Total expressions found */
  total: number;

  /** Expressions with modern implementation + test */
  covered: number;

  /** Expressions missing implementation or test */
  gaps: number;

  /** Coverage percentage: (covered / total) * 100 */
  coveragePct: number;

  /** List of expressions with gaps */
  gapDetails: ExpressionGap[];

  /** Generated timestamp */
  generatedAt: string;

  /** Contract file analyzed */
  contractFile: string;

  /** Program ID */
  programId: string | number;

  /** Program name */
  programName: string;
}

/**
 * Details about a single expression gap.
 */
export interface ExpressionGap {
  exprId: string;
  legacyFormula: string;
  ruleId: string;
  reason: ExpressionGapReason;
  details?: string;
}

export const ExpressionGapReason = {
  MISSING_MODERN_FILE: 'MISSING_MODERN_FILE',
  MISSING_TEST_FILE: 'MISSING_TEST_FILE',
  TEST_FAILED: 'TEST_FAILED',
  NO_MAPPING: 'NO_MAPPING',
} as const;

export type ExpressionGapReason =
  (typeof ExpressionGapReason)[keyof typeof ExpressionGapReason];

// ─── Contract Extension ──────────────────────────────────────────────

/**
 * Extended contract rule with expression traces.
 * This is what contracts SHOULD contain for 100% coverage.
 */
export interface ExtendedContractRule {
  id: string;
  description: string;
  status: string;
  targetFile?: string;

  /** NEW: Expression-level traceability */
  legacyExpressions?: LegacyExpression[];
}

/**
 * A single legacy expression within a rule.
 */
export interface LegacyExpression {
  /** Expression ID in source code */
  exprId: string;

  /** Magic formula */
  formula: string;

  /** Mapped to which file:line in modern code */
  mappedTo?: string; // "validation.ts:42"

  /** Tested by which file:line */
  testFile?: string; // "validation.test.ts:15"

  /** Has this mapping been verified? */
  verified?: boolean;
}

// ─── Verification Options ────────────────────────────────────────────

export interface VerificationOptions {
  /** Contract directory to scan */
  contractDir: string;

  /** Output directory for generated code (to check files exist) */
  outputDir: string;

  /** Run tests to verify they pass? (slow) */
  runTests?: boolean;

  /** Filter by program IDs (comma-separated) */
  programs?: string;

  /** Fail build if coverage < threshold */
  coverageThreshold?: number; // default: 100

  /** Verbose output */
  verbose?: boolean;
}

// ─── Verification Result ─────────────────────────────────────────────

export interface VerificationResult {
  /** Reports per contract */
  reports: ExpressionCoverageReport[];

  /** Overall statistics */
  overall: {
    totalExpressions: number;
    coveredExpressions: number;
    totalGaps: number;
    coveragePct: number;
  };

  /** Did verification pass threshold? */
  passed: boolean;

  /** Threshold used */
  threshold: number;
}
