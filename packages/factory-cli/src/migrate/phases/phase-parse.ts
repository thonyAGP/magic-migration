/**
 * Phase PARSE - Convert Magic XML to Intermediate Representation
 * 100% deterministic, zero AI calls
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { buildProgramIR } from '@magic-migration/parser';
import type { MigrateConfig } from '../migrate-types.js';

export interface ParsePhaseResult {
  success: boolean;
  irPath?: string;
  duration: number;
  errors: string[];
}

/**
 * Parse Magic program to IR and save to .factory/programs/IDE-XXX/ir.json
 */
export const runParsePhase = async (
  programId: number,
  config: MigrateConfig
): Promise<ParsePhaseResult> => {
  const start = Date.now();
  const errors: string[] = [];

  try {
    // Construct paths
    const xmlFileName = `Prg_${programId}.xml`;
    const xmlPath = path.join(config.projectDir, 'sources', xmlFileName);
    
    if (!fs.existsSync(xmlPath)) {
      errors.push(`XML file not found: ${xmlPath}`);
      return { success: false, duration: Date.now() - start, errors };
    }

    // Parse to IR
    const result = buildProgramIR(programId, xmlPath);
    
    if (result.errors.length > 0) {
      errors.push(...result.errors.map(e => e.message));
    }

    // Save IR to .factory/programs/IDE-XXX/
    const irDir = path.join(config.projectDir, '.factory', 'programs', `IDE-${programId}`);
    fs.mkdirSync(irDir, { recursive: true });
    
    const irPath = path.join(irDir, 'ir.json');
    fs.writeFileSync(irPath, JSON.stringify(result.ir, null, 2), 'utf-8');

    console.log(`[phase-parse] Parsed IDE ${programId} in ${result.duration}ms → ${irPath}`);

    return {
      success: result.errors.length === 0,
      irPath,
      duration: Date.now() - start,
      errors,
    };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    errors.push(errMsg);
    
    return {
      success: false,
      duration: Date.now() - start,
      errors,
    };
  }
};
