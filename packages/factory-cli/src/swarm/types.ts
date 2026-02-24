/**
 * SWARM System - Core Types and Interfaces
 *
 * Multi-agent collaborative migration system with consensus voting
 */

// ============================================================================
// Agent Types
// ============================================================================

/**
 * SWARM agent roles with specialized responsibilities
 */
export const AgentRoles = {
  ARCHITECT: 'architect',
  ANALYST: 'analyst',
  DEVELOPER: 'developer',
  TESTER: 'tester',
  REVIEWER: 'reviewer',
  DOCUMENTOR: 'documentor',
} as const;

export type AgentRole = (typeof AgentRoles)[keyof typeof AgentRoles];

/**
 * Agent voting weights (higher = more influence on consensus)
 */
export const AgentWeights: Record<AgentRole, number> = {
  [AgentRoles.ARCHITECT]: 2.0, // Strategic decisions critical
  [AgentRoles.ANALYST]: 2.0, // Correctness non-negotiable
  [AgentRoles.DEVELOPER]: 1.0, // Standard weight
  [AgentRoles.TESTER]: 1.5, // Quality gate
  [AgentRoles.REVIEWER]: 1.5, // Blocking issues (security/performance)
  [AgentRoles.DOCUMENTOR]: 0.5, // Non-blocking but important
};

/**
 * Vote values representing approval levels
 */
export const VoteValues = {
  APPROVE: 'APPROVE', // 100% - solution is excellent
  APPROVE_WITH_CONCERNS: 'APPROVE_WITH_CONCERNS', // 75% - good with minor issues
  NEUTRAL: 'NEUTRAL', // 50% - no strong opinion
  REJECT_WITH_SUGGESTIONS: 'REJECT_WITH_SUGGESTIONS', // 25% - significant concerns
  REJECT: 'REJECT', // 0% - critical flaws
} as const;

export type VoteValue = (typeof VoteValues)[keyof typeof VoteValues];

/**
 * Numeric value for each vote type (0.0 - 1.0)
 */
export const VoteNumericValues: Record<VoteValue, number> = {
  [VoteValues.APPROVE]: 1.0,
  [VoteValues.APPROVE_WITH_CONCERNS]: 0.75,
  [VoteValues.NEUTRAL]: 0.5,
  [VoteValues.REJECT_WITH_SUGGESTIONS]: 0.25,
  [VoteValues.REJECT]: 0.0,
};

/**
 * Concern severity levels
 */
export const ConcernSeverity = {
  BLOCKER: 'BLOCKER', // Must fix before approval
  MAJOR: 'MAJOR', // Should fix, but not blocking
  MINOR: 'MINOR', // Nice to fix, non-critical
} as const;

export type ConcernSeverityLevel =
  (typeof ConcernSeverity)[keyof typeof ConcernSeverity];

// ============================================================================
// Vote Structures
// ============================================================================

/**
 * A concern raised by an agent during voting
 */
export interface AgentConcern {
  /** What is the concern */
  concern: string;
  /** How severe is it */
  severity: ConcernSeverityLevel;
  /** How to address it */
  suggestion: string;
}

/**
 * A single agent's vote on a proposal
 */
export interface AgentVote {
  /** Agent role */
  agent: AgentRole;
  /** Vote value */
  vote: VoteValue;
  /** Confidence level (0-100%) */
  confidence: number;
  /** Agent weight (from AgentWeights) */
  weight: number;
  /** Justification with evidence */
  justification: string;
  /** Specific concerns (if any) */
  concerns: AgentConcern[];
  /** Actionable suggestions */
  suggestions: string[];
  /** Timestamp of vote */
  timestamp: Date;
}

/**
 * Analysis output from an agent
 */
export interface AgentAnalysis {
  /** Agent role */
  agent: AgentRole;
  /** Analysis content (YAML format as per agent prompts) */
  analysis: Record<string, unknown>;
  /** Proposal from agent */
  proposal: Record<string, unknown>;
  /** Duration of analysis (ms) */
  duration: number;
  /** Token usage */
  tokens?: {
    input: number;
    output: number;
    cost: number;
  };
}

// ============================================================================
// Consensus System
// ============================================================================

/**
 * Consensus thresholds
 */
export const ConsensusThresholds = {
  STANDARD: 70, // Standard programs (70%)
  CRITICAL: 80, // Critical programs (80% - payment, security, etc.)
} as const;

/**
 * Consensus calculation result
 */
