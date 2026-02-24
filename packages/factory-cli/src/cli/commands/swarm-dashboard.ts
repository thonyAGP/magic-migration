/**
 * SWARM Dashboard Command - Phase 3 J3
 *
 * Terminal dashboard with live metrics and ASCII visualizations
 */

import { MetricsCalculator } from '../../swarm/analytics/metrics-calculator.js';
import { createSwarmStore } from '../../swarm/storage/sqlite-store.js';
import { existsSync } from 'node:fs';

export interface SwarmDashboardOptions {
  db?: string;
  watch?: boolean; // Auto-refresh mode
  interval?: number; // Refresh interval in seconds (default: 5)
}

/**
 * Create ASCII bar chart
 */
function createBarChart(
  data: Array<{ label: string; value: number; max?: number }>,
  width: number = 40,
): string[] {
  const lines: string[] = [];

  // Find max value for scaling
  const maxValue = Math.max(...data.map((d) => d.max || d.value));

  for (const item of data) {
    const barWidth = Math.round((item.value / maxValue) * width);
    const bar = '█'.repeat(barWidth) + '░'.repeat(width - barWidth);
    const percentage = item.max ? `${((item.value / item.max) * 100).toFixed(0)}%` : '';
    lines.push(`${item.label.padEnd(12)} ${bar} ${item.value} ${percentage}`);
  }

  return lines;
}

/**
 * Create ASCII sparkline
 */
function createSparkline(values: number[], width: number = 30): string {
  if (values.length === 0) return '─'.repeat(width);

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const sparkChars = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];

  let sparkline = '';
  for (const value of values.slice(-width)) {
    const normalized = (value - min) / range;
    const index = Math.min(Math.floor(normalized * sparkChars.length), sparkChars.length - 1);
    sparkline += sparkChars[index];
  }

  return sparkline.padEnd(width, '▁');
}

/**
 * Format dashboard screen
 */
