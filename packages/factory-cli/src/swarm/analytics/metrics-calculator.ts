/**
 * Metrics Calculator - Phase 3 J1
 *
 * Calculates metrics from SWARM sessions stored in SQLite
 */

import type { SwarmSQLiteStore } from '../storage/sqlite-store.js';
import type {
  SessionMetrics,
  AgentMetrics,
  ComplexityDistribution,
  ConsensusTrend,
  PatternAnalysis,
} from './types.js';
import type { AgentRole } from '../types.js';

export class MetricsCalculator {
  private store: SwarmSQLiteStore;

  constructor(store: SwarmSQLiteStore) {
    this.store = store;
  }

  /**
   * Calculate session metrics (aggregated)
   */
  calculateSessionMetrics(from?: Date, to?: Date): SessionMetrics {
    const db = (this.store as any).db;

    // Build query with optional time filter
    let whereClause = '';
    const params: string[] = [];

    if (from && to) {
      whereClause = ' WHERE started_at >= ? AND started_at <= ?';
      params.push(from.toISOString(), to.toISOString());
    }

    // Get session counts
    const countQuery = `
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'FAILED' THEN 1 ELSE 0 END) as failed,
        SUM(CASE WHEN status = 'ESCALATED' THEN 1 ELSE 0 END) as escalated,
        AVG(final_consensus_score) as avgScore,
        AVG(duration_ms) as avgDuration,
        SUM(total_tokens_cost) as totalCost
      FROM swarm_sessions
      ${whereClause}
    `;

    const result = db.prepare(countQuery).get(...params);

    if (!result || result.total === 0) {
      return {
        totalSessions: 0,
        completedSessions: 0,
        failedSessions: 0,
        escalatedSessions: 0,
        avgConsensusScore: 0,
        avgDurationMs: 0,
        totalTokensCost: 0,
        consensusPassRate: 0,
      };
    }

    const totalSessions = result.total || 0;
    const completedSessions = result.completed || 0;
    const consensusPassRate =
      totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

    return {
      totalSessions,
      completedSessions,
      failedSessions: result.failed || 0,
      escalatedSessions: result.escalated || 0,
      avgConsensusScore: result.avgScore || 0,
      avgDurationMs: result.avgDuration || 0,
      totalTokensCost: result.totalCost || 0,
      consensusPassRate,
    };
  }

  /**
   * Calculate agent performance metrics
   */
  calculateAgentMetrics(): AgentMetrics[] {
    const db = (this.store as any).db;

    const query = `
      SELECT
        agent,
        COUNT(*) as totalVotes,
        SUM(CASE WHEN vote IN ('APPROVE', 'APPROVE_WITH_CONCERNS') THEN 1 ELSE 0 END) as approveVotes,
        SUM(CASE WHEN vote IN ('REJECT', 'REJECT_WITH_SUGGESTIONS') THEN 1 ELSE 0 END) as rejectVotes,
        AVG(confidence) as avgConfidence
      FROM agent_votes
      GROUP BY agent
    `;

    const results = db.prepare(query).all();

    // Calculate veto counts (BLOCKER concerns)
    const vetoQuery = `
      SELECT
        agent,
        COUNT(*) as vetoCount
      FROM agent_votes
      WHERE concerns IS NOT NULL
        AND json_extract(concerns, '$[0].severity') = 'BLOCKER'
      GROUP BY agent
    `;

    const vetoResults = db.prepare(vetoQuery).all();
    const vetoMap = new Map<string, number>();
    for (const row of vetoResults) {
      vetoMap.set(row.agent, row.vetoCount);
    }

    // Map results to AgentMetrics
    return results.map(
      (row: any): AgentMetrics => ({
        agent: row.agent as AgentRole,
        totalVotes: row.totalVotes,
        approveVotes: row.approveVotes,
        rejectVotes: row.rejectVotes,
        avgConfidence: row.avgConfidence,
        vetoCount: vetoMap.get(row.agent) || 0,
        blockerConcernsRaised: vetoMap.get(row.agent) || 0,
      }),
    );
  }

  /**
   * Get complexity distribution from sessions
   */
  getComplexityDistribution(): ComplexityDistribution {
    const db = (this.store as any).db;

    const query = `
      SELECT
        json_extract(complexity_data, '$.level') as level,
        COUNT(*) as count
      FROM session_complexity
      GROUP BY level
    `;

    const results = db.prepare(query).all();

    const distribution: ComplexityDistribution = {
      simple: 0,
      medium: 0,
      complex: 0,
      critical: 0,
    };

    for (const row of results) {
      const level = row.level?.toUpperCase();
      const count = row.count;

      if (level === 'SIMPLE') distribution.simple = count;
      else if (level === 'MEDIUM') distribution.medium = count;
      else if (level === 'COMPLEX') distribution.complex = count;
      else if (level === 'CRITICAL') distribution.critical = count;
    }

    return distribution;
  }

  /**
   * Analyze consensus trends by round
   */
  analyzeConsensusTrends(): ConsensusTrend[] {
    const db = (this.store as any).db;

    const query = `
      SELECT
        round_number,
        AVG(consensus_score) as avgScore,
        COUNT(*) as totalRounds,
        SUM(CASE WHEN passed = 1 THEN 1 ELSE 0 END) as passedRounds
      FROM round_scores
      GROUP BY round_number
      ORDER BY round_number ASC
    `;

    const results = db.prepare(query).all();

    return results.map(
      (row: any): ConsensusTrend => ({
        roundNumber: row.round_number,
        avgScore: row.avgScore,
        passRate: row.totalRounds > 0 ? (row.passedRounds / row.totalRounds) * 100 : 0,
      }),
    );
  }

  /**
   * Identify patterns in agent metrics
   */
  identifyPatterns(agentMetrics: AgentMetrics[]): PatternAnalysis {
    const vetoAgents: AgentRole[] = [];
    const lowConfidenceAgents: AgentRole[] = [];

    for (const metrics of agentMetrics) {
      // Frequent veto: >= 3 vetos
      if (metrics.vetoCount >= 3) {
        vetoAgents.push(metrics.agent);
      }

      // Low confidence: < 60%
      if (metrics.avgConfidence < 60) {
        lowConfidenceAgents.push(metrics.agent);
      }
    }

    return {
      vetoAgents,
      lowConfidenceAgents,
    };
  }
}
