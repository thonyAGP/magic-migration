/**
 * SQLite Storage for SWARM Sessions
 *
 * Stores all phases of SWARM sessions with full analytics
 */

import Database from 'better-sqlite3';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdirSync, existsSync } from 'node:fs';
import type {
  SwarmSession,
  ComplexityScore,
  AgentAnalysis,
  AgentVote,
  ConsensusResult,
  DoubleVoteSession,
  ConcernSeverityLevel,
} from '../types.js';
import type {
  SwarmSessionRow,
  ComplexityAssessmentRow,
  AgentAnalysisRow,
  VotingRoundRow,
  AgentVoteRow,
  AgentVoteWithDetailsRow,
  VotingRoundIdRow,
  SessionSummaryRow,
  AgentPerformanceRow,
  StagnationPatternRow,
  CostBreakdownRow,
} from './db-types.js';
import { sqlBool, toSqlBool } from './db-types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * SQLite store for SWARM sessions
 */
export class SwarmSQLiteStore {
  private db: Database.Database;

  constructor(dbPath: string = '.swarm-sessions/swarm.db') {
    // Ensure directory exists
    const dbDir = dirname(dbPath);
    if (!existsSync(dbDir)) {
      mkdirSync(dbDir, { recursive: true });
    }

    // Open database
    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('foreign_keys = ON');

    // Initialize schema
    this.initializeSchema();
  }

  /**
   * Initialize database schema
   */
  private initializeSchema(): void {
    const schemaPath = join(__dirname, 'schema.sql');
    const schema = readFileSync(schemaPath, 'utf-8');

    // Execute schema (handles CREATE IF NOT EXISTS)
    this.db.exec(schema);
  }

  // ============================================================================
  // SESSION MANAGEMENT
  // ============================================================================

