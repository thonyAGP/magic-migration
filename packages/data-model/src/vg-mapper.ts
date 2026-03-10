/**
 * VG Mapper - Global Variables Documentation
 * Maps 40 VG variables used across ADH programs
 */

import fs from 'node:fs';
import path from 'node:path';
import type { GlobalVarMapping, VgRegistry, VgRegistryEntry } from './types.js';

export const VG_MAPPINGS: GlobalVarMapping[] = [
  { vgId: 38, name: 'VG_LANGUAGE', type: 'ALPHA', description: 'Code langue (FR, EN, ES)', usedInPrograms: [42, 43] },
  { vgId: 60, name: 'VG_USER_RIGHTS', type: 'NUMERIC', description: 'Droits utilisateur', usedInPrograms: [121, 131] },
  { vgId: 63, name: 'VG_SESSION_ID', type: 'NUMERIC', description: 'ID session caisse', usedInPrograms: [121, 131, 237] },
];

export const mapGlobalVar = (vgId: number): GlobalVarMapping | undefined => {
  return VG_MAPPINGS.find(v => v.vgId === vgId);
};

export const getAllGlobalVars = (): GlobalVarMapping[] => {
  return VG_MAPPINGS;
};

/**
 * Build VG Registry by scanning all program files
 *
 * VG are defined as Columns in Prg_1.xml (main program) with name="VG.*"
 * Then referenced in other programs via Column references
 */
export const buildVgRegistry = (programsDir: string): VgRegistry => {
  // Verify directory exists
  if (!fs.existsSync(programsDir)) {
    throw new Error(`Programs directory not found: ${programsDir}`);
  }

  // Step 1: Parse Prg_1.xml to extract VG definitions
  const vgMap = new Map<number, VgRegistryEntry>();
  const prg1Path = path.join(programsDir, 'Prg_1.xml');

  if (fs.existsSync(prg1Path)) {
    const xml = fs.readFileSync(prg1Path, 'utf-8');

    // Extract VG columns: <Column id="X" name="VG.*">
    const vgMatches = xml.matchAll(/<Column id="(\d+)" name="(VG[^"]+)"/g);

    for (const match of vgMatches) {
      const vgId = parseInt(match[1], 10);
      const vgFullName = match[2];

      // Extract type from PropertyList (FIELD_UNICODE, FIELD_NUMERIC, etc.)
      const typeMatch = xml.match(new RegExp(
        `<Column id="${vgId}"[^>]*>[\\s\\S]{0,500}attr_obj="FIELD_(\\w+)"`,
        'm'
      ));
      const magicType = typeMatch ? typeMatch[1] : 'ALPHA';

      vgMap.set(vgId, {
        vgId,
        name: vgFullName,
        type: mapMagicFieldType(magicType),
        category: categorizeVg(vgId),
        definedIn: [1],
        usedIn: [],
      });
    }
  }

  // Step 2: Scan all other programs to find VG usages
  const files = fs.readdirSync(programsDir).filter(f => f.match(/^Prg_\d+\.xml$/));

  for (const file of files) {
    const progId = parseInt(file.match(/Prg_(\d+)\.xml/)![1], 10);
    if (progId === 1) continue; // Skip Prg_1 (already processed)

    const xmlPath = path.join(programsDir, file);
    const xml = fs.readFileSync(xmlPath, 'utf-8');

    // Find VG column references
    for (const [vgId, entry] of vgMap.entries()) {
      // Check if this VG is referenced in the program
      // Pattern: <Column id="X" where X is a VG ID
      if (xml.includes(`<Column id="${vgId}"`)) {
        if (!entry.usedIn.includes(progId)) {
          entry.usedIn.push(progId);
        }
      }
    }
  }

  return {
    generated: new Date().toISOString(),
    totalVars: vgMap.size,
    variables: Array.from(vgMap.values()).sort((a, b) => a.vgId - b.vgId),
  };
};

const mapMagicFieldType = (fieldType: string): string => {
  const typeMap: Record<string, string> = {
    'UNICODE': 'UNICODE',
    'ALPHA': 'ALPHA',
    'NUMERIC': 'NUMERIC',
    'LOGICAL': 'LOGICAL',
    'DATE': 'DATE',
    'TIME': 'TIME',
    'BLOB': 'BLOB',
    'MEMO': 'MEMO',
  };
  return typeMap[fieldType] ?? 'ALPHA';
};

const categorizeVg = (vgId: number): VgRegistryEntry['category'] => {
  // Known VG categorization based on ADH knowledge
  if (vgId === 38 || vgId === 60 || vgId === 63) return 'SESSION';
  if (vgId === 78) return 'CONFIG';
  if (vgId >= 100 && vgId < 200) return 'BUSINESS';
  return 'UNKNOWN';
};
