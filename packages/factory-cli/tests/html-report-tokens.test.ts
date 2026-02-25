/**
 * Tests for HTML Report - Tokens tab structure and correctness.
 * Validates generated HTML contains required elements for the Tokens & Coûts tab.
 */

import { describe, it, expect } from 'vitest';
import { generateMultiProjectHtmlReport } from '../src/dashboard/html-report.js';
import type { MultiProjectReport, FullMigrationReport } from '../src/core/types.js';

const PROJECT_REPORT: FullMigrationReport = {
  generated: new Date().toISOString(),
  projectName: 'ADH',
  graph: {
    totalPrograms: 10,
    livePrograms: 8,
    orphanPrograms: 1,
    sharedPrograms: 1,
    maxLevel: 3,
    sccCount: 0,
  },
  pipeline: { pending: 1, contracted: 4, enriched: 2, verified: 1 },
  modules: { total: 3, deliverable: 1, close: 1, inProgress: 1, notStarted: 0, list: [] },
  decommission: { total: 8, ready: 1, notReady: 7, readyPrograms: [], notReadyPrograms: [] },
  batches: [],
  programs: [],
};

const MINIMAL_REPORT: MultiProjectReport = {
  generated: new Date().toISOString(),
  global: {
    totalProjects: 1,
    activeProjects: 1,
    totalLivePrograms: 8,
    totalVerified: 1,
    totalEnriched: 2,
    totalContracted: 4,
    totalPending: 1,
    overallProgressPct: 50,
  },
  projects: [{
    name: 'ADH',
    status: 'active',
    programCount: 8,
    description: 'Test project',
    report: PROJECT_REPORT,
  }],
};

describe('HTML Report - Tokens tab', () => {
  const html = generateMultiProjectHtmlReport(MINIMAL_REPORT);

  it('should contain --cyan CSS variable', () => {
    expect(html).toContain('--cyan:');
  });

  it('should contain tokens tab button in nav', () => {
    expect(html).toContain('data-project="tokens"');
    expect(html).toContain('Tokens');
  });

  it('should contain tokens tab content div', () => {
    expect(html).toContain('data-tab="tokens"');
    expect(html).toContain('id="tokens-content"');
  });

  it('should contain loadTokens function', () => {
    expect(html).toContain('function loadTokens()');
  });

  it('should check __MF_SERVER__ before fetching', () => {
    expect(html).toContain('__MF_SERVER__');
  });

  it('should check totalCalls for empty state', () => {
    expect(html).toContain('totalCalls');
    expect(html).toContain('Aucun token');
  });

  it('should fetch /api/tokens', () => {
    expect(html).toContain("fetch('/api/tokens')");
  });

  it('should check r.ok before parsing JSON', () => {
    expect(html).toContain('r.ok');
  });

  it('should display cost with costFmt helper', () => {
    expect(html).toContain('function costFmt');
    expect(html).toContain('.toFixed(2)');
  });

  it('should render batch section with phases column', () => {
    expect(html).toContain('Par batch');
    expect(html).toContain('Phases');
  });

  it('should render program section with percentage column', () => {
    expect(html).toContain('Par programme');
    expect(html).toContain('% total');
  });

  it('should contain all required CSS variables', () => {
    const requiredVars = ['--bg', '--card', '--border', '--text', '--text-dim', '--green', '--blue', '--purple', '--yellow', '--orange', '--red', '--gray', '--cyan'];
    for (const v of requiredVars) {
      expect(html).toContain(v + ':');
    }
  });
});
