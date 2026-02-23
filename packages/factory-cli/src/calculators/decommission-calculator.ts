/**
 * Decommission Calculator: identifies which legacy programs can be safely turned off.
 *
 * A program P can be decommissioned from legacy if:
 * 1. P is verified (modern replacement works) or N/A (not applicable)
 * 2. ALL callers of P are also decommissionable (no legacy code still depends on P)
 *
 * Root programs (no callers) only need condition 1.
 * Shared programs (ECF) need ALL callers across ALL projects to be decommissionable.
 * SCC members: all must be decommissionable together (atomic unit).
 */

import type {
  Program, PipelineStatus, SCC,
  DecommissionResult, DecommissionableProgram, BlockedProgram, DecommissionStats,
} from '../core/types.js';

type NodeId = string | number;

export interface DecommissionInput {
  programs: Program[];
  programStatuses: Map<NodeId, PipelineStatus>;
  naPrograms: Set<NodeId>;
  sharedPrograms: Set<NodeId>;
  sccs: SCC[];
}

export const calculateDecommission = (input: DecommissionInput): DecommissionResult => {
  const { programs, programStatuses, naPrograms, sharedPrograms, sccs } = input;

  const programMap = new Map(programs.map(p => [p.id, p]));

  // Build reverse graph (callers for each program)
  const callerGraph = new Map<NodeId, Set<NodeId>>();
  for (const p of programs) {
    if (!callerGraph.has(p.id)) callerGraph.set(p.id, new Set());
    for (const callee of p.callees) {
      if (!callerGraph.has(callee)) callerGraph.set(callee, new Set());
      callerGraph.get(callee)!.add(p.id);
    }
  }

  // SCC lookup
  const nodeToScc = new Map<NodeId, SCC>();
  for (const scc of sccs) {
    if (scc.members.length > 1) {
      for (const m of scc.members) nodeToScc.set(m, scc);
    }
  }

  // Effective status
  const isVerified = (id: NodeId): boolean => {
    if (naPrograms.has(id)) return true;
    return programStatuses.get(id) === 'verified';
  };

  // SCC-aware decommission check.
  // For SCC: evaluate as atomic unit - check all EXTERNAL callers of the entire SCC.
  const sccMemo = new Map<number, boolean>();

  const canDecommissionScc = (scc: SCC): boolean => {
    if (sccMemo.has(scc.index)) return sccMemo.get(scc.index)!;

    // All SCC members must be verified
    if (!scc.members.every(m => isVerified(m))) {
      sccMemo.set(scc.index, false);
      return false;
    }

    const sccSet = new Set(scc.members.map(String));

    // Check all EXTERNAL callers (callers outside this SCC)
    for (const member of scc.members) {
      const callers = callerGraph.get(member) ?? new Set();
      for (const caller of callers) {
        if (sccSet.has(String(caller))) continue; // same SCC, skip
        if (!programMap.has(caller)) continue;
        if (!canDecommission(caller)) {
          sccMemo.set(scc.index, false);
          return false;
        }
      }
    }

    sccMemo.set(scc.index, true);
    return true;
  };

  // Memoized decommission check for individual programs
  const memo = new Map<NodeId, boolean>();

  const canDecommission = (id: NodeId): boolean => {
    if (memo.has(id)) return memo.get(id)!;

    // Must be verified first
    if (!isVerified(id)) {
      memo.set(id, false);
      return false;
    }

    // If in SCC: delegate to SCC-level check
    const scc = nodeToScc.get(id);
    if (scc) {
      const result = canDecommissionScc(scc);
      for (const m of scc.members) memo.set(m, result);
      return result;
    }

    // All callers must also be decommissionable
    const callers = callerGraph.get(id) ?? new Set();
    for (const caller of callers) {
      if (!programMap.has(caller)) continue;
      if (!canDecommission(caller)) {
        memo.set(id, false);
        return false;
      }
    }

    memo.set(id, true);
    return true;
  };

  // Compute for all programs
  const decommissionable: DecommissionableProgram[] = [];
  const blocked: BlockedProgram[] = [];
  let blockedByStatus = 0;
  let blockedByCallers = 0;
  let sharedBlocked = 0;

  for (const p of programs) {
    const result = canDecommission(p.id);
    const level = p.level ?? 0;

    if (result) {
      const callers = callerGraph.get(p.id) ?? new Set();
      const reason = callers.size === 0
        ? 'Root program, verified'
        : `Verified + all ${callers.size} caller(s) decommissionable`;
      decommissionable.push({ id: p.id, name: p.name, level, reason });
    } else {
      const verified = isVerified(p.id);
      const callers = callerGraph.get(p.id) ?? new Set();
      const blockingCallers: NodeId[] = [];

      if (verified) {
        for (const caller of callers) {
          if (programMap.has(caller) && !canDecommission(caller)) {
            blockingCallers.push(caller);
          }
        }
      }

      const isShared = sharedPrograms.has(p.id);
      const reason = !verified
        ? `Not yet verified (${programStatuses.get(p.id) ?? 'pending'})`
        : `Verified but ${blockingCallers.length} legacy caller(s) still active`;

      blocked.push({
        id: p.id,
        name: p.name,
        level,
        status: programStatuses.get(p.id) ?? 'pending',
        blockingCallers,
        reason,
      });

      if (!verified) {
        blockedByStatus++;
      } else {
        blockedByCallers++;
        if (isShared) sharedBlocked++;
      }
    }
  }

  const totalLive = programs.length;
  const decommissionCount = decommissionable.length;

  return {
    decommissionable,
    blocked,
    stats: {
      totalLive,
      decommissionable: decommissionCount,
      decommissionPct: totalLive > 0 ? Math.round(decommissionCount / totalLive * 100) : 0,
      blockedByStatus,
      blockedByCallers,
      sharedBlocked,
    },
  };
};