export interface ConsensusResult {
  /** Overall consensus score (0-100%) */
  score: number;
  /** Did it pass the threshold? */
  passed: boolean;
  /** Required threshold */
  threshold: number;
  /** Individual vote results */
  votes: AgentVote[];
  /** Summary of concerns by severity */
  concernsSummary: {
    blocker: number;
    major: number;
    minor: number;
  };
  /** Recommendation */
  recommendation: 'PROCEED' | 'REVISE' | 'REJECT';
  /** Calculation timestamp */
  timestamp: Date;
}

// ============================================================================
// Complexity Calculation
// ============================================================================

/**
 * Complexity indicators for triggering SWARM
 */
export interface ComplexityIndicators {
  /** Number of expressions */
  expressionCount: number;
  /** Number of tables accessed */
  tableCount: number;
  /** Maximum nesting depth */
  nestingDepth: number;
  /** Has business logic (calculations, validations) */
  hasBusinessLogic: boolean;
  /** Has state management */
  hasStateManagement: boolean;
  /** Is business critical (payment, security, legal) */
  isCritical: boolean;
  /** Has external integrations */
  hasExternalIntegrations: boolean;
}

/**
 * Complexity score and SWARM recommendation
 */
export interface ComplexityScore {
  /** Total complexity score (0-100) */
  score: number;
  /** Complexity level */
  level: 'SIMPLE' | 'MEDIUM' | 'COMPLEX' | 'CRITICAL';
  /** Should use SWARM? */
  useSwarm: boolean;
  /** Is critical (requires double vote)? */
  requiresDoubleVote: boolean;
  /** Indicators breakdown */
  indicators: ComplexityIndicators;
  /** Explanation of score */
  explanation: string;
}

// ============================================================================
// SWARM Session
// ============================================================================

/**
 * Double vote system for critical programs
 */
export interface DoubleVoteSession {
  /** First vote round */
  firstVote: ConsensusResult;
  /** Implementation after first vote */
  implementationAfterFirstVote: string;
  /** Second vote round (after seeing implementation) */
  secondVote: ConsensusResult;
  /** Final approval */
  approved: boolean;
}

/**
 * SWARM migration session
 */
export interface SwarmSession {
  /** Session ID */
  id: string;
  /** Program being migrated */
  programId: number;
  /** Program name */
  programName: string;
  /** Complexity score */
  complexity: ComplexityScore;
  /** Agent analyses */
  analyses: AgentAnalysis[];
  /** Agent votes */
  votes: AgentVote[];
  /** Consensus result */
  consensus: ConsensusResult;
  /** Double vote session (if critical) */
  doubleVote?: DoubleVoteSession;
  /** Session start time */
  startedAt: Date;
  /** Session end time */
  completedAt?: Date;
  /** Total duration (ms) */
  duration?: number;
  /** Output files generated */
  outputFiles: string[];
  /** Final status */
  status: 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'TO_REVIEW' | 'ESCALATED';
  /** Current phase (for DB storage) */
  current_phase?: 'complexity' | 'analysis' | 'voting' | 'consensus' | 'double_vote' | 'completed';
  /** Config snapshot (for DB storage) */
  config_snapshot?: Record<string, unknown>;
  /** Total agents used (for DB storage) */
  total_agents_used?: number;
}

// ============================================================================
// Configuration
// ============================================================================

/**
 * SWARM system configuration
 */
export interface SwarmConfig {
  /** Enable SWARM system */
  enabled: boolean;
  /** Complexity threshold for automatic SWARM activation */
  complexityThreshold: number;
  /** Consensus threshold for standard programs */
  consensusThresholdStandard: number;
  /** Consensus threshold for critical programs */
  consensusThresholdCritical: number;
  /** Enable double vote for critical programs */
  doubleVoteEnabled: boolean;
  /** Model to use for agents */
  model: 'opus' | 'sonnet' | 'haiku';
  /** Max concurrent agent analyses */
  maxConcurrentAgents: number;
  /** Enable vote visualization */
  enableVisualization: boolean;
}

/**
 * Default SWARM configuration
 */
export const DEFAULT_SWARM_CONFIG: SwarmConfig = {
  enabled: false, // Disabled by default - must opt-in
  complexityThreshold: 30, // expressions count
  consensusThresholdStandard: 70,
  consensusThresholdCritical: 80,
  doubleVoteEnabled: true,
  model: 'sonnet', // Balance of quality and cost
  maxConcurrentAgents: 6, // All agents in parallel
  enableVisualization: true,
};
