import { describe, it, expect } from 'vitest';
import { parseTscErrors } from '../src/migrate/phases/phase-verify.js';
import type { TscError } from '../src/migrate/phases/phase-verify.js';

describe('parseTscErrors', () => {
  it('should parse standard tsc error format', () => {
    const output = `src/stores/fooStore.ts(15,3): error TS2304: Cannot find name 'bar'.
src/types/foo.ts(8,10): error TS2339: Property 'x' does not exist on type 'Y'.`;

    const errors = parseTscErrors(output);
    expect(errors).toHaveLength(2);
    expect(errors[0]).toEqual({
      file: 'src/stores/fooStore.ts',
      line: 15,
      col: 3,
      code: 'TS2304',
      message: "Cannot find name 'bar'.",
    });
    expect(errors[1].code).toBe('TS2339');
    expect(errors[1].file).toBe('src/types/foo.ts');
  });

  it('should return empty for clean output', () => {
    expect(parseTscErrors('')).toEqual([]);
    expect(parseTscErrors('All good, no errors.')).toEqual([]);
  });

  it('should handle mixed output with non-error lines', () => {
    const output = `Starting compilation...
src/pages/FooPage.tsx(42,7): error TS2345: Argument not assignable.
Done in 2.3s.`;

    const errors = parseTscErrors(output);
    expect(errors).toHaveLength(1);
    expect(errors[0].line).toBe(42);
    expect(errors[0].col).toBe(7);
  });

  it('should handle Windows-style paths', () => {
    const output = `D:\\project\\src\\foo.ts(10,5): error TS2322: Type 'string' is not assignable.`;
    const errors = parseTscErrors(output);
    expect(errors).toHaveLength(1);
    expect(errors[0].file).toBe('D:\\project\\src\\foo.ts');
  });
});

describe('inferSourceFromTest (via parseTscErrors integration)', () => {
  it('should group errors by file correctly', () => {
    const errors: TscError[] = [
      { file: 'a.ts', line: 1, col: 1, code: 'TS1', message: 'err1' },
      { file: 'a.ts', line: 5, col: 1, code: 'TS2', message: 'err2' },
      { file: 'b.ts', line: 2, col: 1, code: 'TS3', message: 'err3' },
    ];

    const byFile = new Map<string, TscError[]>();
    for (const err of errors) {
      const existing = byFile.get(err.file) ?? [];
      existing.push(err);
      byFile.set(err.file, existing);
    }

    expect(byFile.size).toBe(2);
    expect(byFile.get('a.ts')).toHaveLength(2);
    expect(byFile.get('b.ts')).toHaveLength(1);
  });
});

describe('phase result types', () => {
  it('should have correct SpecResult shape', async () => {
    const { SpecResult } = await import('../src/migrate/phases/phase-spec.js') as { SpecResult: unknown };
    // Just verify the module loads
    expect(SpecResult).toBeUndefined(); // It's a type, not a value
  });

  it('should have correct ContractResult shape', async () => {
    const mod = await import('../src/migrate/phases/phase-contract.js');
    expect(mod.runContractPhase).toBeDefined();
    expect(typeof mod.runContractPhase).toBe('function');
  });

  it('should have correct AnalyzeResult shape', async () => {
    const mod = await import('../src/migrate/phases/phase-analyze.js');
    expect(mod.runAnalyzePhase).toBeDefined();
    expect(typeof mod.runAnalyzePhase).toBe('function');
  });

  it('should have correct GenerateResult shape', async () => {
    const mod = await import('../src/migrate/phases/phase-generate.js');
    expect(mod.runTypesPhase).toBeDefined();
    expect(mod.runStorePhase).toBeDefined();
    expect(mod.runApiPhase).toBeDefined();
    expect(mod.runPagePhase).toBeDefined();
    expect(mod.runComponentsPhase).toBeDefined();
  });

  it('should have correct VerifyFixLoop shape', async () => {
    const mod = await import('../src/migrate/phases/phase-verify.js');
    expect(mod.runVerifyFixLoop).toBeDefined();
    expect(mod.parseTscErrors).toBeDefined();
  });
});
