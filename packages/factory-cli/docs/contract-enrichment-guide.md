# Contract Enrichment Guide

> Enrichir les contrats de migration avec la traçabilité expression-par-expression

**Créé**: 2026-02-24
**Version**: 1.0
**Phase**: Phase 2 - Traçabilité

---

## Vue d'ensemble

L'enrichissement des contrats ajoute le champ `legacy_expressions` à chaque règle, permettant de tracer:
- **Chaque expression Magic** source vers son implémentation moderne
- **Fichier moderne** et ligne exacte où l'expression est implémentée
- **Fichier de test** et ligne exacte qui vérifie l'expression
- **Statut de vérification** (testé et validé ou non)

**Objectif**: Garantir 100% de couverture - aucune expression legacy oubliée.

---

## Structure avant/après

### Avant enrichissement

```yaml
rules:
  - id: RM-001
    description: "Condition: P. O/T/F [A] egale 'O'"
    condition: P. O/T/F [A]='O'
    variables:
      - EN
    status: IMPL
    target_file: adh-web/src/stores/saisieContenuCaisseStore.ts
    gap_notes: ""
```

### Après enrichissement

```yaml
rules:
  - id: RM-001
    description: "Condition: P. O/T/F [A] egale 'O'"
    condition: P. O/T/F [A]='O'
    variables:
      - EN
    status: IMPL
    target_file: adh-web/src/stores/saisieContenuCaisseStore.ts
    gap_notes: ""
    legacy_expressions:
      - expr_id: "Prg_48:Task_2:Line_12:Expr_30"
        formula: "P. O/T/F [A]='O'"
        location:
          program_id: 48
          task_id: 2
          line_id: 12
          expr_id: 30
        mapped_to: "adh-web/src/stores/saisieContenuCaisseStore.ts:45"
        test_file: "adh-web/src/__tests__/saisieContenuCaisseStore.test.ts:28"
        verified: true
      - expr_id: "Prg_48:Task_3:Line_8:Expr_15"
        formula: "IF(P. O/T/F [A]='O',Update(...),Skip)"
        location:
          program_id: 48
          task_id: 3
          line_id: 8
          expr_id: 15
        mapped_to: "adh-web/src/stores/saisieContenuCaisseStore.ts:67"
        test_file: "adh-web/src/__tests__/saisieContenuCaisseStore.test.ts:42"
        verified: true
        notes: "Conditional update based on operation type"
```

---

## Champs legacy_expressions

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `expr_id` | string | ✅ | Format: `Prg_XXX:Task_YYY:Line_ZZZ:Expr_NNN` |
| `formula` | string | ✅ | Formule Magic complète |
| `location` | object | ✅ | Emplacement dans le programme Magic |
| `location.program_id` | number | ✅ | ID du programme (ex: 48) |
| `location.task_id` | number | ✅ | ID de la tâche (ex: 2) |
| `location.line_id` | number | ✅ | ID de la ligne Logic (ex: 12) |
| `location.expr_id` | number | ✅ | ID de l'expression (ex: 30) |
| `mapped_to` | string | ⚠️ | Fichier moderne:ligne (ex: `src/validation.ts:42`) |
| `test_file` | string | ⚠️ | Fichier test:ligne (ex: `tests/validation.test.ts:15`) |
| `verified` | boolean | ✅ | `true` si testé et validé, `false` sinon |
| `notes` | string | ❌ | Notes supplémentaires optionnelles |

---

## Méthodes d'enrichissement

### Méthode 1: Script automatique (recommandé si accès sources Magic)

```bash
# Enrichir un contrat à partir des sources Magic
tsx scripts/enrich-contract-expressions.ts \
  --contract .openspec/migration/ADH/ADH-IDE-48.contract.yaml \
  --magic-project D:/Magic/ADH/ADH.edp \
  --output-dir ../adh-web/src

# Mode dry-run pour prévisualiser
tsx scripts/enrich-contract-expressions.ts \
  --contract .openspec/migration/ADH/ADH-IDE-48.contract.yaml \
  --dry-run
```

