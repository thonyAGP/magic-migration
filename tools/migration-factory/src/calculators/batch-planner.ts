/**
 * Batch Planner: auto-suggests batches from program graph topology.
 *
 * Strategy:
 * 1. Find "natural roots" = programs with callers but no parent within same functional group
 * 2. For each root, compute subtree size
 * 3. Group by domain if available, otherwise by topology
 * 4. Target batch size: 10-30 programs (configurable)
 */

import type { Program, SuggestedBatch, BatchPlan, Complexity, SCC } from '../core/types.js';
import { transitiveClosure, type AdjacencyGraph } from '../core/graph.js';

type NodeId = string | number;

export interface BatchPlannerConfig {
  minBatchSize: number;
  maxBatchSize: number;
  preferDomainGrouping: boolean;
}

const DEFAULT_CONFIG: BatchPlannerConfig = {
  minBatchSize: 5,
  maxBatchSize: 30,
  preferDomainGrouping: true,
};

/**
 * Auto-suggest batches from the program graph.
 */
export const planBatches = (
  programs: Program[],
  adjacency: AdjacencyGraph,
  levels: Map<NodeId, number>,
  sccs: SCC[],
  config: Partial<BatchPlannerConfig> = {}
): BatchPlan => {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const programMap = new Map(programs.map(p => [p.id, p]));

  // Find natural roots: programs at high levels that have significant subtrees
  const roots = findNaturalRoots(programs, adjacency, levels, cfg);

  const suggestedBatches: SuggestedBatch[] = [];
  const assigned = new Set<NodeId>();
  let batchCounter = 1;

  // Sort roots by level DESC (highest = most encompassing)
  roots.sort((a, b) => {
    const la = levels.get(a) ?? 0;
    const lb = levels.get(b) ?? 0;
    return lb - la;
  });

  for (const root of roots) {
    if (assigned.has(root)) continue;

    const subtree = transitiveClosure(adjacency, root);
    const unassigned = [...subtree].filter(id => !assigned.has(id));

    if (unassigned.length < cfg.minBatchSize) continue;

    // If subtree is too large, it stays as one batch (user can split later)
    const members = unassigned;
    for (const m of members) assigned.add(m);

    const rootProgram = programMap.get(root);
    const level = levels.get(root) ?? 0;
    const domain = rootProgram?.domain ?? inferDomain(rootProgram?.name ?? '');
    const complexity = estimateComplexity(members.length);

    suggestedBatches.push({
      id: `B${batchCounter}`,
      name: rootProgram?.name ?? `Batch ${batchCounter}`,
      root,
      members,
      memberCount: members.length,
      level,
      domain,
      estimatedComplexity: complexity,
    });
    batchCounter++;
  }

  // Remaining unassigned programs -> "misc" batch if enough
  const remaining = programs
    .map(p => p.id)
    .filter(id => !assigned.has(id));

  if (remaining.length >= cfg.minBatchSize) {
    suggestedBatches.push({
      id: `B${batchCounter}`,
      name: 'Miscellaneous',
      root: remaining[0],
      members: remaining,
      memberCount: remaining.length,
      level: 0,
      domain: 'misc',
      estimatedComplexity: 'MEDIUM',
    });
  }

  return {
    suggestedBatches,
    totalPrograms: programs.length,
    totalBatches: suggestedBatches.length,
  };
};

// ─── Infrastructure detection ─────────────────────────────────────

const INFRASTRUCTURE_PATTERNS = /^(main|menu|init)/i;

export const isInfrastructureProgram = (name: string, level: number, maxLevel: number): boolean => {
  if (INFRASTRUCTURE_PATTERNS.test(name)) return true;
  // Programs at the top level that encompass everything are infrastructure
  if (maxLevel > 2 && level === maxLevel) return true;
  return false;
};

// ─── Enhanced batch planning with exclusions ──────────────────────

export interface EnhancedBatchPlannerConfig extends BatchPlannerConfig {
  existingBatchPrograms: Set<NodeId>;
  excludeInfrastructure: boolean;
  startBatchNumber: number;
}

const DEFAULT_ENHANCED_CONFIG: EnhancedBatchPlannerConfig = {
  ...DEFAULT_CONFIG,
  existingBatchPrograms: new Set(),
  excludeInfrastructure: true,
  startBatchNumber: 1,
};

