/**
 * SWARM Escalation Commands - Phase 3 I3
 *
 * Commands for managing escalated sessions:
 * - list: List all escalated sessions
 * - review: Show detailed escalation report
 * - resolve: Provide resolution workflow guidance
 */

import { createSwarmStore } from '../../swarm/storage/sqlite-store.js';
import { EscalationManager } from '../../swarm/escalation/escalation-manager.js';
import type { EscalationContext } from '../../swarm/types.js';
import { writeFileSync } from 'node:fs';

export interface EscalationListOptions {
  db?: string;
  limit?: number;
  format?: 'table' | 'json';
  output?: string;
}

export interface EscalationReviewOptions {
  db?: string;
  sessionId: string;
  format?: 'text' | 'json';
  output?: string;
}

export interface EscalationResolveOptions {
  db?: string;
  sessionId: string;
}

/**
 * List all escalated sessions
 */
export async function listEscalations(options: EscalationListOptions): Promise<void> {
  try {
    const dbPath = options.db || '.swarm-sessions/swarm.db';
    const store = createSwarmStore(dbPath);

    console.log('[SWARM] Listing escalated sessions...');

    // Query escalated sessions only
    let query = 'SELECT * FROM swarm_sessions WHERE status = ?';
    const params: any[] = ['ESCALATED'];

    query += ' ORDER BY started_at DESC';

    if (options.limit) {
      query += ' LIMIT ?';
      params.push(options.limit);
    } else {
      query += ' LIMIT 10';
    }

    const sessions = (store as any).db.prepare(query).all(...params);

    // Count total escalated
    const totalResult = (store as any).db
      .prepare('SELECT COUNT(*) as count FROM swarm_sessions WHERE status = ?')
      .get('ESCALATED');
    const total = totalResult.count;

    // Format output
    if (options.format === 'json') {
      const output = JSON.stringify(
        {
          escalations: sessions,
          total,
          showing: sessions.length,
        },
        null,
        2,
      );

      if (options.output) {
        writeFileSync(options.output, output);
        console.log(`[SWARM] Escalations written to ${options.output}`);
      } else {
        console.log(output);
      }
    } else {
      // Table format
      console.log('');
      console.log(
        '┌─────────────────────────┬──────────────────────────┬────────────┬──────┬────────────┐',
      );
      console.log(
        '│ Session ID              │ Program                  │ Reason     │ Score│ Started At │',
      );
      console.log(
        '├─────────────────────────┼──────────────────────────┼────────────┼──────┼────────────┤',
      );

      for (const session of sessions) {
        const sessionId = session.id.substring(0, 8) + '...';
        const programName = session.program_name.substring(0, 22).padEnd(22);

        // Get escalation context from session metadata
        const metadata = session.metadata ? JSON.parse(session.metadata) : {};
        const reason = metadata.escalationReason || 'UNKNOWN';
        const reasonShort = reason.substring(0, 8).padEnd(8);

        const score = session.final_consensus_score
          ? `${session.final_consensus_score.toFixed(1)}%`
          : 'N/A';
        const startedAt = new Date(session.started_at)
          .toISOString()
          .substring(0, 16)
          .replace('T', ' ');

        console.log(
          `│ ${sessionId.padEnd(23)} │ ${programName} │ ⚠️  ${reasonShort} │ ${score.padStart(4)} │ ${startedAt} │`,
        );
      }

      console.log(
        '└─────────────────────────┴──────────────────────────┴────────────┴──────┴────────────┘',
      );
      console.log('');
      console.log(`Showing ${sessions.length} of ${total} escalated sessions.`);
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

/**
 * Review escalation - show detailed report
 */
export async function reviewEscalation(options: EscalationReviewOptions): Promise<void> {
  try {
    const dbPath = options.db || '.swarm-sessions/swarm.db';
    const store = createSwarmStore(dbPath);
    const escalationManager = new EscalationManager(store);

    console.log(`[SWARM] Reviewing escalation: ${options.sessionId}`);

    // Get session
    const session = store.getSession(options.sessionId);
    if (!session) {
      console.error(`[ERROR] Session not found: ${options.sessionId}`);
      store.close();
      process.exit(1);
    }

    if (session.status !== 'ESCALATED') {
      console.error(
        `[ERROR] Session is not escalated (status: ${session.status})`,
      );
      store.close();
      process.exit(1);
    }

    // Get escalation context from session metadata (SQL row has snake_case)
    const sessionRow = session as any;
    const metadata = sessionRow.metadata ? JSON.parse(sessionRow.metadata) : {};
    const escalationReason = metadata.escalationReason || 'UNKNOWN';

    // Build escalation context
    const context: EscalationContext = {
      sessionId: session.id,
      programId: session.programId,
      programName: session.programName,
      reason: escalationReason as any,
      roundHistory: [],
      blockerConcerns: [],
      roundsAttempted: sessionRow.current_round || 0,
      finalConsensusScore: sessionRow.final_consensus_score || 0,
    };

    // Extract blocker concerns from votes
    for (const vote of session.votes) {
      if (vote.concerns && Array.isArray(vote.concerns)) {
        const blockers = vote.concerns.filter((c: any) => c.severity === 'BLOCKER');
        context.blockerConcerns.push(...blockers);
      }
    }

    // Generate report
    const report = escalationManager.generateEscalationReport(context, session);

    // Format output
    if (options.format === 'json') {
      const output = JSON.stringify(
        {
          session: {
            id: session.id,
            programId: session.programId,
            programName: session.programName,
            status: session.status,
            rounds: sessionRow.current_round,
            score: sessionRow.final_consensus_score,
          },
          context,
          report,
        },
        null,
        2,
      );

      if (options.output) {
        writeFileSync(options.output, output);
        console.log(`[SWARM] Report written to ${options.output}`);
      } else {
        console.log(output);
      }
    } else {
      // Text format - human-readable
      console.log('');
      console.log('═══════════════════════════════════════════════════════════════');
      console.log('                  ESCALATION REPORT');
      console.log('═══════════════════════════════════════════════════════════════');
      console.log('');
      console.log(`Session:    ${session.id}`);
      console.log(`Program:    ${session.programName} (ID: ${session.programId})`);
      console.log(`Status:     ${session.status}`);
      console.log(`Rounds:     ${sessionRow.current_round}`);
      console.log(`Score:      ${sessionRow.final_consensus_score}%`);
      console.log('');
      console.log('───────────────────────────────────────────────────────────────');
      console.log('SUMMARY');
      console.log('───────────────────────────────────────────────────────────────');
      console.log(report.summary);
      console.log('');
      console.log('───────────────────────────────────────────────────────────────');
      console.log('RECOMMENDATION');
      console.log('───────────────────────────────────────────────────────────────');
      console.log(`⚡ ${report.recommendation}`);
      console.log('');
      console.log('───────────────────────────────────────────────────────────────');
      console.log('KEY ISSUES');
      console.log('───────────────────────────────────────────────────────────────');
      for (const issue of report.keyIssues) {
        console.log(`• ${issue}`);
      }
      console.log('');

      if (report.divergentViews.length > 0) {
        console.log('───────────────────────────────────────────────────────────────');
        console.log('DIVERGENT VIEWS');
        console.log('───────────────────────────────────────────────────────────────');
        for (const view of report.divergentViews) {
          console.log(`\n🗣️  ${view.agent.toUpperCase()}`);
          console.log(`   ${view.view}`);
        }
        console.log('');
      }

      console.log('───────────────────────────────────────────────────────────────');
      console.log('SUGGESTED ACTIONS');
      console.log('───────────────────────────────────────────────────────────────');
      for (let i = 0; i < report.suggestedActions.length; i++) {
        console.log(`${i + 1}. ${report.suggestedActions[i]}`);
      }
      console.log('');
      console.log('═══════════════════════════════════════════════════════════════');
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

/**
 * Resolve escalation - provide workflow guidance
 */
export async function resolveEscalation(options: EscalationResolveOptions): Promise<void> {
  try {
    const dbPath = options.db || '.swarm-sessions/swarm.db';
    const store = createSwarmStore(dbPath);

    console.log(`[SWARM] Resolving escalation: ${options.sessionId}`);

    // Get session
    const session = store.getSession(options.sessionId);
    if (!session) {
      console.error(`[ERROR] Session not found: ${options.sessionId}`);
      store.close();
      process.exit(1);
    }

    if (session.status !== 'ESCALATED') {
      console.error(
        `[ERROR] Session is not escalated (status: ${session.status})`,
      );
      store.close();
      process.exit(1);
    }

    // Show resolution workflow
    const sessionRow = session as any;
    console.log('');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('            ESCALATION RESOLUTION WORKFLOW');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');
    console.log('📋 CURRENT STATUS');
    console.log(`   Session:  ${session.id}`);
    console.log(`   Program:  ${session.programName} (ID: ${session.programId})`);
    console.log(`   Score:    ${sessionRow.final_consensus_score}%`);
    console.log(`   Rounds:   ${sessionRow.current_round}`);
    console.log('');
    console.log('───────────────────────────────────────────────────────────────');
    console.log('📝 RESOLUTION OPTIONS');
    console.log('───────────────────────────────────────────────────────────────');
    console.log('');
    console.log('1️⃣  APPROVE OVERRIDE');
    console.log('   • Human decision to proceed despite concerns');
    console.log('   • Use when issues are acceptable or will be addressed later');
    console.log('   • Command: (Not yet implemented - Phase 3 I4)');
    console.log('');
    console.log('2️⃣  REJECT & FIX');
    console.log('   • Address the identified concerns');
    console.log('   • Modify contract/implementation');
    console.log('   • Re-run SWARM after fixes');
    console.log('   • Command: Fix contract then run "factory swarm execute --contract <file>"');
    console.log('');
    console.log('3️⃣  ARCHITECTURAL CHANGE');
    console.log('   • Requires significant redesign');
    console.log('   • May need senior architect review');
    console.log('   • Document decision and rationale');
    console.log('   • Command: Update architecture docs, then re-run SWARM');
    console.log('');
    console.log('4️⃣  SKIP PROGRAM');
    console.log('   • Defer migration of this program');
    console.log('   • Document reason for skipping');
    console.log('   • Command: (Not yet implemented - Phase 3 I4)');
    console.log('');
    console.log('───────────────────────────────────────────────────────────────');
    console.log('🔍 NEXT STEPS');
    console.log('───────────────────────────────────────────────────────────────');
    console.log('');
    console.log('1. Review detailed escalation report:');
    console.log(`   factory swarm escalation review ${options.sessionId}`);
    console.log('');
    console.log('2. Examine session details:');
    console.log(`   factory swarm inspect ${options.sessionId} --show-votes --show-analyses`);
    console.log('');
    console.log('3. Make your decision based on the report');
    console.log('');
    console.log('4. Take action (fix contract or override)');
    console.log('');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');
    console.log('ℹ️  Resolution workflow commands will be added in Phase 3 I4');
    console.log('');

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
