import { describe, it, expect } from 'vitest';
import { parseJsonResponse, parseFileResponse } from '../src/migrate/migrate-claude.js';

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
