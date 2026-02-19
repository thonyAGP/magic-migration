import fs from 'fs';
import path from 'path';

const BASE = '/mnt/d/Projects/Lecteur_Magic/.openspec';

// Build master data from index
const idx = JSON.parse(fs.readFileSync(path.join(BASE, 'index.json'), 'utf8'));
const adhSpecs = idx.specs.filter(s => s.project === 'ADH' && !s.id.includes('-summary') && !s.id.includes('-v35'));

const programs = {};
const calleeGraph = {}; // ide -> Set of callees
const callerGraph = {}; // ide -> Set of callers (informational)
const warnings = [];

for (const spec of adhSpecs) {
  const ide = spec.ide;
  programs[ide] = { ide, complexity: spec.complexity, name: '', callers: [], callees: [] };
  calleeGraph[ide] = new Set();
  callerGraph[ide] = new Set();
}

// Now read each spec file and extract data
for (const spec of adhSpecs) {
  const ide = spec.ide;
  const filePath = path.join(BASE, spec.file);

  if (!fs.existsSync(filePath)) {
    warnings.push('Missing file: ' + filePath + ' for IDE ' + ide);
    continue;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  // Strip BOM
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.substring(1);
  }

  // Extract name from title: # ADH IDE N - NAME
  const titleMatch = content.match(/^#\s+ADH\s+IDE\s+\d+\s*[-\u2013]\s*(.+)/m);
  if (titleMatch) {
    programs[ide].name = titleMatch[1].trim();
  }

  // Split content into lines for section detection
  const lines = content.split('\n');

  // Track which section we're in
  // Sections can be:
  //   13.2 or 3.2 = Callers
  //   13.4 or 3.3 = Callees
  let currentSection = '';
  const callerIdes = new Set();
  const calleeIdes = new Set();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect section headers (both formats)
    if (/^#{1,4}\s/.test(line)) {
      // Callers sections: 13.2, 3.2, or "Callers"
      if (/13\.2\s|3\.2\s|Callers\b/i.test(line) && !/Callees/i.test(line)) {
        currentSection = 'callers';
      }
      // Callees sections: 13.3, 13.4, 3.3, or "Callees" or "Detail Callees"
      else if (/13\.[34]\s|3\.3\s|Callees\b|Programmes appel/i.test(line)) {
        currentSection = 'callees';
      }
      // Any other section header resets
      else if (/^\#{1,3}\s+\d+\./.test(line) || /^#{1,3}\s+(SPECIFICATION|NOTES|RECOMMANDATION)/.test(line)) {
        currentSection = '';
      }
    }

    // Extract table links: | [NNN](ADH-IDE-NNN.md) |
    const tableMatches = [...line.matchAll(/\|\s*\[(\d+)\]\(ADH-IDE-\d+\.md\)\s*\|/g)];
    for (const m of tableMatches) {
      const linkedIde = parseInt(m[1]);
      if (linkedIde !== ide && programs[linkedIde]) {
        if (currentSection === 'callers') {
          callerIdes.add(linkedIde);
        } else if (currentSection === 'callees') {
          calleeIdes.add(linkedIde);
        }
      }
    }

    // Extract inline callers from "Appele par" lines
    // Format: [Name (IDE NNN)](ADH-IDE-NNN.md)
    if (/appel[ée]\s*par/i.test(line) || (currentSection === 'callers' && /IDE\s*\d+/i.test(line))) {
      const inlineCallers = [...line.matchAll(/\[.*?\(IDE\s*(\d+)\)\]\(ADH-IDE-\d+\.md\)/g)];
      for (const m of inlineCallers) {
        const callerIde = parseInt(m[1]);
        if (callerIde !== ide && programs[callerIde]) {
          callerIdes.add(callerIde);
        }
      }
    }

    // Extract from chain lines: Main -> ... -> [Name (IDE NNN)](ADH-IDE-NNN.md) -> **target**
    // These are in section 13.1 / 3.1 and show the caller chain
    if (/^Main\s*->/.test(line)) {
      const chainCallers = [...line.matchAll(/\[.*?\(IDE\s*(\d+)\)\]\(ADH-IDE-\d+\.md\)/g)];
      for (const m of chainCallers) {
        const callerIde = parseInt(m[1]);
        if (callerIde !== ide && programs[callerIde]) {
          callerIdes.add(callerIde);
        }
      }
    }
  }

  // Also extract callees from mermaid node definitions in callee sections
  // Pattern: C123[123 Name] in mermaid blocks after callee header
  let inCalleesMermaid = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^#{1,4}\s/.test(line)) {
      if (/13\.[34]\s|3\.3\s|Callees\b/i.test(line)) {
        inCalleesMermaid = true;
      } else {
        inCalleesMermaid = false;
      }
    }
    if (inCalleesMermaid && /```mermaid/.test(line)) {
      // Read until closing ```
      for (let j = i + 1; j < lines.length; j++) {
        if (lines[j].trim() === '```') break;
        const mermaidNodes = [...lines[j].matchAll(/C(\d+)\[(\d+)\s/g)];
        for (const m of mermaidNodes) {
          const calleeIde = parseInt(m[2]);
          if (calleeIde !== ide && programs[calleeIde]) {
            calleeIdes.add(calleeIde);
          }
        }
      }
    }
  }

  // Store callees (direct assignment from this spec's callee section)
  for (const calleeIde of calleeIdes) {
    calleeGraph[ide].add(calleeIde);
  }

  // Store callers (informational from this spec's caller section)
  // IMPORTANT: We also infer callees from callers
  // If spec A says "caller is B", that means B calls A, so add A to B's callees
  for (const callerIde of callerIdes) {
    callerGraph[ide].add(callerIde);
    calleeGraph[callerIde].add(ide);
  }
}

