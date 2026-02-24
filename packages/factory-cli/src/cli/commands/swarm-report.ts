/**
 * SWARM Report Command
 *
 * Generate analytics report
 */

import { MetricsCalculator } from '../../swarm/analytics/metrics-calculator.js';
import { ReportGenerator } from '../../swarm/analytics/report-generator.js';
import { createSwarmStore } from '../../swarm/storage/sqlite-store.js';
import { writeFileSync } from 'node:fs';

export interface SwarmReportOptions {
  db?: string;
  from?: string;
  to?: string;
  format?: 'markdown' | 'json';
  output?: string;
}

/**
 * Generate analytics report
 */
export async function generateReport(
  options: SwarmReportOptions,
): Promise<void> {
  try {
    // Create store and calculator
    const dbPath = options.db || '.swarm-sessions/swarm.db';
    const store = createSwarmStore(dbPath);
    const calculator = new MetricsCalculator(store);
    const generator = new ReportGenerator(calculator);

    // Parse date range
    const from = options.from ? new Date(options.from) : undefined;
    const to = options.to ? new Date(options.to) : undefined;

    console.log('[SWARM] Generating analytics report...');
    if (from) console.log(`  From: ${from.toISOString()}`);
    if (to) console.log(`  To: ${to.toISOString()}`);

    // Generate report
    const report = await generator.generateReport(from, to);

    // Format output
    let output: string;
    if (options.format === 'json') {
      output = generator.formatJSON(report);
    } else {
      output = generator.formatMarkdown(report);
    }

    // Write or print
    if (options.output) {
      writeFileSync(options.output, output);
      console.log(`[SWARM] Report written to ${options.output}`);
    } else {
      console.log('\n' + output);
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
