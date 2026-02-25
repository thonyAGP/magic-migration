/**
 * Claude prompt builder: construct system/user prompts for enrichment classification.
 * Extracts relevant spec sections, finds codebase snippets, applies results.
 */

import fs from 'node:fs';
import path from 'node:path';
import type { MigrationContract, ItemStatus } from '../core/types.js';
import type { EnrichedItem } from './claude-client.js';

// ─── Types ──────────────────────────────────────────────────────

export interface GapItem {
  id: string;
  type: 'rule' | 'variable' | 'table' | 'callee';
  description: string;
  status: ItemStatus;
}

export interface CodeSnippet {
  file: string;
  content: string;
}

// ─── System Prompt ──────────────────────────────────────────────

export const buildSystemPrompt = (): string =>
  `You are an expert migration analyst. You classify migration items by analyzing legacy program specifications against a modern web codebase (React/TypeScript).

For each item, determine:
- IMPL: The functionality exists in the web codebase (found in a specific file).
- N/A: Not applicable for web (legacy-only: print utilities, memory tables, hardware-specific features).
- PARTIAL: Partially implemented (some logic exists but incomplete).
- MISSING: Not found in the codebase and applicable for web.

Rules:
- Be conservative: only mark IMPL if you find clear evidence in the code.
- Mark N/A for: printer utilities, legacy memory tables (Table_XXX), hardware-specific callees.
- For targetFile, provide the relative path from the codebase root.
- For gapNotes, briefly explain your reasoning (max 80 chars).

Respond with ONLY valid JSON matching this schema:
{
  "items": [{ "id": "string", "type": "string", "status": "IMPL|N/A|PARTIAL|MISSING", "targetFile": "string", "gapNotes": "string" }],
  "reasoning": "Brief summary of your analysis approach"
}`;

// ─── Spec Section Extraction ────────────────────────────────────

