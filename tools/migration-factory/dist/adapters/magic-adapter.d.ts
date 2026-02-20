/**
 * Magic Unipaas adapter: wraps existing build-graph.mjs and spec files.
 * Reads live-programs.json and contract YAML files from .openspec/migration/.
 */
import type { SpecExtractor } from '../core/types.js';
export interface MagicAdapterConfig {
    openspecDir: string;
    migrationDir: string;
    liveProgramsFile: string;
    contractPattern: RegExp;
}
export declare const createMagicAdapter: (projectRoot: string, overrides?: Partial<MagicAdapterConfig>) => SpecExtractor;
