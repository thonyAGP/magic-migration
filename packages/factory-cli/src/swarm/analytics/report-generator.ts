/**
 * Report Generator - Generate analytics reports in various formats
 *
 * Formats analytics data as Markdown, JSON, or other formats
 */

import type { AnalyticsReport } from '../types.js';
import { MetricsCalculator } from './metrics-calculator.js';

/**
 * Report Generator
 */
export class ReportGenerator {
  private readonly calculator: MetricsCalculator;

  constructor(calculator: MetricsCalculator) {
    this.calculator = calculator;
  }

  /**
   * Generate complete analytics report
   *
   * @param from - Start date (optional)
   * @param to - End date (optional)
   * @returns Analytics report
   */
  async generateReport(from?: Date, to?: Date): Promise<AnalyticsReport> {
    const sessionMetrics = this.calculator.calculateSessionMetrics(from, to);
    const agentMetrics = this.calculator.calculateAgentMetrics(from, to);
    const complexityDistribution =
      this.calculator.getComplexityDistribution(from, to);
    const consensusTrends = this.calculator.analyzeConsensusTrends(from, to);
    const topEscalations = this.calculator.getTopEscalations(10, from, to);

    return {
      generatedAt: new Date(),
      timeRange: {
        from: from || new Date(0),
        to: to || new Date(),
      },
      sessionMetrics,
      agentMetrics,
      complexityDistribution,
      consensusTrends,
      topEscalations,
    };
  }

  /**
   * Format report as Markdown
   *
   * @param report - Analytics report
   * @returns Markdown string
   */
  formatMarkdown(report: AnalyticsReport): string {
    const lines: string[] = [];

    // Header
    lines.push('# SWARM Analytics Report');
    lines.push(`Generated: ${report.generatedAt.toISOString()}`);
    lines.push(
      `Time Range: ${report.timeRange.from.toISOString()} to ${report.timeRange.to.toISOString()}`,
    );
    lines.push('');

    // Session Metrics
    lines.push('## Session Metrics');
    lines.push('');
    lines.push(`- **Total Sessions**: ${report.sessionMetrics.totalSessions}`);
    lines.push(
      `- **Completed**: ${report.sessionMetrics.completedSessions} (${this.percentage(report.sessionMetrics.completedSessions, report.sessionMetrics.totalSessions)})`,
    );
    lines.push(
      `- **Failed**: ${report.sessionMetrics.failedSessions} (${this.percentage(report.sessionMetrics.failedSessions, report.sessionMetrics.totalSessions)})`,
    );
    lines.push(
      `- **Escalated**: ${report.sessionMetrics.escalatedSessions} (${this.percentage(report.sessionMetrics.escalatedSessions, report.sessionMetrics.totalSessions)})`,
    );
    lines.push(
      `- **To Review**: ${report.sessionMetrics.toReviewSessions} (${this.percentage(report.sessionMetrics.toReviewSessions, report.sessionMetrics.totalSessions)})`,
    );
    lines.push('');
    lines.push(
      `- **Avg Consensus Score**: ${report.sessionMetrics.avgConsensusScore.toFixed(1)}%`,
    );
    lines.push(
      `- **Avg Rounds to Consensus**: ${report.sessionMetrics.avgRoundsToConsensus.toFixed(1)}`,
    );
    lines.push(
      `- **Avg Duration**: ${report.sessionMetrics.avgDurationMs.toFixed(0)}ms`,
    );
    lines.push(
      `- **Total Tokens Cost**: $${report.sessionMetrics.totalTokensCost.toFixed(2)}`,
    );
    lines.push(
      `- **Consensus Pass Rate**: ${report.sessionMetrics.consensusPassRate.toFixed(1)}%`,
    );
    lines.push('');

    // Complexity Distribution
    lines.push('## Complexity Distribution');
    lines.push('');
    lines.push(
      `- **Simple**: ${report.complexityDistribution.simple} programs`,
    );
    lines.push(
      `- **Medium**: ${report.complexityDistribution.medium} programs`,
    );
    lines.push(
      `- **Complex**: ${report.complexityDistribution.complex} programs`,
    );
    lines.push(
      `- **Critical**: ${report.complexityDistribution.critical} programs`,
    );
    lines.push('');

    // Agent Performance
    lines.push('## Agent Performance');
    lines.push('');
    lines.push(
      '| Agent | Votes | Approve | Reject | Confidence | Vetos | Blockers |',
    );
    lines.push(
      '|-------|-------|---------|--------|------------|-------|----------|',
    );
    for (const agent of report.agentMetrics) {
      lines.push(
        `| ${agent.agent} | ${agent.totalVotes} | ${agent.approveVotes} | ${agent.rejectVotes} | ${agent.avgConfidence.toFixed(1)}% | ${agent.vetoCount} | ${agent.blockerConcernsRaised} |`,
      );
    }
    lines.push('');

    // Consensus Trends
    if (report.consensusTrends.length > 0) {
      lines.push('## Consensus Trends by Round');
      lines.push('');
      for (const trend of report.consensusTrends) {
        const barLength = Math.round(trend.avgScore / 10);
        const bar = '█'.repeat(barLength);
        lines.push(
          `Round ${trend.roundNumber}: ${bar} ${trend.avgScore.toFixed(1)}% (${trend.sessionsCount} sessions, ${trend.passRate.toFixed(1)}% pass)`,
        );
      }
      lines.push('');
    }

    // Top Escalations
    if (report.topEscalations.length > 0) {
      lines.push('## Top Escalations');
      lines.push('');
      for (const esc of report.topEscalations) {
        lines.push(
          `- **${esc.programName}** (${esc.programId}): ${esc.reason} after ${esc.roundsAttempted} rounds (score: ${esc.finalScore.toFixed(1)}%)`,
        );
      }
      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * Format report as JSON
   *
   * @param report - Analytics report
   * @returns JSON string
   */
  formatJSON(report: AnalyticsReport): string {
    return JSON.stringify(report, null, 2);
  }

  /**
   * Calculate percentage
   */
  private percentage(value: number, total: number): string {
    if (total === 0) return '0%';
    return `${((value / total) * 100).toFixed(1)}%`;
  }
}
