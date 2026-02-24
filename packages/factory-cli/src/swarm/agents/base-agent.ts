/**
 * Base Agent Interface - Common functionality for all SWARM agents
 *
 * All specialized agents extend this base class
 */

import type {
  AgentRole,
  AgentAnalysis,
  AgentVote,
  AgentConcern,
} from '../types.js';
import { AgentWeights } from '../types.js';
import type { ExtendedMigrationContract as MigrationContract } from '../../core/contract.js';

/**
 * Agent configuration
 */
export interface AgentConfig {
  /** Agent role */
  role: AgentRole;
  /** Model to use for analysis */
  model: 'opus' | 'sonnet' | 'haiku';
  /** Max tokens for analysis */
  maxTokens: number;
  /** Temperature for generation */
  temperature: number;
}

/**
 * Agent analysis context
 */
export interface AnalysisContext {
  /** Migration contract */
  contract: MigrationContract;
  /** Previous agent analyses (for context) */
  previousAnalyses?: AgentAnalysis[];
  /** Custom context data */
  customContext?: Record<string, unknown>;
}

/**
 * Base agent class
 */
export abstract class BaseAgent {
  protected readonly config: AgentConfig;
  protected readonly weight: number;

  constructor(config: AgentConfig) {
    this.config = config;
    this.weight = AgentWeights[config.role];
  }

  /**
   * Get agent role
   */
  getRole(): AgentRole {
    return this.config.role;
  }

  /**
   * Get agent weight
   */
  getWeight(): number {
    return this.weight;
  }

  /**
   * Analyze migration contract
   *
   * Each specialized agent implements this method
   *
   * @param context - Analysis context
   * @returns Agent analysis
   */
  abstract analyze(context: AnalysisContext): Promise<AgentAnalysis>;

  /**
   * Vote on a migration proposal
   *
   * Each specialized agent implements this method
   *
   * @param analysis - Agent's own analysis
   * @param otherAnalyses - Other agents' analyses
   * @returns Agent vote
   */
  abstract vote(
    analysis: AgentAnalysis,
    otherAnalyses: AgentAnalysis[],
  ): Promise<AgentVote>;

  /**
   * Get system prompt for this agent
   *
   * Returns the specialized prompt from docs/swarm-agent-prompts.md
   */
  protected abstract getSystemPrompt(): string;

  /**
   * Parse analysis output from LLM response
   *
   * @param output - Raw LLM output
   * @returns Structured analysis
   */
  protected abstract parseAnalysis(output: string): {
    analysis: Record<string, unknown>;
    proposal: Record<string, unknown>;
  };

  /**
   * Parse vote output from LLM response
   *
   * @param output - Raw LLM output
   * @returns Structured vote
   */
  protected abstract parseVote(output: string): {
    vote: AgentVote['vote'];
    confidence: number;
    justification: string;
    concerns: AgentConcern[];
    suggestions: string[];
  };

  /**
   * Create agent analysis result
   */
  protected createAnalysis(
    analysisData: Record<string, unknown>,
    proposalData: Record<string, unknown>,
    duration: number,
    tokens?: { input: number; output: number; cost: number },
  ): AgentAnalysis {
    return {
      agent: this.config.role,
      analysis: analysisData,
      proposal: proposalData,
      duration,
      tokens,
    };
  }

  /**
   * Create agent vote
   */
  protected createVote(
    voteData: {
      vote: AgentVote['vote'];
      confidence: number;
      justification: string;
      concerns: AgentConcern[];
      suggestions: string[];
    },
  ): AgentVote {
    return {
      agent: this.config.role,
      vote: voteData.vote,
      confidence: voteData.confidence,
      weight: this.weight,
      justification: voteData.justification,
      concerns: voteData.concerns,
      suggestions: voteData.suggestions,
      timestamp: new Date(),
    };
  }

  /**
   * Build prompt for analysis
   */
  protected buildAnalysisPrompt(context: AnalysisContext): string {
    const parts: string[] = [];

    // System prompt
    parts.push(this.getSystemPrompt());
    parts.push('\n---\n');

    // Contract data
    parts.push('# Migration Contract to Analyze\n');
    parts.push('```yaml');
    parts.push(JSON.stringify(context.contract, null, 2));
    parts.push('```\n');

    // Previous analyses (if any)
    if (context.previousAnalyses && context.previousAnalyses.length > 0) {
      parts.push('# Previous Agent Analyses\n');
      for (const prevAnalysis of context.previousAnalyses) {
        parts.push(`## ${prevAnalysis.agent.toUpperCase()}\n`);
        parts.push('```yaml');
        parts.push(JSON.stringify(prevAnalysis.analysis, null, 2));
        parts.push('```\n');
      }
    }

    // Instructions
    parts.push('# Instructions\n');
    parts.push(
      'Analyze the migration contract above and provide your analysis in YAML format as specified in your system prompt.',
    );

    return parts.join('\n');
  }

  /**
   * Build prompt for voting
   */
  protected buildVotePrompt(
    analysis: AgentAnalysis,
    otherAnalyses: AgentAnalysis[],
  ): string {
    const parts: string[] = [];

    // System prompt (voting section)
    parts.push('# Voting Instructions\n');
    parts.push(
      'Review your analysis and other agents\' analyses, then cast your vote.',
    );
    parts.push('\n---\n');

    // Own analysis
    parts.push('# Your Analysis\n');
    parts.push('```yaml');
    parts.push(JSON.stringify(analysis, null, 2));
    parts.push('```\n');

    // Other analyses
    parts.push('# Other Agents\' Analyses\n');
    for (const otherAnalysis of otherAnalyses) {
      parts.push(`## ${otherAnalysis.agent.toUpperCase()}\n`);
      parts.push('```yaml');
      parts.push(JSON.stringify(otherAnalysis.analysis, null, 2));
      parts.push('```\n');
    }

    // Voting format
    parts.push('# Vote Format\n');
    parts.push('Provide your vote in YAML format:');
    parts.push('```yaml');
    parts.push('voter: ' + this.config.role);
    parts.push('vote: [APPROVE|APPROVE_WITH_CONCERNS|NEUTRAL|REJECT_WITH_SUGGESTIONS|REJECT]');
    parts.push('confidence: [0-100]');
    parts.push('justification: |');
    parts.push('  [Clear explanation with evidence]');
    parts.push('concerns:');
    parts.push('  - concern: "[Specific concern]"');
    parts.push('    severity: "[BLOCKER|MAJOR|MINOR]"');
    parts.push('    suggestion: "[How to address]"');
    parts.push('suggestions:');
    parts.push('  - "[Actionable suggestion]"');
    parts.push('```');

    return parts.join('\n');
  }
}

/**
 * Agent factory - Create agents by role
 */
export interface AgentFactory {
  createAgent(role: AgentRole, config?: Partial<AgentConfig>): BaseAgent;
}
