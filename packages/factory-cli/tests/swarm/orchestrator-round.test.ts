/**
 * Tests for Single Round Loop (Chantier B1)
 *
 * Validates that orchestrator correctly stores analyses, votes, and round data
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
    storeVotingRound: vi.fn().mockReturnValue(1), // Return roundId = 1
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

describe('Orchestrator Single Round Loop', () => {
  let mockStore: SwarmSQLiteStore;
  let orchestrator: SwarmOrchestrator;
  let contract: MigrationContract;

  beforeEach(() => {
    mockStore = createMockStore();
    orchestrator = new SwarmOrchestrator({}, mockStore);
    contract = createMockContract();
  });

  it('should store all analyses after runAgentAnalyses', async () => {
    // Act
    await orchestrator.execute(contract);

    // Assert - 6 agents = 6 analyses
    expect(mockStore.storeAnalysis).toHaveBeenCalledTimes(6);
    expect(mockStore.storeAnalysis).toHaveBeenCalledWith(
      expect.any(String), // sessionId
      1, // roundNumber
      expect.objectContaining({
        agent: expect.any(String),
        analysis: expect.any(Object),
        proposal: expect.any(Object),
        duration: expect.any(Number),
      }),
    );
  });

  it('should update phase to voting after analyses', async () => {
    // Act
    await orchestrator.execute(contract);

    // Assert
    const votingCalls = (mockStore.updateSessionStatus as Mock).mock.calls.filter(
      (call) => call[2] === 'voting'
    );
    expect(votingCalls.length).toBeGreaterThan(0);
    expect(votingCalls[0]).toEqual([
      expect.any(String), // sessionId
      'IN_PROGRESS',
      'voting',
    ]);
  });

  it('should create voting round with consensus data', async () => {
    // Act
    await orchestrator.execute(contract);

    // Assert
    expect(mockStore.storeVotingRound).toHaveBeenCalledOnce();
    expect(mockStore.storeVotingRound).toHaveBeenCalledWith(
      expect.any(String), // sessionId
      1, // roundNumber
      expect.objectContaining({
        score: expect.any(Number),
        passed: expect.any(Boolean),
        threshold: expect.any(Number),
        votes: expect.any(Array),
        concernsSummary: expect.any(Object),
        recommendation: expect.stringMatching(/PROCEED|REVISE|REJECT/),
      }),
      expect.objectContaining({
        durationMs: expect.any(Number),
        totalTokensCost: expect.any(Number),
      }),
    );
  });

  it('should store individual votes for all agents', async () => {
    // Act
    await orchestrator.execute(contract);

    // Assert - 6 agents = 6 votes
    expect(mockStore.storeVote).toHaveBeenCalledTimes(6);
    expect(mockStore.storeVote).toHaveBeenCalledWith(
      1, // roundId (mocked return value)
      expect.objectContaining({
        agent: expect.any(String),
        vote: expect.any(String),
        confidence: expect.any(Number),
        weight: expect.any(Number),
        justification: expect.any(String),
        concerns: expect.any(Array),
        suggestions: expect.any(Array),
        timestamp: expect.any(Date),
      }),
    );
  });

  it('should update phase to consensus after voting', async () => {
    // Act
    await orchestrator.execute(contract);

    // Assert
    const consensusCalls = (mockStore.updateSessionStatus as Mock).mock.calls.filter(
      (call) => call[2] === 'consensus'
    );
    expect(consensusCalls.length).toBeGreaterThan(0);
    expect(consensusCalls[0]).toEqual([
      expect.any(String), // sessionId
      'IN_PROGRESS',
      'consensus',
    ]);
  });

  it('should include voting duration in round metadata', async () => {
    // Act
    await orchestrator.execute(contract);

    // Assert
    const roundMetadata = (mockStore.storeVotingRound as Mock).mock.calls[0][3];
    expect(roundMetadata.durationMs).toBeGreaterThanOrEqual(0); // Can be 0 for instant stubs
    expect(roundMetadata.durationMs).toBeTypeOf('number');
  });

  it('should calculate total token cost from analyses', async () => {
    // Act
    await orchestrator.execute(contract);

    // Assert - Token cost should be calculated (even if 0 for mocks)
    const roundMetadata = (mockStore.storeVotingRound as Mock).mock.calls[0][3];
    expect(roundMetadata.totalTokensCost).toBeTypeOf('number');
    expect(roundMetadata.totalTokensCost).toBeGreaterThanOrEqual(0);

    // Also check in completeSession
    const completeData = (mockStore.completeSession as Mock).mock.calls[0][1];
    expect(completeData.totalTokensCost).toBeTypeOf('number');
    expect(completeData.totalTokensCost).toBeGreaterThanOrEqual(0);
  });

  it('should track total rounds via trigger (1 round for single loop)', async () => {
    // Act
    await orchestrator.execute(contract);

    // Assert - storeVotingRound called once means trigger sets total_rounds = 1
    expect(mockStore.storeVotingRound).toHaveBeenCalledOnce();
    const [sessionId, roundNumber] = (mockStore.storeVotingRound as Mock).mock.calls[0];
    expect(roundNumber).toBe(1);
    // Note: total_rounds is updated by SQL trigger, not tested here directly
  });
});
