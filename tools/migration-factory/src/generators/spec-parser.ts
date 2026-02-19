/**
 * Spec Parser: extract structured data from spec Markdown files.
 * Parses rules, tables, callees, and metadata from V3.5+ specs.
 */

import fs from 'node:fs';
import type {
  ContractRule, ContractTable, ContractCallee, ContractVariable,
} from '../core/types.js';

export interface ParsedSpec {
  programId: number;
  programName: string;
  tasksCount: number;
  tablesModified: number;
  expressionsCount: number;
  calleesCount: number;
  rules: ContractRule[];
  tables: ContractTable[];
  callees: ContractCallee[];
  variables: ContractVariable[];
}

/**
 * Parse a spec Markdown file into structured contract data.
 */
export const parseSpecFile = (filePath: string): ParsedSpec | null => {
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath, 'utf8');
  return parseSpecContent(content);
};

export const parseSpecContent = (content: string): ParsedSpec => {
  return {
    programId: parseIdFromHeader(content),
    programName: parseNameFromHeader(content),
    tasksCount: parseMetaNumber(content, /Taches\s*\|\s*(\d+)/),
    tablesModified: parseMetaNumber(content, /Tables\s+modifiees\s*\|\s*(\d+)/),
    expressionsCount: parseMetaNumber(content, /Expressions\s*\|\s*(\d+)/i),
    calleesCount: parseMetaNumber(content, /Programmes\s+appeles\s*\|\s*(\d+)/),
    rules: parseRules(content),
    tables: parseTables(content),
    callees: parseCallees(content),
    variables: parseVariablesFromRules(content),
  };
};

// ─── Header parsing ──────────────────────────────────────────────

