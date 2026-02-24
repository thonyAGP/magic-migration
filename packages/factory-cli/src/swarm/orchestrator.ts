/**
 * SWARM Orchestrator - Coordinates multi-agent migration workflow
 *
 * Manages the complete SWARM process:
 * 1. Calculate complexity
 * 2. Run agent analyses (parallel)
 * 3. Collect votes
 * 4. Calculate consensus
 * 5. Execute double vote if critical
 * 6. Generate reports
 */

import type { MigrationContract } from '../core/contract.js';
import type {
  SwarmSession,
  SwarmConfig,
  AgentRole,
  AgentAnalysis,
  ComplexityScore,
  ConsensusResult,
} from './types.js';
import { DEFAULT_SWARM_CONFIG, AgentRoles, ConsensusThresholds } from './types.js';
import { calculateComplexity } from './complexity-calculator.js';
import { createVoteCollector } from './voting/vote-collector.js';
import { calculateConsensus } from './voting/consensus-engine.js';
import { executeDoubleVote } from './voting/double-vote.js';
import { detectVeto, applyVeto } from './voting/veto-system.js';
import { detectStagnation, type RoundScore } from './analytics/stagnation-detector.js';
import { createSwarmStore, type SwarmSQLiteStore } from './storage/sqlite-store.js';
import { loadSwarmConfig } from './config-loader.js';
import { randomUUID } from 'node:crypto';

/**
 * SWARM orchestrator result
 */
export interface SwarmResult {
  /** Session data */
  session: SwarmSession;
  /** Should proceed with migration? */
  shouldProceed: boolean;
  /** Final consensus */
  consensus: ConsensusResult;
  /** Generated reports */
  reports: {
    complexity: string;
    analyses: string;
    consensus: string;
    doubleVote?: string;
  };
}

/**
 * SWARM Orchestrator class
 */
export class SwarmOrchestrator {
  private readonly config: SwarmConfig;
  private readonly store: SwarmSQLiteStore;

  constructor(
    config: Partial<SwarmConfig> = {},
    store?: SwarmSQLiteStore,
  ) {
    this.config = { ...DEFAULT_SWARM_CONFIG, ...config };
    this.store = store ?? createSwarmStore();
  }

