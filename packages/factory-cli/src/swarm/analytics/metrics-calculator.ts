/**
 * Metrics Calculator - Calculate analytics metrics from SWARM sessions
 *
 * Analyzes session data to extract performance metrics, trends, and patterns
 */

import type {
  SessionMetrics,
  AgentMetrics,
  ComplexityDistribution,
  ConsensusTrend,
  TopEscalation,
  AgentRole,
} from '../types.js';
import type { SwarmSQLiteStore } from '../storage/sqlite-store.js';

/**
 * Metrics Calculator
 */
export class MetricsCalculator {
  private readonly store: SwarmSQLiteStore;

  constructor(store: SwarmSQLiteStore) {
    this.store = store;
  }

  /**
   * Calculate session metrics
   *
   * @param from - Start date (optional)
   * @param to - End date (optional)
   * @returns Session metrics
   */
  calculateSessionMetrics(from?: Date, to?: Date): SessionMetrics {
    return this.store.getSessionMetrics(from, to);
  }

  /**
   * Calculate agent performance metrics
   *
   * @param from - Start date (optional)
   * @param to - End date (optional)
   * @returns Agent metrics array
   */
  calculateAgentMetrics(from?: Date, to?: Date): AgentMetrics[] {
    return this.store.getAgentMetrics(from, to);
  }

  /**
   * Get complexity distribution
   *
   * @param from - Start date (optional)
   * @param to - End date (optional)
   * @returns Complexity distribution
   */
  getComplexityDistribution(from?: Date, to?: Date): ComplexityDistribution {
    return this.store.getComplexityDistribution(from, to);
  }

  /**
   * Analyze consensus trends by round
   *
   * @param from - Start date (optional)
   * @param to - End date (optional)
   * @returns Consensus trends array
   */
  analyzeConsensusTrends(from?: Date, to?: Date): ConsensusTrend[] {
    return this.store.getConsensusTrends(from, to);
  }

  /**
   * Get top escalations
   *
   * @param limit - Maximum number of escalations
   * @param from - Start date (optional)
   * @param to - End date (optional)
   * @returns Top escalations array
   */
  getTopEscalations(limit: number, from?: Date, to?: Date): TopEscalation[] {
    return this.store.getTopEscalations(limit, from, to);
  }

  /**
   * Identify patterns in agent behavior
   *
   * @param agentMetrics - Agent metrics to analyze
   * @returns Identified patterns
   */
  identifyPatterns(agentMetrics: AgentMetrics[]): {
    vetoAgents: AgentRole[];
    lowConfidenceAgents: AgentRole[];
  } {
    // Agents with frequent vetos (>= 3)
    const vetoAgents = agentMetrics
      .filter((m) => m.vetoCount >= 3)
      .map((m) => m.agent);

    // Agents with low confidence (< 60%)
    const lowConfidenceAgents = agentMetrics
      .filter((m) => m.avgConfidence < 60)
      .map((m) => m.agent);

    return {
      vetoAgents,
      lowConfidenceAgents,
    };
  }
}
