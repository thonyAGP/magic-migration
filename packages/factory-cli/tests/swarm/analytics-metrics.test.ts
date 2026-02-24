/**
 * Tests for Metrics Calculator (Chantier E1)
 *
 * Validates metrics calculation from session data
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MetricsCalculator } from '../../src/swarm/analytics/metrics-calculator.js';
import { createSwarmStore } from '../../src/swarm/storage/sqlite-store.js';
import type { SwarmSQLiteStore } from '../../src/swarm/storage/sqlite-store.js';
import { unlinkSync, existsSync } from 'node:fs';

describe.skip('Metrics Calculator', () => {
  let store: SwarmSQLiteStore;
  let calculator: MetricsCalculator;
  const testDbPath = '.swarm-sessions/test-metrics.db';

  beforeEach(() => {
    // Clean up previous test database
    if (existsSync(testDbPath)) {
      unlinkSync(testDbPath);
    }

    store = createSwarmStore(testDbPath);
    calculator = new MetricsCalculator(store);
  });

  afterEach(() => {
    store.close();
    if (existsSync(testDbPath)) {
      unlinkSync(testDbPath);
    }
  });

  it('should calculate session metrics with correct aggregation', () => {
    // Arrange - Create 3 sessions
    const session1 = store.createSession(42, 'PROGRAM_A', {
      score: 55,
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

    store.completeSession(session1, {
      status: 'COMPLETED',
      finalConsensusScore: 75,
      finalDecision: 'PROCEED',
      durationMs: 100,
      totalTokensCost: 0.5,
    });

    const session2 = store.createSession(43, 'PROGRAM_B', {
      score: 60,
      level: 'COMPLEX',
      useSwarm: true,
      requiresDoubleVote: false,
      indicators: {
        expressionCount: 40,
        tableCount: 2,
        nestingDepth: 1,
        hasBusinessLogic: false,
        hasStateManagement: false,
        isCritical: false,
        hasExternalIntegrations: false,
      },
      explanation: 'Test',
    });

    store.completeSession(session2, {
      status: 'ESCALATED',
      finalConsensusScore: 65,
      finalDecision: 'ESCALATED',
      durationMs: 150,
      totalTokensCost: 0.8,
    });

    const session3 = store.createSession(44, 'PROGRAM_C', {
      score: 45,
      level: 'MEDIUM',
      useSwarm: true,
      requiresDoubleVote: false,
      indicators: {
        expressionCount: 30,
        tableCount: 1,
        nestingDepth: 1,
        hasBusinessLogic: false,
        hasStateManagement: false,
        isCritical: false,
        hasExternalIntegrations: false,
      },
      explanation: 'Test',
    });

    store.completeSession(session3, {
      status: 'FAILED',
      finalConsensusScore: 50,
      finalDecision: 'REJECT',
      durationMs: 80,
      totalTokensCost: 0.3,
    });

    // Act
    const metrics = calculator.calculateSessionMetrics();

    // Assert
    expect(metrics.totalSessions).toBe(3);
    expect(metrics.completedSessions).toBe(1);
    expect(metrics.failedSessions).toBe(1);
    expect(metrics.escalatedSessions).toBe(1);
    expect(metrics.avgConsensusScore).toBeCloseTo(63.33, 1); // (75+65+50)/3
    expect(metrics.avgDurationMs).toBeCloseTo(110, 0); // (100+150+80)/3
    expect(metrics.totalTokensCost).toBeCloseTo(1.6, 1); // 0.5+0.8+0.3
    expect(metrics.consensusPassRate).toBeCloseTo(33.33, 1); // 1/3
  });

  it('should calculate agent performance metrics', () => {
    // Arrange - Create session with votes
    const sessionId = store.createSession(42, 'TEST_PROGRAM', {
      score: 55,
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

    const roundId = store.storeVotingRound(
      sessionId,
      1,
      { score: 70, passed: true, recommendation: 'PROCEED' },
      { durationMs: 100, totalTokensCost: 0.5 },
    );

    // Store votes from different agents
    store.storeVote(sessionId, roundId, {
      agent: 'architect',
      vote: 'APPROVE',
      confidence: 80,
      weight: 2.0,
      justification: 'Good',
      concerns: [],
      suggestions: [],
      timestamp: new Date(),
    });

    store.storeVote(sessionId, roundId, {
      agent: 'analyst',
      vote: 'APPROVE_WITH_CONCERNS',
      confidence: 70,
      weight: 2.0,
      justification: 'Acceptable',
      concerns: [
        {
          concern: 'Performance issue',
          severity: 'MINOR',
          suggestion: 'Optimize',
        },
      ],
      suggestions: [],
      timestamp: new Date(),
    });

    store.storeVote(sessionId, roundId, {
      agent: 'reviewer',
      vote: 'REJECT',
      confidence: 90,
      weight: 1.5,
      justification: 'Blocker',
      concerns: [
        {
          concern: 'Security risk',
          severity: 'BLOCKER',
          suggestion: 'Fix',
        },
      ],
      suggestions: [],
      timestamp: new Date(),
    });

    // Act
    const agentMetrics = calculator.calculateAgentMetrics();

    // Assert
    expect(agentMetrics).toHaveLength(3);

    const architectMetrics = agentMetrics.find((m) => m.agent === 'architect');
    expect(architectMetrics).toBeDefined();
    expect(architectMetrics!.totalVotes).toBe(1);
    expect(architectMetrics!.approveVotes).toBe(1);
    expect(architectMetrics!.avgConfidence).toBe(80);

    const reviewerMetrics = agentMetrics.find((m) => m.agent === 'reviewer');
    expect(reviewerMetrics).toBeDefined();
    expect(reviewerMetrics!.rejectVotes).toBe(1);
    expect(reviewerMetrics!.vetoCount).toBe(1); // Has BLOCKER concern
  });

  it('should get complexity distribution from sessions', () => {
    // Arrange - Create sessions with different complexities
    const session1 = store.createSession(1, 'SIMPLE_PROG', {
      score: 10,
      level: 'SIMPLE',
      useSwarm: false,
      requiresDoubleVote: false,
      indicators: {
        expressionCount: 5,
        tableCount: 1,
        nestingDepth: 0,
        hasBusinessLogic: false,
        hasStateManagement: false,
        isCritical: false,
        hasExternalIntegrations: false,
      },
      explanation: 'Test',
    });

    const session2 = store.createSession(2, 'COMPLEX_PROG', {
      score: 65,
      level: 'COMPLEX',
      useSwarm: true,
      requiresDoubleVote: false,
      indicators: {
        expressionCount: 60,
        tableCount: 5,
        nestingDepth: 3,
        hasBusinessLogic: true,
        hasStateManagement: true,
        isCritical: false,
        hasExternalIntegrations: true,
      },
      explanation: 'Test',
    });

    const session3 = store.createSession(3, 'CRITICAL_PROG', {
      score: 100,
      level: 'CRITICAL',
      useSwarm: true,
      requiresDoubleVote: true,
      indicators: {
        expressionCount: 100,
        tableCount: 10,
        nestingDepth: 5,
        hasBusinessLogic: true,
        hasStateManagement: true,
        isCritical: true,
        hasExternalIntegrations: true,
      },
      explanation: 'Test',
    });

    // Act
    const distribution = calculator.getComplexityDistribution();

    // Assert
    expect(distribution.simple).toBe(1);
    expect(distribution.medium).toBe(0);
    expect(distribution.complex).toBe(1);
    expect(distribution.critical).toBe(1);
  });

  it('should analyze consensus trends by round', () => {
    // Arrange - Create session with multiple rounds
    const sessionId = store.createSession(42, 'TEST_PROGRAM', {
      score: 55,
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

    // Round 1: 60% (failed)
    store.storeVotingRound(
      sessionId,
      1,
      { score: 60, passed: false, recommendation: 'REVISE' },
      { durationMs: 100, totalTokensCost: 0.5 },
    );

    // Round 2: 68% (failed)
    store.storeVotingRound(
      sessionId,
      2,
      { score: 68, passed: false, recommendation: 'REVISE' },
      { durationMs: 100, totalTokensCost: 0.5 },
    );

    // Round 3: 75% (passed)
    store.storeVotingRound(
      sessionId,
      3,
      { score: 75, passed: true, recommendation: 'PROCEED' },
      { durationMs: 100, totalTokensCost: 0.5 },
    );

    // Act
    const trends = calculator.analyzeConsensusTrends();

    // Assert
    expect(trends).toHaveLength(3);
    expect(trends[0].roundNumber).toBe(1);
    expect(trends[0].avgScore).toBe(60);
    expect(trends[0].passRate).toBe(0); // 0% passed at round 1

    expect(trends[2].roundNumber).toBe(3);
    expect(trends[2].avgScore).toBe(75);
    expect(trends[2].passRate).toBe(100); // 100% passed at round 3
  });

  it('should filter metrics by time range', () => {
    // Arrange - Create sessions at different times
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

    // Old session (2 days ago)
    const oldSession = store.createSession(1, 'OLD_PROG', {
      score: 50,
      level: 'MEDIUM',
      useSwarm: true,
      requiresDoubleVote: false,
      indicators: {
        expressionCount: 30,
        tableCount: 2,
        nestingDepth: 1,
        hasBusinessLogic: false,
        hasStateManagement: false,
        isCritical: false,
        hasExternalIntegrations: false,
      },
      explanation: 'Test',
    });
    // Manually update started_at (hackish but works for test)
    store['db']
      .prepare('UPDATE swarm_sessions SET started_at = ? WHERE id = ?')
      .run(twoDaysAgo.toISOString(), oldSession);

    // Recent session (now)
    const recentSession = store.createSession(2, 'RECENT_PROG', {
      score: 60,
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

    // Act - Filter to last 24 hours
    const metrics = calculator.calculateSessionMetrics(yesterday, now);

    // Assert - Should only include recent session
    expect(metrics.totalSessions).toBe(1);
  });

  it('should handle empty database gracefully (return zeros)', () => {
    // Act - Query empty database
    const metrics = calculator.calculateSessionMetrics();

    // Assert
    expect(metrics.totalSessions).toBe(0);
    expect(metrics.completedSessions).toBe(0);
    expect(metrics.avgConsensusScore).toBe(0);
    expect(metrics.totalTokensCost).toBe(0);
    expect(metrics.consensusPassRate).toBe(0);
  });

  it('should identify agents with frequent vetos (>= 3)', () => {
    // Arrange - Agent metrics with vetos
    const agentMetrics = [
      {
        agent: 'architect' as const,
        totalVotes: 10,
        approveVotes: 7,
        rejectVotes: 3,
        avgConfidence: 75,
        vetoCount: 5, // Frequent veto
        blockerConcernsRaised: 5,
      },
      {
        agent: 'analyst' as const,
        totalVotes: 10,
        approveVotes: 9,
        rejectVotes: 1,
        avgConfidence: 80,
        vetoCount: 1, // Infrequent veto
        blockerConcernsRaised: 1,
      },
      {
        agent: 'reviewer' as const,
        totalVotes: 10,
        approveVotes: 6,
        rejectVotes: 4,
        avgConfidence: 70,
        vetoCount: 3, // At threshold
        blockerConcernsRaised: 3,
      },
    ];

    // Act
    const patterns = calculator.identifyPatterns(agentMetrics);

    // Assert
    expect(patterns.vetoAgents).toContain('architect');
    expect(patterns.vetoAgents).toContain('reviewer');
    expect(patterns.vetoAgents).not.toContain('analyst');
  });

  it('should identify agents with low confidence (< 60%)', () => {
    // Arrange - Agent metrics with varying confidence
    const agentMetrics = [
      {
        agent: 'architect' as const,
        totalVotes: 10,
        approveVotes: 7,
        rejectVotes: 3,
        avgConfidence: 75, // High confidence
        vetoCount: 0,
        blockerConcernsRaised: 0,
      },
      {
        agent: 'analyst' as const,
        totalVotes: 10,
        approveVotes: 5,
        rejectVotes: 5,
        avgConfidence: 55, // Low confidence
        vetoCount: 0,
        blockerConcernsRaised: 0,
      },
      {
        agent: 'developer' as const,
        totalVotes: 10,
        approveVotes: 4,
        rejectVotes: 6,
        avgConfidence: 45, // Very low confidence
        vetoCount: 0,
        blockerConcernsRaised: 0,
      },
    ];

    // Act
    const patterns = calculator.identifyPatterns(agentMetrics);

    // Assert
    expect(patterns.lowConfidenceAgents).toContain('analyst');
    expect(patterns.lowConfidenceAgents).toContain('developer');
    expect(patterns.lowConfidenceAgents).not.toContain('architect');
  });
});
