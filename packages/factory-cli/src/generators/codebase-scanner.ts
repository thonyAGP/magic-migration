/**
 * Codebase Scanner: scan web codebase to find existing implementations.
 * Matches spec items (rules, tables, callees) to source files.
 */

import fs from 'node:fs';
import path from 'node:path';
import type { ContractRule, ContractTable, ContractCallee, ContractVariable, ItemStatus } from '../core/types.js';

const escapeRegex = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Build a safe regex pattern from a name by extracting alpha words and joining with \s+.
 * Never produces invalid regex (no special chars, no truncation issues).
 * Returns null if the name has no usable words.
 */
const safeNamePattern = (name: string, maxLen = 30): RegExp | null => {
  try {
    const words = name.match(/[a-zA-Z0-9]+/g);
    if (!words || words.length === 0) return null;
    let pattern = '';
    for (const w of words) {
      const next = pattern ? pattern + '\\s+' + w : w;
      if (next.length > maxLen) break;
      pattern = next;
    }
    if (!pattern) pattern = words[0].substring(0, maxLen);
    return new RegExp(pattern, 'i');
  } catch {
    return null;
  }
};

export interface ScanResult {
  rules: ContractRule[];
  tables: ContractTable[];
  callees: ContractCallee[];
  variables: ContractVariable[];
}

// ─── Known N/A patterns (learned from B1) ─────────────────────────

const NA_CALLEE_PATTERNS = [
  /raz\s*current\s*printer/i,
  /set\s*listing\s*number/i,
  /get\s*printer/i,
  /printer\s*choice/i,
  /print\s*ticket/i,
  /caracteres?\s*interdit/i,
];

const NA_TABLE_PATTERNS = [
  /tempo_ecran/i,
  /Table_\d+$/,   // Memory tables
];

const isNaCallee = (name: string): boolean =>
  NA_CALLEE_PATTERNS.some(p => p.test(name));

const isNaTable = (name: string, mode: string): boolean =>
  (mode === 'R' && false) || // Read-only not auto-NA
  NA_TABLE_PATTERNS.some(p => p.test(name));

// ─── File scanning ───────────────────────────────────────────────

interface FileIndex {
  files: string[];
  contentCache: Map<string, string>;
}

const buildFileIndex = (codebaseDir: string): FileIndex => {
  const files: string[] = [];
  const contentCache = new Map<string, string>();

  if (!fs.existsSync(codebaseDir)) return { files, contentCache };

  const walk = (dir: string) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist') continue;
        walk(fullPath);
      } else if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
        files.push(fullPath);
      }
    }
  };

  walk(codebaseDir);
  return { files, contentCache };
};

const readCached = (filePath: string, index: FileIndex): string => {
  let content = index.contentCache.get(filePath);
  if (content === undefined) {
    content = fs.readFileSync(filePath, 'utf8');
    index.contentCache.set(filePath, content);
  }
  return content;
};

const findFileContaining = (pattern: RegExp, index: FileIndex): string | undefined => {
  for (const file of index.files) {
    const content = readCached(file, index);
    if (pattern.test(content)) return file;
  }
  return undefined;
};

// ─── Scanner ─────────────────────────────────────────────────────

export interface ScanOptions {
  codebaseDir: string;
  projectDir?: string;
}

export const scanCodebase = (
  rules: ContractRule[],
  tables: ContractTable[],
  callees: ContractCallee[],
  variables: ContractVariable[],
  options: ScanOptions,
): ScanResult => {
  const index = buildFileIndex(options.codebaseDir);
  const relBase = options.projectDir ?? options.codebaseDir;

  const relPath = (absPath: string): string => {
    const rel = path.relative(relBase, absPath);
    return rel.replace(/\\/g, '/');
  };

  // Scan rules: search for RM-XXX id references
  const scannedRules = rules.map(rule => {
    const pattern = new RegExp(rule.id.replace('-', '[-_]?'), 'i');
    const file = findFileContaining(pattern, index);
    if (file) {
      return { ...rule, status: 'IMPL' as ItemStatus, targetFile: relPath(file) };
    }
    return { ...rule };
  });

  // Scan tables: search for table name references
  const scannedTables = tables.map(table => {
    if (isNaTable(table.name, table.mode)) {
      return { ...table, status: 'N/A' as ItemStatus, gapNotes: 'Legacy-only (memory/temp table)' };
    }

    // Search for table name (without suffix like ___rec)
    const cleanName = table.name.replace(/_+\w{3}$/, '');
    const pattern = new RegExp(escapeRegex(cleanName).replace(/[_-]+/g, '[_\\-\\s]*'), 'i');
    const file = findFileContaining(pattern, index);
    if (file) {
      return { ...table, status: 'IMPL' as ItemStatus, targetFile: relPath(file) };
    }
    return { ...table };
  });

  // Scan callees: search for program references
  const scannedCallees = callees.map(callee => {
    if (isNaCallee(callee.name)) {
      return { ...callee, status: 'N/A' as ItemStatus, gapNotes: 'Legacy print/utility (N/A for web)' };
    }

    // Search for callee name or IDE reference
    const namePattern = safeNamePattern(callee.name, 30);
    const idePattern = new RegExp(`IDE[_\\s-]*${callee.id}`, 'i');
    const file = (namePattern ? findFileContaining(namePattern, index) : undefined) ?? findFileContaining(idePattern, index);
    if (file) {
      return { ...callee, status: 'IMPL' as ItemStatus, target: relPath(file) };
    }
    return { ...callee };
  });

  // Scan variables: search for variable names
  const scannedVariables = variables.map(v => {
    const pattern = safeNamePattern(v.name, 25);
    const file = pattern ? findFileContaining(pattern, index) : undefined;
    if (file) {
      return { ...v, status: 'IMPL' as ItemStatus, targetFile: relPath(file) };
    }
    return { ...v };
  });

  return {
    rules: scannedRules,
    tables: scannedTables,
    callees: scannedCallees,
    variables: scannedVariables,
  };
};
