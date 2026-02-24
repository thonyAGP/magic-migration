/**
 * Double Vote System - Two-round voting for critical programs
 *
 * Ensures critical programs (payment, security, compliance) get extra scrutiny:
 * 1. First vote on proposed solution
 * 2. Implement solution
 * 3. Second vote on actual implementation
 * 4. Approve only if both votes pass
 */

import type {
  AgentVote,
  ConsensusResult,
  DoubleVoteSession,
} from '../types.js';
import { ConsensusThresholds } from '../types.js';
import { calculateConsensus } from './consensus-engine.js';

/**
 * Result of a double vote session
 */
export interface DoubleVoteResult {
  /** Did both votes pass? */
  approved: boolean;
  /** First vote consensus */
  firstVote: ConsensusResult;
  /** Second vote consensus */
  secondVote: ConsensusResult;
  /** Implementation code between votes */
  implementation: string;
  /** Final recommendation */
  recommendation: 'APPROVED' | 'REJECTED' | 'NEEDS_REVISION';
  /** Reason for recommendation */
  reason: string;
}

/**
 * Execute double vote process for critical program
 *
 * @param programId - Program being evaluated
 * @param firstRoundVotes - Votes on proposed solution
 * @param implementation - Actual implementation after first vote
 * @param secondRoundVotes - Votes on implementation
 * @returns Double vote result
 */
export function executeDoubleVote(
  programId: number,
  firstRoundVotes: AgentVote[],
  implementation: string,
  secondRoundVotes: AgentVote[],
): DoubleVoteResult {
  // Calculate first vote consensus (critical threshold)
  const firstVote = calculateConsensus(
    firstRoundVotes,
    ConsensusThresholds.CRITICAL,
  );

  // Calculate second vote consensus (critical threshold)
  const secondVote = calculateConsensus(
    secondRoundVotes,
    ConsensusThresholds.CRITICAL,
  );

  // Determine final approval
  const approved = firstVote.passed && secondVote.passed;

  // Determine recommendation
  const recommendation = determineDoubleVoteRecommendation(
    firstVote,
    secondVote,
  );

  // Build reason
  const reason = buildDoubleVoteReason(firstVote, secondVote, approved);

  return {
    approved,
    firstVote,
    secondVote,
    implementation,
    recommendation,
    reason,
  };
}

/**
 * Determine recommendation based on both votes
 */
function determineDoubleVoteRecommendation(
  firstVote: ConsensusResult,
  secondVote: ConsensusResult,
): 'APPROVED' | 'REJECTED' | 'NEEDS_REVISION' {
  // Both passed → approved
  if (firstVote.passed && secondVote.passed) {
    return 'APPROVED';
  }

  // First failed → rejected (bad design)
  if (!firstVote.passed) {
    return 'REJECTED';
  }

  // First passed but second failed → needs revision (implementation issues)
  if (firstVote.passed && !secondVote.passed) {
    return 'NEEDS_REVISION';
  }

  return 'REJECTED';
}

/**
 * Build human-readable reason
 */
function buildDoubleVoteReason(
  firstVote: ConsensusResult,
  secondVote: ConsensusResult,
  approved: boolean,
): string {
  if (approved) {
    return `Both votes passed: design ${firstVote.score}% (≥${firstVote.threshold}%), implementation ${secondVote.score}% (≥${secondVote.threshold}%)`;
  }

  if (!firstVote.passed) {
    return `First vote failed: design scored ${firstVote.score}% (threshold: ${firstVote.threshold}%). ${firstVote.concernsSummary.blocker} blockers, ${firstVote.concernsSummary.major} major concerns.`;
  }

  if (!secondVote.passed) {
    return `Second vote failed: implementation scored ${secondVote.score}% (threshold: ${secondVote.threshold}%). ${secondVote.concernsSummary.blocker} blockers, ${secondVote.concernsSummary.major} major concerns.`;
  }

  return 'Unknown failure';
}

/**
 * Format double vote result as markdown report
 */
