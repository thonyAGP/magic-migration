/**
 * Phases 10-13: Verification and fix loops.
 * - Phase 10: VERIFY-TSC - Run tsc --noEmit
 * - Phase 11: FIX-TSC - Fix compilation errors with Claude
 * - Phase 12: VERIFY-TESTS - Run vitest
 * - Phase 13: FIX-TESTS - Fix failing tests with Claude
 */
import type { MigrateConfig } from '../migrate-types.js';
export interface TscError {
    file: string;
    line: number;
    col: number;
    code: string;
    message: string;
}
export declare const parseTscErrors: (output: string) => TscError[];
export interface VerifyTscResult {
    clean: boolean;
    errors: TscError[];
    errorCount: number;
    duration: number;
}
export declare const runVerifyTscPhase: (config: MigrateConfig) => Promise<VerifyTscResult>;
export interface FixTscResult {
    filesFixed: number;
    duration: number;
}
export declare const runFixTscPhase: (errors: TscError[], config: MigrateConfig) => Promise<FixTscResult>;
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
export declare const runVerifyTestsPhase: (config: MigrateConfig, domainFilter?: string) => Promise<VerifyTestsResult>;
export interface FixTestsResult {
    testsFixed: number;
    duration: number;
}
export declare const runFixTestsPhase: (failures: TestFailure[], config: MigrateConfig) => Promise<FixTestsResult>;
export interface VerifyFixLoop {
    tscClean: boolean;
    testsPass: boolean;
    tscPasses: number;
    testPasses: number;
    totalDuration: number;
}
export declare const runVerifyFixLoop: (config: MigrateConfig, maxPasses: number, domainFilter?: string) => Promise<VerifyFixLoop>;
