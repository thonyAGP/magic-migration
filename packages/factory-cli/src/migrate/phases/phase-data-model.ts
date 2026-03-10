/**
 * Phase DATA_MODEL - Infer database schema and relations
 * 3 passes: Schema (95%) → Relations (80%) → Semantic (30% AI)
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import type { ProgramIR } from '@magic-migration/parser';
import { extractSchema, inferRelations, enrichTableNames, generatePrismaSchema, extractBusinessRules } from '@magic-migration/data-model';
import type { MigrateConfig } from '../migrate-types.js';

export interface DataModelResult {
  success: boolean;
  tablesCount: number;
  relationsCount: number;
  rulesCount: number;
  schemaPath?: string;
  rulesPath?: string;
  duration: number;
}

export const runDataModelPhase = async (
  programIds: number[],
  config: MigrateConfig
): Promise<DataModelResult> => {
  const start = Date.now();

  try {
    const programs: ProgramIR[] = [];
    
    for (const id of programIds) {
      const irPath = path.join(config.projectDir, '.factory', 'programs', `IDE-${id}`, 'ir.json');
      if (fs.existsSync(irPath)) {
        const ir = JSON.parse(fs.readFileSync(irPath, 'utf-8'));
        programs.push(ir);
      }
    }

    const tables = extractSchema(programs);
    const relations = inferRelations(tables);
    const enriched = enrichTableNames(tables);
    const schema = generatePrismaSchema(enriched, relations);

    const outputDir = path.join(config.projectDir, '.factory', 'data-model');
    fs.mkdirSync(outputDir, { recursive: true });

    const schemaPath = path.join(outputDir, 'schema.prisma');
    fs.writeFileSync(schemaPath, schema, 'utf-8');
    fs.writeFileSync(path.join(outputDir, 'tables.json'), JSON.stringify(enriched, null, 2));
    fs.writeFileSync(path.join(outputDir, 'relations.json'), JSON.stringify(relations, null, 2));

    // Pass 4: Business rules extraction (per program)
    let totalRules = 0;
    let rulesPath: string | undefined;
    for (const ir of programs) {
      const rules = extractBusinessRules(ir);
      totalRules += rules.summary.total;
      const programDir = path.join(config.projectDir, '.factory', 'programs', `IDE-${ir.id}`);
      fs.mkdirSync(programDir, { recursive: true });
      rulesPath = path.join(programDir, 'rules.json');
      fs.writeFileSync(rulesPath, JSON.stringify(rules, null, 2));
    }

    console.log(`[phase-data-model] ${tables.length} tables, ${relations.length} relations, ${totalRules} business rules`);

    return {
      success: true,
      tablesCount: tables.length,
      relationsCount: relations.length,
      rulesCount: totalRules,
      schemaPath,
      rulesPath,
      duration: Date.now() - start,
    };
  } catch (err: unknown) {
    console.error('[phase-data-model] Error:', err);
    return {
      success: false,
      tablesCount: 0,
      relationsCount: 0,
      rulesCount: 0,
      duration: Date.now() - start,
    };
  }
};
