/**
 * Core types for the Migration Factory.
 * Technology-agnostic interfaces shared across all modules.
 */

// ─── Program Graph ───────────────────────────────────────────────

export interface Program {
  id: string | number;
  name: string;
  complexity: Complexity;
  level: number;
  callers: (string | number)[];
  callees: (string | number)[];
  source: ProgramSource;
  domain: string;
}

export const Complexity = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
} as const;
export type Complexity = (typeof Complexity)[keyof typeof Complexity];

export const ProgramSource = {
  SEED: 'seed',
  ECF: 'ecf',
  BFS: 'bfs',
  MANUAL: 'manual',
} as const;
export type ProgramSource = (typeof ProgramSource)[keyof typeof ProgramSource];

export interface ProgramGraph {
  generated: string;
  method: string;
  totalPrograms: number;
  liveCount: number;
  orphanCount: number;
  seeds: (string | number)[];
  sharedPrograms: (string | number)[];
  programs: Program[];
  orphans: OrphanProgram[];
}

export interface OrphanProgram {
  id: string | number;
  name: string;
  reason: string;
}

// ─── Dependency Graph ────────────────────────────────────────────

export interface DependencyGraph {
  generated: string;
  levels: Record<string, (string | number)[]>;
  maxLevel: number;
  programsByLevel: Record<string, number>;
}

// ─── SCC (Strongly Connected Component) ──────────────────────────

export interface SCC {
  index: number;
  members: (string | number)[];
  level: number;
}

// ─── Migration Contract ──────────────────────────────────────────

export interface MigrationContract {
  program: ContractProgram;
  rules: ContractRule[];
  variables: ContractVariable[];
  tables: ContractTable[];
  callees: ContractCallee[];
  overall: ContractOverall;
}

export interface ContractProgram {
  id: string | number;
  name: string;
  complexity: Complexity;
  callers: (string | number)[];
  callees: (string | number)[];
  tasksCount: number;
  tablesCount: number;
  expressionsCount: number;
}

export const ItemStatus = {
  IMPL: 'IMPL',
  PARTIAL: 'PARTIAL',
  MISSING: 'MISSING',
  NA: 'N/A',
} as const;
export type ItemStatus = (typeof ItemStatus)[keyof typeof ItemStatus];

export interface ContractRule {
  id: string;
  description: string;
  condition: string;
  variables: string[];
  status: ItemStatus;
  targetFile: string;
  gapNotes: string;
}

export interface ContractVariable {
  localId: string;
  name: string;
  type: 'Parameter' | 'Virtual' | 'Real';
  status: ItemStatus;
  targetFile: string;
  gapNotes: string;
}

export interface ContractTable {
  id: string | number;
  name: string;
  mode: 'R' | 'W' | 'RW';
  status: ItemStatus;
  targetFile: string;
  gapNotes: string;
}

export interface ContractCallee {
  id: string | number;
  name: string;
  calls: number;
  context: string;
  status: ItemStatus;
  target: string;
  gapNotes: string;
}

export interface ContractOverall {
  rulesTotal: number;
  rulesImpl: number;
  rulesPartial: number;
  rulesMissing: number;
  rulesNa: number;
  variablesKeyCount: number;
  calleesTotal: number;
  calleesImpl: number;
  calleesMissing: number;
  coveragePct: number;
  status: PipelineStatus;
  generated: string;
  notes: string;
  effort?: ContractEffort;
}

// ─── Pipeline Status ─────────────────────────────────────────────

export const PipelineStatus = {
  PENDING: 'pending',
  CONTRACTED: 'contracted',
  ENRICHED: 'enriched',
  VERIFIED: 'verified',
} as const;
export type PipelineStatus = (typeof PipelineStatus)[keyof typeof PipelineStatus];

// ─── Tracker ─────────────────────────────────────────────────────

export interface TrackerCalibration {
  hoursPerPoint: number;
  dataPoints: number;
  calibratedAt: string;
  accuracy: number;
}

export interface Tracker {
  version: string;
  methodology: string;
  created: string;
  updated: string;
  status: string;
  stats: TrackerStats;
  batches: Batch[];
  notes: string[];
  calibration?: TrackerCalibration;
}

