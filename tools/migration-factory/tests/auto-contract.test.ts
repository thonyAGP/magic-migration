import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateAutoContract } from '../src/generators/auto-contract.js';

// Mock fs for spec file reading
vi.mock('node:fs', async () => {
  const actual = await vi.importActual<typeof import('node:fs')>('node:fs');
  return {
    ...actual,
    default: {
      ...actual,
      existsSync: vi.fn((p: string) => {
        if (typeof p === 'string' && p.includes('nonexistent')) return false;
        if (typeof p === 'string' && p.includes('.md')) return true;
        if (typeof p === 'string' && p.includes('codebase')) return true;
        return actual.existsSync(p);
      }),
      readFileSync: vi.fn((p: string) => {
        if (typeof p === 'string' && p.includes('.md')) {
          return MOCK_SPEC;
        }
        return actual.readFileSync(p, 'utf8');
      }),
      readdirSync: vi.fn((_dir: string, opts?: unknown) => {
        // Return empty dirs for codebase scanning
        return [];
      }),
    },
  };
});

const MOCK_SPEC = `# ADH IDE 237 - Vente Gift Pass

| Element | Valeur |
|---------|--------|
| Taches | 3 |
| Tables modifiees | 2 |
| Expressions | 45 |
| Programmes appeles | 2 |

## 5. REGLES METIER

#### [RM-001] Verifier solde disponible
| **Condition** | \`solde >= montant\` |
| **Variables** | BA (W0 service village) |

## 10. TABLES

| ID | Nom | Description | Type | R | W | L | Usages |
|----|-----|-------------|------|---|---|---|--------|
| 849 | cafil008 | Adherents | Data | R | | | Lecture |
| 120 | ccventes | Ventes | Data | R | W | | Ecriture |

### 13.4 Detail des appels

| IDE | Programme | Appels | Contexte |
|-----|-----------|--------|----------|
| [229](link) | Edition ticket | 3 | Print |
| [181](link) | Raz Current Printer | 1 | Reset |
`;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('generateAutoContract', () => {
  it('should return null for nonexistent spec', () => {
    const result = generateAutoContract({
      specFile: '/nonexistent/spec.md',
      codebaseDir: '/codebase',
    });
    expect(result).toBeNull();
  });

  it('should generate contract from spec', () => {
    const result = generateAutoContract({
      specFile: '/specs/ADH-IDE-237.md',
      codebaseDir: '/codebase',
    });

    expect(result).not.toBeNull();
    expect(result!.program.id).toBe(237);
    expect(result!.program.name).toBe('Vente Gift Pass');
    expect(result!.program.tasksCount).toBe(3);
    expect(result!.program.expressionsCount).toBe(45);
  });

  it('should classify known N/A patterns', () => {
    const result = generateAutoContract({
      specFile: '/specs/ADH-IDE-237.md',
      codebaseDir: '/codebase',
    });

    // "Raz Current Printer" should be auto-N/A
    const razPrinter = result!.callees.find(c => c.id === 181);
    expect(razPrinter).toBeDefined();
    expect(razPrinter!.status).toBe('N/A');
  });

  it('should compute coverage correctly', () => {
    const result = generateAutoContract({
      specFile: '/specs/ADH-IDE-237.md',
      codebaseDir: '/codebase',
    });

    expect(result!.overall.calleesTotal).toBe(2);
    expect(result!.overall.rulesTotal).toBe(1);
    expect(result!.overall.coveragePct).toBeGreaterThanOrEqual(0);
    expect(result!.overall.coveragePct).toBeLessThanOrEqual(100);
  });

  it('should use contracted as default initial status', () => {
    const result = generateAutoContract({
      specFile: '/specs/ADH-IDE-237.md',
      codebaseDir: '/codebase',
    });

    expect(result!.overall.status).toBe('contracted');
  });

  it('should accept custom initial status', () => {
    const result = generateAutoContract({
      specFile: '/specs/ADH-IDE-237.md',
      codebaseDir: '/codebase',
      initialStatus: 'pending',
    });

    expect(result!.overall.status).toBe('pending');
  });

  it('should include generated timestamp and notes', () => {
    const result = generateAutoContract({
      specFile: '/specs/ADH-IDE-237.md',
      codebaseDir: '/codebase',
    });

    expect(result!.overall.generated).toBeTruthy();
    expect(result!.overall.notes).toContain('Auto-generated');
  });
});
