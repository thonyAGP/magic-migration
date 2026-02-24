/**
 * Response Parser
 *
 * Parse LLM responses into Vote objects
 */

import type { AgentRole } from '../types.js';
import type { Vote } from './prompt-builder.js';
import { validateAgentResponse } from './validation.js';

/**
 * Agent response format (from LLM)
 */
export interface AgentResponse {
  vote: string; // APPROVE or REJECT
  confidence: number;
  veto?: boolean;
  blockerConcerns?: string[];
  reasoning: string;
}

/**
 * Parse LLM response into Vote
 */
export function parseAgentResponse(
  agent: AgentRole,
  content: string,
  tokens: { input: number; output: number; cost: number },
): Vote {
  // Extract JSON from response
  const json = extractJSON(content);

  // Parse JSON
  let parsed: AgentResponse;
  try {
    parsed = JSON.parse(json);
  } catch (error) {
    throw new Error(
      `Failed to parse agent response as JSON: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }

  // Validate parsed response
  validateAgentResponse(parsed);

  // Return validated Vote
  return {
    agent,
    vote: parsed.vote,
    confidence: parsed.confidence,
    blockerConcerns: parsed.blockerConcerns || [],
    veto: parsed.veto,
    reasoning: parsed.reasoning,
    tokens,
  };
}

/**
 * Extract JSON from LLM response
 *
 * Handles:
 * - Clean JSON: { "vote": "APPROVE", ... }
 * - Markdown code blocks: ```json\n{ ... }\n```
 * - Mixed content: "Here is my vote:\n```json\n{ ... }\n```"
 */
export function extractJSON(content: string): string {
  // Try to find JSON in markdown code block
  const codeBlockMatch = content.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (codeBlockMatch) {
    return codeBlockMatch[1].trim();
  }

  // Try to find raw JSON object
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return jsonMatch[0].trim();
  }

  // No JSON found
  throw new Error('No JSON found in agent response');
}
