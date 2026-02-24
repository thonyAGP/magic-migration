#!/usr/bin/env tsx
/**
 * Generate patterns learned dashboard.
 *
 * Reads all patterns from .migration-history/patterns/ and generates
 * an HTML dashboard showing pattern usage, recommendations, and stats.
 *
 * Usage:
 *   tsx scripts/generate-patterns-dashboard.ts --output patterns-dashboard.html
 */

import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import YAML from 'yaml';

interface PatternExample {
  program_id: number;
  program_name: string;
  contract_file: string;
  rule_id: string;
  expr_id: string;
  formula: string;
  mapped_to?: string;
  test_file?: string;
  verified?: boolean;
  notes?: string;
}

interface Pattern {
  pattern: string;
  description: string;
  category: string;
  occurrences: number;
  first_seen: string;
  last_seen: string;
  complexity: string;
  migration_difficulty: string;
  examples: PatternExample[];
  modern_equivalent?: {
    typescript?: string;
    react?: string;
    notes?: string;
  };
  variations?: Array<{
    variation: string;
    description: string;
    modern: string;
  }>;
  related_patterns?: string[];
}

interface Options {
  patternsDir: string;
  output: string;
  format: 'html' | 'markdown';
  verbose: boolean;
}

const parseOptions = (): Options => {
  const { values } = parseArgs({
    options: {
      'patterns-dir': {
        type: 'string',
        short: 'p',
        default: '../../.migration-history/patterns',
      },
      output: { type: 'string', short: 'o', default: 'patterns-dashboard.html' },
      format: { type: 'string', short: 'f', default: 'html' },
      verbose: { type: 'boolean', short: 'v', default: false },
      help: { type: 'boolean', short: 'h' },
    },
  });

  if (values.help) {
    console.log(`
Usage: tsx scripts/generate-patterns-dashboard.ts [options]

Options:
  -p, --patterns-dir <path>   Patterns directory (default: ../../.migration-history/patterns)
  -o, --output <file>         Output file (default: patterns-dashboard.html)
  -f, --format <type>         Output format: html or markdown (default: html)
  -v, --verbose               Verbose output
  -h, --help                  Show this help message
`);
    process.exit(0);
  }

  return {
    patternsDir: values['patterns-dir'] as string,
    output: values.output as string,
    format: (values.format as 'html' | 'markdown') || 'html',
    verbose: values.verbose as boolean,
  };
};

const loadPatterns = (patternsDir: string): Pattern[] => {
  const dir = path.resolve(patternsDir);

  if (!fs.existsSync(dir)) {
    console.error(`❌ Patterns directory not found: ${dir}`);
    return [];
  }

  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.yaml') && !f.includes('TEMPLATE'));

  const patterns: Pattern[] = [];

  for (const file of files) {
    try {
      const content = fs.readFileSync(path.join(dir, file), 'utf8');
      const pattern = YAML.parse(content) as Pattern;
      patterns.push(pattern);
    } catch (error) {
      console.error(`⚠️  Failed to parse ${file}:`, error);
    }
  }

  return patterns;
};

