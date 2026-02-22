/**
 * Types for the v10 full module migration pipeline.
 * 15 phases: SPEC → CONTRACT → ANALYZE → TYPES → STORE → API → PAGE → COMPONENTS → TESTS-UNIT → TESTS-UI → VERIFY-TSC → FIX-TSC → VERIFY-TESTS → FIX-TESTS → INTEGRATE → REVIEW
 */
// ─── Phase Names ────────────────────────────────────────────────
export const MigratePhase = {
    SPEC: 'spec',
    CONTRACT: 'contract',
    ANALYZE: 'analyze',
    TYPES: 'types',
    STORE: 'store',
    API: 'api',
    PAGE: 'page',
    COMPONENTS: 'components',
    TESTS_UNIT: 'tests-unit',
    TESTS_UI: 'tests-ui',
    VERIFY_TSC: 'verify-tsc',
    FIX_TSC: 'fix-tsc',
    VERIFY_TESTS: 'verify-tests',
    FIX_TESTS: 'fix-tests',
    INTEGRATE: 'integrate',
    REVIEW: 'review',
};
export const GENERATION_PHASES = [
    MigratePhase.SPEC,
    MigratePhase.CONTRACT,
    MigratePhase.ANALYZE,
    MigratePhase.TYPES,
    MigratePhase.STORE,
    MigratePhase.API,
    MigratePhase.PAGE,
    MigratePhase.COMPONENTS,
    MigratePhase.TESTS_UNIT,
    MigratePhase.TESTS_UI,
];
export const VERIFICATION_PHASES = [
    MigratePhase.VERIFY_TSC,
    MigratePhase.FIX_TSC,
    MigratePhase.VERIFY_TESTS,
    MigratePhase.FIX_TESTS,
    MigratePhase.INTEGRATE,
    MigratePhase.REVIEW,
];
// ─── Phase Status ───────────────────────────────────────────────
export const PhaseStatus = {
    PENDING: 'pending',
    GENERATING: 'generating',
    COMPLETED: 'completed',
    FAILED: 'failed',
    SKIPPED: 'skipped',
};
/**
 * Returns the model to use for a given phase.
 * Checks phaseModels first, falls back to config.model.
 */
export const getModelForPhase = (config, phase) => config.phaseModels?.[phase] ?? config.model;
/**
 * Default phase model recommendations:
 * - Opus: analyze, store, page, review (complex reasoning)
 * - Sonnet: types, api, tests-unit, tests-ui, fix-tsc, fix-tests (structural)
 */
export const DEFAULT_PHASE_MODELS = {
    [MigratePhase.ANALYZE]: 'sonnet',
    [MigratePhase.TYPES]: 'haiku',
    [MigratePhase.STORE]: 'sonnet',
    [MigratePhase.API]: 'haiku',
    [MigratePhase.PAGE]: 'sonnet',
    [MigratePhase.TESTS_UNIT]: 'sonnet',
    [MigratePhase.TESTS_UI]: 'sonnet',
    [MigratePhase.FIX_TSC]: 'sonnet',
    [MigratePhase.FIX_TESTS]: 'sonnet',
    [MigratePhase.REVIEW]: 'sonnet',
};
// ─── Events ─────────────────────────────────────────────────────
export const MigrateEventType = {
    MIGRATION_STARTED: 'migration_started',
    MIGRATION_COMPLETED: 'migration_completed',
    PROGRAM_STARTED: 'program_started',
    PROGRAM_COMPLETED: 'program_completed',
    PROGRAM_FAILED: 'program_failed',
    PHASE_STARTED: 'phase_started',
    PHASE_COMPLETED: 'phase_completed',
    PHASE_FAILED: 'phase_failed',
    VERIFY_PASS: 'verify_pass',
    FIX_APPLIED: 'fix_applied',
    GIT_STARTED: 'git_started',
    GIT_COMPLETED: 'git_completed',
    GIT_FAILED: 'git_failed',
    PARALLEL_RESOLVED: 'parallel_resolved',
    ERROR: 'error',
};
//# sourceMappingURL=migrate-types.js.map