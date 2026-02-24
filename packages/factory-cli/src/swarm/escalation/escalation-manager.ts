/**
 * Escalation Manager - Handles escalation when consensus cannot be reached
 *
 * Determines when to escalate, builds escalation context, and generates
 * human-readable reports for review.
 */

import type {
  SwarmSession,
  ConsensusResult,
  EscalationContext,
  EscalationReport,
  AgentConcern,
  AgentRole,
  RoundScore,
} from '../types.js';
import type { SwarmSQLiteStore } from '../storage/sqlite-store.js';

/**
 * Escalation Manager
 */
export class EscalationManager {
  private readonly store: SwarmSQLiteStore;

  constructor(store: SwarmSQLiteStore) {
    this.store = store;
  }

  /**
   * Determine if escalation is needed
   *
   * @param session - SWARM session
   * @param consensus - Final consensus result
   * @returns true if escalation needed
   */
  shouldEscalate(session: SwarmSession, consensus: ConsensusResult): boolean {
    // Always escalate if consensus not reached after rounds
    if (!consensus.passed) {
      return true;
    }

    // Escalate if there are critical BLOCKER concerns even with consensus
    const blockerConcerns = this.extractBlockerConcerns(session);
    if (blockerConcerns.length > 0) {
      return true;
    }

    return false;
  }

  /**
   * Build complete escalation context
   *
   * @param session - SWARM session
   * @param roundHistory - Round score history
   * @param stagnationDetails - Stagnation detection details
   * @param vetoDetails - Veto details
   * @returns Escalation context
   */
  buildEscalationContext(
    session: SwarmSession,
    roundHistory: RoundScore[],
    stagnationDetails?: {
      detected: boolean;
      detectedAtRound?: number;
      stagnantRounds?: number;
      stagnantScore?: number;
      explanation?: string;
    },
    vetoDetails?: {
      triggered: boolean;
      agent?: string;
      reason?: string;
    },
  ): EscalationContext {
    // Determine reason for escalation
    let reason: EscalationContext['reason'];

    if (stagnationDetails?.detected) {
      reason = 'STAGNATION';
    } else if (vetoDetails?.triggered && this.isPersistentVeto(session)) {
      reason = 'PERSISTENT_VETO';
    } else if (this.hasCriticalBlockers(session)) {
      reason = 'CRITICAL_CONCERNS';
    } else {
      reason = 'MAX_ROUNDS';
    }

    // Extract BLOCKER concerns
    const blockerConcerns = this.extractBlockerConcerns(session);

    return {
      sessionId: session.id,
      programId: session.programId,
      programName: session.programName,
      reason,
      roundsAttempted: roundHistory.length,
      finalConsensusScore: session.consensus.score,
      roundHistory,
      blockerConcerns,
      stagnationDetails,
      vetoDetails,
    };
  }

  /**
   * Generate human-readable escalation report
   *
   * @param context - Escalation context
   * @param session - Optional session for voting pattern analysis
   * @returns Escalation report
   */
  generateEscalationReport(
    context: EscalationContext,
    session?: SwarmSession,
  ): EscalationReport {
    // Calculate urgency level
    const urgency = this.calculateUrgency(context);

    // Analyze voting patterns if session provided
    let votingPatterns;
    if (session) {
      votingPatterns = this.analyzeVotingPatterns(session);
    }

    // Build report components
    const summary = this.buildSummary(context, urgency);
    const recommendation = this.determineRecommendation(context);
    const keyIssues = this.identifyKeyIssues(context, votingPatterns);
    const divergentViews = this.extractDivergentViews(context, session);
    const suggestedActions = this.generateSuggestedActions(context, votingPatterns);

    return {
      summary,
      recommendation,
      keyIssues,
      divergentViews,
      suggestedActions,
    };
  }

  /**
   * Store escalation in database
   *
   * @param context - Escalation context
   * @param report - Escalation report
   */
  storeEscalation(context: EscalationContext, report: EscalationReport): void {
    // Store escalation metadata in session
    // The store will persist this via completeSession
    console.log(
      `[SWARM] Storing escalation: ${context.reason} for program ${context.programId}`,
    );
    console.log(`[SWARM] Recommendation: ${report.recommendation}`);
  }

