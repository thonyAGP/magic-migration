# Knowledge Base Parser Validation

## Objectif

Valider que les parsers XML extraient correctement toutes les données Magic en comparant avec l'IDE.

## Programmes de Test Recommandés

| Programme | Projet | Complexité | Éléments à tester |
|-----------|--------|------------|-------------------|
| ADH IDE 69 | ADH | Moyenne | Expressions, Variables, Logique |
| ADH IDE 121 | ADH | Haute | Liens tables, Appels programmes |
| ADH IDE 294 | ADH | Moyenne | DataView multi-sources |
| VIL IDE 558 | VIL | Haute | Tâches imbriquées, Handlers |
| REF IDE 1 | REF | Simple | Structure de base |
| PVE IDE 186 | PVE | Haute | Expressions complexes |

## Checklist de Validation

Pour chaque programme de test, vérifier :

### 1. Informations Programme
- [ ] Nom public correct
- [ ] Position IDE correcte
- [ ] Nombre de tâches correct

### 2. Expressions (PRIORITÉ HAUTE - 0 indexées)
- [ ] Nombre total d'expressions
- [ ] Contenu de chaque expression
- [ ] Numérotation IDE (pas XML id)
- [ ] Commentaires des expressions

### 3. Variables/Colonnes DataView
- [ ] Lettre variable (A, B, C... AA, AB...)
- [ ] Nom du champ
- [ ] Type de données
- [ ] Définition (R=Real, V=Virtual, P=Parameter)
- [ ] Source (table ou expression)

### 4. Logique
- [ ] Nombre de lignes par handler
- [ ] Type d'opération (Update, Call, Block If...)
- [ ] Condition (référence expression)
- [ ] Paramètres

### 5. Liens Tables (PRIORITÉ HAUTE)
- [ ] Table principale (Main Source)
- [ ] Tables liées (Links)
- [ ] Type d'accès (Read, Write, Modify...)
- [ ] Numéro de lien

### 6. Appels Programmes (PRIORITÉ HAUTE - 0 résolus)
- [ ] Programme appelé (projet + IDE)
- [ ] Ligne d'appel
- [ ] Nombre de paramètres
- [ ] Résolution cross-projet

## Comment Exécuter les Tests

```powershell
# Test complet d'un programme
.\test-program.ps1 -Project ADH -IdePosition 69

# Test spécifique expressions
.\test-expressions.ps1 -Project ADH -IdePosition 69

# Test spécifique variables
.\test-variables.ps1 -Project ADH -IdePosition 69 -TaskIde 1

# Comparaison avec dump XML brut
.\compare-xml-kb.ps1 -Project ADH -IdePosition 69
```

## Format des Captures d'Écran Attendues

Pour chaque programme testé, fournir :

1. **Vue Programme** : Onglet principal montrant nom et propriétés
2. **Vue Expressions** : Liste complète des expressions
3. **Vue DataView** : Colonnes de chaque tâche
4. **Vue Logic** : Lignes de logique par handler
5. **Vue Links** : Tables liées si applicable
