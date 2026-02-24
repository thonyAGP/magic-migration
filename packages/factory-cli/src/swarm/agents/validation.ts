/**
 * Validation
 *
 * Validate agent responses
 */

import type { AgentResponse } from './response-parser.js';

/**
 * Validate agent response format
 *
 * @throws Error if validation fails
 */
export function validateAgentResponse(response: AgentResponse): void {
  // Validate vote
  if (!response.vote) {
    throw new Error('Missing required field: vote');
  }

  const validVotes = ['APPROVE', 'REJECT'];
  if (!validVotes.includes(response.vote)) {
    throw new Error(
      `Invalid vote value: ${response.vote}. Must be APPROVE or REJECT.`,
    );
  }

  // Validate confidence
  if (typeof response.confidence !== 'number') {
    throw new Error('Missing or invalid field: confidence (must be a number)');
  }

  if (response.confidence < 0 || response.confidence > 100) {
    throw new Error(
      `Invalid confidence value: ${response.confidence}. Must be between 0 and 100.`,
    );
  }

  // Validate reasoning
  if (!response.reasoning || typeof response.reasoning !== 'string') {
    throw new Error('Missing or invalid field: reasoning (must be a string)');
  }

  if (response.reasoning.trim().length === 0) {
    throw new Error('Reasoning cannot be empty');
  }

  // Validate veto (optional)
  if (response.veto !== undefined && typeof response.veto !== 'boolean') {
    throw new Error('Invalid field: veto (must be a boolean)');
  }

  // Validate blockerConcerns (optional)
  if (response.blockerConcerns !== undefined) {
    if (!Array.isArray(response.blockerConcerns)) {
      throw new Error('Invalid field: blockerConcerns (must be an array)');
    }

    for (const concern of response.blockerConcerns) {
      if (typeof concern !== 'string') {
        throw new Error(
          'Invalid blockerConcerns: all items must be strings',
        );
      }
    }
  }
}
