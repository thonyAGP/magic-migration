/**
 * Agent Executor
 *
 * Exécute un agent SWARM (LLM call + parse + validate)
 */

import type { AgentRole, ComplexityScore } from '../types.js';
import type { ExtendedMigrationContract } from '../../core/contract.js';
import type { ClaudeClient } from '../llm/claude-client.js';
import { PromptBuilder, type AgentContext, type Vote } from './prompt-builder.js';
import { parseAgentResponse } from './response-parser.js';

export class AgentExecutor {
  private readonly client: ClaudeClient;
  private readonly promptBuilder: PromptBuilder;

  constructor(client: ClaudeClient) {
    this.client = client;
    this.promptBuilder = new PromptBuilder();
  }

  /**
   * Execute un agent et retourne son vote
   */
  async executeAgent(
    agent: AgentRole,
    contract: ExtendedMigrationContract,
    context: {
      roundNumber: number;
      previousVotes?: Vote[];
      complexity: ComplexityScore;
    },
  ): Promise<Vote> {
    // 1. Build prompt
    const messages = this.promptBuilder.buildAgentPrompt(agent, contract, context);

    // 2. Call LLM
    const response = await this.client.chat(messages);

    // 3. Parse and validate JSON response (validation happens in parseAgentResponse)
    const vote = parseAgentResponse(agent, response.content, {
      input: response.usage.inputTokens,
      output: response.usage.outputTokens,
      cost: response.usage.totalCost,
    });

    // 4. Return validated Vote
    return vote;
  }
}
