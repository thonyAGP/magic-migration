/**
 * Migration Logger - Persistent JSONL logging for debugging migration failures.
 * Logs stored in .openspec/migration/{project}/logs/{batch}/ for historical analysis.
 */

import fs from 'node:fs';
import path from 'node:path';

export interface LogEvent {
  event: 'start' | 'success' | 'error' | 'timeout' | 'retry';
  model?: string;
  duration_ms?: number;
  prompt_size?: number;
  tokens_used?: number;
  attempt?: number;
  error_message?: string;
}

export interface LogMetadata {
  timestamp: string;
  program: number | string;
  phase: string;
}

export type LogEntry = LogMetadata & LogEvent;

/**
 * Persistent logger for migration phases.
 * Writes JSONL logs to .openspec/migration/{project}/logs/{batch}/
 */
export class MigrationLogger {
  private logDir: string;
  private programNames: Map<number | string, string>;
  private projectKey: string;
  private batch: string;

  constructor(projectKey: string, batch: string, programNames: Map<number | string, string>) {
    this.projectKey = projectKey;
    this.batch = batch;
    this.programNames = programNames;

    // Log directory: .openspec/migration/ADH/logs/B2/ (created lazily)
    this.logDir = path.join('.openspec/migration', projectKey, 'logs', batch);
  }

  /**
   * Log a phase event for a program.
   * Writes to phase-specific log: phase-types/117-GESTION_CAISSE.jsonl
   * Also writes errors to errors.jsonl for quick access.
   */
  logPhaseEvent(program: number | string, phase: string, event: LogEvent): void {
    const phaseDir = path.join(this.logDir, `phase-${phase}`);
    fs.mkdirSync(phaseDir, { recursive: true });

    const programName = this.formatProgramName(program);
    const logFile = path.join(phaseDir, `${programName}.jsonl`);

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      program,
      phase,
      ...event,
    };

    fs.appendFileSync(logFile, JSON.stringify(entry) + '\n', 'utf8');

    // Log errors to errors.jsonl for quick filtering
    if (event.event === 'error' || event.event === 'timeout') {
      const errorsFile = path.join(this.logDir, 'errors.jsonl');
      fs.appendFileSync(errorsFile, JSON.stringify(entry) + '\n', 'utf8');
    }
  }

  /**
   * Log batch summary when migration completes.
   * Writes to batch-summary.json for dashboard display.
   */
  logBatchSummary(summary: {
    batchId: string;
    totalPrograms: number;
    completed: number;
    failed: number;
    duration_ms: number;
    totalTokens?: { input: number; output: number };
  }): void {
    // Ensure log directory exists
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }

    const summaryFile = path.join(this.logDir, 'batch-summary.json');
    const data = {
      timestamp: new Date().toISOString(),
      ...summary,
    };
    fs.writeFileSync(summaryFile, JSON.stringify(data, null, 2), 'utf8');
  }

  /**
   * Format program name: 117 → 117-GESTION_CAISSE
   * Uses programNames map or fallback to IDE-{id}.
   */
  formatProgramName(program: number | string): string {
    const id = String(program);
    const name = this.programNames.get(program) ?? `IDE-${id}`;
    return `${id}-${name.replace(/[^A-Za-z0-9_]/g, '_')}`;
  }

  /**
   * Get log directory path for external access.
   */
  getLogDir(): string {
    return this.logDir;
  }

  /**
   * Check if errors.jsonl exists (migration had errors).
   */
  hasErrors(): boolean {
    return fs.existsSync(path.join(this.logDir, 'errors.jsonl'));
  }

  /**
   * Read all errors from errors.jsonl.
   */
  readErrors(): LogEntry[] {
    const errorsFile = path.join(this.logDir, 'errors.jsonl');
    if (!fs.existsSync(errorsFile)) return [];

    const lines = fs.readFileSync(errorsFile, 'utf8').split('\n').filter(Boolean);
    return lines.map(line => JSON.parse(line));
  }

  /**
   * Read all logs for a specific program/phase.
   */
  readPhaseLogs(program: number | string, phase: string): LogEntry[] {
    const programName = this.formatProgramName(program);
    const logFile = path.join(this.logDir, `phase-${phase}`, `${programName}.jsonl`);

    if (!fs.existsSync(logFile)) return [];

    const lines = fs.readFileSync(logFile, 'utf8').split('\n').filter(Boolean);
    return lines.map(line => JSON.parse(line));
  }

  /**
   * List all phases with logs for this batch.
   */
  listPhases(): string[] {
    if (!fs.existsSync(this.logDir)) return [];

    return fs.readdirSync(this.logDir)
      .filter(name => name.startsWith('phase-'))
      .map(name => name.replace('phase-', ''));
  }

  /**
   * Count total log entries across all phases.
   */
  countTotalEntries(): number {
    let count = 0;
    const phases = this.listPhases();

    for (const phase of phases) {
      const phaseDir = path.join(this.logDir, `phase-${phase}`);
      const files = fs.readdirSync(phaseDir).filter(f => f.endsWith('.jsonl'));

      for (const file of files) {
        const lines = fs.readFileSync(path.join(phaseDir, file), 'utf8').split('\n').filter(Boolean);
        count += lines.length;
      }
    }

    return count;
  }
}

/**
 * Helper to create logger from migration config.
 */
export const createMigrationLogger = (
  projectKey: string,
  batch: string,
  programs: Map<number | string, string>,
): MigrationLogger => {
  return new MigrationLogger(projectKey, batch, programs);
};