  /**
   * Execute SWARM migration process
   *
   * @param contract - Migration contract
   * @returns SWARM result with session data and decision
   */
  async execute(contract: MigrationContract): Promise<SwarmResult> {
    const sessionId = randomUUID();
    const startTime = Date.now();
    const startedAt = new Date(startTime);

    // Create session in DB
    this.store.createSession({
      id: sessionId,
      programId: contract.metadata.program_id,
      programName: contract.metadata.program_name,
      status: 'IN_PROGRESS',
      current_phase: 'complexity',
      config_snapshot: this.config as unknown as Record<string, unknown>,
      startedAt,
      total_agents_used: 0,
    });
    console.log(`[SWARM] Session ${sessionId} created for program ${contract.metadata.program_id}`);

    // Create session object
    const complexity = calculateComplexity(contract);
    const session: SwarmSession = {
      id: sessionId,
      programId: contract.metadata.program_id,
      programName: contract.metadata.program_name,
      complexity,
      analyses: [],
      votes: [],
      consensus: {} as ConsensusResult, // Will be set later
      startedAt,
      outputFiles: [],
      status: 'IN_PROGRESS',
    };

    try {
      // Step 1: Store complexity assessment
      this.store.storeComplexity(sessionId, complexity);
      this.store.updateSessionStatus(sessionId, 'IN_PROGRESS', 'analysis');
      console.log(`[SWARM] Complexity stored: ${complexity.level} (${complexity.score}/100)`);

      // Check if SWARM should be used
      if (!session.complexity.useSwarm) {
        throw new Error(
          `Program complexity (${session.complexity.score}) below SWARM threshold. Use standard pipeline instead.`,
        );
      }

      // Step 2: Run agent analyses (parallel)
      console.log(`[SWARM] Running agent analyses for program ${session.programId}...`);
      session.analyses = await this.runAgentAnalyses(contract);

      // Step 3: Collect votes from agents
      console.log(`[SWARM] Collecting agent votes...`);
      session.votes = await this.collectAgentVotes(session.analyses);

      // Step 4: Calculate consensus
      const threshold = session.complexity.requiresDoubleVote
        ? ConsensusThresholds.CRITICAL
        : ConsensusThresholds.STANDARD;

      session.consensus = calculateConsensus(session.votes, threshold);

      // Step 5: Execute double vote if critical
      if (
        session.complexity.requiresDoubleVote &&
        this.config.doubleVoteEnabled &&
        session.consensus.passed
      ) {
        console.log(`[SWARM] Critical program - executing double vote...`);
        await this.executeDoubleVote(session, contract);
      }

      // Step 6: Finalize session
      session.completedAt = new Date();
      session.duration = Date.now() - startTime;
      session.status =
        session.consensus.recommendation === 'PROCEED' ? 'COMPLETED' : 'FAILED';

      // Complete session in DB
      const finalDecision =
        session.consensus.recommendation === 'PROCEED' ? 'PROCEED' : 'REJECT';
      this.store.completeSession(sessionId, {
        status: session.status,
        finalConsensusScore: session.consensus.score,
        finalDecision,
        durationMs: session.duration,
        totalTokensCost: 0, // TODO: calculate in B1
      });
      console.log(`[SWARM] Session ${sessionId} completed: ${session.status} (${finalDecision})`);

      // Step 7: Generate reports
      const reports = this.generateReports(session);

      return {
        session,
        shouldProceed: session.consensus.recommendation === 'PROCEED',
        consensus: session.consensus,
        reports,
      };
    } catch (error) {
      // Mark session as FAILED in DB
      session.status = 'FAILED';
      session.completedAt = new Date();
      session.duration = Date.now() - startTime;

      this.store.completeSession(sessionId, {
        status: 'FAILED',
        durationMs: session.duration,
      });
      console.log(`[SWARM] Session ${sessionId} failed:`, error);

      throw error;
    }
  }

  /**
   * Run all agent analyses in parallel
   *
   * NOTE: Actual agent implementation will call LLM APIs
   * For now, this is a stub that will be implemented in Phase 3
   */
  private async runAgentAnalyses(
    contract: MigrationContract,
  ): Promise<AgentAnalysis[]> {
    // TODO: Phase 3 - Implement actual agent analyses
    // For now, return mock analyses

    const agents: AgentRole[] = [
      AgentRoles.ARCHITECT,
      AgentRoles.ANALYST,
      AgentRoles.DEVELOPER,
      AgentRoles.TESTER,
      AgentRoles.REVIEWER,
      AgentRoles.DOCUMENTOR,
    ];

    const analyses: AgentAnalysis[] = agents.map((agent) => ({
      agent,
      analysis: {
        note: 'Mock analysis - to be implemented in Phase 3',
      },
      proposal: {
        note: 'Mock proposal - to be implemented in Phase 3',
      },
      duration: 0,
    }));

    return Promise.resolve(analyses);
  }

  /**
   * Collect votes from all agents
   *
   * NOTE: Actual voting will call LLM APIs
   * For now, this is a stub that will be implemented in Phase 3
   */
  private async collectAgentVotes(
    analyses: AgentAnalysis[],
  ): Promise<SwarmSession['votes']> {
    // TODO: Phase 3 - Implement actual agent voting
    // For now, return mock votes

    const voteCollector = createVoteCollector('mock-session');

    for (const analysis of analyses) {
      voteCollector.submitVote({
        agent: analysis.agent,
        vote: 'APPROVE',
        confidence: 90,
        weight: this.getAgentWeight(analysis.agent),
        justification: 'Mock vote - to be implemented in Phase 3',
        concerns: [],
        suggestions: [],
        timestamp: new Date(),
      });
    }

    return Promise.resolve(voteCollector.getVotes());
  }

