# cafil045_dat

| Info | Valeur |
|------|--------|
| Lignes | 213 |
| Colonnes | 18 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `tab_nom_table` | nvarchar | 5 | non |  | 11 |
| 2 | `tab_nom_interne_code` | nvarchar | 5 | non |  | 3 |
| 3 | `tab_code_alpha5` | nvarchar | 5 | non |  | 196 |
| 4 | `tab_code_numeric6` | int | 10 | non |  | 46 |
| 5 | `tab_classe` | nvarchar | 6 | non |  | 6 |
| 6 | `tab_valeur_numerique` | float | 53 | non |  | 42 |
| 7 | `tab_libelle20` | nvarchar | 20 | non |  | 207 |
| 8 | `tab_libelle10_upper` | nvarchar | 10 | non |  | 118 |
| 9 | `tab_code_droit_modif` | nvarchar | 1 | non |  | 2 |
| 10 | `tab_remise_autorisee` | bit |  | non |  | 2 |
| 11 | `tab_prix_autorise` | bit |  | non |  | 2 |
| 12 | `tab_imprimer_tva` | bit |  | non |  | 2 |
| 13 | `tab_activer_bar_limit` | bit |  | non |  | 1 |
| 14 | `tab_activer_credit_conso` | bit |  | non |  | 2 |
| 15 | `tab_type_service` | nvarchar | 1 | non |  | 2 |
| 16 | `tab_pourcent_commission` | float | 53 | oui |  | 4 |
| 17 | `tab_sale_label_modifiable` | bit |  | non |  | 1 |
| 18 | `tab_voir_tel` | bit |  | non |  | 1 |

## Valeurs distinctes

### `tab_nom_table` (11 valeurs)

```
$CLAS, $GAR, $MOP, BDEV, CTPID, DMOP, DOBJ, PTABL, SMOP, TABO, VSERV
```

### `tab_nom_interne_code` (3 valeurs)

```
, O, Z
```

### `tab_code_numeric6` (46 valeurs)

```
0, 1, 10, 100, 1000, 1101, 1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900, 2, 2000, 2100, 2200, 2300, 2400, 2500, 2600, 2700, 2800, 2900, 3, 4, 400, 4000, 5, 500, 5000, 550, 6, 600, 6000, 650, 7, 700, 7000, 750, 800, 8000, 850, 900, 9000
```

### `tab_classe` (6 valeurs)

```
, $CARD, $CASH, $PAPER, OD, PERS
```

### `tab_valeur_numerique` (42 valeurs)

```
0, 1099, 1199, 1299, 1399, 1499, 1599, 1699, 1799, 1899, 1999, 2099, 2199, 2299, 2399, 2499, 2599, 2699, 2799, 2899, 300, 399, 3999, 499, 4999, 549, 599, 5999, 6, 649, 699, 6999, 749, 799, 7999, 849, 899, 8999, 9, 99, 999, 9999
```

### `tab_code_droit_modif` (2 valeurs)

```
, O
```

### `tab_remise_autorisee` (2 valeurs)

```
0, 1
```

### `tab_prix_autorise` (2 valeurs)

```
0, 1
```

### `tab_imprimer_tva` (2 valeurs)

```
0, 1
```

### `tab_activer_bar_limit` (1 valeurs)

```
0
```

### `tab_activer_credit_conso` (2 valeurs)

```
0, 1
```

### `tab_type_service` (2 valeurs)

```
I, M
```

### `tab_pourcent_commission` (4 valeurs)

```
10, 100, 20, 30
```

### `tab_sale_label_modifiable` (1 valeurs)

```
0
```

### `tab_voir_tel` (1 valeurs)

```
0
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil045_dat_IDX_3 | NONCLUSTERED | oui | tab_nom_table, tab_code_numeric6, tab_code_alpha5 |
| cafil045_dat_IDX_1 | NONCLUSTERED | non | tab_nom_table, tab_nom_interne_code, tab_code_alpha5 |
| cafil045_dat_IDX_2 | NONCLUSTERED | non | tab_nom_table, tab_nom_interne_code, tab_code_numeric6 |

