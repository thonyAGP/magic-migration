# mod

| Info | Valeur |
|------|--------|
| Lignes | 60693 |
| Colonnes | 4 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `dossier` | nvarchar | 9 | non |  | 18058 |
| 2 | `code_modification` | nvarchar | 2 | non |  | 16 |
| 3 | `date_modification` | char | 8 | non |  | 1419 |
| 4 | `RowId_359` | int | 10 | non |  | 60693 |

## Valeurs distinctes

### `code_modification` (16 valeurs)

```
AN, AP, AR, AS, CI, CP, EG, M1, M5, MI, ML, MX, PR, RT, TR, UP
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| mod_IDX_1 | NONCLUSTERED | non | dossier |
| mod_IDX_2 | NONCLUSTERED | oui | RowId_359 |

