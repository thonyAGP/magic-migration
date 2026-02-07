# cafil022_dat

| Info | Valeur |
|------|--------|
| Lignes | 8 |
| Colonnes | 17 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `chg_societe` | nvarchar | 1 | non |  | 1 |
| 2 | `chg_ident_operation` | int | 10 | non |  | 8 |
| 3 | `chg_flag_annulation` | nvarchar | 1 | non |  | 4 |
| 4 | `chg_change_gm__o_n_` | nvarchar | 1 | non |  | 1 |
| 5 | `chg_operat__liee` | int | 10 | non |  | 8 |
| 6 | `chg_code_gm` | int | 10 | non |  | 4 |
| 7 | `chg_filiation` | int | 10 | non |  | 2 |
| 8 | `chg_date_comptable` | char | 8 | non |  | 4 |
| 9 | `chg_date_operation` | char | 8 | non |  | 4 |
| 10 | `chg_heure_operation` | char | 6 | non |  | 8 |
| 11 | `chg_code_devise` | nvarchar | 3 | non |  | 2 |
| 12 | `chg_mode_paiement` | nvarchar | 4 | non |  | 1 |
| 13 | `chg_quantite` | float | 53 | non |  | 6 |
| 14 | `chg_taux_change` | float | 53 | non |  | 2 |
| 15 | `chg_depuis_depot` | nvarchar | 1 | non |  | 2 |
| 16 | `chg_lie_a_versement` | nvarchar | 1 | non |  | 2 |
| 17 | `chg_operateur` | nvarchar | 8 | non |  | 4 |

## Valeurs distinctes

### `chg_societe` (1 valeurs)

```
C
```

### `chg_ident_operation` (8 valeurs)

```
1500, 1707, 1708, 1709, 1710, 1711, 1712, 1713
```

### `chg_flag_annulation` (4 valeurs)

```
, A, N, X
```

### `chg_change_gm__o_n_` (1 valeurs)

```
O
```

### `chg_operat__liee` (8 valeurs)

```
0, 1707, 1708, 1710, 1711, 313329, 313373, 313430
```

### `chg_code_gm` (4 valeurs)

```
546094, 608890, 609238, 609240
```

### `chg_filiation` (2 valeurs)

```
0, 1
```

### `chg_date_comptable` (4 valeurs)

```
20230330, 20240506, 20240510, 20240520
```

### `chg_date_operation` (4 valeurs)

```
20230330, 20240506, 20240510, 20240520
```

### `chg_heure_operation` (8 valeurs)

```
081746, 152012, 152643, 165745, 170641, 185521, 185604, 222112
```

### `chg_code_devise` (2 valeurs)

```
EUR, USD
```

### `chg_mode_paiement` (1 valeurs)

```
CASH
```

### `chg_quantite` (6 valeurs)

```
172, -172, 200, -200, 5, 85
```

### `chg_taux_change` (2 valeurs)

```
30.2529, 32.8476
```

### `chg_depuis_depot` (2 valeurs)

```
, N
```

### `chg_lie_a_versement` (2 valeurs)

```
N, O
```

### `chg_operateur` (4 valeurs)

```
BEAM, GIFT, MICKY, MIND
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil022_dat_IDX_2 | NONCLUSTERED | non | chg_societe, chg_code_gm, chg_date_operation, chg_heure_operation |
| cafil022_dat_IDX_1 | NONCLUSTERED | oui | chg_societe, chg_ident_operation |
| cafil022_dat_IDX_4 | NONCLUSTERED | non | chg_societe, chg_change_gm__o_n_, chg_ident_operation |
| cafil022_dat_IDX_3 | NONCLUSTERED | non | chg_societe, chg_date_comptable, chg_code_devise, chg_mode_paiement, chg_date_operation, chg_heure_operation |
| cafil022_dat_IDX_6 | NONCLUSTERED | non | chg_societe, chg_date_comptable, chg_operateur, chg_code_devise, chg_mode_paiement |
| cafil022_dat_IDX_5 | NONCLUSTERED | non | chg_societe, chg_code_gm, chg_filiation |

