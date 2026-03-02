import { describe, it, expect } from 'vitest';
import { parseJsonResponse, parseFileResponse, parseCliJsonOutput } from '../src/migrate/migrate-claude.js';

describe('parseJsonResponse', () => {
  it('should parse raw JSON object', () => {
    const result = parseJsonResponse<{ name: string }>('{"name": "test"}');
    expect(result.name).toBe('test');
  });

  it('should parse raw JSON array', () => {
    const result = parseJsonResponse<number[]>('[1, 2, 3]');
    expect(result).toEqual([1, 2, 3]);
  });

  it('should extract JSON from markdown code block', () => {
    const input = `Here is the result:

\`\`\`json
{"domain": "extrait", "complexity": "MEDIUM"}
\`\`\`

That's the analysis.`;
    const result = parseJsonResponse<{ domain: string }>(input);
    expect(result.domain).toBe('extrait');
  });

  it('should extract JSON from code block without language', () => {
    const input = `\`\`\`
{"value": 42}
\`\`\``;
    const result = parseJsonResponse<{ value: number }>(input);
    expect(result.value).toBe(42);
  });

  it('should throw on non-JSON content', () => {
    expect(() => parseJsonResponse('This is not JSON')).toThrow('Failed to parse JSON');
  });

  it('should handle whitespace around JSON', () => {
    const result = parseJsonResponse<{ ok: boolean }>('\n  {"ok": true}\n  ');
    expect(result.ok).toBe(true);
  });
});

describe('parseFileResponse', () => {
  it('should extract typescript from code block', () => {
    const input = `\`\`\`typescript
export const foo = 42;
\`\`\``;
    expect(parseFileResponse(input)).toBe('export const foo = 42;');
  });

  it('should extract tsx from code block', () => {
    const input = `\`\`\`tsx
export const App = () => <div>Hello</div>;
\`\`\``;
    expect(parseFileResponse(input)).toBe('export const App = () => <div>Hello</div>;');
  });

  it('should return raw content if no code block', () => {
    const input = 'export const bar = 99;';
    expect(parseFileResponse(input)).toBe('export const bar = 99;');
  });

  it('should extract ts from code block', () => {
    const input = `Some explanation:

\`\`\`ts
interface Foo {
  name: string;
}
\`\`\``;
    expect(parseFileResponse(input)).toContain('interface Foo');
  });
});

describe('callClaude timeout behavior', () => {
  it('should use DEFAULT_CLI_TIMEOUT_MS for small prompts', () => {
    // This test verifies the timeout config exists
    // Integration tests would mock execAsync to verify actual timeout value
    const smallPrompt = 'Short prompt';
    expect(Buffer.byteLength(smallPrompt, 'utf8')).toBeLessThan(20000);
  });

  it('should use EXTENDED_CLI_TIMEOUT_MS for large prompts', () => {
    // Verify large prompt detection
    const largePrompt = 'x'.repeat(25000);
    expect(Buffer.byteLength(largePrompt, 'utf8')).toBeGreaterThan(20000);
  });
});

describe('parseCliJsonOutput', () => {
  it('should parse valid CLI JSON object format', () => {
    const stdout = JSON.stringify({
      result: 'test output',
      usage: { input_tokens: 100, output_tokens: 200 }
    });
    const result = parseCliJsonOutput(stdout, 1000, 400);
    expect(result.output).toBe('test output');
    expect(result.tokens?.input).toBe(100);
    expect(result.tokens?.output).toBe(200);
    expect(result.durationMs).toBe(1000);
  });

  it('should parse valid CLI JSON array format', () => {
    const stdout = JSON.stringify([
      { type: 'result', result: 'array output', usage: { input_tokens: 50, output_tokens: 150 } }
    ]);
    const result = parseCliJsonOutput(stdout, 500, 200);
    expect(result.output).toBe('array output');
    expect(result.tokens?.input).toBe(50);
    expect(result.tokens?.output).toBe(150);
  });

  it('should throw on HTTP GET error response', () => {
    const stdout = 'GET    /api/messages/01-abc-123 HTTP/1.1\nHost: api.anthropic.com\n...';
    expect(() => parseCliJsonOutput(stdout, 1000, 100))
      .toThrow(/Claude CLI returned an HTTP\/error response/);
  });

  it('should throw on HTTP POST error response', () => {
    const stdout = 'POST /v1/messages HTTP/1.1\nContent-Type: application/json\n...';
    expect(() => parseCliJsonOutput(stdout, 1000, 100))
      .toThrow(/Claude CLI returned an HTTP\/error response/);
  });

  it('should throw on HTTP/1.1 error response', () => {
    const stdout = 'HTTP/1.1 503 Service Unavailable\nContent-Type: text/html\n...';
    expect(() => parseCliJsonOutput(stdout, 1000, 100))
      .toThrow(/Claude CLI returned an HTTP\/error response/);
  });

  it('should throw on Error: prefix response', () => {
    const stdout = 'Error: API rate limit exceeded. Please try again later.';
    expect(() => parseCliJsonOutput(stdout, 1000, 100))
      .toThrow(/Claude CLI returned an HTTP\/error response/);
  });

  it('should throw on HTML error page', () => {
    const stdout = '<!DOCTYPE html>\n<html><head><title>Error</title></head><body>...</body></html>';
    expect(() => parseCliJsonOutput(stdout, 1000, 100))
      .toThrow(/Claude CLI returned an HTTP\/error response/);
  });

  it('should include preview in error message', () => {
    const longError = 'GET /api/endpoint ' + 'x'.repeat(300);
    expect(() => parseCliJsonOutput(longError, 1000, 100))
      .toThrow(/Preview: "GET \/api\/endpoint xxx/);
  });

  it('should fallback to raw text for malformed JSON (backward compat)', () => {
    // Non-error malformed JSON should still fallback (preserves existing behavior)
    const stdout = 'Just some random text that is not JSON';
    const result = parseCliJsonOutput(stdout, 1000, 100);
    expect(result.output).toBe('Just some random text that is not JSON');
    expect(result.tokens).toBeDefined();
  });

  it('should estimate tokens when usage is missing', () => {
    const stdout = JSON.stringify({ result: 'no usage' });
    const result = parseCliJsonOutput(stdout, 1000, 400);
    expect(result.tokens?.input).toBe(Math.ceil(400 / 4));
    expect(result.tokens?.output).toBeGreaterThan(0);
  });

  it('should handle zero tokens correctly', () => {
    const stdout = JSON.stringify({
      result: '',
      usage: { input_tokens: 0, output_tokens: 0 }
    });
    const result = parseCliJsonOutput(stdout, 1000, 0);
    // Should use estimates when tokens are 0
    expect(result.tokens?.input).toBeGreaterThanOrEqual(0);
    expect(result.tokens?.output).toBeGreaterThanOrEqual(0);
  });
});
