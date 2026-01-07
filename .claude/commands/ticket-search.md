---
description: Recherche dans la Knowledge Base des patterns similaires
arguments:
  - name: query
    description: Termes de recherche (symptome, domaine, table, programme, etc.)
    required: true
---

# Recherche Pattern: $ARGUMENTS

Recherche dans la Knowledge Base SQLite des patterns correspondant aux termes.

## Requete SQLite

```sql
SELECT
    ticket_key,
    symptom,
    root_cause,
    solution,
    domain,
    programs,
    tables_involved,
    keywords,
    created_at
FROM patterns
WHERE
    keywords LIKE '%$ARGUMENTS%'
    OR symptom LIKE '%$ARGUMENTS%'
    OR root_cause LIKE '%$ARGUMENTS%'
    OR solution LIKE '%$ARGUMENTS%'
    OR domain LIKE '%$ARGUMENTS%'
    OR tables_involved LIKE '%$ARGUMENTS%'
    OR programs LIKE '%$ARGUMENTS%'
ORDER BY created_at DESC
LIMIT 10;
```

## Format de sortie

Pour chaque pattern trouve:

```
=== PATTERN: {ticket_key} ===
Domaine: {domain}
Cree le: {created_at}

SYMPTOME:
{symptom}

CAUSE RACINE:
{root_cause}

SOLUTION:
{solution}

Programmes: {programs}
Tables: {tables_involved}
Keywords: {keywords}
---
```

## Si aucun resultat

Suggerer:

1. **Elargir les termes** de recherche (moins specifique)
2. **Rechercher par domaine**:
   - `dates` - Problemes de dates/formats
   - `import` - Import de fichiers
   - `affichage` - Problemes GUI
   - `calcul` - Erreurs de calcul
   - `impression` - Editions/impressions
3. **Consulter les rapports** existants: `.openspec/reports/`
4. **Rechercher dans les tickets** locaux: `.openspec/tickets/*/analysis.md`

## Exemples de recherche

| Recherche | Trouve |
|-----------|--------|
| `date` | Tous les patterns lies aux dates |
| `cafil014` | Patterns impliquant la table cafil014_dat |
| `PBP.63` | Patterns impliquant le programme PBP.63 |
| `parsing` | Patterns mentionnant le parsing |
| `GUI affichage` | Patterns d'affichage interface |

## Base SQLite

Chemin: `.openspec/tickets/patterns.sqlite`

Si la base n'existe pas encore:
- Utiliser `/ticket-learn` pour creer le premier pattern
- La base sera creee automatiquement
