import { describe, it, expect } from 'vitest';
import { mapGlobalVar, getAllGlobalVars, buildVgRegistry } from '../src/vg-mapper.js';

const ADH_PROGRAMS_DIR = 'D:\\Data\\Migration\\XPA\\PMS\\ADH\\Source';

describe('VG Mapper', () => {
  it('should map VG38 to language code', () => {
    const vg = mapGlobalVar(38);
    expect(vg).toBeDefined();
    expect(vg?.name).toBe('VG_LANGUAGE');
    expect(vg?.type).toBe('ALPHA');
  });

  it('should return all mapped VG variables', () => {
    const allVG = getAllGlobalVars();
    expect(allVG.length).toBeGreaterThan(0);
    expect(allVG.every(v => v.vgId > 0)).toBe(true);
  });
});

describe('buildVgRegistry', () => {
  it('should scan and find VG variables (40+)', () => {
    const registry = buildVgRegistry(ADH_PROGRAMS_DIR);

    // Should find 89 VG from Prg_1.xml
    expect(registry.totalVars).toBeGreaterThanOrEqual(40);
    expect(registry.variables).toHaveLength(registry.totalVars);
    expect(registry.generated).toBeTruthy();
  });

  it('should find VG78 (missing in IDE 236)', () => {
    const registry = buildVgRegistry(ADH_PROGRAMS_DIR);
    const vg78 = registry.variables.find(v => v.vgId === 78);

    expect(vg78).toBeDefined();
    expect(vg78!.name).toContain('VG'); // Real name from XML (e.g., "VG Type de Triplet")
    expect(vg78!.vgId).toBe(78);
    expect(vg78!.category).toBe('CONFIG');
  });

  it('should categorize SESSION VG variables correctly', () => {
    const registry = buildVgRegistry(ADH_PROGRAMS_DIR);
    const vg38 = registry.variables.find(v => v.vgId === 38);
    const vg60 = registry.variables.find(v => v.vgId === 60);
    const vg63 = registry.variables.find(v => v.vgId === 63);

    if (vg38) expect(vg38.category).toBe('SESSION');
    if (vg60) expect(vg60.category).toBe('SESSION');
    if (vg63) expect(vg63.category).toBe('SESSION');
  });

  it('should track which programs use each VG', () => {
    const registry = buildVgRegistry(ADH_PROGRAMS_DIR);
    const firstVg = registry.variables[0];

    expect(firstVg.usedIn).toBeDefined();
    expect(Array.isArray(firstVg.usedIn)).toBe(true);
    expect(firstVg.usedIn.length).toBeGreaterThan(0);
  });
});
