/**
 * Agent Executor Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AgentExecutor } from '../../../src/swarm/agents/agent-executor.js';
import { AgentRoles, type ComplexityScore } from '../../../src/swarm/types.js';
import type { ExtendedMigrationContract } from '../../../src/core/contract.js';
import type { ClaudeClient } from '../../../src/swarm/llm/claude-client.js';
import type { LLMResponse, LLMMessage } from '../../../src/swarm/llm/types.js';

describe('AgentExecutor', () => {
  let mockClient: ClaudeClient;
  let executor: AgentExecutor;

  const mockContract: ExtendedMigrationContract = {
    version: '1.0',
    specmapVersion: '7.0.0',
    program: {
      id: '123',
      name: 'TestProgram',
    },
    tables: [],
    rules: [
      {
        id: 'R1',
        description: 'Test rule',
        tags: [],
      },
    ],
  };

  const mockComplexity: ComplexityScore = {
    score: 50,
    level: 'MEDIUM' as const,
    breakdown: {
      dataComplexity: 10,
      logicComplexity: 15,
      integrationComplexity: 10,
      technicalDebt: 15,
    },
  };

  beforeEach(() => {
    // Create mock client
    mockClient = {
      chat: vi.fn(),
    } as unknown as ClaudeClient;

    executor = new AgentExecutor(mockClient);
  });

  it('should execute agent successfully', async () => {
    const mockResponse: LLMResponse = {
      content: JSON.stringify({
        vote: 'APPROVE',
        confidence: 85,
        reasoning: 'Contract is well-defined',
        veto: false,
        blockerConcerns: [],
      }),
      usage: {
        inputTokens: 100,
        outputTokens: 50,
        totalCost: 0.001,
      },
      model: 'claude-sonnet-4',
      finishReason: 'stop',
    };

    vi.mocked(mockClient.chat).mockResolvedValue(mockResponse);

    const vote = await executor.executeAgent(
      AgentRoles.ARCHITECT,
      mockContract,
      {
        roundNumber: 1,
        complexity: mockComplexity,
      },
    );

    expect(vote.agent).toBe(AgentRoles.ARCHITECT);
    expect(vote.vote).toBe('APPROVE');
    expect(vote.confidence).toBe(85);
    expect(vote.reasoning).toBe('Contract is well-defined');
    expect(vote.veto).toBe(false);
    expect(vote.blockerConcerns).toEqual([]);
    expect(vote.tokens).toEqual({
      input: 100,
      output: 50,
      cost: 0.001,
    });
  });

  it('should pass correct messages to LLM', async () => {
    const mockResponse: LLMResponse = {
      content: JSON.stringify({
        vote: 'APPROVE',
        confidence: 80,
        reasoning: 'Good',
      }),
      usage: { inputTokens: 100, outputTokens: 50, totalCost: 0.001 },
      model: 'claude-sonnet-4',
      finishReason: 'stop',
    };

    vi.mocked(mockClient.chat).mockResolvedValue(mockResponse);

    await executor.executeAgent(
      AgentRoles.ANALYST,
      mockContract,
      {
        roundNumber: 1,
        complexity: mockComplexity,
      },
    );

    expect(mockClient.chat).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ role: 'system' }),
        expect.objectContaining({ role: 'user' }),
      ]),
    );

    const messages = vi.mocked(mockClient.chat).mock.calls[0][0] as LLMMessage[];
    expect(messages[0].role).toBe('system');
    expect(messages[0].content).toContain('ANALYST');
    expect(messages[1].role).toBe('user');
    expect(messages[1].content).toContain('Migration Contract');
    expect(messages[1].content).toContain('**Voting Round:** 1');
    expect(messages[1].content).toContain('**Complexity:** MEDIUM');
  });

  it('should include previous votes in context', async () => {
    const mockResponse: LLMResponse = {
      content: JSON.stringify({
        vote: 'APPROVE',
        confidence: 80,
        reasoning: 'Good',
      }),
      usage: { inputTokens: 100, outputTokens: 50, totalCost: 0.001 },
      model: 'claude-sonnet-4',
      finishReason: 'stop',
    };

    vi.mocked(mockClient.chat).mockResolvedValue(mockResponse);

    await executor.executeAgent(
      AgentRoles.REVIEWER,
      mockContract,
      {
        roundNumber: 2,
        previousVotes: [
          {
            agent: AgentRoles.ARCHITECT,
            vote: 'REJECT',
            confidence: 70,
            blockerConcerns: ['Missing schema'],
            reasoning: 'Test',
          },
        ],
        complexity: mockComplexity,
      },
    );

    const messages = vi.mocked(mockClient.chat).mock.calls[0][0] as LLMMessage[];
    expect(messages[1].content).toContain('Previous Round Votes');
    expect(messages[1].content).toContain('**REJECT:** 1 votes');
  });

  it('should parse LLM response from markdown', async () => {
    const mockResponse: LLMResponse = {
      content: `Here is my analysis:
\`\`\`json
{
  "vote": "REJECT",
  "confidence": 65,
  "reasoning": "Critical issues found",
  "veto": true,
  "blockerConcerns": ["Data integrity risk"]
}
\`\`\``,
      usage: { inputTokens: 100, outputTokens: 50, totalCost: 0.001 },
      model: 'claude-sonnet-4',
      finishReason: 'stop',
    };

    vi.mocked(mockClient.chat).mockResolvedValue(mockResponse);

    const vote = await executor.executeAgent(
      AgentRoles.TESTER,
      mockContract,
      {
        roundNumber: 1,
        complexity: mockComplexity,
      },
    );

    expect(vote.vote).toBe('REJECT');
    expect(vote.confidence).toBe(65);
    expect(vote.reasoning).toBe('Critical issues found');
    expect(vote.veto).toBe(true);
    expect(vote.blockerConcerns).toEqual(['Data integrity risk']);
  });

  it('should throw error if LLM response is invalid', async () => {
    const mockResponse: LLMResponse = {
      content: JSON.stringify({
        vote: 'INVALID_VOTE',
        confidence: 80,
        reasoning: 'Test',
      }),
      usage: { inputTokens: 100, outputTokens: 50, totalCost: 0.001 },
      model: 'claude-sonnet-4',
      finishReason: 'stop',
    };

    vi.mocked(mockClient.chat).mockResolvedValue(mockResponse);

    await expect(
      executor.executeAgent(
        AgentRoles.ARCHITECT,
        mockContract,
        {
          roundNumber: 1,
          complexity: mockComplexity,
        },
      ),
    ).rejects.toThrow(/Invalid vote value/);
  });

  it('should propagate LLM errors', async () => {
    vi.mocked(mockClient.chat).mockRejectedValue(new Error('LLM service unavailable'));

    await expect(
      executor.executeAgent(
        AgentRoles.DEVELOPER,
        mockContract,
        {
          roundNumber: 1,
          complexity: mockComplexity,
        },
      ),
    ).rejects.toThrow('LLM service unavailable');
  });

  it('should handle missing optional fields in LLM response', async () => {
    const mockResponse: LLMResponse = {
      content: JSON.stringify({
        vote: 'APPROVE',
        confidence: 90,
        reasoning: 'All requirements met',
      }),
      usage: { inputTokens: 100, outputTokens: 50, totalCost: 0.001 },
      model: 'claude-sonnet-4',
      finishReason: 'stop',
    };

    vi.mocked(mockClient.chat).mockResolvedValue(mockResponse);

    const vote = await executor.executeAgent(
      AgentRoles.DOCUMENTOR,
      mockContract,
      {
        roundNumber: 1,
        complexity: mockComplexity,
      },
    );

    expect(vote.veto).toBeUndefined();
    expect(vote.blockerConcerns).toEqual([]);
  });
});