  // ============================================================================
  // Private helpers
  // ============================================================================

  /**
   * Extract all BLOCKER concerns from session votes
   */
  private extractBlockerConcerns(session: SwarmSession): AgentConcern[] {
    const blockers: AgentConcern[] = [];

    for (const vote of session.votes) {
      for (const concern of vote.concerns) {
        if (concern.severity === 'BLOCKER') {
          blockers.push(concern);
        }
      }
    }

    return blockers;
  }

  /**
   * Check if veto persisted across multiple rounds
   */
  private isPersistentVeto(session: SwarmSession): boolean {
    // Count votes with BLOCKER concerns
    let vetoCount = 0;

    for (const vote of session.votes) {
      const hasBlocker = vote.concerns.some((c) => c.severity === 'BLOCKER');
      if (hasBlocker) {
        vetoCount++;
      }
    }

    // Persistent if 3+ veto votes
    return vetoCount >= 3;
  }

  /**
   * Check if there are critical BLOCKER concerns
   */
  private hasCriticalBlockers(session: SwarmSession): boolean {
    const blockers = this.extractBlockerConcerns(session);
    return blockers.length > 0;
  }

  /**
   * Build executive summary
   */
  private buildSummary(
    context: EscalationContext,
    urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
  ): string {
    const parts: string[] = [];

    // Urgency indicator
    const urgencyEmoji = {
      LOW: '🟢',
      MEDIUM: '🟡',
      HIGH: '🟠',
      CRITICAL: '🔴',
    };

    parts.push(
      `${urgencyEmoji[urgency]} [${urgency} URGENCY] Program "${context.programName}" (${context.programId}) requires escalation after ${context.roundsAttempted} rounds.`,
    );
    parts.push(`Reason: ${context.reason}.`);
    parts.push(
      `Final consensus score: ${context.finalConsensusScore.toFixed(1)}%.`,
    );

    if (context.stagnationDetails?.detected) {
      parts.push(
        `Stagnation detected at round ${context.stagnationDetails.detectedAtRound} with score ${context.stagnationDetails.stagnantScore?.toFixed(1)}%.`,
      );
    }

    if (context.vetoDetails?.triggered) {
      parts.push(
        `Veto triggered by ${context.vetoDetails.agent}: ${context.vetoDetails.reason}`,
      );
    }

    if (context.blockerConcerns.length > 0) {
      parts.push(
        `${context.blockerConcerns.length} BLOCKER concern(s) identified.`,
      );
    }

    return parts.join(' ');
  }

  /**
   * Determine recommendation based on escalation reason
   */
  private determineRecommendation(
    context: EscalationContext,
  ): EscalationReport['recommendation'] {
    switch (context.reason) {
      case 'STAGNATION':
        return 'SENIOR_AGENT'; // Senior agent may have more context

      case 'PERSISTENT_VETO':
        return 'HUMAN_REVIEW'; // Human decision needed on veto

      case 'CRITICAL_CONCERNS':
        return 'ARCHITECTURE_CHANGE'; // May need architectural redesign

      case 'MAX_ROUNDS':
      default:
        return 'HUMAN_REVIEW'; // General fallback
    }
  }

  /**
   * Identify key issues from escalation context
   */
  private identifyKeyIssues(
    context: EscalationContext,
    votingPatterns?: ReturnType<typeof this.analyzeVotingPatterns>,
  ): string[] {
    const issues: string[] = [];

    // Add reason as primary issue
    switch (context.reason) {
      case 'MAX_ROUNDS':
        issues.push(
          `Maximum rounds (${context.roundsAttempted}) reached without consensus`,
        );
        break;

      case 'STAGNATION':
        issues.push(
          `Consensus score stagnated at ${context.stagnationDetails?.stagnantScore?.toFixed(1)}% for ${context.stagnationDetails?.stagnantRounds} rounds`,
        );
        break;

      case 'PERSISTENT_VETO':
        issues.push(
          `Persistent veto from ${context.vetoDetails?.agent}: ${context.vetoDetails?.reason}`,
        );
        break;

      case 'CRITICAL_CONCERNS':
        issues.push(
          `${context.blockerConcerns.length} critical BLOCKER concerns identified`,
        );
        break;
    }

    // Add voting pattern issues if available
    if (votingPatterns) {
      if (votingPatterns.vetoingAgents.length > 0) {
        issues.push(
          `${votingPatterns.vetoingAgents.length} agent(s) with veto: ${votingPatterns.vetoingAgents.join(', ')}`,
        );
      }

      if (
        votingPatterns.consensusAgents.length > 0 &&
        votingPatterns.dissentingAgents.length > 0
      ) {
        issues.push(
          `Split decision: ${votingPatterns.consensusAgents.length} approve, ${votingPatterns.dissentingAgents.length} reject`,
        );
      }
    }

    // Add top BLOCKER concerns as issues
    for (const concern of context.blockerConcerns.slice(0, 3)) {
      // Top 3
      issues.push(`🚫 BLOCKER: ${concern.concern}`);
    }

    return issues;
  }

