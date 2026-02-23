import { describe, it, expect } from 'vitest';
import { estimateBatchCost } from '../src/migrate/migrate-cost.js';
import type { CostEstimate } from '../src/migrate/migrate-cost.js';

describe('migrate-cost', () => {
  const samplePrograms = [
    { id: '121', name: 'GestionCaisse' },
    { id: '122', name: 'Login' },
    { id: '131', name: 'Fermeture' },
  ];

  it('should estimate cost for programs without contracts', () => {
    const estimate = estimateBatchCost(samplePrograms, '/nonexistent/dir', 'sonnet');

    expect(estimate.programCount).toBe(3);
    expect(estimate.programs).toHaveLength(3);
    expect(estimate.totals.inputTokens).toBeGreaterThan(0);
    expect(estimate.totals.outputTokens).toBeGreaterThan(0);
    expect(estimate.totals.costUsd).toBeGreaterThan(0);
    expect(estimate.model).toBe('sonnet');
  });

  it('should return lower cost for haiku model', () => {
    const sonnetEstimate = estimateBatchCost(samplePrograms, '/nonexistent', 'sonnet');
    const haikuEstimate = estimateBatchCost(samplePrograms, '/nonexistent', 'haiku');

    // Haiku should be cheaper (same tokens but lower price)
    expect(haikuEstimate.totals.costUsd).toBeLessThan(sonnetEstimate.totals.costUsd);
  });

  it('should return higher cost for opus model', () => {
    const sonnetEstimate = estimateBatchCost(samplePrograms, '/nonexistent', 'sonnet');
    const opusEstimate = estimateBatchCost(samplePrograms, '/nonexistent', 'opus');

    expect(opusEstimate.totals.costUsd).toBeGreaterThan(sonnetEstimate.totals.costUsd);
  });

  it('should include per-program breakdown', () => {
    const estimate = estimateBatchCost(samplePrograms, '/nonexistent', 'sonnet');

    for (const prog of estimate.programs) {
      expect(prog.inputTokens).toBeGreaterThan(0);
      expect(prog.outputTokens).toBeGreaterThan(0);
      expect(prog.costUsd).toBeGreaterThan(0);
      expect(prog.complexity).toBeGreaterThan(0);
    }

    // Sum of individual costs should approximately equal total
    const sumCost = estimate.programs.reduce((s, p) => s + p.costUsd, 0);
    expect(Math.abs(sumCost - estimate.totals.costUsd)).toBeLessThan(0.001);
  });
});