export function formatDoubleVoteReport(result: DoubleVoteResult): string {
  const lines = [
    '# Double Vote Report',
    '',
    `**Final Status**: ${result.approved ? '✅ APPROVED' : '❌ REJECTED'}`,
    `**Recommendation**: ${result.recommendation}`,
    '',
    '**Reason**:',
    result.reason,
    '',
    '---',
    '',
    '## First Vote (Design Proposal)',
    '',
    `**Score**: ${result.firstVote.score}% (threshold: ${result.firstVote.threshold}%)`,
    `**Status**: ${result.firstVote.passed ? '✅ PASSED' : '❌ FAILED'}`,
    `**Recommendation**: ${result.firstVote.recommendation}`,
    '',
    '**Concerns**:',
    `- 🚫 Blockers: ${result.firstVote.concernsSummary.blocker}`,
    `- ⚠️ Major: ${result.firstVote.concernsSummary.major}`,
    `- ℹ️ Minor: ${result.firstVote.concernsSummary.minor}`,
    '',
    '---',
    '',
    '## Second Vote (Implementation)',
    '',
    `**Score**: ${result.secondVote.score}% (threshold: ${result.secondVote.threshold}%)`,
    `**Status**: ${result.secondVote.passed ? '✅ PASSED' : '❌ FAILED'}`,
    `**Recommendation**: ${result.secondVote.recommendation}`,
    '',
    '**Concerns**:',
    `- 🚫 Blockers: ${result.secondVote.concernsSummary.blocker}`,
    `- ⚠️ Major: ${result.secondVote.concernsSummary.major}`,
    `- ℹ️ Minor: ${result.secondVote.concernsSummary.minor}`,
    '',
    '---',
    '',
    '## Implementation Code',
    '',
    '```typescript',
    result.implementation,
    '```',
  ];

  return lines.join('\n');
}

/**
 * Compare agent votes between rounds
 *
 * Identifies agents who changed their vote significantly
 */
export function compareVoteRounds(
  firstRound: AgentVote[],
  secondRound: AgentVote[],
): {
  improved: AgentVote[];
  declined: AgentVote[];
  consistent: AgentVote[];
} {
  const improved: AgentVote[] = [];
  const declined: AgentVote[] = [];
  const consistent: AgentVote[] = [];

  // Create maps for easy lookup
  const firstVoteMap = new Map(firstRound.map((v) => [v.agent, v]));
  const secondVoteMap = new Map(secondRound.map((v) => [v.agent, v]));

  // Compare each agent's votes
  for (const [agent, secondVote] of secondVoteMap) {
    const firstVote = firstVoteMap.get(agent);
    if (!firstVote) continue;

    // Calculate numeric vote values
    const firstValue = getVoteNumericValue(firstVote);
    const secondValue = getVoteNumericValue(secondVote);

    const diff = secondValue - firstValue;

    if (diff > 0.1) {
      // Improved by >10%
      improved.push(secondVote);
    } else if (diff < -0.1) {
      // Declined by >10%
      declined.push(secondVote);
    } else {
      // Stayed roughly the same
      consistent.push(secondVote);
    }
  }

  return { improved, declined, consistent };
}

/**
 * Get numeric vote value (0.0 - 1.0)
 */
function getVoteNumericValue(vote: AgentVote): number {
  const voteValues = {
    APPROVE: 1.0,
    APPROVE_WITH_CONCERNS: 0.75,
    NEUTRAL: 0.5,
    REJECT_WITH_SUGGESTIONS: 0.25,
    REJECT: 0.0,
  };
  return voteValues[vote.vote] * (vote.confidence / 100);
}

/**
 * Validate double vote session data
 */
export function validateDoubleVoteSession(
  session: DoubleVoteSession,
): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // First vote required
  if (!session.firstVote) {
    errors.push('First vote is required');
  }

  // Implementation required
  if (
    !session.implementationAfterFirstVote ||
    session.implementationAfterFirstVote.trim().length === 0
  ) {
    errors.push('Implementation code is required between votes');
  }

  // Second vote required
  if (!session.secondVote) {
    errors.push('Second vote is required');
  }

  // Both votes must use critical threshold
  if (
    session.firstVote &&
    session.firstVote.threshold !== ConsensusThresholds.CRITICAL
  ) {
    errors.push(
      `First vote must use critical threshold (${ConsensusThresholds.CRITICAL}%)`,
    );
  }

  if (
    session.secondVote &&
    session.secondVote.threshold !== ConsensusThresholds.CRITICAL
  ) {
    errors.push(
      `Second vote must use critical threshold (${ConsensusThresholds.CRITICAL}%)`,
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
