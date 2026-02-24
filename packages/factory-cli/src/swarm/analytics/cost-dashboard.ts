/**
 * K4: Cost Dashboard
 *
 * Display cost statistics and budget tracking
 */

import type { SwarmSQLiteStore } from '../storage/sqlite-store.js';
import chalk from 'chalk';

export interface CostStatistics {
  today: {
    total: number;
    limit: number;
    percentage: number;
  };
  week: {
    total: number;
    limit: number;
    percentage: number;
  };
  avgPerSession: number;
  mostExpensiveSession: {
    programName: string;
    cost: number;
  } | null;
  totalSessions: number;
}

/**
 * Calculate cost statistics from store
 */
export function calculateCostStatistics(
  store: SwarmSQLiteStore,
  dailyBudget: number = 100.0,
): CostStatistics {
  const db = (store as any).db;

  // Today's cost
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayCost = store.getTotalCostBetween(today, tomorrow);

  // This week's cost
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay()); // Sunday
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);

  const weekCost = store.getTotalCostBetween(weekStart, weekEnd);
  const weeklyBudget = dailyBudget * 7;

  // Average per session
  const avgQuery = `
    SELECT
      AVG(total_tokens_cost_usd) as avgCost,
      COUNT(*) as totalSessions
    FROM swarm_sessions
    WHERE total_tokens_cost_usd > 0
  `;

  const avgResult = db.prepare(avgQuery).get() as {
    avgCost: number | null;
    totalSessions: number;
  };

  const avgPerSession = avgResult.avgCost || 0;
  const totalSessions = avgResult.totalSessions || 0;

  // Most expensive session
  const expensiveQuery = `
    SELECT
      program_name,
      total_tokens_cost_usd as cost
    FROM swarm_sessions
    WHERE total_tokens_cost_usd > 0
    ORDER BY total_tokens_cost_usd DESC
    LIMIT 1
  `;

  const expensiveResult = db.prepare(expensiveQuery).get() as {
    program_name: string;
    cost: number;
  } | undefined;

  return {
    today: {
      total: todayCost,
      limit: dailyBudget,
      percentage: (todayCost / dailyBudget) * 100,
    },
    week: {
      total: weekCost,
      limit: weeklyBudget,
      percentage: (weekCost / weeklyBudget) * 100,
    },
    avgPerSession,
    mostExpensiveSession: expensiveResult
      ? {
          programName: expensiveResult.program_name,
          cost: expensiveResult.cost,
        }
      : null,
    totalSessions,
  };
}

/**
 * Render cost dashboard to console
 */
export function renderCostDashboard(stats: CostStatistics): void {
  console.log(chalk.bold('\n📊 SWARM Cost Dashboard\n'));

  // Today
  const todayBar = renderBudgetBar(stats.today.percentage);
  const todayColor = getPercentageColor(stats.today.percentage);
  console.log(
    `${chalk.bold('Today:')} ${todayColor(`$${stats.today.total.toFixed(2)}`)} / $${stats.today.limit.toFixed(2)} ${todayColor(`(${stats.today.percentage.toFixed(0)}%)`)}`,
  );
  console.log(`  ${todayBar}\n`);

  // This week
  const weekBar = renderBudgetBar(stats.week.percentage);
  const weekColor = getPercentageColor(stats.week.percentage);
  console.log(
    `${chalk.bold('This week:')} ${weekColor(`$${stats.week.total.toFixed(2)}`)} / $${stats.week.limit.toFixed(2)} ${weekColor(`(${stats.week.percentage.toFixed(0)}%)`)}`,
  );
  console.log(`  ${weekBar}\n`);

  // Average per session
  console.log(
    `${chalk.bold('Avg per session:')} ${chalk.cyan(`$${stats.avgPerSession.toFixed(2)}`)} (${stats.totalSessions} sessions)\n`,
  );

  // Most expensive
  if (stats.mostExpensiveSession) {
    console.log(
      `${chalk.bold('Most expensive:')} ${chalk.yellow(stats.mostExpensiveSession.programName)} ${chalk.red(`($${stats.mostExpensiveSession.cost.toFixed(2)})`)}`,
    );
  }

  console.log('');
}

/**
 * Render budget bar with percentage
 */
function renderBudgetBar(percentage: number): string {
  const barLength = 40;
  const filled = Math.round((percentage / 100) * barLength);
  const empty = barLength - filled;

  const color = getPercentageColor(percentage);
  const filledBar = '█'.repeat(Math.max(0, filled));
  const emptyBar = '░'.repeat(Math.max(0, empty));

  return color(filledBar) + chalk.gray(emptyBar);
}

/**
 * Get color based on percentage
 */
function getPercentageColor(percentage: number): (str: string) => string {
  if (percentage >= 90) return chalk.red;
  if (percentage >= 70) return chalk.yellow;
  if (percentage >= 50) return chalk.blue;
  return chalk.green;
}
