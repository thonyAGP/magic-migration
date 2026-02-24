# Plan d'Amélioration Robustesse Factory CLI

> **Créé**: 2026-02-24
> **Objectif**: Garantir logging structuré, traçabilité 100% des expressions legacy, et capitalisation des learnings

---

## 📊 État Actuel (Baseline)

| Dimension | État | Score |
|-----------|------|-------|
| Tests | 548 tests, 42 fichiers | ✅ 70% |
| Logging | 190 `console.log` | ❌ 0% |
| Traçabilité Expressions | Tracking règles, pas expressions | ⚠️ 40% |
| Historisation | Aucun système | ❌ 0% |
| Coverage 100% | Pas de vérification automatique | ❌ 0% |
| Gestion erreurs | 72 try/catch disséminés | ⚠️ 30% |

**Score global : 23% - CRITIQUE**

---

## 🔴 Gaps Critiques Identifiés

### 1. Logging Non-Structuré (Priorité 1)

**Problème :**
- 190 `console.log/error/warn` au lieu d'un logger structuré (pino)
- Impossible d'analyser les erreurs en production
- Pas de correlation IDs pour tracer une migration bout-en-bout

**Impact :**
- ❌ Si une migration échoue à 3h du matin, impossible de savoir pourquoi
- ❌ Pas de métriques de performance (temps par phase)
- ❌ Impossible de détecter les patterns d'échec

**Solution :**
```typescript
// Au lieu de
console.log('Processing program', id);

// Utiliser pino avec contexte
logger.info({ programId: id, phase: 'extract', correlationId }, 'Processing program');
```

---

### 2. Traçabilité Expression-par-Expression (Priorité 1)

**Problème actuel :**
```yaml
# Contract actuel
rules:
  - id: R1
    description: "Display error message when validation fails"
    status: IMPL  # ← OK mais pas assez granulaire
```

**Ce qui manque :**
```yaml
rules:
  - id: R1
    legacy_expressions:  # ← MANQUANT
      - expr_id: "Prg_237:Task_5:Line_12:Expr_30"
        formula: "IF({0,3}='E',Msg('Error'))"
        mapped_to: "validationSchema.ts:42"
        test_file: "validation.test.ts:15"
        verified: true
      - expr_id: "Prg_237:Task_5:Line_18:Expr_45"
        formula: "Update(operation,A,{1,3})"
        mapped_to: "api/operations.ts:88"
        test_file: "operations.test.ts:22"
        verified: true
```

**Impact :**
- ❌ Pas de garantie que TOUTES les expressions sont couvertes
- ❌ Si une expression est oubliée, impossible de le détecter
- ❌ Pas de traçabilité legacy → moderne

---

### 3. Tests de Vérification 100% (Priorité 1)

**Ce qui manque :**
```typescript
// Test automatique qui garantit la couverture
describe('Expression Coverage', () => {
  it('should verify ALL legacy expressions are tested', async () => {
    const contract = parseContract('PRG_237.contract.yaml');

    for (const rule of contract.rules) {
      for (const expr of rule.legacy_expressions) {
        // Vérifier que expr.test_file existe
        expect(fs.existsSync(expr.test_file)).toBe(true);

        // Vérifier que le test couvre bien cette expression
        const testContent = fs.readFileSync(expr.test_file, 'utf8');
        expect(testContent).toContain(expr.expr_id);

        // Exécuter le test et vérifier qu'il passe
        const result = await runTest(expr.test_file);
        expect(result.status).toBe('passed');
      }
    }
  });
});
```

---

### 4. Historisation et Capitalisation (Priorité 2)

**Structure nécessaire :**

```
.migration-history/
├── decisions/
│   ├── 2026-02-24-validation-pattern.md
│   ├── 2026-02-23-error-handling.md
│   └── 2026-02-22-table-mapping.md
├── failures/
│   ├── PRG_237-failed-2026-02-24.json
│   └── PRG_184-failed-2026-02-20.json
├── patterns/
│   ├── if-error-then-msg.yaml
│   ├── update-operation.yaml
│   └── calculate-sum.yaml
└── learnings.md
```

