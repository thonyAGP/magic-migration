# pv_days_dat

| Info | Valeur |
|------|--------|
| Lignes | 5483 |
| Colonnes | 3 |

## Colonnes

| # | Colonne | Type SQL | Taille | Nullable | PK | Distinct |
|---|---------|----------|--------|----------|----|----------|
| 1 | `year` | int | 10 | non |  | 14 |
| 2 | `week_nb` | int | 10 | non |  | 54 |
| 3 | `date` | char | 8 | non |  | 5483 |

## Valeurs distinctes

### `year` (14 valeurs)

```
0, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026
```

## Index

| Nom | Type | Unique | Colonnes |
|-----|------|--------|----------|
| pv_days_dat_IDX_2 | NONCLUSTERED | oui | year, week_nb, date |
| pv_days_dat_IDX_1 | NONCLUSTERED | oui | date |

