/**
 * Tests for Orchestrator + Storage Integration (Chantier A2)
 *
 * Validates that orchestrator correctly persists session lifecycle to DB
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
    completeSession: vi.fn(),
    close: vi.fn(),
  } as unknown as SwarmSQLiteStore;
}

// Mock contract factory
function createMockContract(): MigrationContract {
  // Create enough expressions to trigger SWARM (complexityThreshold = 30)
  // Score formula: expressionCount * 0.8 = 50 * 0.8 = 40 points → SWARM activated
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
      legacy_expressions: expressions, // Used by complexity calculator
      tables, // Used by complexity calculator
    },
    expressions, // Keep for backward compat
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

describe('Orchestrator Storage Integration', () => {
  let mockStore: SwarmSQLiteStore;
  let orchestrator: SwarmOrchestrator;
  let contract: MigrationContract;

  beforeEach(() => {
    mockStore = createMockStore();
    orchestrator = new SwarmOrchestrator({}, mockStore);
    contract = createMockContract();
  });

  it('should create session in DB at start of execute', async () => {
    // Act
    await orchestrator.execute(contract);

    // Assert
    expect(mockStore.createSession).toHaveBeenCalledOnce();
    expect(mockStore.createSession).toHaveBeenCalledWith(
      expect.objectContaining({
        id: expect.any(String),
        programId: 42,
        programName: 'TEST_PROGRAM',
        status: 'IN_PROGRESS',
        current_phase: 'complexity',
        config_snapshot: expect.any(Object),
        startedAt: expect.any(Date),
        total_agents_used: 0,
      }),
    );
  });

  it('should store complexity assessment in DB', async () => {
    // Act
    await orchestrator.execute(contract);

    // Assert
    expect(mockStore.storeComplexity).toHaveBeenCalledOnce();
    expect(mockStore.storeComplexity).toHaveBeenCalledWith(
      expect.any(String), // sessionId
      expect.objectContaining({
        score: expect.any(Number),
        level: expect.any(String),
        useSwarm: expect.any(Boolean),
        requiresDoubleVote: expect.any(Boolean),
        indicators: expect.any(Object),
        explanation: expect.any(String),
      }),
    );
  });

  it('should update session phase after complexity', async () => {
    // Act
    await orchestrator.execute(contract);

    // Assert
    expect(mockStore.updateSessionStatus).toHaveBeenCalled();
    expect(mockStore.updateSessionStatus).toHaveBeenCalledWith(
      expect.any(String), // sessionId
      'IN_PROGRESS',
      'analysis',
    );
  });

  it('should complete session with COMPLETED status on success', async () => {
    // Act
    await orchestrator.execute(contract);

    // Assert
    expect(mockStore.completeSession).toHaveBeenCalledOnce();
    expect(mockStore.completeSession).toHaveBeenCalledWith(
      expect.any(String), // sessionId
      expect.objectContaining({
        status: 'COMPLETED',
        finalConsensusScore: expect.any(Number),
        finalDecision: expect.stringMatching(/PROCEED|REJECT/),
        durationMs: expect.any(Number),
        totalTokensCost: 0, // Not calculated yet in A2
      }),
    );
  });

  it('should mark session as FAILED when execute throws', async () => {
    // Arrange - Force une erreur dans runAgentAnalyses
    const orchestratorWithError = new SwarmOrchestrator(
      { complexityThreshold: 0 }, // Force SWARM activation
      mockStore,
    );

    // Spy on private method to force error
    vi.spyOn(
      orchestratorWithError as unknown as { runAgentAnalyses: () => Promise<never> },
      'runAgentAnalyses',
    ).mockRejectedValue(new Error('Agent failed'));

    // Act & Assert
    await expect(orchestratorWithError.execute(contract)).rejects.toThrow('Agent failed');

    expect(mockStore.completeSession).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        status: 'FAILED',
        durationMs: expect.any(Number),
      }),
    );
  });

  it('should propagate DB errors to caller (fail-fast)', async () => {
    // Arrange - Force DB error on createSession
    (mockStore.createSession as Mock).mockImplementation(() => {
      throw new Error('DB locked');
    });

    // Act & Assert
    await expect(orchestrator.execute(contract)).rejects.toThrow('DB locked');

    // Session creation failed, so no other DB operations should happen
    expect(mockStore.storeComplexity).not.toHaveBeenCalled();
    expect(mockStore.completeSession).not.toHaveBeenCalled();
  });
});