**Template decision :**
```markdown
# Decision: [Titre]

## Context
[Contexte du problème]

## Legacy Pattern
```magic
[Code legacy]
```

## Modern Pattern
```typescript
[Code moderne]
```

## Why This Way
- Raison 1
- Raison 2

## Test Coverage
- [Fichiers de test]

## Applied To
- [Programmes concernés]
```

---

### 5. Coverage Metrics (Priorité 2)

**Ajouter dans `package.json` :**
```json
{
  "scripts": {
    "test:coverage": "vitest run --coverage",
    "test:expression-coverage": "tsx scripts/verify-expression-coverage.ts"
  },
  "devDependencies": {
    "@vitest/coverage-v8": "^3.0.0"
  }
}
```

---

## 📋 Plan d'Action

### Phase 1: Fondations (Semaine 1)

| Tâche | Effort | Impact | Status |
|-------|--------|--------|--------|
| Installer pino + correlation IDs | 4h | 🔥 Critique | ⏳ En cours |
| Remplacer tous les console.log | 8h | 🔥 Critique | 📝 TODO |
| Créer `scripts/verify-expression-coverage.ts` | 6h | 🔥 Critique | 📝 TODO |
| Ajouter `@vitest/coverage-v8` | 1h | Moyen | 📝 TODO |

### Phase 2: Traçabilité (Semaine 2)

| Tâche | Effort | Impact | Status |
|-------|--------|--------|--------|
| Enrichir contrats avec `legacy_expressions` | 12h | 🔥 Critique | 📝 TODO |
| Créer tests auto vérification 100% | 8h | 🔥 Critique | 📝 TODO |
| Implémenter `.migration-history/` | 6h | Haut | 📝 TODO |

### Phase 3: Capitalisation (Semaine 3)

| Tâche | Effort | Impact | Status |
|-------|--------|--------|--------|
| Créer `decisions/` template | 2h | Moyen | 📝 TODO |
| Hook post-migration → capture learnings | 4h | Moyen | 📝 TODO |
| Dashboard "Patterns Learned" | 6h | Moyen | 📝 TODO |

---

## 🎯 Garantie 100% Coverage - Architecture

### ExpressionTrace Interface

```typescript
// src/verifiers/expression-verifier.ts
export interface ExpressionTrace {
  exprId: string;          // "Prg_237:Task_5:Line_12:Expr_30"
  legacyFormula: string;   // "IF({0,3}='E',Msg('Error'))"
  modernFile: string;      // "src/validation.ts"
  modernLine: number;      // 42
  testFile: string;        // "tests/validation.test.ts"
  testLine: number;        // 15
  verified: boolean;       // true si le test passe
  lastVerified: string;    // ISO date
}

export interface CoverageReport {
  covered: number;
  total: number;
  gaps: ExpressionTrace[];
  coveragePct: number;
}
```

### Verification Algorithm

```typescript
export const verifyExpressionCoverage = async (
  contract: MigrationContract
): Promise<CoverageReport> => {
  const allExpressions = extractAllExpressions(contract);
  const gaps: ExpressionTrace[] = [];

  for (const expr of allExpressions) {
    // 1. Vérifier que le fichier moderne existe
    if (!fs.existsSync(expr.modernFile)) {
      gaps.push({ ...expr, verified: false });
      continue;
    }

    // 2. Vérifier que le test existe
    if (!fs.existsSync(expr.testFile)) {
      gaps.push({ ...expr, verified: false });
      continue;
    }

    // 3. Exécuter le test et vérifier qu'il passe
    const testResult = await runTest(expr.testFile);
    if (!testResult.passed) {
      gaps.push({ ...expr, verified: false });
      continue;
    }
  }

  return {
    covered: allExpressions.length - gaps.length,
    total: allExpressions.length,
    gaps,
    coveragePct: Math.round((allExpressions.length - gaps.length) / allExpressions.length * 100),
  };
};
```

