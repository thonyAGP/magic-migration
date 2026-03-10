# CHG-003: Pipeline V8 - PARSE + DATA_MODEL

**Status**: PLANNING
**Date**: 2026-03-07
**Durée estimée**: 8 semaines (156h dev)
**Assigné**: Claude (Phase 2 Scénario B)

---

## Contexte

Suite au verdict SWARM unanime (7/7 agents) et validation Quick Fixes Phase 1, nous passons à l'implémentation du **Pipeline V8 Hybride** avec phases PARSE et DATA_MODEL.

**Problème actuel** :
- Pipeline V7.2 sans structure pré-mappée → Claude doit inférer 100% (90K tokens/prog)
- Coverage bloquée ~53-62% (impossible atteindre 80% sans PARSE/DATA_MODEL)
- Pas de reproductibilité (même input ≠ même output)

**Solution** :
- **Phase PARSE** : XML Magic → IR structurel (100% déterministe)
- **Phase DATA_MODEL** : Inférence relations (3 passes : Schema → Relations → Semantic)

---

## Objectifs

| Métrique | V7.2 Actuel | V8 Cible | Gain |
|----------|-------------|----------|------|
| **Coverage** | 53-62% | 85%+ | +30 points |
| **Tokens/prog** | ~50K | ~15K | **-70%** |
| **Reproductibilité** | Non | Oui (IR déterministe) | ✅ |
| **Timeline projet** | 35-40 sem | 27 sem | -8 à -13 sem |
| **Coût tokens** | $150/projet | $69/projet | **-54%** |

---

## Architecture Pipeline V8

### Phases Pipeline (20 phases)

```
Phase 0  : SPEC (inchangé)
Phase 1  : CONTRACT (inchangé)
Phase 2  : PARSE ← NOUVEAU (22h implémentation)
Phase 3  : DATA_MODEL ← NOUVEAU (36h implémentation)
Phase 4  : ANALYZE (optimisé avec IR + schema)
Phase 5-9: TYPES, STORE, API, PAGE, COMPONENTS (inchangés)
Phase 10-13: VERIFY-TSC, FIX-TSC, VERIFY-TESTS, FIX-TESTS (inchangés)
Phase 14: REMEDIATE (inchangé)
Phase 15: INTEGRATE (inchangé)
Phase 16: REVIEW (inchangé)
Phase 17: REFACTOR (inchangé)
```

### Phase 2 : PARSE (NOUVEAU)

**Objectif** : Lire XML Magic → AST structurel (100% déterministe)

**Input** :
- `ProgramHeaders.xml` : Métadonnées programme
- `Prg_XXX.xml` : Structure complète (tâches, handlers, data views)
- KB Magic : Expressions, variables, tables

**Output** :
```
.factory/programs/IDE-XXX/
  ├── ir.json           # IR structurel complet
  ├── tasks.json        # Arbre tâches avec handlers
  ├── variables.json    # Variables locales + globales
  ├── expressions.json  # Expressions résolues
  └── call-graph.json   # Dépendances programmes
```

**Artefacts IR** :
```typescript
interface ProgramIR {
  id: number;
  name: string;
  tasks: TaskNode[];
  variables: {
    local: LocalVar[];   // Field1 → A, Field26 → Z, etc.
    global: GlobalVar[]; // VG38, VG60, etc.
  };
  dataViews: DataView[];
  callGraph: {
    callers: number[];
    callees: number[];
  };
  metadata: {
    publicName?: string;
    orphan: boolean;
    complexity: 'LOW' | 'MEDIUM' | 'HIGH';
  };
}
```

**Fichiers à créer** :
```
packages/factory-cli/src/migrate/phases/
  └── phase-parse.ts (nouveau, ~400 lignes)

packages/parser/ (nouveau package)
  ├── package.json
  ├── src/
  │   ├── xml-parser.ts       # Parser XML avec fast-xml-parser
  │   ├── ir-builder.ts       # Construire IR depuis XML
  │   ├── ir-types.ts         # Interfaces TypeScript IR
  │   ├── variable-resolver.ts # FieldXXX → Lettres, VG mapping
  │   └── call-graph.ts       # Analyse dépendances
  └── tests/
      └── parser.test.ts
```

**Effort** : 22h (S1-S2)

---

### Phase 3 : DATA_MODEL (NOUVEAU)

**Objectif** : IR → Inférence relations (95% déterministe + 5% AI nommage)

**3 Passes Déterministes** :

#### Passe 1 : Schema Extraction (95% déterministe)
```typescript
// Depuis IR + call-graph
tables: Table[] = extractTables(ir.dataViews, callGraph);
columns: Column[] = extractColumns(ir.variables);
confidence: 95% (patterns FK évidents)
```

#### Passe 2 : Relation Inference (80% déterministe)
```typescript
// Patterns FK : _ID, _REF, NO_ suffixes
relations: Relation[] = inferRelations(tables, columns);
confidence: 80% (heuristiques)
```

