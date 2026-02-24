/**
 * Prompt Builder
 *
 * Construit prompts complets pour agents SWARM
 */

import type { LLMMessage } from '../llm/types.js';
import type { ExtendedMigrationContract } from '../../core/contract.js';
import type { ComplexityScore, AgentRole } from '../types.js';
import { AgentRoles } from '../types.js';
import { ARCHITECT_PROMPT } from './prompts/architect-prompt.js';
import { ANALYST_PROMPT } from './prompts/analyst-prompt.js';
import { DEVELOPER_PROMPT } from './prompts/developer-prompt.js';
import { TESTER_PROMPT } from './prompts/tester-prompt.js';
import { REVIEWER_PROMPT } from './prompts/reviewer-prompt.js';
import { DOCUMENTOR_PROMPT } from './prompts/documentor-prompt.js';

/**
 * Simplified Vote for prompt context (subset of AgentVote)
 */
export interface Vote {
  agent: AgentRole;
  vote: string; // APPROVE, REJECT, etc.
  confidence: number;
  blockerConcerns: string[];
  veto?: boolean;
  reasoning?: string;
  tokens?: { input: number; output: number; cost: number };
}

export interface AgentContext {
  roundNumber: number;
  previousVotes?: Vote[];
  complexity: ComplexityScore;
}

export class PromptBuilder {
  /**
   * Construit prompt complet pour un agent
   */
  buildAgentPrompt(
    agent: AgentRole,
    contract: ExtendedMigrationContract,
    context: AgentContext,
  ): LLMMessage[] {
    const systemPrompt = this.getAgentPrompt(agent);
    const contractSummary = this.summarizeContract(contract);
    const contextInfo = this.formatContext(context);

    return [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `${contractSummary}\n\n${contextInfo}` },
    ];
  }

  /**
   * Récupère le system prompt pour un agent
   */
  private getAgentPrompt(agent: AgentRole): string {
    const prompts: Record<AgentRole, string> = {
      [AgentRoles.ARCHITECT]: ARCHITECT_PROMPT,
      [AgentRoles.ANALYST]: ANALYST_PROMPT,
      [AgentRoles.DEVELOPER]: DEVELOPER_PROMPT,
      [AgentRoles.TESTER]: TESTER_PROMPT,
      [AgentRoles.REVIEWER]: REVIEWER_PROMPT,
      [AgentRoles.DOCUMENTOR]: DOCUMENTOR_PROMPT,
    };

    return prompts[agent];
  }

  /**
   * Résume le contrat pour l'agent
   */
  private summarizeContract(contract: ExtendedMigrationContract): string {
    const summary: string[] = [];

    summary.push(`# Migration Contract`);
    summary.push(``);

    // Program info (optional in ExtendedMigrationContract)
    if (contract.program) {
      summary.push(
        `**Program:** ${contract.program.name || 'N/A'} (IDE ${contract.program.id || 'N/A'})`,
      );
      summary.push(
        `**Description:** ${(contract.program as any).description || 'N/A'}`,
      );
      summary.push(``);
    }

    // Tables
    const tables = contract.tables || [];
    if (tables.length > 0) {
      summary.push(`## Tables (${tables.length})`);
      for (const table of tables) {
        const tableName = (table as any).name || 'Unknown';
        const fieldsCount = (table as any).fields?.length || 0;
        summary.push(`- **${tableName}**: ${fieldsCount} fields`);
      }
      summary.push(``);
    }

    // Business Rules
    const rules = contract.rules || [];
    if (rules.length > 0) {
      summary.push(`## Business Rules (${rules.length})`);
      for (const rule of rules.slice(0, 10)) {
        // First 10
        summary.push(`- **${rule.id}**: ${rule.description}`);
      }
      if (rules.length > 10) {
        summary.push(`  ... and ${rules.length - 10} more rules`);
      }
      summary.push(``);
    }

    // Key Expressions
    const expressions = (contract as any).expressions || [];
    if (expressions.length > 0) {
      summary.push(`## Key Expressions (${expressions.length})`);
      for (const expr of expressions.slice(0, 5)) {
        // First 5
        summary.push(`- **${expr.id}**: ${expr.purpose || 'N/A'}`);
      }
      if (expressions.length > 5) {
        summary.push(`  ... and ${expressions.length - 5} more expressions`);
      }
      summary.push(``);
    }

    // RM Markers (unknowns)
    const rmMarkers = (contract as any).remainingMarkers || [];
    if (rmMarkers.length > 0) {
      summary.push(`## Unknowns (RM Markers: ${rmMarkers.length})`);
      for (const rm of rmMarkers.slice(0, 3)) {
        summary.push(`- ${rm}`);
      }
      if (rmMarkers.length > 3) {
        summary.push(`  ... and ${rmMarkers.length - 3} more`);
      }
      summary.push(``);
    }

    return summary.join('\n');
  }

  /**
   * Formate le contexte de voting
   */
  private formatContext(context: AgentContext): string {
    const lines: string[] = [];

    lines.push(`# Context`);
    lines.push(``);
    lines.push(`**Voting Round:** ${context.roundNumber}`);
    lines.push(
      `**Complexity:** ${context.complexity.level} (score: ${context.complexity.score}/100)`,
    );
    lines.push(``);

    // Previous votes (si round > 1)
    if (context.previousVotes && context.previousVotes.length > 0) {
      lines.push(`## Previous Round Votes`);
      lines.push(``);

      // Group by vote
      const approveCount = context.previousVotes.filter(
        (v) => v.vote === 'APPROVE',
      ).length;
      const rejectCount = context.previousVotes.filter(
        (v) => v.vote === 'REJECT',
      ).length;

      lines.push(`- **APPROVE:** ${approveCount} votes`);
      lines.push(`- **REJECT:** ${rejectCount} votes`);

      // Blocker concerns from previous round
      const blockers = context.previousVotes.flatMap((v) => v.blockerConcerns);
      if (blockers.length > 0) {
        lines.push(``);
        lines.push(`**Blocker Concerns Raised:**`);
        for (const blocker of blockers.slice(0, 3)) {
          lines.push(`- ${blocker}`);
        }
      }

      lines.push(``);
    }

    lines.push(`---`);
    lines.push(``);
    lines.push(`Please analyze this migration contract and provide your vote.`);

    return lines.join('\n');
  }
}
