/**
 * Claude CLI wrapper for the migration pipeline.
 * Uses temp file + pipe to avoid Windows command-line length limits (~8KB).
 */

import { exec } from 'node:child_process';
import { writeFileSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

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

export const callClaude = async (options: ClaudeCallOptions): Promise<ClaudeCallResult> => {
  const {
    prompt,
    model,
    cliBin = 'claude',
    timeoutMs = 120_000,
    maxBuffer = 4 * 1024 * 1024,
  } = options;

  const modelArgs = model ? `--model ${model}` : '';
  const start = Date.now();

  // Write prompt to temp file to avoid command-line length limits
  const tmpFile = join(tmpdir(), `mf-prompt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.txt`);
  writeFileSync(tmpFile, prompt, 'utf8');

  try {
    // Use platform-appropriate pipe: type (Windows) or < (Unix)
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
  } finally {
    try { unlinkSync(tmpFile); } catch { /* ignore cleanup errors */ }
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