// Convert sets to sorted arrays
for (const ide in calleeGraph) {
  calleeGraph[ide] = [...calleeGraph[ide]].sort((a, b) => a - b);
}
for (const ide in callerGraph) {
  callerGraph[ide] = [...callerGraph[ide]].sort((a, b) => a - b);
}

// Store on programs
for (const ide in programs) {
  programs[ide].callees = calleeGraph[ide] || [];
  programs[ide].callers = callerGraph[ide] || [];
}

// ===== Detect cycles =====
const visited = new Set();
const inStack = new Set();
const cycleEdges = new Set(); // "from->to" strings to break

function findCycles(node, pathSet) {
  if (inStack.has(node)) return;
  if (visited.has(node)) return;

  visited.add(node);
  inStack.add(node);

  for (const next of (calleeGraph[node] || [])) {
    if (!programs[next]) continue;
    if (inStack.has(next)) {
      // Cycle found - mark this edge as a cycle edge
      cycleEdges.add(`${node}->${next}`);
    } else if (!visited.has(next)) {
      findCycles(next, pathSet);
    }
  }

  inStack.delete(node);
}

for (const ide of Object.keys(programs).map(Number)) {
  if (!visited.has(ide)) {
    findCycles(ide, new Set());
  }
}

if (cycleEdges.size > 0) {
  console.log('Cycles detected (edges to break):', [...cycleEdges]);
}

// ===== BFS from seeds =====
const SEED_PROGRAMS = [1, 163, 166, 281];
const ECF_PROGRAMS = [27, 28, 53, 54, 64, 65, 69, 70, 71, 72, 73, 74, 76, 84, 97, 111, 121, 149, 152, 178, 180, 181, 185, 192, 208, 210, 229, 243];

const liveSet = new Set();
const sourceMap = {}; // ide -> 'seed' | 'ecf' | 'bfs'

// Initialize all seeds
for (const ide of SEED_PROGRAMS) {
  if (programs[ide]) {
    liveSet.add(ide);
    sourceMap[ide] = 'seed';
  }
}
for (const ide of ECF_PROGRAMS) {
  if (programs[ide]) {
    liveSet.add(ide);
    if (!sourceMap[ide]) sourceMap[ide] = 'ecf';
  }
}

// BFS from seeds through callees
const queue = [...liveSet];
while (queue.length > 0) {
  const current = queue.shift();
  const callees = calleeGraph[current] || [];
  for (const callee of callees) {
    if (!liveSet.has(callee) && programs[callee]) {
      liveSet.add(callee);
      sourceMap[callee] = 'bfs';
      queue.push(callee);
    }
  }
}

// ===== Compute dependency levels (leaf-first, cycle-aware) =====
// Level 0: no LIVE callees (leaf)
// Level N: max(level of LIVE callees) + 1
// For cycles: use Tarjan's SCC to find strongly connected components,
// then assign same level to all members of a cycle

