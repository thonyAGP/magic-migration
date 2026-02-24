/**
 * SWARM Report Command - Phase 3 J2 + J4
 *
 * Generate enhanced analytics report with executive summary
 * Export analytics to CSV for external analysis
 */

import { MetricsCalculator } from '../../swarm/analytics/metrics-calculator.js';
import { ReportGenerator } from '../../swarm/analytics/report-generator.js';
import { ExportGenerator } from '../../swarm/analytics/export-generator.js';
import { createSwarmStore } from '../../swarm/storage/sqlite-store.js';
import { writeFileSync } from 'node:fs';
import { existsSync, readdirSync } from 'node:fs';

export interface SwarmReportOptions {
  db?: string;
  from?: string;
  to?: string;
  format?: 'markdown' | 'json';
  output?: string;
  summary?: boolean; // Show executive summary only
  export?: string; // Export to CSV directory
}

/**
 * Format executive summary with health indicators
 */
function formatExecutiveSummary(report: any): string {
  const lines: string[] = [];

  lines.push('═══════════════════════════════════════════════════════════════');
  lines.push('           SWARM ANALYTICS - EXECUTIVE SUMMARY');
  lines.push('═══════════════════════════════════════════════════════════════');
  lines.push('');

  // Key metrics
  const metrics = report.sessionMetrics;
  const passRate = metrics.consensusPassRate;

  // Health indicator
  let healthEmoji = '🟢';
  let healthLabel = 'EXCELLENT';
  if (passRate < 50) {
    healthEmoji = '🔴';
    healthLabel = 'CRITICAL';
  } else if (passRate < 70) {
    healthEmoji = '🟠';
    healthLabel = 'NEEDS ATTENTION';
  } else if (passRate < 85) {
    healthEmoji = '🟡';
    healthLabel = 'GOOD';
  }

  lines.push(`${healthEmoji} Health Status: ${healthLabel}`);
  lines.push('');

  // Key statistics
  lines.push('📊 KEY STATISTICS');
  lines.push('───────────────────────────────────────────────────────────────');
  lines.push(`Total Sessions:       ${metrics.totalSessions}`);
  lines.push(`✅ Completed:         ${metrics.completedSessions} (${passRate.toFixed(1)}%)`);
  lines.push(`⚠️  Escalated:         ${metrics.escalatedSessions}`);
  lines.push(`❌ Failed:            ${metrics.failedSessions}`);
  lines.push('');
  lines.push(`⭐ Avg Consensus:     ${metrics.avgConsensusScore.toFixed(1)}%`);
  lines.push(`⏱️  Avg Duration:      ${(metrics.avgDurationMs / 1000).toFixed(1)}s`);
  lines.push(`💰 Total Cost:        $${metrics.totalTokensCost.toFixed(2)}`);
  lines.push('');

  // Complexity breakdown
  const dist = report.complexityDistribution;
  const totalComplexity = dist.simple + dist.medium + dist.complex + dist.critical;
  if (totalComplexity > 0) {
    lines.push('🎯 COMPLEXITY BREAKDOWN');
    lines.push('───────────────────────────────────────────────────────────────');
    lines.push(`Simple:    ${dist.simple.toString().padStart(3)} (${((dist.simple / totalComplexity) * 100).toFixed(0)}%)`);
    lines.push(`Medium:    ${dist.medium.toString().padStart(3)} (${((dist.medium / totalComplexity) * 100).toFixed(0)}%)`);
    lines.push(`Complex:   ${dist.complex.toString().padStart(3)} (${((dist.complex / totalComplexity) * 100).toFixed(0)}%)`);
    lines.push(`Critical:  ${dist.critical.toString().padStart(3)} (${((dist.critical / totalComplexity) * 100).toFixed(0)}%)`);
    lines.push('');
  }

  // Patterns
  if (report.patterns) {
    if (report.patterns.vetoAgents.length > 0) {
      lines.push('⚠️  ATTENTION NEEDED');
      lines.push('───────────────────────────────────────────────────────────────');
      lines.push(`Frequent Veto Agents: ${report.patterns.vetoAgents.join(', ')}`);
      lines.push('');
    }
    if (report.patterns.lowConfidenceAgents.length > 0) {
      lines.push(`Low Confidence Agents: ${report.patterns.lowConfidenceAgents.join(', ')}`);
      lines.push('');
    }
  }

  // Top escalations alert
  if (report.topEscalations && report.topEscalations.length > 0) {
    lines.push('🚨 ESCALATIONS PENDING');
    lines.push('───────────────────────────────────────────────────────────────');
    lines.push(`${report.topEscalations.length} program(s) require human review`);
    lines.push('Run: factory swarm escalation list');
    lines.push('');
  }

  lines.push('═══════════════════════════════════════════════════════════════');

  return lines.join('\n');
}

