/**
 * Generic adapter: imports program graphs from CSV or JSON files.
 * For legacy systems without an automatic parser (COBOL, VB6, Delphi, etc.)
 */

import fs from 'node:fs';
import type { SpecExtractor, ProgramGraph, MigrationContract, Program } from '../core/types.js';

export interface GenericProgramRow {
  id: string | number;
  name: string;
  complexity?: string;
  callees?: string; // comma-separated IDs
  callers?: string; // comma-separated IDs
  domain?: string;
  shared?: boolean;
}

export interface GenericAdapterConfig {
  programsFile: string;
  format: 'json' | 'csv';
  seeds: (string | number)[];
  sharedPrograms: (string | number)[];
}

export const createGenericAdapter = (config: GenericAdapterConfig): SpecExtractor => ({
  name: 'generic',

  async extractProgramGraph(): Promise<ProgramGraph> {
    const rows = loadRows(config);

    const programs: Program[] = rows.map(row => ({
      id: row.id,
      name: row.name,
      complexity: normalizeComplexity(row.complexity),
      level: 0,
      callers: parseIdList(row.callers),
      callees: parseIdList(row.callees),
      source: config.seeds.includes(row.id) ? 'seed' as const
        : config.sharedPrograms.includes(row.id) ? 'ecf' as const
        : 'manual' as const,
      domain: row.domain ?? '',
    }));

    return {
      generated: new Date().toISOString().slice(0, 10),
      method: `Generic import from ${config.format}`,
      totalPrograms: programs.length,
      liveCount: programs.length,
      orphanCount: 0,
      seeds: config.seeds,
      sharedPrograms: config.sharedPrograms,
      programs,
      orphans: [],
    };
  },

  async extractSpec(_programId: string | number): Promise<MigrationContract | null> {
    // Generic adapter has no spec extraction - contracts are created manually
    return null;
  },

  async getSharedPrograms(): Promise<(string | number)[]> {
    return config.sharedPrograms;
  },
});

const loadRows = (config: GenericAdapterConfig): GenericProgramRow[] => {
  const content = fs.readFileSync(config.programsFile, 'utf8');

  if (config.format === 'json') {
    return JSON.parse(content) as GenericProgramRow[];
  }

  // CSV parsing (simple: comma-delimited, first row = headers)
  const lines = content.split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = values[i] ?? ''; });

    return {
      id: row.id ?? '',
      name: row.name ?? '',
      complexity: row.complexity,
      callees: row.callees,
      callers: row.callers,
      domain: row.domain,
      shared: row.shared === 'true',
    };
  });
};

const parseIdList = (s?: string): (string | number)[] => {
  if (!s) return [];
  return s.split(/[,;|]/).map(v => v.trim()).filter(Boolean).map(v => {
    const n = Number(v);
    return isNaN(n) ? v : n;
  });
};

const normalizeComplexity = (raw?: string): 'LOW' | 'MEDIUM' | 'HIGH' => {
  const upper = (raw ?? '').toUpperCase();
  if (upper === 'LOW' || upper === 'BASSE' || upper === 'L') return 'LOW';
  if (upper === 'HIGH' || upper === 'HAUTE' || upper === 'H') return 'HIGH';
  return 'MEDIUM';
};
