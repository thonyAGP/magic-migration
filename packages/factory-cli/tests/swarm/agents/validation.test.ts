/**
 * Validation Tests
 */

import { describe, it, expect } from 'vitest';
import { validateAgentResponse } from '../../../src/swarm/agents/validation.js';
import type { AgentResponse } from '../../../src/swarm/agents/response-parser.js';

describe('validateAgentResponse', () => {
  it('should accept valid APPROVE response', () => {
    const response: AgentResponse = {
      vote: 'APPROVE',
      confidence: 85,
      reasoning: 'Contract is well-defined and feasible',
      veto: false,
      blockerConcerns: [],
    };

    expect(() => validateAgentResponse(response)).not.toThrow();
  });

  it('should accept valid REJECT response', () => {
    const response: AgentResponse = {
      vote: 'REJECT',
      confidence: 70,
      reasoning: 'Missing critical information',
      veto: true,
      blockerConcerns: ['Database schema incomplete', 'No error handling'],
    };

    expect(() => validateAgentResponse(response)).not.toThrow();
  });

  it('should accept optional veto field', () => {
    const response: AgentResponse = {
      vote: 'APPROVE',
      confidence: 90,
      reasoning: 'All good',
    };

    expect(() => validateAgentResponse(response)).not.toThrow();
  });

  it('should accept optional blockerConcerns field', () => {
    const response: AgentResponse = {
      vote: 'APPROVE',
      confidence: 90,
      reasoning: 'All good',
      veto: false,
    };

    expect(() => validateAgentResponse(response)).not.toThrow();
  });

  it('should reject missing vote', () => {
    const response = {
      confidence: 85,
      reasoning: 'Test',
    } as AgentResponse;

    expect(() => validateAgentResponse(response)).toThrow('Missing required field: vote');
  });

  it('should reject invalid vote value', () => {
    const response: AgentResponse = {
      vote: 'MAYBE',
      confidence: 85,
      reasoning: 'Test',
    };

    expect(() => validateAgentResponse(response)).toThrow(/Invalid vote value.*Must be APPROVE or REJECT/);
  });

  it('should reject missing confidence', () => {
    const response = {
      vote: 'APPROVE',
      reasoning: 'Test',
    } as AgentResponse;

    expect(() => validateAgentResponse(response)).toThrow(/Missing or invalid field: confidence/);
  });

  it('should reject confidence < 0', () => {
    const response: AgentResponse = {
      vote: 'APPROVE',
      confidence: -10,
      reasoning: 'Test',
    };

    expect(() => validateAgentResponse(response)).toThrow(/Invalid confidence value.*Must be between 0 and 100/);
  });

  it('should reject confidence > 100', () => {
    const response: AgentResponse = {
      vote: 'APPROVE',
      confidence: 150,
      reasoning: 'Test',
    };

    expect(() => validateAgentResponse(response)).toThrow(/Invalid confidence value.*Must be between 0 and 100/);
  });

  it('should reject missing reasoning', () => {
    const response = {
      vote: 'APPROVE',
      confidence: 85,
    } as AgentResponse;

    expect(() => validateAgentResponse(response)).toThrow(/Missing or invalid field: reasoning/);
  });

  it('should reject empty reasoning', () => {
    const response: AgentResponse = {
      vote: 'APPROVE',
      confidence: 85,
      reasoning: '   ',
    };

    expect(() => validateAgentResponse(response)).toThrow('Reasoning cannot be empty');
  });

  it('should reject invalid veto type', () => {
    const response = {
      vote: 'APPROVE',
      confidence: 85,
      reasoning: 'Test',
      veto: 'yes',
    } as unknown as AgentResponse;

    expect(() => validateAgentResponse(response)).toThrow(/Invalid field: veto.*must be a boolean/);
  });

  it('should reject invalid blockerConcerns type', () => {
    const response = {
      vote: 'REJECT',
      confidence: 70,
      reasoning: 'Test',
      blockerConcerns: 'not an array',
    } as unknown as AgentResponse;

    expect(() => validateAgentResponse(response)).toThrow(/Invalid field: blockerConcerns.*must be an array/);
  });

  it('should reject non-string items in blockerConcerns', () => {
    const response = {
      vote: 'REJECT',
      confidence: 70,
      reasoning: 'Test',
      blockerConcerns: ['Valid concern', 123, 'Another concern'],
    } as unknown as AgentResponse;

    expect(() => validateAgentResponse(response)).toThrow(/Invalid blockerConcerns.*all items must be strings/);
  });
});
