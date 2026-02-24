#!/usr/bin/env tsx
/**
 * Generate Failure Report
 *
 * Analyzes all failure records and generates a comprehensive report.
 *
 * Usage:
 *   tsx scripts/generate-failure-report.ts [--format html|markdown] [--output <file>]
 *
 * Examples:
 *   # Generate HTML report
 *   tsx scripts/generate-failure-report.ts --format html --output failures.html
 *
 *   # Generate markdown report (default)
 *   tsx scripts/generate-failure-report.ts
 */

import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import {
  listFailures,
  getUnresolvedFailures,
  getFailureStats,
  type FailureRecord,
} from '../src/core/failure-capture.js';

type ReportFormat = 'html' | 'markdown';

// ============================================================================
// Markdown Generation
// ============================================================================

function generateMarkdownReport(
  failures: FailureRecord[],
  stats: ReturnType<typeof getFailureStats>,
  unresolved: FailureRecord[]
): string {
  const now = new Date().toISOString().split('T')[0];

  let md = `# Migration Failures Report\n\n`;
  md += `> **Generated**: ${now}\n`;
  md += `> **Total Failures**: ${stats.total}\n`;
  md += `> **Unresolved**: ${stats.unresolved}\n\n`;
  md += `---\n\n`;

  // Summary statistics
  md += `## 📊 Summary Statistics\n\n`;
  md += `| Metric | Value |\n`;
  md += `|--------|-------|\n`;
  md += `| Total Failures | ${stats.total} |\n`;
  md += `| Unresolved | ${stats.unresolved} |\n`;
  md += `| Resolved | ${stats.total - stats.unresolved} |\n`;
  md += `| Avg Resolution Time | ${stats.avgResolutionTime} minutes |\n\n`;

  // Failures by phase
  md += `## 🔍 Failures by Phase\n\n`;
  md += `| Phase | Count | Percentage |\n`;
  md += `|-------|-------|------------|\n`;
  const sortedPhases = Object.entries(stats.byPhase).sort(
    ([, a], [, b]) => b - a
  );
  for (const [phase, count] of sortedPhases) {
    const pct = Math.round((count / stats.total) * 100);
    md += `| ${phase} | ${count} | ${pct}% |\n`;
  }
  md += `\n`;

  // Failures by error code
  md += `## ❌ Failures by Error Code\n\n`;
  md += `| Error Code | Count | Percentage |\n`;
  md += `|------------|-------|------------|\n`;
  const sortedErrors = Object.entries(stats.byErrorCode).sort(
    ([, a], [, b]) => b - a
  );
  for (const [code, count] of sortedErrors) {
    const pct = Math.round((count / stats.total) * 100);
    md += `| ${code} | ${count} | ${pct}% |\n`;
  }
  md += `\n`;

  // Unresolved failures
  if (unresolved.length > 0) {
    md += `## ⚠️ Unresolved Failures (${unresolved.length})\n\n`;
    for (const failure of unresolved) {
      md += `### Program ${failure.program_id} - ${failure.program_name || 'Unknown'}\n\n`;
      md += `- **Failed At**: ${failure.failed_at}\n`;
      md += `- **Phase**: ${failure.phase}\n`;
      md += `- **Error**: ${failure.error}\n`;
      md += `- **Error Code**: ${failure.error_code}\n`;

      if (
        failure.details.missing_expressions &&
        failure.details.missing_expressions.length > 0
      ) {
        md += `- **Missing Expressions**: ${failure.details.missing_expressions.length}\n`;
        for (const expr of failure.details.missing_expressions) {
          md += `  - \`${expr.expr_id}\`: ${expr.formula}\n`;
        }
      }

      md += `\n`;
    }
  }

  // Recent resolutions
  const resolved = failures
    .filter((f) => f.resolution && f.resolution.verification_passed)
    .sort(
      (a, b) =>
        new Date(b.resolution!.resolved_at).getTime() -
        new Date(a.resolution!.resolved_at).getTime()
    )
    .slice(0, 10);

  if (resolved.length > 0) {
    md += `## ✅ Recent Resolutions (Top 10)\n\n`;
    for (const failure of resolved) {
      md += `### Program ${failure.program_id} - ${failure.program_name || 'Unknown'}\n\n`;
      md += `- **Failed At**: ${failure.failed_at}\n`;
      md += `- **Resolved At**: ${failure.resolution!.resolved_at}\n`;
      md += `- **Resolution Time**: ${failure.resolution!.resolution_time_minutes} minutes\n`;
      md += `- **Action**: ${failure.resolution!.action}\n`;

      if (failure.lessons_learned && failure.lessons_learned.length > 0) {
        md += `- **Lessons Learned**:\n`;
        for (const lesson of failure.lessons_learned) {
          md += `  - ${lesson}\n`;
        }
      }

      md += `\n`;
    }
  }

  // Recommendations
  md += `## 💡 Recommendations\n\n`;

  // Most common error
  if (sortedErrors.length > 0) {
    const [topError, topCount] = sortedErrors[0];
    const topPct = Math.round((topCount / stats.total) * 100);
    md += `- **Most Common Error**: \`${topError}\` (${topCount} occurrences, ${topPct}%)\n`;
    md += `  - Consider adding automated checks to prevent this error\n`;
    md += `  - Review existing patterns in \`.migration-history/patterns/\`\n\n`;
  }

  // Most problematic phase
  if (sortedPhases.length > 0) {
    const [topPhase, phaseCount] = sortedPhases[0];
    const phasePct = Math.round((phaseCount / stats.total) * 100);
    md += `- **Most Problematic Phase**: \`${topPhase}\` (${phaseCount} failures, ${phasePct}%)\n`;
    md += `  - Focus improvement efforts on this phase\n`;
    md += `  - Add more validation before entering this phase\n\n`;
  }

  // Unresolved count
  if (stats.unresolved > 0) {
    md += `- **Unresolved Failures**: ${stats.unresolved} failures need attention\n`;
    md += `  - Prioritize resolution to unblock migrations\n`;
    md += `  - Document lessons learned after resolution\n\n`;
  }

  return md;
}