export interface TrackerStats {
  totalPrograms: number;
  livePrograms: number;
  orphanPrograms: number;
  sharedPrograms: number;
  contracted: number;
  enriched: number;
  verified: number;
  maxLevel: number;
  lastComputed: string;
}

export interface Batch {
  id: string;
  name: string;
  root: string | number;
  programs: number;
  status: PipelineStatus;
  contractedDate?: string;
  enrichedDate?: string;
  verifiedDate?: string;
  stats: BatchStats;
  priorityOrder: (string | number)[];
}

export interface BatchStats {
  backendNa: number;
  frontendEnrich: number;
  fullyImpl: number;
  coverageAvgFrontend: number;
  totalPartial: number;
  totalMissing: number;
}

// ─── Module (Deliverable Subtree) ────────────────────────────────

export interface DeliverableModule {
  root: string | number;
  rootName: string;
  members: (string | number)[];
  memberCount: number;
  verified: number;
  enriched: number;
  contracted: number;
  pending: number;
  readinessPct: number;
  deliverable: boolean;
  blockers: ModuleBlocker[];
  sccUnits: SCC[];
}

export interface ModuleBlocker {
  programId: string | number;
  programName: string;
  currentStatus: PipelineStatus;
  reason: string;
}

// ─── Batch Plan (auto-suggested) ─────────────────────────────────

export interface BatchPlan {
  suggestedBatches: SuggestedBatch[];
  totalPrograms: number;
  totalBatches: number;
}

export interface SuggestedBatch {
  id: string;
  name: string;
  root: string | number;
  members: (string | number)[];
  memberCount: number;
  level: number;
  domain: string;
  estimatedComplexity: Complexity;
}

// ─── Adapter Interface ───────────────────────────────────────────

export interface SpecExtractor {
  name: string;
  extractProgramGraph(): Promise<ProgramGraph>;
  extractSpec(programId: string | number): Promise<MigrationContract | null>;
  getSharedPrograms(): Promise<(string | number)[]>;
}

// ─── Readiness Report ────────────────────────────────────────────

export interface ReadinessReport {
  deliverable: DeliverableModule[];
  close: DeliverableModule[];
  inProgress: DeliverableModule[];
  notStarted: DeliverableModule[];
  global: GlobalReadiness;
}

export interface GlobalReadiness {
  totalLive: number;
  contracted: number;
  enriched: number;
  verified: number;
  modulesDeliverable: number;
  modulesTotal: number;
}

// ─── Decommission ───────────────────────────────────────────────

export interface DecommissionResult {
  decommissionable: DecommissionableProgram[];
  blocked: BlockedProgram[];
  stats: DecommissionStats;
}

export interface DecommissionableProgram {
  id: string | number;
  name: string;
  level: number;
  reason: string;
}

export interface BlockedProgram {
  id: string | number;
  name: string;
  level: number;
  status: PipelineStatus;
  blockingCallers: (string | number)[];
  reason: string;
}

export interface DecommissionStats {
  totalLive: number;
  decommissionable: number;
  decommissionPct: number;
  blockedByStatus: number;
  blockedByCallers: number;
  sharedBlocked: number;
}

// ─── Module Priority ────────────────────────────────────────────

export interface ModuleDependency {
  moduleRoot: string | number;
  dependsOn: string | number;
  sharedPrograms: (string | number)[];
}

export interface ModuleSCC {
  index: number;
  moduleRoots: (string | number)[];
}

export interface MigrationWave {
  wave: number;
  modules: (string | number)[];
  blockedBy: number[];
  estimatedComplexity: Complexity;
}

export interface PrioritizedModule {
  root: string | number;
  rootName: string;
  rank: number;
  priorityScore: number;
  moduleLevel: number;
  unblockingPower: number;
  dependsOn: (string | number)[];
  dependedBy: (string | number)[];
  implementationOrder: (string | number)[];
  readinessPct: number;
  memberCount: number;
}

export interface ModulePriorityResult {
  prioritizedModules: PrioritizedModule[];
  moduleDependencies: ModuleDependency[];
  moduleSCCs: ModuleSCC[];
  migrationSequence: MigrationWave[];
}

export interface PriorityWeights {
  foundation: number;
  unblocking: number;
  readiness: number;
}

// ─── Multi-Project Report ───────────────────────────────────────

export interface MultiProjectReport {
  generated: string;
  global: GlobalSummary;
  projects: ProjectEntry[];
}

