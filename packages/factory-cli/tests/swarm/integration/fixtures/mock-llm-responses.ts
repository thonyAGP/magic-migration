/**
 * Mock LLM Responses for Integration Tests
 */

import type { LLMResponse } from '../../../../src/swarm/llm/types.js';

/**
 * Create a mock LLM response with APPROVE vote
 */
export function createApproveResponse(
  agent: string,
  confidence: number = 85,
  reasoning: string = 'Contract is well-defined and feasible',
): LLMResponse {
  return {
    content: JSON.stringify({
      vote: 'APPROVE',
      confidence,
      reasoning,
      veto: false,
      blockerConcerns: [],
    }),
    usage: {
      inputTokens: 1000,
      outputTokens: 150,
      totalCost: 0.005,
    },
    model: 'claude-sonnet-4',
    finishReason: 'stop',
  };
}

/**
 * Create a mock LLM response with REJECT vote
 */
export function createRejectResponse(
  agent: string,
  confidence: number = 75,
  reasoning: string = 'Contract has blockers',
  blockerConcerns: string[] = ['Missing critical information'],
  veto: boolean = false,
): LLMResponse {
  return {
    content: JSON.stringify({
      vote: 'REJECT',
      confidence,
      reasoning,
      veto,
      blockerConcerns,
    }),
    usage: {
      inputTokens: 1000,
      outputTokens: 200,
      totalCost: 0.006,
    },
    model: 'claude-sonnet-4',
    finishReason: 'stop',
  };
}

/**
 * Predefined response scenarios
 */
export const MOCK_RESPONSES = {
  /**
   * All agents APPROVE with high confidence
   */
  UNANIMOUS_APPROVE: {
    architect: createApproveResponse('architect', 90, 'Database schema is well-designed'),
    analyst: createApproveResponse('analyst', 88, 'Business rules are clear'),
    developer: createApproveResponse('developer', 85, 'Implementation is straightforward'),
    tester: createApproveResponse('tester', 87, 'Test coverage is achievable'),
    reviewer: createApproveResponse('reviewer', 92, 'Contract is complete'),
    documentor: createApproveResponse('documentor', 89, 'Documentation is adequate'),
  },

  /**
   * Mixed votes - 2 APPROVE, 4 REJECT (should escalate to round 2)
   */
  MIXED_ESCALATION: {
    architect: createApproveResponse('architect', 75, 'Design is acceptable'),
    analyst: createRejectResponse(
      'analyst',
      70,
      'Business logic unclear',
      ['Missing critical rule definitions'],
    ),
    developer: createRejectResponse(
      'developer',
      72,
      'Implementation too complex',
      ['Unclear dependencies'],
    ),
    tester: createRejectResponse('tester', 68, 'Not testable', ['Missing acceptance criteria']),
    reviewer: createRejectResponse(
      'reviewer',
      65,
      'Contract incomplete',
      ['Missing table definitions'],
    ),
    documentor: createApproveResponse('documentor', 80, 'Documentation sufficient'),
  },

  /**
   * REJECT with veto (should block immediately)
   */
  VETO_BLOCK: {
    architect: createRejectResponse(
      'architect',
      85,
      'Critical data integrity risk',
      ['No foreign key constraints', 'Missing cascade rules'],
      true, // veto
    ),
    analyst: createApproveResponse('analyst', 75, 'Business rules acceptable'),
    developer: createApproveResponse('developer', 70, 'Can be implemented'),
    tester: createApproveResponse('tester', 72, 'Testable'),
    reviewer: createApproveResponse('reviewer', 68, 'Acceptable'),
    documentor: createApproveResponse('documentor', 80, 'Documented'),
  },

  /**
   * Security issues triggering multiple vetos
   */
  SECURITY_CRITICAL: {
    architect: createRejectResponse(
      'architect',
      90,
      'Severe security flaws',
      ['Plain text passwords', 'No encryption'],
      true,
    ),
    analyst: createRejectResponse(
      'analyst',
      88,
      'Compliance violations',
      ['PII not protected', 'No audit trail'],
      true,
    ),
    developer: createRejectResponse(
      'developer',
      85,
      'Cannot implement safely',
      ['Missing security requirements'],
    ),
    tester: createRejectResponse(
      'tester',
      80,
      'Security tests missing',
      ['No penetration test plan'],
    ),
    reviewer: createRejectResponse(
      'reviewer',
      92,
      'Unacceptable risks',
      ['Critical information missing'],
      true,
    ),
    documentor: createRejectResponse('documentor', 75, 'Security docs missing', ['No threat model']),
  },

  /**
   * Round 2 responses after addressing concerns
   */
  ROUND2_IMPROVED: {
    architect: createApproveResponse('architect', 88, 'Issues addressed'),
    analyst: createApproveResponse('analyst', 85, 'Business logic clarified'),
    developer: createApproveResponse('developer', 82, 'Now implementable'),
    tester: createApproveResponse('tester', 84, 'Acceptance criteria added'),
    reviewer: createApproveResponse('reviewer', 90, 'Contract complete now'),
    documentor: createApproveResponse('documentor', 86, 'Documentation improved'),
  },

  /**
   * Low confidence votes (< 70%)
   */
  LOW_CONFIDENCE: {
    architect: createApproveResponse('architect', 65, 'Uncertain about design'),
    analyst: createApproveResponse('analyst', 60, 'Business rules vague'),
    developer: createRejectResponse('developer', 55, 'Too many unknowns', ['Unclear requirements']),
    tester: createApproveResponse('tester', 62, 'Limited test coverage'),
    reviewer: createRejectResponse('reviewer', 58, 'Incomplete', ['Missing sections']),
    documentor: createApproveResponse('documentor', 68, 'Minimal documentation'),
  },
};

/**
 * Helper to create response with specific error
 */
export function createErrorResponse(errorMessage: string): never {
  throw new Error(errorMessage);
}

/**
 * Helper to simulate rate limit error
 */
export function createRateLimitError(): never {
  const error = new Error('Rate limit exceeded');
  (error as any).statusCode = 429;
  (error as any).retryable = true;
  throw error;
}

/**
 * Helper to simulate network error
 */
export function createNetworkError(): never {
  const error = new Error('Network connection failed');
  (error as any).code = 'ECONNRESET';
  (error as any).retryable = true;
  throw error;
}
