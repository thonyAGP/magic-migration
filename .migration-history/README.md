# Migration History

> Capitalisation des décisions, patterns et échecs de migration

**Créé**: 2026-02-24
**Objectif**: Historiser et apprendre de chaque migration pour améliorer les suivantes

---

## Structure

```
.migration-history/
├── README.md              # Ce fichier
├── decisions/             # Décisions techniques prises
│   ├── README.md
│   ├── TEMPLATE.md
│   └── YYYY-MM-DD-titre-decision.md
├── failures/              # Échecs et résolutions
│   ├── README.md
│   └── Prg_XXX-failed-YYYY-MM-DD.json
└── patterns/              # Patterns récurrents identifiés
    ├── README.md
    ├── TEMPLATE.yaml
    └── nom-pattern.yaml
```

---

## Workflow

### 1. Lors d'une décision technique importante

```bash
# Créer un nouveau fichier de décision
cp .migration-history/decisions/TEMPLATE.md \
   .migration-history/decisions/2026-02-24-validation-pattern.md

# Éditer et remplir le template
# Commiter avec le code concerné
```

### 2. Lors d'un échec de migration

Le système capture automatiquement les échecs dans `failures/`:

```json
{
  "program_id": 237,
  "program_name": "Vente GP",
  "failed_at": "2026-02-24T15:30:00Z",
  "phase": "VERIFY",
  "error": "Expression coverage below threshold",
  "details": {
    "expected_coverage": 100,
    "actual_coverage": 85,
    "missing_expressions": [
      "Prg_237:Task_5:Line_12:Expr_30"
    ]
  },
  "resolution": {
    "action": "Added missing test",
    "test_file": "tests/vente.test.ts:42",
    "resolved_at": "2026-02-24T16:00:00Z"
  }
}
```

### 3. Lors de l'identification d'un pattern

```bash
# Créer un nouveau pattern
cp .migration-history/patterns/TEMPLATE.yaml \
   .migration-history/patterns/if-error-then-msg.yaml

# Documenter le pattern Magic → Moderne
# Commiter
```

---

## Utilisation

### Rechercher un pattern similaire

```bash
# Chercher dans les patterns
grep -r "IF(" .migration-history/patterns/

# Chercher dans les décisions
grep -r "validation" .migration-history/decisions/
```

### Analyser les échecs récurrents

```bash
# Compter les échecs par phase
jq -r '.phase' .migration-history/failures/*.json | sort | uniq -c

# Identifier les programmes problématiques
jq -r '.program_id' .migration-history/failures/*.json | sort | uniq -c | sort -nr
```

### Générer rapport de capitalisation

```bash
# Script à créer
tsx scripts/generate-learning-report.ts \
  --output .migration-history/learnings-report.md
```

---

## Objectifs

| Métrique | Cible | Mesure |
|----------|-------|--------|
| Décisions documentées | 100% des décisions majeures | Fichiers `.md` dans `decisions/` |
| Échecs historisés | 100% des échecs | Fichiers `.json` dans `failures/` |
| Patterns identifiés | 20+ patterns | Fichiers `.yaml` dans `patterns/` |
| Réutilisation | 50%+ des patterns utilisés 2+ fois | Compteur dans YAML |

---

## Intégration

### Hook post-migration

Quand une migration réussit, le système peut automatiquement:
1. Capturer les patterns utilisés
2. Documenter les décisions prises
3. Archiver les logs

### Hook post-échec

Quand une migration échoue:
1. Créer automatiquement un fichier JSON dans `failures/`
2. Capturer contexte complet (stack trace, state, etc.)
3. Notifier pour résolution

---

## Exemples

Voir les dossiers respectifs pour des exemples concrets:
- `decisions/TEMPLATE.md` - Template de décision
- `patterns/TEMPLATE.yaml` - Template de pattern
- `failures/README.md` - Format des échecs
