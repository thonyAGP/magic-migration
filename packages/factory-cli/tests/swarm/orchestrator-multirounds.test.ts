/**
 * Tests for Multi-Rounds Loop (Chantier C1)
 *
 * Validates that orchestrator correctly handles multiple voting rounds
 */

import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { SwarmOrchestrator } from '../../src/swarm/orchestrator.js';
import type { SwarmSQLiteStore } from '../../src/swarm/storage/sqlite-store.js';
import type { MigrationContract } from '../../src/core/contract.js';
import type { ConsensusResult } from '../../src/swarm/types.js';

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

describe('Orchestrator Multi-Rounds Loop', () => {
  let mockStore: SwarmSQLiteStore;
  let contract: MigrationContract;

  beforeEach(() => {
    mockStore = createMockStore();
    contract = createMockContract();
  });

  it('should complete in 1 round if consensus reached immediately (backward compat)', async () => {
    // Arrange - default mock returns passing consensus
    const orchestrator = new SwarmOrchestrator({}, mockStore);

    // Act
    await orchestrator.execute(contract);

    // Assert - single round, COMPLETED status
    expect(mockStore.storeVotingRound).toHaveBeenCalledOnce();
    expect(mockStore.storeAnalysis).toHaveBeenCalledTimes(6); // 6 agents x 1 round
    expect(mockStore.completeSession).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ status: 'COMPLETED' }),
    );
  });

  it('should run multiple rounds until consensus reached', async () => {
    // Arrange - fail rounds 1-2, pass on round 3
    const orchestrator = new SwarmOrchestrator({ maxRounds: 5 }, mockStore);

    let roundCount = 0;
    (mockStore.storeVotingRound as Mock).mockImplementation((sessionId, roundNum, consensus) => {
      roundCount = roundNum;
      // Modify consensus to fail first 2 rounds
      if (roundNum < 3) {
        consensus.passed = false;
        consensus.score = 60;
      }
      return roundNum; // Return roundId
    });

    // Act
    await orchestrator.execute(contract);

    // Assert - 3 rounds executed
    expect(mockStore.storeVotingRound).toHaveBeenCalledTimes(3);
    expect(mockStore.storeAnalysis).toHaveBeenCalledTimes(18); // 6 agents x 3 rounds
    expect(mockStore.storeVote).toHaveBeenCalledTimes(18); // 6 votes x 3 rounds
  });

  it('should stop at maxRounds and mark TO_REVIEW if no consensus', async () => {
    // Arrange
    const orchestrator = new SwarmOrchestrator({ maxRounds: 3 }, mockStore);

    // Mock consensus always fails
    (mockStore.storeVotingRound as Mock).mockImplementation((sessionId, roundNum, consensus) => {
      consensus.passed = false;
      consensus.score = 50;
      consensus.recommendation = 'REVISE';
      return roundNum;
    });

    // Act
    await orchestrator.execute(contract);

    // Assert
    expect(mockStore.storeVotingRound).toHaveBeenCalledTimes(3); // Exactly maxRounds
    // D1: Now escalates instead of TO_REVIEW
    expect(mockStore.completeSession).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        status: 'ESCALATED',
        finalDecision: 'ESCALATED',
      }),
    );
  });

  it('should increment round numbers correctly', async () => {
    // Arrange
    const orchestrator = new SwarmOrchestrator({ maxRounds: 4 }, mockStore);

    (mockStore.storeVotingRound as Mock).mockImplementation((sessionId, roundNum, consensus) => {
      if (roundNum < 4) {
        consensus.passed = false;
        consensus.score = 65;
      }
      return roundNum;
    });

    // Act
    await orchestrator.execute(contract);

    // Assert - rounds 1, 2, 3, 4
    const calls = (mockStore.storeVotingRound as Mock).mock.calls;
    expect(calls[0][1]).toBe(1);
    expect(calls[1][1]).toBe(2);
    expect(calls[2][1]).toBe(3);
    expect(calls[3][1]).toBe(4);
  });

  it('should call applyRevisions between failed rounds', async () => {
    // Arrange
    const orchestrator = new SwarmOrchestrator({ maxRounds: 3 }, mockStore);
    const spy = vi.spyOn(orchestrator as any, 'applyRevisions');

    (mockStore.storeVotingRound as Mock).mockImplementation((sessionId, roundNum, consensus) => {
      consensus.passed = false;
      consensus.score = 55;
      return roundNum;
    });

    // Act
    await orchestrator.execute(contract);

    // Assert - applyRevisions called after round 1 and 2, NOT after round 3 (last)
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('should NOT call applyRevisions after final failed round', async () => {
    // Arrange
    const orchestrator = new SwarmOrchestrator({ maxRounds: 2 }, mockStore);
    const spy = vi.spyOn(orchestrator as any, 'applyRevisions');

    (mockStore.storeVotingRound as Mock).mockImplementation((sessionId, roundNum, consensus) => {
      consensus.passed = false;
      consensus.score = 60;
      return roundNum;
    });

    // Act
    await orchestrator.execute(contract);

    // Assert - only 1 call (after round 1), not after round 2 (final)
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should accumulate analyses across all rounds', async () => {
    // Arrange
    const orchestrator = new SwarmOrchestrator({ maxRounds: 3 }, mockStore);

    (mockStore.storeVotingRound as Mock).mockImplementation((sessionId, roundNum, consensus) => {
      consensus.passed = false;
      consensus.score = 50;
      return roundNum;
    });

    // Act
    await orchestrator.execute(contract);

    // Assert - 6 agents x 3 rounds = 18 analyses
    expect(mockStore.storeAnalysis).toHaveBeenCalledTimes(18);
  });

  it('should accumulate votes across all rounds', async () => {
    // Arrange
    const orchestrator = new SwarmOrchestrator({ maxRounds: 3 }, mockStore);

    (mockStore.storeVotingRound as Mock).mockImplementation((sessionId, roundNum, consensus) => {
      consensus.passed = false;
      consensus.score = 50;
      return roundNum;
    });

    // Act
    await orchestrator.execute(contract);

    // Assert - 6 votes x 3 rounds = 18 votes
    expect(mockStore.storeVote).toHaveBeenCalledTimes(18);
  });

  it('should update session phase correctly for each round', async () => {
    // Arrange
    const orchestrator = new SwarmOrchestrator({ maxRounds: 2 }, mockStore);

    (mockStore.storeVotingRound as Mock).mockImplementation((sessionId, roundNum, consensus) => {
      if (roundNum === 1) {
        consensus.passed = false;
        consensus.score = 60;
      }
      return roundNum;
    });

    // Act
    await orchestrator.execute(contract);

    // Assert - each round: analysis -> voting -> consensus
    const votingCalls = (mockStore.updateSessionStatus as Mock).mock.calls.filter(
      (call) => call[2] === 'voting',
    );
    const consensusCalls = (mockStore.updateSessionStatus as Mock).mock.calls.filter(
      (call) => call[2] === 'consensus',
    );

    expect(votingCalls.length).toBeGreaterThanOrEqual(2); // 2 rounds = 2x voting
    expect(consensusCalls.length).toBeGreaterThanOrEqual(2); // 2 rounds = 2x consensus
  });

  it('should fail session if error occurs during a round', async () => {
    // Arrange
    const orchestrator = new SwarmOrchestrator({ maxRounds: 5 }, mockStore);

    vi.spyOn(orchestrator as any, 'runAgentAnalyses').mockRejectedValueOnce(
      new Error('LLM timeout'),
    );

    // Act & Assert
    await expect(orchestrator.execute(contract)).rejects.toThrow('LLM timeout');

    expect(mockStore.completeSession).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ status: 'FAILED' }),
    );
  });
});
