/**
 * Tests Prompt Builder
 */

import { describe, it, expect } from 'vitest';
import { PromptBuilder } from '../../../src/swarm/agents/prompt-builder.js';
import type { AgentContext } from '../../../src/swarm/agents/prompt-builder.js';
import type { ExtendedMigrationContract } from '../../../src/core/contract.js';
import { AgentRoles } from '../../../src/swarm/types.js';

describe('PromptBuilder', () => {
  const builder = new PromptBuilder();

  const mockContract: ExtendedMigrationContract = {
    program: {
      id: 237,
      name: 'VENTE_GIFT_PASS',
      description: 'Programme de vente Gift Pass',
    },
    tables: [
      { name: 'operations', fields: ['id', 'montant', 'date'] },
      { name: 'comptes', fields: ['id', 'numero', 'solde'] },
    ],
    rules: [
      { id: 'R1', description: 'Valider montant > 0' },
      { id: 'R2', description: 'Vérifier compte existe' },
    ],
    expressions: [{ id: 'E1', purpose: 'Calculer total avec taxe' }],
    remainingMarkers: ['RM-001: Vérifier règle métier X'],
  } as any;

  const mockContext: AgentContext = {
    roundNumber: 1,
    complexity: {
      score: 42,
      level: 'MEDIUM',
      useSwarm: true,
      requiresDoubleVote: false,
      indicators: {} as any,
      explanation: 'Test',
    },
  };

  it('should build prompt for ARCHITECT agent', () => {
    const messages = builder.buildAgentPrompt(
      AgentRoles.ARCHITECT,
      mockContract,
      mockContext,
    );

    expect(messages).toHaveLength(2);
    expect(messages[0].role).toBe('system');
    expect(messages[0].content).toContain('ARCHITECT');
    expect(messages[0].content).toContain('System design');
    expect(messages[1].role).toBe('user');
    expect(messages[1].content).toContain('VENTE_GIFT_PASS');
    expect(messages[1].content).toContain('Tables (2)');
  });

  it('should build prompt for ANALYST agent', () => {
    const messages = builder.buildAgentPrompt(
      AgentRoles.ANALYST,
      mockContract,
      mockContext,
    );

    expect(messages[0].content).toContain('ANALYST');
    expect(messages[0].content).toContain('Business logic');
  });

  it('should build prompt for DEVELOPER agent', () => {
    const messages = builder.buildAgentPrompt(
      AgentRoles.DEVELOPER,
      mockContract,
      mockContext,
    );

    expect(messages[0].content).toContain('DEVELOPER');
    expect(messages[0].content).toContain('implementation feasibility');
  });

  it('should build prompt for TESTER agent', () => {
    const messages = builder.buildAgentPrompt(
      AgentRoles.TESTER,
      mockContract,
      mockContext,
    );

    expect(messages[0].content).toContain('TESTER');
    expect(messages[0].content).toContain('Edge case');
  });

  it('should build prompt for REVIEWER agent', () => {
    const messages = builder.buildAgentPrompt(
      AgentRoles.REVIEWER,
      mockContract,
      mockContext,
    );

    expect(messages[0].content).toContain('REVIEWER');
    expect(messages[0].content).toContain('Contract Completeness');
  });

  it('should build prompt for DOCUMENTOR agent', () => {
    const messages = builder.buildAgentPrompt(
      AgentRoles.DOCUMENTOR,
      mockContract,
      mockContext,
    );

    expect(messages[0].content).toContain('DOCUMENTOR');
    expect(messages[0].content).toContain('documentation');
  });

  it('should include previous votes in round 2+', () => {
    const contextRound2: AgentContext = {
      roundNumber: 2,
      complexity: mockContext.complexity,
      previousVotes: [
        {
          agent: AgentRoles.ARCHITECT,
          vote: 'APPROVE',
          confidence: 80,
          veto: false,
          blockerConcerns: [],
          reasoning: 'Architecture OK',
          tokens: { input: 100, output: 50, cost: 0.01 },
        },
        {
          agent: AgentRoles.ANALYST,
          vote: 'REJECT',
          confidence: 70,
          veto: false,
          blockerConcerns: ['Missing validation rule'],
          reasoning: 'Logic incomplete',
          tokens: { input: 100, output: 50, cost: 0.01 },
        },
      ],
    };

    const messages = builder.buildAgentPrompt(
      AgentRoles.DEVELOPER,
      mockContract,
      contextRound2,
    );

    expect(messages[1].content).toContain('Previous Round Votes');
    expect(messages[1].content).toContain('**APPROVE:** 1');
    expect(messages[1].content).toContain('**REJECT:** 1');
    expect(messages[1].content).toContain('Missing validation rule');
  });

  it('should include complexity in context', () => {
    const messages = builder.buildAgentPrompt(
      AgentRoles.ARCHITECT,
      mockContract,
      mockContext,
    );

    expect(messages[1].content).toContain('**Complexity:** MEDIUM');
    expect(messages[1].content).toContain('score: 42');
  });

  it('should summarize RM markers', () => {
    const messages = builder.buildAgentPrompt(
      AgentRoles.REVIEWER,
      mockContract,
      mockContext,
    );

    expect(messages[1].content).toContain('Unknowns');
    expect(messages[1].content).toContain('RM-001');
  });
});
