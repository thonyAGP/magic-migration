/**
 * Tests for Veto System Integration (Chantier B2)
 *
 * Validates that orchestrator correctly detects and applies vetos
 */

import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { SwarmOrchestrator } from '../../src/swarm/orchestrator.js';
import type { SwarmSQLiteStore } from '../../src/swarm/storage/sqlite-store.js';
import type { MigrationContract } from '../../src/core/contract.js';
import type { AgentVote, VoteValue } from '../../src/swarm/types.js';

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

describe('Orchestrator Veto System Integration', () => {
  let mockStore: SwarmSQLiteStore;
  let contract: MigrationContract;

  beforeEach(() => {
    mockStore = createMockStore();
    contract = createMockContract();
  });

  it('should detect ARCHITECT veto on BLOCKER concern', async () => {
    // Arrange
    const orchestrator = new SwarmOrchestrator({}, mockStore);

    // Mock collectAgentVotes to return ARCHITECT with BLOCKER
    vi.spyOn(orchestrator as any, 'collectAgentVotes').mockResolvedValue([
      {
        agent: 'architect',
        vote: 'REJECT' as VoteValue,
        confidence: 95,
        weight: 2.0,
        justification: 'Critical architecture flaw',
        concerns: [
          {
            concern: 'Data integrity violation in transaction handling',
            severity: 'BLOCKER',
            suggestion: 'Implement proper ACID transaction wrapper',
          },
        ],
        suggestions: [],
        timestamp: new Date(),
      },
      {
        agent: 'developer',
        vote: 'APPROVE' as VoteValue,
        confidence: 80,
        weight: 1.0,
        justification: 'Code looks good',
        concerns: [],
        suggestions: [],
        timestamp: new Date(),
      },
    ] as AgentVote[]);

    // Act
    await orchestrator.execute(contract);

    // Assert - veto should force consensus.passed = false despite high score from developer
    const storeRoundCalls = (mockStore.storeVotingRound as Mock).mock.calls;
    const firstRoundCall = storeRoundCalls[0];
    const consensus = firstRoundCall[2];
    const metadata = firstRoundCall[3];

    expect(consensus.passed).toBe(false);
    expect(metadata.vetoTriggered).toBe(true);
    expect(metadata.vetoAgent).toBe('architect');
    expect(metadata.vetoReason).toContain('Data integrity violation');
  });

  it('should detect REVIEWER veto on BLOCKER concern', async () => {
    // Arrange
    const orchestrator = new SwarmOrchestrator({}, mockStore);

    vi.spyOn(orchestrator as any, 'collectAgentVotes').mockResolvedValue([
      {
        agent: 'reviewer',
        vote: 'REJECT' as VoteValue,
        confidence: 90,
        weight: 1.5,
        justification: 'Security vulnerability detected',
        concerns: [
          {
            concern: 'SQL injection vulnerability in user input handling',
            severity: 'BLOCKER',
            suggestion: 'Use parameterized queries',
          },
        ],
        suggestions: [],
        timestamp: new Date(),
      },
      {
        agent: 'developer',
        vote: 'APPROVE' as VoteValue,
        confidence: 85,
        weight: 1.0,
        justification: 'Implementation complete',
        concerns: [],
        suggestions: [],
        timestamp: new Date(),
      },
    ] as AgentVote[]);

    // Act
    await orchestrator.execute(contract);

    // Assert
    const storeRoundCalls = (mockStore.storeVotingRound as Mock).mock.calls;
    const metadata = storeRoundCalls[0][3];

    expect(metadata.vetoTriggered).toBe(true);
    expect(metadata.vetoAgent).toBe('reviewer');
    expect(metadata.vetoReason).toContain('SQL injection');
  });

  it('should NOT detect veto on MAJOR or MINOR concerns', async () => {
    // Arrange
    const orchestrator = new SwarmOrchestrator({}, mockStore);

    vi.spyOn(orchestrator as any, 'collectAgentVotes').mockResolvedValue([
      {
        agent: 'architect',
        vote: 'APPROVE_WITH_CONCERNS' as VoteValue,
        confidence: 75,
        weight: 2.0,
        justification: 'Acceptable with minor improvements',
        concerns: [
          {
            concern: 'Could improve naming conventions',
            severity: 'MINOR',
            suggestion: 'Use more descriptive variable names',
          },
        ],
        suggestions: [],
        timestamp: new Date(),
      },
      {
        agent: 'reviewer',
        vote: 'APPROVE_WITH_CONCERNS' as VoteValue,
        confidence: 80,
        weight: 1.5,
        justification: 'Good but needs optimization',
        concerns: [
          {
            concern: 'Performance could be better',
            severity: 'MAJOR',
            suggestion: 'Add caching layer',
          },
        ],
        suggestions: [],
        timestamp: new Date(),
      },
    ] as AgentVote[]);

    // Act
    await orchestrator.execute(contract);

    // Assert - no veto, only BLOCKER triggers veto
    const storeRoundCalls = (mockStore.storeVotingRound as Mock).mock.calls;
    const metadata = storeRoundCalls[0][3];

    expect(metadata.vetoTriggered).toBeUndefined(); // No veto = undefined
    expect(metadata.vetoAgent).toBeUndefined();
    expect(metadata.vetoReason).toBeUndefined();
  });

  it('should override passing consensus with veto', async () => {
    // Arrange - all agents approve except one with BLOCKER
    const orchestrator = new SwarmOrchestrator({}, mockStore);

    vi.spyOn(orchestrator as any, 'collectAgentVotes').mockResolvedValue([
      {
        agent: 'architect',
        vote: 'APPROVE' as VoteValue,
        confidence: 95,
        weight: 2.0,
        justification: 'Excellent architecture',
        concerns: [],
        suggestions: [],
        timestamp: new Date(),
      },
      {
        agent: 'analyst',
        vote: 'APPROVE' as VoteValue,
        confidence: 90,
        weight: 2.0,
        justification: 'Business logic correct',
        concerns: [],
        suggestions: [],
        timestamp: new Date(),
      },
      {
        agent: 'developer',
        vote: 'APPROVE' as VoteValue,
        confidence: 85,
        weight: 1.0,
        justification: 'Code is clean',
        concerns: [],
        suggestions: [],
        timestamp: new Date(),
      },
      {
        agent: 'tester',
        vote: 'APPROVE' as VoteValue,
        confidence: 90,
        weight: 1.5,
        justification: 'Tests pass',
        concerns: [],
        suggestions: [],
        timestamp: new Date(),
      },
      {
        agent: 'reviewer',
        vote: 'REJECT' as VoteValue,
        confidence: 95,
        weight: 1.5,
        justification: 'Critical security issue',
        concerns: [
          {
            concern: 'Authentication bypass vulnerability',
            severity: 'BLOCKER',
            suggestion: 'Fix auth middleware',
          },
        ],
        suggestions: [],
        timestamp: new Date(),
      },
      {
        agent: 'documentor',
        vote: 'APPROVE' as VoteValue,
        confidence: 80,
        weight: 0.5,
        justification: 'Documentation adequate',
        concerns: [],
        suggestions: [],
        timestamp: new Date(),
      },
    ] as AgentVote[]);

    // Act
    await orchestrator.execute(contract);

    // Assert - consensus score would be high (~90%), but veto forces rejection
    const storeRoundCalls = (mockStore.storeVotingRound as Mock).mock.calls;
    const consensus = storeRoundCalls[0][2];
    const metadata = storeRoundCalls[0][3];

    // Score is high (5 approvals out of 6)
    expect(consensus.score).toBeGreaterThan(70);
    // But veto forces passed = false
    expect(consensus.passed).toBe(false);
    expect(metadata.vetoTriggered).toBe(true);
  });

  it('should store veto metadata in voting round', async () => {
    // Arrange
    const orchestrator = new SwarmOrchestrator({}, mockStore);

    vi.spyOn(orchestrator as any, 'collectAgentVotes').mockResolvedValue([
      {
        agent: 'architect',
        vote: 'REJECT' as VoteValue,
        confidence: 95,
        weight: 2.0,
        justification: 'Critical flaw',
        concerns: [
          {
            concern: 'Data loss risk',
            severity: 'BLOCKER',
            suggestion: 'Add transaction rollback',
          },
          {
            concern: 'Poor error handling',
            severity: 'MAJOR',
            suggestion: 'Improve error messages',
          },
        ],
        suggestions: [],
        timestamp: new Date(),
      },
    ] as AgentVote[]);

    // Act
    await orchestrator.execute(contract);

    // Assert - veto metadata stored with all details
    expect(mockStore.storeVotingRound).toHaveBeenCalledWith(
      expect.any(String), // sessionId
      expect.any(Number), // roundNumber
      expect.any(Object), // consensus
      expect.objectContaining({
        durationMs: expect.any(Number),
        totalTokensCost: expect.any(Number),
        vetoTriggered: true,
        vetoAgent: 'architect',
        vetoReason: 'Data loss risk',
      }),
    );
  });

  it('should continue to next round after veto', async () => {
    // Arrange - Round 1 veto, Round 2 pass
    const orchestrator = new SwarmOrchestrator({ maxRounds: 2 }, mockStore);

    let callCount = 0;
    vi.spyOn(orchestrator as any, 'collectAgentVotes').mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        // Round 1: BLOCKER veto
        return Promise.resolve([
          {
            agent: 'architect',
            vote: 'REJECT' as VoteValue,
            confidence: 95,
            weight: 2.0,
            justification: 'Critical issue',
            concerns: [
              {
                concern: 'Blocker issue',
                severity: 'BLOCKER',
                suggestion: 'Fix it',
              },
            ],
            suggestions: [],
            timestamp: new Date(),
          },
        ] as AgentVote[]);
      } else {
        // Round 2: All approve, no veto
        return Promise.resolve([
          {
            agent: 'architect',
            vote: 'APPROVE' as VoteValue,
            confidence: 90,
            weight: 2.0,
            justification: 'Fixed',
            concerns: [],
            suggestions: [],
            timestamp: new Date(),
          },
        ] as AgentVote[]);
      }
    });

    // Act
    await orchestrator.execute(contract);

    // Assert
    const storeRoundCalls = (mockStore.storeVotingRound as Mock).mock.calls;
    expect(storeRoundCalls).toHaveLength(2);

    // Round 1: veto triggered
    expect(storeRoundCalls[0][3].vetoTriggered).toBe(true);

    // Round 2: no veto
    expect(storeRoundCalls[1][3].vetoTriggered).toBeUndefined();

    // Session completed after round 2
    expect(mockStore.completeSession).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ status: 'COMPLETED' }),
    );
  });

  it('should escalate TO_REVIEW if veto persists all rounds', async () => {
    // Arrange - veto on all 3 rounds
    const orchestrator = new SwarmOrchestrator({ maxRounds: 3 }, mockStore);

    vi.spyOn(orchestrator as any, 'collectAgentVotes').mockResolvedValue([
      {
        agent: 'reviewer',
        vote: 'REJECT' as VoteValue,
        confidence: 95,
        weight: 1.5,
        justification: 'Persistent security issue',
        concerns: [
          {
            concern: 'Unresolved vulnerability',
            severity: 'BLOCKER',
            suggestion: 'Complete security audit required',
          },
        ],
        suggestions: [],
        timestamp: new Date(),
      },
    ] as AgentVote[]);

    // Act
    await orchestrator.execute(contract);

    // Assert
    const storeRoundCalls = (mockStore.storeVotingRound as Mock).mock.calls;
    expect(storeRoundCalls).toHaveLength(3); // maxRounds reached

    // All rounds have veto
    expect(storeRoundCalls[0][3].vetoTriggered).toBe(true);
    expect(storeRoundCalls[1][3].vetoTriggered).toBe(true);
    expect(storeRoundCalls[2][3].vetoTriggered).toBe(true);

    // D1: Session marked ESCALATED (not TO_REVIEW)
    expect(mockStore.completeSession).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        status: 'ESCALATED',
        finalDecision: 'ESCALATED',
      }),
    );
  });
});
