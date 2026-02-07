# caisse_tpe_terminal

| Info | Valeur |
|------|--------|
| Lignes | 280 |
| Colonnes | 5 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `terminal_ims` | int | 10 | non |  | 10 |
| 2 | `numero_tpe` | int | 10 | non |  | 40 |
| 3 | `mode_de_paiement` | nvarchar | 4 | non |  | 7 |
| 4 | `tpe_interface` | bit |  | non |  | 1 |
| 5 | `tpe_interface_id` | nvarchar | 20 | non |  | 1 |

## Valeurs distinctes

### `terminal_ims` (10 valeurs)

```
0, 21, 40, 550, 80, 9, 920, 921, 940, 941
```

### `numero_tpe` (40 valeurs)

```
1, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 2, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 3, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 4, 40, 5, 6, 7, 8, 9
```

### `mode_de_paiement` (7 valeurs)

```
ALIP, AMEX, CCAU, UNIO, VISA, WECH, ZZZ
```

### `tpe_interface` (1 valeurs)

```
0
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| caisse_tpe_terminal_IDX_1 | NONCLUSTERED | oui | terminal_ims, numero_tpe, mode_de_paiement |

