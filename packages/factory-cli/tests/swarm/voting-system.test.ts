/**
 * Tests for SWARM Voting System
 */

import { describe, it, expect } from 'vitest';
import {
  calculateConsensus,
  validateVote,
  calculateAgreement,
  findDissenters,
} from '../../src/swarm/voting/consensus-engine.js';
import { createVoteCollector } from '../../src/swarm/voting/vote-collector.js';
import {
  executeDoubleVote,
  compareVoteRounds,
} from '../../src/swarm/voting/double-vote.js';
import { AgentRoles, VoteValues, type AgentVote } from '../../src/swarm/types.js';

describe('Voting System', () => {
  describe('Consensus Engine', () => {
    it('should calculate consensus with all approvals', () => {
      const votes: AgentVote[] = [
        {
          agent: AgentRoles.ARCHITECT,
          vote: VoteValues.APPROVE,
          confidence: 95,
          weight: 2.0,
          justification: 'Excellent design',
          concerns: [],
          suggestions: [],
          timestamp: new Date(),
        },
        {
          agent: AgentRoles.ANALYST,
          vote: VoteValues.APPROVE,
          confidence: 90,
          weight: 2.0,
          justification: 'Correct logic',
          concerns: [],
          suggestions: [],
          timestamp: new Date(),
        },
        {
          agent: AgentRoles.DEVELOPER,
          vote: VoteValues.APPROVE,
          confidence: 92,
          weight: 1.0,
          justification: 'Clean code',
          concerns: [],
          suggestions: [],
          timestamp: new Date(),
        },
      ];

      const consensus = calculateConsensus(votes, 70);

      expect(consensus.score).toBeGreaterThan(90);
      expect(consensus.passed).toBe(true);
      expect(consensus.recommendation).toBe('PROCEED');
    });

    it('should fail consensus with rejections', () => {
      const votes: AgentVote[] = [
        {
          agent: AgentRoles.ARCHITECT,
          vote: VoteValues.REJECT,
          confidence: 95,
          weight: 2.0,
          justification: 'Poor design',
          concerns: [
            {
              concern: 'Wrong pattern',
              severity: 'BLOCKER',
              suggestion: 'Use different pattern',
            },
          ],
          suggestions: [],
          timestamp: new Date(),
        },
        {
          agent: AgentRoles.ANALYST,
          vote: VoteValues.REJECT,
          confidence: 90,
          weight: 2.0,
          justification: 'Incorrect logic',
          concerns: [],
          suggestions: [],
          timestamp: new Date(),
        },
      ];

      const consensus = calculateConsensus(votes, 70);

      expect(consensus.score).toBeLessThan(20);
      expect(consensus.passed).toBe(false);
      expect(consensus.recommendation).toBe('REJECT');
      expect(consensus.concernsSummary.blocker).toBe(1);
    });

    it('should handle mixed votes correctly', () => {
      const votes: AgentVote[] = [
        {
          agent: AgentRoles.ARCHITECT,
          vote: VoteValues.APPROVE,
          confidence: 90,
          weight: 2.0,
          justification: 'Good design',
          concerns: [],
          suggestions: [],
          timestamp: new Date(),
        },
        {
          agent: AgentRoles.ANALYST,
          vote: VoteValues.APPROVE_WITH_CONCERNS,
          confidence: 80,
          weight: 2.0,
          justification: 'Good but minor issues',
          concerns: [
            {
              concern: 'Missing validation',
              severity: 'MINOR',
              suggestion: 'Add validation',
            },
          ],
          suggestions: [],
          timestamp: new Date(),
        },
        {
          agent: AgentRoles.DEVELOPER,
          vote: VoteValues.NEUTRAL,
          confidence: 50,
          weight: 1.0,
          justification: 'Unsure about approach',
          concerns: [],
          suggestions: [],
          timestamp: new Date(),
        },
      ];

      const consensus = calculateConsensus(votes, 70);

      // Expected calculation:
      // Architect: 1.0 * 0.9 * 2.0 = 1.8
      // Analyst: 0.75 * 0.8 * 2.0 = 1.2
      // Developer: 0.5 * 0.5 * 1.0 = 0.25
      // Total: (1.8 + 1.2 + 0.25) / (2.0 + 2.0 + 1.0) = 3.25 / 5.0 = 0.65 = 65%

      expect(consensus.score).toBeCloseTo(65, 0);
      expect(consensus.passed).toBe(false); // 65% < 70%
      expect(consensus.recommendation).toBe('REVISE');
    });

    it('should reject if blockers present even with high score', () => {
      const votes: AgentVote[] = [
        {
          agent: AgentRoles.ARCHITECT,
          vote: VoteValues.APPROVE,
          confidence: 95,
          weight: 2.0,
          justification: 'Great',
          concerns: [],
          suggestions: [],
          timestamp: new Date(),
        },
        {
          agent: AgentRoles.REVIEWER,
          vote: VoteValues.APPROVE_WITH_CONCERNS,
          confidence: 70,
          weight: 1.5,
          justification: 'Security issue',
          concerns: [
            {
              concern: 'SQL injection vulnerability',
              severity: 'BLOCKER',
              suggestion: 'Use parameterized queries',
            },
          ],
          suggestions: [],
          timestamp: new Date(),
        },
      ];

      const consensus = calculateConsensus(votes, 70);

      expect(consensus.recommendation).toBe('REJECT'); // Blocker forces reject
      expect(consensus.concernsSummary.blocker).toBe(1);
    });

    it('should validate votes correctly', () => {
      const validVote: AgentVote = {
        agent: AgentRoles.ARCHITECT,
        vote: VoteValues.APPROVE,
        confidence: 90,
        weight: 2.0,
        justification: 'Valid justification',
        concerns: [],
        suggestions: [],
        timestamp: new Date(),
      };

      const validation = validateVote(validVote);
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should reject invalid votes', () => {
      const invalidVote: AgentVote = {
        agent: AgentRoles.ARCHITECT,
        vote: VoteValues.APPROVE,
        confidence: 150, // Invalid: > 100
        weight: -1, // Invalid: negative
        justification: '', // Invalid: empty
        concerns: [],
        suggestions: [],
        timestamp: new Date(),
      };

      const validation = validateVote(invalidVote);
      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    it('should calculate agreement level', () => {
      const votes: AgentVote[] = [
        {
          agent: AgentRoles.ARCHITECT,
          vote: VoteValues.APPROVE,
          confidence: 90,
          weight: 2.0,
          justification: 'Good',
          concerns: [],
          suggestions: [],
          timestamp: new Date(),
        },
        {
          agent: AgentRoles.ANALYST,
          vote: VoteValues.APPROVE,
          confidence: 92,
          weight: 2.0,
          justification: 'Good',
          concerns: [],
          suggestions: [],
          timestamp: new Date(),
        },
      ];

      const agreement = calculateAgreement(votes);
      expect(agreement).toBeGreaterThan(95); // High agreement - both approve
    });

    it('should find dissenters', () => {
      const votes: AgentVote[] = [
        {
          agent: AgentRoles.ARCHITECT,
          vote: VoteValues.APPROVE,
          confidence: 90,
          weight: 2.0,
          justification: 'Good',
          concerns: [],
          suggestions: [],
          timestamp: new Date(),
        },
        {
          agent: AgentRoles.ANALYST,
          vote: VoteValues.REJECT,
          confidence: 95,
          weight: 2.0,
          justification: 'Bad',
          concerns: [],
          suggestions: [],
          timestamp: new Date(),
        },
      ];

      const consensus = calculateConsensus(votes, 70);
      const dissenters = findDissenters(consensus);

      expect(dissenters.length).toBeGreaterThan(0);
    });
  });

  describe('Vote Collector', () => {
    it('should collect votes from agents', () => {
      const collector = createVoteCollector('test-session');

      const vote: AgentVote = {
        agent: AgentRoles.ARCHITECT,
        vote: VoteValues.APPROVE,
        confidence: 90,
        weight: 2.0,
        justification: 'Good',
        concerns: [],
        suggestions: [],
        timestamp: new Date(),
      };

      collector.submitVote(vote);

      expect(collector.getVoteCount()).toBe(1);
      expect(collector.getVoteByAgent(AgentRoles.ARCHITECT)).toEqual(vote);
    });

    it('should reject duplicate votes', () => {
      const collector = createVoteCollector('test-session');

      const vote: AgentVote = {
        agent: AgentRoles.ARCHITECT,
        vote: VoteValues.APPROVE,
        confidence: 90,
        weight: 2.0,
        justification: 'Good',
        concerns: [],
        suggestions: [],
        timestamp: new Date(),
      };

      collector.submitVote(vote);

      expect(() => collector.submitVote(vote)).toThrow('already submitted');
    });

    it('should track missing votes', () => {
      const collector = createVoteCollector('test-session');

      const vote: AgentVote = {
        agent: AgentRoles.ARCHITECT,
        vote: VoteValues.APPROVE,
        confidence: 90,
        weight: 2.0,
        justification: 'Good',
        concerns: [],
        suggestions: [],
        timestamp: new Date(),
      };

      collector.submitVote(vote);

      const expectedAgents = [
        AgentRoles.ARCHITECT,
        AgentRoles.ANALYST,
        AgentRoles.DEVELOPER,
      ];

      expect(collector.isComplete(expectedAgents)).toBe(false);
      expect(collector.getMissingVotes(expectedAgents)).toEqual([
        AgentRoles.ANALYST,
        AgentRoles.DEVELOPER,
      ]);
    });
  });

  describe('Double Vote System', () => {
    it('should approve when both votes pass', () => {
      const firstVotes: AgentVote[] = [
        {
          agent: AgentRoles.ARCHITECT,
          vote: VoteValues.APPROVE,
          confidence: 90,
          weight: 2.0,
          justification: 'Good design',
          concerns: [],
          suggestions: [],
          timestamp: new Date(),
        },
        {
          agent: AgentRoles.ANALYST,
          vote: VoteValues.APPROVE,
          confidence: 95,
          weight: 2.0,
          justification: 'Correct',
          concerns: [],
          suggestions: [],
          timestamp: new Date(),
        },
      ];

      const secondVotes: AgentVote[] = [
        {
          agent: AgentRoles.ARCHITECT,
          vote: VoteValues.APPROVE,
          confidence: 92,
          weight: 2.0,
          justification: 'Well implemented',
          concerns: [],
          suggestions: [],
          timestamp: new Date(),
        },
        {
          agent: AgentRoles.ANALYST,
          vote: VoteValues.APPROVE,
          confidence: 93,
          weight: 2.0,
          justification: 'Correct implementation',
          concerns: [],
          suggestions: [],
          timestamp: new Date(),
        },
      ];

      const result = executeDoubleVote(
        123,
        firstVotes,
        'Implementation code here',
        secondVotes,
      );

      expect(result.approved).toBe(true);
      expect(result.recommendation).toBe('APPROVED');
      expect(result.firstVote.passed).toBe(true);
      expect(result.secondVote.passed).toBe(true);
    });

    it('should reject when first vote fails', () => {
      const firstVotes: AgentVote[] = [
        {
          agent: AgentRoles.ARCHITECT,
          vote: VoteValues.REJECT,
          confidence: 95,
          weight: 2.0,
          justification: 'Bad design',
          concerns: [{ concern: 'Wrong pattern', severity: 'BLOCKER', suggestion: 'Fix' }],
          suggestions: [],
          timestamp: new Date(),
        },
      ];

      const secondVotes: AgentVote[] = [
        {
          agent: AgentRoles.ARCHITECT,
          vote: VoteValues.APPROVE,
          confidence: 90,
          weight: 2.0,
          justification: 'Good implementation',
          concerns: [],
          suggestions: [],
          timestamp: new Date(),
        },
      ];

      const result = executeDoubleVote(
        123,
        firstVotes,
        'Implementation code',
        secondVotes,
      );

      expect(result.approved).toBe(false);
      expect(result.recommendation).toBe('REJECTED');
    });

    it('should require revision when second vote fails', () => {
      const firstVotes: AgentVote[] = [
        {
          agent: AgentRoles.ARCHITECT,
          vote: VoteValues.APPROVE,
          confidence: 95,
          weight: 2.0,
          justification: 'Good design',
          concerns: [],
          suggestions: [],
          timestamp: new Date(),
        },
        {
          agent: AgentRoles.ANALYST,
          vote: VoteValues.APPROVE,
          confidence: 90,
          weight: 2.0,
          justification: 'Correct',
          concerns: [],
          suggestions: [],
          timestamp: new Date(),
        },
      ];

      const secondVotes: AgentVote[] = [
        {
          agent: AgentRoles.ARCHITECT,
          vote: VoteValues.REJECT,
          confidence: 95,
          weight: 2.0,
          justification: 'Bad implementation',
          concerns: [{ concern: 'Bugs found', severity: 'BLOCKER', suggestion: 'Fix bugs' }],
          suggestions: [],
          timestamp: new Date(),
        },
        {
          agent: AgentRoles.ANALYST,
          vote: VoteValues.REJECT,
          confidence: 92,
          weight: 2.0,
          justification: 'Wrong logic',
          concerns: [],
          suggestions: [],
          timestamp: new Date(),
        },
      ];

      const result = executeDoubleVote(
        123,
        firstVotes,
        'Implementation code',
        secondVotes,
      );

      expect(result.approved).toBe(false);
      expect(result.recommendation).toBe('NEEDS_REVISION');
    });

    it('should compare vote rounds', () => {
      const firstRound: AgentVote[] = [
        {
          agent: AgentRoles.ARCHITECT,
          vote: VoteValues.NEUTRAL,
          confidence: 60,
          weight: 2.0,
          justification: 'Unsure',
          concerns: [],
          suggestions: [],
          timestamp: new Date(),
        },
      ];

      const secondRound: AgentVote[] = [
        {
          agent: AgentRoles.ARCHITECT,
          vote: VoteValues.APPROVE,
          confidence: 90,
          weight: 2.0,
          justification: 'Now confident',
          concerns: [],
          suggestions: [],
          timestamp: new Date(),
        },
      ];

      const comparison = compareVoteRounds(firstRound, secondRound);

      expect(comparison.improved.length).toBeGreaterThan(0);
      expect(comparison.declined.length).toBe(0);
    });
  });
});
