/**
 * Claude wrapper for the migration pipeline.
 * Supports three modes:
 *   - CLI mode: uses `claude --print` via temp file + pipe (default)
 *   - API mode: uses Anthropic SDK directly (faster, no process spawn)
 *   - Bedrock mode: uses AWS Bedrock API with Club Med credentials
 *
 * Mode is set via configureClaudeMode() before running migration.
 */

import { exec } from 'node:child_process';
import { writeFileSync, unlinkSync, mkdirSync, appendFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { promisify } from 'node:util';
import Anthropic from '@anthropic-ai/sdk';
import { callClaudeBedrock } from './claude-bedrock.js';

const execAsync = promisify(exec);

// ─── Module-level mode configuration ─────────────────────────────
let _mode: 'api' | 'cli' | 'bedrock' = 'cli';
let _apiKey: string | undefined;
let _globalLogDir: string | undefined;

// ─── Token accumulator (for tracking per-program usage) ─────────
let _tokenAccumulator: { input: number; output: number } | null = null;

/** Start accumulating tokens for the current program. */
export const startTokenAccumulator = (): void => { _tokenAccumulator = { input: 0, output: 0 }; };

/** Stop accumulating and return total tokens since start. Returns null if no API calls tracked tokens. */
export const flushTokenAccumulator = (): { input: number; output: number } | null => {
  const result = _tokenAccumulator;
  _tokenAccumulator = null;
  if (result && result.input === 0 && result.output === 0) return null;
  return result;
};

/** Configure Claude invocation mode before starting migration. */
export const configureClaudeMode = (mode: 'api' | 'cli' | 'bedrock', apiKey?: string): void => {
  _mode = mode;
  _apiKey = apiKey;
};

/** Set global log directory for all subsequent calls. */
export const setClaudeLogDir = (dir: string | undefined): void => {
  _globalLogDir = dir;
};

/** Get current mode (for logging/display). */
export const getClaudeMode = (): 'api' | 'cli' | 'bedrock' => _mode;

// ─── Model name resolution ───────────────────────────────────────
const MODEL_MAP: Record<string, string> = {
  haiku: 'claude-haiku-4-5-20251001',
  sonnet: 'claude-sonnet-4-5-20250929',
  opus: 'claude-opus-4-6',
};

const resolveModelId = (shortName?: string): string =>
  MODEL_MAP[shortName ?? 'sonnet'] ?? shortName ?? MODEL_MAP.sonnet;

// ─── Types ───────────────────────────────────────────────────────
export interface ClaudeCallOptions {
  prompt: string;
  model?: string;
  cliBin?: string;
  timeoutMs?: number;
  maxBuffer?: number;
  logDir?: string;
  logLabel?: string;
}

export interface ClaudeCallResult {
  output: string;
  durationMs: number;
  tokens?: { input: number; output: number };
}

// ─── Main entry point (transparent switch) ───────────────────────

export const callClaude = async (options: ClaudeCallOptions): Promise<ClaudeCallResult> => {
  let result: ClaudeCallResult;

  if (_mode === 'api') {
    result = await callClaudeApi(options);
  } else if (_mode === 'bedrock') {
    result = await callClaudeBedrock(options.prompt, options.model);
  } else {
    result = await callClaudeCli(options);
  }

  // Accumulate tokens if tracker is active
  if (_tokenAccumulator && result.tokens) {
    _tokenAccumulator.input += result.tokens.input;
    _tokenAccumulator.output += result.tokens.output;
  }

  const logDir = options.logDir ?? _globalLogDir;
  if (logDir) {
    logClaudeCall({ ...options, logDir }, result);
  }

  return result;
};

// ─── API mode (Anthropic SDK) ────────────────────────────────────

const callClaudeApi = async (options: ClaudeCallOptions): Promise<ClaudeCallResult> => {
  const apiKey = _apiKey ?? process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY required for API mode');

  const client = new Anthropic({ apiKey });
  const model = resolveModelId(options.model);
  const start = Date.now();

  const response = await client.messages.create({
    model,
    max_tokens: 8192,
    messages: [{ role: 'user', content: options.prompt }],
  });

  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map(b => b.text)
    .join('');

  const tokens = response.usage
    ? { input: response.usage.input_tokens, output: response.usage.output_tokens }
    : undefined;

  return {
    output: text.trim(),
    durationMs: Date.now() - start,
    tokens,
  };
};

// ─── CLI mode (claude --print via temp file) ─────────────────────

const DEFAULT_CLI_TIMEOUT_MS = 180_000; // 3 min (increased from 120s)
const EXTENDED_CLI_TIMEOUT_MS = 300_000; // 5 min for large prompts
const LARGE_PROMPT_THRESHOLD = 20_000; // bytes - use Sonnet if above

const callClaudeCli = async (options: ClaudeCallOptions): Promise<ClaudeCallResult> => {
  const {
    prompt,
    model,
    cliBin = 'claude',
    timeoutMs,
    maxBuffer = 4 * 1024 * 1024,
  } = options;

  // Auto-select timeout based on prompt size if not provided
  const promptSize = Buffer.byteLength(prompt, 'utf8');
  const timeout = timeoutMs ?? (promptSize > LARGE_PROMPT_THRESHOLD ? EXTENDED_CLI_TIMEOUT_MS : DEFAULT_CLI_TIMEOUT_MS);

  const modelArgs = model ? `--model ${model}` : '';
  const start = Date.now();

  const tmpFile = join(tmpdir(), `mf-prompt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.txt`);
  writeFileSync(tmpFile, prompt, 'utf8');

  try {
    const cmd = process.platform === 'win32'
      ? `type "${tmpFile}" | ${cliBin} --print --output-format json ${modelArgs}`
      : `${cliBin} --print --output-format json ${modelArgs} < "${tmpFile}"`;

    const { stdout } = await execAsync(cmd, {
      timeout,
      maxBuffer,
      env: { ...process.env },
      windowsHide: true,
    });

    // Parse JSON output to extract text + tokens
    return parseCliJsonOutput(stdout, Date.now() - start, prompt.length);
  } finally {
    try { unlinkSync(tmpFile); } catch { /* ignore cleanup errors */ }
  }
};

/** Parse `claude --print --output-format json` output.
 *
 * The CLI may return either:
 * - An object: `{ result: "...", usage?: { input_tokens, output_tokens }, cost_usd? }`
 * - An array:  `[{ type: "result", result: "...", usage?: {...} }]`
 */
const parseCliJsonOutput = (stdout: string, durationMs: number, promptLength: number): ClaudeCallResult => {
  const estimateTokens = (textLen: number) => ({
    input: Math.ceil(promptLength / 4),
    output: Math.ceil(textLen / 4),
  });

  try {
    let data = JSON.parse(stdout.trim());

    // Handle array format: [{type:"result", result:"..."}]
    if (Array.isArray(data)) {
      data = data.find((item: Record<string, unknown>) => item.type === 'result') ?? data[0] ?? {};
    }

    const text = typeof data.result === 'string' ? data.result : stdout.trim();

    // Try exact tokens from CLI JSON (if available)
    // Use > 0 checks instead of truthiness to avoid 0 being falsy
    let tokens: { input: number; output: number };
    const usage = data.usage;
    if (usage && (usage.input_tokens > 0 || usage.output_tokens > 0)) {
      tokens = {
        input: usage.input_tokens > 0 ? usage.input_tokens : Math.ceil(promptLength / 4),
        output: usage.output_tokens > 0 ? usage.output_tokens : Math.ceil(text.length / 4),
      };
    } else {
      tokens = estimateTokens(text.length);
    }

    return { output: text, durationMs, tokens };
  } catch {
    // Fallback: if JSON parse fails, treat as raw text + estimate tokens
    const text = stdout.trim();
    return { output: text, durationMs, tokens: estimateTokens(text.length) };
  }
};

/**
 * Call Claude CLI and parse the response as JSON.
 * Extracts JSON from markdown code blocks if present.
 */
export const callClaudeJson = async <T = unknown>(options: ClaudeCallOptions): Promise<T> => {
  const result = await callClaude(options);
  return parseJsonResponse<T>(result.output);
};

/**
 * Parse a Claude response that should contain JSON.
 * Handles both raw JSON and markdown-wrapped JSON (```json ... ```).
 */
export const parseJsonResponse = <T = unknown>(raw: string): T => {
  // Try direct JSON parse first
  const trimmed = raw.trim();
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    return JSON.parse(trimmed) as T;
  }

  // Extract from markdown code block
  const jsonMatch = trimmed.match(/```(?:json)?\s*\n([\s\S]*?)\n```/);
  if (jsonMatch?.[1]) {
    return JSON.parse(jsonMatch[1].trim()) as T;
  }

  throw new Error(`Failed to parse JSON from Claude response (${trimmed.length} chars)`);
};

