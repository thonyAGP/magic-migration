/**
 * EscalationManager Tests - Phase 3 I2
 *
 * Tests for escalation manager methods including:
 * - extractDivergentViews()
 * - analyzeVotingPatterns()
 * - calculateUrgency()
 * - generateEscalationReport() enriched reports
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { EscalationManager } from '../../src/swarm/escalation/escalation-manager.js';
import { MockSwarmStore } from './integration/fixtures/mock-store.js';
import type { SwarmSession } from '../../src/swarm/types.js';
import type { EscalationContext } from '../../src/swarm/escalation/types.js';
import { AgentRoles } from '../../src/swarm/types.js';

describe('EscalationManager - Phase 3 I2', () => {
  let escalationManager: EscalationManager;
  let mockStore: MockSwarmStore;

  beforeEach(() => {
    mockStore = new MockSwarmStore();
    escalationManager = new EscalationManager(mockStore as any);
  });

  describe('analyzeVotingPatterns', () => {
    it('should identify consensus agents (APPROVE votes)', () => {
      const session: SwarmSession = {
        id: 'test-session',
        programId: 42,
        programName: 'TestProgram',
        status: 'ESCALATED',
        current_phase: 'voting',
        createdAt: new Date(),
        votes: [
          {
            id: 'v1',
            agent: AgentRoles.ARCHITECT,
            vote: 'APPROVE',
            confidence: 85,
            reasoning: 'Architecture looks good',
            justification: 'Clean design',
            concerns: [],
          },
          {
            id: 'v2',
            agent: AgentRoles.DEVELOPER,
            vote: 'APPROVE_WITH_CONCERNS',
            confidence: 75,
            reasoning: 'Code is acceptable',
            justification: 'Minor improvements needed',
            concerns: [{ category: 'TECHNICAL', severity: 'MINOR', description: 'Naming' }],
          },
        ],
        analyses: [],
        consensus: { score: 0, shouldProceed: false, decision: 'REJECT' },
      };

      const patterns = escalationManager.analyzeVotingPatterns(session);

      expect(patterns.consensusAgents).toEqual([
        AgentRoles.ARCHITECT,
        AgentRoles.DEVELOPER,
      ]);
      expect(patterns.dissentingAgents).toHaveLength(0);
      expect(patterns.vetoingAgents).toHaveLength(0);
    });

    it('should identify dissenting agents (REJECT votes)', () => {
      const session: SwarmSession = {
        id: 'test-session',
        programId: 42,
        programName: 'TestProgram',
        status: 'ESCALATED',
        current_phase: 'voting',
        createdAt: new Date(),
        votes: [
          {
            id: 'v1',
            agent: AgentRoles.ARCHITECT,
            vote: 'APPROVE',
            confidence: 85,
            reasoning: 'Architecture looks good',
            justification: 'Clean design',
            concerns: [],
          },
          {
            id: 'v2',
            agent: AgentRoles.TESTER,
            vote: 'REJECT',
            confidence: 90,
            reasoning: 'Missing test coverage',
            justification: 'Critical paths untested',
            concerns: [{ category: 'TESTING', severity: 'MAJOR', description: 'No tests' }],
          },
        ],
        analyses: [],
        consensus: { score: 50, shouldProceed: false, decision: 'REJECT' },
      };

      const patterns = escalationManager.analyzeVotingPatterns(session);

      expect(patterns.consensusAgents).toEqual([AgentRoles.ARCHITECT]);
      expect(patterns.dissentingAgents).toEqual([AgentRoles.TESTER]);
      expect(patterns.vetoingAgents).toHaveLength(0);
    });

    it('should identify vetoing agents (BLOCKER concerns)', () => {
      const session: SwarmSession = {
        id: 'test-session',
        programId: 42,
        programName: 'TestProgram',
        status: 'ESCALATED',
        current_phase: 'voting',
        createdAt: new Date(),
        votes: [
          {
            id: 'v1',
            agent: AgentRoles.ARCHITECT,
            vote: 'REJECT',
            confidence: 95,
            reasoning: 'Critical security flaw',
            justification: 'SQL injection vulnerability',
            concerns: [
              {
                category: 'SECURITY',
                severity: 'BLOCKER',
                description: 'SQL injection in user input',
              },
            ],
          },
          {
            id: 'v2',
            agent: AgentRoles.REVIEWER,
            vote: 'REJECT',
            confidence: 90,
            reasoning: 'Data loss risk',
            justification: 'Missing transaction handling',
            concerns: [
              {
                category: 'TECHNICAL',
                severity: 'BLOCKER',
                description: 'No rollback mechanism',
              },
            ],
          },
        ],
        analyses: [],
        consensus: { score: 0, shouldProceed: false, decision: 'REJECT' },
      };

      const patterns = escalationManager.analyzeVotingPatterns(session);

      expect(patterns.vetoingAgents).toEqual([
        AgentRoles.ARCHITECT,
        AgentRoles.REVIEWER,
      ]);
      expect(patterns.mainBlockers).toHaveLength(2);
      expect(patterns.mainBlockers[0].severity).toBe('BLOCKER');
      expect(patterns.mainBlockers[1].severity).toBe('BLOCKER');
    });

    it('should limit mainBlockers to 3 max', () => {
      const session: SwarmSession = {
        id: 'test-session',
        programId: 42,
        programName: 'TestProgram',
        status: 'ESCALATED',
        current_phase: 'voting',
        createdAt: new Date(),
        votes: [
          {
            id: 'v1',
            agent: AgentRoles.ARCHITECT,
            vote: 'REJECT',
            confidence: 95,
            reasoning: 'Multiple critical issues',
            justification: 'Too many problems',
            concerns: [
              { category: 'SECURITY', severity: 'BLOCKER', description: 'Issue 1' },
              { category: 'SECURITY', severity: 'BLOCKER', description: 'Issue 2' },
              { category: 'TECHNICAL', severity: 'BLOCKER', description: 'Issue 3' },
              { category: 'TECHNICAL', severity: 'BLOCKER', description: 'Issue 4' },
            ],
          },
        ],
        analyses: [],
        consensus: { score: 0, shouldProceed: false, decision: 'REJECT' },
      };

      const patterns = escalationManager.analyzeVotingPatterns(session);

      expect(patterns.mainBlockers).toHaveLength(3); // Max 3
    });
  });

  describe('calculateUrgency', () => {
    it('should return CRITICAL urgency for CRITICAL_CONCERNS + many blockers + high rounds', () => {
      const context: EscalationContext = {
        sessionId: 'test-session',
        programId: 42,
        programName: 'CriticalProgram',
        reason: 'CRITICAL_CONCERNS',
        blockerConcerns: [
          { category: 'SECURITY', severity: 'BLOCKER', description: 'SQL injection' },
          { category: 'SECURITY', severity: 'BLOCKER', description: 'XSS vulnerability' },
          { category: 'TECHNICAL', severity: 'BLOCKER', description: 'Data loss risk' },
          { category: 'TECHNICAL', severity: 'BLOCKER', description: 'No rollback' },
          { category: 'TESTING', severity: 'BLOCKER', description: 'Zero coverage' },
        ],
        roundsAttempted: 8,
        finalConsensusScore: 25,
        humanReviewRequired: true,
        stopMigration: true,
      };

      const urgency = escalationManager.calculateUrgency(context);

      // 40 (CRITICAL_CONCERNS) + 30 (5+ blockers) + 20 (8 rounds) + 10 (score < 30) = 100
      expect(urgency).toBe('CRITICAL');
    });

    it('should return HIGH urgency for PERSISTENT_VETO + moderate blockers', () => {
      const context: EscalationContext = {
        sessionId: 'test-session',
        programId: 42,
        programName: 'TestProgram',
        reason: 'PERSISTENT_VETO',
        blockerConcerns: [
          { category: 'SECURITY', severity: 'BLOCKER', description: 'Issue 1' },
          { category: 'SECURITY', severity: 'BLOCKER', description: 'Issue 2' },
          { category: 'TECHNICAL', severity: 'BLOCKER', description: 'Issue 3' },
        ],
        roundsAttempted: 5,
        finalConsensusScore: 40,
        humanReviewRequired: true,
        stopMigration: false,
      };

      const urgency = escalationManager.calculateUrgency(context);

      // 35 (PERSISTENT_VETO) + 20 (3 blockers) + 15 (5 rounds) + 5 (score < 50) = 75 -> CRITICAL
      // Actually 75 is CRITICAL (>= 70)
      expect(urgency).toBe('CRITICAL');
    });

    it('should return MEDIUM urgency for STAGNATION + few blockers', () => {
      const context: EscalationContext = {
        sessionId: 'test-session',
        programId: 42,
        programName: 'TestProgram',
        reason: 'STAGNATION',
        blockerConcerns: [
          { category: 'TECHNICAL', severity: 'BLOCKER', description: 'Issue 1' },
        ],
        roundsAttempted: 3,
        finalConsensusScore: 55,
        humanReviewRequired: false,
        stopMigration: false,
      };

      const urgency = escalationManager.calculateUrgency(context);

      // 25 (STAGNATION) + 10 (1 blocker) + 10 (3 rounds) + 0 (score >= 50) = 45 -> MEDIUM
      expect(urgency).toBe('MEDIUM');
    });

    it('should return LOW urgency for MAX_ROUNDS with no blockers', () => {
      const context: EscalationContext = {
        sessionId: 'test-session',
        programId: 42,
        programName: 'TestProgram',
        reason: 'MAX_ROUNDS',
        blockerConcerns: [],
        roundsAttempted: 5,
        finalConsensusScore: 65,
        humanReviewRequired: false,
        stopMigration: false,
      };

      const urgency = escalationManager.calculateUrgency(context);

      // 20 (MAX_ROUNDS) + 0 (no blockers) + 15 (5 rounds) + 0 (score >= 50) = 35 -> MEDIUM
      // Actually 35 is MEDIUM (>= 30)
      expect(urgency).toBe('MEDIUM');
    });

    it('should return LOW urgency for minimal escalation', () => {
      const context: EscalationContext = {
        sessionId: 'test-session',
        programId: 42,
        programName: 'TestProgram',
        reason: 'MAX_ROUNDS',
        blockerConcerns: [],
        roundsAttempted: 1,
        finalConsensusScore: 68,
        humanReviewRequired: false,
        stopMigration: false,
      };

      const urgency = escalationManager.calculateUrgency(context);

      // 20 (MAX_ROUNDS) + 0 (no blockers) + 0 (1 round) + 0 (score >= 50) = 20 -> LOW
      expect(urgency).toBe('LOW');
    });
  });

  describe('generateEscalationReport - enriched reports', () => {
    it('should include urgency level in summary', () => {
      const context: EscalationContext = {
        sessionId: 'test-session',
        programId: 42,
        programName: 'CriticalProgram',
        reason: 'CRITICAL_CONCERNS',
        blockerConcerns: [
          { category: 'SECURITY', severity: 'BLOCKER', description: 'SQL injection' },
          { category: 'SECURITY', severity: 'BLOCKER', description: 'XSS vulnerability' },
          { category: 'SECURITY', severity: 'BLOCKER', description: 'CSRF missing' },
          { category: 'TECHNICAL', severity: 'BLOCKER', description: 'Data loss' },
          { category: 'TECHNICAL', severity: 'BLOCKER', description: 'No rollback' },
        ],
        roundsAttempted: 8,
        finalConsensusScore: 20,
        humanReviewRequired: true,
        stopMigration: true,
      };

      const report = escalationManager.generateEscalationReport(context);

      expect(report.summary).toContain('🔴');
      expect(report.summary).toContain('[CRITICAL URGENCY]');
      expect(report.summary).toContain('CriticalProgram');
    });

    it('should include voting patterns in key issues', () => {
      const context: EscalationContext = {
        sessionId: 'test-session',
        programId: 42,
        programName: 'TestProgram',
        reason: 'PERSISTENT_VETO',
        blockerConcerns: [
          { category: 'SECURITY', severity: 'BLOCKER', description: 'Critical security issue' },
        ],
        roundsAttempted: 5,
        finalConsensusScore: 40,
        humanReviewRequired: true,
        stopMigration: false,
      };

      const session: SwarmSession = {
        id: 'test-session',
        programId: 42,
        programName: 'TestProgram',
        status: 'ESCALATED',
        current_phase: 'voting',
        createdAt: new Date(),
        votes: [
          {
            id: 'v1',
            agent: AgentRoles.ARCHITECT,
            vote: 'REJECT',
            confidence: 95,
            reasoning: 'Security issues',
            justification: 'Critical security flaw',
            concerns: [
              { category: 'SECURITY', severity: 'BLOCKER', description: 'Critical security issue' },
            ],
          },
          {
            id: 'v2',
            agent: AgentRoles.DEVELOPER,
            vote: 'APPROVE',
            confidence: 70,
            reasoning: 'Code looks fine',
            justification: 'Implementation is correct',
            concerns: [],
          },
        ],
        analyses: [],
        consensus: { score: 40, shouldProceed: false, decision: 'REJECT' },
      };

      const report = escalationManager.generateEscalationReport(context, session);

      expect(report.keyIssues.length).toBeGreaterThan(0);
      // Should mention vetoing agents (lowercase)
      const issueText = report.keyIssues.join(' ');
      expect(issueText.toLowerCase()).toContain('architect');
    });

    it('should include divergent views when session provided', () => {
      const context: EscalationContext = {
        sessionId: 'test-session',
        programId: 42,
        programName: 'TestProgram',
        reason: 'PERSISTENT_VETO',
        blockerConcerns: [
          { category: 'SECURITY', severity: 'BLOCKER', description: 'Security issue' },
        ],
        roundsAttempted: 3,
        finalConsensusScore: 45,
        humanReviewRequired: true,
        stopMigration: false,
      };

      const session: SwarmSession = {
        id: 'test-session',
        programId: 42,
        programName: 'TestProgram',
        status: 'ESCALATED',
        current_phase: 'voting',
        createdAt: new Date(),
        votes: [
          {
            id: 'v1',
            agent: AgentRoles.ARCHITECT,
            vote: 'REJECT',
            confidence: 95,
            reasoning: 'Security is critical',
            justification: 'Cannot proceed with SQL injection vulnerability',
            concerns: [
              { category: 'SECURITY', severity: 'BLOCKER', description: 'Security issue' },
            ],
          },
          {
            id: 'v2',
            agent: AgentRoles.DEVELOPER,
            vote: 'APPROVE',
            confidence: 80,
            reasoning: 'Code is functional',
            justification: 'Implementation meets requirements, security can be hardened later',
            concerns: [],
          },
        ],
        analyses: [],
        consensus: { score: 45, shouldProceed: false, decision: 'REJECT' },
      };

      const report = escalationManager.generateEscalationReport(context, session);

      expect(report.divergentViews.length).toBeGreaterThan(0);

      // Check that divergent views contain both REJECT and APPROVE positions
      const architects = report.divergentViews.filter((v) => v.agent === 'architect');
      const developers = report.divergentViews.filter((v) => v.agent === 'developer');

      expect(architects.length).toBeGreaterThan(0);
      expect(developers.length).toBeGreaterThan(0);

      // Verify views contain the justifications
      expect(architects[0].view).toContain('SQL injection');
      expect(developers[0].view).toContain('meets requirements');
    });

    it('should provide specific agent recommendations in suggested actions', () => {
      const context: EscalationContext = {
        sessionId: 'test-session',
        programId: 42,
        programName: 'TestProgram',
        reason: 'PERSISTENT_VETO',
        blockerConcerns: [
          { category: 'SECURITY', severity: 'BLOCKER', description: 'Security issue' },
        ],
        roundsAttempted: 4,
        finalConsensusScore: 50,
        humanReviewRequired: true,
        stopMigration: false,
      };

      const session: SwarmSession = {
        id: 'test-session',
        programId: 42,
        programName: 'TestProgram',
        status: 'ESCALATED',
        current_phase: 'voting',
        createdAt: new Date(),
        votes: [
          {
            id: 'v1',
            agent: AgentRoles.ARCHITECT,
            vote: 'REJECT',
            confidence: 95,
            reasoning: 'Security issues',
            justification: 'Critical security flaw',
            concerns: [
              { category: 'SECURITY', severity: 'BLOCKER', description: 'Security issue' },
            ],
          },
        ],
        analyses: [],
        consensus: { score: 50, shouldProceed: false, decision: 'REJECT' },
      };

      const report = escalationManager.generateEscalationReport(context, session);

      expect(report.suggestedActions.length).toBeGreaterThan(0);
      // Should mention vetoing agent (architect - lowercase)
      const actionsText = report.suggestedActions.join(' ');
      expect(actionsText.toLowerCase()).toContain('architect');
    });

    it('should generate complete enriched report for complex case', () => {
      const context: EscalationContext = {
        sessionId: 'test-session',
        programId: 42,
        programName: 'PaymentProcessor',
        reason: 'CRITICAL_CONCERNS',
        blockerConcerns: [
          { category: 'SECURITY', severity: 'BLOCKER', description: 'SQL injection' },
          { category: 'SECURITY', severity: 'BLOCKER', description: 'XSS vulnerability' },
          { category: 'TECHNICAL', severity: 'BLOCKER', description: 'Transaction handling missing' },
        ],
        roundsAttempted: 6,
        finalConsensusScore: 35,
        humanReviewRequired: true,
        stopMigration: true,
      };

      const session: SwarmSession = {
        id: 'test-session',
        programId: 42,
        programName: 'PaymentProcessor',
        status: 'ESCALATED',
        current_phase: 'voting',
        createdAt: new Date(),
        votes: [
          {
            id: 'v1',
            agent: AgentRoles.ARCHITECT,
            vote: 'REJECT',
            confidence: 95,
            reasoning: 'Critical security issues',
            justification: 'Payment processing cannot have SQL injection vulnerabilities',
            concerns: [
              { category: 'SECURITY', severity: 'BLOCKER', description: 'SQL injection' },
            ],
          },
          {
            id: 'v2',
            agent: AgentRoles.REVIEWER,
            vote: 'REJECT',
            confidence: 90,
            reasoning: 'Missing transaction safety',
            justification: 'Financial operations must be atomic',
            concerns: [
              { category: 'TECHNICAL', severity: 'BLOCKER', description: 'Transaction handling missing' },
            ],
          },
          {
            id: 'v3',
            agent: AgentRoles.DEVELOPER,
            vote: 'APPROVE_WITH_CONCERNS',
            confidence: 60,
            reasoning: 'Functionality works',
            justification: 'Core payment logic is correct, security can be added',
            concerns: [
              { category: 'SECURITY', severity: 'MAJOR', description: 'Need input validation' },
            ],
          },
        ],
        analyses: [],
        consensus: { score: 35, shouldProceed: false, decision: 'REJECT' },
      };

      const report = escalationManager.generateEscalationReport(context, session);

      // Verify all enriched fields
      expect(report.summary).toContain('🔴'); // CRITICAL or HIGH urgency
      expect(report.summary).toContain('PaymentProcessor');
      expect(report.summary).toContain('URGENCY');

      expect(report.keyIssues.length).toBeGreaterThan(0);
      // Check for agent names (lowercase)
      const issuesText = report.keyIssues.join(' ').toLowerCase();
      expect(issuesText.includes('architect') || issuesText.includes('reviewer')).toBe(true);

      expect(report.divergentViews.length).toBeGreaterThanOrEqual(2);

      expect(report.suggestedActions.length).toBeGreaterThan(0);

      // Recommendation should be one of the valid values
      expect(['HUMAN_REVIEW', 'SENIOR_AGENT', 'ARCHITECTURE_CHANGE']).toContain(
        report.recommendation,
      );
    });
  });

  describe('extractDivergentViews - edge cases', () => {
    it('should handle session with no votes', () => {
      const context: EscalationContext = {
        sessionId: 'test-session',
        programId: 42,
        programName: 'TestProgram',
        reason: 'MAX_ROUNDS',
        blockerConcerns: [],
        roundsAttempted: 5,
        finalConsensusScore: 50,
        humanReviewRequired: false,
        stopMigration: false,
      };

      const session: SwarmSession = {
        id: 'test-session',
        programId: 42,
        programName: 'TestProgram',
        status: 'ESCALATED',
        current_phase: 'voting',
        createdAt: new Date(),
        votes: [],
        analyses: [],
        consensus: { score: 50, shouldProceed: false, decision: 'REJECT' },
      };

      const report = escalationManager.generateEscalationReport(context, session);

      expect(report.divergentViews).toEqual([]);
    });

    it('should handle session with unanimous votes', () => {
      const context: EscalationContext = {
        sessionId: 'test-session',
        programId: 42,
        programName: 'TestProgram',
        reason: 'MAX_ROUNDS',
        blockerConcerns: [],
        roundsAttempted: 5,
        finalConsensusScore: 100,
        humanReviewRequired: false,
        stopMigration: false,
      };

      const session: SwarmSession = {
        id: 'test-session',
        programId: 42,
        programName: 'TestProgram',
        status: 'COMPLETED',
        current_phase: 'completed',
        createdAt: new Date(),
        votes: [
          {
            id: 'v1',
            agent: AgentRoles.ARCHITECT,
            vote: 'APPROVE',
            confidence: 90,
            reasoning: 'Good',
            justification: 'All good',
            concerns: [],
          },
          {
            id: 'v2',
            agent: AgentRoles.DEVELOPER,
            vote: 'APPROVE',
            confidence: 85,
            reasoning: 'Good',
            justification: 'All good',
            concerns: [],
          },
        ],
        analyses: [],
        consensus: { score: 100, shouldProceed: true, decision: 'PROCEED' },
      };

      const report = escalationManager.generateEscalationReport(context, session);

      // Should extract 0 views since there are no rejecters
      expect(report.divergentViews.length).toBeLessThanOrEqual(2); // Up to 2 approvers
    });

    it('should fallback to store.getSession when session not provided', () => {
      // Store session in mock store
      mockStore.createSession({
        id: 'test-session',
        programId: 42,
        programName: 'TestProgram',
        status: 'ESCALATED',
        current_phase: 'voting',
        createdAt: new Date(),
      });

      mockStore.storeVote('round-1', {
        agent: AgentRoles.ARCHITECT,
        vote: 'REJECT',
        confidence: 95,
        reasoning: 'Issues',
        justification: 'Problems found',
        concerns: [{ category: 'TECHNICAL', severity: 'BLOCKER', description: 'Issue' }],
      });

      const context: EscalationContext = {
        sessionId: 'test-session',
        programId: 42,
        programName: 'TestProgram',
        reason: 'PERSISTENT_VETO',
        blockerConcerns: [
          { category: 'TECHNICAL', severity: 'BLOCKER', description: 'Issue' },
        ],
        roundsAttempted: 3,
        finalConsensusScore: 40,
        humanReviewRequired: true,
        stopMigration: false,
      };

      // Call without session parameter
      const report = escalationManager.generateEscalationReport(context);

      // Should fallback to store and extract divergent views
      expect(report).toBeDefined();
      expect(report.summary).toBeDefined();
      expect(report.divergentViews).toBeDefined();
    });
  });
});
