/**
 * Log Storage - JSONL log persistence with rotation for migration events.
 * Stores logs in .openspec/migration/{project}/logs/{batch}.jsonl
 */

import fs from 'node:fs';
import path from 'node:path';

export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  type: string;
  programId?: string | number;
  phase?: string;
  message: string;
  data?: Record<string, unknown>;
}

const MAX_LINES_PER_FILE = 10_000;

/**
 * Write a log entry to JSONL file with rotation.
 * When file exceeds MAX_LINES_PER_FILE, rotates to {batch}.1.jsonl.
 */
export const writeLogEntry = (logDir: string, batchId: string, entry: LogEntry): void => {
  fs.mkdirSync(logDir, { recursive: true });

  const logsFile = path.join(logDir, `${batchId}.jsonl`);

  // Rotate if exceeds max lines
  if (fs.existsSync(logsFile) && countLines(logsFile) >= MAX_LINES_PER_FILE) {
    rotateLog(logsFile, logDir, batchId);
  }

  fs.appendFileSync(logsFile, JSON.stringify(entry) + '\n', 'utf8');
};

/**
 * Rotate log file: {batch}.jsonl → {batch}.1.jsonl
 * If {batch}.1.jsonl exists, shifts to .2, .3, etc.
 */
const rotateLog = (currentFile: string, logDir: string, batchId: string): void => {
  let index = 1;
  while (fs.existsSync(path.join(logDir, `${batchId}.${index}.jsonl`))) {
    index++;
  }

  fs.renameSync(currentFile, path.join(logDir, `${batchId}.${index}.jsonl`));
};

/**
 * Count lines in a file (for rotation check).
 */
const countLines = (file: string): number => {
  const content = fs.readFileSync(file, 'utf8');
  return content.split('\n').filter(Boolean).length;
};

/**
 * Read logs from JSONL file with pagination.
 */
export const readLogs = (
  logDir: string,
  batchId: string,
  options: { offset?: number; limit?: number; level?: LogEntry['level'] } = {},
): { total: number; logs: LogEntry[] } => {
  const logsFile = path.join(logDir, `${batchId}.jsonl`);
  if (!fs.existsSync(logsFile)) return { total: 0, logs: [] };

  const lines = fs.readFileSync(logsFile, 'utf8').split('\n').filter(Boolean);
  const parsed = lines.map(line => JSON.parse(line) as LogEntry);

  // Filter by level
  const filtered = options.level
    ? parsed.filter(entry => levelFilter(entry, options.level!))
    : parsed;

  // Paginate
  const offset = options.offset ?? 0;
  const limit = options.limit ?? 100;
  const slice = filtered.slice(offset, offset + limit);

  return { total: filtered.length, logs: slice };
};

/**
 * Level filter: return entries at or above specified level.
 * Hierarchy: error > warn > info > debug
 */
const levelFilter = (entry: LogEntry, level: LogEntry['level']): boolean => {
  const levels: LogEntry['level'][] = ['debug', 'info', 'warn', 'error'];
  const minIdx = levels.indexOf(level);
  const entryIdx = levels.indexOf(entry.level);
  return entryIdx >= minIdx;
};

/**
 * Search logs by text (case-insensitive).
 */
export const searchLogs = (
  logDir: string,
  batchId: string,
  searchText: string,
  options: { level?: LogEntry['level']; limit?: number } = {},
): LogEntry[] => {
  const { total, logs } = readLogs(logDir, batchId, { limit: 10_000, level: options.level });
  const lowerSearch = searchText.toLowerCase();

  const matches = logs.filter(entry =>
    entry.message.toLowerCase().includes(lowerSearch) ||
    String(entry.programId).includes(lowerSearch) ||
    entry.type.toLowerCase().includes(lowerSearch),
  );

  return matches.slice(0, options.limit ?? 100);
};

/**
 * Get latest N logs (most recent first).
 */
export const getLatestLogs = (
  logDir: string,
  batchId: string,
  count = 100,
  level?: LogEntry['level'],
): LogEntry[] => {
  const { logs } = readLogs(logDir, batchId, { level });
  return logs.slice(-count).reverse();
};

/**
 * Clear logs for a batch (delete JSONL file).
 */
export const clearLogs = (logDir: string, batchId: string): void => {
  const logsFile = path.join(logDir, `${batchId}.jsonl`);
  if (fs.existsSync(logsFile)) {
    fs.unlinkSync(logsFile);
  }

  // Also delete rotated files
  let index = 1;
  while (fs.existsSync(path.join(logDir, `${batchId}.${index}.jsonl`))) {
    fs.unlinkSync(path.join(logDir, `${batchId}.${index}.jsonl`));
    index++;
  }
};

/**
 * List all batches with logs in a directory.
 */
export const listLoggedBatches = (logDir: string): string[] => {
  if (!fs.existsSync(logDir)) return [];

  // Filter for main batch files (exclude rotated files like B2.1.jsonl)
  const files = fs.readdirSync(logDir).filter(f => {
    return f.endsWith('.jsonl') && !f.match(/\.\d+\.jsonl$/);
  });
  return files.map(f => f.replace('.jsonl', ''));
};