/**
 * Parse a Claude response that should contain a single file.
 * Extracts content from markdown code blocks (```typescript ... ```).
 */
export const parseFileResponse = (raw: string): string => {
  const trimmed = raw.trim();

  // Extract from markdown code block
  const codeMatch = trimmed.match(/```(?:typescript|tsx|ts|javascript|jsx)?\s*\n([\s\S]*?)\n```/);
  if (codeMatch?.[1]) {
    return codeMatch[1];
  }

  // If no code block, return as-is (might be raw code)
  return trimmed;
};

// ─── Retry with exponential backoff ──────────────────────────────

const RETRYABLE_STATUS_CODES = [429, 500, 502, 503, 529];
const RETRYABLE_ERROR_PATTERNS = ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'overloaded'];

const isRetryable = (err: unknown): boolean => {
  if (err instanceof Error) {
    const msg = err.message;
    if (RETRYABLE_ERROR_PATTERNS.some(p => msg.includes(p))) return true;
    const statusMatch = msg.match(/status[:\s]*(\d{3})/i);
    if (statusMatch && RETRYABLE_STATUS_CODES.includes(Number(statusMatch[1]))) return true;
  }
  const anyErr = err as { status?: number; statusCode?: number };
  if (anyErr.status && RETRYABLE_STATUS_CODES.includes(anyErr.status)) return true;
  if (anyErr.statusCode && RETRYABLE_STATUS_CODES.includes(anyErr.statusCode)) return true;
  return false;
};

