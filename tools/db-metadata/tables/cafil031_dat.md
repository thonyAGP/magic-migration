# cafil031_dat

| Info | Valeur |
|------|--------|
| Lignes | 1000 |
| Colonnes | 3 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `lgn_num_serie` | nvarchar | 1 | non |  | 2 |
| 2 | `lgn_code_utilise` | nvarchar | 1 | non |  | 1 |
| 3 | `lgn_num_ligne` | int | 10 | non |  | 1000 |

## Valeurs distinctes

### `lgn_num_serie` (2 valeurs)

```
0, 1
```

### `lgn_code_utilise` (1 valeurs)

```
N
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil031_dat_IDX_2 | NONCLUSTERED | oui | lgn_num_ligne |
| cafil031_dat_IDX_1 | NONCLUSTERED | oui | lgn_num_serie, lgn_code_utilise, lgn_num_ligne |