// ============================================================================
// HTML Generation
// ============================================================================

function generateHtmlReport(
  failures: FailureRecord[],
  stats: ReturnType<typeof getFailureStats>,
  unresolved: FailureRecord[]
): string {
  const now = new Date().toISOString().split('T')[0];

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Migration Failures Report</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f5f5;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 8px;
      margin-bottom: 30px;
    }
    .stat-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .stat-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .stat-value {
      font-size: 2em;
      font-weight: bold;
      color: #667eea;
    }
    .stat-label {
      color: #666;
      font-size: 0.9em;
    }
    table {
      width: 100%;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 30px;
    }
    th {
      background: #667eea;
      color: white;
      padding: 12px;
      text-align: left;
    }
    td {
      padding: 12px;
      border-bottom: 1px solid #eee;
    }
    .failure-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 20px;
      border-left: 4px solid #f59e0b;
    }
    .resolved-card {
      border-left-color: #10b981;
    }
    .tag {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.85em;
      margin-right: 5px;
      background: #e5e7eb;
    }
    h2 {
      color: #333;
      margin-top: 40px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🔍 Migration Failures Report</h1>
    <p>Generated: ${now}</p>
  </div>

  <div class="stat-grid">
    <div class="stat-card">
      <div class="stat-value">${stats.total}</div>
      <div class="stat-label">Total Failures</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${stats.unresolved}</div>
      <div class="stat-label">Unresolved</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${stats.total - stats.unresolved}</div>
      <div class="stat-label">Resolved</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${stats.avgResolutionTime}m</div>
      <div class="stat-label">Avg Resolution Time</div>
    </div>
  </div>

  <h2>Failures by Phase</h2>
  <table>
    <thead>
      <tr>
        <th>Phase</th>
        <th>Count</th>
        <th>Percentage</th>
      </tr>
    </thead>
    <tbody>
      ${Object.entries(stats.byPhase)
        .sort(([, a], [, b]) => b - a)
        .map(
          ([phase, count]) => `
        <tr>
          <td>${phase}</td>
          <td>${count}</td>
          <td>${Math.round((count / stats.total) * 100)}%</td>
        </tr>
      `
        )
        .join('')}
    </tbody>
  </table>

  <h2>Unresolved Failures (${unresolved.length})</h2>
  ${unresolved
    .map(
      (f) => `
    <div class="failure-card">
      <h3>Program ${f.program_id} - ${f.program_name || 'Unknown'}</h3>
      <p><strong>Failed:</strong> ${f.failed_at}</p>
      <p><strong>Phase:</strong> <span class="tag">${f.phase}</span></p>
      <p><strong>Error:</strong> ${f.error}</p>
      <p><strong>Code:</strong> <span class="tag">${f.error_code}</span></p>
    </div>
  `
    )
    .join('')}
</body>
</html>`;
}

// ============================================================================
// Main
// ============================================================================

async function main(): Promise<void> {
  const { values } = parseArgs({
    args: process.argv.slice(2),
    options: {
      format: { type: 'string', default: 'markdown' },
      output: { type: 'string' },
    },
  });

  const format = (values.format || 'markdown') as ReportFormat;
  const output = values.output as string | undefined;

  // Get history directory
  const historyDir = path.resolve(process.cwd(), '../../.migration-history');

  if (!fs.existsSync(historyDir)) {
    console.error('❌ Migration history directory not found:', historyDir);
    process.exit(1);
  }

  console.log('📊 Generating failure report...\n');

  // Load all failures
  const files = listFailures(historyDir);
  const failures: FailureRecord[] = [];

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    failures.push(JSON.parse(content));
  }

  // Get statistics
  const stats = getFailureStats(historyDir);
  const unresolved = getUnresolvedFailures(historyDir);

  console.log(`✓ Loaded ${failures.length} failure records`);
  console.log(`  - Unresolved: ${unresolved.length}`);
  console.log(`  - Avg resolution: ${stats.avgResolutionTime} minutes\n`);

  // Generate report
  const report =
    format === 'html'
      ? generateHtmlReport(failures, stats, unresolved)
      : generateMarkdownReport(failures, stats, unresolved);

  // Write or print
  if (output) {
    fs.writeFileSync(output, report, 'utf8');
    console.log(`✓ Report saved: ${output}`);
  } else {
    console.log(report);
  }
}

main().catch((error) => {
  console.error('❌ Failed to generate report:', error);
  process.exit(1);
});
