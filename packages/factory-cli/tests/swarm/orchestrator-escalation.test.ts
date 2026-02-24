/**
 * Tests for Escalation System (Chantier D1)
 *
 * Validates that orchestrator correctly escalates when consensus cannot be reached
 */

import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { SwarmOrchestrator } from '../../src/swarm/orchestrator.js';
import type { SwarmSQLiteStore } from '../../src/swarm/storage/sqlite-store.js';
import type { MigrationContract } from '../../src/core/contract.js';

// Mock store factory
function createMockStore(): SwarmSQLiteStore {
  return {
    createSession: vi.fn(),
    updateSessionStatus: vi.fn(),
    storeComplexity: vi.fn(),
    storeAnalysis: vi.fn(),
    storeVotingRound: vi.fn().mockReturnValue(1),
    storeVote: vi.fn(),
    completeSession: vi.fn(),
    close: vi.fn(),
  } as unknown as SwarmSQLiteStore;
}

// Mock contract factory
function createMockContract(): MigrationContract {
  const expressions = new Array(50).fill(null).map((_, i) => ({
    id: i + 1,
    formula: `expr${i + 1}`,
    description: `Expression ${i + 1}`,
  }));

  const tables = [
    { id: 1, name: 'users', fields: [] },
    { id: 2, name: 'orders', fields: [] },
    { id: 3, name: 'products', fields: [] },
  ];

  return {
    metadata: {
      program_id: 42,
      program_name: 'TEST_PROGRAM',
      source_language: 'magic',
      target_language: 'typescript',
      legacy_expressions: expressions,
      tables,
    },
    expressions,
    tables,
    tasks: [],
    logic_lines: [],
    business_logic: {
      complexity: {
        nesting_depth: 2,
      },
    },
  } as unknown as MigrationContract;
}