const SECTION_PATTERNS = [
  { label: 'Rules', pattern: /^#{1,3}\s*(?:5\b|.*R[eè]gles?\s*m[eé]tier)/im },
  { label: 'Tables', pattern: /^#{1,3}\s*(?:10\b|.*Tables?\s*(?:utilis|acc[eé]))/im },
  { label: 'Callees', pattern: /^#{1,3}\s*(?:13\.3|13\.4|.*Callees?|.*Programmes?\s*appel)/im },
  { label: 'Variables', pattern: /^#{1,3}\s*(?:6\b|.*Variables?\s*(?:import|cl[eé]))/im },
  { label: 'Algorigramme', pattern: /^#{1,3}\s*(?:8\b|.*Algorigramme|.*Flowchart)/im },
];

const extractSection = (content: string, startPattern: RegExp, maxChars: number): string => {
  const match = startPattern.exec(content);
  if (!match) return '';

  const start = match.index;
  // Find next same-or-higher level heading
  const headingLevel = (match[0].match(/^#+/) ?? ['#'])[0].length;
  const nextHeading = new RegExp(`^#{1,${headingLevel}}\\s`, 'm');
  const rest = content.slice(start + match[0].length);
  const nextMatch = nextHeading.exec(rest);
  const end = nextMatch ? start + match[0].length + nextMatch.index : content.length;

  return content.slice(start, Math.min(end, start + maxChars)).trim();
};

export const extractRelevantSpecSections = (specContent: string, maxTotalChars = 6000): string => {
  const sections: string[] = [];
  const perSection = Math.floor(maxTotalChars / SECTION_PATTERNS.length);

  for (const { label, pattern } of SECTION_PATTERNS) {
    const text = extractSection(specContent, pattern, perSection);
    if (text) {
      sections.push(`### ${label}\n${text}`);
    }
  }

  return sections.length > 0 ? sections.join('\n\n') : specContent.slice(0, maxTotalChars);
};

// ─── Codebase File Discovery ────────────────────────────────────

const walkFiles = (dir: string, exts: RegExp, maxFiles: number): string[] => {
  const result: string[] = [];
  if (!fs.existsSync(dir)) return result;

  const walk = (d: string) => {
    if (result.length >= maxFiles) return;
    const entries = fs.readdirSync(d, { withFileTypes: true });
    for (const entry of entries) {
      if (result.length >= maxFiles) return;
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist') continue;
        walk(full);
      } else if (exts.test(entry.name)) {
        result.push(full);
      }
    }
  };
  walk(dir);
  return result;
};

export const findRelevantCodeFiles = (
  codebaseDir: string,
  contract: MigrationContract,
  maxFiles = 5,
  maxLinesPerFile = 200,
): CodeSnippet[] => {
  const allFiles = walkFiles(codebaseDir, /\.(ts|tsx)$/, 200);
  if (allFiles.length === 0) return [];

  const escRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Build search terms from gap items
  const terms: string[] = [];
  for (const r of contract.rules) {
    if (r.status !== 'IMPL' && r.status !== 'N/A') {
      terms.push(escRe(r.id).replace('-', '[-_]?'));
      const words = r.description.split(/\s+/).filter(w => w.length > 4).slice(0, 3);
      terms.push(...words.map(escRe));
    }
  }
  for (const t of contract.tables) {
    if (t.status !== 'IMPL' && t.status !== 'N/A') {
      terms.push(escRe(t.name.replace(/_+\w{3}$/, '')));
    }
  }
  for (const c of contract.callees) {
    if (c.status !== 'IMPL' && c.status !== 'N/A') {
      terms.push(escRe(c.name).replace(/[^a-zA-Z0-9\\]/g, '\\s*').slice(0, 30));
    }
  }

  if (terms.length === 0) return [];

  const pattern = new RegExp(terms.slice(0, 20).join('|'), 'i');
  const matched: CodeSnippet[] = [];

  for (const file of allFiles) {
    if (matched.length >= maxFiles) break;
    const content = fs.readFileSync(file, 'utf8');
    if (pattern.test(content)) {
      const lines = content.split('\n').slice(0, maxLinesPerFile);
      const relPath = path.relative(path.dirname(codebaseDir), file).replace(/\\/g, '/');
      matched.push({ file: relPath, content: lines.join('\n') });
    }
  }

  return matched;
};

// ─── User Prompt Builder ────────────────────────────────────────

const extractGapItems = (contract: MigrationContract): GapItem[] => {
  const items: GapItem[] = [];

  for (const r of contract.rules) {
    if (r.status !== 'IMPL' && r.status !== 'N/A') {
      items.push({ id: r.id, type: 'rule', description: r.description, status: r.status });
    }
  }
  for (const v of contract.variables) {
    if (v.status !== 'IMPL' && v.status !== 'N/A') {
      items.push({ id: v.localId, type: 'variable', description: v.name, status: v.status });
    }
  }
  for (const t of contract.tables) {
    if (t.status !== 'IMPL' && t.status !== 'N/A') {
      items.push({ id: String(t.id), type: 'table', description: `${t.name} (${t.mode})`, status: t.status });
    }
  }
  for (const c of contract.callees) {
    if (c.status !== 'IMPL' && c.status !== 'N/A') {
      items.push({ id: String(c.id), type: 'callee', description: c.name, status: c.status });
    }
  }

  return items;
};

export { extractGapItems };

export const buildUserPrompt = (
  specContent: string,
  gapItems: GapItem[],
  codeSnippets: CodeSnippet[],
): string => {
  if (gapItems.length === 0) return '';

  const specSection = extractRelevantSpecSections(specContent);

  let prompt = `## Legacy Program Specification\n\n${specSection}\n\n`;

  if (codeSnippets.length > 0) {
    prompt += `## Web Codebase Files\n\n`;
    for (const snippet of codeSnippets) {
      prompt += `### ${snippet.file}\n\`\`\`typescript\n${snippet.content}\n\`\`\`\n\n`;
    }
  }

  prompt += `## Items to Classify (${gapItems.length} items)\n\n`;
  prompt += '```json\n';
  prompt += JSON.stringify(gapItems.map(i => ({
    id: i.id,
    type: i.type,
    currentStatus: i.status,
    description: i.description,
  })), null, 2);
  prompt += '\n```\n\n';
  prompt += `Classify each item as IMPL, N/A, PARTIAL, or MISSING. Return JSON only.`;

  return prompt;
};

// ─── Apply Enrichment Result ────────────────────────────────────

export const applyEnrichmentResult = (
  contract: MigrationContract,
  items: EnrichedItem[],
): MigrationContract => {
  const itemMap = new Map(items.map(i => [i.id, i]));

  const updatedRules = contract.rules.map(r => {
    const enriched = itemMap.get(r.id);
    if (enriched && enriched.type === 'rule' && r.status !== 'IMPL') {
      return { ...r, status: enriched.status as ItemStatus, targetFile: enriched.targetFile || r.targetFile, gapNotes: enriched.gapNotes || r.gapNotes };
    }
    return r;
  });

  const updatedVariables = contract.variables.map(v => {
    const enriched = itemMap.get(v.localId);
    if (enriched && enriched.type === 'variable' && v.status !== 'IMPL') {
      return { ...v, status: enriched.status as ItemStatus, targetFile: enriched.targetFile || v.targetFile, gapNotes: enriched.gapNotes || v.gapNotes };
    }
    return v;
  });

  const updatedTables = contract.tables.map(t => {
    const enriched = itemMap.get(String(t.id));
    if (enriched && enriched.type === 'table' && t.status !== 'IMPL') {
      return { ...t, status: enriched.status as ItemStatus, targetFile: enriched.targetFile || t.targetFile, gapNotes: enriched.gapNotes || t.gapNotes };
    }
    return t;
  });

  const updatedCallees = contract.callees.map(c => {
    const enriched = itemMap.get(String(c.id));
    if (enriched && enriched.type === 'callee' && c.status !== 'IMPL') {
      return { ...c, status: enriched.status as ItemStatus, target: enriched.targetFile || c.target, gapNotes: enriched.gapNotes || c.gapNotes };
    }
    return c;
  });

  // Recalculate coverage
  const allItems = [...updatedRules, ...updatedVariables, ...updatedTables, ...updatedCallees];
  const total = allItems.length;
  const na = allItems.filter(i => i.status === 'N/A').length;
  const impl = allItems.filter(i => i.status === 'IMPL').length;
  const partial = allItems.filter(i => i.status === 'PARTIAL').length;
  const denominator = total - na;
  const coveragePct = denominator > 0 ? Math.round(((impl + partial * 0.5) / denominator) * 100) : 100;

  return {
    ...contract,
    rules: updatedRules,
    variables: updatedVariables,
    tables: updatedTables,
    callees: updatedCallees,
    overall: {
      ...contract.overall,
      rulesImpl: updatedRules.filter(r => r.status === 'IMPL').length,
      rulesPartial: updatedRules.filter(r => r.status === 'PARTIAL').length,
      rulesMissing: updatedRules.filter(r => r.status === 'MISSING').length,
      rulesNa: updatedRules.filter(r => r.status === 'N/A').length,
      calleesImpl: updatedCallees.filter(c => c.status === 'IMPL').length,
      calleesMissing: updatedCallees.filter(c => c.status === 'MISSING').length,
      coveragePct,
    },
  };
};
