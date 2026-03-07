import { describe, it, expect } from 'vitest';
import { mapGlobalVar, getAllGlobalVars } from '../src/vg-mapper.js';

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
