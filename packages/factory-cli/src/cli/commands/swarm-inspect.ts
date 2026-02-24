/**
 * SWARM Inspect Command
 *
 * Inspect a specific session
 */

import { createSwarmStore } from '../../swarm/storage/sqlite-store.js';
import { writeFileSync } from 'node:fs';

export interface SwarmInspectOptions {
  sessionId: string;
  db?: string;
  format?: 'text' | 'json';
  showVotes?: boolean;
  showAnalyses?: boolean;
  output?: string;
}

/**
 * Inspect session details
 */
export async function inspectSession(
  options: SwarmInspectOptions,
): Promise<void> {
  try {
    // Create store
    const dbPath = options.db || '.swarm-sessions/swarm.db';
    const store = createSwarmStore(dbPath);

    console.log(`[SWARM] Inspecting session: ${options.sessionId}`);

    // Query session (using private db property - in real impl would add public method)
    const session = (store as any).db
      .prepare(
        `
      SELECT * FROM swarm_sessions WHERE id = ?
    `,
      )
      .get(options.sessionId);

    if (!session) {
      console.error(`[ERROR] Session not found: ${options.sessionId}`);
      store.close();
      process.exit(1);
    }

    // Query complexity
    const complexity = (store as any).db
      .prepare(
        `
      SELECT * FROM swarm_complexity_assessments WHERE session_id = ?
    `,
      )
      .get(options.sessionId);

    // Query rounds
    const rounds = (store as any).db
      .prepare(
        `
      SELECT * FROM swarm_voting_rounds WHERE session_id = ? ORDER BY round_number
    `,
      )
      .all(options.sessionId);

    // Query votes if requested
    let votes: any[] = [];
    if (options.showVotes) {
      votes = (store as any).db
        .prepare(
          `
        SELECT * FROM swarm_votes WHERE session_id = ? ORDER BY voting_round_id
      `,
        )
        .all(options.sessionId);
    }

    // Format output
    if (options.format === 'json') {
      const output = JSON.stringify(
        {
          session,
          complexity,
          rounds,
          ...(options.showVotes && { votes }),
        },
        null,
        2,
      );

      if (options.output) {
        writeFileSync(options.output, output);
        console.log(`[SWARM] Inspection written to ${options.output}`);
      } else {
        console.log(output);
      }
    } else {
      // Text format
      console.log(`\nSession: ${session.id}`);
      console.log(`Program: ${session.program_name} (${session.program_id})`);
      console.log(`Status: ${session.status}`);
      console.log(
        `Decision: ${session.status === 'COMPLETED' ? 'PROCEED' : session.status === 'FAILED' ? 'REJECT' : session.status}`,
      );

      if (complexity) {
        console.log(`\nComplexity:`);
        console.log(`  Score: ${complexity.score}/100 (${complexity.level})`);
        console.log(
          `  Double vote: ${complexity.requires_double_vote ? 'Required' : 'Not required'}`,
        );
      }

      console.log(`\nTimeline:`);
      console.log(`  Started: ${session.started_at}`);
      if (session.completed_at) {
        console.log(`  Completed: ${session.completed_at}`);
      }
      if (session.duration_ms) {
        console.log(`  Duration: ${session.duration_ms}ms`);
      }

      console.log(`\nRounds: ${rounds.length}`);
      for (const round of rounds) {
        const passed = round.consensus_passed ? '✓ PASSED' : '✗ FAILED';
        console.log(
          `  Round ${round.round_number}: ${round.consensus_score.toFixed(1)}% consensus ${passed}`,
        );
      }

      if (session.total_tokens_cost) {
        console.log(
          `\nCost: $${session.total_tokens_cost.toFixed(2)} (tokens)`,
        );
      }

      if (options.showVotes && votes.length > 0) {
        console.log(`\nVotes (${votes.length}):`);
        for (const vote of votes.slice(0, 10)) {
          // Show first 10
          console.log(
            `  ${vote.agent}: ${vote.vote} (${vote.confidence}% confidence)`,
          );
        }
        if (votes.length > 10) {
          console.log(`  ... and ${votes.length - 10} more votes`);
        }
      }
    }

    store.close();
  } catch (error) {
    if (error instanceof Error) {
      console.error(`[ERROR] ${error.message}`);
    } else {
      console.error('[ERROR] Unknown error occurred');
    }
    process.exit(1);
  }
}
