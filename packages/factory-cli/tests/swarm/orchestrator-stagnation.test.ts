/**
 * Tests for Stagnation Detection (Chantier C2)
 *
 * Validates that orchestrator correctly detects stagnation and escalates
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

describe('Orchestrator Stagnation Detection', () => {
  let mockStore: SwarmSQLiteStore;
  let contract: MigrationContract;

  beforeEach(() => {
    mockStore = createMockStore();
    contract = createMockContract();
  });

  it('should NOT detect stagnation on first round', async () => {
    // Arrange
    const orchestrator = new SwarmOrchestrator({ maxRounds: 5 }, mockStore);

    // Mock collectAgentVotes to return votes that produce ~65% consensus
    vi.spyOn(orchestrator as any, 'collectAgentVotes').mockResolvedValue([
      {
        agent: 'architect',
        vote: 'APPROVE_WITH_CONCERNS',
        confidence: 70,
        weight: 2.0,
        justification: 'Acceptable',
        concerns: [],
        suggestions: [],
        timestamp: new Date(),
      },
    ]);

    // Act
    await orchestrator.execute(contract);

    // Assert - first round, no stagnation can be detected
    const firstRoundCall = (mockStore.storeVotingRound as Mock).mock.calls[0];
    const metadata = firstRoundCall[3];

    expect(metadata.stagnationDetected).toBeUndefined();
    expect(metadata.previousRoundScore).toBeUndefined();
    expect(metadata.scoreDelta).toBeUndefined();
  });

  it('should NOT detect stagnation if score improves', async () => {
    // Arrange
    const orchestrator = new SwarmOrchestrator({ maxRounds: 4 }, mockStore);

    let callCount = 0;
    vi.spyOn(orchestrator as any, 'collectAgentVotes').mockImplementation(() => {
      callCount++;
      // Improving scores: 60% → 68% → 75%
      if (callCount === 1) {
        // Round 1: ~60% consensus (APPROVE_WITH_CONCERNS with moderate confidence)
        return Promise.resolve([
          {
            agent: 'architect',
            vote: 'APPROVE_WITH_CONCERNS',
            confidence: 60,
            weight: 2.0,
            justification: 'Some concerns',
            concerns: [],
            suggestions: [],
            timestamp: new Date(),
          },
        ]);
      } else if (callCount === 2) {
        // Round 2: ~68% consensus (higher confidence)
        return Promise.resolve([
          {
            agent: 'architect',
            vote: 'APPROVE_WITH_CONCERNS',
            confidence: 70,
            weight: 2.0,
            justification: 'Better',
            concerns: [],
            suggestions: [],
            timestamp: new Date(),
          },
        ]);
      } else {
        // Round 3: ~75% consensus (pass threshold)
        return Promise.resolve([
          {
            agent: 'architect',
            vote: 'APPROVE',
            confidence: 75,
            weight: 2.0,
            justification: 'Good',
            concerns: [],
            suggestions: [],
            timestamp: new Date(),
          },
        ]);
      }
    });

    // Act
    await orchestrator.execute(contract);

    // Assert - no stagnation detected (improving trend)
    const calls = (mockStore.storeVotingRound as Mock).mock.calls;
    expect(calls).toHaveLength(3); // 3 rounds until consensus

    // Round 2: no stagnation (improving)
    const round2Metadata = calls[1][3];
    expect(round2Metadata.stagnationDetected).toBeUndefined();

    // Round 3: passed consensus, no stagnation check
    const round3Metadata = calls[2][3];
    expect(round3Metadata.stagnationDetected).toBeUndefined();
  });

  it('should detect stagnation after 2 flat rounds', async () => {
    // Arrange
    const orchestrator = new SwarmOrchestrator({ maxRounds: 5 }, mockStore);

    // Mock to return same votes (flat scores: ~65%)
    vi.spyOn(orchestrator as any, 'collectAgentVotes').mockResolvedValue([
      {
        agent: 'architect',
        vote: 'APPROVE_WITH_CONCERNS',
        confidence: 65,
        weight: 2.0,
        justification: 'Same score each round',
        concerns: [],
        suggestions: [],
        timestamp: new Date(),
      },
    ]);

    // Act
    await orchestrator.execute(contract);

    // Assert - stagnation detected at round 3
    const calls = (mockStore.storeVotingRound as Mock).mock.calls;
    expect(calls).toHaveLength(3); // Stopped at round 3 due to stagnation

    // Round 3: stagnation detected
    const round3Metadata = calls[2][3];
    expect(round3Metadata.stagnationDetected).toBe(true);
    expect(round3Metadata.previousRoundScore).toBeDefined();
    expect(round3Metadata.scoreDelta).toBeDefined();
  });

  it('should detect stagnation after score regression', async () => {
    // Arrange
    const orchestrator = new SwarmOrchestrator({ maxRounds: 5 }, mockStore);

    let callCount = 0;
    vi.spyOn(orchestrator as any, 'collectAgentVotes').mockImplementation(() => {
      callCount++;
      // Regressing scores
      if (callCount === 1) {
        // Round 1: ~68% (within tolerance of each other)
        return Promise.resolve([
          {
            agent: 'architect',
            vote: 'APPROVE_WITH_CONCERNS',
            confidence: 68,
            weight: 2.0,
            justification: 'Start',
            concerns: [],
            suggestions: [],
            timestamp: new Date(),
          },
        ]);
      } else {
        // Round 2+: same ~68% (stagnant within 0.5% tolerance)
        return Promise.resolve([
          {
            agent: 'architect',
            vote: 'APPROVE_WITH_CONCERNS',
            confidence: 68,
            weight: 2.0,
            justification: 'Same',
            concerns: [],
            suggestions: [],
            timestamp: new Date(),
          },
        ]);
      }
    });

    // Act
    await orchestrator.execute(contract);

    // Assert - stagnation detected (no improvement)
    const calls = (mockStore.storeVotingRound as Mock).mock.calls;
    expect(calls).toHaveLength(3); // Stopped at round 3

    // Round 3: stagnation detected
    const round3Metadata = calls[2][3];
    expect(round3Metadata.stagnationDetected).toBe(true);
    expect(round3Metadata.previousRoundScore).toBeDefined();
    expect(round3Metadata.scoreDelta).toBeDefined();
  });

  it('should escalate TO_REVIEW when stagnation detected', async () => {
    // Arrange
    const orchestrator = new SwarmOrchestrator({ maxRounds: 5 }, mockStore);

    // Mock flat scores at 65%
    vi.spyOn(orchestrator as any, 'collectAgentVotes').mockResolvedValue([
      {
        agent: 'architect',
        vote: 'APPROVE_WITH_CONCERNS',
        confidence: 65,
        weight: 2.0,
        justification: 'Stagnant',
        concerns: [],
        suggestions: [],
        timestamp: new Date(),
      },
    ]);

    // Act
    await orchestrator.execute(contract);

    // Assert - stopped early at round 3, not maxRounds=5
    const calls = (mockStore.storeVotingRound as Mock).mock.calls;
    expect(calls).toHaveLength(3); // Stopped at round 3 (stagnation)

    // D1: Session marked ESCALATED (not TO_REVIEW)
    expect(mockStore.completeSession).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        status: 'ESCALATED',
        finalDecision: 'ESCALATED',
      }),
    );
  });

  it('should store stagnation metadata in voting round', async () => {
    // Arrange
    const orchestrator = new SwarmOrchestrator({ maxRounds: 5 }, mockStore);

    // Mock stagnant scores
    vi.spyOn(orchestrator as any, 'collectAgentVotes').mockResolvedValue([
      {
        agent: 'architect',
        vote: 'APPROVE_WITH_CONCERNS',
        confidence: 62,
        weight: 2.0,
        justification: 'Stagnant score',
        concerns: [],
        suggestions: [],
        timestamp: new Date(),
      },
    ]);

    // Act
    await orchestrator.execute(contract);

    // Assert - stagnation metadata stored
    const calls = (mockStore.storeVotingRound as Mock).mock.calls;
    const round3Call = calls[2];

    expect(round3Call[3]).toEqual(
      expect.objectContaining({
        durationMs: expect.any(Number),
        totalTokensCost: expect.any(Number),
        stagnationDetected: true,
        previousRoundScore: expect.any(Number),
        scoreDelta: expect.any(Number),
      }),
    );

    // Verify stagnation detected
    const metadata = round3Call[3];
    expect(metadata.stagnationDetected).toBe(true);
    expect(metadata.previousRoundScore).toBeDefined();
    expect(metadata.scoreDelta).toBeDefined();
  });
});