#### Passe 3 : Semantic Enrichment (30% AI, 70% déterministe)
```typescript
// Nommage Prisma + classification tiers
schema: PrismaSchema = generateSchema(tables, relations);
naming: 30% AI (singularize, CamelCase)
classification: 70% déterministe (patterns métier)
```

**Output** :
```
.factory/data-model/
  ├── tables.json           # 60+ tables détectées
  ├── relations.json        # FK + confiance scoring
  ├── schema.prisma         # Prêt Prisma
  ├── global-vars-mapping.json # 40 VG documentées
  └── confidence-report.json   # Scoring par relation
```

**Fichiers à créer** :
```
packages/factory-cli/src/migrate/phases/
  └── phase-data-model.ts (nouveau, ~300 lignes)

packages/data-model/ (nouveau package)
  ├── package.json
  ├── src/
  │   ├── schema-extractor.ts    # Passe 1 : Extract tables
  │   ├── relation-inference.ts  # Passe 2 : Infer FK
  │   ├── semantic-enrichment.ts # Passe 3 : AI naming
  │   ├── schema-generator.ts    # Générer Prisma schema
  │   ├── vg-mapper.ts           # Mapper variables globales
  │   └── confidence-scorer.ts   # Scoring relations
  └── tests/
      └── data-model.test.ts
```

**Effort** : 36h (S3-S5)

---

### Phase 4 : ANALYZE (OPTIMISÉ)

**Avant (V7.2)** :
```typescript
// Claude reçoit :
- Spec markdown brut (texte non structuré)
- Contract rules (RuleM-XXX énumérées)
- 0 schéma pré-mappé
→ Prompt 90K tokens (100% AI infère tout)
```

**Après (V8)** :
```typescript
// Claude reçoit :
- IR structurel (tâches, variables resolved)
- Schema mappé (tables → TypeScript interfaces)
- Relations identifiées (FK, VG)
→ Prompt 15K tokens (70% pré-fait, 30% AI)
```

**Gain** : -83% tokens, +30% coverage

**Fichier à modifier** :
```
packages/factory-cli/src/migrate/phases/phase-analyze.ts
- Injecter IR + schema dans prompt Claude
- Réduire taille prompt (contexte structurel fourni)
```

**Effort** : 8h (S6)

---

## Timeline Détaillée (8 semaines)

### Semaine 1-2 : Phase PARSE (22h)

**Objectifs** :
- ✅ Créer package `@magic-migration/parser`
- ✅ Implémenter XML parser (fast-xml-parser)
- ✅ Builder IR complet (tâches, variables, expressions)
- ✅ Resolver variables (FieldXXX → Lettres)
- ✅ Call-graph builder
- ✅ Tests unitaires (100% coverage parser)

**Livrables** :
- `phase-parse.ts` fonctionnel
- `ir.json` généré pour IDE 236 (benchmark)
- Tests : 50 tests unitaires parser

**Validation** :
- Benchmark IDE 236 : IR généré en <5s
- 0 erreurs parsing sur 243 programmes ADH
- Coverage tests 100%

---

### Semaine 3-5 : Phase DATA_MODEL (36h)

**Objectifs** :
- ✅ Créer package `@magic-migration/data-model`
- ✅ Implémenter 3 passes (Schema → Relations → Semantic)
- ✅ Confidence scoring (CONFIRMED > 0.8)
- ✅ Prisma schema generator
- ✅ VG mapper (40 variables globales)
- ✅ Tests unitaires (100% coverage data-model)

**Livrables** :
- `phase-data-model.ts` fonctionnel
- `schema.prisma` généré pour ADH (60+ tables)
- `relations.json` avec scoring confiance
- Tests : 40 tests unitaires data-model

**Validation** :
- Benchmark IDE 236 : Schema généré en <10s
- 60+ tables détectées (vs 60 attendues)
- Relations : 80%+ confiance (CONFIRMED)

---

### Semaine 6 : Intégration + ANALYZE Optimisé (16h)

**Objectifs** :
- ✅ Intégrer PARSE + DATA_MODEL dans pipeline
- ✅ Modifier ANALYZE pour utiliser IR + schema
- ✅ Réduire prompt ANALYZE de 90K → 15K tokens
- ✅ Tests intégration pipeline

**Livrables** :
- Pipeline V8 fonctionnel (20 phases)
- ANALYZE prompt optimisé (-83% tokens)
- Tests : 20 tests intégration

**Validation** :
- Migration IDE 236 avec V8 : coverage 85%+
- Tokens ANALYZE : <20K (vs 90K avant)
- Pipeline E2E test passed

---

### Semaine 7-8 : Module Orchestrator + Feature Flags (52h)

**Objectifs** :
- ✅ Module-by-module orchestrator
- ✅ Feature flags route-level (Next.js)
- ✅ Dual-run monitoring (4 sem/module)
- ✅ Dashboard modulaire (HTML)
- ✅ Documentation complète

**Livrables** :
- `module-orchestrator.ts` (migration module-by-module)
- Feature flags Next.js (route-level switching)
- Dashboard HTML avec modules Scenario B
- Documentation : Guide migration modulaire

