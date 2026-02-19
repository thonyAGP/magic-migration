/**
 * Swarm Planner: generates team plans for agent-based migration.
 * Assigns ownership of files/directories to prevent conflicts.
 */

import type { DeliverableModule, Program, SuggestedBatch } from '../core/types.js';

export interface SwarmAgent {
  name: string;
  role: 'contract-builder' | 'enricher' | 'verifier' | 'lead';
  assignedPrograms: (string | number)[];
  ownedPaths: string[];
  wave: number;
  maxTasks: number;
}

export interface SwarmPlan {
  agents: SwarmAgent[];
  waves: SwarmWave[];
  totalPrograms: number;
  estimatedWaves: number;
}

export interface SwarmWave {
  number: number;
  agents: string[];
  programs: (string | number)[];
  description: string;
}

export interface SwarmPlannerConfig {
  maxAgents: number;
  maxTasksPerAgent: number;
  targetDir: string;
}

const DEFAULT_SWARM_CONFIG: SwarmPlannerConfig = {
  maxAgents: 4,
  maxTasksPerAgent: 6,
  targetDir: 'src/',
};

/**
 * Plan a swarm of agents for a batch migration.
 */
export const planSwarm = (
  batch: SuggestedBatch,
  programs: Program[],
  config: Partial<SwarmPlannerConfig> = {}
): SwarmPlan => {
  const cfg = { ...DEFAULT_SWARM_CONFIG, ...config };
  const programMap = new Map(programs.map(p => [p.id, p]));
  const batchPrograms = batch.members
    .map(id => programMap.get(id))
    .filter((p): p is Program => p !== undefined);

  // Group programs by level for wave planning
  const byLevel = new Map<number, Program[]>();
  for (const p of batchPrograms) {
    const level = p.level;
    if (!byLevel.has(level)) byLevel.set(level, []);
    byLevel.get(level)!.push(p);
  }

  const sortedLevels = [...byLevel.keys()].sort((a, b) => a - b);

  // Build waves (leaf-first)
  const waves: SwarmWave[] = [];
  let waveNumber = 1;
  let currentWavePrograms: (string | number)[] = [];

  for (const level of sortedLevels) {
    const levelPrograms = byLevel.get(level)!;
    for (const p of levelPrograms) {
      currentWavePrograms.push(p.id);
      if (currentWavePrograms.length >= cfg.maxAgents * cfg.maxTasksPerAgent) {
        waves.push({
          number: waveNumber++,
          agents: [],
          programs: [...currentWavePrograms],
          description: `Level ${level} programs`,
        });
        currentWavePrograms = [];
      }
    }
  }

  if (currentWavePrograms.length > 0) {
    waves.push({
      number: waveNumber,
      agents: [],
      programs: currentWavePrograms,
      description: 'Remaining programs',
    });
  }

  // Create agents and assign programs
  const agents: SwarmAgent[] = [];
  for (const wave of waves) {
    const numAgents = Math.min(
      cfg.maxAgents,
      Math.ceil(wave.programs.length / cfg.maxTasksPerAgent)
    );

    for (let i = 0; i < numAgents; i++) {
      const start = i * cfg.maxTasksPerAgent;
      const end = Math.min(start + cfg.maxTasksPerAgent, wave.programs.length);
      const assigned = wave.programs.slice(start, end);

      if (assigned.length === 0) continue;

      const agentName = `agent-${wave.number}-${i + 1}`;
      wave.agents.push(agentName);

      agents.push({
        name: agentName,
        role: 'enricher',
        assignedPrograms: assigned,
        ownedPaths: assigned.map(id => `${cfg.targetDir}*${id}*`),
        wave: wave.number,
        maxTasks: cfg.maxTasksPerAgent,
      });
    }
  }

  return {
    agents,
    waves,
    totalPrograms: batch.members.length,
    estimatedWaves: waves.length,
  };
};

/**
 * Format swarm plan as readable text.
 */
export const formatSwarmPlan = (plan: SwarmPlan): string => {
  const lines: string[] = [
    `SWARM PLAN: ${plan.totalPrograms} programs, ${plan.estimatedWaves} waves, ${plan.agents.length} agents`,
    '',
  ];

  for (const wave of plan.waves) {
    lines.push(`Wave ${wave.number}: ${wave.description}`);
    lines.push(`  Programs: ${wave.programs.join(', ')}`);
    lines.push(`  Agents: ${wave.agents.join(', ')}`);
    lines.push('');
  }

  for (const agent of plan.agents) {
    lines.push(`${agent.name} (${agent.role}, wave ${agent.wave}):`);
    lines.push(`  Programs: ${agent.assignedPrograms.join(', ')}`);
    lines.push(`  Owned: ${agent.ownedPaths.join(', ')}`);
  }

  return lines.join('\n');
};
