/**
 * Consensus Engine - Calculate weighted consensus from agent votes
 *
 * Implements confidence-weighted voting algorithm:
 * Vote Score = Vote Value × (Confidence% / 100) × Agent Weight
 */

import type {
  AgentVote,
  ConsensusResult,
} from '../types.js';
import { VoteNumericValues, ConsensusThresholds } from '../types.js';

/**
 * Calculate consensus from agent votes
 *
 * @param votes - Array of agent votes
 * @param threshold - Required consensus threshold (default: 70%)
 * @returns Consensus result with score and recommendation
 */
export function calculateConsensus(
  votes: AgentVote[],
  threshold: number = ConsensusThresholds.STANDARD,
): ConsensusResult {
  // Validate inputs
  if (votes.length === 0) {
    throw new Error('Cannot calculate consensus with no votes');
  }

  // Calculate weighted consensus score
  let totalWeightedScore = 0;
  let totalWeight = 0;

  for (const vote of votes) {
    // Convert vote to numeric value (0.0 - 1.0)
    const voteValue = VoteNumericValues[vote.vote];

    // Apply confidence adjustment (0-100% → 0.0-1.0)
    const confidenceAdjustment = vote.confidence / 100;
    const adjustedValue = voteValue * confidenceAdjustment;

    // Apply agent weight
    const weightedScore = adjustedValue * vote.weight;

    totalWeightedScore += weightedScore;
    totalWeight += vote.weight;
  }

  // Calculate final consensus score (0-100%)
  const score = (totalWeightedScore / totalWeight) * 100;

  // Check if consensus passed
  const passed = score >= threshold;

  // Count concerns by severity
  const concernsSummary = countConcernsBySeverity(votes);

  // Determine recommendation
  const recommendation = determineRecommendation(
    score,
    threshold,
    concernsSummary,
  );

  return {
    score: Math.round(score * 100) / 100, // Round to 2 decimals
    passed,
    threshold,
    votes,
    concernsSummary,
    recommendation,
    timestamp: new Date(),
  };
}

/**
 * Count concerns by severity level
 */
function countConcernsBySeverity(votes: AgentVote[]): {
  blocker: number;
  major: number;
  minor: number;
} {
  let blocker = 0;
  let major = 0;
  let minor = 0;

  for (const vote of votes) {
    for (const concern of vote.concerns) {
      switch (concern.severity) {
        case 'BLOCKER':
          blocker++;
          break;
        case 'MAJOR':
          major++;
          break;
        case 'MINOR':
          minor++;
          break;
      }
    }
  }

  return { blocker, major, minor };
}

/**
 * Determine recommendation based on consensus
 */
function determineRecommendation(
  score: number,
  threshold: number,
  concerns: { blocker: number; major: number; minor: number },
): 'PROCEED' | 'REVISE' | 'REJECT' {
  // Blockers always require revision
  if (concerns.blocker > 0) {
    return 'REJECT';
  }

  // Score below threshold → revise
  if (score < threshold) {
    return 'REVISE';
  }

  // Score above threshold but major concerns → revise
  if (score >= threshold && concerns.major > 2) {
    return 'REVISE';
  }

  // Score above threshold, no/few concerns → proceed
  return 'PROCEED';
}

/**
 * Format consensus result as markdown report
 */