const generateHTML = (patterns: Pattern[]): string => {
  const totalOccurrences = patterns.reduce((sum, p) => sum + p.occurrences, 0);
  const avgOccurrences = (totalOccurrences / patterns.length).toFixed(1);

  const patternsByCategory = patterns.reduce((acc, p) => {
    const cat = p.category || 'other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(p);
    return acc;
  }, {} as Record<string, Pattern[]>);

  const patternsHTML = patterns
    .sort((a, b) => b.occurrences - a.occurrences)
    .map(
      (p, idx) => `
    <div class="pattern-card">
      <div class="pattern-header">
        <h3>
          <span class="pattern-rank">#${idx + 1}</span>
          ${p.description}
        </h3>
        <span class="badge badge-${p.category}">${p.category}</span>
      </div>

      <div class="pattern-formula">
        <code>${p.pattern}</code>
      </div>

      <div class="pattern-stats">
        <div class="stat">
          <span class="stat-label">Occurrences</span>
          <span class="stat-value">${p.occurrences}</span>
        </div>
        <div class="stat">
          <span class="stat-label">Complexity</span>
          <span class="stat-value complexity-${p.complexity.toLowerCase()}">${p.complexity}</span>
        </div>
        <div class="stat">
          <span class="stat-label">Migration</span>
          <span class="stat-value difficulty-${p.migration_difficulty.toLowerCase()}">${p.migration_difficulty}</span>
        </div>
      </div>

      <div class="pattern-modern">
        <h4>Modern Equivalent</h4>
        ${
          p.modern_equivalent?.typescript
            ? `<pre><code class="language-typescript">${escapeHtml(p.modern_equivalent.typescript)}</code></pre>`
            : '<p>No TypeScript example available</p>'
        }
        ${p.modern_equivalent?.notes ? `<p class="notes">${p.modern_equivalent.notes}</p>` : ''}
      </div>

      <details class="pattern-details">
        <summary>Examples (${p.examples.length})</summary>
        <table>
          <thead>
            <tr>
              <th>Program</th>
              <th>Rule</th>
              <th>Formula</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${p.examples
              .map(
                (ex) => `
              <tr>
                <td>${ex.program_id} - ${ex.program_name}</td>
                <td>${ex.rule_id}</td>
                <td><code>${escapeHtml(ex.formula)}</code></td>
                <td>${ex.verified ? '✅ Verified' : '⏳ Pending'}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </details>

      ${
        p.variations && p.variations.length > 0
          ? `
        <details class="pattern-variations">
          <summary>Variations (${p.variations.length})</summary>
          <ul>
            ${p.variations
              .map(
                (v) => `
              <li>
                <code>${escapeHtml(v.variation)}</code>
                <p>${v.description}</p>
                <pre><code>${escapeHtml(v.modern)}</code></pre>
              </li>
            `
              )
              .join('')}
          </ul>
        </details>
      `
          : ''
      }
    </div>
  `
    )
    .join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Migration Patterns Dashboard</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #f5f5f5;
    }
    .container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 3rem 2rem;
      margin: -2rem -2rem 2rem -2rem;
      border-radius: 0 0 1rem 1rem;
    }
    .header h1 { font-size: 2.5rem; margin-bottom: 0.5rem; }
    .header p { opacity: 0.9; font-size: 1.1rem; }

    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .summary-card {
      background: white;
      padding: 1.5rem;
      border-radius: 0.5rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .summary-card h3 { color: #667eea; font-size: 1rem; margin-bottom: 0.5rem; }
    .summary-card .value { font-size: 2rem; font-weight: bold; color: #333; }
    .summary-card .label { font-size: 0.875rem; color: #666; }

    .pattern-card {
      background: white;
      padding: 2rem;
      margin-bottom: 1.5rem;
      border-radius: 0.5rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .pattern-header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 1rem;
    }
    .pattern-header h3 { font-size: 1.25rem; color: #333; }
    .pattern-rank {
      display: inline-block;
      background: #667eea;
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 1rem;
      font-size: 0.875rem;
      margin-right: 0.5rem;
    }

    .badge {
      padding: 0.25rem 0.75rem;
      border-radius: 0.25rem;
      font-size: 0.875rem;
      font-weight: 500;
    }
    .badge-conditional { background: #dbeafe; color: #1e40af; }
    .badge-validation { background: #fef3c7; color: #92400e; }
    .badge-other { background: #e5e7eb; color: #374151; }

    .pattern-formula {
      background: #f9fafb;
      padding: 1rem;
      border-radius: 0.375rem;
      border-left: 4px solid #667eea;
      margin-bottom: 1rem;
    }
    .pattern-formula code {
      font-family: "Courier New", monospace;
      font-size: 1rem;
      color: #667eea;
    }

    .pattern-stats {
      display: flex;
      gap: 2rem;
      margin-bottom: 1.5rem;
      padding: 1rem;
      background: #f9fafb;
      border-radius: 0.375rem;
    }
    .stat { text-align: center; }
    .stat-label {
      display: block;
      font-size: 0.875rem;
      color: #666;
      margin-bottom: 0.25rem;
    }
    .stat-value {
      display: block;
      font-size: 1.5rem;
      font-weight: bold;
      color: #333;
    }
    .complexity-low, .difficulty-low { color: #10b981; }
    .complexity-medium, .difficulty-medium { color: #f59e0b; }
    .complexity-high, .difficulty-high { color: #ef4444; }

    .pattern-modern { margin-bottom: 1.5rem; }
    .pattern-modern h4 {
      font-size: 1rem;
      margin-bottom: 0.5rem;
      color: #667eea;
    }
    .pattern-modern pre {
      background: #1e293b;
      color: #e2e8f0;
      padding: 1rem;
      border-radius: 0.375rem;
      overflow-x: auto;
      font-size: 0.875rem;
    }
    .pattern-modern .notes {
      margin-top: 0.5rem;
      font-size: 0.875rem;
      color: #666;
      font-style: italic;
    }

    details { margin-top: 1rem; }
    summary {
      cursor: pointer;
      padding: 0.75rem;
      background: #f9fafb;
      border-radius: 0.375rem;
      font-weight: 500;
      user-select: none;
    }
    summary:hover { background: #f3f4f6; }

    table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
    th, td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #e5e7eb; }
    th { background: #f9fafb; font-weight: 600; color: #374151; }
    tr:hover { background: #f9fafb; }

    .pattern-variations ul { list-style: none; margin-top: 1rem; }
    .pattern-variations li {
      padding: 1rem;
      background: #f9fafb;
      border-radius: 0.375rem;
      margin-bottom: 0.5rem;
    }
    .pattern-variations li code {
      background: #e5e7eb;
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      font-size: 0.875rem;
    }
    .pattern-variations li p {
      margin: 0.5rem 0;
      font-size: 0.875rem;
      color: #666;
    }
    .pattern-variations li pre {
      margin-top: 0.5rem;
      background: #1e293b;
      color: #e2e8f0;
      padding: 0.75rem;
      border-radius: 0.375rem;
      font-size: 0.875rem;
    }

    .footer {
      text-align: center;
      padding: 2rem;
      color: #666;
      font-size: 0.875rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 Migration Patterns Dashboard</h1>
      <p>Learned patterns from Magic to Modern migration</p>
      <p style="font-size: 0.875rem; opacity: 0.8; margin-top: 0.5rem;">
        Generated: ${new Date().toLocaleString()}
      </p>
    </div>

    <div class="summary">
      <div class="summary-card">
        <h3>Total Patterns</h3>
        <div class="value">${patterns.length}</div>
        <div class="label">Documented patterns</div>
      </div>
      <div class="summary-card">
        <h3>Total Occurrences</h3>
        <div class="value">${totalOccurrences}</div>
        <div class="label">Across all programs</div>
      </div>
      <div class="summary-card">
        <h3>Avg Occurrences</h3>
        <div class="value">${avgOccurrences}</div>
        <div class="label">Per pattern</div>
      </div>
      <div class="summary-card">
        <h3>Categories</h3>
        <div class="value">${Object.keys(patternsByCategory).length}</div>
        <div class="label">Pattern categories</div>
      </div>
    </div>

    ${patternsHTML}

    <div class="footer">
      <p>🎨 Generated by factory-cli patterns dashboard generator</p>
      <p>📁 Source: .migration-history/patterns/</p>
    </div>
  </div>
</body>
</html>
  `;
};

const escapeHtml = (text: string): string => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

const generateMarkdown = (patterns: Pattern[]): string => {
  const totalOccurrences = patterns.reduce((sum, p) => sum + p.occurrences, 0);

  let md = `# Migration Patterns Dashboard\n\n`;
  md += `> Learned patterns from Magic to Modern migration\n\n`;
  md += `**Generated**: ${new Date().toLocaleString()}\n\n`;
  md += `---\n\n`;

  md += `## Summary\n\n`;
  md += `| Metric | Value |\n`;
  md += `|--------|-------|\n`;
  md += `| Total Patterns | ${patterns.length} |\n`;
  md += `| Total Occurrences | ${totalOccurrences} |\n`;
  md += `| Avg Occurrences | ${(totalOccurrences / patterns.length).toFixed(1)} |\n\n`;

  md += `---\n\n`;

  patterns
    .sort((a, b) => b.occurrences - a.occurrences)
    .forEach((p, idx) => {
      md += `## ${idx + 1}. ${p.description}\n\n`;
      md += `**Pattern**: \`${p.pattern}\`\n\n`;
      md += `**Category**: ${p.category}\n\n`;
      md += `| Metric | Value |\n`;
      md += `|--------|-------|\n`;
      md += `| Occurrences | ${p.occurrences} |\n`;
      md += `| Complexity | ${p.complexity} |\n`;
      md += `| Migration Difficulty | ${p.migration_difficulty} |\n\n`;

      if (p.modern_equivalent?.typescript) {
        md += `### Modern Equivalent\n\n`;
        md += `\`\`\`typescript\n${p.modern_equivalent.typescript}\`\`\`\n\n`;
      }

      if (p.examples.length > 0) {
        md += `### Examples\n\n`;
        md += `| Program | Rule | Formula | Status |\n`;
        md += `|---------|------|---------|--------|\n`;
        p.examples.forEach((ex) => {
          md += `| ${ex.program_id} - ${ex.program_name} | ${ex.rule_id} | \`${ex.formula}\` | ${ex.verified ? '✅' : '⏳'} |\n`;
        });
        md += `\n`;
      }

      md += `---\n\n`;
    });

  return md;
};

const main = async (): Promise<void> => {
  const options = parseOptions();

  console.log('📊 Generating patterns dashboard...\n');

  if (options.verbose) {
    console.log('Options:', options, '\n');
  }

  // Load patterns
  const patterns = loadPatterns(options.patternsDir);

  if (patterns.length === 0) {
    console.warn('⚠️  No patterns found');
    process.exit(0);
  }

  console.log(`✓ Loaded ${patterns.length} patterns\n`);

  // Generate output
  const content =
    options.format === 'html' ? generateHTML(patterns) : generateMarkdown(patterns);

  // Write output
  const outputPath = path.resolve(options.output);
  fs.writeFileSync(outputPath, content, 'utf8');

  console.log(`✓ Dashboard generated: ${outputPath}`);
  console.log(`  Format: ${options.format.toUpperCase()}`);
  console.log(`  Patterns: ${patterns.length}`);
  console.log(`  Total occurrences: ${patterns.reduce((sum, p) => sum + p.occurrences, 0)}`);
  console.log('');
  console.log('📝 Open in browser:');
  if (options.format === 'html') {
    console.log(`  file://${outputPath}`);
  }
};

main().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
