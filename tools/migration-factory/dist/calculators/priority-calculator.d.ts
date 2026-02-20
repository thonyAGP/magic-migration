/**
 * Priority Calculator: inter-module dependency analysis and migration sequencing.
 *
 * Answers: "In what order should I migrate my modules?"
 *
 * Pipeline:
 * 1. Build module dependency graph (M_A depends on M_B if M_B.root IN M_A.members)
 * 2. Detect module-level SCCs (coupled modules)
 * 3. Compute module levels (0 = foundation, N = top-level orchestrator)
 * 4. Compute unblocking power (how many modules does completing M_i unblock?)
 * 5. Assign priority ranks (composite score: foundation + unblocking + readiness)
 * 6. Plan migration waves (parallel groups by level)
 */
import type { DeliverableModule, ModuleDependency, ModuleSCC, MigrationWave, PrioritizedModule, ModulePriorityResult, PriorityWeights } from '../core/types.js';
type NodeId = string | number;
export interface PriorityCalculatorInput {
    modules: DeliverableModule[];
    weights?: PriorityWeights;
}
/**
 * Build a dependency graph between modules.
 * Module M_A depends on M_B if M_B.root is in M_A.members (A's subtree uses B's root).
 * Self-dependencies (A.root == B.root) are excluded.
 */
export declare const buildModuleDependencyGraph: (modules: DeliverableModule[]) => {
    deps: Map<NodeId, Set<NodeId>>;
    list: ModuleDependency[];
};
/**
 * Detect SCCs at the module level using Tarjan's algorithm.
 */
export declare const detectModuleSCCs: (deps: Map<NodeId, Set<NodeId>>) => ModuleSCC[];
/**
 * Compute module levels on the condensation DAG.
 * Level 0 = no dependencies (foundations). Level N = depends on levels 0..N-1.
 */
export declare const computeModuleLevels: (deps: Map<NodeId, Set<NodeId>>, sccs: ModuleSCC[]) => Map<NodeId, number>;
/**
 * Compute unblocking power: how many modules are transitively unblocked
 * by completing module M_i.
 * Uses reverse BFS on the dependency graph.
 */
export declare const computeUnblockingPower: (deps: Map<NodeId, Set<NodeId>>) => Map<NodeId, number>;
/**
 * Assign priority ranks based on composite score.
 * Score = foundation_weight * foundationScore + unblocking_weight * unblockingScore + readiness_weight * readinessScore
 * All sub-scores normalized to 0-100.
 */
export declare const assignPriorityRanks: (modules: DeliverableModule[], moduleLevels: Map<NodeId, number>, unblockingPower: Map<NodeId, number>, deps: Map<NodeId, Set<NodeId>>, weights?: PriorityWeights) => PrioritizedModule[];
/**
 * Plan migration waves: groups of modules that can be migrated in parallel.
 * Wave N contains modules at module-level N.
 * Modules in the same SCC are placed in the same wave.
 */
export declare const planMigrationWaves: (prioritized: PrioritizedModule[], deps: Map<NodeId, Set<NodeId>>, sccs: ModuleSCC[]) => MigrationWave[];
/**
 * Full priority computation pipeline.
 */
export declare const computeModulePriority: (input: PriorityCalculatorInput) => ModulePriorityResult;
export {};
