import { describe, it, expect } from 'vitest';
import { parseTscErrors } from '../src/migrate/phases/phase-verify.js';

describe('phase-verify context enrichment', () => {
  it('should parse TSC errors correctly', () => {
    const output = `src/stores/fooStore.ts(15,3): error TS2322: Type 'string' is not assignable to type 'number'.
src/stores/fooStore.ts(20,5): error TS7006: Parameter 'x' implicitly has an 'any' type.
src/pages/BarPage.tsx(8,10): error TS2304: Cannot find name 'FooType'.`;

    const errors = parseTscErrors(output);
    expect(errors).toHaveLength(3);
    expect(errors[0]).toEqual({
      file: 'src/stores/fooStore.ts',
      line: 15,
      col: 3,
      code: 'TS2322',
      message: "Type 'string' is not assignable to type 'number'.",
    });
    expect(errors[2].file).toBe('src/pages/BarPage.tsx');
  });

  it('should handle empty output', () => {
    expect(parseTscErrors('')).toEqual([]);
  });

  it('should handle output with non-error lines', () => {
    const output = `Some random text
src/stores/fooStore.ts(5,1): error TS2345: Argument of type...
More random text`;

    const errors = parseTscErrors(output);
    expect(errors).toHaveLength(1);
    expect(errors[0].line).toBe(5);
  });
});