  /**
   * Execute double vote process for critical programs
   */
  private async executeDoubleVote(
    session: SwarmSession,
    contract: MigrationContract,
  ): Promise<void> {
    // TODO: Phase 3 - Implement actual double vote
    // For now, mark as requiring implementation

    console.log(
      `[SWARM] Double vote required for critical program ${session.programId}`,
    );
    console.log('[SWARM] Implementation pending (Phase 3)');

    // Placeholder for double vote session
    session.doubleVote = {
      firstVote: session.consensus,
      implementationAfterFirstVote: '// Implementation pending',
      secondVote: session.consensus,
      approved: session.consensus.passed,
    };
  }

  /**
   * Generate reports
   */
  private generateReports(session: SwarmSession): SwarmResult['reports'] {
    const reports: SwarmResult['reports'] = {
      complexity: this.formatComplexityReport(session.complexity),
      analyses: this.formatAnalysesReport(session.analyses),
      consensus: this.formatConsensusReport(session.consensus),
    };

    if (session.doubleVote) {
      reports.doubleVote = this.formatDoubleVoteReport(session.doubleVote);
    }

    return reports;
  }

  /**
   * Format complexity report
   */
  private formatComplexityReport(complexity: ComplexityScore): string {
    const lines = [
      '# Complexity Analysis',
      '',
      `**Score**: ${complexity.score}/100`,
      `**Level**: ${complexity.level}`,
      `**SWARM Recommended**: ${complexity.useSwarm ? '✅' : '❌'}`,
      `**Double Vote Required**: ${complexity.requiresDoubleVote ? '✅' : '❌'}`,
      '',
      '## Explanation',
      '',
      complexity.explanation,
    ];

    return lines.join('\n');
  }

  /**
   * Format analyses report
   */
  private formatAnalysesReport(analyses: AgentAnalysis[]): string {
    const lines = ['# Agent Analyses', ''];

    for (const analysis of analyses) {
      lines.push(`## ${analysis.agent.toUpperCase()}`);
      lines.push('');
      lines.push('```yaml');
      lines.push(JSON.stringify(analysis.analysis, null, 2));
      lines.push('```');
      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * Format consensus report
   */
  private formatConsensusReport(consensus: ConsensusResult): string {
    const lines = [
      '# Consensus Report',
      '',
      `**Score**: ${consensus.score}%`,
      `**Threshold**: ${consensus.threshold}%`,
      `**Passed**: ${consensus.passed ? '✅' : '❌'}`,
      `**Recommendation**: ${consensus.recommendation}`,
      '',
      '## Votes',
      '',
    ];

    for (const vote of consensus.votes) {
      lines.push(`### ${vote.agent.toUpperCase()} (weight: ${vote.weight}x)`);
      lines.push(`- **Vote**: ${vote.vote}`);
      lines.push(`- **Confidence**: ${vote.confidence}%`);
      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * Format double vote report
   */
  private formatDoubleVoteReport(doubleVote: SwarmSession['doubleVote']): string {
    if (!doubleVote) return '';

    const lines = [
      '# Double Vote Report',
      '',
      `**First Vote**: ${doubleVote.firstVote.score}%`,
      `**Second Vote**: ${doubleVote.secondVote.score}%`,
      `**Approved**: ${doubleVote.approved ? '✅' : '❌'}`,
    ];

    return lines.join('\n');
  }

  /**
   * Get agent weight by role
   */
  private getAgentWeight(agent: AgentRole): number {
    const weights = {
      [AgentRoles.ARCHITECT]: 2.0,
      [AgentRoles.ANALYST]: 2.0,
      [AgentRoles.DEVELOPER]: 1.0,
      [AgentRoles.TESTER]: 1.5,
      [AgentRoles.REVIEWER]: 1.5,
      [AgentRoles.DOCUMENTOR]: 0.5,
    };
    return weights[agent];
  }

  /**
   * Check if program should use SWARM
   */
  shouldUseSwarm(contract: MigrationContract): boolean {
    if (!this.config.enabled) {
      return false;
    }

    const complexity = calculateComplexity(contract);
    return complexity.useSwarm;
  }

  /**
   * Get current configuration
   */
  getConfig(): SwarmConfig {
    return { ...this.config };
  }
}

/**
 * Create SWARM orchestrator with optional config
 */
export function createSwarmOrchestrator(
  config?: Partial<SwarmConfig>,
): SwarmOrchestrator {
  return new SwarmOrchestrator(config);
}
