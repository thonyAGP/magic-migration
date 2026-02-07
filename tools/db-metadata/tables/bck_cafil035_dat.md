# bck_cafil035_dat

| Info | Valeur |
|------|--------|
| Lignes | 120 |
| Colonnes | 8 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `ddb_date_comptable` | char | 8 | non |  | 8 |
| 2 | `ddb_societe` | nvarchar | 1 | non |  | 1 |
| 3 | `ddb_num_ordre_devise` | int | 10 | non |  | 15 |
| 4 | `ddb_code_devise` | nvarchar | 3 | non |  | 15 |
| 5 | `ddb_mode_de_paiement` | nvarchar | 4 | non |  | 2 |
| 6 | `ddb_change_du_jour` | float | 53 | non |  | 1 |
| 7 | `ddb_solde_du_jour` | float | 53 | non |  | 1 |
| 8 | `ddb_sortie_devise` | float | 53 | non |  | 1 |

## Valeurs distinctes

### `ddb_date_comptable` (8 valeurs)

```
20251217, 20251218, 20251219, 20251220, 20251221, 20251222, 20251223, 20251224
```

### `ddb_societe` (1 valeurs)

```
C
```

### `ddb_num_ordre_devise` (15 valeurs)

```
0, 1, 10, 11, 12, 13, 14, 15, 2, 3, 4, 5, 6, 7, 9
```

### `ddb_code_devise` (15 valeurs)

```
, AUD, CAD, CHF, CNY, EUR, GBP, HKD, JPY, KRW, MYR, NZD, SGD, TWD, USD
```

### `ddb_mode_de_paiement` (2 valeurs)

```
, CASH
```

### `ddb_change_du_jour` (1 valeurs)

```
0
```

### `ddb_solde_du_jour` (1 valeurs)

```
0
```

### `ddb_sortie_devise` (1 valeurs)

```
0
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| bck_cafil035_dat_IDX_1 | NONCLUSTERED | oui | ddb_date_comptable, ddb_societe, ddb_num_ordre_devise, ddb_code_devise, ddb_mode_de_paiement |

