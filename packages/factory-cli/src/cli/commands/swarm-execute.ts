/**
 * SWARM Execute Command
 *
 * Execute SWARM migration for a contract
 */

import { SwarmOrchestrator } from '../../swarm/orchestrator.js';
import { parseContract } from '../../core/contract.js';
import { createSwarmStore } from '../../swarm/storage/sqlite-store.js';
import { writeFileSync } from 'node:fs';

export interface SwarmExecuteOptions {
  contract: string;
  db?: string;
  model?: 'opus' | 'sonnet' | 'haiku';
  maxRounds?: number;
  format?: 'text' | 'json';
  output?: string;
}

/**
 * Execute SWARM migration
 */
export async function executeSwarm(options: SwarmExecuteOptions): Promise<void> {
  try {
    // Parse contract
    console.log(`[SWARM] Loading contract: ${options.contract}`);
    const contract = parseContract(options.contract);

    // Create store and orchestrator
    const dbPath = options.db || '.swarm-sessions/swarm.db';
    const store = createSwarmStore(dbPath);

    const orchestrator = new SwarmOrchestrator(
      {
        model: options.model || 'sonnet',
        maxRounds: options.maxRounds || 10,
      },
      store,
    );

    // Execute SWARM
    console.log(
      `[SWARM] Analyzing contract for program ${contract.program.id} - ${contract.program.name}`,
    );

    const result = await orchestrator.execute(contract as any);

    // Format output
    if (options.format === 'json') {
      const output = JSON.stringify(
        {
          sessionId: result.session.id,
          programId: result.session.programId,
          programName: result.session.programName,
          status: result.session.status,
          finalDecision:
            result.session.status === 'COMPLETED'
              ? 'PROCEED'
              : result.session.status === 'FAILED'
                ? 'REJECT'
                : result.session.status,
          complexity: {
            score: result.session.complexity.score,
            level: result.session.complexity.level,
          },
          consensus: {
            score: result.session.consensus.score,
            passed: result.session.consensus.passed,
            recommendation: result.session.consensus.recommendation,
          },
          rounds: result.session.votes.length / 6, // 6 agents per round (approximation)
          duration: result.session.duration,
          tokensCost: result.session.analyses.reduce(
            (sum, a) => sum + (a.tokens?.cost || 0),
            0,
          ),
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
      // Text format
      console.log(`\n[SWARM] Session completed: ${result.session.status}`);
      console.log(`[SWARM] Decision: ${result.consensus.recommendation}`);
      console.log(`[SWARM] Consensus: ${result.consensus.score.toFixed(1)}%`);
      console.log(`[SWARM] Duration: ${result.session.duration}ms`);
      console.log(`[SWARM] Session ID: ${result.session.id}`);
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
