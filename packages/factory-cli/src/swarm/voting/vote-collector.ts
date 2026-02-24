/**
 * Vote Collector - Collects and manages agent votes
 *
 * Handles vote submission, validation, and storage
 */

import type { AgentVote, AgentRole } from '../types.js';
import { AgentWeights } from '../types.js';
import { validateVote } from './consensus-engine.js';

/**
 * Vote collection session
 */
export class VoteCollector {
  private votes: Map<AgentRole, AgentVote> = new Map();
  private readonly sessionId: string;
  private readonly startTime: Date;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
    this.startTime = new Date();
  }

  /**
   * Submit a vote from an agent
   *
   * @param vote - Agent vote to submit
   * @throws Error if vote is invalid or duplicate
   */
  submitVote(vote: AgentVote): void {
    // Validate vote
    const validation = validateVote(vote);
    if (!validation.valid) {
      throw new Error(
        `Invalid vote from ${vote.agent}: ${validation.errors.join(', ')}`,
      );
    }

    // Check for duplicate votes
    if (this.votes.has(vote.agent)) {
      throw new Error(`Agent ${vote.agent} has already submitted a vote`);
    }

    // Verify weight matches expected weight
    const expectedWeight = AgentWeights[vote.agent];
    if (vote.weight !== expectedWeight) {
      throw new Error(
        `Invalid weight for ${vote.agent}: expected ${expectedWeight}, got ${vote.weight}`,
      );
    }

    // Store vote
    this.votes.set(vote.agent, vote);
  }

  /**
   * Get all collected votes
   */
  getVotes(): AgentVote[] {
    return Array.from(this.votes.values());
  }

  /**
   * Get vote from specific agent
   */
  getVoteByAgent(agent: AgentRole): AgentVote | undefined {
    return this.votes.get(agent);
  }

  /**
   * Check if all agents have voted
   *
   * @param expectedAgents - List of agents expected to vote
   * @returns True if all expected agents have voted
   */
  isComplete(expectedAgents: AgentRole[]): boolean {
    return expectedAgents.every((agent) => this.votes.has(agent));
  }

  /**
   * Get missing votes
   *
   * @param expectedAgents - List of agents expected to vote
   * @returns Agents who haven't voted yet
   */
  getMissingVotes(expectedAgents: AgentRole[]): AgentRole[] {
    return expectedAgents.filter((agent) => !this.votes.has(agent));
  }

  /**
   * Get vote count
   */
  getVoteCount(): number {
    return this.votes.size;
  }

  /**
   * Clear all votes (for retry scenarios)
   */
  clear(): void {
    this.votes.clear();
  }

  /**
   * Get session info
   */
  getSessionInfo(): {
    sessionId: string;
    startTime: Date;
    voteCount: number;
    agents: AgentRole[];
  } {
    return {
      sessionId: this.sessionId,
      startTime: this.startTime,
      voteCount: this.votes.size,
      agents: Array.from(this.votes.keys()),
    };
  }

  /**
   * Export votes as JSON
   */
  toJSON(): Record<string, unknown> {
    return {
      sessionId: this.sessionId,
      startTime: this.startTime.toISOString(),
      voteCount: this.votes.size,
      votes: this.getVotes().map((vote) => ({
        ...vote,
        timestamp: vote.timestamp.toISOString(),
      })),
    };
  }
}

/**
 * Create a new vote collector
 */
export function createVoteCollector(sessionId: string): VoteCollector {
  return new VoteCollector(sessionId);
}
