/**
 * Phases 10-13: Verification and fix loops.
 * - Phase 10: VERIFY-TSC - Run tsc --noEmit
 * - Phase 11: FIX-TSC - Fix compilation errors with Claude
 * - Phase 12: VERIFY-TESTS - Run vitest
 * - Phase 13: FIX-TESTS - Fix failing tests with Claude
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFile, spawn, execSync } from 'node:child_process';
import { promisify } from 'node:util';
import { callClaude, parseFileResponse } from '../migrate-claude.js';
import { buildFixTscPrompt, buildFixTestsPrompt } from '../migrate-prompts.js';
import { getModelForPhase, MigratePhase as MP, MigrateEventType as ET } from '../migrate-types.js';
import type { MigrateConfig, MigrateEvent } from '../migrate-types.js';

/** Emit an event from within the verify phase (uses config.onEvent directly). */
const emitVerify = (
  config: MigrateConfig,
  type: (typeof ET)[keyof typeof ET],
  message: string,
  phase: (typeof MP)[keyof typeof MP],
  data?: Record<string, unknown>,
): void => {
  config.onEvent?.({
    type,
    timestamp: new Date().toISOString(),
    message,
    phase,
    data,
  } as MigrateEvent);
};

const execFileAsync = promisify(execFile);

// Windows: npm/npx/pnpm are .cmd scripts, need shell:true
// Use windowsHide to prevent terminal windows from popping up
const EXEC_OPTS = {
  shell: process.platform === 'win32',
  windowsHide: true, // Prevent windows from opening on Windows
} as const;

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
    console.log(`[phase-verify] node_modules missing, installing dependencies...`);
    try {
      await execFileAsync('npm', ['install', '--no-audit', '--no-fund'], {
        cwd: config.targetDir,
        timeout: 180_000,
        maxBuffer: 4 * 1024 * 1024,
        ...EXEC_OPTS,
      });
      console.log(`[phase-verify] npm install completed in ${Date.now() - start}ms`);
    } catch {
      // Fall back to pnpm if npm fails
      try {
        await execFileAsync('pnpm', ['install', '--no-frozen-lockfile'], {
          cwd: config.targetDir,
          timeout: 180_000,
          maxBuffer: 4 * 1024 * 1024,
          ...EXEC_OPTS,
        });
        console.log(`[phase-verify] pnpm install completed in ${Date.now() - start}ms`);
      } catch { /* continue anyway - TSC may still work with skipLibCheck */ }
    }
  }

  console.log(`[phase-verify] Running: npx tsc --noEmit --pretty false (cwd: ${config.targetDir})`);
  try {
    await execFileAsync('npx', ['tsc', '--noEmit', '--pretty', 'false'], {
      cwd: config.targetDir,
      timeout: 120_000,
      maxBuffer: 2 * 1024 * 1024,
      ...EXEC_OPTS,
    });
    const duration = Date.now() - start;
    console.log(`[phase-verify] TSC clean in ${duration}ms`);
    return { clean: true, errors: [], errorCount: 0, duration };
  } catch (err: unknown) {
    const execErr = err as { stdout?: string; stderr?: string };
    const output = (execErr.stdout ?? '') + (execErr.stderr ?? '');
    const errors = parseTscErrors(output);
    const duration = Date.now() - start;
    console.log(`[phase-verify] TSC found ${errors.length} errors in ${duration}ms`);
    return { clean: false, errors, errorCount: errors.length, duration };
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
  const VERIFY_TIMEOUT_MS = 120_000;

  const args = ['vitest', 'run', '--reporter', 'json', ...filterArgs];
  console.log(`[phase-verify] Running: npx ${args.join(' ')} (cwd: ${config.targetDir}, timeout: ${VERIFY_TIMEOUT_MS}ms)`);

  try {
    const output = await spawnWithForceKill('npx', args, {
      cwd: config.targetDir,
      timeoutMs: VERIFY_TIMEOUT_MS,
    });

    const duration = Date.now() - start;
    console.log(`[phase-verify] Vitest completed in ${duration}ms (stdout: ${output.stdout.length} chars, stderr: ${output.stderr.length} chars, killed: ${output.timedOut})`);

    if (output.timedOut) {
      console.warn(`[phase-verify] Vitest was force-killed after ${VERIFY_TIMEOUT_MS}ms timeout`);
      return {
        pass: false,
        failures: [{ testFile: 'unknown', testName: 'vitest run', error: `Vitest timed out after ${VERIFY_TIMEOUT_MS}ms (force-killed)` }],
        totalTests: 0,
        passedTests: 0,
        duration,
      };
    }

    const combined = output.stdout + output.stderr;
    const parseResult = parseVitestJsonOutput(combined);

    console.log(`[phase-verify] Results: ${parseResult.passedTests} passed, ${parseResult.failures.length} failed, ${parseResult.totalTests} total`);
    return { ...parseResult, duration };
  } catch (err: unknown) {
    const duration = Date.now() - start;
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error(`[phase-verify] Vitest error after ${duration}ms: ${errMsg}`);

    return {
      pass: false,
      failures: [{ testFile: 'unknown', testName: 'vitest run', error: errMsg.slice(0, 500) }],
      totalTests: 0,
      passedTests: 0,
      duration,
    };
  }
};

