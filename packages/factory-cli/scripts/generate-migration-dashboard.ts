#!/usr/bin/env tsx
/**
 * Generate Migration Dashboard
 *
 * Unified dashboard showing migration progress, patterns learned, and failures.
 *
 * Usage:
 *   tsx scripts/generate-migration-dashboard.ts [--format html|markdown] [--output <file>]
 *
 * Examples:
 *   # Generate HTML dashboard
 *   tsx scripts/generate-migration-dashboard.ts --format html --output migration-dashboard.html
 *
 *   # Generate markdown (stdout)
 *   tsx scripts/generate-migration-dashboard.ts
 */

import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import YAML from 'yaml';
import {
  getFailureStats,
  getUnresolvedFailures,
  type FailureRecord,
} from '../src/core/failure-capture.js';

type DashboardFormat = 'html' | 'markdown';

interface Pattern {
  pattern: string;
  description: string;
  category: string;
  occurrences: number;
  complexity: string;
  first_seen: string;
}

interface MigrationStats {
  timestamp: string;
  program_id: number;
  program_name: string;
  coverage_pct: number;
}

interface DashboardData {
  patterns: Pattern[];
  failures: {
    stats: ReturnType<typeof getFailureStats>;
    unresolved: FailureRecord[];
  };
  migrations: MigrationStats[];
  summary: {
    total_patterns: number;
    total_migrations: number;
    avg_coverage: number;
    total_failures: number;
    unresolved_failures: number;
  };
}

// ============================================================================
// Data Loading
// ============================================================================

function loadPatterns(historyDir: string): Pattern[] {
  const patternsDir = path.join(historyDir, 'patterns');
  const patterns: Pattern[] = [];

  if (!fs.existsSync(patternsDir)) {
    return patterns;
  }

  const files = fs
    .readdirSync(patternsDir)
    .filter((f) => f.endsWith('.yaml') && !['TEMPLATE.yaml', 'README.yaml'].includes(f));

  for (const file of files) {
    try {
      const content = fs.readFileSync(path.join(patternsDir, file), 'utf8');
      const pattern = YAML.parse(content) as Pattern;
      patterns.push(pattern);
    } catch {
      // Skip invalid patterns
    }
  }

  return patterns.sort((a, b) => b.occurrences - a.occurrences);
}

