/**
 * Response Parser Tests
 */

import { describe, it, expect } from 'vitest';
import {
  parseAgentResponse,
  extractJSON,
  type AgentResponse,
} from '../../../src/swarm/agents/response-parser.js';
import { AgentRoles } from '../../../src/swarm/types.js';

describe('extractJSON', () => {
  it('should extract JSON from markdown code block', () => {
    const content = `Here is my vote:
\`\`\`json
{"vote": "APPROVE", "confidence": 85}
\`\`\``;

    const json = extractJSON(content);
    expect(json).toBe('{"vote": "APPROVE", "confidence": 85}');
  });

  it('should extract JSON from code block without language', () => {
    const content = `\`\`\`
{"vote": "REJECT", "confidence": 70}
\`\`\``;

    const json = extractJSON(content);
    expect(json).toBe('{"vote": "REJECT", "confidence": 70}');
  });

  it('should extract raw JSON object', () => {
    const content = '{"vote": "APPROVE", "confidence": 90, "reasoning": "Good"}';

    const json = extractJSON(content);
    expect(json).toBe('{"vote": "APPROVE", "confidence": 90, "reasoning": "Good"}');
  });

  it('should throw error if no JSON found', () => {
    const content = 'This is just plain text without any JSON';

    expect(() => extractJSON(content)).toThrow('No JSON found in agent response');
  });
});

describe('parseAgentResponse', () => {
  const tokens = { input: 100, output: 50, cost: 0.001 };

  it('should parse valid APPROVE vote', () => {
    const content = JSON.stringify({
      vote: 'APPROVE',
      confidence: 85,
      reasoning: 'Contract is well-defined',
      veto: false,
      blockerConcerns: [],
    });

    const vote = parseAgentResponse(AgentRoles.ARCHITECT, content, tokens);

    expect(vote.agent).toBe(AgentRoles.ARCHITECT);
    expect(vote.vote).toBe('APPROVE');
    expect(vote.confidence).toBe(85);
    expect(vote.reasoning).toBe('Contract is well-defined');
    expect(vote.veto).toBe(false);
    expect(vote.blockerConcerns).toEqual([]);
    expect(vote.tokens).toEqual(tokens);
  });

  it('should parse valid REJECT vote', () => {
    const content = JSON.stringify({
      vote: 'REJECT',
      confidence: 70,
      reasoning: 'Missing critical information',
      veto: true,
      blockerConcerns: ['Database schema incomplete', 'No error handling'],
    });

    const vote = parseAgentResponse(AgentRoles.REVIEWER, content, tokens);

    expect(vote.agent).toBe(AgentRoles.REVIEWER);
    expect(vote.vote).toBe('REJECT');
    expect(vote.confidence).toBe(70);
    expect(vote.reasoning).toBe('Missing critical information');
    expect(vote.veto).toBe(true);
    expect(vote.blockerConcerns).toEqual(['Database schema incomplete', 'No error handling']);
  });

  it('should handle optional fields', () => {
    const content = JSON.stringify({
      vote: 'APPROVE',
      confidence: 90,
      reasoning: 'All good',
    });

    const vote = parseAgentResponse(AgentRoles.ANALYST, content, tokens);

    expect(vote.veto).toBeUndefined();
    expect(vote.blockerConcerns).toEqual([]);
  });

  it('should parse JSON from markdown code block', () => {
    const content = `\`\`\`json
{
  "vote": "APPROVE",
  "confidence": 80,
  "reasoning": "Good contract"
}
\`\`\``;

    const vote = parseAgentResponse(AgentRoles.DEVELOPER, content, tokens);

    expect(vote.vote).toBe('APPROVE');
    expect(vote.confidence).toBe(80);
  });

  it('should throw error if JSON parsing fails', () => {
    const content = '{ invalid json }';

    expect(() => parseAgentResponse(AgentRoles.ARCHITECT, content, tokens))
      .toThrow(/Failed to parse agent response as JSON/);
  });

  it('should throw error if vote is invalid', () => {
    const content = JSON.stringify({
      vote: 'INVALID',
      confidence: 80,
      reasoning: 'Test',
    });

    expect(() => parseAgentResponse(AgentRoles.ARCHITECT, content, tokens))
      .toThrow(/Invalid vote value/);
  });

  it('should throw error if confidence is out of range', () => {
    const content = JSON.stringify({
      vote: 'APPROVE',
      confidence: 150,
      reasoning: 'Test',
    });

    expect(() => parseAgentResponse(AgentRoles.ARCHITECT, content, tokens))
      .toThrow(/Invalid confidence value/);
  });

  it('should throw error if reasoning is missing', () => {
    const content = JSON.stringify({
      vote: 'APPROVE',
      confidence: 80,
    });

    expect(() => parseAgentResponse(AgentRoles.ARCHITECT, content, tokens))
      .toThrow(/Missing or invalid field: reasoning/);
  });
});
