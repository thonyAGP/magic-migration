#!/usr/bin/env tsx
/**
 * Enrich migration contracts with legacy expression tracing.
 *
 * This script adds the `legacy_expressions` field to each rule in a contract,
 * mapping legacy Magic expressions to their modern implementation and tests.
 *
 * Usage:
 *   tsx scripts/enrich-contract-expressions.ts --contract <path> --magic-project <path>
 *
 * Example:
 *   tsx scripts/enrich-contract-expressions.ts \
 *     --contract .openspec/migration/ADH/ADH-IDE-48.contract.yaml \
 *     --magic-project D:/Magic/ADH/ADH.edp
 */

import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import YAML from 'yaml';
import type { MigrationContract } from '../src/core/contract.js';

/**
 * Extended rule with legacy expressions field.
 */
interface EnrichedContractRule {
  id: string;
  description: string;
  condition: string;
  variables: string[];
  status: 'IMPL' | 'MISSING' | 'PARTIAL';
  target_file: string;
  gap_notes: string;
  legacy_expressions?: LegacyExpression[];
}

/**
 * Legacy expression trace linking Magic to modern code.
 */
interface LegacyExpression {
  expr_id: string; // "Prg_48:Task_2:Line_5:Expr_10"
  formula: string; // "IF({0,3}='E',Msg('Error'))"
  location: {
    program_id: number;
    task_id: number;
    line_id: number;
    expr_id: number;
  };
  mapped_to?: string; // "src/validation.ts:42"
  test_file?: string; // "tests/validation.test.ts:15"
  verified: boolean;
  notes?: string;
}

interface Options {
  contract: string;
  magicProject?: string;
  outputDir?: string;
  dryRun: boolean;
  verbose: boolean;
}

const parseOptions = (): Options => {
  const { values } = parseArgs({
    options: {
      contract: { type: 'string', short: 'c' },
      'magic-project': { type: 'string', short: 'm' },
      'output-dir': { type: 'string', short: 'o' },
      'dry-run': { type: 'boolean', default: false },
      verbose: { type: 'boolean', short: 'v', default: false },
      help: { type: 'boolean', short: 'h' },
    },
  });

  if (values.help) {
    console.log(`
Usage: tsx scripts/enrich-contract-expressions.ts [options]

Options:
  -c, --contract <path>         Path to contract YAML file (required)
  -m, --magic-project <path>    Path to Magic project (.edp file)
  -o, --output-dir <path>       Output directory for modern code (default: ../adh-web/src)
  --dry-run                     Show what would be done without writing files
  -v, --verbose                 Verbose output
  -h, --help                    Show this help message

Example:
  tsx scripts/enrich-contract-expressions.ts \\
    --contract .openspec/migration/ADH/ADH-IDE-48.contract.yaml \\
    --magic-project D:/Magic/ADH/ADH.edp \\
    --output-dir ../adh-web/src
`);
    process.exit(0);
  }

  if (!values.contract) {
    console.error('❌ Error: --contract is required');
    process.exit(1);
  }

  return {
    contract: values.contract as string,
    magicProject: values['magic-project'] as string | undefined,
    outputDir: (values['output-dir'] as string) || '../adh-web/src',
    dryRun: values['dry-run'] as boolean,
    verbose: values.verbose as boolean,
  };
};

/**
 * Extract expressions from Magic program XML.
 *
 * NOTE: This requires access to Magic source XML files.
 * If not available, expressions must be added manually.
 */
const extractExpressionsFromMagicProgram = (
  programId: number,
  magicProjectPath?: string
): LegacyExpression[] => {
  if (!magicProjectPath) {
    console.warn(
      '⚠️  No Magic project path provided. Expressions must be added manually.'
    );
    return [];
  }

  // TODO: Implement Magic XML parsing
  // This would use magic_get_line, magic_decode_expression, etc.
  // For now, return empty array
  console.warn(`⚠️  Magic XML parsing not implemented yet for program ${programId}`);
  return [];
};

