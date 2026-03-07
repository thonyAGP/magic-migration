import { describe, it, expect, beforeEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { buildProgramIR } from '../src/ir-builder.js';

describe('IR Builder', () => {
  const fixturesDir = path.join(__dirname, 'fixtures');
  
  beforeEach(() => {
    if (!fs.existsSync(fixturesDir)) {
      fs.mkdirSync(fixturesDir, { recursive: true });
    }
  });

  describe('buildProgramIR', () => {
    it('should build IR from minimal XML', () => {
      const xmlPath = path.join(fixturesDir, 'minimal-program.xml');
      const minimalXML = `<?xml version="1.0" encoding="UTF-8"?>
<Program ISN="100" Name="TestProgram">
  <TasksTree>
    <Task ISN="1" TaskID="1.0" Level="0">
    </Task>
  </TasksTree>
</Program>`;
      
      fs.writeFileSync(xmlPath, minimalXML, 'utf-8');
      
      const result = buildProgramIR(100, xmlPath);
      
      expect(result.ir.id).toBe(100);
      expect(result.ir.name).toBe('TestProgram');
      expect(result.ir.tasks.length).toBeGreaterThan(0);
      expect(result.duration).toBeGreaterThan(0);
      expect(result.errors).toEqual([]);
    });

    it('should detect complexity', () => {
      const xmlPath = path.join(fixturesDir, 'complex-program.xml');
      const complexXML = `<?xml version="1.0" encoding="UTF-8"?>
<Program ISN="200" Name="ComplexProgram">
  <TasksTree>
    ${Array.from({ length: 60 }, (_, i) => `<Task ISN="${i+1}" TaskID="${i+1}.0" Level="0"></Task>`).join('\n    ')}
  </TasksTree>
</Program>`;
      
      fs.writeFileSync(xmlPath, complexXML, 'utf-8');
      
      const result = buildProgramIR(200, xmlPath);
      
      expect(result.ir.metadata.complexity).toBe('HIGH');
    });
  });
});
