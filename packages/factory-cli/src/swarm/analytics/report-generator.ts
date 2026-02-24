/**
 * Report Generator - Phase 3 J1
 *
 * Generates analytics reports from metrics
 */

import type { MetricsCalculator } from './metrics-calculator.js';
import type { AnalyticsReport, EscalationRecord } from './types.js';

export class ReportGenerator {
  private calculator: MetricsCalculator;

  constructor(calculator: MetricsCalculator) {
    this.calculator = calculator;
  }

  /**
   * Generate complete analytics report
   */
  async generateReport(from?: Date, to?: Date): Promise<AnalyticsReport> {
    const now = new Date();
    const timeRange = {
      from: from || new Date(0), // Beginning of time if not specified
      to: to || now,
    };

    // Calculate all metrics
    const sessionMetrics = this.calculator.calculateSessionMetrics(from, to);
    const agentMetrics = this.calculator.calculateAgentMetrics();
    const complexityDistribution = this.calculator.getComplexityDistribution();
    const consensusTrends = this.calculator.analyzeConsensusTrends();
    const patterns = this.calculator.identifyPatterns(agentMetrics);

    // Get top escalations
    const topEscalations = this.getTopEscalations();

    return {
      generatedAt: now,
      timeRange,
      sessionMetrics,
      agentMetrics,
      complexityDistribution,
      consensusTrends,
      topEscalations,
      patterns,
    };
  }

  /**
   * Get top 10 escalations
   */
  private getTopEscalations(): EscalationRecord[] {
    const store = (this.calculator as any).store;
    const db = (store as any).db;

    const query = `
      SELECT
        id as sessionId,
        program_id as programId,
        program_name as programName,
        final_consensus_score as score,
        metadata,
        started_at as startedAt
      FROM swarm_sessions
      WHERE status = 'ESCALATED'
      ORDER BY started_at DESC
      LIMIT 10
    `;

    const results = db.prepare(query).all();

    return results.map((row: any) => {
      const metadata = row.metadata ? JSON.parse(row.metadata) : {};
      const reason = metadata.escalationReason || 'UNKNOWN';

      return {
        sessionId: row.sessionId,
        programId: row.programId,
        programName: row.programName,
        score: row.score || 0,
        reason,
        startedAt: new Date(row.startedAt),
      };
    });
  }

  /**
   * Format report as Markdown
   */
  formatMarkdown(report: AnalyticsReport): string {
    const lines: string[] = [];

    // Header
    lines.push('# SWARM Analytics Report');
    lines.push('');
    lines.push(`**Generated**: ${report.generatedAt.toISOString()}`);
    lines.push(`**Time Range**: ${report.timeRange.from.toISOString()} → ${report.timeRange.to.toISOString()}`);
    lines.push('');

    // Session Metrics
    lines.push('## Session Metrics');
    lines.push('');
    lines.push(`- **Total Sessions**: ${report.sessionMetrics.totalSessions}`);
    lines.push(`- **Completed**: ${report.sessionMetrics.completedSessions} (${report.sessionMetrics.consensusPassRate.toFixed(1)}%)`);
    lines.push(`- **Failed**: ${report.sessionMetrics.failedSessions}`);
    lines.push(`- **Escalated**: ${report.sessionMetrics.escalatedSessions}`);
    lines.push(`- **Avg Consensus Score**: ${report.sessionMetrics.avgConsensusScore.toFixed(1)}%`);
    lines.push(`- **Avg Duration**: ${(report.sessionMetrics.avgDurationMs / 1000).toFixed(1)}s`);
    lines.push(`- **Total Cost**: $${report.sessionMetrics.totalTokensCost.toFixed(2)}`);
    lines.push('');

    // Complexity Distribution
    lines.push('## Complexity Distribution');
    lines.push('');
    lines.push('| Level | Count |');
    lines.push('|-------|-------|');
    lines.push(`| Simple | ${report.complexityDistribution.simple} |`);
    lines.push(`| Medium | ${report.complexityDistribution.medium} |`);
    lines.push(`| Complex | ${report.complexityDistribution.complex} |`);
    lines.push(`| Critical | ${report.complexityDistribution.critical} |`);
    lines.push('');

    // Agent Performance
    lines.push('## Agent Performance');
    lines.push('');
    lines.push('| Agent | Votes | Approve | Reject | Confidence | Vetos |');
    lines.push('|-------|-------|---------|--------|------------|-------|');
    for (const agent of report.agentMetrics) {
      lines.push(
        `| ${agent.agent} | ${agent.totalVotes} | ${agent.approveVotes} | ${agent.rejectVotes} | ${agent.avgConfidence.toFixed(1)}% | ${agent.vetoCount} |`,
      );
    }
    lines.push('');

    // Patterns (if any)
    if (report.patterns && (report.patterns.vetoAgents.length > 0 || report.patterns.lowConfidenceAgents.length > 0)) {
      lines.push('## Patterns Detected');
      lines.push('');
      if (report.patterns.vetoAgents.length > 0) {
        lines.push(`- **Frequent Veto Agents**: ${report.patterns.vetoAgents.join(', ')}`);
      }
      if (report.patterns.lowConfidenceAgents.length > 0) {
        lines.push(`- **Low Confidence Agents**: ${report.patterns.lowConfidenceAgents.join(', ')}`);
      }
      lines.push('');
    }

    // Consensus Trends by Round
    if (report.consensusTrends.length > 0) {
      lines.push('## Consensus Trends by Round');
      lines.push('');
      lines.push('| Round | Avg Score | Pass Rate |');
      lines.push('|-------|-----------|-----------|');
      for (const trend of report.consensusTrends) {
        lines.push(
          `| ${trend.roundNumber} | ${trend.avgScore.toFixed(1)}% | ${trend.passRate.toFixed(1)}% |`,
        );
      }
      lines.push('');
    }

    // Top Escalations
    if (report.topEscalations.length > 0) {
      lines.push('## Top Escalations');
      lines.push('');
      lines.push('| Program | Score | Reason | Started At |');
      lines.push('|---------|-------|--------|------------|');
      for (const escalation of report.topEscalations) {
        lines.push(
          `| ${escalation.programName} | ${escalation.score.toFixed(1)}% | ${escalation.reason} | ${escalation.startedAt.toISOString().substring(0, 16)} |`,
        );
      }
      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * Format report as JSON
   */
  formatJSON(report: AnalyticsReport): string {
    return JSON.stringify(report, null, 2);
  }
}