function loadMigrationStats(historyDir: string): MigrationStats[] {
  const statsFile = path.join(historyDir, 'migration-stats.jsonl');
  const stats: MigrationStats[] = [];

  if (!fs.existsSync(statsFile)) {
    return stats;
  }

  const content = fs.readFileSync(statsFile, 'utf8');
  const lines = content.split('\n').filter((l) => l.trim());

  for (const line of lines) {
    try {
      stats.push(JSON.parse(line));
    } catch {
      // Skip invalid lines
    }
  }

  return stats.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

function loadDashboardData(historyDir: string): DashboardData {
  const patterns = loadPatterns(historyDir);
  const failureStats = getFailureStats(historyDir);
  const unresolved = getUnresolvedFailures(historyDir);
  const migrations = loadMigrationStats(historyDir);

  const avgCoverage =
    migrations.length > 0
      ? Math.round(
          migrations.reduce((sum, m) => sum + m.coverage_pct, 0) / migrations.length
        )
      : 0;

  return {
    patterns,
    failures: {
      stats: failureStats,
      unresolved,
    },
    migrations,
    summary: {
      total_patterns: patterns.length,
      total_migrations: migrations.length,
      avg_coverage: avgCoverage,
      total_failures: failureStats.total,
      unresolved_failures: failureStats.unresolved,
    },
  };
}

// ============================================================================
// Markdown Generation
// ============================================================================

function generateMarkdownDashboard(data: DashboardData): string {
  const now = new Date().toISOString().split('T')[0];

  let md = `# 📊 Migration Dashboard\n\n`;
  md += `> **Generated**: ${now}\n\n`;
  md += `---\n\n`;

  // Summary
  md += `## 🎯 Summary\n\n`;
  md += `| Metric | Value | Status |\n`;
  md += `|--------|-------|--------|\n`;
  md += `| Total Migrations | ${data.summary.total_migrations} | — |\n`;
  md += `| Avg Coverage | ${data.summary.avg_coverage}% | ${data.summary.avg_coverage >= 80 ? '✅' : '⚠️'} |\n`;
  md += `| Patterns Learned | ${data.summary.total_patterns} | ${data.summary.total_patterns >= 5 ? '✅' : '⚠️'} |\n`;
  md += `| Total Failures | ${data.summary.total_failures} | — |\n`;
  md += `| Unresolved Failures | ${data.summary.unresolved_failures} | ${data.summary.unresolved_failures === 0 ? '✅' : '❌'} |\n\n`;

  // Patterns
  if (data.patterns.length > 0) {
    md += `## 🔍 Top Patterns (${data.patterns.length})\n\n`;
    md += `| Pattern | Occurrences | Complexity | Category |\n`;
    md += `|---------|-------------|------------|----------|\n`;
    for (const pattern of data.patterns.slice(0, 10)) {
      md += `| ${pattern.pattern} | ${pattern.occurrences} | ${pattern.complexity} | ${pattern.category} |\n`;
    }
    md += `\n`;
  }

  // Recent Migrations
  if (data.migrations.length > 0) {
    md += `## 📦 Recent Migrations (Top 10)\n\n`;
    md += `| Program | Coverage | Date |\n`;
    md += `|---------|----------|------|\n`;
    for (const mig of data.migrations.slice(0, 10)) {
      const date = new Date(mig.timestamp).toISOString().split('T')[0];
      const coverage = `${mig.coverage_pct}%`;
      const status = mig.coverage_pct >= 80 ? '✅' : '⚠️';
      md += `| ${mig.program_id} - ${mig.program_name || 'Unknown'} | ${coverage} ${status} | ${date} |\n`;
    }
    md += `\n`;
  }

  // Failures
  if (data.failures.stats.total > 0) {
    md += `## ❌ Failures Overview\n\n`;
    md += `| Metric | Value |\n`;
    md += `|--------|-------|\n`;
    md += `| Total | ${data.failures.stats.total} |\n`;
    md += `| Unresolved | ${data.failures.stats.unresolved} |\n`;
    md += `| Avg Resolution | ${data.failures.stats.avgResolutionTime} min |\n\n`;

    // By phase
    md += `### Failures by Phase\n\n`;
    const sortedPhases = Object.entries(data.failures.stats.byPhase).sort(
      ([, a], [, b]) => b - a
    );
    for (const [phase, count] of sortedPhases.slice(0, 5)) {
      md += `- **${phase}**: ${count}\n`;
    }
    md += `\n`;

    // Unresolved
    if (data.failures.unresolved.length > 0) {
      md += `### ⚠️ Unresolved Failures (${data.failures.unresolved.length})\n\n`;
      for (const failure of data.failures.unresolved.slice(0, 5)) {
        md += `- Program ${failure.program_id} - ${failure.phase}: ${failure.error}\n`;
      }
      md += `\n`;
    }
  }

  // Quick Links
  md += `## 🔗 Quick Links\n\n`;
  md += `- [Patterns Dashboard](./patterns-dashboard.html)\n`;
  md += `- [Failures Report](./.migration-history/failures-dashboard.html)\n`;
  md += `- [Migration History](./.migration-history/)\n\n`;

  return md;
}

// ============================================================================
// HTML Generation
// ============================================================================

function generateHtmlDashboard(data: DashboardData): string {
  const now = new Date().toISOString().split('T')[0];

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Migration Dashboard</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      background: #f5f5f5;
      padding: 20px;
    }
    .container {
      max-width: 1400px;
      margin: 0 auto;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px;
      border-radius: 12px;
      margin-bottom: 30px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .header h1 {
      font-size: 2.5em;
      margin-bottom: 10px;
    }
    .stat-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .stat-card {
      background: white;
      padding: 25px;
      border-radius: 12px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      transition: transform 0.2s;
    }
    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    }
    .stat-value {
      font-size: 2.5em;
      font-weight: bold;
      color: #667eea;
      margin-bottom: 5px;
    }
    .stat-label {
      color: #666;
      font-size: 0.95em;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .stat-status {
      display: inline-block;
      margin-left: 10px;
      font-size: 1.2em;
    }
    .section {
      background: white;
      padding: 30px;
      border-radius: 12px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 30px;
    }
    .section h2 {
      color: #333;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #667eea;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th {
      background: #f8f9fa;
      padding: 12px;
      text-align: left;
      font-weight: 600;
      color: #495057;
      border-bottom: 2px solid #dee2e6;
    }
    td {
      padding: 12px;
      border-bottom: 1px solid #f0f0f0;
    }
    tr:hover {
      background: #f8f9fa;
    }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 0.85em;
      font-weight: 500;
    }
    .badge-low { background: #d1f4e0; color: #0f5132; }
    .badge-medium { background: #fff3cd; color: #997404; }
    .badge-high { background: #f8d7da; color: #842029; }
    .progress-bar {
      height: 8px;
      background: #e9ecef;
      border-radius: 4px;
      overflow: hidden;
      margin-top: 5px;
    }
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #10b981, #3b82f6);
      transition: width 0.3s;
    }
    .quick-links {
      display: flex;
      gap: 15px;
      flex-wrap: wrap;
    }
    .quick-link {
      display: inline-block;
      padding: 12px 24px;
      background: #667eea;
      color: white;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 500;
      transition: background 0.2s;
    }
    .quick-link:hover {
      background: #5568d3;
    }
    .empty-state {
      text-align: center;
      padding: 40px;
      color: #999;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 Migration Dashboard</h1>
      <p>Last updated: ${now}</p>
    </div>

    <div class="stat-grid">
      <div class="stat-card">
        <div class="stat-value">${data.summary.total_migrations}</div>
        <div class="stat-label">Migrations Completed</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">
          ${data.summary.avg_coverage}%
          <span class="stat-status">${data.summary.avg_coverage >= 80 ? '✅' : '⚠️'}</span>
        </div>
        <div class="stat-label">Average Coverage</div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${data.summary.avg_coverage}%"></div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-value">
          ${data.summary.total_patterns}
          <span class="stat-status">${data.summary.total_patterns >= 5 ? '✅' : '⚠️'}</span>
        </div>
        <div class="stat-label">Patterns Learned</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">
          ${data.summary.unresolved_failures}
          <span class="stat-status">${data.summary.unresolved_failures === 0 ? '✅' : '❌'}</span>
        </div>
        <div class="stat-label">Unresolved Failures</div>
      </div>
    </div>

    ${
      data.patterns.length > 0
        ? `
    <div class="section">
      <h2>🔍 Top Patterns (${data.patterns.length})</h2>
      <table>
        <thead>
          <tr>
            <th>Pattern</th>
            <th>Occurrences</th>
            <th>Complexity</th>
            <th>Category</th>
          </tr>
        </thead>
        <tbody>
          ${data.patterns
            .slice(0, 10)
            .map(
              (p) => `
            <tr>
              <td><code>${p.pattern}</code></td>
              <td><strong>${p.occurrences}</strong></td>
              <td><span class="badge badge-${p.complexity.toLowerCase()}">${p.complexity}</span></td>
              <td>${p.category}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    </div>
    `
        : ''
    }

    ${
      data.migrations.length > 0
        ? `
    <div class="section">
      <h2>📦 Recent Migrations</h2>
      <table>
        <thead>
          <tr>
            <th>Program</th>
            <th>Coverage</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          ${data.migrations
            .slice(0, 10)
            .map((m) => {
              const date = new Date(m.timestamp).toISOString().split('T')[0];
              const status = m.coverage_pct >= 80 ? '✅' : '⚠️';
              return `
            <tr>
              <td><strong>${m.program_id}</strong> - ${m.program_name || 'Unknown'}</td>
              <td>
                ${m.coverage_pct}% ${status}
                <div class="progress-bar">
                  <div class="progress-fill" style="width: ${m.coverage_pct}%"></div>
                </div>
              </td>
              <td>${date}</td>
            </tr>
          `;
            })
            .join('')}
        </tbody>
      </table>
    </div>
    `
        : ''
    }

    ${
      data.failures.stats.total > 0
        ? `
    <div class="section">
      <h2>❌ Failures Overview</h2>
      <div class="stat-grid">
        <div class="stat-card">
          <div class="stat-value">${data.failures.stats.total}</div>
          <div class="stat-label">Total Failures</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${data.failures.stats.unresolved}</div>
          <div class="stat-label">Unresolved</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${data.failures.stats.avgResolutionTime}m</div>
          <div class="stat-label">Avg Resolution Time</div>
        </div>
      </div>
    </div>
    `
        : ''
    }

    <div class="section">
      <h2>🔗 Quick Links</h2>
      <div class="quick-links">
        <a href="./patterns-dashboard.html" class="quick-link">📋 Patterns Dashboard</a>
        <a href="./.migration-history/" class="quick-link">📁 Migration History</a>
        <a href="./.openspec/improvement-plan-robustesse.md" class="quick-link">📈 Improvement Plan</a>
      </div>
    </div>
  </div>
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
      format: { type: 'string', default: 'html' },
      output: { type: 'string' },
    },
  });

  const format = (values.format || 'html') as DashboardFormat;
  const output = values.output as string | undefined;

  // Get history directory
  const historyDir = path.resolve(process.cwd(), '../../.migration-history');

  if (!fs.existsSync(historyDir)) {
    console.error('❌ Migration history directory not found:', historyDir);
    process.exit(1);
  }

  console.log('📊 Generating migration dashboard...\n');

  // Load all data
  const data = loadDashboardData(historyDir);

  console.log(`✓ Loaded ${data.patterns.length} patterns`);
  console.log(`✓ Loaded ${data.migrations.length} migrations`);
  console.log(`✓ Loaded ${data.failures.stats.total} failures\n`);

  // Generate dashboard
  const dashboard =
    format === 'html'
      ? generateHtmlDashboard(data)
      : generateMarkdownDashboard(data);

  // Write or print
  if (output) {
    fs.writeFileSync(output, dashboard, 'utf8');
    console.log(`✓ Dashboard saved: ${output}`);
  } else {
    console.log(dashboard);
  }
}

main().catch((error) => {
  console.error('❌ Failed to generate dashboard:', error);
  process.exit(1);
});
