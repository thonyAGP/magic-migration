/**
 * Failure Capture Module
 *
 * Automatically captures and logs migration failures for analysis and learning.
 *
 * Usage:
 *   import { captureFailure } from './core/failure-capture.js';
 *
 *   try {
 *     await runMigrationPhase();
 *   } catch (error) {
 *     await captureFailure({
 *       programId: 237,
 *       programName: 'Vente GP',
 *       phase: 'VERIFY',
 *       error,
 *       context: { contractFile, outputDir }
 *     });
 *     throw error;
 *   }
 */

import fs from 'node:fs';
import path from 'node:path';

export type MigrationPhase =
  | 'EXTRACT'
  | 'MAP'
  | 'GAP'
  | 'CONTRACT'
  | 'ENRICH'
  | 'VERIFY'
  | 'SCAFFOLD'
  | 'CODEGEN'
  | 'COHERENCE'
  | 'CLEANUP';

export type ErrorCode =
  | 'ERR_COVERAGE_LOW'
  | 'ERR_CLAUDE_API'
  | 'ERR_FILE_NOT_FOUND'
  | 'ERR_PARSING_FAILED'
  | 'ERR_VALIDATION_FAILED'
  | 'ERR_DEPENDENCY_MISSING'
  | 'ERR_PERMISSION_DENIED'
  | 'ERR_TIMEOUT'
  | 'ERR_NETWORK'
  | 'ERR_UNKNOWN';

export interface MissingExpression {
  expr_id: string;
  formula: string;
  rule_id?: string;
}

export interface FailureContext {
  contract_file?: string;
  output_dir?: string;
  batch_id?: string;
  attempt?: number;
  correlation_id?: string;
  [key: string]: unknown;
}

export interface FailureResolution {
  action: string;
  test_files_added?: string[];
  code_changes?: string[];
  resolved_at: string;
  resolved_by?: string;
  resolution_time_minutes?: number;
  commit?: string;
  verification_passed?: boolean;
}

export interface FailureRecord {
  program_id: number;
  program_name: string;
  failed_at: string;
  phase: MigrationPhase;
  error: string;
  error_code: ErrorCode;
  details: {
    expected_coverage?: number;
    actual_coverage?: number;
    missing_expressions?: MissingExpression[];
    stack_trace?: string;
    context: FailureContext;
  };
  resolution?: FailureResolution;
  lessons_learned?: string[];
  tags?: string[];
  related_patterns?: string[];
  metrics?: Record<string, unknown>;
}

export interface CaptureFailureOptions {
  programId: number;
  programName: string;
  phase: MigrationPhase;
  error: Error | string;
  errorCode?: ErrorCode;
  context: FailureContext;
  missingExpressions?: MissingExpression[];
  expectedCoverage?: number;
  actualCoverage?: number;
  tags?: string[];
  historyDir?: string;
}

/**
 * Infer error code from error message
 */
function inferErrorCode(error: Error | string): ErrorCode {
  const message = typeof error === 'string' ? error : error.message;
  const lower = message.toLowerCase();

  if (lower.includes('coverage')) return 'ERR_COVERAGE_LOW';
  if (lower.includes('claude') || lower.includes('api')) return 'ERR_CLAUDE_API';
  if (lower.includes('not found') || lower.includes('enoent'))
    return 'ERR_FILE_NOT_FOUND';
  if (lower.includes('parse') || lower.includes('parsing'))
    return 'ERR_PARSING_FAILED';
  if (lower.includes('validation') || lower.includes('invalid'))
    return 'ERR_VALIDATION_FAILED';
  if (lower.includes('dependency') || lower.includes('missing'))
    return 'ERR_DEPENDENCY_MISSING';
  if (lower.includes('permission') || lower.includes('eacces'))
    return 'ERR_PERMISSION_DENIED';
  if (lower.includes('timeout') || lower.includes('timed out'))
    return 'ERR_TIMEOUT';
  if (lower.includes('network') || lower.includes('fetch'))
    return 'ERR_NETWORK';

  return 'ERR_UNKNOWN';
}

/**
 * Generate filename for failure record
 */
function generateFailureFilename(programId: number): string {
  const now = new Date();
  const date = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const timeWithMs = now.toISOString().split('T')[1].split('Z')[0]; // HH:MM:SS.mmm
  const time = timeWithMs.replace(/:/g, '').replace('.', ''); // HHMMSSmmm

  return `Prg_${programId}-failed-${date}-${time}.json`;
}

/**
 * Capture a migration failure to .migration-history/failures/
 */
