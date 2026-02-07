# cafil118_dat

| Info | Valeur |
|------|--------|
| Lignes | 60 |
| Colonnes | 10 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `mop_societe` | nvarchar | 1 | non |  | 5 |
| 2 | `mop_code_moyen_paiem` | nvarchar | 5 | non |  | 12 |
| 3 | `mop_code_numerique` | int | 10 | non |  | 4 |
| 4 | `mop_classe` | nvarchar | 6 | non |  | 4 |
| 5 | `mop_libelle` | nvarchar | 20 | non |  | 12 |
| 6 | `mop_coef_marge_achat` | float | 53 | non |  | 1 |
| 7 | `mop_coef_marge_vente` | float | 53 | non |  | 1 |
| 8 | `mop_coef_marge_achat_in` | float | 53 | non |  | 1 |
| 9 | `mop_coef_marge_vente_in` | float | 53 | non |  | 1 |
| 10 | `mop_code_modif` | nvarchar | 1 | non |  | 2 |

## Valeurs distinctes

### `mop_societe` (5 valeurs)

```
A, B, C, D, G
```

### `mop_code_moyen_paiem` (12 valeurs)

```
AMEX, CASH, CHEQ, DNRS, EURO, GOLD, MAST, ODGM, ODGO, PREM, TRVL, VISA
```

### `mop_code_numerique` (4 valeurs)

```
1, 2, 3, 4
```

### `mop_classe` (4 valeurs)

```
$CARD, $CASH, $PAPER, OD
```

### `mop_libelle` (12 valeurs)

```
American Express, ChÃ¨que, DINERS, EspÃ¨ces, EurochÃ¨ques, GOLD American Expr., Mastercard, PREMIER VISA, Solde par OD GM, Solde par OD GO, Traveller, VISA
```

### `mop_coef_marge_achat` (1 valeurs)

```
0
```

### `mop_coef_marge_vente` (1 valeurs)

```
0
```

### `mop_coef_marge_achat_in` (1 valeurs)

```
0
```

### `mop_coef_marge_vente_in` (1 valeurs)

```
0
```

### `mop_code_modif` (2 valeurs)

```
, O
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil118_dat_IDX_1 | NONCLUSTERED | oui | mop_societe, mop_code_moyen_paiem |
| cafil118_dat_IDX_2 | NONCLUSTERED | non | mop_societe, mop_classe |