export interface GlobalSummary {
  totalProjects: number;
  activeProjects: number;
  totalLivePrograms: number;
  totalVerified: number;
  totalEnriched: number;
  totalContracted: number;
  totalPending: number;
  overallProgressPct: number;
}

export const ProjectStatus = {
  ACTIVE: 'active',
  PLANNED: 'planned',
  NOT_STARTED: 'not-started',
} as const;
export type ProjectStatus = (typeof ProjectStatus)[keyof typeof ProjectStatus];

export interface ProjectEntry {
  name: string;
  status: ProjectStatus;
  programCount: number;
  description: string;
  report: FullMigrationReport | null;
}

export interface ProjectRegistryEntry {
  name: string;
  programs: number;
  description: string;
}

// ─── Full Report (for HTML dashboard) ───────────────────────────

export interface FullMigrationReport {
  generated: string;
  projectName: string;
  graph: {
    totalPrograms: number;
    livePrograms: number;
    orphanPrograms: number;
    sharedPrograms: number;
    maxLevel: number;
    sccCount: number;
  };
  pipeline: {
    pending: number;
    contracted: number;
    enriched: number;
    verified: number;
  };
  modules: {
    total: number;
    deliverable: number;
    close: number;
    inProgress: number;
    notStarted: number;
    list: ModuleSummary[];
  };
  decommission: DecommissionStats;
  batches: BatchSummary[];
  programs: ProgramSummary[];
  priority?: {
    moduleDependencies: ModuleDependency[];
    migrationSequence: MigrationWave[];
    moduleSCCs: ModuleSCC[];
  };
  estimation?: {
    totalEstimatedHours: number;
    remainingHours: number;
    avgScore: number;
    gradeDistribution: Record<string, number>;
    top10: ProgramEstimation[];
  };
}

export interface ModuleSummary {
  root: string | number;
  rootName: string;
  memberCount: number;
  readinessPct: number;
  verified: number;
  enriched: number;
  contracted: number;
  pending: number;
  deliverable: boolean;
  blockerIds: (string | number)[];
  rank?: number;
  priorityScore?: number;
  dependsOn?: (string | number)[];
  dependedBy?: (string | number)[];
  moduleLevel?: number;
  implementationOrder?: (string | number)[];
}

export interface BatchSummary {
  id: string;
  name: string;
  programs: number;
  status: PipelineStatus;
  coveragePct: number;
}

export interface ProgramSummary {
  id: string | number;
  name: string;
  level: number;
  status: PipelineStatus;
  decommissionable: boolean;
  shared: boolean;
  domain: string;
  complexityScore?: number;
  complexityGrade?: ComplexityGrade;
  estimatedHours?: number;
}

// ─── Complexity Estimation ──────────────────────────────────────

export interface ComplexityFactors {
  structural: number;
  dataAccess: number;
  integration: number;
  depth: number;
  uiComplexity: number;
}

export const ComplexityGrade = {
  S: 'S',
  A: 'A',
  B: 'B',
  C: 'C',
  D: 'D',
} as const;
export type ComplexityGrade = (typeof ComplexityGrade)[keyof typeof ComplexityGrade];

export interface ComplexityScore {
  factors: ComplexityFactors;
  rawScore: number;
  normalizedScore: number;
  grade: ComplexityGrade;
  estimatedHours: number;
  confidence: 'high' | 'medium' | 'low';
}

export interface EstimationConfig {
  weights: {
    structural: number;
    dataAccess: number;
    integration: number;
    depth: number;
    uiComplexity: number;
  };
  hoursPerPoint: number;
  calibrationSource?: string;
}

export interface ProgramEstimation {
  id: string | number;
  name: string;
  score: ComplexityScore;
  status: PipelineStatus;
}

export interface ProjectEstimation {
  programs: ProgramEstimation[];
  totalEstimatedHours: number;
  avgComplexityScore: number;
  gradeDistribution: Record<string, number>;
  calibration: EstimationConfig;
}

// ─── Contract Effort Tracking ───────────────────────────────────

export interface ContractEffort {
  contractedAt?: string;
  enrichedAt?: string;
  verifiedAt?: string;
  estimatedHours?: number;
  actualHours?: number;
}