**Avantages**:
- Extraction automatique des expressions depuis XML Magic
- Localisation précise (program, task, line, expr IDs)
- Rapide pour plusieurs contrats

**Limitations**:
- Nécessite accès aux sources Magic XML
- Mapping moderne et tests doivent être ajoutés manuellement après

### Méthode 2: Enrichissement manuel (si pas d'accès sources)

1. **Template vide**:
   ```bash
   tsx scripts/enrich-contract-expressions.ts \
     --contract .openspec/migration/ADH/ADH-IDE-48.contract.yaml
   ```

2. **Éditer le contrat YAML** et remplir:
   - `expr_id` avec la vraie position Magic
   - `location.*` avec les IDs numériques
   - `mapped_to` avec fichier moderne:ligne
   - `test_file` avec fichier test:ligne
   - `verified: false` → `true` une fois testé

3. **Valider** la structure:
   ```bash
   pnpm test:expression-coverage \
     --contract-dir .openspec/migration/ADH \
     --output-dir ../adh-web/src \
     --verbose
   ```

---

## Workflow d'enrichissement progressif

### Étape 1: Enrichir pendant la migration

Quand vous migrez un programme:

```bash
# 1. Générer le contrat initial (déjà fait via SPECMAP)
# Contrat dans .openspec/migration/ADH/ADH-IDE-48.contract.yaml

# 2. Pendant l'implémentation, ajouter les expressions au fur et à mesure
#    Chaque fois que vous implémentez une règle:
#    - Notez l'expr_id Magic source
#    - Notez la ligne moderne où vous l'implémentez
#    - Notez la ligne de test qui la vérifie

# 3. Mettre à jour le contrat YAML avec ces infos

# 4. Vérifier la couverture
pnpm test:expression-coverage \
  --contract-dir .openspec/migration/ADH \
  --programs 48
```

### Étape 2: Vérification continue

Ajouter dans le workflow de migration:

```bash
# Avant de marquer un programme comme DONE
pnpm test:expression-coverage \
  --contract-dir .openspec/migration/ADH \
  --programs 48 \
  --threshold 100 \
  --run-tests

# Si échec (coverage < 100%), identifier les gaps et compléter
```

### Étape 3: Capitalisation

Après plusieurs programmes migrés:

```bash
# Analyser les patterns récurrents
grep -r "formula:" .openspec/migration/ADH/*.contract.yaml | \
  grep "IF(" | \
  sort | uniq -c | sort -nr

# Documenter les patterns dans .migration-history/patterns/
```

---

## Validation de la structure

### Validator automatique

Le validateur vérifie:
- ✅ Format `expr_id` correct
- ✅ Format `mapped_to` et `test_file` corrects (path:line)
- ✅ Pas de template placeholders (XXX, YYY, ZZZ, NNN)
- ✅ Pas de line:0 (doit être la vraie ligne)
- ⚠️ Si `verified: true`, alors `test_file` doit être présent

```typescript
import { validateEnrichedContract } from './src/verifiers/contract-schema-validator.js';

const result = validateEnrichedContract(contract.rules);

if (!result.valid) {
  console.error('❌ Validation errors:', result.errors);
}

if (result.warnings.length > 0) {
  console.warn('⚠️  Warnings:', result.warnings);
}
```

### Patterns d'erreurs communes

| Erreur | Cause | Solution |
|--------|-------|----------|
| `Invalid expr_id format` | Format non respecté | Utiliser `Prg_XXX:Task_YYY:Line_ZZZ:Expr_NNN` |
| `template placeholders` | XXX/YYY/ZZZ/NNN non remplacés | Remplacer par vrais IDs numériques |
| `line number 0` | Ligne non renseignée | Trouver la vraie ligne et mettre à jour |
| `marked as verified but no test_file` | Test manquant | Ajouter `test_file` ou mettre `verified: false` |

---

## Exemple complet

### Programme Magic source (Prg_48.xml extract)