export const planBatchesWithExclusions = (
  programs: Program[],
  adjacency: AdjacencyGraph,
  levels: Map<NodeId, number>,
  sccs: SCC[],
  config: Partial<EnhancedBatchPlannerConfig> = {}
): BatchPlan => {
  const cfg = { ...DEFAULT_ENHANCED_CONFIG, ...config };
  const maxLevel = Math.max(0, ...[...levels.values()]);
  const programMap = new Map(programs.map(p => [p.id, p]));

  // Pre-filter: remove already-assigned and infrastructure programs
  const eligible = programs.filter(p => {
    if (cfg.existingBatchPrograms.has(p.id)) return false;
    if (cfg.excludeInfrastructure && isInfrastructureProgram(p.name, p.level, maxLevel)) return false;
    return true;
  });

  const eligibleIds = new Set(eligible.map(p => p.id));

  // Find natural roots among eligible programs only
  const roots = findNaturalRoots(eligible, adjacency, levels, cfg);

  const suggestedBatches: SuggestedBatch[] = [];
  const assigned = new Set<NodeId>();
  let batchCounter = cfg.startBatchNumber;

  // Sort roots by level DESC
  roots.sort((a, b) => {
    const la = levels.get(a) ?? 0;
    const lb = levels.get(b) ?? 0;
    return lb - la;
  });

  for (const root of roots) {
    if (assigned.has(root)) continue;

    const subtree = transitiveClosure(adjacency, root);
    const unassigned = [...subtree].filter(id => eligibleIds.has(id) && !assigned.has(id));

    if (unassigned.length < cfg.minBatchSize) continue;

    if (unassigned.length <= cfg.maxBatchSize) {
      // Fits in a single batch
      for (const m of unassigned) assigned.add(m);

      const rootProgram = programMap.get(root);
      const level = levels.get(root) ?? 0;
      const domain = rootProgram?.domain ?? inferDomain(rootProgram?.name ?? '');

      suggestedBatches.push({
        id: `B${batchCounter}`,
        name: rootProgram?.name ?? `Batch ${batchCounter}`,
        root,
        members: unassigned,
        memberCount: unassigned.length,
        level,
        domain,
        estimatedComplexity: estimateComplexity(unassigned.length),
      });
      batchCounter++;
    } else {
      // Too large: split by domain
      const byDomain = groupByDomain(unassigned, programMap);
      const miscMembers: NodeId[] = [];

      for (const [domain, members] of byDomain) {
        if (members.length < cfg.minBatchSize) {
          miscMembers.push(...members);
          continue;
        }
        const chunks = chunkArray(members, cfg.maxBatchSize);
        for (let ci = 0; ci < chunks.length; ci++) {
          const chunk = chunks[ci];
          for (const m of chunk) assigned.add(m);
          const suffix = chunks.length > 1 ? ` (${ci + 1}/${chunks.length})` : '';
          suggestedBatches.push({
            id: `B${batchCounter}`,
            name: `${domain}${suffix}`,
            root: chunk[0],
            members: chunk,
            memberCount: chunk.length,
            level: levels.get(chunk[0]) ?? 0,
            domain,
            estimatedComplexity: estimateComplexity(chunk.length),
          });
          batchCounter++;
        }
      }

      // Leftover small groups -> misc batch(es)
      if (miscMembers.length >= cfg.minBatchSize) {
        const miscChunks = chunkArray(miscMembers, cfg.maxBatchSize);
        for (const chunk of miscChunks) {
          for (const m of chunk) assigned.add(m);
          suggestedBatches.push({
            id: `B${batchCounter}`,
            name: `Divers`,
            root: chunk[0],
            members: chunk,
            memberCount: chunk.length,
            level: 0,
            domain: 'misc',
            estimatedComplexity: estimateComplexity(chunk.length),
          });
          batchCounter++;
        }
      } else {
        // Too few for a batch, mark as assigned anyway to avoid losing them in remaining
        for (const m of miscMembers) assigned.add(m);
      }
    }
  }

  // Remaining eligible unassigned -> "misc" batch
  const remaining = eligible
    .map(p => p.id)
    .filter(id => !assigned.has(id));

  if (remaining.length >= cfg.minBatchSize) {
    suggestedBatches.push({
      id: `B${batchCounter}`,
      name: 'Miscellaneous',
      root: remaining[0],
      members: remaining,
      memberCount: remaining.length,
      level: 0,
      domain: 'misc',
      estimatedComplexity: 'MEDIUM',
    });
  }

  return {
    suggestedBatches,
    totalPrograms: eligible.length,
    totalBatches: suggestedBatches.length,
  };
};

