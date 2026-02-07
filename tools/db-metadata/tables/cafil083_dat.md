# cafil083_dat

| Info | Valeur |
|------|--------|
| Lignes | 331 |
| Colonnes | 4 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `societe` | nvarchar | 1 | non |  | 1 |
| 2 | `nom_standard` | nvarchar | 6 | non |  | 298 |
| 3 | `code_complement` | nvarchar | 1 | non |  | 2 |
| 4 | `libelle_complement` | nvarchar | 6 | non |  | 299 |

## Valeurs distinctes

### `societe` (1 valeurs)

```
C
```

### `code_complement` (2 valeurs)

```
C, P
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil083_dat_IDX_1 | NONCLUSTERED | oui | societe, nom_standard, code_complement, libelle_complement |
| cafil083_dat_IDX_2 | NONCLUSTERED | oui | societe, code_complement, libelle_complement, nom_standard |

