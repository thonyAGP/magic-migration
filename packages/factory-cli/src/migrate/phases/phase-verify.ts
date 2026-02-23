/**
 * Phases 10-13: Verification and fix loops.
 * - Phase 10: VERIFY-TSC - Run tsc --noEmit
 * - Phase 11: FIX-TSC - Fix compilation errors with Claude
 * - Phase 12: VERIFY-TESTS - Run vitest
 * - Phase 13: FIX-TESTS - Fix failing tests with Claude
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { callClaude, parseFileResponse } from '../migrate-claude.js';
import { buildFixTscPrompt, buildFixTestsPrompt } from '../migrate-prompts.js';
import { getModelForPhase, MigratePhase as MP } from '../migrate-types.js';
import type { MigrateConfig } from '../migrate-types.js';

const execFileAsync = promisify(execFile);

// Windows: npm/npx/pnpm are .cmd scripts, need shell:true
const EXEC_OPTS = { shell: process.platform === 'win32' } as const;

// ─── TSC Error Parsing ─────────────────────────────────────────

export interface TscError {
  file: string;
  line: number;
  col: number;
  code: string;
  message: string;
}

export const parseTscErrors = (output: string): TscError[] => {
  const errors: TscError[] = [];
  const lines = output.split('\n');

  for (const line of lines) {
    // Format: file(line,col): error TSxxxx: message
    const match = line.match(/^(.+?)\((\d+),(\d+)\):\s+error\s+(TS\d+):\s+(.+)$/);
    if (match) {
      errors.push({
        file: match[1],
        line: Number(match[2]),
        col: Number(match[3]),
        code: match[4],
        message: match[5],
      });
    }
  }

  return errors;
};

// ─── Phase 10: VERIFY-TSC ──────────────────────────────────────

export interface VerifyTscResult {
  clean: boolean;
  errors: TscError[];
  errorCount: number;
  duration: number;
}

export const runVerifyTscPhase = async (config: MigrateConfig): Promise<VerifyTscResult> => {
  const start = Date.now();

  // Ensure node_modules exist in target dir
  const nodeModules = path.join(config.targetDir, 'node_modules');
  if (!fs.existsSync(nodeModules)) {
    try {
      await execFileAsync('npm', ['install', '--no-audit', '--no-fund'], {
        cwd: config.targetDir,
        timeout: 180_000,
        maxBuffer: 4 * 1024 * 1024,
        ...EXEC_OPTS,
      });
    } catch {
      // Fall back to pnpm if npm fails
      try {
        await execFileAsync('pnpm', ['install', '--no-frozen-lockfile'], {
          cwd: config.targetDir,
          timeout: 180_000,
          maxBuffer: 4 * 1024 * 1024,
          ...EXEC_OPTS,
        });
      } catch { /* continue anyway - TSC may still work with skipLibCheck */ }
    }
  }

  try {
    await execFileAsync('npx', ['tsc', '--noEmit', '--pretty', 'false'], {
      cwd: config.targetDir,
      timeout: 120_000,
      maxBuffer: 2 * 1024 * 1024,
      ...EXEC_OPTS,
    });
    return { clean: true, errors: [], errorCount: 0, duration: Date.now() - start };
  } catch (err: unknown) {
    const execErr = err as { stdout?: string; stderr?: string };
    const output = (execErr.stdout ?? '') + (execErr.stderr ?? '');
    const errors = parseTscErrors(output);
    return { clean: false, errors, errorCount: errors.length, duration: Date.now() - start };
  }
};

// ─── Phase 11: FIX-TSC ─────────────────────────────────────────

export interface FixTscResult {
  filesFixed: number;
  duration: number;
}

