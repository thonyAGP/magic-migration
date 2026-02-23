/**
 * Claude prompt builder: construct system/user prompts for enrichment classification.
 * Extracts relevant spec sections, finds codebase snippets, applies results.
 */
import type { MigrationContract, ItemStatus } from '../core/types.js';
import type { EnrichedItem } from './claude-client.js';
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
export declare const buildSystemPrompt: () => string;
export declare const extractRelevantSpecSections: (specContent: string, maxTotalChars?: number) => string;
export declare const findRelevantCodeFiles: (codebaseDir: string, contract: MigrationContract, maxFiles?: number, maxLinesPerFile?: number) => CodeSnippet[];
declare const extractGapItems: (contract: MigrationContract) => GapItem[];
export { extractGapItems };
export declare const buildUserPrompt: (specContent: string, gapItems: GapItem[], codeSnippets: CodeSnippet[]) => string;
export declare const applyEnrichmentResult: (contract: MigrationContract, items: EnrichedItem[]) => MigrationContract;
