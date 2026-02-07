# cafil035_dat

| Info | Valeur |
|------|--------|
| Lignes | 15 |
| Colonnes | 7 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `ddk_societe` | nvarchar | 1 | non |  | 1 |
| 2 | `ddk_num_ordre_devise` | int | 10 | non |  | 15 |
| 3 | `ddk_code_devise` | nvarchar | 3 | non |  | 15 |
| 4 | `ddk_mode_de_paiement` | nvarchar | 4 | non |  | 2 |
| 5 | `ddk_change_du_jour` | float | 53 | non |  | 1 |
| 6 | `ddk_solde_du_jour` | float | 53 | non |  | 1 |
| 7 | `ddk_sortie_devise` | float | 53 | non |  | 1 |

## Valeurs distinctes

### `ddk_societe` (1 valeurs)

```
C
```

### `ddk_num_ordre_devise` (15 valeurs)

```
0, 1, 10, 11, 12, 13, 14, 15, 2, 3, 4, 5, 6, 7, 9
```

### `ddk_code_devise` (15 valeurs)

```
, AUD, CAD, CHF, CNY, EUR, GBP, HKD, JPY, KRW, MYR, NZD, SGD, TWD, USD
```

### `ddk_mode_de_paiement` (2 valeurs)

```
, CASH
```

### `ddk_change_du_jour` (1 valeurs)

```
0
```

### `ddk_solde_du_jour` (1 valeurs)

```
0
```

### `ddk_sortie_devise` (1 valeurs)

```
0
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil035_dat_IDX_1 | NONCLUSTERED | oui | ddk_societe, ddk_num_ordre_devise, ddk_code_devise, ddk_mode_de_paiement |