export const runFixTscPhase = async (
  errors: TscError[],
  config: MigrateConfig,
): Promise<FixTscResult> => {
  const start = Date.now();
  let filesFixed = 0;

  // Group errors by file
  const errorsByFile = new Map<string, TscError[]>();
  for (const err of errors) {
    const existing = errorsByFile.get(err.file) ?? [];
    existing.push(err);
    errorsByFile.set(err.file, existing);
  }

  for (const [filePath, fileErrors] of errorsByFile) {
    const absPath = path.isAbsolute(filePath) ? filePath : path.join(config.targetDir, filePath);
    if (!fs.existsSync(absPath)) continue;

    const fileContent = fs.readFileSync(absPath, 'utf8');
    const fileLines = fileContent.split('\n');

    // Limit to 5 errors per prompt to avoid overwhelming Claude
    const limitedErrors = fileErrors.slice(0, 5);
    const errorMessages = limitedErrors.map(e => {
      // Include +/- 10 lines around each error for context
      const startLine = Math.max(0, e.line - 11);
      const endLine = Math.min(fileLines.length, e.line + 10);
      const snippet = fileLines.slice(startLine, endLine)
        .map((l, i) => {
          const lineNum = startLine + i + 1;
          const marker = lineNum === e.line ? '>>>' : '   ';
          return `${marker} ${lineNum}: ${l}`;
        })
        .join('\n');
      return `Line ${e.line}: ${e.code} ${e.message}\nContext:\n${snippet}`;
    });

    // Collect all related type imports
    let relatedTypes: string | undefined;
    const typeImports = fileContent.matchAll(/from\s+['"]@\/types\/([^'"]+)['"]/g);
    const typeParts: string[] = [];
    for (const match of typeImports) {
      const typesFile = path.join(config.targetDir, 'src', 'types', `${match[1]}.ts`);
      if (fs.existsSync(typesFile)) {
        typeParts.push(`// --- ${match[1]}.ts ---\n${fs.readFileSync(typesFile, 'utf8')}`);
      }
    }
    if (typeParts.length > 0) relatedTypes = typeParts.join('\n\n');

    const prompt = buildFixTscPrompt(fileContent, filePath, errorMessages, relatedTypes);

    try {
      const result = await callClaude({
        prompt,
        model: getModelForPhase(config, MP.FIX_TSC),
        cliBin: config.cliBin,
        timeoutMs: 120_000,
      });
      const fixedContent = parseFileResponse(result.output);

      if (!config.dryRun && fixedContent.length > 50) {
        fs.writeFileSync(absPath, fixedContent, 'utf8');
        filesFixed++;
      }
    } catch {
      // Skip files that fail to fix
    }
  }

  return { filesFixed, duration: Date.now() - start };
};

// ─── Phase 12: VERIFY-TESTS ───────────────────────────────────

export interface TestFailure {
  testFile: string;
  testName: string;
  error: string;
}

export interface VerifyTestsResult {
  pass: boolean;
  failures: TestFailure[];
  totalTests: number;
  passedTests: number;
  duration: number;
}

export const runVerifyTestsPhase = async (
  config: MigrateConfig,
  domainFilter?: string,
): Promise<VerifyTestsResult> => {
  const start = Date.now();
  const filterArgs = domainFilter ? ['--', domainFilter] : [];

  try {
    const { stdout } = await execFileAsync('npx', [
      'vitest', 'run', '--reporter', 'json', ...filterArgs,
    ], {
      cwd: config.targetDir,
      timeout: 180_000,
      maxBuffer: 4 * 1024 * 1024,
      ...EXEC_OPTS,
    });

    const report = JSON.parse(stdout);
    const failures: TestFailure[] = [];
    let totalTests = 0;
    let passedTests = 0;

    for (const suite of report.testResults ?? []) {
      for (const test of suite.assertionResults ?? []) {
        totalTests++;
        if (test.status === 'passed') {
          passedTests++;
        } else {
          failures.push({
            testFile: suite.name,
            testName: test.fullName ?? test.title,
            error: test.failureMessages?.join('\n') ?? 'Unknown error',
          });
        }
      }
    }

    return { pass: failures.length === 0, failures, totalTests, passedTests, duration: Date.now() - start };
  } catch (err: unknown) {
    const execErr = err as { stdout?: string; stderr?: string };
    const output = (execErr.stdout ?? '') + (execErr.stderr ?? '');

    // Try parsing JSON even from error output
    try {
      const jsonStart = output.indexOf('{');
      if (jsonStart >= 0) {
        const report = JSON.parse(output.slice(jsonStart));
        const failures: TestFailure[] = [];
        let total = 0;
        let passed = 0;

        for (const suite of report.testResults ?? []) {
          for (const test of suite.assertionResults ?? []) {
            total++;
            if (test.status === 'passed') passed++;
            else failures.push({
              testFile: suite.name,
              testName: test.fullName ?? test.title,
              error: test.failureMessages?.join('\n') ?? 'Unknown',
            });
          }
        }

        return { pass: false, failures, totalTests: total, passedTests: passed, duration: Date.now() - start };
      }
    } catch { /* ignore parse failure */ }

    return {
      pass: false,
      failures: [{ testFile: 'unknown', testName: 'vitest run', error: output.slice(0, 500) }],
      totalTests: 0,
      passedTests: 0,
      duration: Date.now() - start,
    };
  }
};

