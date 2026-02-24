/**
 * Migration contract I/O: parse, validate, write YAML contracts.
 */

import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import type {
  MigrationContract, ContractRule, ContractVariable,
  ContractTable, ContractCallee, ContractOverall, ContractEffort, ItemStatus,
} from './types.js';

// Re-export types for external use
export type { MigrationContract, ContractRule, ContractVariable, ContractTable, ContractCallee, ContractOverall, ContractEffort, ItemStatus };

// Extended contract format for internal processing (SWARM, complexity calculation)
// Includes additional metadata and analysis fields not in the YAML format
// This is a more permissive type that accepts both standard contracts and extended formats
export interface ExtendedMigrationContract {
  // Standard contract fields (optional)
  program?: Partial<MigrationContract['program']>;
  rules?: MigrationContract['rules'];
  variables?: MigrationContract['variables'];
  callees?: MigrationContract['callees'];
  overall?: Partial<MigrationContract['overall']>;

  // Extended fields for internal processing
  metadata?: {
    program_id?: number;
    program_name?: string;
    source_language?: string;
    target_language?: string;
    legacy_expressions?: Array<{ id: number; formula: string; description: string }>;
    tables?: Array<{ id: number; name: string; fields: unknown[] }>;
    dependencies?: Array<{ type: string; [key: string]: unknown }>;
    [key: string]: unknown;
  };
  business_logic?: {
    complexity?: {
      nesting_depth?: number;
      calculations?: number;
      validations?: number;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
  modern_implementation?: {
    notes?: string;
    [key: string]: unknown;
  };
  expressions?: unknown[];
  tables?: unknown[];
  tasks?: unknown[];
  logic_lines?: unknown[];
  [key: string]: unknown;
}

// ─── Parse contract from YAML file ──────────────────────────────

export const parseContract = (filePath: string): MigrationContract => {
  const raw = fs.readFileSync(filePath, 'utf8');
  const doc = YAML.parse(raw);

  return {
    program: {
      id: doc.program.id,
      name: doc.program.name,
      complexity: (doc.program.complexity ?? 'MEDIUM').toUpperCase(),
      callers: doc.program.callers ?? [],
      callees: doc.program.callees ?? [],
      tasksCount: doc.program.tasks_count ?? 0,
      tablesCount: doc.program.tables_count ?? 0,
      expressionsCount: doc.program.expressions_count ?? 0,
    },
    rules: (doc.rules ?? []).map(mapRule),
    variables: (doc.variables ?? []).map(mapVariable),
    tables: (doc.tables ?? []).map(mapTable),
    callees: (doc.callees ?? []).map(mapCallee),
    overall: mapOverall(doc.overall ?? {}),
  };
};

// ─── Write contract to YAML file ────────────────────────────────

export const writeContract = (contract: MigrationContract, filePath: string): void => {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const doc = {
    program: {
      id: contract.program.id,
      name: contract.program.name,
      complexity: contract.program.complexity,
      callers: contract.program.callers,
      callees: contract.program.callees,
      tasks_count: contract.program.tasksCount,
      tables_count: contract.program.tablesCount,
      expressions_count: contract.program.expressionsCount,
    },
    rules: contract.rules.map(r => ({
      id: r.id,
      description: r.description,
      condition: r.condition,
      variables: r.variables,
      status: r.status,
      target_file: r.targetFile,
      gap_notes: r.gapNotes,
    })),
    variables: contract.variables.map(v => ({
      local_id: v.localId,
      name: v.name,
      type: v.type,
      status: v.status,
      target_file: v.targetFile,
      gap_notes: v.gapNotes,
    })),
    tables: contract.tables.map(t => ({
      id: t.id,
      name: t.name,
      mode: t.mode,
      status: t.status,
      target_file: t.targetFile,
      gap_notes: t.gapNotes,
    })),
    callees: contract.callees.map(c => ({
      id: c.id,
      name: c.name,
      calls: c.calls,
      context: c.context,
      status: c.status,
      target: c.target,
      gap_notes: c.gapNotes,
    })),
    overall: {
      rules_total: contract.overall.rulesTotal,
      rules_impl: contract.overall.rulesImpl,
      rules_partial: contract.overall.rulesPartial,
      rules_missing: contract.overall.rulesMissing,
      rules_na: contract.overall.rulesNa,
      variables_key_count: contract.overall.variablesKeyCount,
      callees_total: contract.overall.calleesTotal,
      callees_impl: contract.overall.calleesImpl,
      callees_missing: contract.overall.calleesMissing,
      coverage_pct: contract.overall.coveragePct,
      status: contract.overall.status,
      generated: contract.overall.generated,
      notes: contract.overall.notes,
      ...(contract.overall.effort ? {
        effort: {
          contracted_at: contract.overall.effort.contractedAt,
          enriched_at: contract.overall.effort.enrichedAt,
          verified_at: contract.overall.effort.verifiedAt,
          estimated_hours: contract.overall.effort.estimatedHours,
          actual_hours: contract.overall.effort.actualHours,
        },
      } : {}),
    },
  };

  fs.writeFileSync(filePath, YAML.stringify(doc, { lineWidth: 120 }), 'utf8');
};

// ─── Validate contract completeness ─────────────────────────────

export interface ContractValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export const validateContract = (contract: MigrationContract): ContractValidation => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!contract.program.id) errors.push('Missing program.id');
  if (!contract.program.name) errors.push('Missing program.name');
  if (contract.rules.length === 0 && contract.variables.length === 0) {
    warnings.push('Contract has no rules and no variables');
  }

