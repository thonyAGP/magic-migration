# cafil028_dat

| Info | Valeur |
|------|--------|
| Lignes | 100 |
| Colonnes | 6 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `mor_societe` | nvarchar | 1 | non |  | 1 |
| 2 | `mor_devise` | nvarchar | 3 | non |  | 16 |
| 3 | `mor_type_operation` | nvarchar | 1 | non |  | 6 |
| 4 | `mor_mop` | nvarchar | 4 | non |  | 12 |
| 5 | `mor_accepte` | nvarchar | 1 | non |  | 2 |
| 6 | `mor_taux_de_change` | float | 53 | non |  | 17 |

## Valeurs distinctes

### `mor_societe` (1 valeurs)

```
C
```

### `mor_devise` (16 valeurs)

```
AUD, CAD, CHF, CNY, EUR, GBP, HKD, JPY, KRW, MYR, NZD, SGD, THB, TWD, USD, ZAR
```

### `mor_type_operation` (6 valeurs)

```
, M, N, S, V, W
```

### `mor_mop` (12 valeurs)

```
ALIP, AMEX, BATR, CASH, CCAU, CHQ, OD, UNIO, VADA, VADV, VISA, WECH
```

### `mor_accepte` (2 valeurs)

```
N, O
```

### `mor_taux_de_change` (17 valeurs)

```
0, 0.021204, 0.232221, 0.9579, 1, 1.581, 19.2696, 20.925, 22.692, 23.0082, 3.8688, 30.2529, 32.8476, 33.0057, 36.8373, 4.2966, 6.6588
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil028_dat_IDX_1 | NONCLUSTERED | oui | mor_societe, mor_devise, mor_type_operation, mor_mop |
| cafil028_dat_IDX_3 | NONCLUSTERED | oui | mor_societe, mor_mop, mor_type_operation, mor_accepte, mor_devise |
| cafil028_dat_IDX_2 | NONCLUSTERED | oui | mor_societe, mor_devise, mor_type_operation, mor_accepte, mor_mop |

