/**
 * Swarm Planner: generates team plans for agent-based migration.
 * Assigns ownership of files/directories to prevent conflicts.
 */
import type { Program, SuggestedBatch } from '../core/types.js';
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
/**
 * Plan a swarm of agents for a batch migration.
 */
export declare const planSwarm: (batch: SuggestedBatch, programs: Program[], config?: Partial<SwarmPlannerConfig>) => SwarmPlan;
/**
 * Format swarm plan as readable text.
 */
export declare const formatSwarmPlan: (plan: SwarmPlan) => string;