export async function captureFailure(
  options: CaptureFailureOptions
): Promise<string> {
  const {
    programId,
    programName,
    phase,
    error,
    errorCode,
    context,
    missingExpressions,
    expectedCoverage,
    actualCoverage,
    tags = [],
    historyDir,
  } = options;

  const errorMessage = typeof error === 'string' ? error : error.message;
  const inferredErrorCode = errorCode ?? inferErrorCode(error);
  const stackTrace = typeof error === 'string' ? undefined : error.stack;

  // Build failure record
  const record: FailureRecord = {
    program_id: programId,
    program_name: programName,
    failed_at: new Date().toISOString(),
    phase,
    error: errorMessage,
    error_code: inferredErrorCode,
    details: {
      stack_trace: stackTrace,
      context,
    },
    tags: [...tags, phase.toLowerCase(), inferredErrorCode.toLowerCase()],
  };

  // Add coverage details if provided
  if (expectedCoverage !== undefined || actualCoverage !== undefined) {
    record.details.expected_coverage = expectedCoverage;
    record.details.actual_coverage = actualCoverage;
  }

  if (missingExpressions && missingExpressions.length > 0) {
    record.details.missing_expressions = missingExpressions;
  }

  // Determine failures directory
  const failuresDir = historyDir
    ? path.join(historyDir, 'failures')
    : path.resolve(process.cwd(), '../../.migration-history/failures');

  // Ensure directory exists
  fs.mkdirSync(failuresDir, { recursive: true });

  // Write failure record
  const filename = generateFailureFilename(programId);
  const filepath = path.join(failuresDir, filename);

  fs.writeFileSync(filepath, JSON.stringify(record, null, 2), 'utf8');

  return filepath;
}

/**
 * Update a failure record with resolution details
 */
export async function resolveFailure(
  filepath: string,
  resolution: Omit<FailureResolution, 'resolved_at'>,
  lessonsLearned?: string[]
): Promise<void> {
  if (!fs.existsSync(filepath)) {
    throw new Error(`Failure record not found: ${filepath}`);
  }

  const content = fs.readFileSync(filepath, 'utf8');
  const record: FailureRecord = JSON.parse(content);

  // Add resolution
  record.resolution = {
    ...resolution,
    resolved_at: new Date().toISOString(),
  };

  // Add lessons learned
  if (lessonsLearned && lessonsLearned.length > 0) {
    record.lessons_learned = lessonsLearned;
  }

  // Calculate resolution time if possible
  if (record.failed_at && record.resolution.resolved_at) {
    const failedAt = new Date(record.failed_at);
    const resolvedAt = new Date(record.resolution.resolved_at);
    const diffMs = resolvedAt.getTime() - failedAt.getTime();
    record.resolution.resolution_time_minutes = Math.round(diffMs / 60000);
  }

  // Write updated record
  fs.writeFileSync(filepath, JSON.stringify(record, null, 2), 'utf8');
}

/**
 * List all failure records
 */
export function listFailures(historyDir?: string): string[] {
  const failuresDir = historyDir
    ? path.join(historyDir, 'failures')
    : path.resolve(process.cwd(), '../../.migration-history/failures');

  if (!fs.existsSync(failuresDir)) {
    return [];
  }

  return fs
    .readdirSync(failuresDir)
    .filter((f) => f.startsWith('Prg_') && f.endsWith('.json'))
    .map((f) => path.join(failuresDir, f));
}

/**
 * Get unresolved failures
 */
export function getUnresolvedFailures(historyDir?: string): FailureRecord[] {
  const files = listFailures(historyDir);
  const unresolved: FailureRecord[] = [];

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const record: FailureRecord = JSON.parse(content);

    if (!record.resolution || !record.resolution.verification_passed) {
      unresolved.push(record);
    }
  }

  return unresolved;
}

/**
 * Get failure statistics
 */
export function getFailureStats(historyDir?: string): {
  total: number;
  unresolved: number;
  byPhase: Record<string, number>;
  byErrorCode: Record<string, number>;
  avgResolutionTime: number;
} {
  const files = listFailures(historyDir);
  const stats = {
    total: files.length,
    unresolved: 0,
    byPhase: {} as Record<string, number>,
    byErrorCode: {} as Record<string, number>,
    avgResolutionTime: 0,
  };

  let totalResolutionTime = 0;
  let resolvedCount = 0;

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const record: FailureRecord = JSON.parse(content);

    // Count unresolved
    if (!record.resolution || !record.resolution.verification_passed) {
      stats.unresolved++;
    }

    // Count by phase
    stats.byPhase[record.phase] = (stats.byPhase[record.phase] || 0) + 1;

    // Count by error code
    stats.byErrorCode[record.error_code] =
      (stats.byErrorCode[record.error_code] || 0) + 1;

    // Calculate avg resolution time
    if (
      record.resolution &&
      record.resolution.resolution_time_minutes !== undefined
    ) {
      totalResolutionTime += record.resolution.resolution_time_minutes;
      resolvedCount++;
    }
  }

  stats.avgResolutionTime =
    resolvedCount > 0 ? Math.round(totalResolutionTime / resolvedCount) : 0;

  return stats;
}
