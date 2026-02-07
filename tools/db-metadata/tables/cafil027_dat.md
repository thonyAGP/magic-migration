# cafil027_dat

| Info | Valeur |
|------|--------|
| Lignes | 17 |
| Colonnes | 4 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `odm_societe` | nvarchar | 1 | non |  | 1 |
| 2 | `odm_imputation` | float | 53 | non |  | 17 |
| 3 | `odm_cumul_montant` | float | 53 | non |  | 17 |
| 4 | `odm_cumul_gratuite` | float | 53 | non |  | 1 |

## Valeurs distinctes

### `odm_societe` (1 valeurs)

```
C
```

### `odm_imputation` (17 valeurs)

```
4.6754e+008, 4.67635e+008, 4.67645e+008, 4.6765e+008, 4.6767e+008, 5.1131e+008, 5.1132e+008, 5.32188e+008, 5.801e+008, 6.475e+008, 7.0625e+008, 7.0641e+008, 7.0761e+008
```

### `odm_cumul_montant` (17 valeurs)

```
-100, -10140, -12969, -17066, -183790, 20620, -2900, -3700, -38794, 48984, -5100, -6175, -6876, 7815.75, -850, -940, -975
```

### `odm_cumul_gratuite` (1 valeurs)

```
0
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| cafil027_dat_IDX_1 | NONCLUSTERED | oui | odm_societe, odm_imputation |