// First, build a graph of only LIVE programs
const liveCalleeGraph = {};
for (const ide of liveSet) {
  liveCalleeGraph[ide] = (calleeGraph[ide] || []).filter(c => liveSet.has(c));
}

// Tarjan's SCC algorithm
let tarjanIndex = 0;
const tarjanStack = [];
const tarjanOnStack = new Set();
const tarjanIndices = {};
const tarjanLowlinks = {};
const sccs = []; // Array of SCC arrays

function strongconnect(v) {
  tarjanIndices[v] = tarjanIndex;
  tarjanLowlinks[v] = tarjanIndex;
  tarjanIndex++;
  tarjanStack.push(v);
  tarjanOnStack.add(v);

  for (const w of (liveCalleeGraph[v] || [])) {
    if (tarjanIndices[w] === undefined) {
      strongconnect(w);
      tarjanLowlinks[v] = Math.min(tarjanLowlinks[v], tarjanLowlinks[w]);
    } else if (tarjanOnStack.has(w)) {
      tarjanLowlinks[v] = Math.min(tarjanLowlinks[v], tarjanIndices[w]);
    }
  }

  if (tarjanLowlinks[v] === tarjanIndices[v]) {
    const scc = [];
    let w;
    do {
      w = tarjanStack.pop();
      tarjanOnStack.delete(w);
      scc.push(w);
    } while (w !== v);
    sccs.push(scc);
  }
}

for (const ide of liveSet) {
  if (tarjanIndices[ide] === undefined) {
    strongconnect(ide);
  }
}

// Map each node to its SCC index
const nodeToScc = {};
for (let i = 0; i < sccs.length; i++) {
  for (const node of sccs[i]) {
    nodeToScc[node] = i;
  }
}

// Build condensation graph (DAG of SCCs)
const sccCallees = sccs.map(() => new Set());
for (const ide of liveSet) {
  const sccIdx = nodeToScc[ide];
  for (const callee of (liveCalleeGraph[ide] || [])) {
    const calleeScc = nodeToScc[callee];
    if (calleeScc !== sccIdx) {
      sccCallees[sccIdx].add(calleeScc);
    }
  }
}

// Compute levels on the DAG of SCCs
const sccLevels = new Array(sccs.length).fill(-1);

function computeSccLevel(sccIdx) {
  if (sccLevels[sccIdx] !== -1) return sccLevels[sccIdx];

  const children = [...sccCallees[sccIdx]];
  if (children.length === 0) {
    sccLevels[sccIdx] = 0;
    return 0;
  }

  let maxChildLevel = 0;
  for (const child of children) {
    const childLevel = computeSccLevel(child);
    if (childLevel + 1 > maxChildLevel) {
      maxChildLevel = childLevel + 1;
    }
  }

  sccLevels[sccIdx] = maxChildLevel;
  return maxChildLevel;
}

for (let i = 0; i < sccs.length; i++) {
  computeSccLevel(i);
}

// Assign levels to individual programs
const levels = {};
for (const ide of liveSet) {
  levels[ide] = sccLevels[nodeToScc[ide]];
}

// Log multi-node SCCs (cycles)
const multiNodeSccs = sccs.filter(s => s.length > 1);
if (multiNodeSccs.length > 0) {
  console.log(`Found ${multiNodeSccs.length} cycles (multi-node SCCs):`);
  for (const scc of multiNodeSccs) {
    console.log(`  SCC: [${scc.join(', ')}] -> level ${sccLevels[nodeToScc[scc[0]]]}`);
  }
}

// ===== Build output =====
const livePrograms = [];
const orphanPrograms = [];

for (const ide of Object.keys(programs).map(Number).sort((a, b) => a - b)) {
  const p = programs[ide];
  if (liveSet.has(ide)) {
    livePrograms.push({
      ide,
      name: p.name,
      complexity: p.complexity,
      level: levels[ide] || 0,
      callers: p.callers,
      callees: p.callees,
      source: sourceMap[ide] || 'bfs',
      domain: ''
    });
  } else {
    orphanPrograms.push({
      ide,
      name: p.name,
      reason: 'No path from seeds'
    });
  }
}

// Build levels map
const levelMap = {};
for (const prog of livePrograms) {
  const lvl = prog.level.toString();
  if (!levelMap[lvl]) levelMap[lvl] = [];
  levelMap[lvl].push(prog.ide);
}

