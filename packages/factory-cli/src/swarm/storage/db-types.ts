/**
 * Database Row Types - Type-safe SQLite row interfaces
 *
 * Eliminates 'any' types from sqlite-store.ts
 */

/**
 * swarm_sessions table row
 */
export interface SwarmSessionRow {
  id: string;
  program_id: number;
  program_name: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'TO_REVIEW' | 'ESCALATED';
  current_phase: 'complexity' | 'analysis' | 'voting' | 'consensus' | 'double_vote' | 'completed';
  config_snapshot: string; // JSON
  started_at: string; // ISO timestamp
  completed_at: string | null;
  duration_ms: number | null;
  final_consensus_score: number | null;
  final_decision: 'PROCEED' | 'REJECT' | 'TO_REVIEW' | null;
  total_rounds: number;
  total_tokens_cost_usd: number;
  total_agents_used: number;
  escalated: number; // SQLite boolean (0/1)
  escalation_reason: string | null;
  human_decision: string | null;
  human_decision_timestamp: string | null;
  output_files: string | null; // JSON
  created_at: string;
  updated_at: string;
}

/**
 * complexity_assessments table row
 */
export interface ComplexityAssessmentRow {
  id: number;
  session_id: string;
  program_id: number;
  program_name: string;
  score_total: number;
  score_expressions: number;
  score_tables: number;
  score_nesting: number;
  score_flags: number;
  expression_count: number;
  table_count: number;
  nesting_depth: number;
  has_business_logic: number; // SQLite boolean
  has_state_management: number;
  has_external_integrations: number;
  is_critical: number;
  complexity_level: 'SIMPLE' | 'MEDIUM' | 'COMPLEX' | 'CRITICAL';
  use_swarm: number; // SQLite boolean
  requires_double_vote: number;
  explanation: string | null;
  created_at: string;
}

/**
 * agent_analyses table row
 */
export interface AgentAnalysisRow {
  id: number;
  session_id: string;
  round_number: number;
  agent: 'architect' | 'analyst' | 'developer' | 'tester' | 'reviewer' | 'documentor';
  analysis_data: string; // JSON
  proposal_data: string; // JSON
  duration_ms: number;
  tokens_input: number | null;
  tokens_output: number | null;
  tokens_cost_usd: number | null;
  model_used: 'haiku' | 'sonnet' | 'opus' | null;
  created_at: string;
}

/**
 * voting_rounds table row
 */
export interface VotingRoundRow {
  id: number;
  session_id: string;
  round_number: number;
  consensus_score: number;
  consensus_threshold: number;
  consensus_passed: number; // SQLite boolean
  recommendation: 'PROCEED' | 'REVISE' | 'REJECT';
  concerns_blocker: number;
  concerns_major: number;
  concerns_minor: number;
  veto_triggered: number; // SQLite boolean
  veto_agent: string | null;
  veto_reason: string | null;
  stagnation_detected: number; // SQLite boolean
  previous_round_score: number | null;
  score_delta: number | null;
  duration_ms: number;
  total_tokens_cost_usd: number | null;
  created_at: string;
}

/**
 * agent_votes table row
 */
export interface AgentVoteRow {
  id: number;
  round_id: number;
  agent: 'architect' | 'analyst' | 'developer' | 'tester' | 'reviewer' | 'documentor';
  vote_value: 'APPROVE' | 'APPROVE_WITH_CONCERNS' | 'NEUTRAL' | 'REJECT_WITH_SUGGESTIONS' | 'REJECT';
  vote_numeric: number;
  confidence: number;
  weight: number;
  confidence_adjusted: number;
  weighted_score: number;
  justification: string;
  created_at: string;
}

/**
 * vote_concerns table row
 */
export interface VoteConcernRow {
  id: number;
  vote_id: number;
  concern_text: string;
  severity: 'BLOCKER' | 'MAJOR' | 'MINOR';
  suggestion: string;
  category: string | null;
  created_at: string;
}

/**
 * vote_suggestions table row
 */
export interface VoteSuggestionRow {
  id: number;
  vote_id: number;
  suggestion_text: string;
  implemented: number; // SQLite boolean
}

