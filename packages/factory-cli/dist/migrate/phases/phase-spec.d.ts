/**
 * Phase 0: SPEC - Auto-generate specification from KB data.
 * Uses KbIndexRunner CLI to extract data, then Claude CLI to format as Markdown.
 */
import type { MigrateConfig } from '../migrate-types.js';
export interface SpecResult {
    specFile: string;
    skipped: boolean;
    duration: number;
}
/**
 * Extract KB data via KbIndexRunner CLI then generate spec with Claude.
 */
export declare const runSpecPhase: (programId: string | number, config: MigrateConfig) => Promise<SpecResult>;