  const validStatuses = new Set(['IMPL', 'PARTIAL', 'MISSING', 'N/A']);
  for (const r of contract.rules) {
    if (!validStatuses.has(r.status)) errors.push(`Rule ${r.id}: invalid status '${r.status}'`);
  }
  for (const v of contract.variables) {
    if (!validStatuses.has(v.status)) errors.push(`Variable ${v.localId}: invalid status '${v.status}'`);
  }
  for (const t of contract.tables) {
    if (!validStatuses.has(t.status)) errors.push(`Table ${t.id}: invalid status '${t.status}'`);
  }
  for (const c of contract.callees) {
    if (!validStatuses.has(c.status)) errors.push(`Callee ${c.id}: invalid status '${c.status}'`);
  }

  return { valid: errors.length === 0, errors, warnings };
};

// ─── Load all contracts from a directory ─────────────────────────

export const loadContracts = (dir: string, pattern = /\.contract\.yaml$/): Map<string | number, MigrationContract> => {
  const contracts = new Map<string | number, MigrationContract>();

  if (!fs.existsSync(dir)) return contracts;

  const files = fs.readdirSync(dir).filter(f => pattern.test(f));
  for (const file of files) {
    const contract = parseContract(path.join(dir, file));
    contracts.set(contract.program.id, contract);
  }

  return contracts;
};

// ─── Helpers ─────────────────────────────────────────────────────

const normalizeStatus = (s: string): ItemStatus => {
  const upper = (s ?? '').toUpperCase().trim();
  if (upper === 'IMPL') return 'IMPL';
  if (upper === 'PARTIAL') return 'PARTIAL';
  if (upper === 'MISSING') return 'MISSING';
  return 'N/A';
};

const mapRule = (r: Record<string, unknown>): ContractRule => ({
  id: String(r.id ?? ''),
  description: String(r.description ?? ''),
  condition: String(r.condition ?? ''),
  variables: (r.variables as string[]) ?? [],
  status: normalizeStatus(String(r.status ?? '')),
  targetFile: String(r.target_file ?? ''),
  gapNotes: String(r.gap_notes ?? ''),
});

const mapVariable = (v: Record<string, unknown>): ContractVariable => ({
  localId: String(v.local_id ?? v.letter ?? ''),
  name: String(v.name ?? ''),
  type: (v.type as 'Parameter' | 'Virtual' | 'Real') ?? 'Virtual',
  status: normalizeStatus(String(v.status ?? '')),
  targetFile: String(v.target_file ?? ''),
  gapNotes: String(v.gap_notes ?? ''),
});

const mapTable = (t: Record<string, unknown>): ContractTable => ({
  id: t.id as string | number ?? 0,
  name: String(t.name ?? ''),
  mode: (t.mode as 'R' | 'W' | 'RW') ?? 'R',
  status: normalizeStatus(String(t.status ?? '')),
  targetFile: String(t.target_file ?? ''),
  gapNotes: String(t.gap_notes ?? ''),
});

const mapCallee = (c: Record<string, unknown>): ContractCallee => ({
  id: (c.id ?? c.ide ?? 0) as string | number,
  name: String(c.name ?? ''),
  calls: Number(c.calls ?? 0),
  context: String(c.context ?? ''),
  status: normalizeStatus(String(c.status ?? '')),
  target: String(c.target ?? ''),
  gapNotes: String(c.gap_notes ?? ''),
});

const mapEffort = (e: Record<string, unknown> | undefined): ContractEffort | undefined => {
  if (!e) return undefined;
  return {
    contractedAt: e.contracted_at ? String(e.contracted_at) : undefined,
    enrichedAt: e.enriched_at ? String(e.enriched_at) : undefined,
    verifiedAt: e.verified_at ? String(e.verified_at) : undefined,
    estimatedHours: e.estimated_hours != null ? Number(e.estimated_hours) : undefined,
    actualHours: e.actual_hours != null ? Number(e.actual_hours) : undefined,
  };
};

const mapOverall = (o: Record<string, unknown>): ContractOverall => ({
  rulesTotal: Number(o.rules_total ?? 0),
  rulesImpl: Number(o.rules_impl ?? 0),
  rulesPartial: Number(o.rules_partial ?? 0),
  rulesMissing: Number(o.rules_missing ?? 0),
  rulesNa: Number(o.rules_na ?? 0),
  variablesKeyCount: Number(o.variables_key_count ?? 0),
  calleesTotal: Number(o.callees_total ?? 0),
  calleesImpl: Number(o.callees_impl ?? 0),
  calleesMissing: Number(o.callees_missing ?? 0),
  coveragePct: Number(o.coverage_pct ?? 0),
  status: String(o.status ?? 'pending') as MigrationContract['overall']['status'],
  generated: String(o.generated ?? ''),
  notes: String(o.notes ?? ''),
  effort: mapEffort(o.effort as Record<string, unknown> | undefined),
});
