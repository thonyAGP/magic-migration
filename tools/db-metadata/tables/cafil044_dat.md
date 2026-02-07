# cafil044_dat

| Info | Valeur |
|------|--------|
| Lignes | 14 |
| Colonnes | 5 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `imp_societe` | nvarchar | 1 | non |  | 2 |
| 2 | `imp_code` | nvarchar | 4 | non |  | 13 |
| 3 | `imp_imputation` | float | 53 | non |  | 11 |
| 4 | `imp_sous_imputation` | int | 10 | non |  | 1 |
| 5 | `imp_libelle` | nvarchar | 15 | non |  | 14 |

## Valeurs distinctes

### `imp_societe` (2 valeurs)

```
C, G
```

### `imp_code` (13 valeurs)

```
ALIP, AMEX, BATR, CASH, CCAU, CHGE, CHQ, OD, UNIO, VADA, VADV, VISA, WECH
```

### `imp_imputation` (11 valeurs)

```
4.11111e+008, 467000, 5.111e+008, 5.1131e+008, 5.1132e+008, 5.11331e+008, 5.11332e+008, 5.1133e+008, 5.12188e+008, 5.32188e+008, 5.32488e+008
```

### `imp_sous_imputation` (1 valeurs)

```
0
```

### `imp_libelle` (14 valeurs)

```
ALIPAY, Autre carte de, Bank Transfer, Club Med Pass, EspÃ¨ces, RECAP Change, RÃ©cap change, TPE American Ex, TPE Visa, Traveller, UNIO, VAD AMEX, VAD VISA, WECHAT
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil044_dat_IDX_1 | NONCLUSTERED | oui | imp_societe, imp_code |

