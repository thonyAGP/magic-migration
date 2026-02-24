/**
 * Export Generator - Phase 3 J4
 *
 * Export analytics to CSV/Excel formats
 */

import type { AnalyticsReport } from './types.js';
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { mkdirSync } from 'node:fs';

export class ExportGenerator {
  /**
   * Export analytics report to CSV files
   *
   * Creates multiple CSV files:
   * - session-metrics.csv
   * - agent-metrics.csv
   * - complexity-distribution.csv
   * - consensus-trends.csv
   * - escalations.csv
   */
  exportToCSV(report: AnalyticsReport, outputDir: string): void {
    // Ensure output directory exists
    mkdirSync(outputDir, { recursive: true });

    // 1. Session Metrics
    const sessionCSV = this.generateSessionMetricsCSV(report);
    writeFileSync(join(outputDir, 'session-metrics.csv'), sessionCSV);

    // 2. Agent Metrics
    const agentCSV = this.generateAgentMetricsCSV(report);
    writeFileSync(join(outputDir, 'agent-metrics.csv'), agentCSV);

    // 3. Complexity Distribution
    const complexityCSV = this.generateComplexityDistributionCSV(report);
    writeFileSync(join(outputDir, 'complexity-distribution.csv'), complexityCSV);

    // 4. Consensus Trends
    const trendsCSV = this.generateConsensusTrendsCSV(report);
    writeFileSync(join(outputDir, 'consensus-trends.csv'), trendsCSV);

    // 5. Escalations
    const escalationsCSV = this.generateEscalationsCSV(report);
    writeFileSync(join(outputDir, 'escalations.csv'), escalationsCSV);
  }

  /**
   * Generate session metrics CSV
   */
  private generateSessionMetricsCSV(report: AnalyticsReport): string {
    const metrics = report.sessionMetrics;

    const header = [
      'generated_at',
      'time_from',
      'time_to',
      'total_sessions',
      'completed_sessions',
      'failed_sessions',
      'escalated_sessions',
      'avg_consensus_score',
      'avg_duration_ms',
      'total_tokens_cost',
      'consensus_pass_rate',
    ].join(',');

    const row = [
      this.formatDate(report.generatedAt),
      this.formatDate(report.timeRange.from),
      this.formatDate(report.timeRange.to),
      metrics.totalSessions,
      metrics.completedSessions,
      metrics.failedSessions,
      metrics.escalatedSessions,
      metrics.avgConsensusScore.toFixed(2),
      metrics.avgDurationMs.toFixed(0),
      metrics.totalTokensCost.toFixed(2),
      metrics.consensusPassRate.toFixed(2),
    ].join(',');

    return `${header}\n${row}\n`;
  }

  /**
   * Generate agent metrics CSV
   */
  private generateAgentMetricsCSV(report: AnalyticsReport): string {
    const header = [
      'agent',
      'total_votes',
      'approve_votes',
      'reject_votes',
      'avg_confidence',
      'veto_count',
      'blocker_concerns_raised',
      'approve_rate',
      'reject_rate',
    ].join(',');

    const rows = report.agentMetrics.map((agent) => {
      const approveRate =
        agent.totalVotes > 0 ? (agent.approveVotes / agent.totalVotes) * 100 : 0;
      const rejectRate =
        agent.totalVotes > 0 ? (agent.rejectVotes / agent.totalVotes) * 100 : 0;

      return [
        agent.agent,
        agent.totalVotes,
        agent.approveVotes,
        agent.rejectVotes,
        agent.avgConfidence.toFixed(2),
        agent.vetoCount,
        agent.blockerConcernsRaised,
        approveRate.toFixed(2),
        rejectRate.toFixed(2),
      ].join(',');
    });

    return `${header}\n${rows.join('\n')}\n`;
  }

  /**
   * Generate complexity distribution CSV
   */
  private generateComplexityDistributionCSV(report: AnalyticsReport): string {
    const dist = report.complexityDistribution;
    const total = dist.simple + dist.medium + dist.complex + dist.critical;

    const header = ['level', 'count', 'percentage'].join(',');

    const rows = [
      ['simple', dist.simple, total > 0 ? ((dist.simple / total) * 100).toFixed(2) : '0'],
      ['medium', dist.medium, total > 0 ? ((dist.medium / total) * 100).toFixed(2) : '0'],
      ['complex', dist.complex, total > 0 ? ((dist.complex / total) * 100).toFixed(2) : '0'],
      [
        'critical',
        dist.critical,
        total > 0 ? ((dist.critical / total) * 100).toFixed(2) : '0',
      ],
    ].map((row) => row.join(','));

    return `${header}\n${rows.join('\n')}\n`;
  }

  /**
   * Generate consensus trends CSV
   */
  private generateConsensusTrendsCSV(report: AnalyticsReport): string {
    const header = ['round_number', 'avg_score', 'pass_rate'].join(',');

    const rows = report.consensusTrends.map((trend) =>
      [trend.roundNumber, trend.avgScore.toFixed(2), trend.passRate.toFixed(2)].join(','),
    );

    return `${header}\n${rows.join('\n')}\n`;
  }

  /**
   * Generate escalations CSV
   */
  private generateEscalationsCSV(report: AnalyticsReport): string {
    const header = [
      'session_id',
      'program_id',
      'program_name',
      'score',
      'reason',
      'started_at',
    ].join(',');

    const rows = report.topEscalations.map((escalation) =>
      [
        escalation.sessionId,
        escalation.programId,
        this.escapeCSV(escalation.programName),
        escalation.score.toFixed(2),
        this.escapeCSV(escalation.reason),
        this.formatDate(escalation.startedAt),
      ].join(','),
    );

    return `${header}\n${rows.join('\n')}\n`;
  }

  /**
   * Format date for CSV (ISO 8601)
   */
  private formatDate(date: Date): string {
    return date.toISOString();
  }

  /**
   * Escape CSV field (handle commas, quotes, newlines)
   */
  private escapeCSV(field: string): string {
    // If field contains comma, quote, or newline, wrap in quotes and escape quotes
    if (field.includes(',') || field.includes('"') || field.includes('\n')) {
      return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
  }
}
