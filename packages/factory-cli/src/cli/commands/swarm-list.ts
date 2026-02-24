/**
 * SWARM List Command
 *
 * List sessions with filters
 */

import { createSwarmStore } from '../../swarm/storage/sqlite-store.js';
import { writeFileSync } from 'node:fs';

export interface SwarmListOptions {
  db?: string;
  status?: 'COMPLETED' | 'FAILED' | 'ESCALATED' | 'TO_REVIEW';
  limit?: number;
  format?: 'table' | 'json';
  output?: string;
}

/**
 * List sessions
 */
export async function listSessions(options: SwarmListOptions): Promise<void> {
  try {
    // Create store
    const dbPath = options.db || '.swarm-sessions/swarm.db';
    const store = createSwarmStore(dbPath);

    console.log('[SWARM] Listing sessions...');

    // Build query
    let query = 'SELECT * FROM swarm_sessions';
    const params: any[] = [];

    if (options.status) {
      query += ' WHERE status = ?';
      params.push(options.status);
    }

    query += ' ORDER BY started_at DESC';

    if (options.limit) {
      query += ' LIMIT ?';
      params.push(options.limit);
    } else {
      query += ' LIMIT 10'; // Default limit
    }

    const sessions = (store as any).db.prepare(query).all(...params);

    // Count total
    let totalQuery = 'SELECT COUNT(*) as count FROM swarm_sessions';
    if (options.status) {
      totalQuery += ' WHERE status = ?';
    }
    const totalResult = (store as any).db
      .prepare(totalQuery)
      .get(options.status ? options.status : undefined);
    const total = totalResult.count;

    // Format output
    if (options.format === 'json') {
      const output = JSON.stringify(
        {
          sessions,
          total,
          showing: sessions.length,
        },
        null,
        2,
      );

      if (options.output) {
        writeFileSync(options.output, output);
        console.log(`[SWARM] List written to ${options.output}`);
      } else {
        console.log(output);
      }
    } else {
      // Table format
      console.log('');
      console.log(
        '┌─────────────────────────┬──────────────────────────┬─────────────┬─────────┬────────────┐',
      );
      console.log(
        '│ Session ID              │ Program                  │ Status      │ Score   │ Started At │',
      );
      console.log(
        '├─────────────────────────┼──────────────────────────┼─────────────┼─────────┼────────────┤',
      );

      for (const session of sessions) {
        const sessionId = session.id.substring(0, 8) + '...';
        const programName = session.program_name.substring(0, 22).padEnd(22);
        let statusIcon = '';
        if (session.status === 'COMPLETED') statusIcon = '✅';
        else if (session.status === 'ESCALATED') statusIcon = '⚠️';
        else if (session.status === 'FAILED') statusIcon = '❌';
        else statusIcon = '🔍';

        const status = `${statusIcon} ${session.status}`.padEnd(10);
        const score = session.final_consensus_score
          ? `${session.final_consensus_score.toFixed(1)}%`.padStart(6)
          : 'N/A'.padStart(6);
        const startedAt = new Date(session.started_at)
          .toISOString()
          .substring(0, 16)
          .replace('T', ' ');

        console.log(
          `│ ${sessionId.padEnd(23)} │ ${programName} │ ${status} │ ${score} │ ${startedAt} │`,
        );
      }

      console.log(
        '└─────────────────────────┴──────────────────────────┴─────────────┴─────────┴────────────┘',
      );
      console.log('');
      console.log(`Showing ${sessions.length} of ${total} sessions.`);
      if (sessions.length < total) {
        console.log('Use --limit to show more.');
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