**Validation** :
- Pilot MOD_EXTRAIT avec V8 complet
- Coverage 85%+ validée
- Feature flags fonctionnels (A/B test)

---

## Structure Fichiers Finale

```
packages/
├── factory-cli/
│   ├── src/
│   │   ├── migrate/
│   │   │   ├── phases/
│   │   │   │   ├── phase-parse.ts ← NOUVEAU
│   │   │   │   ├── phase-data-model.ts ← NOUVEAU
│   │   │   │   └── phase-analyze.ts (modifié)
│   │   │   ├── module-orchestrator.ts ← NOUVEAU
│   │   │   └── migrate-runner.ts (modifié)
│   │   └── ...
│   └── ...
├── parser/ ← NOUVEAU PACKAGE
│   ├── package.json
│   ├── src/
│   │   ├── xml-parser.ts
│   │   ├── ir-builder.ts
│   │   ├── ir-types.ts
│   │   ├── variable-resolver.ts
│   │   └── call-graph.ts
│   └── tests/
│       └── parser.test.ts
└── data-model/ ← NOUVEAU PACKAGE
    ├── package.json
    ├── src/
    │   ├── schema-extractor.ts
    │   ├── relation-inference.ts
    │   ├── semantic-enrichment.ts
    │   ├── schema-generator.ts
    │   ├── vg-mapper.ts
    │   └── confidence-scorer.ts
    └── tests/
        └── data-model.test.ts
```

---

## Tests & Validation

### Tests Unitaires
- ✅ Parser : 50 tests (100% coverage)
- ✅ Data-model : 40 tests (100% coverage)
- ✅ ANALYZE : 10 tests (prompt optimisé)
- ✅ Intégration : 20 tests (pipeline E2E)

**Total** : 120 tests nouveaux

### Tests Benchmark
- ✅ IDE 236 (IRE Vente GP) : Reference program
- ✅ Parsing < 5s
- ✅ Data-model < 10s
- ✅ Coverage 85%+

### Pilot Module
- ✅ MOD_EXTRAIT (7 programmes)
- ✅ Pipeline V8 complet
- ✅ Validation coverage 85%+
- ✅ Tokens -70% confirmé

---

## Risques & Mitigations

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| **Parser Magic insuffisant** | HAUTE | 🔴 CRITIQUE | Benchmark sur 243 progs ADH, fail si >5% erreurs |
| **VG mal cartographiées** | MOYENNE | 🔴 CRITIQUE | Cartographie exhaustive VG AVANT phase DATA_MODEL |
| **Relations faux positifs** | FAIBLE | 🟡 MOYEN | Seuil CONFIRMED 0.8+ (conservateur), review manuel |
| **Effort sous-estimé** | MOYENNE | 🟡 MOYEN | Buffer 20% (8 → 10 sem worst case) |
| **Coverage < 85%** | FAIBLE | 🟠 HAUT | Pilot MOD_EXTRAIT valide avant scale |

---

## Budget & ROI

### Investissement Phase 2

| Poste | Effort | Coût |
|-------|--------|------|
| Dev Pipeline V8 | 156h | - |
| Tests | 40h | - |
| Documentation | 20h | - |
| **TOTAL** | **216h (8 sem)** | - |

### Économies Attendues

| Métrique | Économie/Projet | Sur 3 projets |
|----------|-----------------|---------------|
| Tokens | $81 ($150 → $69) | **$243** |
| Timeline | 8-13 sem (35 → 27) | 24-39 sem |
| Dev effort | ~80h (répétitions évitées) | 240h |

**ROI** : Break-even à S20 (semaine 20 projet)

---

## Prochaines Étapes Immédiates

### Semaine 1 (Démarrage)

**Jour 1-2** : Setup infrastructure
- [ ] Créer package `@magic-migration/parser`
- [ ] Créer package `@magic-migration/data-model`
- [ ] Setup monorepo structure
- [ ] Initialiser tests frameworks

**Jour 3-5** : Phase PARSE - Démarrage
- [ ] Implémenter XML parser (fast-xml-parser)
- [ ] Builder IR basic (programme metadata)
- [ ] Tests unitaires parser XML
- [ ] Benchmark IDE 236

---

## Acceptance Criteria

Pipeline V8 est accepté SI :

1. ✅ **Parsing** : 0 erreur sur 243 programmes ADH
2. ✅ **Data-model** : 60+ tables détectées (match spec)
3. ✅ **Coverage** : Pilot MOD_EXTRAIT 85%+ (vs 62% V7.2)
4. ✅ **Tokens** : -70% confirmé sur 7 programmes
5. ✅ **Tests** : 120 tests passed (100% coverage packages)
6. ✅ **Performance** : Parsing <5s, Data-model <10s par prog
7. ✅ **Reproductibilité** : Même input = même IR (100%)

---

**Créé** : 2026-03-07
**Session** : SESSION-2026-03-06-infrastructure-modulaire
**Basé sur** : Verdict SWARM 7/7 agents + Validation Quick Fixes Phase 1