  /**
   * Create new SWARM session
   */
  createSession(session: Partial<SwarmSession>): string {
    const stmt = this.db.prepare(`
      INSERT INTO swarm_sessions (
        id, program_id, program_name, status, current_phase, config_snapshot,
        started_at, total_agents_used
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      session.id,
      session.programId,
      session.programName,
      session.status || 'IN_PROGRESS',
      session.current_phase || 'complexity',
      JSON.stringify(session.config_snapshot || {}),
      session.startedAt?.toISOString() || new Date().toISOString(),
      session.total_agents_used || 0,
    );

    return session.id!;
  }

  /**
   * Update session status
   */
  updateSessionStatus(
    sessionId: string,
    status: SwarmSession['status'],
    phase?: SwarmSession['current_phase'],
  ): void {
    const stmt = this.db.prepare(`
      UPDATE swarm_sessions
      SET status = ?, current_phase = COALESCE(?, current_phase)
      WHERE id = ?
    `);

    stmt.run(status, phase, sessionId);
  }

  /**
   * Complete session
   */
  completeSession(
    sessionId: string,
    result: {
      status: SwarmSession['status'];
      finalConsensusScore?: number;
      finalDecision?: string;
      durationMs?: number;
      totalTokensCost?: number;
    },
  ): void {
    const stmt = this.db.prepare(`
      UPDATE swarm_sessions
      SET status = ?,
          completed_at = CURRENT_TIMESTAMP,
          final_consensus_score = ?,
          final_decision = ?,
          duration_ms = ?,
          total_tokens_cost_usd = ?,
          current_phase = 'completed'
      WHERE id = ?
    `);

    stmt.run(
      result.status,
      result.finalConsensusScore,
      result.finalDecision,
      result.durationMs,
      result.totalTokensCost,
      sessionId,
    );
  }

  /**
   * Mark session as escalated
   */
  escalateSession(sessionId: string, reason: string): void {
    const stmt = this.db.prepare(`
      UPDATE swarm_sessions
      SET escalated = 1,
          escalation_reason = ?,
          status = 'ESCALATED'
      WHERE id = ?
    `);

    stmt.run(reason, sessionId);
  }

  /**
   * Record human decision on escalated session
   */
  recordHumanDecision(sessionId: string, decision: string): void {
    const stmt = this.db.prepare(`
      UPDATE swarm_sessions
      SET human_decision = ?,
          human_decision_timestamp = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(decision, sessionId);
  }

  /**
   * Get session by ID
   */
  getSession(sessionId: string): SwarmSession | null {
    const stmt = this.db.prepare(`
      SELECT * FROM swarm_sessions WHERE id = ?
    `);

    const row = stmt.get(sessionId) as SwarmSessionRow | undefined;
    if (!row) return null;

    return this.mapRowToSession(row);
  }

  // ============================================================================
  // PHASE 1: COMPLEXITY ASSESSMENT
  // ============================================================================

  /**
   * Store complexity assessment
   */
  storeComplexity(sessionId: string, complexity: ComplexityScore): void {
    const stmt = this.db.prepare(`
      INSERT INTO complexity_assessments (
        session_id, program_id, program_name,
        score_total, score_expressions, score_tables, score_nesting, score_flags,
        expression_count, table_count, nesting_depth,
        has_business_logic, has_state_management, has_external_integrations, is_critical,
        complexity_level, use_swarm, requires_double_vote, explanation
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const session = this.getSession(sessionId);
    if (!session) throw new Error(`Session ${sessionId} not found`);

    stmt.run(
      sessionId,
      session.programId,
      session.programName,
      complexity.score,
      complexity.indicators.expressionCount * 0.8, // Approximate breakdown
      complexity.indicators.tableCount * 3,
      complexity.indicators.nestingDepth * 3,
      complexity.score - (complexity.indicators.expressionCount * 0.8 +
                          complexity.indicators.tableCount * 3 +
                          complexity.indicators.nestingDepth * 3),
      complexity.indicators.expressionCount,
      complexity.indicators.tableCount,
      complexity.indicators.nestingDepth,
      complexity.indicators.hasBusinessLogic ? 1 : 0,
      complexity.indicators.hasStateManagement ? 1 : 0,
      complexity.indicators.hasExternalIntegrations ? 1 : 0,
      complexity.indicators.isCritical ? 1 : 0,
      complexity.level,
      complexity.useSwarm ? 1 : 0,
      complexity.requiresDoubleVote ? 1 : 0,
      complexity.explanation,
    );
  }

  /**
   * Get complexity assessment
   */
  getComplexity(sessionId: string): ComplexityScore | null {
    const stmt = this.db.prepare(`
      SELECT * FROM complexity_assessments WHERE session_id = ?
    `);

    const row = stmt.get(sessionId) as ComplexityAssessmentRow | undefined;
    if (!row) return null;

    return {
      score: row.score_total,
      level: row.complexity_level,
      useSwarm: Boolean(row.use_swarm),
      requiresDoubleVote: Boolean(row.requires_double_vote),
      indicators: {
        expressionCount: row.expression_count,
        tableCount: row.table_count,
        nestingDepth: row.nesting_depth,
        hasBusinessLogic: Boolean(row.has_business_logic),
        hasStateManagement: Boolean(row.has_state_management),
        hasExternalIntegrations: Boolean(row.has_external_integrations),
        isCritical: Boolean(row.is_critical),
      },
      explanation: row.explanation || '',
    };
  }

  // ============================================================================
  // PHASE 2: AGENT ANALYSES
  // ============================================================================

  /**
   * Store agent analysis
   */
  storeAnalysis(sessionId: string, roundNumber: number, analysis: AgentAnalysis): void {
    const stmt = this.db.prepare(`
      INSERT INTO agent_analyses (
        session_id, round_number, agent,
        analysis_data, proposal_data,
        duration_ms, tokens_input, tokens_output, tokens_cost_usd, model_used
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      sessionId,
      roundNumber,
      analysis.agent,
      JSON.stringify(analysis.analysis),
      JSON.stringify(analysis.proposal),
      analysis.duration,
      analysis.tokens?.input,
      analysis.tokens?.output,
      analysis.tokens?.cost,
      null, // model_used will be set by agent implementation
    );
  }

  /**
   * Get analyses for session/round
   */
  getAnalyses(sessionId: string, roundNumber?: number): AgentAnalysis[] {
    const stmt = roundNumber
      ? this.db.prepare(`SELECT * FROM agent_analyses WHERE session_id = ? AND round_number = ?`)
      : this.db.prepare(`SELECT * FROM agent_analyses WHERE session_id = ?`);

    const rows = roundNumber
      ? stmt.all(sessionId, roundNumber)
      : stmt.all(sessionId);

    return (rows as AgentAnalysisRow[]).map((row) => ({
      agent: row.agent,
      analysis: JSON.parse(row.analysis_data),
      proposal: JSON.parse(row.proposal_data),
      duration: row.duration_ms,
      tokens: row.tokens_input
        ? {
            input: row.tokens_input,
            output: row.tokens_output || 0,
            cost: row.tokens_cost_usd || 0,
          }
        : undefined,
    }));
  }

  // ============================================================================
  // PHASE 3: VOTING ROUNDS
  // ============================================================================

  /**
   * Store voting round
   */
  storeVotingRound(
    sessionId: string,
    roundNumber: number,
    consensus: ConsensusResult,
    metadata: {
      vetoTriggered?: boolean;
      vetoAgent?: string;
      vetoReason?: string;
      stagnationDetected?: boolean;
      previousRoundScore?: number;
      scoreDelta?: number;
      durationMs: number;
      totalTokensCost?: number;
    },
  ): number {
    const stmt = this.db.prepare(`
      INSERT INTO voting_rounds (
        session_id, round_number,
        consensus_score, consensus_threshold, consensus_passed, recommendation,
        concerns_blocker, concerns_major, concerns_minor,
        veto_triggered, veto_agent, veto_reason,
        stagnation_detected, previous_round_score, score_delta,
        duration_ms, total_tokens_cost_usd
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      sessionId,
      roundNumber,
      consensus.score,
      consensus.threshold,
      consensus.passed ? 1 : 0,
      consensus.recommendation,
      consensus.concernsSummary.blocker,
      consensus.concernsSummary.major,
      consensus.concernsSummary.minor,
      metadata.vetoTriggered ? 1 : 0,
      metadata.vetoAgent,
      metadata.vetoReason,
      metadata.stagnationDetected ? 1 : 0,
      metadata.previousRoundScore,
      metadata.scoreDelta,
      metadata.durationMs,
      metadata.totalTokensCost,
    );

    return result.lastInsertRowid as number;
  }

  /**
   * Store individual vote
   */
  storeVote(roundId: number, vote: AgentVote): void {
    const voteStmt = this.db.prepare(`
      INSERT INTO agent_votes (
        round_id, agent, vote_value, vote_numeric, confidence, weight,
        confidence_adjusted, weighted_score, justification
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const voteNumeric = this.getVoteNumericValue(vote.vote);
    const confidenceAdjusted = voteNumeric * (vote.confidence / 100);
    const weightedScore = confidenceAdjusted * vote.weight;

    const result = voteStmt.run(
      roundId,
      vote.agent,
      vote.vote,
      voteNumeric,
      vote.confidence,
      vote.weight,
      confidenceAdjusted,
      weightedScore,
      vote.justification,
    );

    const voteId = result.lastInsertRowid as number;

    // Store concerns
    if (vote.concerns.length > 0) {
      const concernStmt = this.db.prepare(`
        INSERT INTO vote_concerns (vote_id, concern_text, severity, suggestion)
        VALUES (?, ?, ?, ?)
      `);

      for (const concern of vote.concerns) {
        concernStmt.run(voteId, concern.concern, concern.severity, concern.suggestion);
      }
    }

    // Store suggestions
    if (vote.suggestions.length > 0) {
      const suggestionStmt = this.db.prepare(`
        INSERT INTO vote_suggestions (vote_id, suggestion_text)
        VALUES (?, ?)
      `);

      for (const suggestion of vote.suggestions) {
        suggestionStmt.run(voteId, suggestion);
      }
    }
  }

  /**
   * Get voting round
   */
  getVotingRound(sessionId: string, roundNumber: number): {
    round: VotingRoundRow;
    votes: AgentVote[];
  } | null {
    const roundStmt = this.db.prepare(`
      SELECT * FROM voting_rounds WHERE session_id = ? AND round_number = ?
    `);

    const round = roundStmt.get(sessionId, roundNumber) as VotingRoundRow | undefined;
    if (!round) return null;

    // Get votes for this round
    const votesStmt = this.db.prepare(`
      SELECT v.*,
        GROUP_CONCAT(DISTINCT c.id || ':' || c.concern_text || ':' || c.severity || ':' || c.suggestion, '|||') as concerns,
        GROUP_CONCAT(DISTINCT s.suggestion_text, '|||') as suggestions
      FROM agent_votes v
      LEFT JOIN vote_concerns c ON v.id = c.vote_id
      LEFT JOIN vote_suggestions s ON v.id = s.vote_id
      WHERE v.round_id = ?
      GROUP BY v.id
    `);

    const voteRows = votesStmt.all(round.id) as AgentVoteWithDetailsRow[];

    const votes: AgentVote[] = voteRows.map((row) => ({
      agent: row.agent,
      vote: row.vote_value,
      confidence: row.confidence,
      weight: row.weight,
      justification: row.justification,
      concerns: row.concerns
        ? row.concerns.split('|||').map((c: string) => {
            const [, concern, severity, suggestion] = c.split(':');
            return {
              concern,
              severity: severity as ConcernSeverityLevel,
              suggestion,
            };
          })
        : [],
      suggestions: row.suggestions ? row.suggestions.split('|||') : [],
      timestamp: new Date(row.created_at),
    }));

    return { round, votes };
  }

  /**
   * Get all voting rounds for session
   */
  getAllVotingRounds(sessionId: string): VotingRoundRow[] {
    const stmt = this.db.prepare(`
      SELECT * FROM voting_rounds WHERE session_id = ? ORDER BY round_number
    `);

    return stmt.all(sessionId) as VotingRoundRow[];
  }

  // ============================================================================
  // PHASE 4: CONSENSUS DECISIONS
  // ============================================================================

  /**
   * Store consensus decision
   */
  storeDecision(
    sessionId: string,
    roundNumber: number,
    decision: {
      decision: string;
      reason: string;
      actionTaken?: string;
      revisionApplied?: string;
      nextRoundScheduled?: boolean;
    },
  ): void {
    const stmt = this.db.prepare(`
      INSERT INTO consensus_decisions (
        session_id, round_number, decision, decision_reason,
        action_taken, revision_applied, next_round_scheduled
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      sessionId,
      roundNumber,
      decision.decision,
      decision.reason,
      decision.actionTaken,
      decision.revisionApplied,
      decision.nextRoundScheduled ? 1 : 0,
    );
  }

  // ============================================================================
  // PHASE 5: DOUBLE VOTE
  // ============================================================================

  /**
   * Store double vote session
   */
  storeDoubleVote(sessionId: string, doubleVote: DoubleVoteSession): void {
    // Get round IDs (assuming they're stored as round_number in rounds table)
    const firstRoundStmt = this.db.prepare(`
      SELECT id FROM voting_rounds
      WHERE session_id = ?
      ORDER BY round_number ASC
      LIMIT 1
    `);

    const secondRoundStmt = this.db.prepare(`
      SELECT id FROM voting_rounds
      WHERE session_id = ?
      ORDER BY round_number DESC
      LIMIT 1
    `);

    const firstRound = firstRoundStmt.get(sessionId) as VotingRoundIdRow | undefined;
    const secondRound = secondRoundStmt.get(sessionId) as VotingRoundIdRow | undefined;

    if (!firstRound || !secondRound) {
      throw new Error('Voting rounds not found for double vote session');
    }

    const stmt = this.db.prepare(`
      INSERT INTO double_vote_sessions (
        session_id, first_vote_round_id, first_vote_score, first_vote_passed,
        implementation_code, implementation_timestamp,
        second_vote_round_id, second_vote_score, second_vote_passed,
        approved, recommendation, final_reason
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      sessionId,
      firstRound.id,
      doubleVote.firstVote.score,
      doubleVote.firstVote.passed ? 1 : 0,
      doubleVote.implementationAfterFirstVote,
      new Date().toISOString(),
      secondRound.id,
      doubleVote.secondVote.score,
      doubleVote.secondVote.passed ? 1 : 0,
      doubleVote.approved ? 1 : 0,
      doubleVote.approved ? 'APPROVED' : 'REJECTED',
      `First: ${doubleVote.firstVote.score}%, Second: ${doubleVote.secondVote.score}%`,
    );
  }

  // ============================================================================
  // ANALYTICS
  // ============================================================================

  /**
   * Get session summary
   */
  getSessionSummary(sessionId: string): SessionSummaryRow | undefined {
    const stmt = this.db.prepare(`
      SELECT * FROM v_session_summary WHERE id = ?
    `);

    return stmt.get(sessionId) as SessionSummaryRow | undefined;
  }

  /**
   * Get agent performance for session
   */
  getAgentPerformance(sessionId: string): AgentPerformanceRow[] {
    const stmt = this.db.prepare(`
      SELECT * FROM v_agent_performance WHERE session_id = ?
    `);

    return stmt.all(sessionId) as AgentPerformanceRow[];
  }

  /**
   * Get stagnation patterns
   */
  getStagnationPatterns(sessionId?: string): StagnationPatternRow[] {
    if (sessionId) {
      const stmt = this.db.prepare(`
        SELECT * FROM v_stagnation_patterns WHERE session_id = ?
      `);
      return stmt.all(sessionId) as StagnationPatternRow[];
    } else {
      const stmt = this.db.prepare(`SELECT * FROM v_stagnation_patterns`);
      return stmt.all() as StagnationPatternRow[];
    }
  }

  /**
   * Get cost breakdown
   */
  getCostBreakdown(sessionId: string): CostBreakdownRow | undefined {
    const stmt = this.db.prepare(`
      SELECT * FROM v_cost_breakdown WHERE session_id = ?
    `);

    return stmt.get(sessionId) as CostBreakdownRow | undefined;
  }

  /**
   * Get all TO_REVIEW sessions
   */
  getToReviewSessions(): SessionSummaryRow[] {
    const stmt = this.db.prepare(`
      SELECT * FROM v_session_summary WHERE status = 'TO_REVIEW'
      ORDER BY created_at DESC
    `);

    return stmt.all() as SessionSummaryRow[];
  }

  /**
   * Get all escalated sessions
   */
  getEscalatedSessions(): SwarmSessionRow[] {
    const stmt = this.db.prepare(`
      SELECT * FROM swarm_sessions WHERE escalated = 1
      ORDER BY created_at DESC
    `);

    return stmt.all() as SwarmSessionRow[];
  }

  // ============================================================================
  // UTILITIES
  // ============================================================================

  /**
   * Get vote numeric value
   */
  private getVoteNumericValue(vote: AgentVote['vote']): number {
    const values = {
      APPROVE: 1.0,
      APPROVE_WITH_CONCERNS: 0.75,
      NEUTRAL: 0.5,
      REJECT_WITH_SUGGESTIONS: 0.25,
      REJECT: 0.0,
    };
    return values[vote];
  }

  /**
   * Map database row to SwarmSession
   */
  private mapRowToSession(row: SwarmSessionRow): SwarmSession {
    return {
      id: row.id,
      programId: row.program_id,
      programName: row.program_name,
      complexity: {} as ComplexityScore, // Would need to join with complexity table
      analyses: [],
      votes: [],
      consensus: {} as ConsensusResult,
      startedAt: new Date(row.started_at),
      completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
      duration: row.duration_ms || undefined,
      outputFiles: row.output_files ? JSON.parse(row.output_files) : [],
      status: row.status,
    };
  }

  /**
   * Close database connection
   */
  close(): void {
    this.db.close();
  }
}

/**
 * Create SQLite store instance
 */
export function createSwarmStore(dbPath?: string): SwarmSQLiteStore {
  return new SwarmSQLiteStore(dbPath);
}