/**
 * Create template legacy expressions for manual enrichment.
 */
const createTemplateExpressions = (rule: EnrichedContractRule): LegacyExpression[] => {
  // Extract condition formula from rule
  const formula = rule.condition;

  return [
    {
      expr_id: 'Prg_XXX:Task_YYY:Line_ZZZ:Expr_NNN', // To be filled manually
      formula: formula,
      location: {
        program_id: 0, // To be filled
        task_id: 0,
        line_id: 0,
        expr_id: 0,
      },
      mapped_to: rule.target_file ? `${rule.target_file}:0` : '',
      test_file: '', // To be filled when tests are written
      verified: false,
      notes: 'TODO: Fill location, mapped_to line number, and test_file',
    },
  ];
};

/**
 * Enrich contract with legacy expressions.
 */
const enrichContract = (
  contract: MigrationContract,
  magicProjectPath?: string
): MigrationContract => {
  const enrichedRules = contract.rules.map((rule) => {
    const enrichedRule = rule as unknown as EnrichedContractRule;

    // Skip if already enriched
    if (enrichedRule.legacy_expressions && enrichedRule.legacy_expressions.length > 0) {
      return enrichedRule;
    }

    // Try to extract from Magic source
    let expressions = extractExpressionsFromMagicProgram(
      contract.program.id as number,
      magicProjectPath
    );

    // If no Magic source, create template for manual enrichment
    if (expressions.length === 0) {
      expressions = createTemplateExpressions(enrichedRule);
    }

    enrichedRule.legacy_expressions = expressions;
    return enrichedRule;
  });

  return {
    ...contract,
    rules: enrichedRules as never[],
  };
};

/**
 * Main execution.
 */
const main = async (): Promise<void> => {
  const options = parseOptions();

  console.log('🔍 Enriching contract with legacy expressions...\n');

  if (options.verbose) {
    console.log('Options:', options, '\n');
  }

  // Read contract
  if (!fs.existsSync(options.contract)) {
    console.error(`❌ Contract file not found: ${options.contract}`);
    process.exit(1);
  }

  const contractYaml = fs.readFileSync(options.contract, 'utf8');
  const contract = YAML.parse(contractYaml) as MigrationContract;

  console.log(`📄 Contract: ${path.basename(options.contract)}`);
  console.log(`   Program: ${contract.program.id} - ${contract.program.name || '(unnamed)'}`);
  console.log(`   Rules: ${contract.rules.length}`);
  console.log(`   Expressions: ${contract.program.expressions_count || 'unknown'}\n`);

  // Enrich
  const enriched = enrichContract(contract, options.magicProject);

  // Count enriched rules
  const enrichedCount = enriched.rules.filter((r) => {
    const er = r as unknown as EnrichedContractRule;
    return er.legacy_expressions && er.legacy_expressions.length > 0;
  }).length;

  console.log(`✅ Enriched ${enrichedCount}/${enriched.rules.length} rules with legacy expressions\n`);

  // Write output
  if (options.dryRun) {
    console.log('🔍 DRY RUN - Would write to:', options.contract);
    console.log('\nSample enriched rule:');
    const sampleRule = enriched.rules[0] as unknown as EnrichedContractRule;
    console.log(YAML.stringify({ rule: sampleRule }, { indent: 2 }));
  } else {
    const outputYaml = YAML.stringify(enriched, { indent: 2 });
    fs.writeFileSync(options.contract, outputYaml, 'utf8');
    console.log(`💾 Contract enriched and saved to: ${options.contract}`);
  }

  console.log('\n📝 Next steps:');
  console.log('   1. Review the enriched contract and fill in TODO items');
  console.log('   2. Update expr_id with actual Magic locations');
  console.log('   3. Update mapped_to with correct line numbers');
  console.log('   4. Add test_file references when tests are written');
  console.log('   5. Run: pnpm test:expression-coverage to verify');
};

main().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
