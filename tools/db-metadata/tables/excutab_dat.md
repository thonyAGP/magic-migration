# excutab_dat

| Info | Valeur |
|------|--------|
| Lignes | 16 |
| Colonnes | 3 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `tad_code` | nvarchar | 4 | non |  | 16 |
| 2 | `tad_libelle` | nvarchar | 30 | non |  | 16 |
| 3 | `tad_zone_numerique` | float | 53 | non |  | 1 |

## Valeurs distinctes

### `tad_code` (16 valeurs)

```
1, 10, 11, 12, 13, 14, 15, 2, 3, 4, 5, 6, 7, 8, 9, LANG
```

### `tad_libelle` (16 valeurs)

```
BEACH TOWEL ( THE DAY BEFORE ), CASH MONEY / BAHTS, CASUAL FOR TEMPLE, CHECK FLIGHT TICKET, CREDIT CARDS / ATM, EARLY DINER 7.15 PM, HAT / CAP, LANGUES, MOSQUITO REPELLENT, PHI PHI, SANDALS ENOUGH, SPORTS SHOES, SUNGLASS / SUNBLOCK, SWEATER / PULL OVER / JACKET, SWIMSUIT, T SHIRT / SHORT
```

### `tad_zone_numerique` (1 valeurs)

```
0
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| excutab_dat_IDX_2 | NONCLUSTERED | oui | tad_libelle, tad_code |
| excutab_dat_IDX_1 | NONCLUSTERED | oui | tad_code |