```xml
<Task ISN="2" Name="Validate Operation">
  <LogicLine id="12">
    <Expression ISN="30">
      <Formula>P. O/T/F [A]='O'</Formula>
    </Expression>
  </LogicLine>
</Task>
```

### Contrat enrichi (ADH-IDE-48.contract.yaml)

```yaml
program:
  id: 48
  name: "Saisie Contenu Caisse"
  complexity: MEDIUM
  expressions_count: 13

rules:
  - id: RM-001
    description: "Condition: Operation type is Opening"
    condition: P. O/T/F [A]='O'
    status: IMPL
    target_file: adh-web/src/stores/saisieContenuCaisseStore.ts

    legacy_expressions:
      - expr_id: "Prg_48:Task_2:Line_12:Expr_30"
        formula: "P. O/T/F [A]='O'"
        location:
          program_id: 48
          task_id: 2
          line_id: 12
          expr_id: 30
        mapped_to: "adh-web/src/stores/saisieContenuCaisseStore.ts:45"
        test_file: "adh-web/src/__tests__/saisieContenuCaisseStore.test.ts:28"
        verified: true
```

### Fichier moderne (saisieContenuCaisseStore.ts:45)

```typescript
// Line 45
if (operation.type === 'O') {  // Mapped from Prg_48:Task_2:Line_12:Expr_30
  // Opening operation logic
}
```

### Fichier test (saisieContenuCaisseStore.test.ts:28)

```typescript
// Line 28
it('should handle opening operation type', () => {  // Verifies Prg_48:Task_2:Line_12:Expr_30
  const operation = { type: 'O' };
  const result = validateOperation(operation);
  expect(result.isOpening).toBe(true);
});
```

---

## Intégration CI/CD

### Pre-merge check

```yaml
# .github/workflows/expression-coverage.yml
name: Expression Coverage Check

on:
  pull_request:
    paths:
      - '.openspec/migration/ADH/*.contract.yaml'
      - 'packages/adh-web/src/**'

jobs:
  coverage:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'pnpm'

      - run: pnpm install
      - run: pnpm build

      - name: Verify Expression Coverage
        working-directory: packages/factory-cli
        run: |
          pnpm test:expression-coverage \
            --contract-dir ../../.openspec/migration/ADH \
            --output-dir ../adh-web/src \
            --threshold 100 \
            --run-tests \
            --json > coverage-report.json

      - name: Upload Report
        uses: actions/upload-artifact@v4
        with:
          name: expression-coverage-report
          path: packages/factory-cli/coverage-report.json
```

---

## Métriques et reporting

### Dashboard

```bash
# Rapport global de couverture
pnpm test:expression-coverage \
  --contract-dir .openspec/migration/ADH \
  --output-dir ../adh-web/src \
  --verbose

# Output:
#
# Expression Coverage Report
# ═══════════════════════════════════════
#
# Program 48 (Saisie Contenu Caisse):
#   Total expressions: 13
#   Covered: 13 (100%)
#   Verified: 13 (100%)
#   ✅ PASS
#
# Program 138 (Validation):
#   Total expressions: 8
#   Covered: 6 (75%)
#   Verified: 4 (50%)
#   ❌ FAIL - Missing: Prg_138:Task_3:Line_5:Expr_12, ...
#
# Overall:
#   Total: 54 programs
#   Fully covered: 42 (78%)
#   Partially covered: 8 (15%)
#   Not enriched: 4 (7%)
```

### JSON export pour analytics

```bash
pnpm test:expression-coverage \
  --contract-dir .openspec/migration/ADH \
  --output-dir ../adh-web/src \
  --json > coverage-report.json

# Utiliser avec jq pour extraire des métriques
jq '.overall.coveragePct' coverage-report.json
# 78.5

jq '.reports[] | select(.coveragePct < 100) | .programId' coverage-report.json
# 138
# 154
# 175
```

---

## Troubleshooting

### Expression ID invalide

```
❌ Error: Invalid expr_id format: "48-2-12-30"
```

