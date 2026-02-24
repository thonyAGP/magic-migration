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

import type { ExtendedMigrationContract as MigrationContract } from '../core/contract.js';
import type {
  SwarmSession,
  SwarmConfig,
  AgentRole,
  AgentAnalysis,
  AgentVote,
  ComplexityScore,
  ConsensusResult,
  AgentConcern,
  DoubleVoteSession,
} from './types.js';
import { DEFAULT_SWARM_CONFIG, AgentRoles, ConsensusThresholds, VoteValues, ConcernSeverity } from './types.js';
import { calculateComplexity } from './complexity-calculator.js';
import { createVoteCollector } from './voting/vote-collector.js';
import { calculateConsensus } from './voting/consensus-engine.js';
import { executeDoubleVote as executeDoubleVoteFunction } from './voting/double-vote.js';
import { detectVeto, applyVeto, type VetoResult } from './voting/veto-system.js';
import { detectStagnation, type RoundScore, type StagnationResult } from './analytics/stagnation-detector.js';
import { EscalationManager } from './escalation/escalation-manager.js';
import type { EscalationContext, EscalationReport } from './types.js';
import { createSwarmStore, type SwarmSQLiteStore } from './storage/sqlite-store.js';
import { loadSwarmConfig } from './config-loader.js';
import { randomUUID } from 'node:crypto';
import type { ClaudeClient } from './llm/claude-client.js';
import { AgentExecutor } from './agents/agent-executor.js';
import type { Vote } from './agents/prompt-builder.js';
import { AgentWeights } from './types.js';

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
  private readonly executor?: AgentExecutor;

  constructor(
    config: Partial<SwarmConfig> = {},
    store?: SwarmSQLiteStore,
    client?: ClaudeClient,
  ) {
    this.config = { ...DEFAULT_SWARM_CONFIG, ...config };
    this.store = store ?? createSwarmStore();
    this.executor = client ? new AgentExecutor(client) : undefined;
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
      programId: contract.metadata?.program_id ?? 0,
      programName: contract.metadata?.program_name ?? 'UNKNOWN',
      status: 'IN_PROGRESS',
      current_phase: 'complexity',
      config_snapshot: this.config as unknown as Record<string, unknown>,
      startedAt,
      total_agents_used: 0,
    });
    console.log(`[SWARM] Session ${sessionId} created for program ${contract.metadata?.program_id ?? 0}`);

    // Create session object
    const complexity = calculateComplexity(contract);
    const session: SwarmSession = {
      id: sessionId,
      programId: contract.metadata?.program_id ?? 0,
      programName: contract.metadata?.program_name ?? 'UNKNOWN',
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

      // Step 2: Multi-rounds consensus loop
      const threshold = session.complexity.requiresDoubleVote
        ? ConsensusThresholds.CRITICAL
        : ConsensusThresholds.STANDARD;
      const maxRounds = this.config.maxRounds;
      let roundNumber = 0;
      let consensusReached = false;
      const roundHistory: RoundScore[] = [];

      // Track veto and stagnation for escalation (D1)
      let lastVeto: VetoResult | undefined;
      let lastStagnation: StagnationResult | undefined;

      while (!consensusReached && roundNumber < maxRounds) {
        roundNumber++;
        console.log(`[SWARM] Starting round ${roundNumber}/${maxRounds}...`);

        const roundStartTime = Date.now();

        // Run agent analyses
        const analyses = await this.runRoundAnalyses(contract, sessionId, roundNumber);
        session.analyses.push(...analyses);

        // Collect votes
        const votes = await this.runRoundVotes(
          analyses,
          contract,
          session.complexity,
          roundNumber,
          session.votes,
        );
        session.votes.push(...votes);

        // Calculate consensus
        let consensus = calculateConsensus(votes, threshold);

        // Check for veto (B2)
        const veto = detectVeto(votes);
        lastVeto = veto; // Store for escalation
        if (veto.triggered) {
          console.log(
            `[SWARM] VETO detected by ${veto.agent}: ${veto.reason}`,
          );
          consensus = applyVeto(consensus, veto);
        }

        session.consensus = consensus; // Keep latest

        // Track history for stagnation detection (C2)
        roundHistory.push({
          roundNumber,
          consensusScore: consensus.score,
          timestamp: new Date(),
        });

        // Check for stagnation (C2)
        let stagnation: StagnationResult | undefined;
        let previousRoundScore: number | undefined;
        let scoreDelta: number | undefined;

        if (!consensus.passed && roundNumber >= 2) {
          stagnation = detectStagnation(roundHistory, { threshold: 2, scoreTolerance: 0.5 });
          lastStagnation = stagnation; // Store for escalation

          // Calculate delta from previous round
          if (roundHistory.length >= 2) {
            const current = roundHistory[roundHistory.length - 1];
            const previous = roundHistory[roundHistory.length - 2];
            previousRoundScore = previous.consensusScore;
            scoreDelta = current.consensusScore - previous.consensusScore;
          }

          if (stagnation.detected) {
            console.log(
              `[SWARM] STAGNATION detected after ${stagnation.stagnantRounds} rounds at ${stagnation.stagnantScore?.toFixed(1)}%`,
            );
            console.log(`[SWARM] Score delta: ${scoreDelta?.toFixed(1)}% (from ${previousRoundScore?.toFixed(1)}%)`);
            console.log(`[SWARM] ${stagnation.explanation}`);
            console.log(`[SWARM] Escalating to review - revisions not improving consensus`);
          }
        }

        // Store round in DB (with veto + stagnation info)
        const roundDuration = Date.now() - roundStartTime;
        this.storeRound(
          sessionId,
          roundNumber,
          consensus,
          votes,
          roundDuration,
          veto,
          stagnation,
          previousRoundScore,
          scoreDelta,
        );

        // Check if consensus reached or stagnation forces exit
        if (consensus.passed) {
          consensusReached = true;
          console.log(`[SWARM] Consensus reached at round ${roundNumber}: ${consensus.score}%`);
        } else if (stagnation?.detected) {
          // Force exit - stagnation detected
          consensusReached = false;
          break; // Exit while loop immediately
        } else if (roundNumber < maxRounds) {
          console.log(
            `[SWARM] Round ${roundNumber} failed (${consensus.score}% < ${threshold}%), applying revisions...`,
          );
          await this.applyRevisions(session);
        }
      }

      // Check if consensus was reached
      if (!consensusReached) {
        console.log(
          `[SWARM] Max rounds (${maxRounds}) reached without consensus - evaluating escalation`,
        );

        // D1: Escalation System
        const escalationManager = new EscalationManager(this.store);

        if (escalationManager.shouldEscalate(session, session.consensus)) {
          const escalationContext = escalationManager.buildEscalationContext(
            session,
            roundHistory,
            lastStagnation,
            lastVeto,
          );
          const escalationReport = escalationManager.generateEscalationReport(
            escalationContext,
            session, // Pass session for voting pattern analysis
          );

          console.log(`[SWARM] ESCALATION: ${escalationContext.reason}`);
          console.log(`[SWARM] ${escalationReport.summary}`);
          console.log(`[SWARM] Recommendation: ${escalationReport.recommendation}`);

          escalationManager.storeEscalation(escalationContext, escalationReport);

          session.status = 'ESCALATED';
          session.escalation = {
            context: escalationContext,
            report: escalationReport,
            escalatedAt: new Date(),
          };
        } else {
          session.status = 'TO_REVIEW';
        }
      } else {
        session.status = 'COMPLETED';
      }

      // Calculate total token cost
      const totalTokensCost = this.calculateTotalTokensCost(session);

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

      // Determine final decision
      let finalDecision: 'PROCEED' | 'REJECT' | 'TO_REVIEW' | 'ESCALATED';
      if (session.status === 'ESCALATED') {
        finalDecision = 'ESCALATED';
      } else if (session.status === 'TO_REVIEW') {
        finalDecision = 'TO_REVIEW';
      } else {
        finalDecision =
          session.consensus.recommendation === 'PROCEED' ? 'PROCEED' : 'REJECT';
        session.status = finalDecision === 'PROCEED' ? 'COMPLETED' : 'FAILED';
      }

      // Complete session in DB
      this.store.completeSession(sessionId, {
        status: session.status,
        finalConsensusScore: session.consensus.score,
        finalDecision,
        durationMs: session.duration,
        totalTokensCost,
        // Include escalation data if present (D1)
        ...(session.escalation && { escalation: session.escalation }),
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
    contract?: MigrationContract,
    context?: {
      roundNumber: number;
      previousVotes?: Vote[];
      complexity: ComplexityScore;
    },
  ): Promise<SwarmSession['votes']> {
    const voteCollector = createVoteCollector('mock-session');

    // If executor available and context provided, use real LLM agents
    if (this.executor && contract && context) {
      for (const analysis of analyses) {
        try {
          // Execute agent with LLM
          const vote = await this.executor.executeAgent(
            analysis.agent,
            contract,
            context,
          );

          // Convert Vote to AgentVote
          const agentVote: AgentVote = this.convertToAgentVote(vote);
          voteCollector.submitVote(agentVote);
        } catch (error) {
          console.error(
            `[SWARM] Agent ${analysis.agent} failed:`,
            error instanceof Error ? error.message : 'Unknown error',
          );
          // Fallback to mock vote on error
          voteCollector.submitVote(this.createMockVote(analysis.agent));
        }
      }
    } else {
      // Fallback: Mock votes (backward compatibility)
      for (const analysis of analyses) {
        voteCollector.submitVote(this.createMockVote(analysis.agent));
      }
    }

    return Promise.resolve(voteCollector.getVotes());
  }

  /**
   * Convert simplified Vote to AgentVote
   */
  private convertToAgentVote(vote: Vote): AgentVote {
    // Map string vote to VoteValue
    const voteValue =
      vote.vote === 'APPROVE' ? VoteValues.APPROVE : VoteValues.REJECT;

    // Convert blockerConcerns to AgentConcern[]
    const concerns: AgentConcern[] = (vote.blockerConcerns || []).map(
      (concern) => ({
        concern,
        severity: ConcernSeverity.BLOCKER,
        suggestion: 'Address this blocker before migration',
      }),
    );

    return {
      agent: vote.agent,
      vote: voteValue,
      confidence: vote.confidence,
      weight: AgentWeights[vote.agent],
      justification: vote.reasoning || 'No reasoning provided',
      concerns,
      suggestions: [],
      timestamp: new Date(),
    };
  }

  /**
   * Create mock vote (backward compatibility)
   */
  private createMockVote(agent: AgentRole): AgentVote {
    return {
      agent,
      vote: VoteValues.APPROVE,
      confidence: 90,
      weight: AgentWeights[agent],
      justification: 'Mock vote - LLM not configured',
      concerns: [],
      suggestions: [],
      timestamp: new Date(),
    };
  }

  /**
   * Execute double vote process for critical programs
   */
  private async executeDoubleVote(
    session: SwarmSession,
    contract: MigrationContract,
  ): Promise<void> {
    console.log(
      `[SWARM] Double vote required for critical program ${session.programId}`,
    );

    // First vote = current consensus
    const firstVote = session.consensus;
    console.log(`[SWARM] First vote: ${firstVote.score}% (threshold: ${firstVote.threshold}%)`);

    // Generate/simulate implementation code
    // In a real scenario, this would be actual code generation or human review
    const implementation = this.generateImplementationStub(contract, session);
    console.log(`[SWARM] Implementation generated (${implementation.length} chars)`);

    // Update session phase for DB
    this.store.updateSessionStatus(session.id, 'IN_PROGRESS', 'double_vote');

    // Collect second round of votes on implementation
    console.log('[SWARM] Collecting second vote on implementation...');
    const secondRoundVotes = await this.collectSecondRoundVotes(
      session,
      contract,
      implementation,
    );

    // Calculate second vote consensus
    const secondVote = calculateConsensus(
      secondRoundVotes,
      ConsensusThresholds.CRITICAL,
    );
    console.log(`[SWARM] Second vote: ${secondVote.score}% (threshold: ${secondVote.threshold}%)`);

    // Execute double vote logic
    const doubleVoteResult = executeDoubleVoteFunction(
      session.programId,
      session.votes, // First round votes
      implementation,
      secondRoundVotes, // Second round votes
    );

    console.log(`[SWARM] Double vote result: ${doubleVoteResult.recommendation}`);
    console.log(`[SWARM] ${doubleVoteResult.reason}`);

    // Create DoubleVoteSession structure
    const doubleVoteSession: DoubleVoteSession = {
      firstVote,
      implementationAfterFirstVote: implementation,
      secondVote,
      approved: doubleVoteResult.approved,
    };

    // Store double vote in session
    session.doubleVote = doubleVoteSession;

    // Store in database
    this.store.storeDoubleVote(session.id, doubleVoteSession);
    console.log(`[SWARM] Double vote stored in database`);

    // Update final decision based on double vote
    if (!doubleVoteResult.approved) {
      session.status = 'TO_REVIEW';
      console.log(`[SWARM] Double vote FAILED - session requires review`);
    }
  }

  /**
   * Generate implementation stub for double vote
   * In production, this would be actual code generation or placeholder for human review
   */
  private generateImplementationStub(
    contract: MigrationContract,
    session: SwarmSession,
  ): string {
    const lines = [
      '/**',
      ` * Implementation for program ${contract.metadata?.program_id ?? 0} - ${contract.metadata?.program_name ?? 'UNKNOWN'}`,
      ' * Generated after first vote approval',
      ' * This is a stub - in production this would be actual generated code',
      ' */',
      '',
      'export class MigratedProgram {',
      '  // TODO: Implement based on migration contract',
      '  // Complexity: ' + session.complexity.level,
      '  // Score: ' + session.complexity.score,
      '',
      '  async execute() {',
      '    // Implementation here',
      '    console.log("Program migrated successfully");',
      '  }',
      '}',
    ];

    return lines.join('\n');
  }

  /**
   * Collect second round of votes for double vote system
   */
  private async collectSecondRoundVotes(
    session: SwarmSession,
    contract: MigrationContract,
    implementation: string,
  ): Promise<AgentVote[]> {
    // Run second round analyses
    const analyses = await this.runAgentAnalyses(contract);

    // Build context for second vote
    const context = {
      roundNumber: 2, // Second vote round
      complexity: session.complexity,
      previousVotes: this.convertAgentVotesToSimpleVotes(session.votes),
      implementation, // Include implementation for review
    };

    // Collect votes
    const votes = await this.collectAgentVotes(analyses, contract, context);

    // Store second round in DB
    const secondVote = calculateConsensus(votes, ConsensusThresholds.CRITICAL);
    const roundId = this.store.storeVotingRound(
      session.id,
      2, // Round 2
      secondVote,
      { durationMs: 0, totalTokensCost: 0 },
    );

    // Store individual votes
    for (const vote of votes) {
      this.store.storeVote(roundId, vote);
    }

    return votes;
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
   * Calculate total token cost from session analyses
   */
  private calculateTotalTokensCost(session: SwarmSession): number {
    let total = 0;

    // Sum costs from analyses
    for (const analysis of session.analyses) {
      if (analysis.tokens?.cost) {
        total += analysis.tokens.cost;
      }
    }

    return total;
  }

  /**
   * Run agent analyses for a single round
   */
  private async runRoundAnalyses(
    contract: MigrationContract,
    sessionId: string,
    roundNumber: number,
  ): Promise<AgentAnalysis[]> {
    console.log(`[SWARM] Running agent analyses for round ${roundNumber}...`);
    const analyses = await this.runAgentAnalyses(contract);

    // Store analyses in DB
    for (const analysis of analyses) {
      this.store.storeAnalysis(sessionId, roundNumber, analysis);
    }
    this.store.updateSessionStatus(sessionId, 'IN_PROGRESS', 'voting');
    console.log(`[SWARM] ${analyses.length} analyses stored`);

    return analyses;
  }

  /**
   * Collect votes from agents for a single round
   */
  private async runRoundVotes(
    analyses: AgentAnalysis[],
    contract?: MigrationContract,
    complexity?: ComplexityScore,
    roundNumber?: number,
    previousVotes?: AgentVote[],
  ): Promise<AgentVote[]> {
    console.log(`[SWARM] Collecting agent votes...`);

    // Build context for agents if all parameters available
    const context =
      contract && complexity && roundNumber
        ? {
            roundNumber,
            complexity,
            previousVotes: this.convertAgentVotesToSimpleVotes(
              previousVotes || [],
            ),
          }
        : undefined;

    const votes = await this.collectAgentVotes(analyses, contract, context);
    return votes;
  }

  /**
   * Convert AgentVote[] to simplified Vote[] for prompt context
   */
  private convertAgentVotesToSimpleVotes(agentVotes: AgentVote[]): Vote[] {
    return agentVotes.map((v) => ({
      agent: v.agent,
      vote: v.vote === VoteValues.APPROVE ? 'APPROVE' : 'REJECT',
      confidence: v.confidence,
      blockerConcerns: v.concerns
        .filter((c) => c.severity === ConcernSeverity.BLOCKER)
        .map((c) => c.concern),
      veto: undefined,
      reasoning: v.justification,
      tokens: undefined,
    }));
  }

  /**
   * Store voting round and votes in DB
   */
  private storeRound(
    sessionId: string,
    roundNumber: number,
    consensus: ConsensusResult,
    votes: AgentVote[],
    durationMs: number,
    veto?: VetoResult,
    stagnation?: StagnationResult,
    previousRoundScore?: number,
    scoreDelta?: number,
  ): void {
    // Calculate token cost for this round
    const totalTokensCost = 0; // Stub - calculated at session level

    // Store voting round
    const roundId = this.store.storeVotingRound(sessionId, roundNumber, consensus, {
      durationMs,
      totalTokensCost,
      vetoTriggered: veto?.triggered ? true : undefined,
      vetoAgent: veto?.triggered ? veto.agent : undefined,
      vetoReason: veto?.triggered ? veto.reason : undefined,
      stagnationDetected: stagnation?.detected ? true : undefined,
      previousRoundScore,
      scoreDelta,
    });

    // Store individual votes
    for (const vote of votes) {
      this.store.storeVote(roundId, vote);
    }

    this.store.updateSessionStatus(sessionId, 'IN_PROGRESS', 'consensus');
    console.log(`[SWARM] Round ${roundNumber} stored: ${consensus.score}% consensus`);
  }

  /**
   * Apply revisions based on consensus concerns
   *
   * NOTE: Stub implementation for C1
   * Real revision logic will be implemented in Phase 3
   */
  private async applyRevisions(session: SwarmSession): Promise<void> {
    // Stub for C1 - simulate revision process
    const { major, minor, blocker } = session.consensus.concernsSummary;
    console.log(
      `[SWARM] Revisions stub - would address ${blocker} blockers, ${major} major, ${minor} minor concerns`,
    );

    // Simulate revision time
    await new Promise((resolve) => setTimeout(resolve, 10));
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