/** Spawn a process with a hard force-kill timeout (handles Windows vitest hang). */
const spawnWithForceKill = (
  cmd: string,
  args: string[],
  opts: { cwd: string; timeoutMs: number },
): Promise<{ stdout: string; stderr: string; exitCode: number | null; timedOut: boolean }> => {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, {
      cwd: opts.cwd,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: process.platform === 'win32',
      windowsHide: true,
    });

    let stdout = '';
    let stderr = '';
    let timedOut = false;

    child.stdout.on('data', (d: Buffer) => { stdout += d.toString(); });
    child.stderr.on('data', (d: Buffer) => { stderr += d.toString(); });

    // Force kill after timeout (handles Windows vitest hang)
    const timer = setTimeout(() => {
      timedOut = true;
      try { child.kill('SIGTERM'); } catch { /* ignore */ }
      // On Windows, also kill the process tree
      if (process.platform === 'win32' && child.pid) {
        try { execSync(`taskkill /PID ${child.pid} /T /F`, { windowsHide: true, timeout: 5000 }); } catch { /* ignore */ }
      }
    }, opts.timeoutMs);

    child.on('close', (code) => {
      clearTimeout(timer);
      resolve({ stdout, stderr, exitCode: code, timedOut });
    });

    child.on('error', (err) => {
      clearTimeout(timer);
      resolve({ stdout, stderr: stderr + '\n' + err.message, exitCode: null, timedOut });
    });
  });
};

