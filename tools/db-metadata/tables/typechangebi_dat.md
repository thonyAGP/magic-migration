# typechangebi_dat

| Info | Valeur |
|------|--------|
| Lignes | 2917 |
| Colonnes | 3 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `tchg_societe` | nvarchar | 1 | non |  | 1 |
| 2 | `tchg_ident_operation` | int | 10 | non |  | 2917 |
| 3 | `tchg_type_change` | int | 10 | non |  | 1 |

## Valeurs distinctes

### `tchg_societe` (1 valeurs)

```
C
```

### `tchg_type_change` (1 valeurs)

```
0
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| typechangebi_dat_IDX_1 | NONCLUSTERED | oui | tchg_societe, tchg_ident_operation |

