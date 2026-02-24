/**
 * Analytics Types - Phase 3 J1
 *
 * Types for metrics calculation and reporting
 */

import type { AgentRole } from '../types.js';

/**
 * Session metrics aggregated from database
 */
export interface SessionMetrics {
  /** Total number of sessions */
  totalSessions: number;
  /** Sessions that completed successfully (COMPLETED status) */
  completedSessions: number;
  /** Sessions that failed (FAILED status) */
  failedSessions: number;
  /** Sessions that escalated (ESCALATED status) */
  escalatedSessions: number;
  /** Average consensus score across all sessions */
  avgConsensusScore: number;
  /** Average duration in milliseconds */
  avgDurationMs: number;
  /** Total tokens cost (sum) */
  totalTokensCost: number;
  /** Pass rate: completed / total */
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
  /** Number of APPROVE votes */
  approveVotes: number;
  /** Number of REJECT votes */
  rejectVotes: number;
  /** Average confidence level */
  avgConfidence: number;
  /** Number of vetos (BLOCKER concerns) */
  vetoCount: number;
  /** Number of BLOCKER concerns raised */
  blockerConcernsRaised: number;
}

/**
 * Complexity distribution
 */
export interface ComplexityDistribution {
  /** Number of SIMPLE programs */
  simple: number;
  /** Number of MEDIUM programs */
  medium: number;
  /** Number of COMPLEX programs */
  complex: number;
  /** Number of CRITICAL programs */
  critical: number;
}

/**
 * Consensus trend by round
 */
export interface ConsensusTrend {
  /** Round number */
  roundNumber: number;
  /** Average consensus score for this round */
  avgScore: number;
  /** Pass rate for this round (% of sessions that passed) */
  passRate: number;
}

/**
 * Escalation record
 */
export interface EscalationRecord {
  /** Session ID */
  sessionId: string;
  /** Program ID */
  programId: number;
  /** Program name */
  programName: string;
  /** Final consensus score */
  score: number;
  /** Escalation reason */
  reason: string;
  /** Started at */
  startedAt: Date;
}

/**
 * Pattern analysis result
 */
export interface PatternAnalysis {
  /** Agents with frequent vetos (>= 3) */
  vetoAgents: AgentRole[];
  /** Agents with low confidence (< 60%) */
  lowConfidenceAgents: AgentRole[];
}

/**
 * Complete analytics report
 */
export interface AnalyticsReport {
  /** Generation timestamp */
  generatedAt: Date;
  /** Time range */
  timeRange: {
    from: Date;
    to: Date;
  };
  /** Session metrics */
  sessionMetrics: SessionMetrics;
  /** Agent performance metrics */
  agentMetrics: AgentMetrics[];
  /** Complexity distribution */
  complexityDistribution: ComplexityDistribution;
  /** Consensus trends by round */
  consensusTrends: ConsensusTrend[];
  /** Top escalations (up to 10) */
  topEscalations: EscalationRecord[];
  /** Pattern analysis */
  patterns?: PatternAnalysis;
}