/** Parse vitest JSON reporter output, handling both clean and error exit cases. */
const parseVitestJsonOutput = (output: string): Omit<VerifyTestsResult, 'duration'> => {
  // Try to find and parse JSON from output
  const jsonStart = output.indexOf('{');
  if (jsonStart < 0) {
    return {
      pass: false,
      failures: [{ testFile: 'unknown', testName: 'vitest run', error: `No JSON output found (${output.length} chars)` }],
      totalTests: 0,
      passedTests: 0,
    };
  }

  try {
    const report = JSON.parse(output.slice(jsonStart));
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

    return { pass: failures.length === 0, failures, totalTests, passedTests };
  } catch {
    return {
      pass: false,
      failures: [{ testFile: 'unknown', testName: 'vitest run', error: output.slice(0, 500) }],
      totalTests: 0,
      passedTests: 0,
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

export interface VerifyWarning {
  type: 'tsc' | 'tests';
  attempts: number;
  message: string;
  details?: string;
}

export interface VerifyFixLoop {
  tscClean: boolean;
  testsPass: boolean;
  tscPasses: number;
  testPasses: number;
  totalDuration: number;
  warnings: VerifyWarning[];
  hasIssues: boolean;
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
  const testMaxPasses = Math.min(maxPasses, 2);

  // Progress: TSC loop = 0..0.7, Tests loop = 0.7..1.0 of verify phase
  const tscWeight = 0.7;

  // TSC verify+fix loop
  let lastErrorCount = -1;
  let passesWithNoImprovement = 0;

  for (let i = 0; i < maxPasses; i++) {
    tscPasses++;
    const passProgress = tscWeight * (i / maxPasses);

    emitVerify(config, ET.PHASE_STARTED, `Vérification TypeScript (tentative ${i + 1}/${maxPasses})`, MP.VERIFY_TSC,
      { pass: i + 1, maxPasses, verifyProgress: passProgress });

    const tscResult = await runVerifyTscPhase(config);
    const afterVerifyProgress = tscWeight * ((i + 0.5) / maxPasses);

    if (tscResult.clean) {
      tscClean = true;
      emitVerify(config, ET.PHASE_STARTED, `✓ TypeScript propre (${i + 1} tentative${i > 0 ? 's' : ''})`, MP.VERIFY_TSC,
        { pass: i + 1, maxPasses, errors: 0, clean: true, verifyProgress: tscWeight });
      break;
    }

    if (i > 0 && tscResult.errorCount === lastErrorCount) {
      passesWithNoImprovement++;
      if (passesWithNoImprovement >= 2) {
        emitVerify(config, ET.PHASE_STARTED, `⏸ Convergence atteinte après ${i} passes (${tscResult.errorCount} erreurs stables)`, MP.VERIFY_TSC,
          { pass: i + 1, maxPasses, errors: tscResult.errorCount, converged: true, verifyProgress: tscWeight });
        break;
      }
    } else {
      passesWithNoImprovement = 0;
    }
    lastErrorCount = tscResult.errorCount;

    emitVerify(config, ET.PHASE_STARTED, `⚠ ${tscResult.errorCount} erreur${tscResult.errorCount > 1 ? 's' : ''} TypeScript détectée${tscResult.errorCount > 1 ? 's' : ''}`, MP.FIX_TSC,
      { pass: i + 1, maxPasses, errors: tscResult.errorCount, verifyProgress: afterVerifyProgress });

    if (i < maxPasses - 1) {
      const fixResult = await runFixTscPhase(tscResult.errors, config);
      const afterFixProgress = tscWeight * ((i + 1) / maxPasses);

      emitVerify(config, ET.PHASE_STARTED, `✓ Correction appliquée (${fixResult.filesFixed} fichier${fixResult.filesFixed > 1 ? 's' : ''})`, MP.FIX_TSC,
        { pass: i + 1, maxPasses, filesFixed: fixResult.filesFixed, verifyProgress: afterFixProgress });
    }
  }

  // Tests verify+fix loop (only if tsc is clean)
  let lastTestFailures: TestFailure[] = [];
  if (tscClean) {
    for (let i = 0; i < testMaxPasses; i++) {
      testPasses++;
      const testProgress = tscWeight + (1 - tscWeight) * (i / testMaxPasses);

      emitVerify(config, ET.PHASE_STARTED, `Vérification tests (tentative ${i + 1}/${testMaxPasses})`, MP.VERIFY_TESTS,
        { pass: i + 1, maxPasses: testMaxPasses, verifyProgress: testProgress });

      const testResult = await runVerifyTestsPhase(config, domainFilter);
      lastTestFailures = testResult.failures; // Capture failures for detailed warning

      if (testResult.pass) {
        testsPass = true;
        emitVerify(config, ET.PHASE_STARTED, `✓ Tous les tests passent (${testResult.passedTests} test${testResult.passedTests > 1 ? 's' : ''})`, MP.VERIFY_TESTS,
          { pass: i + 1, maxPasses: testMaxPasses, passed: true, verifyProgress: 1 });
        break;
      }

      emitVerify(config, ET.PHASE_STARTED, `⚠ ${testResult.failures.length} test${testResult.failures.length > 1 ? 's' : ''} en échec`, MP.FIX_TESTS,
        { pass: i + 1, maxPasses: testMaxPasses, failures: testResult.failures.length,
          verifyProgress: tscWeight + (1 - tscWeight) * ((i + 0.5) / testMaxPasses) });

      if (i < testMaxPasses - 1) {
        await runFixTestsPhase(testResult.failures, config);

        emitVerify(config, ET.PHASE_STARTED, `Fix tests pass ${i + 1}: done`, MP.FIX_TESTS,
          { pass: i + 1, maxPasses: testMaxPasses,
            verifyProgress: tscWeight + (1 - tscWeight) * ((i + 1) / testMaxPasses) });
      }
    }
  }

  // Collect verification issues as warnings instead of blocking
  const warnings: VerifyWarning[] = [];
  const failures: string[] = [];

  if (!tscClean) {
    warnings.push({
      type: 'tsc',
      attempts: tscPasses,
      message: `TypeScript compilation failed after ${tscPasses} attempt${tscPasses > 1 ? 's' : ''}`,
      details: `Run 'pnpm typecheck' in target directory to see errors`,
    });
    failures.push(
      `❌ TypeScript compilation failed after ${tscPasses} attempt${tscPasses > 1 ? 's' : ''}`,
      `   → Run 'pnpm typecheck' in target directory to see errors`,
      `   → Check generated code quality and types`,
    );
  }

  if (!testsPass && tscClean) {
    // Capture detailed test failures for analysis
    const testDetails = lastTestFailures.length > 0
      ? JSON.stringify(lastTestFailures, null, 2)
      : 'No detailed failure info available';

    warnings.push({
      type: 'tests',
      attempts: testPasses,
      message: `Tests failed after ${testPasses} attempt${testPasses > 1 ? 's' : ''} (${lastTestFailures.length} test${lastTestFailures.length > 1 ? 's' : ''})`,
      details: testDetails,
    });
    failures.push(
      `❌ Tests failed after ${testPasses} attempt${testPasses > 1 ? 's' : ''} (${lastTestFailures.length} test${lastTestFailures.length > 1 ? 's' : ''})`,
      `   → Run 'pnpm test' in target directory to see failures`,
      `   → Check test expectations vs actual behavior`,
      `   → Review generated test files for correctness`,
    );

    // Show first 3 failures as examples
    if (lastTestFailures.length > 0) {
      const examples = lastTestFailures.slice(0, 3);
      failures.push('', '   Examples:');

      for (const [idx, failure] of examples.entries()) {
        failures.push(
          `   ${idx + 1}. ${failure.testFile}`,
          `      Test: ${failure.testName}`,
          `      Error: ${failure.error.slice(0, 500)}...`,
          ''
        );
      }
    }
  }

  // Emit warning event instead of error (migration continues)
  if (failures.length > 0) {
    const warningMsg = [
      '',
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      '  ⚠️  VERIFICATION WARNINGS - Migration Continues',
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      '',
      ...failures,
      '',
      '⚠️  Code generated but requires manual fixes.',
      'The migration will continue. Review issues after completion.',
      '',
      'Tip: Use /swarm to analyze and fix issues automatically.',
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      '',
    ].join('\n');

    emitVerify(config, ET.PHASE_COMPLETED, warningMsg, MP.VERIFY_TESTS, {
      tscClean,
      testsPass,
      tscPasses,
      testPasses,
      hasWarnings: true,
      warnings,
    });
  }

  return {
    tscClean,
    testsPass,
    tscPasses,
    testPasses,
    totalDuration: Date.now() - start,
    warnings,
    hasIssues: warnings.length > 0,
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
