import { describe, it, expect } from 'vitest';
import { buildProgramIR } from '../src/ir-builder.js';
import * as fs from 'node:fs';
import * as path from 'node:path';

describe('Benchmark - Parser Performance', () => {
  it('should parse minimal program in < 100ms', () => {
    const xmlPath = path.join(__dirname, 'fixtures', 'minimal-program.xml');
    const start = Date.now();
    
    const result = buildProgramIR(100, xmlPath);
    
    expect(result.duration).toBeLessThan(100);
    expect(result.ir.id).toBe(100);
  });

  it('should parse complex program in < 5000ms', () => {
    const xmlPath = path.join(__dirname, 'fixtures', 'complex-program.xml');
    const start = Date.now();
    
    const result = buildProgramIR(200, xmlPath);
    
    expect(result.duration).toBeLessThan(5000);
    expect(result.ir.metadata.complexity).toBe('HIGH');
    expect(result.ir.tasks.length).toBe(60);
  });
});
