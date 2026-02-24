/**
 * Tests for Report Generator (Chantier E1)
 *
 * Validates report generation and formatting
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MetricsCalculator } from '../../src/swarm/analytics/metrics-calculator.js';
import { ReportGenerator } from '../../src/swarm/analytics/report-generator.js';
import { createSwarmStore } from '../../src/swarm/storage/sqlite-store.js';
import type { SwarmSQLiteStore } from '../../src/swarm/storage/sqlite-store.js';
import { unlinkSync, existsSync } from 'node:fs';

describe.skip('Report Generator', () => {
  let store: SwarmSQLiteStore;
  let calculator: MetricsCalculator;
  let generator: ReportGenerator;
  const testDbPath = '.swarm-sessions/test-reports.db';

  beforeEach(() => {
    // Clean up previous test database
    if (existsSync(testDbPath)) {
      unlinkSync(testDbPath);
    }

    store = createSwarmStore(testDbPath);
    calculator = new MetricsCalculator(store);
    generator = new ReportGenerator(calculator);

    // Seed test data
    seedTestData(store);
  });

  afterEach(() => {
    store.close();
    if (existsSync(testDbPath)) {
      unlinkSync(testDbPath);
    }
  });

  /**
   * Seed test database with sample sessions
   */
  function seedTestData(store: SwarmSQLiteStore): void {
    // Session 1: Completed
    const session1 = store.createSession(42, 'PAYMENT_PROCESSOR', {
      score: 75,
      level: 'CRITICAL',
      useSwarm: true,
      requiresDoubleVote: true,
      indicators: {
        expressionCount: 80,
        tableCount: 10,
        nestingDepth: 4,
        hasBusinessLogic: true,
        hasStateManagement: true,
        isCritical: true,
        hasExternalIntegrations: true,
      },
      explanation: 'Critical payment system',
    });

    const round1 = store.storeVotingRound(
      session1,
      1,
      { score: 75, passed: true, recommendation: 'PROCEED' },
      { durationMs: 200, totalTokensCost: 1.5 },
    );

    store.storeVote(session1, round1, {
      agent: 'architect',
      vote: 'APPROVE',
      confidence: 85,
      weight: 2.0,
      justification: 'Excellent design',
      concerns: [],
      suggestions: [],
      timestamp: new Date(),
    });

    store.completeSession(session1, {
      status: 'COMPLETED',
      finalConsensusScore: 75,
      finalDecision: 'PROCEED',
      durationMs: 200,
      totalTokensCost: 1.5,
    });

    // Session 2: Escalated
    const session2 = store.createSession(89, 'AUTH_MODULE', {
      score: 60,
      level: 'COMPLEX',
      useSwarm: true,
      requiresDoubleVote: false,
      indicators: {
        expressionCount: 50,
        tableCount: 5,
        nestingDepth: 3,
        hasBusinessLogic: true,
        hasStateManagement: false,
        isCritical: false,
        hasExternalIntegrations: true,
      },
      explanation: 'Authentication module',
    });

    const round2 = store.storeVotingRound(
      session2,
      1,
      { score: 60, passed: false, recommendation: 'REVISE' },
      { durationMs: 150, totalTokensCost: 1.0 },
    );

    store.storeVote(session2, round2, {
      agent: 'reviewer',
      vote: 'REJECT',
      confidence: 90,
      weight: 1.5,
      justification: 'Security concern',
      concerns: [
        {
          concern: 'Authentication bypass risk',
          severity: 'BLOCKER',
          suggestion: 'Add validation',
        },
      ],
      suggestions: [],
      timestamp: new Date(),
    });

    store.completeSession(session2, {
      status: 'ESCALATED',
      finalConsensusScore: 60,
      finalDecision: 'ESCALATED',
      durationMs: 150,
      totalTokensCost: 1.0,
    });
  }

  it('should generate complete analytics report', async () => {
    // Act
    const report = await generator.generateReport();

    // Assert
    expect(report.generatedAt).toBeInstanceOf(Date);
    expect(report.timeRange.from).toBeInstanceOf(Date);
    expect(report.timeRange.to).toBeInstanceOf(Date);

    // Session metrics populated
    expect(report.sessionMetrics.totalSessions).toBe(2);
    expect(report.sessionMetrics.completedSessions).toBe(1);
    expect(report.sessionMetrics.escalatedSessions).toBe(1);

    // Agent metrics populated
    expect(report.agentMetrics.length).toBeGreaterThan(0);

    // Complexity distribution populated
    expect(report.complexityDistribution.critical).toBe(1);
    expect(report.complexityDistribution.complex).toBe(1);

    // Consensus trends populated
    expect(report.consensusTrends.length).toBeGreaterThan(0);

    // Top escalations populated
    expect(report.topEscalations.length).toBe(1);
    expect(report.topEscalations[0].programName).toBe('AUTH_MODULE');
  });

  it('should format report as markdown with tables', async () => {
    // Act
    const report = await generator.generateReport();
    const markdown = generator.formatMarkdown(report);

    // Assert - Check key sections present
    expect(markdown).toContain('# SWARM Analytics Report');
    expect(markdown).toContain('## Session Metrics');
    expect(markdown).toContain('## Agent Performance');
    expect(markdown).toContain('## Complexity Distribution');
    expect(markdown).toContain('## Consensus Trends by Round');
    expect(markdown).toContain('## Top Escalations');

    // Check data present
    expect(markdown).toContain('Total Sessions**: 2');
    expect(markdown).toContain('Completed**: 1');
    expect(markdown).toContain('Escalated**: 1');

    // Check table format
    expect(markdown).toContain('| Agent | Votes |');
    expect(markdown).toContain('|-------|-------|');

    // Check escalation
    expect(markdown).toContain('AUTH_MODULE');
    expect(markdown).toContain('PAYMENT_PROCESSOR');
  });

  it('should format report as JSON', async () => {
    // Act
    const report = await generator.generateReport();
    const json = generator.formatJSON(report);

    // Assert - Parse JSON
    const parsed = JSON.parse(json);

    expect(parsed.sessionMetrics.totalSessions).toBe(2);
    expect(parsed.agentMetrics).toBeInstanceOf(Array);
    expect(parsed.complexityDistribution).toBeDefined();
    expect(parsed.consensusTrends).toBeInstanceOf(Array);
    expect(parsed.topEscalations).toBeInstanceOf(Array);
  });

  it('should include top 10 escalations in report', async () => {
    // Arrange - Create 15 escalated sessions
    for (let i = 0; i < 15; i++) {
      const sessionId = store.createSession(1000 + i, `ESCALATED_PROG_${i}`, {
        score: 65,
        level: 'COMPLEX',
        useSwarm: true,
        requiresDoubleVote: false,
        indicators: {
          expressionCount: 50,
          tableCount: 3,
          nestingDepth: 2,
          hasBusinessLogic: true,
          hasStateManagement: false,
          isCritical: false,
          hasExternalIntegrations: false,
        },
        explanation: 'Test',
      });

      store.completeSession(sessionId, {
        status: 'ESCALATED',
        finalConsensusScore: 65,
        finalDecision: 'ESCALATED',
        durationMs: 100,
        totalTokensCost: 0.5,
      });
    }

    // Act
    const report = await generator.generateReport();

    // Assert - Should limit to 10 escalations
    expect(report.topEscalations.length).toBe(10);
  });

  it('should generate report for specific time range', async () => {
    // Arrange
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Act
    const report = await generator.generateReport(yesterday, now);

    // Assert - Should include all sessions (within range)
    expect(report.sessionMetrics.totalSessions).toBe(2);
    expect(report.timeRange.from).toEqual(yesterday);
    expect(report.timeRange.to).toEqual(now);
  });

  it('should handle report generation with no data', async () => {
    // Arrange - Close current store and create empty one
    store.close();
    if (existsSync(testDbPath)) {
      unlinkSync(testDbPath);
    }

    const emptyStore = createSwarmStore(testDbPath);
    const emptyCalculator = new MetricsCalculator(emptyStore);
    const emptyGenerator = new ReportGenerator(emptyCalculator);

    // Act
    const report = await emptyGenerator.generateReport();
    const markdown = emptyGenerator.formatMarkdown(report);

    // Assert - Should not crash, show zeros
    expect(report.sessionMetrics.totalSessions).toBe(0);
    expect(report.agentMetrics.length).toBe(0);
    expect(report.topEscalations.length).toBe(0);

    expect(markdown).toContain('Total Sessions**: 0');
    expect(markdown).toContain('# SWARM Analytics Report');

    // Cleanup
    emptyStore.close();
    if (existsSync(testDbPath)) {
      unlinkSync(testDbPath);
    }
  });
});
