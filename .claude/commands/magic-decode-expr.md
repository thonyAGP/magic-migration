---
description: Decode {N,Y} en variables globales avec contexte programme/tache
arguments:
  - name: args
    description: "project programId taskIsn2 expressionId"
    required: true
---

# Decodage Expression Magic vers Variables Globales

Decode l'expression en utilisant le contexte du programme et de la tache.
**L'offset est calcule automatiquement** via la formule validee.

**Arguments**: `$ARGUMENTS`

## Format attendu

```
/magic-decode-expr PVE 180 45 30
```

| Argument | Description | Exemple |
|----------|-------------|---------|
| project | Nom du projet | PVE, ADH, VIL, PBG, PBP, REF |
| programId | ID du programme (ISN) | 180 |
| taskIsn2 | ISN_2 de la tache | 45 |
| expressionId | ID de l'expression | 30 |

## Workflow

1. **Parser les arguments**
   ```
   project = $1
   programId = $2
   taskIsn2 = $3
   expressionId = $4
   ```

2. **Appeler l'outil MCP** (offset calcule automatiquement)
   ```
   magic_decode_expression(project, programId, taskIsn2, expressionId)
   ```

3. **Afficher le resultat**
   - Formule originale avec `{N,Y}`
   - Formule decodee avec lettres de variables
   - Tableau de correspondances
   - Offset cumulatif utilise

## Exemple de sortie

```markdown
## Expression 30 decodee

### Formule originale
Round({0,3}*(1-{0,1}/100), 10, 0)

### Formule decodee
Round(QR*(1-QO/100), 10, 0)

### Correspondances {N,Y} -> Variables

| Reference | Niveau | ColumnID | Position | Index Global | Variable | Nom logique |
|-----------|--------|----------|----------|--------------|----------|-------------|
| `{0,3}` | 0 | 3 | 2 | 432 | **QR** | v.Prix |
| `{0,1}` | 0 | 1 | 0 | 430 | **QO** | v.Remise |

**Offset cumulatif utilise:** 430
```

## Notes

- Le niveau 0 = variables de la tache courante
- Le niveau 32768 = variables globales du Main (VG.)
- Le niveau 1-N = variables des taches parentes

## Voir aussi

- `/magic-expr` - Decodage manuel sans MCP
- `/magic-line` - Affiche DataView + Logic pour une ligne
- `magic_get_expression` - Outil MCP pour obtenir l'expression brute