// ─── Enrichment Mode (v4) ───────────────────────────────────────

export const EnrichmentMode = {
  MANUAL: 'manual',
  CLAUDE: 'claude',
} as const;
export type EnrichmentMode = (typeof EnrichmentMode)[keyof typeof EnrichmentMode];

export interface EnrichmentStats {
  tokensUsed: { input: number; output: number };
  itemsProcessed: number;
  itemsResolved: number;
  model: string;
  costEstimate: number;
}

// ─── Pipeline Orchestrator (v3) ─────────────────────────────────

export const PipelineEventType = {
  PIPELINE_STARTED: 'pipeline_started',
  PIPELINE_COMPLETED: 'pipeline_completed',
  PROGRAM_CONTRACTED: 'program_contracted',
  PROGRAM_SPEC_MISSING: 'program_spec_missing',
  PROGRAM_NEEDS_ENRICHMENT: 'program_needs_enrichment',
  PROGRAM_AUTO_ENRICHED: 'program_auto_enriched',
  PROGRAM_CLAUDE_ENRICHED: 'program_claude_enriched',
  PROGRAM_VERIFIED: 'program_verified',
  PROGRAM_VERIFY_FAILED: 'program_verify_failed',
  BATCH_UPDATED: 'batch_updated',
  TRACKER_SYNCED: 'tracker_synced',
  ERROR: 'error',
} as const;
export type PipelineEventType = (typeof PipelineEventType)[keyof typeof PipelineEventType];

export interface PipelineEvent {
  type: PipelineEventType;
  timestamp: string;
  batchId?: string;
  programId?: string | number;
  message: string;
  data?: Record<string, unknown>;
}

export const PipelineAction = {
  CONTRACTED: 'contracted',
  NEEDS_ENRICHMENT: 'needs-enrichment',
  AUTO_ENRICHED: 'auto-enriched',
  CLAUDE_ENRICHED: 'claude-enriched',
  VERIFIED: 'verified',
  VERIFY_FAILED: 'verify-failed',
  SKIPPED: 'skipped',
  ALREADY_DONE: 'already-done',
  SPEC_MISSING: 'spec-missing',
  ERROR: 'error',
} as const;
export type PipelineAction = (typeof PipelineAction)[keyof typeof PipelineAction];

export interface PipelineStepResult {
  programId: string | number;
  programName: string;
  action: PipelineAction;
  previousStatus: PipelineStatus;
  newStatus: PipelineStatus;
  coveragePct: number;
  gaps: number;
  message: string;
}

export interface PipelineRunResult {
  batchId: string;
  batchName: string;
  started: string;
  completed: string;
  dryRun: boolean;
  steps: PipelineStepResult[];
  summary: {
    total: number;
    contracted: number;
    needsEnrichment: number;
    autoEnriched: number;
    claudeEnriched: number;
    verified: number;
    verifyFailed: number;
    specsMissing: number;
    alreadyDone: number;
    errors: number;
  };
  events: PipelineEvent[];
}

export interface PreflightCheck {
  check: string;
  passed: boolean;
  message: string;
}

export interface PreflightProgram {
  id: string | number;
  name: string;
  currentStatus: PipelineStatus;
  specExists: boolean;
  contractExists: boolean;
  action: string;
  gaps: number;
  blockedBy?: string;
}

export interface PreflightResult {
  batchId: string;
  batchName: string;
  programs: PreflightProgram[];
  checks: PreflightCheck[];
  summary: {
    ready: number;
    blocked: number;
    willContract: number;
    willVerify: number;
    needsEnrichment: number;
    alreadyDone: number;
  };
}

export interface BatchStatusView {
  id: string;
  name: string;
  programCount: number;
  status: PipelineStatus;
  pending: number;
  contracted: number;
  enriched: number;
  verified: number;
  coverageAvg: number;
  estimatedHours: number;
  lastActivity?: string;
}

export interface PipelineConfig {
  projectDir: string;
  migrationDir: string;
  specDir: string;
  codebaseDir: string;
  contractSubDir: string;
  trackerFile: string;
  autoContract: boolean;
  autoVerify: boolean;
  dryRun: boolean;
  generateReport: boolean;
  enrichmentMode: EnrichmentMode;
  claudeModel?: string;
  onEvent?: (event: PipelineEvent) => void;
}
