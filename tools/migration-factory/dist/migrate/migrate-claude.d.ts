/**
 * Claude wrapper for the migration pipeline.
 * Supports two modes:
 *   - CLI mode: uses `claude --print` via temp file + pipe (default)
 *   - API mode: uses Anthropic SDK directly (faster, no process spawn)
 *
 * Mode is set via configureClaudeMode() before running migration.
 */
/** Configure Claude invocation mode before starting migration. */
export declare const configureClaudeMode: (mode: "api" | "cli", apiKey?: string) => void;
/** Get current mode (for logging/display). */
export declare const getClaudeMode: () => "api" | "cli";
export interface ClaudeCallOptions {
    prompt: string;
    model?: string;
    cliBin?: string;
    timeoutMs?: number;
    maxBuffer?: number;
}
export interface ClaudeCallResult {
    output: string;
    durationMs: number;
}
export declare const callClaude: (options: ClaudeCallOptions) => Promise<ClaudeCallResult>;
/**
 * Call Claude CLI and parse the response as JSON.
 * Extracts JSON from markdown code blocks if present.
 */
export declare const callClaudeJson: <T = unknown>(options: ClaudeCallOptions) => Promise<T>;
/**
 * Parse a Claude response that should contain JSON.
 * Handles both raw JSON and markdown-wrapped JSON (```json ... ```).
 */
export declare const parseJsonResponse: <T = unknown>(raw: string) => T;
/**
 * Parse a Claude response that should contain a single file.
 * Extracts content from markdown code blocks (```typescript ... ```).
 */
export declare const parseFileResponse: (raw: string) => string;
