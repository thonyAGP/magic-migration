# caisse_compcais_devise_histo

| Info | Valeur |
|------|--------|
| Lignes | 71 |
| Colonnes | 8 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `hisd_user` | nvarchar | 8 | non |  | 5 |
| 2 | `hisd_quand` | nvarchar | 1 | non |  | 2 |
| 3 | `hisd_chrono_histo` | float | 53 | non |  | 41 |
| 4 | `hisd_ordre` | int | 10 | non |  | 1 |
| 5 | `hisd_code_devise` | nvarchar | 3 | non |  | 5 |
| 6 | `hisd_mode_paiement` | nvarchar | 4 | non |  | 1 |
| 7 | `hisd_quantite` | float | 53 | non |  | 11 |
| 8 | `hisd_chronosession` | float | 53 | non |  | 10 |

## Valeurs distinctes

### `hisd_user` (5 valeurs)

```
EVE, JOY, OAT, PEPSI, TIK
```

### `hisd_quand` (2 valeurs)

```
F, O
```

### `hisd_chrono_histo` (41 valeurs)

```
1558, 1559, 1560, 1561, 1562, 1563, 1564, 1565, 1566, 1567, 1568, 1569, 1570, 1571, 1572, 186, 187, 189, 190, 191, 2, 3, 4, 5, 6, 7, 787, 788, 789, 790, 791, 792, 793, 794, 795, 796, 797, 798, 799, 8, 800
```

### `hisd_ordre` (1 valeurs)

```
18
```

### `hisd_code_devise` (5 valeurs)

```
AUD, EUR, KRW, SGD, USD
```

### `hisd_mode_paiement` (1 valeurs)

```
CASH
```

### `hisd_quantite` (11 valeurs)

```
100, 200, 2200, 250, 2500, 260, 285, 380, 400, 50, 62000
```

### `hisd_chronosession` (10 valeurs)

```
1, 2, 267, 268, 269, 299, 3, 300, 65, 66
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| caisse_compcais_devise_histo_IDX_1 | NONCLUSTERED | oui | hisd_user, hisd_chrono_histo, hisd_ordre, hisd_code_devise, hisd_mode_paiement |

