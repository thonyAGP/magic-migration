/**
 * Codegen intermediate model: decouples contract shape from code generation.
 * Contract YAML → parseContract() → MigrationContract → buildCodegenModel() → CodegenModel → generators
 */

import type { MigrationContract } from '../../core/types.js';
import type { EnrichmentData } from './enrich-model.js';

// ─── Codegen Model Types ────────────────────────────────────────

export interface CodegenEntity {
  name: string;
  interfaceName: string;
  fields: CodegenField[];
  mode: 'R' | 'W' | 'RW';
}

export interface CodegenField {
  name: string;
  type: string;
  source: 'state' | 'prop' | 'computed' | 'table';
  description: string;
  localId?: string;
}

export interface CodegenAction {
  id: string;
  handlerName: string;
  description: string;
  condition: string;
  variables: string[];
}

export interface CodegenApiCall {
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  calleeId: string | number;
  calleeName: string;
}

export interface CodegenModel {
  programId: string | number;
  programName: string;
  domain: string;
  domainPascal: string;
  entities: CodegenEntity[];
  actions: CodegenAction[];
  apiCalls: CodegenApiCall[];
  stateFields: CodegenField[];
  enrichments?: EnrichmentData;
}

// ─── Result types ───────────────────────────────────────────────

export interface GeneratedFile {
  relativePath: string;
  content: string;
  skipped: boolean;
}

export interface CodegenResult {
  programId: string | number;
  programName: string;
  files: GeneratedFile[];
  written: number;
  skipped: number;
}

export interface CodegenConfig {
  outputDir: string;
  dryRun: boolean;
  overwrite: boolean;
}

// ─── Name utilities ─────────────────────────────────────────────

const sanitizeName = (name: string): string =>
  name
    .replace(/^(ADH|PBP|PVE|PBG|REF|VIL)[-_\s]+/i, '')
    .replace(/[-_\s]+(.)/g, (_, c: string) => c.toUpperCase())
    .replace(/[-_\s]+/g, '')
    .replace(/[^a-zA-Z0-9]/g, '');

const toCamelCase = (name: string): string => {
  const sanitized = sanitizeName(name);
  if (sanitized.length === 0) return 'unknown';
  return sanitized[0].toLowerCase() + sanitized.slice(1);
};

const toPascalCase = (name: string): string => {
  const sanitized = sanitizeName(name);
  if (sanitized.length === 0) return 'Unknown';
  return sanitized[0].toUpperCase() + sanitized.slice(1);
};

const toInterfaceName = (tableName: string): string => {
  const clean = tableName
    .replace(/[_-]+(.)/g, (_, c: string) => c.toUpperCase())
    .replace(/[^a-zA-Z0-9]/g, '');
  if (clean.length === 0) return 'UnknownEntity';
  return clean[0].toUpperCase() + clean.slice(1);
};

const ruleToHandlerName = (description: string): string => {
  const words = description
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .trim()
    .split(/\s+/)
    .slice(0, 4)
    .map((w, i) => i === 0 ? w.toLowerCase() : w[0].toUpperCase() + w.slice(1).toLowerCase());
  return words.join('') || 'handleAction';
};

const calleeToEndpointName = (name: string): string => {
  // Convert UPPER_CASE or mixed_case to PascalCase
  const parts = name.split(/[_\-\s]+/).filter(Boolean);
  const pascal = parts
    .map(p => p[0].toUpperCase() + p.slice(1).toLowerCase())
    .join('');
  if (pascal.length === 0) return 'callUnknown';
  return 'call' + pascal;
};

const toPropertyName = (name: string): string => {
  const clean = name.replace(/[?!]/g, '').trim();
  // Already a valid camelCase identifier → return as-is
  if (/^[a-z][a-zA-Z0-9]*$/.test(clean)) return clean;
  // Has word boundaries → split, camelCase, sanitize
  const parts = clean.split(/[\s._/]+/).filter(Boolean);
  if (parts.length === 0) return 'unknown';
  const camel = parts
    .map((w, i) => i === 0 ? w.toLowerCase() : w[0].toUpperCase() + w.slice(1).toLowerCase())
    .join('')
    .replace(/[^a-zA-Z0-9]/g, '');
  if (camel.length === 0) return 'unknown';
  return /^\d/.test(camel) ? '_' + camel : camel;
};

const calleeToPath = (name: string, domain: string): string => {
  const slug = name
    .toLowerCase()
    .replace(/[_\s]+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
  return `/api/${domain}/${slug}`;
};

// ─── Build Codegen Model ────────────────────────────────────────

export const buildCodegenModel = (contract: MigrationContract): CodegenModel => {
  const domain = toCamelCase(contract.program.name);
  const domainPascal = toPascalCase(contract.program.name);

  const entities: CodegenEntity[] = contract.tables.map(t => ({
    name: toPropertyName(t.name),
    interfaceName: toInterfaceName(t.name),
    fields: [],
    mode: t.mode,
  }));

  const actions: CodegenAction[] = contract.rules.map(r => ({
    id: r.id,
    handlerName: ruleToHandlerName(r.description),
    description: r.description,
    condition: r.condition,
    variables: r.variables,
  }));

  const apiCalls: CodegenApiCall[] = contract.callees.map(c => ({
    name: calleeToEndpointName(c.name),
    method: guessHttpMethod(c.context),
    path: calleeToPath(c.name, domain),
    calleeId: c.id,
    calleeName: c.name,
  }));

  const stateFields: CodegenField[] = contract.variables.map(v => ({
    name: toPropertyName(v.name || v.localId),
    type: 'unknown',
    source: variableTypeToSource(v.type),
    description: v.gapNotes || v.name,
    localId: v.localId,
  }));

  return {
    programId: contract.program.id,
    programName: contract.program.name,
    domain,
    domainPascal,
    entities,
    actions,
    apiCalls,
    stateFields,
  };
};

// ─── Helpers ────────────────────────────────────────────────────

const variableTypeToSource = (type: 'Parameter' | 'Virtual' | 'Real'): CodegenField['source'] => {
  switch (type) {
    case 'Parameter': return 'prop';
    case 'Virtual': return 'state';
    case 'Real': return 'computed';
  }
};

const guessHttpMethod = (context: string): 'GET' | 'POST' | 'PUT' | 'DELETE' => {
  const lower = context.toLowerCase();
  if (lower.includes('write') || lower.includes('create') || lower.includes('insert')) return 'POST';
  if (lower.includes('update') || lower.includes('modify')) return 'PUT';
  if (lower.includes('delete') || lower.includes('remove')) return 'DELETE';
  return 'GET';
};
