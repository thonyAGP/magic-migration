# cafil067_dat

| Info | Valeur |
|------|--------|
| Lignes | 60 |
| Colonnes | 9 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `mop_societe` | nvarchar | 1 | non |  | 5 |
| 2 | `mop_code_moyen_paiem` | nvarchar | 5 | non |  | 21 |
| 3 | `mop_code_numerique` | int | 10 | non |  | 4 |
| 4 | `mop_classe` | nvarchar | 6 | non |  | 5 |
| 5 | `mop_libelle` | nvarchar | 20 | non |  | 23 |
| 6 | `mop_taux_de_base` | float | 53 | non |  | 2 |
| 7 | `mop_code_modif` | nvarchar | 1 | non |  | 2 |
| 8 | `mop_taux_de_base_in` | float | 53 | non |  | 1 |
| 9 | `mop_interface_active` | bit |  | non |  | 2 |

## Valeurs distinctes

### `mop_societe` (5 valeurs)

```
A, B, C, D, G
```

### `mop_code_moyen_paiem` (21 valeurs)

```
ALIP, AMEX, BATR, CASH, CCAU, CHEQ, CHQ, DNRS, EURO, GOLD, MAST, OD, ODGM, ODGO, PREM, TRVL, UNIO, VADA, VADV, VISA, WECH
```

### `mop_code_numerique` (4 valeurs)

```
1, 2, 3, 4
```

### `mop_classe` (5 valeurs)

```
, $CARD, $CASH, $PAPER, OD
```

### `mop_libelle` (23 valeurs)

```
ALIPAY, American express, American Express, Autre carte crÃ©dit, Bank Transfer, ChÃ¨que, ChÃ¨ques Travellers, DINERS, EspÃ¨ces, EurochÃ¨ques, GOLD American Expr., Mastercard, OD Club Med Pass, PREMIER VISA, Solde par OD GM, Solde par OD GO, Traveller, UNIO, VAD AMEX, VAD VISA, Visa, VISA, WECHAT
```

### `mop_taux_de_base` (2 valeurs)

```
0, 0.93
```

### `mop_code_modif` (2 valeurs)

```
, O
```

### `mop_taux_de_base_in` (1 valeurs)

```
0
```

### `mop_interface_active` (2 valeurs)

```
0, 1
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil067_dat_IDX_1 | NONCLUSTERED | oui | mop_societe, mop_code_moyen_paiem |
| cafil067_dat_IDX_2 | NONCLUSTERED | non | mop_societe, mop_classe |