**Solution**: Utiliser le format correct avec préfixes et deux-points:
```yaml
expr_id: "Prg_48:Task_2:Line_12:Expr_30"
```

### Test file introuvable

```
❌ Error: Test file not found: adh-web/src/__tests__/missing.test.ts
```

**Solution**: Vérifier le chemin (relatif à `output-dir`), ou créer le test manquant.

### Verified sans test

```
⚠️  Warning: Rule RM-001: marked as verified but no test_file specified
```

**Solution**: Ajouter `test_file` ou mettre `verified: false`.

---

## Bonnes pratiques

### 1. Enrichir pendant la migration, pas après

❌ **Mauvais**: Migrer tout, puis enrichir après
```
Migrer Prg_48 → Migrer Prg_49 → ... → Enrichir tous les contrats
```

✅ **Bon**: Enrichir au fur et à mesure
```
Migrer Prg_48 + Enrichir contrat 48 → Migrer Prg_49 + Enrichir contrat 49 → ...
```

### 2. Une expression = Un test

Chaque expression doit avoir un test dédié qui la vérifie explicitement.

❌ **Mauvais**: Test général qui couvre plusieurs expressions
```typescript
it('should work', () => {
  // Teste 5 expressions différentes en même temps
});
```

✅ **Bon**: Un test par expression clé
```typescript
it('should validate opening operation type (Prg_48:Task_2:Line_12:Expr_30)', () => {
  // Teste uniquement cette expression
});
```

### 3. Commentaires dans le code moderne

Ajouter des commentaires avec l'expr_id pour faciliter la traçabilité:

```typescript
// Prg_48:Task_2:Line_12:Expr_30 - Check if operation type is Opening
if (operation.type === 'O') {
  // ...
}
```

### 4. Documenter les patterns

Si une formule Magic revient souvent, documenter le pattern:

```yaml
# .migration-history/patterns/if-operation-type.yaml
pattern: "IF({0,X}='Y',Action1,Action2)"
description: "Conditional action based on operation type field"
occurrences: 23
modern_equivalent: "if (operation.type === 'Y') { action1() } else { action2() }"
test_pattern: "describe('operation type Y', () => { it('should...') })"
```

---

## Commandes utiles

```bash
# Enrichir un contrat (template)
tsx scripts/enrich-contract-expressions.ts --contract FILE.yaml

# Enrichir avec sources Magic (auto)
tsx scripts/enrich-contract-expressions.ts --contract FILE.yaml --magic-project PATH/TO/PROJECT.edp

# Vérifier la couverture d'un programme
pnpm test:expression-coverage --programs 48

# Vérifier tous les programmes
pnpm test:expression-coverage --threshold 100

# Vérifier avec exécution des tests
pnpm test:expression-coverage --run-tests

# Export JSON
pnpm test:expression-coverage --json > report.json

# Verbose (détails des gaps)
pnpm test:expression-coverage --verbose
```

---

## Roadmap Phase 2

- [x] Script d'enrichissement (enrich-contract-expressions.ts)
- [x] Validateur de structure (contract-schema-validator.ts)
- [x] Tests du validateur (14 tests)
- [x] Documentation guide d'enrichissement
- [ ] **Enrichir 5 contrats pilotes** (ADH-IDE-48, 138, 154, 155, 174)
- [ ] **Tests auto vérification 100%** (CI/CD integration)
- [ ] **Système .migration-history/** (patterns, decisions, failures)

---

## Résumé

**Enrichissement des contrats = Garantie 100% de couverture**

| Avant | Après |
|-------|-------|
| Règle générale dans contrat | Expression-par-expression tracée |
| Pas de lien legacy → moderne | Fichier:ligne exact (legacy ET moderne) |
| Pas de vérification que tout est couvert | Script vérifie 100% automatiquement |
| Impossible de savoir ce qui manque | Rapport détaillé des gaps |

**Commande clé**:
```bash
pnpm test:expression-coverage --threshold 100
```

Si cette commande passe → **100% de garantie que toutes les expressions legacy sont couvertes**.