  /**
   * Extract divergent views from votes
   *
   * Identifies agents with opposing positions (e.g., ARCHITECT approves but REVIEWER rejects)
   */
  private extractDivergentViews(
    context: EscalationContext,
    session?: SwarmSession,
  ): EscalationReport['divergentViews'] {
    const views: EscalationReport['divergentViews'] = [];

    // If no session provided, try to get from store
    if (!session) {
      session = this.store.getSession(context.sessionId) || undefined;
    }

    // Check if session has votes
    if (!session || !session.votes || session.votes.length === 0) {
      return views;
    }

    // Group votes by agent and analyze positions (use last vote of each agent)
    const agentPositions = new Map<string, { vote: string; justification: string }>();

    for (const vote of session.votes) {
      // Store the most recent vote for each agent (last one in array)
      agentPositions.set(vote.agent, {
        vote: vote.vote,
        justification: vote.justification,
      });
    }

    // Identify divergent positions
    // Agents who APPROVE while others REJECT
    const approvers: string[] = [];
    const rejecters: string[] = [];

    for (const [agent, position] of agentPositions) {
      if (position.vote === 'APPROVE' || position.vote === 'APPROVE_WITH_CONCERNS') {
        approvers.push(agent);
      } else if (position.vote === 'REJECT' || position.vote === 'REJECT_WITH_SUGGESTIONS') {
        rejecters.push(agent);
      }
    }

    // If there are both approvers and rejecters, extract their views
    if (approvers.length > 0 && rejecters.length > 0) {
      // Add approving views (up to 2)
      for (const agent of approvers.slice(0, 2)) {
        const position = agentPositions.get(agent);
        if (position) {
          views.push({
            agent: agent as AgentRole,
            view: `✅ ${position.vote}: ${position.justification.substring(0, 150)}${position.justification.length > 150 ? '...' : ''}`,
          });
        }
      }

      // Add rejecting views (up to 2)
      for (const agent of rejecters.slice(0, 2)) {
        const position = agentPositions.get(agent);
        if (position) {
          views.push({
            agent: agent as AgentRole,
            view: `❌ ${position.vote}: ${position.justification.substring(0, 150)}${position.justification.length > 150 ? '...' : ''}`,
          });
        }
      }
    }

    return views;
  }

  /**
   * Analyze voting patterns to find root cause of failure
   */
  analyzeVotingPatterns(session: SwarmSession): {
    consensusAgents: AgentRole[];
    dissentingAgents: AgentRole[];
    vetoingAgents: AgentRole[];
    mainBlockers: AgentConcern[];
  } {
    const votes = session.votes;

    // Categorize agents by their voting behavior
    const consensusAgents: AgentRole[] = [];
    const dissentingAgents: AgentRole[] = [];
    const vetoingAgents: AgentRole[] = [];
    const allBlockers: AgentConcern[] = [];

    // Analyze each vote
    for (const vote of votes) {
      // Check if agent has BLOCKER concerns (veto)
      const hasBlocker = vote.concerns.some((c) => c.severity === 'BLOCKER');
      if (hasBlocker) {
        vetoingAgents.push(vote.agent);
        // Collect BLOCKER concerns
        allBlockers.push(
          ...vote.concerns.filter((c) => c.severity === 'BLOCKER'),
        );
      }

      // Categorize by vote type
      if (vote.vote === 'APPROVE' || vote.vote === 'APPROVE_WITH_CONCERNS') {
        consensusAgents.push(vote.agent);
      } else if (vote.vote === 'REJECT' || vote.vote === 'REJECT_WITH_SUGGESTIONS') {
        dissentingAgents.push(vote.agent);
      }
    }

    // Get top 3 most critical blockers
    const mainBlockers = allBlockers.slice(0, 3);

    return {
      consensusAgents,
      dissentingAgents,
      vetoingAgents,
      mainBlockers,
    };
  }