describe('Orchestrator Escalation System', () => {
  let mockStore: SwarmSQLiteStore;
  let contract: MigrationContract;

  beforeEach(() => {
    mockStore = createMockStore();
    contract = createMockContract();
  });

  it('should escalate on maxRounds reached without consensus', async () => {
    // Arrange
    const orchestrator = new SwarmOrchestrator({ maxRounds: 3 }, mockStore);

    // Mock votes that never reach consensus (always 65%)
    vi.spyOn(orchestrator as any, 'collectAgentVotes').mockResolvedValue([
      {
        agent: 'architect',
        vote: 'APPROVE_WITH_CONCERNS',
        confidence: 65,
        weight: 2.0,
        justification: 'Never reaches 70%',
        concerns: [],
        suggestions: [],
        timestamp: new Date(),
      },
    ]);

    // Act
    await orchestrator.execute(contract);

    // Assert - session escalated
    expect(mockStore.completeSession).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        status: 'ESCALATED',
        finalDecision: 'ESCALATED',
      }),
    );
  });

  it('should escalate on stagnation detected', async () => {
    // Arrange
    const orchestrator = new SwarmOrchestrator({ maxRounds: 5 }, mockStore);

    // Mock flat scores (stagnation)
    vi.spyOn(orchestrator as any, 'collectAgentVotes').mockResolvedValue([
      {
        agent: 'architect',
        vote: 'APPROVE_WITH_CONCERNS',
        confidence: 65,
        weight: 2.0,
        justification: 'Stagnant score',
        concerns: [],
        suggestions: [],
        timestamp: new Date(),
      },
    ]);

    // Act
    await orchestrator.execute(contract);

    // Assert - escalated due to stagnation (not maxRounds=5)
    const calls = (mockStore.storeVotingRound as Mock).mock.calls;
    expect(calls).toHaveLength(3); // Stopped at round 3 (stagnation)

    expect(mockStore.completeSession).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        status: 'ESCALATED',
      }),
    );
  });

  it('should escalate on persistent veto (3+ rounds)', async () => {
    // Arrange
    const orchestrator = new SwarmOrchestrator({ maxRounds: 5 }, mockStore);

    // Mock votes with persistent BLOCKER concern
    vi.spyOn(orchestrator as any, 'collectAgentVotes').mockResolvedValue([
      {
        agent: 'architect',
        vote: 'REJECT',
        confidence: 90,
        weight: 2.0,
        justification: 'Persistent blocker',
        concerns: [
          {
            concern: 'Data integrity violation',
            severity: 'BLOCKER',
            suggestion: 'Redesign architecture',
          },
        ],
        suggestions: [],
        timestamp: new Date(),
      },
    ]);

    // Act
    await orchestrator.execute(contract);

    // Assert - escalated due to persistent veto
    expect(mockStore.completeSession).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        status: 'ESCALATED',
      }),
    );
  });

  it('should generate escalation report with key issues', async () => {
    // Arrange
    const orchestrator = new SwarmOrchestrator({ maxRounds: 3 }, mockStore);

    // Mock failing votes
    vi.spyOn(orchestrator as any, 'collectAgentVotes').mockResolvedValue([
      {
        agent: 'architect',
        vote: 'REJECT_WITH_SUGGESTIONS',
        confidence: 60,
        weight: 2.0,
        justification: 'Multiple concerns',
        concerns: [
          {
            concern: 'Security issue',
            severity: 'BLOCKER',
            suggestion: 'Add authentication',
          },
        ],
        suggestions: ['Review security model'],
        timestamp: new Date(),
      },
    ]);

    // Spy on console.log to capture escalation report
    const consoleLogSpy = vi.spyOn(console, 'log');

    // Act
    await orchestrator.execute(contract);

    // Assert - escalation report logged
    const escalationLogs = consoleLogSpy.mock.calls
      .map((call) => call[0])
      .filter((msg) => typeof msg === 'string' && msg.includes('[SWARM] ESCALATION'));

    expect(escalationLogs.length).toBeGreaterThan(0);

    // Should mention reason
    const summaryLogs = consoleLogSpy.mock.calls
      .map((call) => call[0])
      .filter((msg) => typeof msg === 'string' && msg.includes('requires escalation'));

    expect(summaryLogs.length).toBeGreaterThan(0);

    consoleLogSpy.mockRestore();
  });

  it('should store escalation context in session', async () => {
    // Arrange
    const orchestrator = new SwarmOrchestrator({ maxRounds: 3 }, mockStore);

    // Mock failing votes
    vi.spyOn(orchestrator as any, 'collectAgentVotes').mockResolvedValue([
      {
        agent: 'architect',
        vote: 'APPROVE_WITH_CONCERNS',
        confidence: 65,
        weight: 2.0,
        justification: 'Not enough',
        concerns: [],
        suggestions: [],
        timestamp: new Date(),
      },
    ]);

    // Act
    await orchestrator.execute(contract);

    // Assert - completeSession called with escalation data
    expect(mockStore.completeSession).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        status: 'ESCALATED',
        escalation: expect.objectContaining({
          context: expect.objectContaining({
            sessionId: expect.any(String),
            programId: 42,
            programName: 'TEST_PROGRAM',
            reason: expect.any(String),
            roundsAttempted: expect.any(Number),
            finalConsensusScore: expect.any(Number),
            roundHistory: expect.any(Array),
            blockerConcerns: expect.any(Array),
          }),
          report: expect.objectContaining({
            summary: expect.any(String),
            recommendation: expect.any(String),
            keyIssues: expect.any(Array),
            divergentViews: expect.any(Array),
            suggestedActions: expect.any(Array),
          }),
          escalatedAt: expect.any(Date),
        }),
      }),
    );
  });

  it('should mark session as ESCALATED (not TO_REVIEW)', async () => {
    // Arrange
    const orchestrator = new SwarmOrchestrator({ maxRounds: 3 }, mockStore);

    // Mock failing votes
    vi.spyOn(orchestrator as any, 'collectAgentVotes').mockResolvedValue([
      {
        agent: 'architect',
        vote: 'APPROVE_WITH_CONCERNS',
        confidence: 65,
        weight: 2.0,
        justification: 'Below threshold',
        concerns: [],
        suggestions: [],
        timestamp: new Date(),
      },
    ]);

    // Act
    await orchestrator.execute(contract);

    // Assert - status is ESCALATED, not TO_REVIEW
    expect(mockStore.completeSession).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        status: 'ESCALATED',
        finalDecision: 'ESCALATED',
      }),
    );

    // Should NOT be TO_REVIEW
    expect(mockStore.completeSession).not.toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        status: 'TO_REVIEW',
      }),
    );
  });

  it('should include divergent agent views in report', async () => {
    // Arrange
    const orchestrator = new SwarmOrchestrator({ maxRounds: 3 }, mockStore);

    // Mock votes with different views
    let callCount = 0;
    vi.spyOn(orchestrator as any, 'collectAgentVotes').mockImplementation(() => {
      callCount++;

      if (callCount === 1) {
        return Promise.resolve([
          {
            agent: 'architect',
            vote: 'APPROVE_WITH_CONCERNS',
            confidence: 60,
            weight: 2.0,
            justification: 'View A',
            concerns: [],
            suggestions: [],
            timestamp: new Date(),
          },
        ]);
      } else {
        return Promise.resolve([
          {
            agent: 'architect',
            vote: 'APPROVE_WITH_CONCERNS',
            confidence: 62,
            weight: 2.0,
            justification: 'View B',
            concerns: [],
            suggestions: [],
            timestamp: new Date(),
          },
        ]);
      }
    });

    // Act
    await orchestrator.execute(contract);

    // Assert - escalation report includes divergentViews
    expect(mockStore.completeSession).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        escalation: expect.objectContaining({
          report: expect.objectContaining({
            divergentViews: expect.any(Array),
          }),
        }),
      }),
    );
  });

  it('should NOT escalate if consensus reached on last round', async () => {
    // Arrange
    const orchestrator = new SwarmOrchestrator({ maxRounds: 3 }, mockStore);

    // Mock improving scores: 65% -> 68% -> 75%
    let callCount = 0;
    vi.spyOn(orchestrator as any, 'collectAgentVotes').mockImplementation(() => {
      callCount++;

      if (callCount === 1) {
        return Promise.resolve([
          {
            agent: 'architect',
            vote: 'APPROVE_WITH_CONCERNS',
            confidence: 65,
            weight: 2.0,
            justification: 'Round 1',
            concerns: [],
            suggestions: [],
            timestamp: new Date(),
          },
        ]);
      } else if (callCount === 2) {
        return Promise.resolve([
          {
            agent: 'architect',
            vote: 'APPROVE_WITH_CONCERNS',
            confidence: 68,
            weight: 2.0,
            justification: 'Round 2',
            concerns: [],
            suggestions: [],
            timestamp: new Date(),
          },
        ]);
      } else {
        // Final round passes
        return Promise.resolve([
          {
            agent: 'architect',
            vote: 'APPROVE',
            confidence: 75,
            weight: 2.0,
            justification: 'Pass',
            concerns: [],
            suggestions: [],
            timestamp: new Date(),
          },
        ]);
      }
    });

    // Act
    await orchestrator.execute(contract);

    // Assert - NOT escalated (consensus reached)
    expect(mockStore.completeSession).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        status: 'COMPLETED',
        finalDecision: 'PROCEED',
      }),
    );

    // Should NOT be ESCALATED
    expect(mockStore.completeSession).not.toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        status: 'ESCALATED',
      }),
    );
  });
});
