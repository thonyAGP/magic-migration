/**
 * Module Calculator: identifies deliverable subtrees.
 *
 * A module = root program + ALL transitive callees (full subtree).
 * Deliverable = 100% of subtree is verified (or N/A).
 *
 * Special cases:
 * - SCC (cycles): atomic unit - all must be verified together
 * - N/A programs: count as verified
 * - Shared programs (ECF): verified once, counts everywhere
 * - Maximal modules: if A is subset of B and both deliverable, only report B
 */

import type { Program, DeliverableModule, ModuleBlocker, SCC, PipelineStatus } from '../core/types.js';
import { transitiveClosure, type AdjacencyGraph } from '../core/graph.js';

type NodeId = string | number;

export interface ModuleCalculatorInput {
  programs: Program[];
  adjacency: AdjacencyGraph;
  sccs: SCC[];
  levels: Map<NodeId, number>;
  programStatuses: Map<NodeId, PipelineStatus>;
  sharedPrograms: Set<NodeId>;
  naPrograms: Set<NodeId>;
}

export interface ModuleCalculatorOutput {
  allModules: DeliverableModule[];
  maximalModules: DeliverableModule[];
  deliverableModules: DeliverableModule[];
}

/**
 * Calculate all modules (one per program as potential root).
 */
export const calculateModules = (input: ModuleCalculatorInput): ModuleCalculatorOutput => {
  const {
    programs, adjacency, sccs, levels,
    programStatuses, sharedPrograms, naPrograms,
  } = input;

  const programMap = new Map(programs.map(p => [p.id, p]));
  const nodeToScc = new Map<NodeId, SCC>();
  for (const scc of sccs) {
    if (scc.members.length > 1) {
      for (const member of scc.members) {
        nodeToScc.set(member, scc);
      }
    }
  }

  const allModules: DeliverableModule[] = [];

  // Sort programs by level DESC (root-first) for maximal module detection
  const sortedPrograms = [...programs].sort((a, b) => {
    const la = levels.get(a.id) ?? 0;
    const lb = levels.get(b.id) ?? 0;
    return lb - la;
  });

  for (const program of sortedPrograms) {
    const root = program.id;
    const subtree = transitiveClosure(adjacency, root);
    const members = [...subtree];

    // Collect SCC units within this module
    const sccUnits: SCC[] = [];
    const seenSccIdx = new Set<number>();
    for (const member of members) {
      const scc = nodeToScc.get(member);
      if (scc && !seenSccIdx.has(scc.index)) {
        seenSccIdx.add(scc.index);
        sccUnits.push(scc);
      }
    }

    // Effective status: N/A programs count as verified
    const effectiveStatus = (id: NodeId): PipelineStatus => {
      if (naPrograms.has(id)) return 'verified';
      return programStatuses.get(id) ?? 'pending';
    };

    // For SCC: all must be verified, or none count
    const sccVerified = (scc: SCC): boolean =>
      scc.members.every(m => effectiveStatus(m) === 'verified');

    let verified = 0, enriched = 0, contracted = 0, pending = 0;
    const blockers: ModuleBlocker[] = [];

    for (const memberId of members) {
      const scc = nodeToScc.get(memberId);
      const status = effectiveStatus(memberId);

      if (scc) {
        // SCC members: count based on SCC-level verification
        if (sccVerified(scc)) {
          verified++;
        } else {
          // Individual status for stats
          switch (status) {
            case 'verified': verified++; break;
            case 'enriched': enriched++; break;
            case 'contracted': contracted++; break;
            default: pending++;
          }
          if (status !== 'verified') {
            blockers.push({
              programId: memberId,
              programName: programMap.get(memberId)?.name ?? String(memberId),
              currentStatus: status,
              reason: `Part of SCC [${scc.members.join(',')}] - all must be verified`,
            });
          }
        }
      } else {
        switch (status) {
          case 'verified': verified++; break;
          case 'enriched': enriched++; break;
          case 'contracted': contracted++; break;
          default: pending++;
        }
        if (status !== 'verified') {
          blockers.push({
            programId: memberId,
            programName: programMap.get(memberId)?.name ?? String(memberId),
            currentStatus: status,
            reason: `Status: ${status}`,
          });
        }
      }
    }

    const memberCount = members.length;
    const readinessPct = memberCount > 0
      ? Math.round(verified / memberCount * 100)
      : 100;

    allModules.push({
      root,
      rootName: program.name,
      members,
      memberCount,
      verified,
      enriched,
      contracted,
      pending,
      readinessPct,
      deliverable: verified === memberCount,
      blockers,
      sccUnits,
    });
  }

  // Filter maximal modules: remove subsets
  const maximalModules = filterMaximalModules(allModules);

  const deliverableModules = maximalModules.filter(m => m.deliverable);

  return { allModules, maximalModules, deliverableModules };
};

/**
 * Filter to only maximal modules.
 * A module A is subsumed by B if A.members is a subset of B.members
 * and both are deliverable. Keep only B.
 */
const filterMaximalModules = (modules: DeliverableModule[]): DeliverableModule[] => {
  // Sort by member count DESC to check largest first
  const sorted = [...modules].sort((a, b) => b.memberCount - a.memberCount);
  const memberSets = sorted.map(m => new Set(m.members));
  const keep = new Array(sorted.length).fill(true);

  for (let i = 0; i < sorted.length; i++) {
    if (!keep[i]) continue;
    for (let j = i + 1; j < sorted.length; j++) {
      if (!keep[j]) continue;
      // Check if j is a subset of i
      if (isSubset(memberSets[j], memberSets[i])) {
        keep[j] = false;
      }
    }
  }

  return sorted.filter((_, i) => keep[i]);
};

const isSubset = <T>(small: Set<T>, large: Set<T>): boolean => {
  if (small.size > large.size) return false;
  for (const item of small) {
    if (!large.has(item)) return false;
  }
  return true;
};
