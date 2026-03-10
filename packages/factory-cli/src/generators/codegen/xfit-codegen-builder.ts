/**
 * XFIT-S Codegen Builder
 * Converts BusinessRulesResult + Table[] (KB) → CodegenModel
 * 100% deterministic — zero AI. Replaces Claude's analysis.json.
 *
 * Improvement over V8:
 * - entities: ALL columns from KB (300 fields vs 15)
 * - actions: real conditions/expressions from IR (not TODO stubs)
 * - apiCalls: derived from navigation rules (callTarget → endpoint)
 */

import type { BusinessRulesResult, BusinessRule } from '@magic-migration/data-model';
import type { Table } from '@magic-migration/data-model';
import type { CodegenModel, CodegenEntity, CodegenAction, CodegenApiCall, CodegenField } from './codegen-model.js';

// ─── Magic type → TypeScript type ────────────────────────────────────────────

const MAGIC_TO_TS: Record<string, string> = {
  ALPHA: 'string',
  UNICODE: 'string',
  NUMERIC: 'number',
  DATE: 'Date',
  TIME: 'string',
  LOGICAL: 'boolean',
  BLOB: 'Blob | null',
  MEMO: 'string',
  unknown: 'unknown',
};

const magicTypeToTs = (magicType: string): string =>
  MAGIC_TO_TS[magicType.toUpperCase()] ?? 'unknown';

// ─── Name utilities ───────────────────────────────────────────────────────────

/** `cte_montant_debit` → `cteMontantDebit` */
const columnToCamel = (colName: string): string => {
  const parts = colName.split('_').filter(Boolean);
  if (parts.length === 0) return 'unknown';
  return parts[0].toLowerCase() + parts.slice(1).map(p => p[0].toUpperCase() + p.slice(1).toLowerCase()).join('');
};

/** `EXTRAIT_COMPTE` → `extraitCompte` */
const programNameToDomain = (name: string): string => {
  const clean = name.replace(/^(ADH|PBP|PVE|PBG|REF|VIL)[-_\s]+/i, '');
  const parts = clean.split(/[_\-\s]+/).filter(Boolean);
  if (parts.length === 0) return 'unknown';
  return parts[0].toLowerCase() + parts.slice(1).map(p => p[0].toUpperCase() + p.slice(1).toLowerCase()).join('');
};

/** `comptable________cte` → `ComptableCte`, `gm-complet___gmc` → `GmCompletGmc` */
const tableNameToInterface = (tableName: string): string => {
  const clean = tableName.replace(/\s+/g, '').replace(/[-_]{2,}/g, '_').replace(/-/g, '_');
  return clean.split('_').filter(Boolean).map(p => p[0].toUpperCase() + p.slice(1)).join('');
};

/** Build action handler name from rule */
const ruleToHandlerName = (rule: BusinessRule, index: number): string => {
  const event = rule.event?.toLowerCase().replace(/[^a-z]/g, '') ?? '';
  const typePrefix = rule.type === 'validation' ? 'validate' : 'calculate';
  return `${typePrefix}${event ? event[0].toUpperCase() + event.slice(1) : ''}Rule${String(index + 1).padStart(2, '0')}`;
};

// ─── Builder ──────────────────────────────────────────────────────────────────

export interface XfitCodegenInput {
  rulesResult: BusinessRulesResult;
  /** Tables from KB (datasources-parser output) — full column coverage */
  kbTables: Table[];
  /** Tables from IR data-model phase — tables actually accessed by this program */
  programTables: Table[];
}

export const buildXfitCodegenModel = (input: XfitCodegenInput): CodegenModel => {
  const { rulesResult, kbTables, programTables } = input;
  const domain = programNameToDomain(rulesResult.programName);
  const domainPascal = domain[0].toUpperCase() + domain.slice(1);

  // ── Entities: prefer KB tables (full columns) over IR tables ─────────────
  const entities = buildEntities(programTables, kbTables);

  // ── Actions: from validation + calculation rules ──────────────────────────
  const logicRules = rulesResult.rules.filter(r =>
    r.type === 'validation' || r.type === 'calculation'
  );
  const actions = buildActions(logicRules);

  // ── API calls: from navigation rules (callTarget → endpoint) ─────────────
  const navRules = rulesResult.rules.filter(r => r.type === 'navigation');
  const apiCalls = buildApiCalls(navRules, domain);

  // ── State fields: from read tables (list fields) ──────────────────────────
  const stateFields = buildStateFields(programTables, kbTables, rulesResult.summary.tablesRead);

  return {
    programId: rulesResult.programId,
    programName: rulesResult.programName,
    domain,
    domainPascal,
    entities,
    actions,
    apiCalls,
    stateFields,
  };
};

// ─── Entities ─────────────────────────────────────────────────────────────────

const buildEntities = (programTables: Table[], kbTables: Table[]): CodegenEntity[] => {
  return programTables.map(pt => {
    // Try to find richer KB version (more columns)
    const kbTable = kbTables.find(
      kt => kt.id === pt.id || kt.name === pt.name
    );
    const table = (kbTable && kbTable.columns.length > pt.columns.length) ? kbTable : pt;

    const fields: CodegenField[] = table.columns.map(col => ({
      name: columnToCamel(col.name),
      type: magicTypeToTs(col.type),
      source: 'table' as const,
      description: `${table.name}.${col.name}`,
      localId: String(col.id),
    }));

    return {
      name: columnToCamel(table.name),
      interfaceName: tableNameToInterface(table.name),
      fields,
      mode: 'R' as const,
    };
  });
};

// ─── Actions ──────────────────────────────────────────────────────────────────

const buildActions = (rules: BusinessRule[]): CodegenAction[] => {
  return rules.map((rule, i) => ({
    id: rule.id,
    handlerName: ruleToHandlerName(rule, i),
    description: rule.description,
    condition: rule.expression ?? '',
    variables: rule.variables,
  }));
};

// ─── API Calls ────────────────────────────────────────────────────────────────

const buildApiCalls = (navRules: BusinessRule[], domain: string): CodegenApiCall[] => {
  const seen = new Set<number>();
  const calls: CodegenApiCall[] = [];

  for (const rule of navRules) {
    if (rule.callTarget === undefined || seen.has(rule.callTarget)) continue;
    seen.add(rule.callTarget);

    calls.push({
      name: `callIde${rule.callTarget}`,
      method: 'POST',
      path: `/api/${domain}/call/${rule.callTarget}`,
      calleeId: rule.callTarget,
      calleeName: `IDE_${rule.callTarget}`,
    });
  }

  return calls;
};

// ─── State Fields ─────────────────────────────────────────────────────────────

const buildStateFields = (
  programTables: Table[],
  kbTables: Table[],
  tablesRead: string[]
): CodegenField[] => {
  const fields: CodegenField[] = [];

  // For each read table, add a list + selected item state field
  for (const tableName of tablesRead) {
    const table = programTables.find(t => t.name === tableName)
      ?? kbTables.find(t => t.name === tableName);
    if (!table) continue;

    const fieldName = columnToCamel(tableName);
    const interfaceName = tableNameToInterface(tableName);

    fields.push({
      name: `${fieldName}List`,
      type: `${interfaceName}[]`,
      source: 'state',
      description: `List from ${tableName}`,
    });

    fields.push({
      name: `selected${interfaceName}`,
      type: `${interfaceName} | null`,
      source: 'state',
      description: `Selected item from ${tableName}`,
    });
  }

  return fields;
};
