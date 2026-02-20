/**
 * Core types for the Migration Factory.
 * Technology-agnostic interfaces shared across all modules.
 */
export const Complexity = {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
};
export const ProgramSource = {
    SEED: 'seed',
    ECF: 'ecf',
    BFS: 'bfs',
    MANUAL: 'manual',
};
export const ItemStatus = {
    IMPL: 'IMPL',
    PARTIAL: 'PARTIAL',
    MISSING: 'MISSING',
    NA: 'N/A',
};
// ─── Pipeline Status ─────────────────────────────────────────────
export const PipelineStatus = {
    PENDING: 'pending',
    CONTRACTED: 'contracted',
    ENRICHED: 'enriched',
    VERIFIED: 'verified',
};
export const ProjectStatus = {
    ACTIVE: 'active',
    PLANNED: 'planned',
    NOT_STARTED: 'not-started',
};
export const ComplexityGrade = {
    S: 'S',
    A: 'A',
    B: 'B',
    C: 'C',
    D: 'D',
};
// ─── Enrichment Mode (v4) ───────────────────────────────────────
export const EnrichmentMode = {
    MANUAL: 'manual',
    CLAUDE: 'claude',
};
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
};
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
};
//# sourceMappingURL=types.js.map