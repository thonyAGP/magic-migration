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
   * @returns Escalation report
   */
  generateEscalationReport(context: EscalationContext): EscalationReport {
    const summary = this.buildSummary(context);
    const recommendation = this.determineRecommendation(context);
    const keyIssues = this.identifyKeyIssues(context);
    const divergentViews = this.extractDivergentViews(context);
    const suggestedActions = this.generateSuggestedActions(context);

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
  private buildSummary(context: EscalationContext): string {
    const parts: string[] = [];

    parts.push(
      `Program "${context.programName}" (${context.programId}) requires escalation after ${context.roundsAttempted} rounds.`,
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
  private identifyKeyIssues(context: EscalationContext): string[] {
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

    // Add BLOCKER concerns as issues
    for (const concern of context.blockerConcerns.slice(0, 3)) {
      // Top 3
      issues.push(`BLOCKER: ${concern.concern}`);
    }

    return issues;
  }

  /**
   * Extract divergent views from votes
   */
  private extractDivergentViews(
    context: EscalationContext,
  ): EscalationReport['divergentViews'] {
    // In a real implementation, this would analyze session votes
    // For now, return placeholder structure
    const views: EscalationReport['divergentViews'] = [];

    // Extract unique justifications from latest votes
    const seenJustifications = new Set<string>();

    // This would be populated from actual session data
    // For now, return empty array (will be populated by orchestrator)

    return views;
  }

  /**
   * Generate suggested actions to resolve escalation
   */
  private generateSuggestedActions(context: EscalationContext): string[] {
    const actions: string[] = [];

    switch (context.reason) {
      case 'STAGNATION':
        actions.push('Review revisions applied between rounds');
        actions.push('Consider alternative migration approach');
        actions.push('Consult senior architect for guidance');
        break;

      case 'PERSISTENT_VETO':
        actions.push('Review veto justification in detail');
        actions.push('Discuss concerns with veto agent');
        actions.push('Consider architectural changes to address veto');
        break;

      case 'CRITICAL_CONCERNS':
        for (const concern of context.blockerConcerns.slice(0, 3)) {
          actions.push(`Address BLOCKER: ${concern.suggestion}`);
        }
        break;

      case 'MAX_ROUNDS':
      default:
        actions.push('Review all agent analyses and votes');
        actions.push('Identify common concerns across agents');
        actions.push('Consider manual intervention or alternative approach');
        break;
    }

    return actions;
  }
}
