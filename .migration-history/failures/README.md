# Migration Failures

> Historisation automatique des échecs de migration et de leurs résolutions

---

## Objectif

Capturer **tous** les échecs de migration pour:
- **Apprendre** des erreurs et éviter de les répéter
- **Analyser** les patterns d'échec récurrents
- **Améliorer** le processus de migration
- **Mesurer** le temps de résolution moyen

---

## Format

Nom de fichier: `Prg_XXX-failed-YYYY-MM-DD-HHMM.json`

Exemple: `Prg_237-failed-2026-02-24-1530.json`

---

## Structure JSON

```json
{
  "program_id": 237,
  "program_name": "Vente GP",
  "failed_at": "2026-02-24T15:30:00Z",
  "phase": "VERIFY",
  "error": "Expression coverage below threshold",
  "error_code": "ERR_COVERAGE_LOW",
  "details": {
    "expected_coverage": 100,
    "actual_coverage": 85,
    "missing_expressions": [
      "Prg_237:Task_5:Line_12:Expr_30",
      "Prg_237:Task_7:Line_8:Expr_15"
    ],
    "stack_trace": "...",
    "context": {
      "contract_file": ".openspec/migration/ADH/ADH-IDE-237.contract.yaml",
      "output_dir": "../adh-web/src"
    }
  },
  "resolution": {
    "action": "Added missing tests for expressions",
    "test_files_added": [
      "adh-web/src/__tests__/vente.test.ts:42",
      "adh-web/src/__tests__/vente.test.ts:68"
    ],
    "resolved_at": "2026-02-24T16:00:00Z",
    "resolved_by": "John Doe",
    "resolution_time_minutes": 30,
    "commit": "abc123def456"
  },
  "lessons_learned": [
    "Always verify expression coverage before marking VERIFY complete",
    "Add test coverage checks earlier in the pipeline"
  ],
  "tags": ["coverage", "testing", "verify-phase"]
}
```

---

## Phases où des échecs peuvent survenir

| Phase | Types d'échecs courants |
|-------|-------------------------|
| EXTRACT | Parsing XML Magic, fichiers manquants |
| MAP | Dépendances non résolues, tables inconnues |
| GAP | Contrat invalide, règles manquantes |
| CONTRACT | Validation YAML, champs requis manquants |
| ENRICH | Claude API errors, code generation failures |
| VERIFY | Coverage insuffisant, tests échouent, fichiers manquants |
| SCAFFOLD | Fichiers déjà existants, permissions |
| CODEGEN | Template errors, syntax errors générés |
| COHERENCE | Fichiers dupliqués, imports cassés |
| CLEANUP | Fichiers verrouillés, permissions |

---

## Capture automatique

Les échecs sont automatiquement capturés par:

```typescript
// Dans pipeline/stages/*.ts
try {
  await runPhase();
} catch (error) {
  await captureFailure({
    programId,
    phase: 'VERIFY',
    error: error.message,
    details: {
      // Context spécifique à la phase
    }
  });
  throw error;
}
```

---

## Analyse

### Échecs par phase

```bash
jq -r '.phase' .migration-history/failures/*.json | sort | uniq -c | sort -nr

# Output:
#  12 VERIFY
#   8 ENRICH
#   5 MAP
#   3 GAP
```

### Temps de résolution moyen

```bash
jq -r '.resolution.resolution_time_minutes' .migration-history/failures/*.json | \
  awk '{sum+=$1; count++} END {print sum/count " minutes"}'

# Output: 45.5 minutes
```

### Top error codes

```bash
jq -r '.error_code' .migration-history/failures/*.json | sort | uniq -c | sort -nr

# Output:
#   8 ERR_COVERAGE_LOW
#   5 ERR_CLAUDE_API
#   3 ERR_FILE_NOT_FOUND
```

### Programmes problématiques

```bash
jq -r '.program_id' .migration-history/failures/*.json | sort | uniq -c | sort -nr

# Output:
#   5 237
#   3 154
#   2 138
```

---

## Résolution workflow

### 1. Échec détecté

Le système crée automatiquement `Prg_XXX-failed-YYYY-MM-DD-HHMM.json`

### 2. Investigation

```bash
# Lire le fichier d'échec
cat .migration-history/failures/Prg_237-failed-2026-02-24-1530.json | jq .

# Identifier la cause
# Reproduire localement
```

### 3. Résolution

Corriger le problème, puis mettre à jour le fichier:

```json
{
  ...,
  "resolution": {
    "action": "Description de la correction",
    "test_files_added": ["..."],
    "resolved_at": "2026-02-24T16:00:00Z",
    "resolved_by": "John Doe",
    "resolution_time_minutes": 30,
    "commit": "abc123def456"
  },
  "lessons_learned": [
    "Leçon 1",
    "Leçon 2"
  ]
}
```

### 4. Capitalisation

- Créer une décision si nécessaire (`.migration-history/decisions/`)
- Documenter un pattern si récurrent (`.migration-history/patterns/`)
- Améliorer le pipeline pour éviter ce type d'échec

---

## Prévention

### Checklist avant VERIFY

- [ ] Expression coverage >= 100%
- [ ] Tous les tests passent
- [ ] Fichiers générés existent
- [ ] Imports résolus (no TypeScript errors)
- [ ] Coherence checks passent

### Alerts

Si un type d'échec se produit 3+ fois:

```
⚠️  ALERT: ERR_COVERAGE_LOW occurred 3 times
    Consider adding automated checks earlier in pipeline
    See: .migration-history/failures/Prg_*-failed-*.json
```

---

## Métriques

| Métrique | Formule |
|----------|---------|
| Taux de réussite | (programmes réussis) / (total programmes) |
| Temps résolution moyen | avg(resolution_time_minutes) |
| Échecs par phase | count(failures) GROUP BY phase |
| Programmes à risque | count(failures) GROUP BY program_id WHERE count > 2 |

---

## Génération rapport

```bash
# Rapport mensuel
tsx scripts/generate-failure-report.ts \
  --month 2026-02 \
  --output .migration-history/failure-report-2026-02.md

# Dashboard HTML
tsx scripts/generate-failure-dashboard.ts \
  --output .migration-history/failures-dashboard.html
```

---

## Nettoyage

Archiver les échecs résolus après 90 jours:

```bash
# Archiver fichiers > 90 jours
find .migration-history/failures/ -name "*.json" -mtime +90 \
  -exec mv {} .migration-history/failures/archive/ \;
```

---

## Example complet

Voir `EXAMPLE.json` pour un exemple de fichier d'échec avec résolution complète.