// Sort each level array
for (const lvl in levelMap) {
  levelMap[lvl].sort((a, b) => a - b);
}

const maxLevel = Math.max(...livePrograms.map(p => p.level), 0);

const programsByLevel = {};
for (let i = 0; i <= maxLevel; i++) {
  programsByLevel[i.toString()] = (levelMap[i.toString()] || []).length;
}

// ===== Output files =====

// File 1: live-programs.json
const liveProgramsJson = {
  generated: '2026-02-11',
  method: 'BFS from seeds + ECF',
  total_adh: Object.keys(programs).length,
  live_count: livePrograms.length,
  orphan_count: orphanPrograms.length,
  seeds: SEED_PROGRAMS,
  ecf_programs: ECF_PROGRAMS,
  programs: livePrograms,
  orphans: orphanPrograms
};

// File 2: dependency-graph.json
const depGraphJson = {
  generated: '2026-02-11',
  levels: levelMap,
  max_level: maxLevel,
  programs_by_level: programsByLevel
};

// Write files
const migDir = path.join(BASE, 'migration');
if (!fs.existsSync(migDir)) {
  fs.mkdirSync(migDir, { recursive: true });
}

fs.writeFileSync(path.join(migDir, 'live-programs.json'), JSON.stringify(liveProgramsJson, null, 2));
fs.writeFileSync(path.join(migDir, 'dependency-graph.json'), JSON.stringify(depGraphJson, null, 2));

// ===== Update tracker.json if it exists =====
const trackerPath = path.join(migDir, 'tracker.json');
if (fs.existsSync(trackerPath)) {
  const tracker = JSON.parse(fs.readFileSync(trackerPath, 'utf8'));
  tracker.stats = tracker.stats || {};
  tracker.stats.total_adh = Object.keys(programs).length;
  tracker.stats.live_count = livePrograms.length;
  tracker.stats.orphan_count = orphanPrograms.length;
  tracker.stats.max_level = maxLevel;
  tracker.stats.last_computed = '2026-02-11';
  fs.writeFileSync(trackerPath, JSON.stringify(tracker, null, 2));
  console.log('\nUpdated tracker.json stats');
}

// Print summary
console.log('\n=== BUILD GRAPH RESULTS ===');
console.log('Total ADH programs:', Object.keys(programs).length);
console.log('Live programs:', livePrograms.length);
console.log('Orphan programs:', orphanPrograms.length);
console.log('Max level:', maxLevel);
console.log('\nPrograms by level:');
for (let i = 0; i <= maxLevel; i++) {
  const count = programsByLevel[i.toString()] || 0;
  if (count > 0) {
    console.log(`  Level ${i}: ${count} programs`);
  }
}
console.log('\nGraph stats:');
console.log('  Programs with callees:', Object.values(calleeGraph).filter(a => a.length > 0).length);
console.log('  Programs with callers:', Object.values(callerGraph).filter(a => a.length > 0).length);
console.log('  Total callee edges:', Object.values(calleeGraph).reduce((s, a) => s + a.length, 0));
console.log('\nWarnings:', warnings.length);
for (const w of warnings) console.log('  ', w);

console.log('\nSample live programs (first 10):');
livePrograms.slice(0, 10).forEach(p => console.log(`  IDE ${p.ide}: ${p.name} (L${p.level}, ${p.source}, callees: [${p.callees.join(',')}])`));

console.log('\nSample orphans (first 10):');
orphanPrograms.slice(0, 10).forEach(p => console.log(`  IDE ${p.ide}: ${p.name}`));

console.log('\nPrograms with most callees:');
const sortedByCallees = [...livePrograms].sort((a, b) => b.callees.length - a.callees.length);
sortedByCallees.slice(0, 5).forEach(p => console.log(`  IDE ${p.ide}: ${p.name} -> ${p.callees.length} callees`));

console.log('\nSeeds details:');
for (const s of SEED_PROGRAMS) {
  const p = programs[s];
  console.log(`  IDE ${s}: ${p.name} -> callees: [${(calleeGraph[s] || []).join(',')}] (level ${levels[s]})`);
}

// Check for programs with missing names
const missingNames = livePrograms.filter(p => !p.name);
if (missingNames.length > 0) {
  console.log(`\nWARNING: ${missingNames.length} live programs have no name extracted:`);
  missingNames.forEach(p => console.log(`  IDE ${p.ide}`));
}
