/**
 * Claude wrapper for the migration pipeline.
 * Supports two modes:
 *   - CLI mode: uses `claude --print` via temp file + pipe (default)
 *   - API mode: uses Anthropic SDK directly (faster, no process spawn)
 *
 * Mode is set via configureClaudeMode() before running migration.
 */
import { exec } from 'node:child_process';
import { writeFileSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { promisify } from 'node:util';
import Anthropic from '@anthropic-ai/sdk';
const execAsync = promisify(exec);
// ─── Module-level mode configuration ─────────────────────────────
let _mode = 'cli';
let _apiKey;
/** Configure Claude invocation mode before starting migration. */
export const configureClaudeMode = (mode, apiKey) => {
    _mode = mode;
    _apiKey = apiKey;
};
/** Get current mode (for logging/display). */
export const getClaudeMode = () => _mode;
// ─── Model name resolution ───────────────────────────────────────
const MODEL_MAP = {
    haiku: 'claude-haiku-4-5-20251001',
    sonnet: 'claude-sonnet-4-5-20250929',
    opus: 'claude-opus-4-6',
};
const resolveModelId = (shortName) => MODEL_MAP[shortName ?? 'sonnet'] ?? shortName ?? MODEL_MAP.sonnet;
// ─── Main entry point (transparent switch) ───────────────────────
export const callClaude = async (options) => {
    if (_mode === 'api') {
        return callClaudeApi(options);
    }
    return callClaudeCli(options);
};
// ─── API mode (Anthropic SDK) ────────────────────────────────────
const callClaudeApi = async (options) => {
    const apiKey = _apiKey ?? process.env.ANTHROPIC_API_KEY;
    if (!apiKey)
        throw new Error('ANTHROPIC_API_KEY required for API mode');
    const client = new Anthropic({ apiKey });
    const model = resolveModelId(options.model);
    const start = Date.now();
    const response = await client.messages.create({
        model,
        max_tokens: 8192,
        messages: [{ role: 'user', content: options.prompt }],
    });
    const text = response.content
        .filter((b) => b.type === 'text')
        .map(b => b.text)
        .join('');
    return {
        output: text.trim(),
        durationMs: Date.now() - start,
    };
};
// ─── CLI mode (claude --print via temp file) ─────────────────────
const callClaudeCli = async (options) => {
    const { prompt, model, cliBin = 'claude', timeoutMs = 120_000, maxBuffer = 4 * 1024 * 1024, } = options;
    const modelArgs = model ? `--model ${model}` : '';
    const start = Date.now();
    const tmpFile = join(tmpdir(), `mf-prompt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.txt`);
    writeFileSync(tmpFile, prompt, 'utf8');
    try {
        const cmd = process.platform === 'win32'
            ? `type "${tmpFile}" | ${cliBin} --print ${modelArgs}`
            : `${cliBin} --print ${modelArgs} < "${tmpFile}"`;
        const { stdout } = await execAsync(cmd, {
            timeout: timeoutMs,
            maxBuffer,
            env: { ...process.env },
            windowsHide: true,
        });
        return {
            output: stdout.trim(),
            durationMs: Date.now() - start,
        };
    }
    finally {
        try {
            unlinkSync(tmpFile);
        }
        catch { /* ignore cleanup errors */ }
    }
};
/**
 * Call Claude CLI and parse the response as JSON.
 * Extracts JSON from markdown code blocks if present.
 */
export const callClaudeJson = async (options) => {
    const result = await callClaude(options);
    return parseJsonResponse(result.output);
};
/**
 * Parse a Claude response that should contain JSON.
 * Handles both raw JSON and markdown-wrapped JSON (```json ... ```).
 */
export const parseJsonResponse = (raw) => {
    // Try direct JSON parse first
    const trimmed = raw.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        return JSON.parse(trimmed);
    }
    // Extract from markdown code block
    const jsonMatch = trimmed.match(/```(?:json)?\s*\n([\s\S]*?)\n```/);
    if (jsonMatch?.[1]) {
        return JSON.parse(jsonMatch[1].trim());
    }
    throw new Error(`Failed to parse JSON from Claude response (${trimmed.length} chars)`);
};
/**
 * Parse a Claude response that should contain a single file.
 * Extracts content from markdown code blocks (```typescript ... ```).
 */
export const parseFileResponse = (raw) => {
    const trimmed = raw.trim();
    // Extract from markdown code block
    const codeMatch = trimmed.match(/```(?:typescript|tsx|ts|javascript|jsx)?\s*\n([\s\S]*?)\n```/);
    if (codeMatch?.[1]) {
        return codeMatch[1];
    }
    // If no code block, return as-is (might be raw code)
    return trimmed;
};
//# sourceMappingURL=migrate-claude.js.map