/**
 * consensus_decisions table row
 */
export interface ConsensusDecisionRow {
  id: number;
  session_id: string;
  round_number: number;
  decision: 'PROCEED' | 'REVISE' | 'REJECT' | 'ESCALATE';
  decision_reason: string;
  action_taken: string | null;
  revision_applied: string | null;
  next_round_scheduled: number; // SQLite boolean
  created_at: string;
}

/**
 * double_vote_sessions table row
 */
export interface DoubleVoteSessionRow {
  id: number;
  session_id: string;
  first_vote_round_id: number;
  first_vote_score: number;
  first_vote_passed: number; // SQLite boolean
  implementation_code: string;
  implementation_timestamp: string | null;
  second_vote_round_id: number;
  second_vote_score: number;
  second_vote_passed: number;
  approved: number; // SQLite boolean
  recommendation: 'APPROVED' | 'REJECTED' | 'NEEDS_REVISION';
  final_reason: string;
  created_at: string;
}

/**
 * Helper: Convert SQLite boolean (0/1) to TypeScript boolean
 */
export function sqlBool(value: number): boolean {
  return value === 1;
}

/**
 * Helper: Convert TypeScript boolean to SQLite boolean
 */
export function toSqlBool(value: boolean): number {
  return value ? 1 : 0;
}

/**
 * agent_analyses table row
 */
export interface AgentAnalysisRow {
  id: number;
  session_id: string;
  round_number: number;
  agent: 'architect' | 'analyst' | 'developer' | 'tester' | 'reviewer' | 'documentor';
  analysis_data: string; // JSON
  proposal_data: string; // JSON
  duration_ms: number;
  tokens_input: number | null;
  tokens_output: number | null;
  tokens_cost_usd: number | null;
  model_used: 'haiku' | 'sonnet' | 'opus' | null;
  created_at: string;
}

/**
 * Agent vote with joined concerns and suggestions (for getVotingRound query)
 */
export interface AgentVoteWithDetailsRow extends AgentVoteRow {
  concerns: string | null; // Concatenated: "id:concern:severity:suggestion|||..."
  suggestions: string | null; // Concatenated: "suggestion1|||suggestion2|||..."
}

/**
 * Voting round ID result (for double vote queries)
 */
export interface VotingRoundIdRow {
  id: number;
}

/**
 * Session summary view row (v_session_summary)
 */
export interface SessionSummaryRow {
  id: string;
  program_id: number;
  program_name: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'TO_REVIEW' | 'ESCALATED';
  complexity_level: 'SIMPLE' | 'MEDIUM' | 'COMPLEX' | 'CRITICAL' | null;
  total_rounds: number;
  final_consensus_score: number | null;
  final_decision: 'PROCEED' | 'REJECT' | 'TO_REVIEW' | null;
  started_at: string;
  completed_at: string | null;
  duration_ms: number | null;
  total_tokens_cost_usd: number;
  escalated: number;
  escalation_reason: string | null;
  created_at: string;
}

/**
 * Agent performance view row (v_agent_performance)
 */
export interface AgentPerformanceRow {
  session_id: string;
  agent: 'architect' | 'analyst' | 'developer' | 'tester' | 'reviewer' | 'documentor';
  total_votes: number;
  avg_confidence: number;
  avg_weighted_score: number;
  blocker_concerns: number;
  major_concerns: number;
  minor_concerns: number;
  total_suggestions: number;
}

/**
 * Stagnation pattern view row (v_stagnation_patterns)
 */
export interface StagnationPatternRow {
  session_id: string;
  program_name: string;
  round_number: number;
  consensus_score: number;
  stagnation_detected: number;
  previous_round_score: number | null;
  score_delta: number | null;
  recommendation: 'PROCEED' | 'REVISE' | 'REJECT';
}

/**
 * Cost breakdown view row (v_cost_breakdown)
 */
export interface CostBreakdownRow {
  session_id: string;
  total_cost_usd: number;
  analysis_cost_usd: number;
  voting_cost_usd: number;
  total_analyses: number;
  total_rounds: number;
  avg_cost_per_round: number;
}
