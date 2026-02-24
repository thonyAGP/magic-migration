/**
 * Mock Swarm Store for Integration Tests
 *
 * In-memory implementation to avoid better-sqlite3 dependency issues
 */

import type {
  SwarmSession as SessionRecord,
  AgentVote as VoteRecord,
  SessionComplexity as ComplexityRecord,
  ConsensusResult as ConsensusRecord,
  RoundScore as RoundRecord,
} from '../../../../src/swarm/storage/db-types.js';
import type { SwarmSQLiteStore } from '../../../../src/swarm/storage/sqlite-store.js';

/**
 * In-memory mock store for testing
 */
export class MockSwarmStore implements Pick<SwarmSQLiteStore, 'createSession' | 'storeComplexity' | 'updateSessionStatus' | 'storeVote' | 'storeConsensus' | 'recordRound' | 'getSession' | 'completeSession' | 'storeAnalysis' | 'storeVotingRound' | 'storeDoubleVote' | 'close' | 'getTotalCostBetween'> {
  private sessions: Map<string, SessionRecord> = new Map();
  private votes: Map<string, VoteRecord[]> = new Map();
  private complexity: Map<string, ComplexityRecord> = new Map();
  private consensus: Map<string, ConsensusRecord> = new Map();
  private rounds: Map<string, RoundRecord[]> = new Map();
  private analyses: Map<string, any[]> = new Map();
  private votingRounds: Map<string, any[]> = new Map();
  private doubleVotes: Map<string, any> = new Map();

  createSession(session: SessionRecord): void {
    this.sessions.set(session.id, { ...session });
  }

  storeComplexity(sessionId: string, complexity: Omit<ComplexityRecord, 'session_id'>): void {
    this.complexity.set(sessionId, {
      session_id: sessionId,
      ...complexity,
    });
  }

  updateSessionStatus(
    sessionId: string,
    status: SessionRecord['status'],
    phase?: SessionRecord['current_phase'],
  ): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.status = status;
      if (phase) {
        session.current_phase = phase;
      }
      if (status === 'COMPLETED') {
        session.completedAt = new Date();
      }
    }
  }

  storeVote(roundId: string, vote: any): void {
    // Group votes by round ID for simplicity
    const roundVotes = this.votes.get(roundId) || [];
    roundVotes.push({ roundId, ...vote });
    this.votes.set(roundId, roundVotes);
  }

  storeConsensus(consensus: ConsensusRecord): void {
    this.consensus.set(consensus.session_id, { ...consensus });
  }

  recordRound(round: RoundRecord): void {
    const sessionRounds = this.rounds.get(round.session_id) || [];
    sessionRounds.push({ ...round });
    this.rounds.set(round.session_id, sessionRounds);
  }

  getSession(sessionId: string): any {
    const sessionRecord = this.sessions.get(sessionId);
    if (!sessionRecord) return null;

    // Build a SwarmSession-like object with votes
    const allVotes: any[] = [];
    for (const [roundId, votes] of this.votes) {
      allVotes.push(...votes);
    }

    return {
      ...sessionRecord,
      votes: allVotes,
      analyses: this.analyses.get(sessionId) || [],
      consensus: this.consensus.get(sessionId) || ({} as any),
      doubleVote: this.doubleVotes.get(sessionId),
    };
  }

  completeSession(
    sessionId: string,
    result: {
      status: SessionRecord['status'];
      finalConsensusScore?: number;
      finalDecision?: string;
      durationMs?: number;
      totalTokensCost?: number;
    },
  ): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.status = result.status;
      session.completedAt = new Date();
      session.current_phase = 'completed';
    }
  }

  storeAnalysis(sessionId: string, roundNumber: number, analysis: any): void {
    const sessionAnalyses = this.analyses.get(sessionId) || [];
    sessionAnalyses.push({ sessionId, roundNumber, ...analysis });
    this.analyses.set(sessionId, sessionAnalyses);
  }

  storeVotingRound(sessionId: string, roundNumber: number, data: any): void {
    const sessionRounds = this.votingRounds.get(sessionId) || [];
    sessionRounds.push({ sessionId, roundNumber, ...data });
    this.votingRounds.set(sessionId, sessionRounds);
  }

  storeDoubleVote(sessionId: string, doubleVote: any): void {
    this.doubleVotes.set(sessionId, doubleVote);
  }

  close(): void {
    // No-op for in-memory store
  }

  /**
   * K4: Get total cost between two dates (for budget checks)
   */
  getTotalCostBetween(from: Date, to: Date): number {
    let total = 0;
    for (const [, session] of this.sessions) {
      const sessionDate = session.startedAt ? new Date(session.startedAt) : new Date();
      if (sessionDate >= from && sessionDate < to) {
        total += session.totalTokensCost || 0;
      }
    }
    return total;
  }

  /**
   * Clear all data (useful for test cleanup)
   */
  clear(): void {
    this.sessions.clear();
    this.votes.clear();
    this.complexity.clear();
    this.consensus.clear();
    this.rounds.clear();
    this.analyses.clear();
    this.votingRounds.clear();
    this.doubleVotes.clear();
  }
}