export function formatConsensusReport(consensus: ConsensusResult): string {
  const lines = [
    '# Consensus Report',
    '',
    `**Score**: ${consensus.score}% (threshold: ${consensus.threshold}%)`,
    `**Status**: ${consensus.passed ? '✅ PASSED' : '❌ FAILED'}`,
    `**Recommendation**: ${getRecommendationEmoji(consensus.recommendation)} ${consensus.recommendation}`,
    '',
    '## Votes',
    '',
  ];

  // Add individual votes
  for (const vote of consensus.votes) {
    const voteValue = VoteNumericValues[vote.vote] * 100;
    const adjustedValue = (voteValue * vote.confidence) / 100;
    const weightedScore = (adjustedValue * vote.weight) / 100;

    lines.push(
      `### ${vote.agent.toUpperCase()} (weight: ${vote.weight}x)`,
      '',
      `- **Vote**: ${vote.vote} (${voteValue}%)`,
      `- **Confidence**: ${vote.confidence}%`,
      `- **Weighted score**: ${Math.round(weightedScore * 100)}%`,
      '',
    );

    if (vote.concerns.length > 0) {
      lines.push('**Concerns**:');
      for (const concern of vote.concerns) {
        lines.push(
          `- [${concern.severity}] ${concern.concern}`,
          `  → ${concern.suggestion}`,
        );
      }
      lines.push('');
    }

    if (vote.suggestions.length > 0) {
      lines.push('**Suggestions**:');
      for (const suggestion of vote.suggestions) {
        lines.push(`- ${suggestion}`);
      }
      lines.push('');
    }

    lines.push('**Justification**:');
    lines.push(vote.justification);
    lines.push('');
  }

  // Add concerns summary
  lines.push('## Concerns Summary');
  lines.push('');
  lines.push(
    `- 🚫 Blockers: ${consensus.concernsSummary.blocker}`,
    `- ⚠️ Major: ${consensus.concernsSummary.major}`,
    `- ℹ️ Minor: ${consensus.concernsSummary.minor}`,
  );

  return lines.join('\n');
}

/**
 * Get emoji for recommendation
 */
function getRecommendationEmoji(
  recommendation: 'PROCEED' | 'REVISE' | 'REJECT',
): string {
  switch (recommendation) {
    case 'PROCEED':
      return '✅';
    case 'REVISE':
      return '⚠️';
    case 'REJECT':
      return '❌';
  }
}

/**
 * Validate agent vote before adding to consensus
 */
export function validateVote(vote: AgentVote): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Confidence must be 0-100
  if (vote.confidence < 0 || vote.confidence > 100) {
    errors.push(`Confidence must be 0-100, got ${vote.confidence}`);
  }

  // Weight must be positive
  if (vote.weight <= 0) {
    errors.push(`Weight must be positive, got ${vote.weight}`);
  }

  // Justification required
  if (!vote.justification || vote.justification.trim().length === 0) {
    errors.push('Justification is required');
  }

  // Concerns must have all required fields
  for (const concern of vote.concerns) {
    if (!concern.concern || concern.concern.trim().length === 0) {
      errors.push('Concern description is required');
    }
    if (!concern.suggestion || concern.suggestion.trim().length === 0) {
      errors.push('Concern suggestion is required');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Calculate agreement level between agents
 *
 * @param votes - Agent votes
 * @returns Agreement percentage (0-100%)
 */
export function calculateAgreement(votes: AgentVote[]): number {
  if (votes.length < 2) {
    return 100; // Perfect agreement with single vote
  }

  // Calculate standard deviation of vote values
  const voteValues = votes.map((v) => VoteNumericValues[v.vote] * 100);
  const mean = voteValues.reduce((sum, val) => sum + val, 0) / voteValues.length;
  const variance =
    voteValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
    voteValues.length;
  const stdDev = Math.sqrt(variance);

  // Convert std dev to agreement percentage (lower std dev = higher agreement)
  // Max std dev is ~50 (votes ranging from 0% to 100%)
  const agreement = 100 - Math.min((stdDev / 50) * 100, 100);

  return Math.round(agreement);
}

/**
 * Find agents who disagree with consensus
 *
 * @param consensus - Consensus result
 * @returns Agents whose votes differ significantly from consensus
 */
export function findDissenters(consensus: ConsensusResult): AgentVote[] {
  const dissenters: AgentVote[] = [];

  for (const vote of consensus.votes) {
    const voteValue = VoteNumericValues[vote.vote] * 100;
    const diff = Math.abs(voteValue - consensus.score);

    // Consider dissenter if vote differs by >25% from consensus
    if (diff > 25) {
      dissenters.push(vote);
    }
  }

  return dissenters;
}