/**
 * Generate analytics report with executive summary
 */
export async function generateReport(
  options: SwarmReportOptions,
): Promise<void> {
  try {
    // Validate database exists
    const dbPath = options.db || '.swarm-sessions/swarm.db';
    if (!existsSync(dbPath)) {
      console.error(`[ERROR] Database not found: ${dbPath}`);
      console.error('       Run some SWARM sessions first: factory swarm execute --contract <file>');
      process.exit(1);
    }

    // Create store and calculator
    const store = createSwarmStore(dbPath);
    const calculator = new MetricsCalculator(store);
    const generator = new ReportGenerator(calculator);

    // Parse date range
    let from: Date | undefined;
    let to: Date | undefined;

    if (options.from) {
      from = new Date(options.from);
      if (isNaN(from.getTime())) {
        console.error(`[ERROR] Invalid 'from' date: ${options.from}`);
        console.error('       Use format: YYYY-MM-DD or ISO 8601');
        process.exit(1);
      }
    }

    if (options.to) {
      to = new Date(options.to);
      if (isNaN(to.getTime())) {
        console.error(`[ERROR] Invalid 'to' date: ${options.to}`);
        console.error('       Use format: YYYY-MM-DD or ISO 8601');
        process.exit(1);
      }
    }

    console.log('[SWARM] Generating analytics report...');
    if (from) console.log(`  From: ${from.toISOString()}`);
    if (to) console.log(`  To: ${to.toISOString()}`);
    console.log('');

    // Generate report
    const report = await generator.generateReport(from, to);

    // Check if database is empty
    if (report.sessionMetrics.totalSessions === 0) {
      console.log('⚠️  No SWARM sessions found in database.');
      console.log('');
      if (from || to) {
        console.log('   Try widening the time range or removing date filters.');
      } else {
        console.log('   Run some SWARM sessions first:');
        console.log('   factory swarm execute --contract <file>');
      }
      console.log('');
      store.close();
      return;
    }

    // Export to CSV if requested
    if (options.export) {
      const exporter = new ExportGenerator();
      const exportDir = options.export;

      console.log(`[SWARM] Exporting analytics to CSV...`);
      console.log(`  Output directory: ${exportDir}`);
      console.log('');

      exporter.exportToCSV(report, exportDir);

      // List generated files
      const files = readdirSync(exportDir).filter((f) => f.endsWith('.csv'));
      console.log('✅ CSV files generated:');
      for (const file of files) {
        console.log(`   - ${file}`);
      }
      console.log('');
      console.log(`📊 Total files: ${files.length}`);
      console.log('');

      store.close();
      return;
    }

    // Format output
    let output: string;

    if (options.summary) {
      // Executive summary only
      output = formatExecutiveSummary(report);
    } else if (options.format === 'json') {
      output = generator.formatJSON(report);
    } else {
      // Markdown with executive summary at the top
      const summary = formatExecutiveSummary(report);
      const markdown = generator.formatMarkdown(report);
      output = summary + '\n\n' + markdown;
    }

    // Write or print
    if (options.output) {
      writeFileSync(options.output, output);
      console.log(`✅ Report written to ${options.output}`);
      console.log('');

      // Still show executive summary in console
      if (!options.summary && options.format !== 'json') {
        console.log(formatExecutiveSummary(report));
        console.log('');
        console.log(`Full report saved to: ${options.output}`);
      }
    } else {
      console.log(output);
    }

    store.close();
  } catch (error) {
    if (error instanceof Error) {
      console.error(`[ERROR] ${error.message}`);
      if (error.stack) {
        console.error('');
        console.error('Stack trace:');
        console.error(error.stack);
      }
    } else {
      console.error('[ERROR] Unknown error occurred');
    }
    process.exit(1);
  }
}
