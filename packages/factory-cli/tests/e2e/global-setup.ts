/**
 * Playwright Global Setup: reset test fixtures before each run.
 * Ensures tracker.json is restored to its initial state (pipeline runs may mutate it).
 */
import fs from 'node:fs';
import path from 'node:path';

const FIXTURES_DIR = path.resolve(import.meta.dirname, 'fixtures');
const ADH_DIR = path.join(FIXTURES_DIR, '.openspec', 'migration', 'ADH');

/** Original contract for program 105 — reset before each run (enrichment mutates it). */
const CONTRACT_105_INITIAL = `program:
  id: 105
  name: SMOKE_LEAF_3
  complexity: LOW
  callers:
    - 102
  callees: []
  tasks_count: 1
  tables_count: 1
  expressions_count: 2
rules:
  - local_id: R1
    description: "Validate user input"
    category: validation
    status: MISSING
    target_file: ""
    gap_notes: "Not yet implemented"
variables:
  - local_id: A
    name: amount
    type: Numeric
    status: MISSING
    target_file: ""
    gap_notes: "Needs mapping"
tables: []
callees: []
overall:
  rules_total: 1
  rules_impl: 0
  rules_partial: 0
  rules_missing: 1
  rules_na: 0
  variables_key_count: 1
  callees_total: 0
  callees_impl: 0
  callees_missing: 0
  coverage_pct: 0
  status: contracted
  generated: "2026-02-25"
  notes: "Contract needing enrichment for E2E test"
`;

/** Original contract for program 101 — reset before each run (enrichment mutates it). */
const CONTRACT_101_INITIAL = `program:
  id: 101
  name: "Test Tables Only"
  complexity: LOW
  callers: []
  callees: []
  tasks_count: 2
  tables_count: 3
  expressions_count: 0
rules: []
variables: []
tables:
  - id: 1
    name: test_caisse_histo
    mode: R
    status: MISSING
    target_file: ""
    gap_notes: ""
  - id: 2
    name: test_vente
    mode: R
    status: MISSING
    target_file: ""
    gap_notes: ""
  - id: 3
    name: test_sessions
    mode: R
    status: MISSING
    target_file: ""
    gap_notes: ""
callees: []
overall:
  rules_total: 0
  rules_impl: 0
  rules_partial: 0
  rules_missing: 0
  rules_na: 0
  variables_key_count: 0
  callees_total: 0
  callees_impl: 0
  callees_missing: 0
  coverage_pct: 0
  status: contracted
  generated: "2026-02-25"
  notes: "E2E test fixture - 3 tables only"
`;

const TRACKER_INITIAL = {
  version: '1.0',
  methodology: 'SPECMAP',
  created: '2026-02-25',
  updated: '2026-02-25',
  status: 'active',
  stats: {
    total_programs: 10,
    live_programs: 6,
    orphan_programs: 4,
    ecf_programs: 0,
    contracted: 4,
    enriched: 0,
    verified: 0,
    max_level: 3,
    last_computed: '2026-02-25',
  },
  batches: [
    {
      id: 'B-TEST-1',
      name: 'Smoke Test Batch',
      root: 100,
      programs: 3,
      status: 'contracted',
      stats: { backend_na: 0, frontend_enrich: 0, fully_impl: 0, coverage_avg_frontend: 0, total_partial: 0, total_missing: 3 },
      priority_order: [100, 101, 102],
    },
    {
      id: 'B-TEST-2',
      name: 'Smoke Test Batch 2',
      root: 103,
      programs: 2,
      status: 'contracted',
      stats: { backend_na: 0, frontend_enrich: 0, fully_impl: 0, coverage_avg_frontend: 0, total_partial: 0, total_missing: 2 },
      priority_order: [103, 104],
    },
    {
      id: 'B-TEST-EMPTY',
      name: 'Smoke Test Batch Empty',
      root: 105,
      programs: 1,
      status: 'pending',
      stats: { backend_na: 0, frontend_enrich: 0, fully_impl: 0, coverage_avg_frontend: 0, total_partial: 0, total_missing: 1 },
      priority_order: [105],
    },
  ],
  notes: ['E2E test fixtures - do not modify'],
};

export default async function globalSetup() {
  // Reset tracker to initial state
  const trackerPath = path.join(ADH_DIR, 'tracker.json');
  fs.writeFileSync(trackerPath, JSON.stringify(TRACKER_INITIAL, null, 2), 'utf8');

  // Reset contract 105 to initial state (enrichment mutates it)
  const contract105Path = path.join(ADH_DIR, 'ADH-IDE-105.contract.yaml');
  fs.writeFileSync(contract105Path, CONTRACT_105_INITIAL, 'utf8');

  // Reset contract 101 to initial state (enrichment mutates it)
  const contract101Path = path.join(ADH_DIR, 'ADH-IDE-101.contract.yaml');
  fs.writeFileSync(contract101Path, CONTRACT_101_INITIAL, 'utf8');

  // Clean up any logs created by previous runs
  const logsDir = path.join(ADH_DIR, 'logs');
  if (fs.existsSync(logsDir)) {
    fs.rmSync(logsDir, { recursive: true, force: true });
  }
}
