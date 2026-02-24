/**
 * SWARM Analyze Command
 *
 * Analyze complexity of a contract
 */

import { parseContract } from '../../core/contract.js';
import { calculateComplexity } from '../../swarm/complexity-calculator.js';
import { writeFileSync } from 'node:fs';

export interface SwarmAnalyzeOptions {
  contract: string;
  format?: 'text' | 'json';
  output?: string;
}

/**
 * Analyze contract complexity
 */
export async function analyzeComplexity(
  options: SwarmAnalyzeOptions,
): Promise<void> {
  try {
    // Parse contract
    console.log(`[SWARM] Loading contract: ${options.contract}`);
    const contract = parseContract(options.contract);

    // Calculate complexity (cast to ExtendedMigrationContract)
    const complexity = calculateComplexity(contract as any);

    // Format output
    if (options.format === 'json') {
      const output = JSON.stringify(complexity, null, 2);

      if (options.output) {
        writeFileSync(options.output, output);
        console.log(`[SWARM] Analysis written to ${options.output}`);
      } else {
        console.log(output);
      }
    } else {
      // Text format
      console.log(
        `\nComplexity Analysis for ${contract.program.name} (${contract.program.id})`,
      );
      console.log(`\nScore: ${complexity.score}/100`);
      console.log(`Level: ${complexity.level}`);
      console.log(
        `SWARM Recommended: ${complexity.useSwarm ? '✅ Yes' : '❌ No'}`,
      );
      console.log(
        `Double Vote Required: ${complexity.requiresDoubleVote ? '✅ Yes' : '❌ No'}`,
      );

      console.log(`\nIndicators:`);
      console.log(`  • Expressions: ${complexity.indicators.expressionCount}`);
      console.log(`  • Tables: ${complexity.indicators.tableCount}`);
      console.log(`  • Nesting depth: ${complexity.indicators.nestingDepth}`);
      console.log(
        `  • Business logic: ${complexity.indicators.hasBusinessLogic ? '✅' : '❌'}`,
      );
      console.log(
        `  • State management: ${complexity.indicators.hasStateManagement ? '✅' : '❌'}`,
      );
      console.log(
        `  • External integrations: ${complexity.indicators.hasExternalIntegrations ? '✅' : '❌'}`,
      );
      console.log(
        `  • Critical program: ${complexity.indicators.isCritical ? '⚠️ YES' : '❌'}`,
      );

      console.log(`\nExplanation:`);
      console.log(`  ${complexity.explanation}`);
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(`[ERROR] ${error.message}`);
    } else {
      console.error('[ERROR] Unknown error occurred');
    }
    process.exit(1);
  }
}
