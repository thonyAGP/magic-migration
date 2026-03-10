/**
 * Types for the v10 full module migration pipeline.
 * 18 phases: SPEC → CONTRACT → ANALYZE → TYPES → STORE → API → PAGE → COMPONENTS → TESTS-UNIT → TESTS-UI → VERIFY-TSC → FIX-TSC → VERIFY-TESTS → FIX-TESTS → REMEDIATE → INTEGRATE → REVIEW → REFACTOR
 */

// ─── Phase Names ────────────────────────────────────────────────

export const MigratePhase = {
  SPEC: 'spec',
  CONTRACT: 'contract',
  PARSE: 'parse',
  DATA_MODEL: 'data-model',
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
  REMEDIATE: 'remediate',
  INTEGRATE: 'integrate',
  REVIEW: 'review',
  REFACTOR: 'refactor',
} as const;
export type MigratePhase = (typeof MigratePhase)[keyof typeof MigratePhase];

export const GENERATION_PHASES: MigratePhase[] = [
  MigratePhase.SPEC,
  MigratePhase.CONTRACT,
  MigratePhase.PARSE,
  MigratePhase.DATA_MODEL,
  MigratePhase.ANALYZE,
  MigratePhase.TYPES,
  MigratePhase.STORE,
  MigratePhase.API,
  MigratePhase.PAGE,
  MigratePhase.COMPONENTS,
  MigratePhase.TESTS_UNIT,
  MigratePhase.TESTS_UI,
];

export const VERIFICATION_PHASES: MigratePhase[] = [
  MigratePhase.VERIFY_TSC,
  MigratePhase.FIX_TSC,
  MigratePhase.VERIFY_TESTS,
  MigratePhase.FIX_TESTS,
  MigratePhase.REMEDIATE,
  MigratePhase.INTEGRATE,
  MigratePhase.REVIEW,
  MigratePhase.REFACTOR,
];

// ─── Phase Status ───────────────────────────────────────────────

export const PhaseStatus = {
  PENDING: 'pending',
  GENERATING: 'generating',
  COMPLETED: 'completed',
  FAILED: 'failed',
  SKIPPED: 'skipped',
} as const;
export type PhaseStatus = (typeof PhaseStatus)[keyof typeof PhaseStatus];

// ─── Phase Tracking ─────────────────────────────────────────────

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

// ─── Analysis Document ──────────────────────────────────────────

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

// ─── Migration Config ───────────────────────────────────────────

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
  /** Skip refactoring phase. Default false. */
  skipRefactor?: boolean;
  /** Minimum coverage % target for remediation loop. Default 100. */
  coverageTarget?: number;
  /** Max remediation passes per program. Default 5. */
  maxRemediationPasses?: number;
  /** Current batch status (used by shouldSkipProgram to avoid skipping when batch is not verified). */
  batchStatus?: string;
}

/**
 * Returns the model to use for a given phase.
 * Checks phaseModels first, falls back to config.model.
 */
export const getModelForPhase = (config: MigrateConfig, phase: MigratePhase): string | undefined =>
  config.phaseModels?.[phase] ?? config.model;

/**
 * Default phase model recommendations:
 * - Opus: analyze, store, page, review (complex reasoning)
 * - Sonnet: types, api, tests-unit, tests-ui, fix-tsc, fix-tests (structural)
 */
export const DEFAULT_PHASE_MODELS: Partial<Record<MigratePhase, string>> = {
  [MigratePhase.ANALYZE]: 'sonnet',
  [MigratePhase.TYPES]: 'haiku',
  [MigratePhase.STORE]: 'sonnet',
  [MigratePhase.API]: 'haiku',
  [MigratePhase.PAGE]: 'sonnet',
  [MigratePhase.TESTS_UNIT]: 'sonnet',
  [MigratePhase.TESTS_UI]: 'sonnet',
  [MigratePhase.FIX_TSC]: 'sonnet',
  [MigratePhase.FIX_TESTS]: 'sonnet',
  [MigratePhase.REMEDIATE]: 'sonnet',
  [MigratePhase.REVIEW]: 'sonnet',
  [MigratePhase.REFACTOR]: 'sonnet',
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
  WARNING: 'warning',
  ERROR: 'error',
} as const;
export type MigrateEventType = (typeof MigrateEventType)[keyof typeof MigrateEventType];

export interface MigrateEvent {
  type: MigrateEventType;
  timestamp: string;
  programId?: string | number;
  phase?: MigratePhase;
  message: string;
  data?: Record<string, unknown>;
}

// ─── Results ────────────────────────────────────────────────────

export interface MigrateResult {
  batchId: string;
  batchName: string;
  started: string;
  completed: string;
  dryRun: boolean;
  programs: ProgramMigrateResult[];
  summary: MigrateSummary;
  git?: { commitSha: string; pushed: boolean; branch: string };
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
  tokens?: { input: number; output: number };
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
  totalTokens?: { input: number; output: number };
  estimatedCostUsd?: number;
}

// ─── Review Report ──────────────────────────────────────────────

export interface ReviewReport {
  programId: string | number;
  programName: string;
  coveragePct: number;
  rulesImplemented: number;
  rulesTotal: number;
  missingRules: string[];
  recommendations: string[];
}

// ─── Coverage Report (programmatic checker) ─────────────────────

export interface CoverageItem {
  id: string;
  name: string;
  found: boolean;
  file?: string;
  line?: number;
}

export interface CoverageReport {
  programId: string | number;
  rules: CoverageItem[];
  tables: CoverageItem[];
  variables: CoverageItem[];
  callees: CoverageItem[];
  coveragePct: number;
  gaps: string[];
}