// ─── Phase 13: FIX-TESTS ──────────────────────────────────────

export interface FixTestsResult {
  testsFixed: number;
  duration: number;
}

export const runFixTestsPhase = async (
  failures: TestFailure[],
  config: MigrateConfig,
): Promise<FixTestsResult> => {
  const start = Date.now();
  let testsFixed = 0;

  // Group by test file
  const failuresByFile = new Map<string, TestFailure[]>();
  for (const f of failures) {
    const existing = failuresByFile.get(f.testFile) ?? [];
    existing.push(f);
    failuresByFile.set(f.testFile, existing);
  }

  for (const [testFile, fileFailures] of failuresByFile) {
    if (!fs.existsSync(testFile)) continue;

    const testContent = fs.readFileSync(testFile, 'utf8');
    const errorMessages = fileFailures.map(f => `${f.testName}: ${f.error.slice(0, 200)}`);

    // Find source file from test file name
    const sourceFile = inferSourceFromTest(testFile, config.targetDir);
    const sourceContent = sourceFile && fs.existsSync(sourceFile)
      ? fs.readFileSync(sourceFile, 'utf8')
      : '';

    const prompt = buildFixTestsPrompt(testContent, testFile, sourceContent, errorMessages);

    try {
      const result = await callClaude({
        prompt,
        model: getModelForPhase(config, MP.FIX_TESTS),
        cliBin: config.cliBin,
        timeoutMs: 120_000,
      });
      const fixedContent = parseFileResponse(result.output);

      if (!config.dryRun && fixedContent.length > 50) {
        fs.writeFileSync(testFile, fixedContent, 'utf8');
        testsFixed++;
      }
    } catch {
      // Skip files that fail to fix
    }
  }

  return { testsFixed, duration: Date.now() - start };
};

// ─── Verify+Fix Loop ──────────────────────────────────────────

export interface VerifyFixLoop {
  tscClean: boolean;
  testsPass: boolean;
  tscPasses: number;
  testPasses: number;
  totalDuration: number;
}

export const runVerifyFixLoop = async (
  config: MigrateConfig,
  maxPasses: number,
  domainFilter?: string,
): Promise<VerifyFixLoop> => {
  const start = Date.now();
  let tscClean = false;
  let testsPass = false;
  let tscPasses = 0;
  let testPasses = 0;

  // TSC verify+fix loop
  for (let i = 0; i < maxPasses; i++) {
    tscPasses++;
    const tscResult = await runVerifyTscPhase(config);
    if (tscResult.clean) {
      tscClean = true;
      break;
    }
    if (i < maxPasses - 1) {
      await runFixTscPhase(tscResult.errors, config);
    }
  }

  // Tests verify+fix loop (only if tsc is clean)
  if (tscClean) {
    for (let i = 0; i < Math.min(maxPasses, 3); i++) {
      testPasses++;
      const testResult = await runVerifyTestsPhase(config, domainFilter);
      if (testResult.pass) {
        testsPass = true;
        break;
      }
      if (i < Math.min(maxPasses, 3) - 1) {
        await runFixTestsPhase(testResult.failures, config);
      }
    }
  }

  return {
    tscClean,
    testsPass,
    tscPasses,
    testPasses,
    totalDuration: Date.now() - start,
  };
};

// ─── Helpers ───────────────────────────────────────────────────

const inferSourceFromTest = (testFile: string, targetDir: string): string | null => {
  const basename = path.basename(testFile);

  // fooStore.test.ts → stores/fooStore.ts
  const storeMatch = basename.match(/^(.+Store)\.test\.ts$/);
  if (storeMatch) {
    return path.join(targetDir, 'src', 'stores', `${storeMatch[1]}.ts`);
  }

  // FooPage.test.tsx → pages/FooPage.tsx
  const pageMatch = basename.match(/^(.+Page)\.test\.tsx$/);
  if (pageMatch) {
    return path.join(targetDir, 'src', 'pages', `${pageMatch[1]}.tsx`);
  }

  return null;
};
