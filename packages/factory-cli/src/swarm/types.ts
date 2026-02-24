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
 * K2.3: Adaptive timeouts per agent (milliseconds)
 * Lighter agents = shorter timeout, heavier agents = longer timeout
 */
export const AgentTimeouts: Record<AgentRole, number> = {
  [AgentRoles.ARCHITECT]: 45000, // 45s - complex architectural analysis
  [AgentRoles.ANALYST]: 40000, // 40s - thorough correctness review
  [AgentRoles.DEVELOPER]: 30000, // 30s - implementation feasibility
  [AgentRoles.TESTER]: 35000, // 35s - test strategy planning
  [AgentRoles.REVIEWER]: 40000, // 40s - security/performance deep dive
  [AgentRoles.DOCUMENTOR]: 20000, // 20s - lighter documentation review
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
  /** K4: Token usage for cost tracking */
  tokens?: {
    input: number;
    output: number;
    cost: number;
  };
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
  /** Escalation context (if escalated) */
  escalation?: {
    context: EscalationContext;
    report: EscalationReport;
    escalatedAt: Date;
  };
}

// ============================================================================
// Escalation System
// ============================================================================

/**
 * Round score for stagnation detection
 */
export interface RoundScore {
  roundNumber: number;
  consensusScore: number;
  timestamp: Date;
}

/**
 * Context for escalation decision
 */
export interface EscalationContext {
  /** Session ID */
  sessionId: string;
  /** Program ID */
  programId: number;
  /** Program name */
  programName: string;
  /** Reason for escalation */
  reason: 'MAX_ROUNDS' | 'STAGNATION' | 'PERSISTENT_VETO' | 'CRITICAL_CONCERNS';
  /** Number of rounds attempted */
  roundsAttempted: number;
  /** Final consensus score */
  finalConsensusScore: number;
  /** Round history */
  roundHistory: RoundScore[];
  /** BLOCKER concerns */
  blockerConcerns: AgentConcern[];
  /** Stagnation details (if applicable) */
  stagnationDetails?: {
    detected: boolean;
    detectedAtRound?: number;
    stagnantRounds?: number;
    stagnantScore?: number;
    explanation?: string;
  };
  /** Veto details (if applicable) */
  vetoDetails?: {
    triggered: boolean;
    agent?: string;
    reason?: string;
  };
}

/**
 * Escalation report for human review
 */
export interface EscalationReport {
  /** Executive summary */
  summary: string;
  /** Recommended action */
  recommendation: 'HUMAN_REVIEW' | 'SENIOR_AGENT' | 'ARCHITECTURE_CHANGE';
  /** Key issues identified */
  keyIssues: string[];
  /** Divergent views between agents */
  divergentViews: Array<{
    agent: AgentRole;
    view: string;
  }>;
  /** Suggested actions to resolve */
  suggestedActions: string[];
}

// ============================================================================
// Analytics & Reporting
// ============================================================================

/**
 * Session metrics for analytics
 */
export interface SessionMetrics {
  /** Total number of sessions */
  totalSessions: number;
  /** Completed sessions */
  completedSessions: number;
  /** Failed sessions */
  failedSessions: number;
  /** Escalated sessions */
  escalatedSessions: number;
  /** Sessions marked for review */
  toReviewSessions: number;
  /** Average consensus score */
  avgConsensusScore: number;
  /** Average rounds to reach consensus */
  avgRoundsToConsensus: number;
  /** Average duration in milliseconds */
  avgDurationMs: number;
  /** Total tokens cost */
  totalTokensCost: number;
  /** Consensus pass rate (%) */
  consensusPassRate: number;
}

/**
 * Agent performance metrics
 */
export interface AgentMetrics {
  /** Agent role */
  agent: AgentRole;
  /** Total votes cast */
  totalVotes: number;
  /** Approve votes */
  approveVotes: number;
  /** Reject votes */
  rejectVotes: number;
  /** Average confidence level */
  avgConfidence: number;
  /** Number of vetos */
  vetoCount: number;
  /** BLOCKER concerns raised */
  blockerConcernsRaised: number;
}

/**
 * Program complexity distribution
 */
export interface ComplexityDistribution {
  /** Simple programs count */
  simple: number;
  /** Medium programs count */
  medium: number;
  /** Complex programs count */
  complex: number;
  /** Critical programs count */
  critical: number;
}

/**
 * Consensus trend by round
 */
export interface ConsensusTrend {
  /** Round number */
  roundNumber: number;
  /** Average consensus score */
  avgScore: number;
  /** Number of sessions */
  sessionsCount: number;
  /** Pass rate (%) */
  passRate: number;
}

/**
 * Top escalation entry
 */
export interface TopEscalation {
  /** Program ID */
  programId: number;
  /** Program name */
  programName: string;
  /** Escalation reason */
  reason: string;
  /** Rounds attempted */
  roundsAttempted: number;
  /** Final consensus score */
  finalScore: number;
}

/**
 * Complete analytics report
 */
export interface AnalyticsReport {
  /** Report generation timestamp */
  generatedAt: Date;
  /** Time range analyzed */
  timeRange: {
    from: Date;
    to: Date;
  };
  /** Session metrics */
  sessionMetrics: SessionMetrics;
  /** Agent performance */
  agentMetrics: AgentMetrics[];
  /** Complexity distribution */
  complexityDistribution: ComplexityDistribution;
  /** Consensus trends */
  consensusTrends: ConsensusTrend[];
  /** Top escalations */
  topEscalations: TopEscalation[];
}

// ============================================================================
// Errors
// ============================================================================

/**
 * K4: Budget exceeded error
 */
export class BudgetExceededError extends Error {
  constructor(
    message: string,
    public readonly currentCost: number,
    public readonly limit: number,
    public readonly limitType: 'session' | 'daily',
  ) {
    super(message);
    this.name = 'BudgetExceededError';
  }
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
  /** Maximum voting rounds before escalation */
  maxRounds: number;
  /** K4: Enable budget guards */
  enableBudgetGuards?: boolean;
  /** K4: Maximum cost per session in USD (default: $5.00) */
  maxCostPerSession?: number;
  /** K4: Daily budget limit in USD (default: $100.00) */
  dailyBudget?: number;
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
  maxRounds: 10, // Maximum rounds before escalation
  enableBudgetGuards: false, // K4: Disabled by default
  maxCostPerSession: 5.0, // K4: $5 max per session
  dailyBudget: 100.0, // K4: $100 max per day
};