---

## 🚀 Quick Wins (Implémentation Immédiate)

### 1. Logger Structuré (2h) ✅ EN COURS

```bash
pnpm add pino pino-pretty
```

**Fichiers à créer :**
- `src/utils/logger.ts` - Logger configuré
- `src/core/correlation.ts` - Middleware correlation ID

**Stratégie de remplacement :**
1. Créer le logger avec config développement/production
2. Remplacer progressivement par domaine:
   - `src/pipeline/` en premier (critique)
   - `src/migrate/` ensuite
   - `src/generators/` après
3. Tests: mocker le logger dans les tests existants

### 2. Correlation ID Middleware (1h)

```typescript
// src/core/correlation.ts
import { randomUUID } from 'node:crypto';

export const withCorrelation = <T>(
  fn: (correlationId: string) => Promise<T>
): Promise<T> => {
  const correlationId = randomUUID();
  return fn(correlationId);
};
```

### 3. Expression Coverage Report (3h)

```typescript
// scripts/verify-expression-coverage.ts
const report = await verifyExpressionCoverage(contract);

console.log(`
Expression Coverage: ${report.covered}/${report.total} (${report.coveragePct}%)

Gaps (${report.gaps.length}):
${report.gaps.map(g => `  ❌ ${g.exprId}: ${g.legacyFormula}`).join('\n')}
`);

if (report.gaps.length > 0) process.exit(1);
```

---

## 📈 KPIs de Succès

| Métrique | Avant | Objectif | Mesure |
|----------|-------|----------|--------|
| Logger structuré | 0% | 100% | Aucun console.log dans src/ |
| Expression coverage | 0% | 100% | Script verify-expression-coverage |
| Failures historisés | 0% | 100% | JSON dans .migration-history/failures/ |
| Patterns documentés | 0 | 10+ | Fichiers dans .migration-history/patterns/ |
| Decisions archivées | 0 | 5+ | Fichiers dans .migration-history/decisions/ |

---

## 💡 Recommandation Finale

**Sans ces améliorations, AUCUNE garantie que:**
- ✅ Toutes les expressions legacy sont couvertes
- ✅ Les mappings sont corrects et testés
- ✅ Vous pouvez débugger les erreurs en production
- ✅ Vous capitalisez sur les échecs

**Effort total estimé : 3 semaines (60-80h)**
**ROI : Confiance 100% dans la migration + Vitesse x3 sur les prochains programmes**

---

## 🔄 Suivi d'Avancement

### 2026-02-24 - Session 1: Logger Structuré

- [x] Audit initial réalisé (score 23%)
- [x] Plan créé et sauvegardé
- [x] Phase 1.1: Logger structuré - TERMINÉ (commit `16c739f7`)
  - [x] pino + pino-pretty installés
  - [x] src/utils/logger.ts créé (logger structuré, redaction automatique)
  - [x] src/core/correlation.ts créé (correlation IDs, batch logging)
  - [x] tests/logger.test.ts créé (9 tests passants)
  - [x] tests/utils/logger-mock.ts créé (mocks pour autres tests)
  - [x] Documentation:
    - docs/logging-migration-example.md (avant/après)
    - docs/logger-quick-reference.md (guide complet)

- [x] Phase 1.2: Logging applicatif - TERMINÉ (commit `8eca7f7a`)
  - [x] action-server.ts: Correlation IDs par requête HTTP
  - [x] codegen-runner.ts: Logging génération de fichiers
  - [x] docs/console-vs-logger.md: Guide de décision
  - [x] Stratégie: console.log (UX) + logger (tracing interne)

**Tests**: 557 passed, tous passants ✅

### À venir (Phase 1 restante)
- [ ] Phase 1.3: Expression coverage script (6h)
- [ ] Phase 1.4: Coverage metrics vitest (1h)
