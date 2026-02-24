/**
 * SWARM Integration Tests (E2E) - Simplified
 *
 * Tests complete SWARM sessions with mocked LLM API
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SwarmOrchestrator } from '../../../src/swarm/orchestrator.js';
import { AgentExecutor } from '../../../src/swarm/agents/agent-executor.js';
import { ClaudeClient } from '../../../src/swarm/llm/claude-client.js';
import { AgentRoles } from '../../../src/swarm/types.js';
import type { LLMMessage, LLMResponse } from '../../../src/swarm/llm/types.js';
import {
  SIMPLE_CONTRACT,
  COMPLEX_CONTRACT,
  CRITICAL_ISSUES_CONTRACT,
} from './fixtures/mock-contracts.js';
import {
  MOCK_RESPONSES,
} from './fixtures/mock-llm-responses.js';
import { MockSwarmStore } from './fixtures/mock-store.js';

describe('SWARM Integration Tests - Simplified', () => {
  let mockClient: ClaudeClient;
  let executor: AgentExecutor;
  let mockStore: MockSwarmStore;
  let orchestrator: SwarmOrchestrator;

  beforeEach(() => {
    // Create mock store (avoid better-sqlite3 dependency)
    mockStore = new MockSwarmStore();

    // Create mock client
    mockClient = {
      chat: vi.fn(),
    } as unknown as ClaudeClient;

    executor = new AgentExecutor(mockClient);
    // Force SWARM usage by lowering threshold
    orchestrator = new SwarmOrchestrator({ minComplexityScore: 0 }, mockStore as any, mockClient);
  });

  it('should execute session with LLM agent votes', async () => {
    // Setup: All agents APPROVE
    vi.mocked(mockClient.chat).mockImplementation(async (messages: LLMMessage[]) => {
      const systemPrompt = messages[0].content;
      if (systemPrompt.includes('ARCHITECT')) return MOCK_RESPONSES.UNANIMOUS_APPROVE.architect;
      if (systemPrompt.includes('ANALYST')) return MOCK_RESPONSES.UNANIMOUS_APPROVE.analyst;
      if (systemPrompt.includes('DEVELOPER')) return MOCK_RESPONSES.UNANIMOUS_APPROVE.developer;
      if (systemPrompt.includes('TESTER')) return MOCK_RESPONSES.UNANIMOUS_APPROVE.tester;
      if (systemPrompt.includes('REVIEWER')) return MOCK_RESPONSES.UNANIMOUS_APPROVE.reviewer;
      if (systemPrompt.includes('DOCUMENTOR')) return MOCK_RESPONSES.UNANIMOUS_APPROVE.documentor;
      throw new Error('Unknown agent');
    });

    // Execute
    const result = await orchestrator.execute(SIMPLE_CONTRACT);

    // Assert basic structure
    expect(result.session).toBeDefined();
    expect(result.consensus).toBeDefined();
    expect(result.shouldProceed).toBeDefined();
    expect(result.session.votes.length).toBeGreaterThanOrEqual(6); // At least 6 agents voted (12 if double vote)

    // Verify agents voted
    const agents = result.session.votes.map((v) => v.agent);
    expect(agents).toContain(AgentRoles.ARCHITECT);
    expect(agents).toContain(AgentRoles.ANALYST);
    expect(agents).toContain(AgentRoles.DEVELOPER);
    expect(agents).toContain(AgentRoles.TESTER);
    expect(agents).toContain(AgentRoles.REVIEWER);
    expect(agents).toContain(AgentRoles.DOCUMENTOR);

    // Verify LLM was called for each agent (6 for first vote, maybe 6 more for double vote if critical)
    expect(mockClient.chat).toHaveBeenCalled();
    expect(mockClient.chat.mock.calls.length).toBeGreaterThanOrEqual(6);
  });

  it('should pass correct context to agents', async () => {
    vi.mocked(mockClient.chat).mockImplementation(async (messages: LLMMessage[]) => {
      const systemPrompt = messages[0].content;
      const userPrompt = messages[1].content;

      // Verify context includes contract info
      expect(userPrompt).toContain('Migration Contract');
      expect(userPrompt).toContain('**Voting Round:**');
      expect(userPrompt).toContain('**Complexity:**');

      if (systemPrompt.includes('ARCHITECT')) return MOCK_RESPONSES.UNANIMOUS_APPROVE.architect;
      if (systemPrompt.includes('ANALYST')) return MOCK_RESPONSES.UNANIMOUS_APPROVE.analyst;
      if (systemPrompt.includes('DEVELOPER')) return MOCK_RESPONSES.UNANIMOUS_APPROVE.developer;
      if (systemPrompt.includes('TESTER')) return MOCK_RESPONSES.UNANIMOUS_APPROVE.tester;
      if (systemPrompt.includes('REVIEWER')) return MOCK_RESPONSES.UNANIMOUS_APPROVE.reviewer;
      if (systemPrompt.includes('DOCUMENTOR')) return MOCK_RESPONSES.UNANIMOUS_APPROVE.documentor;
      throw new Error('Unknown agent');
    });

    await orchestrator.execute(SIMPLE_CONTRACT);

    expect(mockClient.chat).toHaveBeenCalled();
  });

  it('should handle veto votes', async () => {
    // Setup: ARCHITECT vetoes
    vi.mocked(mockClient.chat).mockImplementation(async (messages: LLMMessage[]) => {
      const systemPrompt = messages[0].content;
      if (systemPrompt.includes('ARCHITECT')) return MOCK_RESPONSES.VETO_BLOCK.architect;
      if (systemPrompt.includes('ANALYST')) return MOCK_RESPONSES.VETO_BLOCK.analyst;
      if (systemPrompt.includes('DEVELOPER')) return MOCK_RESPONSES.VETO_BLOCK.developer;
      if (systemPrompt.includes('TESTER')) return MOCK_RESPONSES.VETO_BLOCK.tester;
      if (systemPrompt.includes('REVIEWER')) return MOCK_RESPONSES.VETO_BLOCK.reviewer;
      if (systemPrompt.includes('DOCUMENTOR')) return MOCK_RESPONSES.VETO_BLOCK.documentor;
      throw new Error('Unknown agent');
    });

    // Execute
    const result = await orchestrator.execute(CRITICAL_ISSUES_CONTRACT);

    // Verify veto captured via BLOCKER concerns (veto is detected by concerns, not a direct field)
    const votesWithBlockers = result.session.votes.filter(
      (v) => v.concerns.some((c) => c.severity === 'BLOCKER'),
    );
    expect(votesWithBlockers.length).toBeGreaterThan(0);
    const architectVote = result.session.votes.find((v) => v.agent === AgentRoles.ARCHITECT);
    expect(architectVote?.concerns.some((c) => c.severity === 'BLOCKER')).toBe(true);
  });

  it('should track token usage', async () => {
    vi.mocked(mockClient.chat).mockImplementation(async (messages: LLMMessage[]) => {
      const systemPrompt = messages[0].content;
      if (systemPrompt.includes('ARCHITECT')) return MOCK_RESPONSES.UNANIMOUS_APPROVE.architect;
      if (systemPrompt.includes('ANALYST')) return MOCK_RESPONSES.UNANIMOUS_APPROVE.analyst;
      if (systemPrompt.includes('DEVELOPER')) return MOCK_RESPONSES.UNANIMOUS_APPROVE.developer;
      if (systemPrompt.includes('TESTER')) return MOCK_RESPONSES.UNANIMOUS_APPROVE.tester;
      if (systemPrompt.includes('REVIEWER')) return MOCK_RESPONSES.UNANIMOUS_APPROVE.reviewer;
      if (systemPrompt.includes('DOCUMENTOR')) return MOCK_RESPONSES.UNANIMOUS_APPROVE.documentor;
      throw new Error('Unknown agent');
    });

    const result = await orchestrator.execute(SIMPLE_CONTRACT);

    // Verify token tracking in analyses (tokens are tracked per analysis, not per vote)
    expect(result.session.analyses.length).toBeGreaterThan(0);
    for (const analysis of result.session.analyses) {
      if (analysis.tokens) {
        expect(analysis.tokens.input).toBeGreaterThan(0);
        expect(analysis.tokens.output).toBeGreaterThan(0);
        expect(analysis.tokens.cost).toBeGreaterThan(0);
      }
    }
  });

  it('should fallback to mock votes when no client provided', async () => {
    // Create orchestrator without client
    const orchestratorNoClient = new SwarmOrchestrator({ minComplexityScore: 0 }, mockStore as any);

    const result = await orchestratorNoClient.execute(SIMPLE_CONTRACT);

    // Should still complete with mock votes
    expect(result.session).toBeDefined();
    expect(result.session.votes).toHaveLength(6);
    expect(result.consensus).toBeDefined();
  });

  it('should validate agent responses and fallback on error', async () => {
    // Setup: Invalid response (missing reasoning) - will trigger fallback to mock votes
    vi.mocked(mockClient.chat).mockResolvedValue({
      content: JSON.stringify({
        vote: 'APPROVE',
        confidence: 85,
        // Missing reasoning field - validation will fail
      }),
      usage: { inputTokens: 100, outputTokens: 50, totalCost: 0.001 },
      model: 'claude-sonnet-4',
      finishReason: 'stop',
    } as LLMResponse);

    // Orchestrator should handle error gracefully with mock votes
    const result = await orchestrator.execute(SIMPLE_CONTRACT);

    // Session should complete (with fallback mock votes)
    expect(result.session.status).toBe('COMPLETED');
    expect(result.session.votes).toHaveLength(6);

    // Votes should have mock justification (fallback was used)
    const hasMockVotes = result.session.votes.some((v) =>
      v.justification.includes('Mock vote'),
    );
    expect(hasMockVotes).toBe(true);
  });

  it('should handle LLM errors gracefully', async () => {
    // Setup: LLM error - will trigger fallback to mock votes
    vi.mocked(mockClient.chat).mockRejectedValue(new Error('LLM service unavailable'));

    // Orchestrator should handle error gracefully with mock votes
    const result = await orchestrator.execute(SIMPLE_CONTRACT);

    // Session should complete (with fallback mock votes)
    expect(result.session.status).toBe('COMPLETED');
    expect(result.session.votes).toHaveLength(6);

    // All votes should be mock votes (fallback was used for all agents)
    const allMockVotes = result.session.votes.every((v) =>
      v.justification.includes('Mock vote'),
    );
    expect(allMockVotes).toBe(true);
  });

  it('should analyze multiple contracts in sequence', async () => {
    vi.mocked(mockClient.chat).mockImplementation(async (messages: LLMMessage[]) => {
      const systemPrompt = messages[0].content;
      if (systemPrompt.includes('ARCHITECT')) return MOCK_RESPONSES.UNANIMOUS_APPROVE.architect;
      if (systemPrompt.includes('ANALYST')) return MOCK_RESPONSES.UNANIMOUS_APPROVE.analyst;
      if (systemPrompt.includes('DEVELOPER')) return MOCK_RESPONSES.UNANIMOUS_APPROVE.developer;
      if (systemPrompt.includes('TESTER')) return MOCK_RESPONSES.UNANIMOUS_APPROVE.tester;
      if (systemPrompt.includes('REVIEWER')) return MOCK_RESPONSES.UNANIMOUS_APPROVE.reviewer;
      if (systemPrompt.includes('DOCUMENTOR')) return MOCK_RESPONSES.UNANIMOUS_APPROVE.documentor;
      throw new Error('Unknown agent');
    });

    // Analyze multiple contracts
    const result1 = await orchestrator.execute(SIMPLE_CONTRACT);
    const result2 = await orchestrator.execute(COMPLEX_CONTRACT);

    expect(result1.session.status).toBe('COMPLETED');
    expect(result2.session.status).toBe('COMPLETED');
    expect(result1.session.id).not.toBe(result2.session.id);
  });
});