const parseIdFromHeader = (content: string): number => {
  const match = content.match(/^#\s+ADH\s+IDE\s+(\d+)/m);
  return match ? parseInt(match[1], 10) : 0;
};

const parseNameFromHeader = (content: string): string => {
  const match = content.match(/^#\s+ADH\s+IDE\s+\d+\s*-\s*(.+)$/m);
  return match ? match[1].trim() : '';
};

const parseMetaNumber = (content: string, pattern: RegExp): number => {
  const match = content.match(pattern);
  return match ? parseInt(match[1], 10) : 0;
};

// ─── Rules parsing (## 5. REGLES METIER) ─────────────────────────

const parseRules = (content: string): ContractRule[] => {
  const rules: ContractRule[] = [];

  // Match [RM-XXX] blocks (handles optional HTML anchor tags like <a id="rm-001"></a>)
  const rulePattern = /####\s*(?:<[^>]+>\s*)*\[([Rr][Mm]-\d+)\]\s+(.+?)$/gm;
  let match: RegExpExecArray | null;

  while ((match = rulePattern.exec(content)) !== null) {
    const id = match[1].toUpperCase();
    const description = match[2].trim();

    // Extract condition from the table that follows
    const afterMatch = content.slice(match.index, match.index + 800);
    const conditionMatch = afterMatch.match(/\*\*Condition\*\*\s*\|\s*`([^`]+)`/);
    const variablesMatch = afterMatch.match(/\*\*Variables\*\*\s*\|\s*(.+)/);

    const condition = conditionMatch ? conditionMatch[1] : '';
    const variables = variablesMatch
      ? variablesMatch[1].split(',').map(v => v.trim().split(' ')[0]).filter(Boolean)
      : [];

    rules.push({
      id,
      description,
      condition,
      variables,
      status: 'MISSING',
      targetFile: '',
      gapNotes: '',
    });
  }

  return rules;
};

// ─── Tables parsing (## 10. TABLES) ──────────────────────────────

const parseTables = (content: string): ContractTable[] => {
  const tables: ContractTable[] = [];

  // Find section 10
  const sectionStart = content.indexOf('## 10. TABLES');
  if (sectionStart === -1) return tables;

  const section = content.slice(sectionStart, sectionStart + 5000);

  // Match table rows: | ID | Nom | Description | Type | R | W | L | Usages |
  const rowPattern = /^\|\s*(\d+)\s*\|\s*(\S+)\s*\|[^|]*\|[^|]*\|\s*([^|]*)\|\s*([^|]*)\|\s*([^|]*)\|/gm;
  let match: RegExpExecArray | null;

  while ((match = rowPattern.exec(section)) !== null) {
    const id = parseInt(match[1], 10);
    const name = match[2].trim();
    const hasR = match[3].includes('R');
    const hasW = match[4].includes('W');

    let mode: 'R' | 'W' | 'RW' = 'R';
    if (hasR && hasW) mode = 'RW';
    else if (hasW) mode = 'W';

    tables.push({
      id,
      name,
      mode,
      status: 'MISSING',
      targetFile: '',
      gapNotes: '',
    });
  }

  return tables;
};

// ─── Callees parsing (## 13. GRAPHE D'APPELS → 13.4 Detail) ─────

const parseCallees = (content: string): ContractCallee[] => {
  const callees: ContractCallee[] = [];

  // Find section 13.4
  const sectionStart = content.indexOf('### 13.4');
  if (sectionStart === -1) {
    // Fallback: try 13.3 table if 13.4 doesn't exist
    return parseCalleesFromSection13_3(content);
  }

  const section = content.slice(sectionStart, sectionStart + 5000);

  // Match rows: | [IDE](link) | Nom Programme | Appels | Contexte |
  const rowPattern = /^\|\s*\[(\d+)\][^\|]*\|\s*([^|]+)\|\s*(\d+)\s*\|\s*([^|]*)\|/gm;
  let match: RegExpExecArray | null;

  while ((match = rowPattern.exec(section)) !== null) {
    callees.push({
      id: parseInt(match[1], 10),
      name: match[2].trim(),
      calls: parseInt(match[3], 10),
      context: match[4].trim(),
      status: 'MISSING',
      target: '',
      gapNotes: '',
    });
  }

  return callees;
};

const parseCalleesFromSection13_3 = (content: string): ContractCallee[] => {
  const callees: ContractCallee[] = [];
  const sectionStart = content.indexOf('### 13.3');
  if (sectionStart === -1) return callees;

  const section = content.slice(sectionStart, sectionStart + 3000);
  // Match mermaid node definitions: C152[152 Recup Classe et Li...]
  const nodePattern = /C(\d+)\[(\d+)\s+([^\]]+)\]/g;
  let match: RegExpExecArray | null;

  while ((match = nodePattern.exec(section)) !== null) {
    callees.push({
      id: parseInt(match[1], 10),
      name: match[3].replace(/\.{3}$/, '').trim(),
      calls: 1,
      context: '',
      status: 'MISSING',
      target: '',
      gapNotes: '',
    });
  }

  return callees;
};

// ─── Variables extraction from rules ─────────────────────────────

const parseVariablesFromRules = (content: string): ContractVariable[] => {
  const seen = new Set<string>();
  const variables: ContractVariable[] = [];

  // Collect variables from rule blocks: **Variables** | BA (W0 service village), W (W0 imputation)
  const varPattern = /\*\*Variables\*\*\s*\|\s*(.+)/g;
  let match: RegExpExecArray | null;

  while ((match = varPattern.exec(content)) !== null) {
    const line = match[1];
    // Parse individual variables: "BA (W0 service village)"
    const varItems = line.split(',');
    for (const item of varItems) {
      const parsed = item.trim().match(/^([A-Z]+)\s*\((.+)\)/);
      if (parsed && !seen.has(parsed[1])) {
        seen.add(parsed[1]);
        const letter = parsed[1];
        const desc = parsed[2].trim();
        const type = desc.startsWith('P0') ? 'Parameter' as const
          : desc.startsWith('V.') ? 'Virtual' as const
          : 'Real' as const;

        variables.push({
          localId: letter,
          name: desc,
          type,
          status: 'MISSING',
          targetFile: '',
          gapNotes: '',
        });
      }
    }
  }

  return variables;
};