  /**
   * Calculate escalation urgency level based on context
   */
  calculateUrgency(context: EscalationContext): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    let urgencyScore = 0;

    // Factor 1: Escalation reason (0-40 points)
    switch (context.reason) {
      case 'CRITICAL_CONCERNS':
        urgencyScore += 40; // Highest priority
        break;
      case 'PERSISTENT_VETO':
        urgencyScore += 35;
        break;
      case 'STAGNATION':
        urgencyScore += 25;
        break;
      case 'MAX_ROUNDS':
        urgencyScore += 20; // Lowest priority
        break;
    }

    // Factor 2: Number of BLOCKER concerns (0-30 points)
    const blockerCount = context.blockerConcerns.length;
    if (blockerCount >= 5) {
      urgencyScore += 30;
    } else if (blockerCount >= 3) {
      urgencyScore += 20;
    } else if (blockerCount >= 1) {
      urgencyScore += 10;
    }

    // Factor 3: Rounds attempted (0-20 points)
    if (context.roundsAttempted >= 8) {
      urgencyScore += 20; // Many rounds = urgent
    } else if (context.roundsAttempted >= 5) {
      urgencyScore += 15;
    } else if (context.roundsAttempted >= 3) {
      urgencyScore += 10;
    }

    // Factor 4: Final consensus score (0-10 points)
    // Lower score = more urgent
    if (context.finalConsensusScore < 30) {
      urgencyScore += 10;
    } else if (context.finalConsensusScore < 50) {
      urgencyScore += 5;
    }

    // Map total score to urgency level
    if (urgencyScore >= 70) {
      return 'CRITICAL'; // 70-100: Critical
    } else if (urgencyScore >= 50) {
      return 'HIGH'; // 50-69: High
    } else if (urgencyScore >= 30) {
      return 'MEDIUM'; // 30-49: Medium
    } else {
      return 'LOW'; // 0-29: Low
    }
  }

  /**
   * Generate suggested actions to resolve escalation
   */
  private generateSuggestedActions(
    context: EscalationContext,
    votingPatterns?: ReturnType<typeof this.analyzeVotingPatterns>,
  ): string[] {
    const actions: string[] = [];

    switch (context.reason) {
      case 'STAGNATION':
        actions.push('Review revisions applied between rounds');
        actions.push('Consider alternative migration approach');
        actions.push('Consult senior architect for guidance');

        if (votingPatterns && votingPatterns.mainBlockers.length > 0) {
          actions.push(
            `Focus on resolving ${votingPatterns.mainBlockers.length} main blockers`,
          );
        }
        break;

      case 'PERSISTENT_VETO':
        actions.push('Review veto justification in detail');
        actions.push('Discuss concerns with veto agent');
        actions.push('Consider architectural changes to address veto');

        if (votingPatterns && votingPatterns.vetoingAgents.length > 0) {
          actions.push(
            `Schedule review meeting with: ${votingPatterns.vetoingAgents.join(', ')}`,
          );
        }
        break;

      case 'CRITICAL_CONCERNS':
        for (const concern of context.blockerConcerns.slice(0, 3)) {
          actions.push(`✅ ${concern.suggestion}`);
        }

        if (votingPatterns) {
          actions.push(
            `Align with ${votingPatterns.consensusAgents.length} approving agents on resolution approach`,
          );
        }
        break;

      case 'MAX_ROUNDS':
      default:
        actions.push('Review all agent analyses and votes');
        actions.push('Identify common concerns across agents');
        actions.push('Consider manual intervention or alternative approach');

        if (votingPatterns && votingPatterns.dissentingAgents.length > 2) {
          actions.push(
            `Focus on concerns from dissenting agents: ${votingPatterns.dissentingAgents.slice(0, 3).join(', ')}`,
          );
        }
        break;
    }

    return actions;
  }
}
