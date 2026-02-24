/**
 * Unit Tests for Double Vote System
 *
 * Tests the double vote logic for critical programs
 */

import { describe, it, expect } from 'vitest';
import {
  executeDoubleVote,
  compareVoteRounds,
  formatDoubleVoteReport,
  validateDoubleVoteSession,
} from '../../src/swarm/voting/double-vote.js';
import { AgentRoles, VoteValues, ConcernSeverity, ConsensusThresholds } from '../../src/swarm/types.js';
import type { AgentVote, ConsensusResult, DoubleVoteSession } from '../../src/swarm/types.js';

describe('Double Vote System', () => {
  /**
   * Helper: Create mock vote
   */
  function createMockVote(
    agent: string,
    vote: string,
    confidence: number,
    weight: number,
  ): AgentVote {
    return {
      agent: agent as any,
      vote: vote as any,
      confidence,
      weight,
      justification: `Mock vote from ${agent}`,
      concerns: [],
      suggestions: [],
      timestamp: new Date(),
    };
  }

  /**
   * Helper: Create consensus result
   */
  function createConsensus(
    score: number,
    passed: boolean,
    votes: AgentVote[],
  ): ConsensusResult {
    return {
      score,
      passed,
      threshold: ConsensusThresholds.CRITICAL,
      votes,
      concernsSummary: { blocker: 0, major: 0, minor: 0 },
      recommendation: passed ? 'PROCEED' : 'REVISE',
      timestamp: new Date(),
    };
  }

  describe('executeDoubleVote()', () => {
    it('should approve when both votes pass', () => {
      // Arrange
      const firstRoundVotes: AgentVote[] = [
        createMockVote(AgentRoles.ARCHITECT, VoteValues.APPROVE, 90, 2.0),
        createMockVote(AgentRoles.ANALYST, VoteValues.APPROVE, 85, 2.0),
        createMockVote(AgentRoles.DEVELOPER, VoteValues.APPROVE, 80, 1.0),
      ];

      const secondRoundVotes: AgentVote[] = [
        createMockVote(AgentRoles.ARCHITECT, VoteValues.APPROVE, 95, 2.0),
        createMockVote(AgentRoles.ANALYST, VoteValues.APPROVE, 90, 2.0),
        createMockVote(AgentRoles.DEVELOPER, VoteValues.APPROVE, 85, 1.0),
      ];

      const implementation = 'export class MigratedProgram { /* ... */ }';

      // Act
      const result = executeDoubleVote(
        100,
        firstRoundVotes,
        implementation,
        secondRoundVotes,
      );

      // Assert
      expect(result.approved).toBe(true);
      expect(result.recommendation).toBe('APPROVED');
      expect(result.firstVote.passed).toBe(true);
      expect(result.secondVote.passed).toBe(true);
      expect(result.reason).toContain('Both votes passed');
    });

    it('should reject when first vote fails', () => {
      // Arrange - First vote below 80% threshold
      const firstRoundVotes: AgentVote[] = [
        createMockVote(AgentRoles.ARCHITECT, VoteValues.APPROVE_WITH_CONCERNS, 70, 2.0),
        createMockVote(AgentRoles.ANALYST, VoteValues.REJECT, 60, 2.0),
        createMockVote(AgentRoles.DEVELOPER, VoteValues.NEUTRAL, 50, 1.0),
      ];

      const secondRoundVotes: AgentVote[] = [
        createMockVote(AgentRoles.ARCHITECT, VoteValues.APPROVE, 90, 2.0),
        createMockVote(AgentRoles.ANALYST, VoteValues.APPROVE, 85, 2.0),
        createMockVote(AgentRoles.DEVELOPER, VoteValues.APPROVE, 80, 1.0),
      ];

      const implementation = 'export class MigratedProgram { /* ... */ }';

      // Act
      const result = executeDoubleVote(
        100,
        firstRoundVotes,
        implementation,
        secondRoundVotes,
      );

      // Assert
      expect(result.approved).toBe(false);
      expect(result.recommendation).toBe('REJECTED');
      expect(result.firstVote.passed).toBe(false);
      expect(result.reason).toContain('First vote failed');
    });

    it('should need revision when first passes but second fails', () => {
      // Arrange - First pass, second fail
      const firstRoundVotes: AgentVote[] = [
        createMockVote(AgentRoles.ARCHITECT, VoteValues.APPROVE, 90, 2.0),
        createMockVote(AgentRoles.ANALYST, VoteValues.APPROVE, 85, 2.0),
        createMockVote(AgentRoles.DEVELOPER, VoteValues.APPROVE, 80, 1.0),
      ];

      const secondRoundVotes: AgentVote[] = [
        createMockVote(AgentRoles.ARCHITECT, VoteValues.REJECT, 60, 2.0),
        createMockVote(AgentRoles.ANALYST, VoteValues.REJECT_WITH_SUGGESTIONS, 50, 2.0),
        createMockVote(AgentRoles.DEVELOPER, VoteValues.NEUTRAL, 40, 1.0),
      ];

      const implementation = 'export class MigratedProgram { /* ... */ }';

      // Act
      const result = executeDoubleVote(
        100,
        firstRoundVotes,
        implementation,
        secondRoundVotes,
      );

      // Assert
      expect(result.approved).toBe(false);
      expect(result.recommendation).toBe('NEEDS_REVISION');
      expect(result.firstVote.passed).toBe(true);
      expect(result.secondVote.passed).toBe(false);
      expect(result.reason).toContain('Second vote failed');
      expect(result.reason).toContain('implementation');
    });

    it('should include implementation code in result', () => {
      // Arrange
      const firstRoundVotes: AgentVote[] = [
        createMockVote(AgentRoles.ARCHITECT, VoteValues.APPROVE, 90, 2.0),
      ];

      const secondRoundVotes: AgentVote[] = [
        createMockVote(AgentRoles.ARCHITECT, VoteValues.APPROVE, 85, 2.0),
      ];

      const implementation = 'export class MigratedProgram {\n  // Implementation\n}';

      // Act
      const result = executeDoubleVote(
        100,
        firstRoundVotes,
        implementation,
        secondRoundVotes,
      );

      // Assert
      expect(result.implementation).toBe(implementation);
      expect(result.implementation).toContain('MigratedProgram');
    });

    it('should use CRITICAL threshold for both votes', () => {
      // Arrange
      const firstRoundVotes: AgentVote[] = [
        createMockVote(AgentRoles.ARCHITECT, VoteValues.APPROVE, 90, 2.0),
      ];

      const secondRoundVotes: AgentVote[] = [
        createMockVote(AgentRoles.ARCHITECT, VoteValues.APPROVE, 85, 2.0),
      ];

      const implementation = 'code';

      // Act
      const result = executeDoubleVote(
        100,
        firstRoundVotes,
        implementation,
        secondRoundVotes,
      );

      // Assert
      expect(result.firstVote.threshold).toBe(ConsensusThresholds.CRITICAL);
      expect(result.secondVote.threshold).toBe(ConsensusThresholds.CRITICAL);
    });
  });

  describe('compareVoteRounds()', () => {
    it('should identify improved votes', () => {
      // Arrange
      const firstRound: AgentVote[] = [
        createMockVote(AgentRoles.ARCHITECT, VoteValues.APPROVE_WITH_CONCERNS, 70, 2.0),
        createMockVote(AgentRoles.ANALYST, VoteValues.NEUTRAL, 50, 2.0),
      ];

      const secondRound: AgentVote[] = [
        createMockVote(AgentRoles.ARCHITECT, VoteValues.APPROVE, 90, 2.0), // Improved
        createMockVote(AgentRoles.ANALYST, VoteValues.APPROVE, 85, 2.0), // Improved
      ];

      // Act
      const comparison = compareVoteRounds(firstRound, secondRound);

      // Assert
      expect(comparison.improved).toHaveLength(2);
      expect(comparison.declined).toHaveLength(0);
      expect(comparison.consistent).toHaveLength(0);
    });

    it('should identify declined votes', () => {
      // Arrange
      const firstRound: AgentVote[] = [
        createMockVote(AgentRoles.ARCHITECT, VoteValues.APPROVE, 90, 2.0),
        createMockVote(AgentRoles.ANALYST, VoteValues.APPROVE, 85, 2.0),
      ];

      const secondRound: AgentVote[] = [
        createMockVote(AgentRoles.ARCHITECT, VoteValues.REJECT, 60, 2.0), // Declined
        createMockVote(AgentRoles.ANALYST, VoteValues.NEUTRAL, 50, 2.0), // Declined
      ];

      // Act
      const comparison = compareVoteRounds(firstRound, secondRound);

      // Assert
      expect(comparison.improved).toHaveLength(0);
      expect(comparison.declined).toHaveLength(2);
      expect(comparison.consistent).toHaveLength(0);
    });

    it('should identify consistent votes', () => {
      // Arrange
      const firstRound: AgentVote[] = [
        createMockVote(AgentRoles.ARCHITECT, VoteValues.APPROVE, 90, 2.0),
      ];

      const secondRound: AgentVote[] = [
        createMockVote(AgentRoles.ARCHITECT, VoteValues.APPROVE, 92, 2.0), // Only +2%, consistent
      ];

      // Act
      const comparison = compareVoteRounds(firstRound, secondRound);

      // Assert
      expect(comparison.improved).toHaveLength(0);
      expect(comparison.declined).toHaveLength(0);
      expect(comparison.consistent).toHaveLength(1);
    });
  });

  describe('formatDoubleVoteReport()', () => {
    it('should format approved report correctly', () => {
      // Arrange
      const firstRoundVotes: AgentVote[] = [
        createMockVote(AgentRoles.ARCHITECT, VoteValues.APPROVE, 90, 2.0),
      ];

      const secondRoundVotes: AgentVote[] = [
        createMockVote(AgentRoles.ARCHITECT, VoteValues.APPROVE, 85, 2.0),
      ];

      const result = executeDoubleVote(
        100,
        firstRoundVotes,
        'implementation code',
        secondRoundVotes,
      );

      // Act
      const report = formatDoubleVoteReport(result);

      // Assert
      expect(report).toContain('# Double Vote Report');
      expect(report).toContain('✅ APPROVED');
      expect(report).toContain('First Vote (Design Proposal)');
      expect(report).toContain('Second Vote (Implementation)');
      expect(report).toContain('Implementation Code');
      expect(report).toContain('```typescript');
      expect(report).toContain('implementation code');
    });

    it('should format rejected report with reason', () => {
      // Arrange
      const firstRoundVotes: AgentVote[] = [
        createMockVote(AgentRoles.ARCHITECT, VoteValues.REJECT, 60, 2.0),
      ];

      const secondRoundVotes: AgentVote[] = [
        createMockVote(AgentRoles.ARCHITECT, VoteValues.APPROVE, 85, 2.0),
      ];

      const result = executeDoubleVote(
        100,
        firstRoundVotes,
        'implementation code',
        secondRoundVotes,
      );

      // Act
      const report = formatDoubleVoteReport(result);

      // Assert
      expect(report).toContain('❌ REJECTED');
      expect(report).toContain('REJECTED');
      expect(report).toContain('First vote failed');
    });

    it('should show concerns summary', () => {
      // Arrange
      const firstRoundVotes: AgentVote[] = [
        {
          ...createMockVote(AgentRoles.ARCHITECT, VoteValues.APPROVE, 90, 2.0),
          concerns: [
            { concern: 'Test concern', severity: ConcernSeverity.BLOCKER, suggestion: 'Fix it' },
          ],
        },
      ];

      const secondRoundVotes: AgentVote[] = [
        createMockVote(AgentRoles.ARCHITECT, VoteValues.APPROVE, 85, 2.0),
      ];

      const result = executeDoubleVote(
        100,
        firstRoundVotes,
        'implementation code',
        secondRoundVotes,
      );

      // Act
      const report = formatDoubleVoteReport(result);

      // Assert
      expect(report).toContain('🚫 Blockers:');
      expect(report).toContain('⚠️ Major:');
      expect(report).toContain('ℹ️ Minor:');
    });
  });

  describe('validateDoubleVoteSession()', () => {
    it('should validate complete session', () => {
      // Arrange
      const session: DoubleVoteSession = {
        firstVote: createConsensus(85, true, []),
        implementationAfterFirstVote: 'export class MigratedProgram {}',
        secondVote: createConsensus(90, true, []),
        approved: true,
      };

      // Act
      const validation = validateDoubleVoteSession(session);

      // Assert
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should reject session without implementation', () => {
      // Arrange
      const session: DoubleVoteSession = {
        firstVote: createConsensus(85, true, []),
        implementationAfterFirstVote: '', // Empty!
        secondVote: createConsensus(90, true, []),
        approved: true,
      };

      // Act
      const validation = validateDoubleVoteSession(session);

      // Assert
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Implementation code is required between votes');
    });

    it('should reject session without first vote', () => {
      // Arrange
      const session: DoubleVoteSession = {
        firstVote: null as any, // Missing!
        implementationAfterFirstVote: 'code',
        secondVote: createConsensus(90, true, []),
        approved: true,
      };

      // Act
      const validation = validateDoubleVoteSession(session);

      // Assert
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('First vote is required');
    });

    it('should reject session without second vote', () => {
      // Arrange
      const session: DoubleVoteSession = {
        firstVote: createConsensus(85, true, []),
        implementationAfterFirstVote: 'code',
        secondVote: null as any, // Missing!
        approved: true,
      };

      // Act
      const validation = validateDoubleVoteSession(session);

      // Assert
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Second vote is required');
    });

    it('should reject session with wrong threshold', () => {
      // Arrange
      const wrongConsensus = createConsensus(85, true, []);
      wrongConsensus.threshold = 70; // Should be 80 (CRITICAL)

      const session: DoubleVoteSession = {
        firstVote: wrongConsensus,
        implementationAfterFirstVote: 'code',
        secondVote: createConsensus(90, true, []),
        approved: true,
      };

      // Act
      const validation = validateDoubleVoteSession(session);

      // Assert
      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
      expect(validation.errors[0]).toContain('critical threshold');
    });
  });
});