function formatDashboard(calculator: MetricsCalculator): string {
  const lines: string[] = [];
  const width = 80;

  // Clear screen and move cursor to top
  lines.push('\x1Bc'); // Clear screen

  // Header
  lines.push('═'.repeat(width));
  lines.push('              SWARM ANALYTICS DASHBOARD - LIVE'.padEnd(width));
  lines.push(`              ${new Date().toISOString()}`.padEnd(width));
  lines.push('═'.repeat(width));
  lines.push('');

  // Session metrics
  const sessionMetrics = calculator.calculateSessionMetrics();

  // Health indicator
  const passRate = sessionMetrics.consensusPassRate;
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

  lines.push(`${healthEmoji} SYSTEM HEALTH: ${healthLabel} (Pass Rate: ${passRate.toFixed(1)}%)`);
  lines.push('');

  // Key metrics in grid
  lines.push('┌─────────────────────────┬─────────────────────────┬─────────────────────────┐');
  lines.push(
    `│ Total Sessions: ${sessionMetrics.totalSessions.toString().padStart(7)} │ Avg Consensus: ${sessionMetrics.avgConsensusScore.toFixed(1).padStart(6)}% │ Total Cost: ${('$' + sessionMetrics.totalTokensCost.toFixed(2)).padStart(8)} │`,
  );
  lines.push('├─────────────────────────┼─────────────────────────┼─────────────────────────┤');
  lines.push(
    `│ ✅ Completed: ${sessionMetrics.completedSessions.toString().padStart(9)} │ ⚠️  Escalated: ${sessionMetrics.escalatedSessions.toString().padStart(9)} │ ❌ Failed: ${sessionMetrics.failedSessions.toString().padStart(12)} │`,
  );
  lines.push('└─────────────────────────┴─────────────────────────┴─────────────────────────┘');
  lines.push('');

  // Session distribution bar chart
  if (sessionMetrics.totalSessions > 0) {
    lines.push('📊 SESSION DISTRIBUTION');
    lines.push('─'.repeat(width));
    const chartData = [
      {
        label: '✅ Completed',
        value: sessionMetrics.completedSessions,
        max: sessionMetrics.totalSessions,
      },
      {
        label: '⚠️  Escalated',
        value: sessionMetrics.escalatedSessions,
        max: sessionMetrics.totalSessions,
      },
      {
        label: '❌ Failed',
        value: sessionMetrics.failedSessions,
        max: sessionMetrics.totalSessions,
      },
    ];
    const chart = createBarChart(chartData, 40);
    for (const line of chart) {
      lines.push(line);
    }
    lines.push('');
  }

  // Complexity distribution
  const distribution = calculator.getComplexityDistribution();
  const totalComplexity =
    distribution.simple + distribution.medium + distribution.complex + distribution.critical;

  if (totalComplexity > 0) {
    lines.push('🎯 COMPLEXITY BREAKDOWN');
    lines.push('─'.repeat(width));
    const complexityChart = [
      { label: 'Simple', value: distribution.simple, max: totalComplexity },
      { label: 'Medium', value: distribution.medium, max: totalComplexity },
      { label: 'Complex', value: distribution.complex, max: totalComplexity },
      { label: 'Critical', value: distribution.critical, max: totalComplexity },
    ];
    const chart = createBarChart(complexityChart, 40);
    for (const line of chart) {
      lines.push(line);
    }
    lines.push('');
  }

  // Consensus trends sparkline
  const trends = calculator.analyzeConsensusTrends();
  if (trends.length > 0) {
    lines.push('📈 CONSENSUS TRENDS BY ROUND');
    lines.push('─'.repeat(width));
    const scores = trends.map((t) => t.avgScore);
    const sparkline = createSparkline(scores, 50);
    lines.push(`Avg Score:  ${sparkline}  ${scores[scores.length - 1]?.toFixed(1) || 0}%`);

    const passRates = trends.map((t) => t.passRate);
    const passSparkline = createSparkline(passRates, 50);
    lines.push(`Pass Rate:  ${passSparkline}  ${passRates[passRates.length - 1]?.toFixed(1) || 0}%`);
    lines.push('');
  }

  // Agent performance summary
  const agentMetrics = calculator.calculateAgentMetrics();
  if (agentMetrics.length > 0) {
    lines.push('👥 AGENT PERFORMANCE');
    lines.push('─'.repeat(width));
    lines.push('Agent        Votes  Approve  Reject  Confidence  Vetos');
    lines.push('─'.repeat(width));

    for (const agent of agentMetrics.slice(0, 6)) {
      // Top 6 agents
      const vetoIndicator = agent.vetoCount >= 3 ? '⚠️ ' : '  ';
      lines.push(
        `${vetoIndicator}${agent.agent.padEnd(10)} ${agent.totalVotes.toString().padStart(5)} ${agent.approveVotes.toString().padStart(7)} ${agent.rejectVotes.toString().padStart(7)} ${agent.avgConfidence.toFixed(1).padStart(10)}% ${agent.vetoCount.toString().padStart(5)}`,
      );
    }
    lines.push('');
  }

  // Pattern alerts
  const patterns = calculator.identifyPatterns(agentMetrics);
  if (patterns.vetoAgents.length > 0 || patterns.lowConfidenceAgents.length > 0) {
    lines.push('⚠️  ALERTS');
    lines.push('─'.repeat(width));
    if (patterns.vetoAgents.length > 0) {
      lines.push(`🚨 Frequent veto agents: ${patterns.vetoAgents.join(', ')}`);
    }
    if (patterns.lowConfidenceAgents.length > 0) {
      lines.push(`⚡ Low confidence agents: ${patterns.lowConfidenceAgents.join(', ')}`);
    }
    lines.push('');
  }

  // Footer
  lines.push('─'.repeat(width));
  lines.push('Press Ctrl+C to exit'.padStart(width));
  lines.push('');

  return lines.join('\n');
}

/**
 * Display SWARM dashboard
 */
export async function displayDashboard(options: SwarmDashboardOptions): Promise<void> {
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

    // Check if database is empty
    const sessionMetrics = calculator.calculateSessionMetrics();
    if (sessionMetrics.totalSessions === 0) {
      console.log('⚠️  No SWARM sessions found in database.');
      console.log('');
      console.log('   Run some SWARM sessions first:');
      console.log('   factory swarm execute --contract <file>');
      console.log('');
      store.close();
      return;
    }

    // Watch mode
    if (options.watch) {
      const interval = (options.interval || 5) * 1000; // Convert to milliseconds

      console.log('[SWARM] Starting dashboard in watch mode...');
      console.log(`        Refresh interval: ${options.interval || 5}s`);
      console.log('        Press Ctrl+C to exit');
      console.log('');

      // Initial display
      const dashboard = formatDashboard(calculator);
      console.log(dashboard);

      // Set up interval
      const intervalId = setInterval(() => {
        const dashboard = formatDashboard(calculator);
        console.log(dashboard);
      }, interval);

      // Handle Ctrl+C
      process.on('SIGINT', () => {
        clearInterval(intervalId);
        store.close();
        console.log('\n[SWARM] Dashboard stopped.');
        process.exit(0);
      });

      // Keep process alive
      await new Promise(() => {}); // Infinite promise
    } else {
      // Single display
      const dashboard = formatDashboard(calculator);
      console.log(dashboard);
      store.close();
    }
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
