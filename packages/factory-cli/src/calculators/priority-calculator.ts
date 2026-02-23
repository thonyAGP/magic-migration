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

import type {
  DeliverableModule, ModuleDependency, ModuleSCC, MigrationWave,
  PrioritizedModule, ModulePriorityResult, PriorityWeights, Complexity,
} from '../core/types.js';

type NodeId = string | number;

export interface PriorityCalculatorInput {
  modules: DeliverableModule[];
  weights?: PriorityWeights;
}

const DEFAULT_WEIGHTS: PriorityWeights = {
  foundation: 0.50,
  unblocking: 0.35,
  readiness: 0.15,
};

/**
 * Build a dependency graph between modules.
 * Module M_A depends on M_B if M_B.root is in M_A.members (A's subtree uses B's root).
 * Self-dependencies (A.root == B.root) are excluded.
 */
export const buildModuleDependencyGraph = (
  modules: DeliverableModule[]
): { deps: Map<NodeId, Set<NodeId>>; list: ModuleDependency[] } => {
  const deps = new Map<NodeId, Set<NodeId>>();
  const list: ModuleDependency[] = [];

  const rootSet = new Set<NodeId>(modules.map(m => m.root));

  for (const mod of modules) {
    deps.set(mod.root, new Set());
  }

  for (const modA of modules) {
    const memberSet = new Set(modA.members);
    for (const modB of modules) {
      if (modA.root === modB.root) continue;
      if (memberSet.has(modB.root)) {
        deps.get(modA.root)!.add(modB.root);
        const shared = modA.members.filter(
          m => modB.members.includes(m) && m !== modA.root && m !== modB.root
        );
        list.push({
          moduleRoot: modA.root,
          dependsOn: modB.root,
          sharedPrograms: shared,
        });
      }
    }
  }

  return { deps, list };
};

/**
 * Detect SCCs at the module level using Tarjan's algorithm.
 */
export const detectModuleSCCs = (
  deps: Map<NodeId, Set<NodeId>>
): ModuleSCC[] => {
  let index = 0;
  const stack: NodeId[] = [];
  const onStack = new Set<NodeId>();
  const indices = new Map<NodeId, number>();
  const lowlinks = new Map<NodeId, number>();
  const sccs: ModuleSCC[] = [];
  let sccIndex = 0;

  const strongConnect = (v: NodeId): void => {
    indices.set(v, index);
    lowlinks.set(v, index);
    index++;
    stack.push(v);
    onStack.add(v);

    const neighbors = deps.get(v) ?? new Set();
    for (const w of neighbors) {
      if (!indices.has(w)) {
        strongConnect(w);
        lowlinks.set(v, Math.min(lowlinks.get(v)!, lowlinks.get(w)!));
      } else if (onStack.has(w)) {
        lowlinks.set(v, Math.min(lowlinks.get(v)!, indices.get(w)!));
      }
    }

    if (lowlinks.get(v) === indices.get(v)) {
      const scc: NodeId[] = [];
      let w: NodeId;
      do {
        w = stack.pop()!;
        onStack.delete(w);
        scc.push(w);
      } while (w !== v);

      if (scc.length > 1) {
        sccs.push({ index: sccIndex++, moduleRoots: scc });
      }
    }
  };

  for (const node of deps.keys()) {
    if (!indices.has(node)) {
      strongConnect(node);
    }
  }

  return sccs;
};

/**
 * Compute module levels on the condensation DAG.
 * Level 0 = no dependencies (foundations). Level N = depends on levels 0..N-1.
 */
