import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { runSinglePhase } from '../src/migrate/migrate-runner.js';
import { MigratePhase } from '../src/migrate/migrate-types.js';
import type { MigrateConfig } from '../src/migrate/migrate-types.js';

describe('Pipeline V8 Integration', () => {
  const tmpDir = path.join(process.cwd(), 'test-tmp-v8');
  const config: MigrateConfig = {
    projectDir: tmpDir,
    targetDir: path.join(tmpDir, 'output'),
    migrationDir: path.join(tmpDir, '.openspec', 'migration'),
    specDir: path.join(tmpDir, '.openspec', 'specs'),
    contractSubDir: 'TEST',
    parallel: 1,
    maxPasses: 3,
    dryRun: true,
    claudeMode: 'cli',
  };

  beforeEach(() => {
    fs.mkdirSync(tmpDir, { recursive: true });
    fs.mkdirSync(path.join(tmpDir, 'sources'), { recursive: true });
    fs.mkdirSync(path.join(tmpDir, '.factory', 'programs'), { recursive: true });
  });

  afterEach(() => {
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it.skip('should execute PARSE phase and generate IR', async () => {
    const programId = 100;
    const xmlPath = path.join(tmpDir, 'sources', 'Prg_100.xml');
    
    const minimalXML = `<?xml version="1.0" encoding="UTF-8"?>
<Program ISN="100" Name="TestProgram">
  <TasksTree>
    <Task ISN="1" TaskID="1.0" Level="0"></Task>
  </TasksTree>
</Program>`;
    
    fs.writeFileSync(xmlPath, minimalXML, 'utf-8');

    await runSinglePhase(MigratePhase.PARSE, [programId], config);

    const irPath = path.join(tmpDir, '.factory', 'programs', 'IDE-100', 'ir.json');
    expect(fs.existsSync(irPath)).toBe(true);
    
    const ir = JSON.parse(fs.readFileSync(irPath, 'utf-8'));
    expect(ir.id).toBe(100);
    expect(ir.name).toBe('TestProgram');
  });

  it.skip('should execute DATA_MODEL phase and generate schema', async () => {
    const irDir = path.join(tmpDir, '.factory', 'programs', 'IDE-100');
    fs.mkdirSync(irDir, { recursive: true });
    
    const mockIR = {
      id: 100,
      name: 'Test',
      dataViews: [
        { id: 1, tableId: 40, tableName: 'operations', columns: [] },
      ],
      tasks: [],
      variables: { local: [], global: [] },
      expressions: [],
      callGraph: { callers: [], callees: [], depth: 0 },
      metadata: { complexity: 'LOW', orphan: false, estimatedLOC: 10, taskCount: 1, variableCount: 0 },
    };
    
    fs.writeFileSync(path.join(irDir, 'ir.json'), JSON.stringify(mockIR), 'utf-8');

    await runSinglePhase(MigratePhase.DATA_MODEL, [100], config);

    const schemaPath = path.join(tmpDir, '.factory', 'data-model', 'schema.prisma');
    expect(fs.existsSync(schemaPath)).toBe(true);
    
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    expect(schema).toContain('datasource db');
    expect(schema).toContain('model');
  });
});
