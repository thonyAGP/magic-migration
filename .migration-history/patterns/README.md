# Migration Patterns

> Catalog of recurring Magic patterns and their modern equivalents

---

## Objectif

Identifier et documenter les patterns Magic récurrents pour:
- **Accélérer** les migrations futures (réutilisation)
- **Garantir cohérence** entre les programmes migrés
- **Capitaliser** sur les solutions trouvées

---

## Structure d'un pattern

Chaque pattern documente:
- **Magic formula** récurrente
- **Modern equivalent** en TypeScript/React
- **Test pattern** pour vérifier l'implémentation
- **Occurrences** (combien de fois vu)
- **Variations** possibles

---

## Fichier YAML

Format: `nom-pattern.yaml`

Voir `TEMPLATE.yaml` pour la structure complète.

---

## Exemples de patterns

### Patterns conditionnels

- `if-error-then-msg.yaml` - IF({0,3}='E',Msg('Error'))
- `if-operation-type.yaml` - IF({0,X}='Y',Action1,Action2)
- `date-validation.yaml` - Date()>[E]+Val([G],'##')

### Patterns de mise à jour

- `update-operation.yaml` - Update(operation,A,{1,3})
- `calculate-sum.yaml` - Sum({0,3},{0,4})
- `set-field-value.yaml` - {0,5}={1,3}

### Patterns d'affichage

- `msg-error.yaml` - Msg('Error message')
- `display-value.yaml` - Display({0,3})

---

## Recherche

```bash
# Chercher un pattern par formule Magic
grep -r "IF(" .migration-history/patterns/

# Lister patterns par nombre d'occurrences
for f in .migration-history/patterns/*.yaml; do
  echo "$(yq '.occurrences' $f) - $(basename $f)"
done | sort -nr
```

---

## Workflow

### 1. Identifier un pattern récurrent

Pendant la migration, si vous voyez 2+ fois la même structure:

```magic
IF({0,3}='E',Msg('Error'))
```

→ C'est un pattern à documenter

### 2. Créer le fichier pattern

```bash
cp .migration-history/patterns/TEMPLATE.yaml \
   .migration-history/patterns/if-error-then-msg.yaml
```

### 3. Documenter

Remplir:
- `pattern`: Formule Magic générique
- `description`: Ce que fait le pattern
- `modern_equivalent`: Code TypeScript/React équivalent
- `test_pattern`: Comment tester
- `occurrences`: Nombre de fois vu (mettre à jour)
- `examples`: Programmes où il apparaît

### 4. Mettre à jour quand réutilisé

Chaque fois que vous réutilisez un pattern:
- Incrémenter `occurrences`
- Ajouter dans `examples`

---

## Métriques

| Métrique | Objectif |
|----------|----------|
| Patterns documentés | 20+ |
| Patterns réutilisés 3+ fois | 10+ |
| Couverture (% programmes utilisant patterns) | 80%+ |

---

## Top patterns (exemples)

Une fois qu'on a migré plusieurs programmes, on pourra générer:

```
Top 10 Magic Patterns

 1. IF({0,X}='Y',Action1,Action2) - 42 occurrences
 2. Update(operation,A,{1,3}) - 38 occurrences
 3. Msg('Error message') - 35 occurrences
 4. Date()>[E]+Val([G],'##') - 28 occurrences
 5. ...
```

---

## Génération automatique

Script à créer:

```bash
# Analyser tous les contrats et extraire patterns récurrents
tsx scripts/extract-patterns.ts \
  --contract-dir .openspec/migration/ADH \
  --output .migration-history/patterns/

# Générer rapport de réutilisation
tsx scripts/pattern-usage-report.ts \
  --output .migration-history/pattern-usage.md
```
