/**
 * K4: Budget Guards Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { BudgetExceededError } from '../../src/swarm/types.js';
import { SwarmOrchestrator } from '../../src/swarm/orchestrator.js';
import { MockSwarmStore } from './integration/fixtures/mock-store.js';
import { SIMPLE_CONTRACT } from './integration/fixtures/mock-contracts.js';
import { ClaudeClient } from '../../src/swarm/llm/claude-client.js';

describe('Budget Guards (K4)', () => {
  let mockStore: MockSwarmStore;

  beforeEach(() => {
    mockStore = new MockSwarmStore();
  });

  it('should allow execution within session budget', async () => {
    const orchestrator = new SwarmOrchestrator(
      {
        minComplexityScore: 0,
        enableBudgetGuards: true,
        maxCostPerSession: 10.0, // $10 limit
        dailyBudget: 100.0,
      },
      mockStore as any,
    );

    // Mock votes should cost ~$0.01 total (well under limit)
    const result = await orchestrator.execute(SIMPLE_CONTRACT);

    expect(result.session.status).toBe('COMPLETED');
    // No error thrown - budget OK
  });

  it('should throw BudgetExceededError when session limit exceeded', async () => {
    const mockClient = {
      chat: async () => ({
        content: JSON.stringify({
          vote: 'APPROVE',
          confidence: 85,
          reasoning: 'Test',
          concerns: [],
          suggestions: [],
        }),
        usage: {
          inputTokens: 1000000, // 1M input tokens = $3 for sonnet
          outputTokens: 100000, // 100k output = $1.50
          totalCost: 4.5, // $4.50 per agent
        },
        model: 'sonnet',
        finishReason: 'stop' as const,
      }),
    } as ClaudeClient;

    const orchestrator = new SwarmOrchestrator(
      {
        minComplexityScore: 0,
        enableBudgetGuards: true,
        maxCostPerSession: 5.0, // $5 limit - will be exceeded (6 agents × $4.50 = $27)
        dailyBudget: 1000.0,
      },
      mockStore as any,
      mockClient,
    );

    await expect(orchestrator.execute(SIMPLE_CONTRACT)).rejects.toThrow(BudgetExceededError);
  });

  it('should throw with correct error details', async () => {
    const mockClient = {
      chat: async () => ({
        content: JSON.stringify({
          vote: 'APPROVE',
          confidence: 85,
          reasoning: 'Test',
          concerns: [],
          suggestions: [],
        }),
        usage: {
          inputTokens: 1000000,
          outputTokens: 100000,
          totalCost: 4.5,
        },
        model: 'sonnet',
        finishReason: 'stop' as const,
      }),
    } as ClaudeClient;

    const orchestrator = new SwarmOrchestrator(
      {
        minComplexityScore: 0,
        enableBudgetGuards: true,
        maxCostPerSession: 5.0,
        dailyBudget: 1000.0,
      },
      mockStore as any,
      mockClient,
    );

    try {
      await orchestrator.execute(SIMPLE_CONTRACT);
      expect.fail('Should have thrown BudgetExceededError');
    } catch (error) {
      expect(error).toBeInstanceOf(BudgetExceededError);
      const budgetError = error as BudgetExceededError;
      expect(budgetError.limitType).toBe('session');
      expect(budgetError.limit).toBe(5.0);
      expect(budgetError.currentCost).toBeGreaterThan(5.0);
    }
  });

  it('should not check budget when guards disabled', async () => {
    const mockClient = {
      chat: async () => ({
        content: JSON.stringify({
          vote: 'APPROVE',
          confidence: 85,
          reasoning: 'Test',
          concerns: [],
          suggestions: [],
        }),
        usage: {
          inputTokens: 1000000, // High cost
          outputTokens: 100000,
          totalCost: 4.5,
        },
        model: 'sonnet',
        finishReason: 'stop' as const,
      }),
    } as ClaudeClient;

    const orchestrator = new SwarmOrchestrator(
      {
        minComplexityScore: 0,
        enableBudgetGuards: false, // Disabled
        maxCostPerSession: 0.01, // Very low limit
        dailyBudget: 0.01,
      },
      mockStore as any,
      mockClient,
    );

    // Should not throw even though cost exceeds limits
    const result = await orchestrator.execute(SIMPLE_CONTRACT);
    expect(result.session.status).toBe('COMPLETED');
  });

  it('BudgetExceededError should have correct properties', () => {
    const error = new BudgetExceededError('Test message', 10.5, 5.0, 'session');

    expect(error.message).toBe('Test message');
    expect(error.currentCost).toBe(10.5);
    expect(error.limit).toBe(5.0);
    expect(error.limitType).toBe('session');
    expect(error.name).toBe('BudgetExceededError');
  });
});
