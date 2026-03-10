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

    it('should build IR from real ADH XML (Prg_69.xml)', () => {
      const xmlPath = 'D:/Data/Migration/XPA/PMS/ADH/Source/Prg_69.xml';
      if (!fs.existsSync(xmlPath)) return; // skip if source not available

      const result = buildProgramIR(69, xmlPath);

      expect(result.ir.id).toBe(69);
      expect(result.ir.name).toBeTruthy(); // 'Extrait de compte' or similar
      expect(result.errors).toEqual([]);
      // ADH programs have sub-tasks
      expect(result.ir.tasks.length).toBeGreaterThan(0);
      // Should extract some handlers/logic from LogicUnits
      const allHandlers = result.ir.tasks.flatMap(t => t.handlers);
      expect(allHandlers.length).toBeGreaterThan(0);
      // Should find CALL lines (navigation to sub-programs)
      const allLines = allHandlers.flatMap(h => h.lines);
      const callLines = allLines.filter(l => l.type === 'CALL');
      expect(callLines.length).toBeGreaterThan(0);
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