const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

export interface RetryOptions {
  maxAttempts?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  onRetry?: (attempt: number, error: unknown, delayMs: number) => void;
}

/**
 * Call Claude with automatic retry + escalation on transient errors or timeout.
 * Escalation strategy: Haiku → Sonnet on timeout.
 * Uses exponential backoff: delay = min(baseDelay * 2^attempt, maxDelay) + jitter.
 */
export const callClaudeWithRetry = async (
  options: ClaudeCallOptions,
  retryOpts: RetryOptions = {},
): Promise<ClaudeCallResult> => {
  const {
    maxAttempts = 3,
    baseDelayMs = 1000,
    maxDelayMs = 30_000,
    onRetry,
  } = retryOpts;

  let lastError: unknown;
  let currentModel = options.model;
  let currentOptions = { ...options };

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await callClaude(currentOptions);
    } catch (err) {
      lastError = err;
      const isTimeout = err instanceof Error && (err.message.includes('timeout') || err.message.includes('ETIMEDOUT'));

      // Escalate Haiku → Sonnet on timeout
      if (isTimeout && currentModel === 'haiku' && attempt < maxAttempts - 1) {
        currentModel = 'sonnet';
        currentOptions = { ...options, model: currentModel, timeoutMs: EXTENDED_CLI_TIMEOUT_MS };
        onRetry?.(attempt + 1, new Error(`Timeout with Haiku, escalating to Sonnet`), 0);
        continue; // Retry immediately with Sonnet
      }

      if (attempt + 1 >= maxAttempts || !isRetryable(err)) {
        throw err;
      }

      const delay = Math.min(baseDelayMs * Math.pow(2, attempt), maxDelayMs);
      const jitter = Math.floor(Math.random() * delay * 0.1);
      const totalDelay = delay + jitter;
      onRetry?.(attempt + 1, err, totalDelay);
      await sleep(totalDelay);
    }
  }

  throw lastError;
};

// ─── Decision logging ───────────────────────────────────────────

const logClaudeCall = (options: ClaudeCallOptions, result: ClaudeCallResult): void => {
  try {
    const logDir = options.logDir!;
    if (!existsSync(logDir)) {
      mkdirSync(logDir, { recursive: true });
    }

    const label = options.logLabel ?? 'call';
    const ts = Date.now();

    // Save prompt and response files
    const promptFile = `prompt-${label}-${ts}.md`;
    const responseFile = `response-${label}-${ts}.md`;
    writeFileSync(join(logDir, promptFile), options.prompt, 'utf8');
    writeFileSync(join(logDir, responseFile), result.output, 'utf8');

    // Append JSONL decision log
    const entry = {
      timestamp: new Date().toISOString(),
      label,
      model: options.model ?? 'default',
      mode: _mode,
      promptFile,
      responseFile,
      promptLength: options.prompt.length,
      responseLength: result.output.length,
      durationMs: result.durationMs,
      tokens: result.tokens,
    };
    appendFileSync(join(logDir, 'decisions.jsonl'), JSON.stringify(entry) + '\n', 'utf8');
  } catch {
    // Non-critical: logging failure shouldn't stop migration
  }
};