export const computeModuleLevels = (
  deps: Map<NodeId, Set<NodeId>>,
  sccs: ModuleSCC[]
): Map<NodeId, number> => {
  // Map each module root to its SCC index (or itself)
  const nodeToScc = new Map<NodeId, NodeId>();
  for (const scc of sccs) {
    const sccKey = `scc_${scc.index}`;
    for (const root of scc.moduleRoots) {
      nodeToScc.set(root, sccKey);
    }
  }
  for (const node of deps.keys()) {
    if (!nodeToScc.has(node)) {
      nodeToScc.set(node, node);
    }
  }

  // Build condensation edges
  const condensedEdges = new Map<NodeId, Set<NodeId>>();
  const allCondensedNodes = new Set<NodeId>();
  for (const node of deps.keys()) {
    allCondensedNodes.add(nodeToScc.get(node)!);
  }
  for (const n of allCondensedNodes) {
    condensedEdges.set(n, new Set());
  }

  for (const [node, neighbors] of deps) {
    const from = nodeToScc.get(node)!;
    for (const neighbor of neighbors) {
      const to = nodeToScc.get(neighbor)!;
      if (from !== to) {
        condensedEdges.get(from)!.add(to);
      }
    }
  }

  // Compute levels recursively on the DAG
  const levels = new Map<NodeId, number>();

  const computeLevel = (node: NodeId): number => {
    if (levels.has(node)) return levels.get(node)!;

    const children = condensedEdges.get(node) ?? new Set();
    if (children.size === 0) {
      levels.set(node, 0);
      return 0;
    }

    let maxChild = 0;
    for (const child of children) {
      maxChild = Math.max(maxChild, computeLevel(child) + 1);
    }
    levels.set(node, maxChild);
    return maxChild;
  };

  for (const node of allCondensedNodes) {
    computeLevel(node);
  }

  // Map back to original module roots
  const result = new Map<NodeId, number>();
  for (const node of deps.keys()) {
    const condensedNode = nodeToScc.get(node)!;
    result.set(node, levels.get(condensedNode) ?? 0);
  }

  return result;
};

/**
 * Compute unblocking power: how many modules are transitively unblocked
 * by completing module M_i.
 * Uses reverse BFS on the dependency graph.
 */
export const computeUnblockingPower = (
  deps: Map<NodeId, Set<NodeId>>
): Map<NodeId, number> => {
  // Build reverse graph: who depends on me?
  const reverseDeps = new Map<NodeId, Set<NodeId>>();
  for (const node of deps.keys()) {
    reverseDeps.set(node, new Set());
  }
  for (const [node, neighbors] of deps) {
    for (const neighbor of neighbors) {
      if (!reverseDeps.has(neighbor)) {
        reverseDeps.set(neighbor, new Set());
      }
      reverseDeps.get(neighbor)!.add(node);
    }
  }

  const result = new Map<NodeId, number>();
  for (const node of deps.keys()) {
    // BFS from node on reverse graph
    const visited = new Set<NodeId>();
    const queue: NodeId[] = [node];
    visited.add(node);

    while (queue.length > 0) {
      const current = queue.shift()!;
      const dependents = reverseDeps.get(current) ?? new Set();
      for (const dep of dependents) {
        if (!visited.has(dep)) {
          visited.add(dep);
          queue.push(dep);
        }
      }
    }

    // Unblocking power = number of modules reached - 1 (exclude self)
    result.set(node, visited.size - 1);
  }

  return result;
};

/**
 * Assign priority ranks based on composite score.
 * Score = foundation_weight * foundationScore + unblocking_weight * unblockingScore + readiness_weight * readinessScore
 * All sub-scores normalized to 0-100.
 */
export const assignPriorityRanks = (
  modules: DeliverableModule[],
  moduleLevels: Map<NodeId, number>,
  unblockingPower: Map<NodeId, number>,
  deps: Map<NodeId, Set<NodeId>>,
  weights: PriorityWeights = DEFAULT_WEIGHTS
): PrioritizedModule[] => {
  if (modules.length === 0) return [];

  const maxLevel = Math.max(...[...moduleLevels.values()], 0);
  const maxUnblocking = Math.max(...[...unblockingPower.values()], 1);

  // Build reverse deps for dependedBy
  const dependedBy = new Map<NodeId, (string | number)[]>();
  for (const mod of modules) {
    dependedBy.set(mod.root, []);
  }
  for (const [node, neighbors] of deps) {
    for (const neighbor of neighbors) {
      if (dependedBy.has(neighbor)) {
        dependedBy.get(neighbor)!.push(node);
      }
    }
  }

  // Build implementation order: members sorted by level ASC (leaf-first)
  const moduleMap = new Map(modules.map(m => [m.root, m]));

  const prioritized: PrioritizedModule[] = modules.map(mod => {
    const level = moduleLevels.get(mod.root) ?? 0;
    const unblock = unblockingPower.get(mod.root) ?? 0;

    // Foundation score: lower level = higher score (inverted)
    const foundationScore = maxLevel > 0
      ? ((maxLevel - level) / maxLevel) * 100
      : 100;

    // Unblocking score: higher unblocking = higher score
    const unblockingScore = (unblock / maxUnblocking) * 100;

    // Readiness score: direct percentage
    const readinessScore = mod.readinessPct;

    const priorityScore =
      weights.foundation * foundationScore +
      weights.unblocking * unblockingScore +
      weights.readiness * readinessScore;

    const depsOn = [...(deps.get(mod.root) ?? [])];

    return {
      root: mod.root,
      rootName: mod.rootName,
      rank: 0, // assigned after sorting
      priorityScore: Math.round(priorityScore * 100) / 100,
      moduleLevel: level,
      unblockingPower: unblock,
      dependsOn: depsOn,
      dependedBy: dependedBy.get(mod.root) ?? [],
      implementationOrder: [...mod.members],
      readinessPct: mod.readinessPct,
      memberCount: mod.memberCount,
    };
  });

  // Sort: higher score = higher priority = lower rank number
  prioritized.sort((a, b) => {
    if (b.priorityScore !== a.priorityScore) return b.priorityScore - a.priorityScore;
    // Tiebreaker: lower level first, then by root id for determinism
    if (a.moduleLevel !== b.moduleLevel) return a.moduleLevel - b.moduleLevel;
    return String(a.root).localeCompare(String(b.root));
  });

  // Assign ranks
  for (let i = 0; i < prioritized.length; i++) {
    prioritized[i].rank = i + 1;
  }

  return prioritized;
};