/**
 * Find natural roots for batching.
 * A natural root is a program that:
 * - Has a significant subtree (>= minBatchSize)
 * - Is at a high level (deep in the call chain)
 * - OR is an entry point (seed/ecf)
 */
const findNaturalRoots = (
  programs: Program[],
  adjacency: AdjacencyGraph,
  levels: Map<NodeId, number>,
  config: BatchPlannerConfig
): NodeId[] => {
  const roots: NodeId[] = [];

  // Strategy 1: Programs with high level and significant subtrees
  const highLevelPrograms = programs
    .filter(p => (levels.get(p.id) ?? 0) >= 4)
    .sort((a, b) => (levels.get(b.id) ?? 0) - (levels.get(a.id) ?? 0));

  for (const prog of highLevelPrograms) {
    const subtree = transitiveClosure(adjacency, prog.id);
    if (subtree.size >= config.minBatchSize) {
      roots.push(prog.id);
    }
  }

  // Strategy 2: Programs with many direct callees (orchestrators)
  const orchestrators = programs
    .filter(p => p.callees.length >= 5)
    .sort((a, b) => b.callees.length - a.callees.length);

  for (const prog of orchestrators) {
    if (!roots.includes(prog.id)) {
      const subtree = transitiveClosure(adjacency, prog.id);
      if (subtree.size >= config.minBatchSize) {
        roots.push(prog.id);
      }
    }
  }

  return roots;
};

// ─── Splitting helpers ─────────────────────────────────────────

export const groupByDomain = (
  ids: NodeId[],
  programMap: Map<string | number, Program>,
): Map<string, NodeId[]> => {
  const byDomain = new Map<string, NodeId[]>();
  for (const id of ids) {
    const prog = programMap.get(id);
    const domain = prog?.domain && prog.domain !== 'General'
      ? prog.domain
      : inferDomain(prog?.name ?? '');
    const list = byDomain.get(domain) ?? [];
    list.push(id);
    byDomain.set(domain, list);
  }
  return byDomain;
};

export const chunkArray = <T>(arr: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
};

// ─── Domain inference ──────────────────────────────────────────

export const inferDomain = (name: string): string => {
  const lower = name.toLowerCase();
  if (lower.includes('separation') || lower.includes('fusion')) return 'Regroupement';
  if (lower.includes('stock') || lower.includes('produit') || lower.includes('article') || lower.includes('appro')) return 'Stock';
  if (lower.includes('coffre') || lower.includes('apport')) return 'Coffre';
  if (lower.includes('club') || lower.includes('datacatch') || lower.includes('easy')) return 'EasyCheckout';
  if (lower.includes('ecart') || lower.includes('contenu')) return 'Session';
  if (lower.includes('caisse') || lower.includes('session')) return 'Caisse';
  if (lower.includes('vente') || lower.includes('gift') || lower.includes('boutique')) return 'Ventes';
  if (lower.includes('extrait') || lower.includes('compte')) return 'Compte';
  if (lower.includes('change') || lower.includes('devise')) return 'Change';
  if (lower.includes('telephone') || lower.includes('phone')) return 'Telephone';
  if (lower.includes('garantie') || lower.includes('depot')) return 'Garantie';
  if (lower.includes('facture')) return 'Factures';
  if (lower.includes('ticket') || lower.includes('print') || lower.includes('edition')) return 'Impression';
  if (lower.includes('menu')) return 'Menu';
  if (lower.includes('data') || lower.includes('catch')) return 'DataCatching';
  return 'General';
};

const estimateComplexity = (memberCount: number): Complexity => {
  if (memberCount <= 5) return 'LOW';
  if (memberCount <= 15) return 'MEDIUM';
  return 'HIGH';
};
