import { describe, it, expect } from 'vitest';
import { parseDataSources } from '../src/datasources-parser.js';

const DATA_SOURCES_PATH = 'D:\\Data\\Migration\\XPA\\PMS\\REF\\Source\\DataSources.xml';

describe('parseDataSources', () => {
  it('should parse 957 tables from DataSources.xml', () => {
    const registry = parseDataSources(DATA_SOURCES_PATH);

    expect(registry.totalTables).toBe(957);
    expect(registry.tables).toHaveLength(957);
    expect(registry.source).toBe(DATA_SOURCES_PATH);
    expect(registry.generated).toBeTruthy();
  });

  it('should parse table 40 (comptable________cte) with columns', () => {
    const registry = parseDataSources(DATA_SOURCES_PATH);
    const table40 = registry.tables.find(t => t.isn === 40);

    expect(table40).toBeDefined();
    expect(table40!.name).toBe('comptable________cte');
    expect(table40!.columns.length).toBeGreaterThan(40); // Expected: 47 columns
  });

  it('should classify tables with tempo in name as MEMORY', () => {
    const registry = parseDataSources(DATA_SOURCES_PATH);
    const tempoTable = registry.tables.find(t => t.name.includes('tempo'));

    expect(tempoTable).toBeDefined();
    expect(tempoTable!.type).toBe('MEMORY');
  });

  it('should parse column types correctly', () => {
    const registry = parseDataSources(DATA_SOURCES_PATH);
    const table40 = registry.tables.find(t => t.isn === 40);

    expect(table40).toBeDefined();
    expect(table40!.columns.length).toBeGreaterThan(0);

    // Verify column structure
    const firstCol = table40!.columns[0];
    expect(firstCol.isn).toBeGreaterThan(0);
    expect(firstCol.name).toBeTruthy();
    expect(['ALPHA', 'NUMERIC', 'DATE', 'TIME', 'LOGICAL', 'UNICODE', 'BLOB', 'MEMO']).toContain(firstCol.type);
  });

  it('should find all FILE tables used in IDE 236 (13 tables)', () => {
    const registry = parseDataSources(DATA_SOURCES_PATH);
    // Note: ISN 1037 is a MEMORY table not in DataSources.xml (created at runtime)
    const ide236FileTableIsns = [847, 596, 34, 77, 67, 867, 40, 878, 31, 69, 263, 904, 728];

    const foundTables = ide236FileTableIsns.map(isn => registry.tables.find(t => t.isn === isn));
    const foundCount = foundTables.filter(t => t !== undefined).length;

    expect(foundCount).toBe(13); // All 13 FILE tables should be present
    expect(foundTables.every(t => t !== undefined)).toBe(true);
  });
});