/**
 * Plan migration waves: groups of modules that can be migrated in parallel.
 * Wave N contains modules at module-level N.
 * Modules in the same SCC are placed in the same wave.
 */
export const planMigrationWaves = (
  prioritized: PrioritizedModule[],
  deps: Map<NodeId, Set<NodeId>>,
  sccs: ModuleSCC[]
): MigrationWave[] => {
  if (prioritized.length === 0) return [];

  // Group by module level
  const byLevel = new Map<number, PrioritizedModule[]>();
  for (const mod of prioritized) {
    const level = mod.moduleLevel;
    if (!byLevel.has(level)) byLevel.set(level, []);
    byLevel.get(level)!.push(mod);
  }

  // SCC modules must be in same wave - find max level in each SCC
  const sccWaveOverrides = new Map<NodeId, number>();
  for (const scc of sccs) {
    const maxSccLevel = Math.max(
      ...scc.moduleRoots.map(r => {
        const mod = prioritized.find(p => p.root === r);
        return mod?.moduleLevel ?? 0;
      })
    );
    for (const root of scc.moduleRoots) {
      sccWaveOverrides.set(root, maxSccLevel);
    }
  }

  // Rebuild groups with SCC overrides
  const waveGroups = new Map<number, (string | number)[]>();
  for (const mod of prioritized) {
    const wave = sccWaveOverrides.get(mod.root) ?? mod.moduleLevel;
    if (!waveGroups.has(wave)) waveGroups.set(wave, []);
    waveGroups.get(wave)!.push(mod.root);
  }

  // Sort waves by level ASC
  const sortedLevels = [...waveGroups.keys()].sort((a, b) => a - b);

  const waves: MigrationWave[] = sortedLevels.map((level, idx) => {
    const moduleRoots = waveGroups.get(level)!;

    // blocked by = all previous wave numbers
    const blockedBy = sortedLevels.filter(l => l < level).map((_, i) => i + 1);

    // Estimate complexity from member counts
    let totalMembers = 0;
    for (const root of moduleRoots) {
      const mod = prioritized.find(p => p.root === root);
      totalMembers += mod?.memberCount ?? 0;
    }
    const estimatedComplexity: Complexity = totalMembers > 30 ? 'HIGH'
      : totalMembers > 10 ? 'MEDIUM'
      : 'LOW';

    return {
      wave: idx + 1,
      modules: moduleRoots,
      blockedBy,
      estimatedComplexity,
    };
  });

  return waves;
};

/**
 * Full priority computation pipeline.
 */
export const computeModulePriority = (
  input: PriorityCalculatorInput
): ModulePriorityResult => {
  const { modules, weights = DEFAULT_WEIGHTS } = input;

  if (modules.length === 0) {
    return {
      prioritizedModules: [],
      moduleDependencies: [],
      moduleSCCs: [],
      migrationSequence: [],
    };
  }

  const { deps, list } = buildModuleDependencyGraph(modules);
  const moduleSCCs = detectModuleSCCs(deps);
  const moduleLevels = computeModuleLevels(deps, moduleSCCs);
  const unblocking = computeUnblockingPower(deps);
  const prioritizedModules = assignPriorityRanks(modules, moduleLevels, unblocking, deps, weights);
  const migrationSequence = planMigrationWaves(prioritizedModules, deps, moduleSCCs);

  return {
    prioritizedModules,
    moduleDependencies: list,
    moduleSCCs,
    migrationSequence,
  };
};
