# cafil050_dat

| Info | Valeur |
|------|--------|
| Lignes | 8991 |
| Colonnes | 4 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `gen_num_serie` | nvarchar | 1 | non |  | 2 |
| 2 | `gen_code_utilise` | nvarchar | 1 | non |  | 1 |
| 3 | `gen_classement_log` | int | 10 | non |  | 5993 |
| 4 | `gen_code_autocom` | int | 10 | non |  | 8991 |

## Valeurs distinctes

### `gen_num_serie` (2 valeurs)

```
0, 1
```

### `gen_code_utilise` (1 valeurs)

```
N
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil050_dat_IDX_2 | NONCLUSTERED | oui | gen_code_autocom |
| cafil050_dat_IDX_1 | NONCLUSTERED | non | gen_num_serie, gen_code_utilise, gen_classement_log |

