/**
 * Magic Unipaas adapter: wraps existing build-graph.mjs and spec files.
 * Reads live-programs.json and contract YAML files from .openspec/migration/.
 */

import fs from 'node:fs';
import path from 'node:path';
import type {
  SpecExtractor, ProgramGraph, MigrationContract, Program, ProgramSource,
} from '../core/types.js';
import { parseContract } from '../core/contract.js';

export interface MagicAdapterConfig {
  openspecDir: string;
  migrationDir: string;
  liveProgramsFile: string;
  contractPattern: RegExp;
}

const defaultConfig = (projectRoot: string): MagicAdapterConfig => ({
  openspecDir: path.join(projectRoot, '.openspec'),
  migrationDir: path.join(projectRoot, '.openspec', 'migration'),
  liveProgramsFile: path.join(projectRoot, '.openspec', 'migration', 'live-programs.json'),
  contractPattern: /\.contract\.yaml$/,
});

export const createMagicAdapter = (projectRoot: string, overrides?: Partial<MagicAdapterConfig>): SpecExtractor => {
  const config = { ...defaultConfig(projectRoot), ...overrides };

  return {
    name: 'magic-unipaas',

    async extractProgramGraph(): Promise<ProgramGraph> {
      if (!fs.existsSync(config.liveProgramsFile)) {
        throw new Error(`Live programs file not found: ${config.liveProgramsFile}. Run build-graph.mjs first.`);
      }

      const raw = JSON.parse(fs.readFileSync(config.liveProgramsFile, 'utf8'));

      const programs: Program[] = (raw.programs ?? []).map((p: Record<string, unknown>) => ({
        id: p.ide as number,
        name: String(p.name ?? ''),
        complexity: mapComplexity(String(p.complexity ?? 'MOYENNE')),
        level: Number(p.level ?? 0),
        callers: (p.callers as number[]) ?? [],
        callees: (p.callees as number[]) ?? [],
        source: (p.source as ProgramSource) ?? 'bfs',
        domain: String(p.domain ?? ''),
      }));

      return {
        generated: String(raw.generated ?? ''),
        method: String(raw.method ?? 'BFS from seeds + ECF'),
        totalPrograms: Number(raw.total_adh ?? raw.totalPrograms ?? 0),
        liveCount: Number(raw.live_count ?? raw.liveCount ?? programs.length),
        orphanCount: Number(raw.orphan_count ?? raw.orphanCount ?? 0),
        seeds: (raw.seeds as number[]) ?? [],
        sharedPrograms: (raw.ecf_programs as number[]) ?? [],
        programs,
        orphans: (raw.orphans ?? []).map((o: Record<string, unknown>) => ({
          id: o.ide as number,
          name: String(o.name ?? ''),
          reason: String(o.reason ?? ''),
        })),
      };
    },

    async extractSpec(programId: string | number): Promise<MigrationContract | null> {
      const pattern = new RegExp(`IDE-${programId}\\.contract\\.yaml$`);
      const files = fs.existsSync(config.migrationDir)
        ? fs.readdirSync(config.migrationDir).filter(f => pattern.test(f) || config.contractPattern.test(f))
        : [];

      if (files.length === 0) return null;

      return parseContract(path.join(config.migrationDir, files[0]));
    },

    async getSharedPrograms(): Promise<(string | number)[]> {
      if (!fs.existsSync(config.liveProgramsFile)) return [];
      const raw = JSON.parse(fs.readFileSync(config.liveProgramsFile, 'utf8'));
      return (raw.ecf_programs as number[]) ?? [];
    },
  };
};

const mapComplexity = (raw: string): 'LOW' | 'MEDIUM' | 'HIGH' => {
  const upper = raw.toUpperCase();
  if (upper === 'BASSE' || upper === 'LOW') return 'LOW';
  if (upper === 'HAUTE' || upper === 'HIGH') return 'HIGH';
  return 'MEDIUM';
};
