/**
 * Types for the v10 full module migration pipeline.
 * 15 phases: SPEC → CONTRACT → ANALYZE → TYPES → STORE → API → PAGE → COMPONENTS → TESTS-UNIT → TESTS-UI → VERIFY-TSC → FIX-TSC → VERIFY-TESTS → FIX-TESTS → INTEGRATE → REVIEW
 */
export declare const MigratePhase: {
    readonly SPEC: "spec";
    readonly CONTRACT: "contract";
    readonly ANALYZE: "analyze";
    readonly TYPES: "types";
    readonly STORE: "store";
    readonly API: "api";
    readonly PAGE: "page";
    readonly COMPONENTS: "components";
    readonly TESTS_UNIT: "tests-unit";
    readonly TESTS_UI: "tests-ui";
    readonly VERIFY_TSC: "verify-tsc";
    readonly FIX_TSC: "fix-tsc";
    readonly VERIFY_TESTS: "verify-tests";
    readonly FIX_TESTS: "fix-tests";
    readonly INTEGRATE: "integrate";
    readonly REVIEW: "review";
};
export type MigratePhase = (typeof MigratePhase)[keyof typeof MigratePhase];
export declare const GENERATION_PHASES: MigratePhase[];
export declare const VERIFICATION_PHASES: MigratePhase[];
export declare const PhaseStatus: {
    readonly PENDING: "pending";
    readonly GENERATING: "generating";
    readonly COMPLETED: "completed";
    readonly FAILED: "failed";
    readonly SKIPPED: "skipped";
};
export type PhaseStatus = (typeof PhaseStatus)[keyof typeof PhaseStatus];
export interface PhaseRecord {
    status: PhaseStatus;
    duration?: number;
    file?: string;
    error?: string;
    startedAt?: string;
    completedAt?: string;
}
export interface ProgramMigration {
    status: 'pending' | 'generating' | 'completed' | 'failed';
    currentPhase: MigratePhase | null;
    phases: Partial<Record<MigratePhase, PhaseRecord>>;
    files: string[];
    startedAt?: string;
    completedAt?: string;
    errors: string[];
}
export interface AnalysisEntity {
    name: string;
    fields: AnalysisField[];
}
export interface AnalysisField {
    name: string;
    type: string;
    source?: string;
    nullable?: boolean;
}
export interface AnalysisStateField {
    name: string;
    type: string;
    default: string;
}
export interface AnalysisAction {
    name: string;
    params: string[];
    businessRules: string[];
    returns: string;
}
export interface AnalysisEndpoint {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    path: string;
    queryParams?: string[];
    response: string;
}
export interface AnalysisUiSection {
    name: string;
    controls?: string[];
    columns?: string[];
    fields?: string[];
}
export interface AnalysisDocument {
    domain: string;
    domainPascal: string;
    complexity: 'LOW' | 'MEDIUM' | 'HIGH';
    entities: AnalysisEntity[];
    stateFields: AnalysisStateField[];
    actions: AnalysisAction[];
    apiEndpoints: AnalysisEndpoint[];
    uiLayout: {
        type: string;
        sections: AnalysisUiSection[];
    };
    mockData: {
        count: number;
        description: string;
    };
    dependencies: {
        stores: string[];
        sharedTypes: string[];
        externalApis: string[];
    };
}
export interface MigrateConfig {
    projectDir: string;
    targetDir: string;
    migrationDir: string;
    specDir: string;
    contractSubDir: string;
    dbMetadataFile?: string;
    model?: string;
    cliBin?: string;
    dryRun: boolean;
    parallel: number;
    maxPasses: number;
    onEvent?: (event: MigrateEvent) => void;
    /** Per-phase model overrides. Unset phases fallback to `model`. */
    phaseModels?: Partial<Record<MigratePhase, string>>;
    /** Directory for decision logging (prompts, responses, JSONL). */
    logDir?: string;
    /** Auto git add + commit + push after successful migration. Default false for CLI, true from dashboard. */
    autoCommit?: boolean;
    /** AbortSignal to cancel migration in progress. */
    abortSignal?: AbortSignal;
}
/**
 * Returns the model to use for a given phase.
 * Checks phaseModels first, falls back to config.model.
 */
export declare const getModelForPhase: (config: MigrateConfig, phase: MigratePhase) => string | undefined;
/**
 * Default phase model recommendations:
 * - Opus: analyze, store, page, review (complex reasoning)
 * - Sonnet: types, api, tests-unit, tests-ui, fix-tsc, fix-tests (structural)
 */
export declare const DEFAULT_PHASE_MODELS: Partial<Record<MigratePhase, string>>;
export declare const MigrateEventType: {
    readonly MIGRATION_STARTED: "migration_started";
    readonly MIGRATION_COMPLETED: "migration_completed";
    readonly PROGRAM_STARTED: "program_started";
    readonly PROGRAM_COMPLETED: "program_completed";
    readonly PROGRAM_FAILED: "program_failed";
    readonly PHASE_STARTED: "phase_started";
    readonly PHASE_COMPLETED: "phase_completed";
    readonly PHASE_FAILED: "phase_failed";
    readonly VERIFY_PASS: "verify_pass";
    readonly FIX_APPLIED: "fix_applied";
    readonly GIT_STARTED: "git_started";
    readonly GIT_COMPLETED: "git_completed";
    readonly GIT_FAILED: "git_failed";
    readonly PARALLEL_RESOLVED: "parallel_resolved";
    readonly ERROR: "error";
};
export type MigrateEventType = (typeof MigrateEventType)[keyof typeof MigrateEventType];
export interface MigrateEvent {
    type: MigrateEventType;
    timestamp: string;
    programId?: string | number;
    phase?: MigratePhase;
    message: string;
    data?: Record<string, unknown>;
}
export interface MigrateResult {
    batchId: string;
    batchName: string;
    started: string;
    completed: string;
    dryRun: boolean;
    programs: ProgramMigrateResult[];
    summary: MigrateSummary;
    git?: {
        commitSha: string;
        pushed: boolean;
        branch: string;
    };
}
export interface ProgramMigrateResult {
    programId: string | number;
    programName: string;
    status: 'completed' | 'failed' | 'skipped';
    filesGenerated: number;
    phasesCompleted: number;
    phasesTotal: number;
    duration: number;
    errors: string[];
    tokens?: {
        input: number;
        output: number;
    };
}
export interface MigrateSummary {
    total: number;
    completed: number;
    failed: number;
    skipped: number;
    totalFiles: number;
    tscClean: boolean;
    testsPass: boolean;
    reviewAvgCoverage: number;
    totalTokens?: {
        input: number;
        output: number;
    };
    estimatedCostUsd?: number;
}
export interface ReviewReport {
    programId: string | number;
    programName: string;
    coveragePct: number;
    rulesImplemented: number;
    rulesTotal: number;
    missingRules: string[];
    recommendations: string[];
}
